/**
 * DemandIQ Core Mathematical & Algorithmic Test Suite
 * Validates financial formulas, risk attributions, NLP extraction, and HMAC isolation.
 */
import assert from 'assert';
import { calculateChannelProfit, compareAllChannels } from '../server/financials.ts';
import { computeOrderRisk, calculateTrustworthyDemand } from '../server/ml_risk.ts';
import { parseCustomerEnquiry, aggregateMissedDemand } from '../server/nlp_enquiry.ts';
import { generateKeyedHmac, normalizeIdentifier } from '../server/privacy_hmac.ts';
import { ChannelCostConfig, InventoryItem, Order, Enquiry } from '../src/types/index.ts';

console.log('--- Running DemandIQ Core Test Suite ---\n');

// 1. TEST: Channel Profit Optimizer Accounting Formula
console.log('Test 1: Channel Profit Financial Rigor');
const mockConfig: ChannelCostConfig = {
  id: 'test_ig',
  sellerId: 'test_seller',
  channel: 'Instagram',
  orderCount: 100,
  sellingPriceAvg: 2000,
  productCostAvg: 600,
  returnRatePercent: 30, // 30 returns, 70 delivered
  forwardShipping: 80, // 100 * 80 = 8,000
  reverseShipping: 100, // 30 * 100 = 3,000
  commissionPercent: 0,
  paymentFeePercent: 2, // 2% of 200,000 = 4,000
  adSpend: 20000,
  refundAllowancePercent: 0
};

const profitResult = calculateChannelProfit(mockConfig);
// Gross revenue = 100 * 2000 = 200,000
assert.strictEqual(profitResult.grossRevenue, 200000, 'Gross revenue must equal orders * price');
// Delivered = 70, Returned = 30
assert.strictEqual(profitResult.deliveredOrders, 70, 'Delivered orders must be orders * (1 - returnRate)');
assert.strictEqual(profitResult.returnedOrders, 30, 'Returned orders must be orders * returnRate');
// Logistics: (100 * 80) + (30 * 100) = 8,000 + 3,000 = 11,000
assert.strictEqual(profitResult.totalLogisticsCost, 11000, 'Total logistics must equal forward on all + reverse on returns');
// COGS: 70 * 600 + 30 * (600 * 0.1) = 42,000 + 1,800 = 43,800
// Contribution Profit: 200,000 - 43,800 - 11,000 - 0 - 4,000 - 0 - 20,000 = 121,200
assert.strictEqual(profitResult.contributionProfit, 121200, 'Contribution profit matches standard formula');
console.log('✓ Channel profit logistics and margin accounting verified.');

// 2. TEST: Order Risk Scoring & SHAP Explanations
console.log('\nTest 2: Order Risk Scoring & Attribution');
const mockOrderHighRisk: Partial<Order> = {
  id: 'test_ord_1',
  paymentMethod: 'COD',
  orderValue: 6500, // High value COD
  prevOrderCount: 0, // First time
  prevRtoCount: 2, // Prior returns
  addressScore: 35, // Incomplete address
  channel: 'Instagram'
};

const riskOutput = computeOrderRisk(mockOrderHighRisk, []);
assert.ok(riskOutput.riskScore >= 70, 'High value COD with prior RTO must yield High Risk score (>=70)');
assert.strictEqual(riskOutput.riskCategory, 'HIGH', 'Category must be HIGH');
assert.ok(riskOutput.isFlagged, 'Order must be flagged for review');
assert.ok(riskOutput.riskFactors.length >= 3, 'Must contain transparent factor attributions');
console.log(`✓ High-risk score calculated correctly: ${riskOutput.riskScore} pts with ${riskOutput.riskFactors.length} SHAP factors.`);

const mockOrderLowRisk: Partial<Order> = {
  id: 'test_ord_2',
  paymentMethod: 'Prepaid',
  orderValue: 1800,
  prevOrderCount: 4,
  prevRtoCount: 0,
  addressScore: 95,
  channel: 'Website'
};

const lowRiskOutput = computeOrderRisk(mockOrderLowRisk, []);
assert.ok(lowRiskOutput.riskScore < 30, 'Prepaid repeat customer must yield Low Risk score (<30)');
assert.strictEqual(lowRiskOutput.riskCategory, 'LOW', 'Category must be LOW');
console.log(`✓ Low-risk score calculated correctly: ${lowRiskOutput.riskScore} pts.`);

// 3. TEST: Lost Demand Radar NLP Extraction (Tanglish & English)
console.log('\nTest 3: Lost Demand Radar NLP & Inventory Matching');
const sampleInventory: InventoryItem[] = [
  {
    id: 'inv_test_1',
    sellerId: 'test_seller',
    sku: 'KURTI-BLU-M',
    productName: 'Chanderi Cotton Kurti',
    category: 'Kurtis',
    color: 'Royal Blue',
    size: 'M',
    currentStock: 0, // Out of stock
    minThreshold: 5,
    sellingPrice: 1499,
    unitCost: 550
  }
];

// Test Tamil-English code-mixed query
const tanglishQuery = 'Hi sis, blue kurti size M irukka? Price ethana?';
const tanglishParsed = parseCustomerEnquiry(tanglishQuery, sampleInventory);

assert.strictEqual(tanglishParsed.product, 'Chanderi Cotton Kurti', 'Extracted product must match Kurti');
assert.strictEqual(tanglishParsed.color, 'Royal Blue', 'Extracted color must match Royal Blue');
assert.strictEqual(tanglishParsed.size, 'M', 'Extracted size must match M');
assert.strictEqual(tanglishParsed.isMatched, true, 'SKU must match inventory item');
assert.strictEqual(tanglishParsed.isAvailable, false, 'Must flag as unavailable because currentStock is 0');
assert.strictEqual(tanglishParsed.languageDetected, 'Tamil-English (Tanglish)', 'Must detect Tanglish code-mixing');
console.log('✓ Tanglish query parsed and mapped to unstocked catalog SKU correctly.');

// 4. TEST: Missed Demand Profit Aggregation Formula
console.log('\nTest 4: Missed Demand Profit Formula');
const mockEnquiries: Enquiry[] = [
  {
    id: 'e1',
    sellerId: 'test_seller',
    customerHandle: '@user1',
    channel: 'Instagram',
    rawText: 'Blue kurti size M',
    timestamp: '2026-10-27T10:00:00Z',
    intent: 'availability',
    extractedProduct: 'Chanderi Cotton Kurti',
    extractedColor: 'Royal Blue',
    extractedSize: 'M',
    extractedQuantity: 1,
    isMatched: true,
    matchedSku: 'KURTI-BLU-M',
    isAvailable: false,
    status: 'New'
  },
  {
    id: 'e2',
    sellerId: 'test_seller',
    customerHandle: '@user2',
    channel: 'WhatsApp',
    rawText: 'Blue kurti size M irukka',
    timestamp: '2026-10-27T11:00:00Z',
    intent: 'availability',
    extractedProduct: 'Chanderi Cotton Kurti',
    extractedColor: 'Royal Blue',
    extractedSize: 'M',
    extractedQuantity: 1,
    isMatched: true,
    matchedSku: 'KURTI-BLU-M',
    isAvailable: false,
    status: 'New'
  }
];

const missedGroups = aggregateMissedDemand(mockEnquiries, sampleInventory, 0.20); // 20% conversion
assert.strictEqual(missedGroups.length, 1, 'Must create 1 aggregated group for Blue Kurti Size M');
// Profit per order = 1499 - 550 = 949
// Estimated missed profit = 2 * 0.20 * 949 = 379.6 ≈ 380
assert.strictEqual(missedGroups[0].profitPerOrder, 949, 'Profit per order is 1499 - 550 = 949');
assert.strictEqual(missedGroups[0].estimatedMissedProfit, 380, 'Estimated missed profit matches 2 * 20% * 949');
console.log('✓ Missed profit formula verified.');

// 5. TEST: Privacy Lab Keyed HMAC Cryptographic Consistency & Normalization
console.log('\nTest 5: Privacy Lab Keyed HMAC Cryptographic Hashing');
const phone1 = '+91 98765-43210';
const phone2 = '09876543210';
const norm1 = normalizeIdentifier(phone1);
const norm2 = normalizeIdentifier(phone2);
assert.strictEqual(norm1, '9876543210', 'Normalized 10 digits');
assert.strictEqual(norm2, '9876543210', 'Normalized 10 digits');

const hmac1 = generateKeyedHmac(norm1);
const hmac2 = generateKeyedHmac(norm2);
assert.strictEqual(hmac1, hmac2, 'Identical normalized inputs must yield identical HMAC digest');
assert.strictEqual(hmac1.length, 64, 'SHA-256 HMAC must be 64 hex characters');
console.log('✓ Cryptographic HMAC generation and normalization verified.');

console.log('\n>>> ALL CORE TESTS PASSED SUCCESSFULLY! <<<');

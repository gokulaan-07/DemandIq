import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { 
  Seller, 
  Order, 
  InventoryItem, 
  Enquiry, 
  ChannelCostConfig, 
  Recommendation, 
  PrivacySignalRecord 
} from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'demandiq_db.json');

export interface DatabaseSchema {
  sellers: Seller[];
  sellerCredentials: Record<string, string>; // sellerId -> passwordHash
  orders: Order[];
  inventory: InventoryItem[];
  enquiries: Enquiry[];
  channelConfigs: ChannelCostConfig[];
  recommendations: Recommendation[];
  privacySignals: PrivacySignalRecord[];
}

let inMemoryDb: DatabaseSchema | null = null;

export function getDb(): DatabaseSchema {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      inMemoryDb = JSON.parse(data);
      return inMemoryDb!;
    } catch (err) {
      console.error('Failed to parse database file, re-seeding...', err);
    }
  }

  // If no DB exists, initialize with full realistic seed data
  inMemoryDb = generateInitialSeedData();
  saveDb();
  return inMemoryDb;
}

export function saveDb(): void {
  if (!inMemoryDb) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(inMemoryDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write to database file:', err);
  }
}

export function resetAndSeedDb(): DatabaseSchema {
  inMemoryDb = generateInitialSeedData();
  saveDb();
  return inMemoryDb;
}

function generateInitialSeedData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const defaultHash = bcrypt.hashSync('demopassword123', salt);

  const seller1: Seller = {
    id: 'seller_aura_1',
    email: 'aura@demandiq.com',
    name: 'Aanya Sharma',
    storeName: 'Aura Ethnic & Modern',
    currency: 'INR',
    createdAt: '2026-01-10T08:00:00Z',
  };

  const seller2: Seller = {
    id: 'seller_kavitha_2',
    email: 'kavitha@demandiq.com',
    name: 'Kavitha Rangarajan',
    storeName: 'Kavitha Silks Chennai',
    currency: 'INR',
    createdAt: '2026-01-15T09:30:00Z',
  };

  // Seed inventory for Seller 1
  const inventory: InventoryItem[] = [
    {
      id: 'inv_1',
      sellerId: 'seller_aura_1',
      sku: 'KURTI-BLU-M',
      productName: 'Chanderi Cotton Kurti',
      category: 'Kurtis',
      color: 'Royal Blue',
      size: 'M',
      currentStock: 0, // OUT OF STOCK - Major demand driver
      minThreshold: 15,
      sellingPrice: 1499,
      unitCost: 550,
    },
    {
      id: 'inv_2',
      sellerId: 'seller_aura_1',
      sku: 'KURTI-BLU-L',
      productName: 'Chanderi Cotton Kurti',
      category: 'Kurtis',
      color: 'Royal Blue',
      size: 'L',
      currentStock: 12,
      minThreshold: 10,
      sellingPrice: 1499,
      unitCost: 550,
    },
    {
      id: 'inv_3',
      sellerId: 'seller_aura_1',
      sku: 'KURTI-MRN-M',
      productName: 'Chanderi Cotton Kurti',
      category: 'Kurtis',
      color: 'Maroon',
      size: 'M',
      currentStock: 4,
      minThreshold: 10,
      sellingPrice: 1499,
      unitCost: 550,
    },
    {
      id: 'inv_4',
      sellerId: 'seller_aura_1',
      sku: 'SAR-SILK-GRN',
      productName: 'Banarasi Soft Silk Saree',
      category: 'Sarees',
      color: 'Emerald Green',
      size: 'Free Size',
      currentStock: 1, // Almost stockout
      minThreshold: 5,
      sellingPrice: 3899,
      unitCost: 1650,
    },
    {
      id: 'inv_5',
      sellerId: 'seller_aura_1',
      sku: 'SAR-SILK-RED',
      productName: 'Banarasi Soft Silk Saree',
      category: 'Sarees',
      color: 'Crimson Red',
      size: 'Free Size',
      currentStock: 0, // OUT OF STOCK
      minThreshold: 5,
      sellingPrice: 3899,
      unitCost: 1650,
    },
    {
      id: 'inv_6',
      sellerId: 'seller_aura_1',
      sku: 'SHIRT-LIN-OLV-40',
      productName: 'Pure Linen Mandarin Shirt',
      category: 'Shirts',
      color: 'Olive Green',
      size: '40 (M)',
      currentStock: 0, // OUT OF STOCK - Highly enquired
      minThreshold: 12,
      sellingPrice: 1999,
      unitCost: 750,
    },
    {
      id: 'inv_7',
      sellerId: 'seller_aura_1',
      sku: 'SHIRT-LIN-WHT-42',
      productName: 'Pure Linen Mandarin Shirt',
      category: 'Shirts',
      color: 'Classic White',
      size: '42 (L)',
      currentStock: 25,
      minThreshold: 15,
      sellingPrice: 1999,
      unitCost: 750,
    },
    {
      id: 'inv_8',
      sellerId: 'seller_aura_1',
      sku: 'LEH-PLM-GLD',
      productName: 'Handcrafted Heritage Lehenga',
      category: 'Lehenga',
      color: 'Plum & Gold',
      size: 'L',
      currentStock: 2,
      minThreshold: 2,
      sellingPrice: 8499,
      unitCost: 3800,
    },
    {
      id: 'inv_9',
      sellerId: 'seller_aura_1',
      sku: 'DNM-JKT-OVS-M',
      productName: 'Kutch Embroidered Denim Jacket',
      category: 'Jackets',
      color: 'Indigo Blue',
      size: 'M',
      currentStock: 0, // OUT OF STOCK
      minThreshold: 8,
      sellingPrice: 2899,
      unitCost: 1100,
    },
    {
      id: 'inv_10',
      sellerId: 'seller_aura_1',
      sku: 'ANAR-MUST-L',
      productName: 'Floral Anarkali Set with Dupatta',
      category: 'Suits',
      color: 'Mustard Yellow',
      size: 'L',
      currentStock: 18,
      minThreshold: 10,
      sellingPrice: 2499,
      unitCost: 920,
    },
    // Seller 2 inventory
    {
      id: 'inv_201',
      sellerId: 'seller_kavitha_2',
      sku: 'KAV-KAN-MRN',
      productName: 'Kanchipuram Pure Silk Bridal Saree',
      category: 'Bridal Sarees',
      color: 'Maroon',
      size: 'Free Size',
      currentStock: 5,
      minThreshold: 3,
      sellingPrice: 16999,
      unitCost: 8500,
    },
    {
      id: 'inv_202',
      sellerId: 'seller_kavitha_2',
      sku: 'KAV-COT-BLU',
      productName: 'Chettinad Handloom Cotton Saree',
      category: 'Cotton Sarees',
      color: 'Peacock Blue',
      size: 'Free Size',
      currentStock: 0,
      minThreshold: 10,
      sellingPrice: 1899,
      unitCost: 720,
    }
  ];

  // Seed Orders for Seller 1 (rich synthetic dataset with diverse channels, payment types, risk signals)
  const orders: Order[] = [
    {
      id: 'ord_101',
      sellerId: 'seller_aura_1',
      orderId: 'ORD-2026-9041',
      channel: 'Instagram',
      orderDate: '2026-10-27T18:24:00Z',
      paymentMethod: 'COD',
      orderValue: 4497,
      customerRef: 'Rahul Verma (IG: @rahul_v92)',
      customerPhoneMasked: '+91 98765 ***10',
      customerCity: 'New Delhi',
      customerPincode: '110001',
      itemsCount: 3,
      prevOrderCount: 0,
      prevCancellationCount: 0,
      prevRtoCount: 0,
      deliveryOutcome: 'Pending',
      addressScore: 38, // Incomplete address ("Near main road, Delhi")
      riskScore: 84,
      riskCategory: 'HIGH',
      riskFactors: [
        { factor: 'COD Payment on High Basket Value (>₹4,000)', impact: 28, description: 'COD orders exceeding ₹3,000 have 3.4x higher refusal rate', type: 'risk' },
        { factor: 'Incomplete / Vague Delivery Address', impact: 22, description: 'Missing landmark, house number, or precise street details', type: 'risk' },
        { factor: 'First-time Customer Zero History', impact: 14, description: 'No verified previous fulfillment record on file', type: 'risk' },
        { factor: 'Instagram Direct Checkout Vulnerability', impact: 12, description: 'Higher impulsive buying pattern without prepaid commitment', type: 'risk' },
        { factor: 'Pincode Courier Serviceability Check', impact: -2, description: 'Pincode 110001 is serviced by standard logistics', type: 'protective' }
      ],
      isFlagged: true,
      sellerFeedback: 'None',
      duplicateCandidate: false,
      modelConfidence: 89,
      missingDataWarning: 'Customer mobile has no verified OTP verification history',
      externalActionStatus: 'None'
    },
    {
      id: 'ord_102',
      sellerId: 'seller_aura_1',
      orderId: 'ORD-2026-9042',
      channel: 'Instagram',
      orderDate: '2026-10-27T18:29:15Z',
      paymentMethod: 'COD',
      orderValue: 4497,
      customerRef: 'Rahul V (IG: @rahul_v92_shop)',
      customerPhoneMasked: '+91 98765 ***10', // SAME PHONE!
      customerCity: 'Delhi',
      customerPincode: '110001',
      itemsCount: 3,
      prevOrderCount: 0,
      prevCancellationCount: 0,
      prevRtoCount: 0,
      deliveryOutcome: 'Pending',
      addressScore: 35,
      riskScore: 92,
      riskCategory: 'HIGH',
      riskFactors: [
        { factor: 'Duplicate Rapid Submission Candidate', impact: 35, description: 'Placed 5 minutes after ORD-2026-9041 with identical phone & cart', type: 'risk' },
        { factor: 'COD Payment on High Basket Value (>₹4,000)', impact: 28, description: 'High RTO probability on unconfirmed COD duplicates', type: 'risk' },
        { factor: 'Incomplete Delivery Address', impact: 22, description: 'Address lacks street details', type: 'risk' }
      ],
      isFlagged: true,
      sellerFeedback: 'None',
      duplicateCandidate: true,
      duplicateReason: 'Identical phone (+91 98765 ***10) and cart value within 5 minutes of ORD-2026-9041',
      modelConfidence: 94,
      missingDataWarning: 'Potential duplicate ghost order',
      externalActionStatus: 'None'
    },
    {
      id: 'ord_103',
      sellerId: 'seller_aura_1',
      orderId: 'ORD-2026-9038',
      channel: 'Website',
      orderDate: '2026-10-27T14:10:00Z',
      paymentMethod: 'Prepaid',
      orderValue: 3899,
      customerRef: 'Pooja Sundaram',
      customerPhoneMasked: '+91 98401 ***45',
      customerCity: 'Chennai',
      customerPincode: '600028',
      itemsCount: 1,
      prevOrderCount: 4,
      prevCancellationCount: 0,
      prevRtoCount: 0,
      deliveryOutcome: 'Pending',
      addressScore: 95,
      riskScore: 6,
      riskCategory: 'LOW',
      riskFactors: [
        { factor: 'Prepaid Razorpay Transaction', impact: -24, description: 'Full upfront payment eliminates refusal risk', type: 'protective' },
        { factor: 'Verified Loyal Customer (4 orders)', impact: -18, description: 'Zero historical cancellations or return disputes', type: 'protective' },
        { factor: 'Complete Verified Postal Address', impact: -10, description: 'Full door number, street, and verified 600028 pincode', type: 'protective' }
      ],
      isFlagged: false,
      sellerFeedback: 'None',
      duplicateCandidate: false,
      modelConfidence: 96,
      externalActionStatus: 'Approved_For_Shipping'
    },
    {
      id: 'ord_104',
      sellerId: 'seller_aura_1',
      orderId: 'ORD-2026-9025',
      channel: 'WhatsApp',
      orderDate: '2026-10-26T21:40:00Z',
      paymentMethod: 'COD',
      orderValue: 1499,
      customerRef: 'Sneha Kulkarni',
      customerPhoneMasked: '+91 97234 ***88',
      customerCity: 'Pune',
      customerPincode: '411038',
      itemsCount: 1,
      prevOrderCount: 1,
      prevCancellationCount: 0,
      prevRtoCount: 0,
      deliveryOutcome: 'Delivered',
      addressScore: 82,
      riskScore: 28,
      riskCategory: 'LOW',
      riskFactors: [
        { factor: 'Moderate COD Value under ₹1,500', impact: 12, description: 'Low ticket size reduces delivery friction', type: 'risk' },
        { factor: 'Verified WhatsApp Chat History', impact: -14, description: 'Direct conversational engagement prior to order creation', type: 'protective' },
        { factor: 'High Address Completeness', impact: -8, description: 'Valid flat number and landmark in Kothrud, Pune', type: 'protective' }
      ],
      isFlagged: false,
      sellerFeedback: 'None',
      duplicateCandidate: false,
      modelConfidence: 87,
      externalActionStatus: 'None'
    },
    {
      id: 'ord_105',
      sellerId: 'seller_aura_1',
      orderId: 'ORD-2026-9019',
      channel: 'Instagram',
      orderDate: '2026-10-26T11:15:00Z',
      paymentMethod: 'COD',
      orderValue: 5398,
      customerRef: 'Vikramjit Singh',
      customerPhoneMasked: '+91 94112 ***77',
      customerCity: 'Ludhiana',
      customerPincode: '141001',
      itemsCount: 2,
      prevOrderCount: 2,
      prevCancellationCount: 2, // 100% CANCELLATION RATE
      prevRtoCount: 1,
      deliveryOutcome: 'Returned_RTO',
      addressScore: 50,
      riskScore: 88,
      riskCategory: 'HIGH',
      riskFactors: [
        { factor: 'Previous Severe RTO / Cancellation History', impact: 36, description: 'Customer previously rejected 2 out of 2 shipments at doorstep', type: 'risk' },
        { factor: 'High COD Cart Value (>₹5,000)', impact: 26, description: 'Courier refusal penalty is ₹140 reverse shipping', type: 'risk' },
        { factor: 'High Tier-2 Return Propensity', impact: 12, description: 'Category historical RTO elevated for COD lehenga/ethnic wear', type: 'risk' }
      ],
      isFlagged: true,
      sellerFeedback: 'Confirmed_Fraud_RTO',
      duplicateCandidate: false,
      modelConfidence: 93,
      externalActionStatus: 'None'
    },
    {
      id: 'ord_106',
      sellerId: 'seller_aura_1',
      orderId: 'ORD-2026-9014',
      channel: 'Amazon',
      orderDate: '2026-10-25T16:00:00Z',
      paymentMethod: 'Prepaid',
      orderValue: 1499,
      customerRef: 'Ananya Deshmukh',
      customerPhoneMasked: '+91 98220 ***19',
      customerCity: 'Mumbai',
      customerPincode: '400050',
      itemsCount: 1,
      prevOrderCount: 1,
      prevCancellationCount: 0,
      prevRtoCount: 0,
      deliveryOutcome: 'Delivered',
      addressScore: 92,
      riskScore: 11,
      riskCategory: 'LOW',
      riskFactors: [
        { factor: 'Prepaid Marketplace Guarantee', impact: -20, description: 'Amazon prepaid order with verified prime customer', type: 'protective' },
        { factor: 'Metro Delivery Hub', impact: -8, description: 'Same-day sorting center proximity', type: 'protective' }
      ],
      isFlagged: false,
      sellerFeedback: 'None',
      duplicateCandidate: false,
      modelConfidence: 91,
      externalActionStatus: 'Approved_For_Shipping'
    },
    {
      id: 'ord_107',
      sellerId: 'seller_aura_1',
      orderId: 'ORD-2026-9008',
      channel: 'Flipkart',
      orderDate: '2026-10-25T09:30:00Z',
      paymentMethod: 'COD',
      orderValue: 2499,
      customerRef: 'Sanjay Rawat',
      customerPhoneMasked: '+91 88001 ***42',
      customerCity: 'Jaipur',
      customerPincode: '302001',
      itemsCount: 1,
      prevOrderCount: 0,
      prevCancellationCount: 0,
      prevRtoCount: 0,
      deliveryOutcome: 'Delivered',
      addressScore: 78,
      riskScore: 46,
      riskCategory: 'MEDIUM',
      riskFactors: [
        { factor: 'Marketplace COD Payment', impact: 18, description: 'Flipkart COD has 21% category return probability', type: 'risk' },
        { factor: 'First-time Buyer on Storefront', impact: 10, description: 'No store brand affinity', type: 'risk' },
        { factor: 'Standard Courier Coverage', impact: -5, description: 'Pincode active for BlueDart/Ekart', type: 'protective' }
      ],
      isFlagged: false,
      sellerFeedback: 'None',
      duplicateCandidate: false,
      modelConfidence: 82,
      externalActionStatus: 'None'
    },
    {
      id: 'ord_108',
      sellerId: 'seller_aura_1',
      orderId: 'ORD-2026-8995',
      channel: 'Instagram',
      orderDate: '2026-10-24T23:14:00Z',
      paymentMethod: 'COD',
      orderValue: 3998,
      customerRef: 'Harsh Vardhan',
      customerPhoneMasked: '+91 99887 ***33',
      customerCity: 'Patna',
      customerPincode: '800001',
      itemsCount: 2,
      prevOrderCount: 0,
      prevCancellationCount: 0,
      prevRtoCount: 0,
      deliveryOutcome: 'Returned_RTO',
      addressScore: 42,
      riskScore: 79,
      riskCategory: 'HIGH',
      riskFactors: [
        { factor: 'COD High Value Order', impact: 24, description: 'Value above ₹3,000 on social channel', type: 'risk' },
        { factor: 'Late Night Impulse Order (23:14 IST)', impact: 14, description: 'Midnight orders have 40% higher next-morning cancellation rate', type: 'risk' },
        { factor: 'Ambiguous Street Address Details', impact: 18, description: 'Vague colony name without house number', type: 'risk' }
      ],
      isFlagged: true,
      sellerFeedback: 'Confirmed_Fraud_RTO',
      duplicateCandidate: false,
      modelConfidence: 86,
      missingDataWarning: 'No landmark provided',
      externalActionStatus: 'None'
    },
    {
      id: 'ord_109',
      sellerId: 'seller_aura_1',
      orderId: 'ORD-2026-8982',
      channel: 'Website',
      orderDate: '2026-10-24T12:05:00Z',
      paymentMethod: 'Prepaid',
      orderValue: 1999,
      customerRef: 'Deepika Nair',
      customerPhoneMasked: '+91 94471 ***55',
      customerCity: 'Kochi',
      customerPincode: '682016',
      itemsCount: 1,
      prevOrderCount: 2,
      prevCancellationCount: 0,
      prevRtoCount: 0,
      deliveryOutcome: 'Delivered',
      addressScore: 90,
      riskScore: 8,
      riskCategory: 'LOW',
      riskFactors: [
        { factor: 'Prepaid Payment Confirmation', impact: -22, description: 'Paid via UPI Auto-Verified', type: 'protective' },
        { factor: 'Repeat Satisfied Customer', impact: -15, description: 'Previous delivered orders with 5-star review', type: 'protective' }
      ],
      isFlagged: false,
      sellerFeedback: 'None',
      duplicateCandidate: false,
      modelConfidence: 95,
      externalActionStatus: 'Approved_For_Shipping'
    },
    {
      id: 'ord_110',
      sellerId: 'seller_aura_1',
      orderId: 'ORD-2026-8974',
      channel: 'WhatsApp',
      orderDate: '2026-10-23T17:50:00Z',
      paymentMethod: 'COD',
      orderValue: 2899,
      customerRef: 'Aarushi Mehta',
      customerPhoneMasked: '+91 98200 ***61',
      customerCity: 'Ahmedabad',
      customerPincode: '380015',
      itemsCount: 1,
      prevOrderCount: 1,
      prevCancellationCount: 0,
      prevRtoCount: 0,
      deliveryOutcome: 'Delivered',
      addressScore: 86,
      riskScore: 32,
      riskCategory: 'LOW',
      riskFactors: [
        { factor: 'WhatsApp Pre-Order Interaction', impact: -12, description: 'Conversational intent confirmed with size query', type: 'protective' },
        { factor: 'Moderate COD Ticket Size', impact: 14, description: 'COD payment requested', type: 'risk' }
      ],
      isFlagged: false,
      sellerFeedback: 'None',
      duplicateCandidate: false,
      modelConfidence: 88,
      externalActionStatus: 'None'
    },
    {
      id: 'ord_111',
      sellerId: 'seller_aura_1',
      orderId: 'ORD-2026-8960',
      channel: 'Instagram',
      orderDate: '2026-10-23T10:12:00Z',
      paymentMethod: 'COD',
      orderValue: 8499, // Super high ticket
      customerRef: 'Farhan Akhtar (IG: @farhan_styles)',
      customerPhoneMasked: '+91 91234 ***90',
      customerCity: 'Lucknow',
      customerPincode: '226010',
      itemsCount: 1,
      prevOrderCount: 0,
      prevCancellationCount: 0,
      prevRtoCount: 0,
      deliveryOutcome: 'Cancelled',
      addressScore: 40,
      riskScore: 89,
      riskCategory: 'HIGH',
      riskFactors: [
        { factor: 'Extreme Basket Value for COD (>₹8,000)', impact: 35, description: 'Luxury lehenga placed on COD with zero deposit', type: 'risk' },
        { factor: 'Unverified Social Buyer Profile', impact: 18, description: 'Newly created Instagram profile without phone OTP', type: 'risk' },
        { factor: 'Pincode RTO Risk Benchmark', impact: 15, description: 'High historical courier return in regional zone', type: 'risk' }
      ],
      isFlagged: true,
      sellerFeedback: 'Confirmed_Fraud_RTO',
      duplicateCandidate: false,
      modelConfidence: 91,
      missingDataWarning: 'High risk of fake or non-serious order',
      externalActionStatus: 'Requested_Confirmation'
    },
    {
      id: 'ord_112',
      sellerId: 'seller_aura_1',
      orderId: 'ORD-2026-8951',
      channel: 'Website',
      orderDate: '2026-10-22T19:30:00Z',
      paymentMethod: 'COD',
      orderValue: 1499,
      customerRef: 'Divya Krishnan',
      customerPhoneMasked: '+91 94440 ***21',
      customerCity: 'Bengaluru',
      customerPincode: '560034',
      itemsCount: 1,
      prevOrderCount: 0,
      prevCancellationCount: 0,
      prevRtoCount: 0,
      deliveryOutcome: 'Delivered',
      addressScore: 88,
      riskScore: 35,
      riskCategory: 'LOW',
      riskFactors: [
        { factor: 'First-time COD customer', impact: 16, description: 'No purchase track record', type: 'risk' },
        { factor: 'Strong Tech-Hub Address Reliability', impact: -12, description: 'Complete Koramangala residential address', type: 'protective' }
      ],
      isFlagged: false,
      sellerFeedback: 'None',
      duplicateCandidate: false,
      modelConfidence: 85,
      externalActionStatus: 'None'
    }
  ];

  // Seed Customer Enquiries for Seller 1 (rich Tamil-English, Hinglish, and English queries)
  const enquiries: Enquiry[] = [
    {
      id: 'enq_1',
      sellerId: 'seller_aura_1',
      customerHandle: '@priya_chennai94',
      channel: 'Instagram',
      rawText: 'Do you have the Chanderi cotton blue kurti in size M? Need it urgently for Diwali!',
      timestamp: '2026-10-27T19:10:00Z',
      intent: 'availability',
      extractedProduct: 'Chanderi Cotton Kurti',
      extractedColor: 'Royal Blue',
      extractedSize: 'M',
      extractedQuantity: 1,
      isMatched: true,
      matchedSku: 'KURTI-BLU-M',
      isAvailable: false, // OUT OF STOCK
      missedDemandReason: 'Inventory depleted (Stock: 0)',
      status: 'New'
    },
    {
      id: 'enq_2',
      sellerId: 'seller_aura_1',
      customerHandle: '+91 98402 11029',
      channel: 'WhatsApp',
      rawText: 'Hi sis, blue kurti size M irukka? Price ethana? Yenakku romba pudichirukku!', // Tamil-English
      timestamp: '2026-10-27T17:45:00Z',
      intent: 'availability',
      extractedProduct: 'Chanderi Cotton Kurti',
      extractedColor: 'Royal Blue',
      extractedSize: 'M',
      extractedQuantity: 1,
      isMatched: true,
      matchedSku: 'KURTI-BLU-M',
      isAvailable: false, // OUT OF STOCK
      missedDemandReason: 'Inventory depleted (Stock: 0)',
      status: 'Notified_When_Available'
    },
    {
      id: 'enq_3',
      sellerId: 'seller_aura_1',
      customerHandle: '@nandhini_r',
      channel: 'Instagram',
      rawText: 'Blue kurti M size kedaikkuma? How many days for delivery to Madurai?', // Tamil-English
      timestamp: '2026-10-27T15:20:00Z',
      intent: 'availability',
      extractedProduct: 'Chanderi Cotton Kurti',
      extractedColor: 'Royal Blue',
      extractedSize: 'M',
      extractedQuantity: 1,
      isMatched: true,
      matchedSku: 'KURTI-BLU-M',
      isAvailable: false,
      missedDemandReason: 'Inventory depleted (Stock: 0)',
      status: 'New'
    },
    {
      id: 'enq_4',
      sellerId: 'seller_aura_1',
      customerHandle: '+91 97901 88412',
      channel: 'WhatsApp',
      rawText: 'Sis Royal blue kurti medium size irundha sollunga, immediately order panren', // Tamil-English
      timestamp: '2026-10-27T12:05:00Z',
      intent: 'availability',
      extractedProduct: 'Chanderi Cotton Kurti',
      extractedColor: 'Royal Blue',
      extractedSize: 'M',
      extractedQuantity: 1,
      isMatched: true,
      matchedSku: 'KURTI-BLU-M',
      isAvailable: false,
      missedDemandReason: 'Inventory depleted (Stock: 0)',
      status: 'Notified_When_Available'
    },
    {
      id: 'enq_5',
      sellerId: 'seller_aura_1',
      customerHandle: '@sneha_mumbai',
      channel: 'Instagram',
      rawText: 'Do you have pure linen shirt in olive green size 40? Can I order 2 pieces?',
      timestamp: '2026-10-27T11:40:00Z',
      intent: 'availability',
      extractedProduct: 'Pure Linen Mandarin Shirt',
      extractedColor: 'Olive Green',
      extractedSize: '40 (M)',
      extractedQuantity: 2,
      isMatched: true,
      matchedSku: 'SHIRT-LIN-OLV-40',
      isAvailable: false, // OUT OF STOCK
      missedDemandReason: 'Inventory depleted (Stock: 0)',
      status: 'New'
    },
    {
      id: 'enq_6',
      sellerId: 'seller_aura_1',
      customerHandle: '+91 98205 44102',
      channel: 'WhatsApp',
      rawText: 'Bhaiya olive linen shirt size 40 milega kya? Website pe out of stock dikha raha hai', // Hinglish
      timestamp: '2026-10-26T20:15:00Z',
      intent: 'availability',
      extractedProduct: 'Pure Linen Mandarin Shirt',
      extractedColor: 'Olive Green',
      extractedSize: '40 (M)',
      extractedQuantity: 1,
      isMatched: true,
      matchedSku: 'SHIRT-LIN-OLV-40',
      isAvailable: false,
      missedDemandReason: 'Inventory depleted (Stock: 0)',
      status: 'Notified_When_Available'
    },
    {
      id: 'enq_7',
      sellerId: 'seller_aura_1',
      customerHandle: '@ananya_delhi',
      channel: 'Instagram',
      rawText: 'Red Banarasi silk saree available hai kya? Shaadi ke function ke liye chahiye', // Hinglish
      timestamp: '2026-10-26T16:50:00Z',
      intent: 'availability',
      extractedProduct: 'Banarasi Soft Silk Saree',
      extractedColor: 'Crimson Red',
      extractedSize: 'Free Size',
      extractedQuantity: 1,
      isMatched: true,
      matchedSku: 'SAR-SILK-RED',
      isAvailable: false, // OUT OF STOCK
      missedDemandReason: 'Inventory depleted (Stock: 0)',
      status: 'New'
    },
    {
      id: 'enq_8',
      sellerId: 'seller_aura_1',
      customerHandle: '+91 94441 33201',
      channel: 'WhatsApp',
      rawText: 'Kutch embroidered denim jacket size M irukka? Urgent requirement', // Tamil-English
      timestamp: '2026-10-26T14:30:00Z',
      intent: 'availability',
      extractedProduct: 'Kutch Embroidered Denim Jacket',
      extractedColor: 'Indigo Blue',
      extractedSize: 'M',
      extractedQuantity: 1,
      isMatched: true,
      matchedSku: 'DNM-JKT-OVS-M',
      isAvailable: false,
      missedDemandReason: 'Inventory depleted (Stock: 0)',
      status: 'New'
    },
    {
      id: 'enq_9',
      sellerId: 'seller_aura_1',
      customerHandle: '@meera_bengaluru',
      channel: 'Instagram',
      rawText: 'Is the white linen shirt size 42 available? What is the dispatch time?',
      timestamp: '2026-10-25T18:10:00Z',
      intent: 'availability',
      extractedProduct: 'Pure Linen Mandarin Shirt',
      extractedColor: 'Classic White',
      extractedSize: '42 (L)',
      extractedQuantity: 1,
      isMatched: true,
      matchedSku: 'SHIRT-LIN-WHT-42',
      isAvailable: true, // IN STOCK
      status: 'Converted'
    },
    {
      id: 'enq_10',
      sellerId: 'seller_aura_1',
      customerHandle: '+91 99001 77284',
      channel: 'WhatsApp',
      rawText: 'Yellow anarkali set size L irundha send photos please',
      timestamp: '2026-10-25T11:00:00Z',
      intent: 'availability',
      extractedProduct: 'Floral Anarkali Set with Dupatta',
      extractedColor: 'Mustard Yellow',
      extractedSize: 'L',
      extractedQuantity: 1,
      isMatched: true,
      matchedSku: 'ANAR-MUST-L',
      isAvailable: true, // IN STOCK
      status: 'Converted'
    }
  ];

  // Seed Channel Cost Configurations (Seller 1)
  const channelConfigs: ChannelCostConfig[] = [
    {
      id: 'cfg_ig',
      sellerId: 'seller_aura_1',
      channel: 'Instagram',
      sellingPriceAvg: 1950,
      productCostAvg: 680,
      commissionPercent: 0, // Direct D2C
      paymentFeePercent: 2.0, // Payment Gateway (Razorpay/Instamojo)
      forwardShipping: 85,
      reverseShipping: 110,
      returnRatePercent: 32.0, // HIGH RTO on COD via Instagram
      adSpend: 42000, // Monthly Meta Ads
      orderCount: 160,
      refundAllowancePercent: 2.5,
    },
    {
      id: 'cfg_web',
      sellerId: 'seller_aura_1',
      channel: 'Website',
      sellingPriceAvg: 2200,
      productCostAvg: 700,
      commissionPercent: 0,
      paymentFeePercent: 2.0,
      forwardShipping: 80,
      reverseShipping: 95,
      returnRatePercent: 9.5, // LOW RETURN RATE (mostly prepaid)
      adSpend: 28000, // Google Search / Brand Ads
      orderCount: 110,
      refundAllowancePercent: 1.0,
    },
    {
      id: 'cfg_wa',
      sellerId: 'seller_aura_1',
      channel: 'WhatsApp',
      sellingPriceAvg: 1850,
      productCostAvg: 650,
      commissionPercent: 0,
      paymentFeePercent: 1.8,
      forwardShipping: 75,
      reverseShipping: 90,
      returnRatePercent: 14.0, // Moderate (conversational relationship)
      adSpend: 9500, // WhatsApp Business API + Catalog Ads
      orderCount: 85,
      refundAllowancePercent: 1.5,
    },
    {
      id: 'cfg_amz',
      sellerId: 'seller_aura_1',
      channel: 'Amazon',
      sellingPriceAvg: 2100,
      productCostAvg: 680,
      commissionPercent: 15.5, // High marketplace take rate
      paymentFeePercent: 0.0, // Included in Amazon fees
      forwardShipping: 95, // EasyShip / FBA standard
      reverseShipping: 115,
      returnRatePercent: 22.0, // Liberal return policy
      adSpend: 21000, // Amazon Sponsored Ads
      orderCount: 140,
      refundAllowancePercent: 3.0,
    },
    {
      id: 'cfg_fk',
      sellerId: 'seller_aura_1',
      channel: 'Flipkart',
      sellingPriceAvg: 1890,
      productCostAvg: 660,
      commissionPercent: 14.0,
      paymentFeePercent: 0.0,
      forwardShipping: 90,
      reverseShipping: 105,
      returnRatePercent: 24.5,
      adSpend: 15000, // PLA Ads
      orderCount: 95,
      refundAllowancePercent: 2.5,
    }
  ];

  // Seed Recommendations for Seller 1
  const recommendations: Recommendation[] = [
    {
      id: 'rec_1',
      sellerId: 'seller_aura_1',
      title: 'Mandate ₹200 Partial-Prepaid Deposit on Instagram Orders >₹3,000',
      category: 'Risk Mitigation',
      supportingData: 'Instagram COD orders >₹3,000 experienced 41% RTO in past 30 days, generating ₹23,100 in unrecoverable reverse courier charges.',
      explanation: 'Requiring a refundable ₹200 commitment link via WhatsApp/SMS confirms delivery intent. In pilot cohorts, this drops RTO by 58% while filtering out impulsive spam clicks.',
      expectedBenefit: 'Estimated monthly margin recovery: ₹28,400 with 62% reduction in uncollected return shipping.',
      assumptions: 'Assumes 15% drop-off in fraudulent/non-serious buyers and 85% conversion of genuine shoppers willing to pay ₹200 advance.',
      confidence: 'High',
      status: 'Proposed',
      createdAt: '2026-10-25T10:00:00Z',
      predictedImpactValue: 28400,
      predictedImpactMetric: 'INR Margin Recovery / Month'
    },
    {
      id: 'rec_2',
      sellerId: 'seller_aura_1',
      title: 'Restock High-Urgency Out-of-Stock: Chanderi Royal Blue Kurti (Size M)',
      category: 'Restock',
      supportingData: '18 direct customer enquiries recorded in 14 days (11 via WhatsApp, 7 via Instagram) with zero stock available.',
      explanation: 'Customer purchase intent is at its peak. The product has a 63% gross margin (₹1,499 selling price vs ₹550 unit cost). Restocking 40 units immediately captures pent-up demand before Diwali.',
      expectedBenefit: 'Estimated captured profit: ₹34,164 with fast 12-day inventory turnover.',
      assumptions: 'Calculated using baseline conversion of 18% on recorded queries + 32 additional walk-in store visitors.',
      confidence: 'High',
      status: 'Accepted',
      createdAt: '2026-10-26T14:00:00Z',
      implementationDate: '2026-10-27T00:00:00Z',
      predictedImpactValue: 34164,
      predictedImpactMetric: 'INR Gross Profit'
    },
    {
      id: 'rec_3',
      sellerId: 'seller_aura_1',
      title: 'Shift 25% of Instagram Ad Budget to Direct Website Catalog Campaigns',
      category: 'Channel Rebalance',
      supportingData: 'Website generates ₹682 net contribution profit per order compared to only ₹298 on Instagram after factoring RTO reverse logistics.',
      explanation: 'Instagram orders look high in volume (160 orders), but 32% return rate and ₹42,000 ad spend leaves minimal net profit. Reallocating ₹10,500/month to Website search & retargeting captures higher-intent prepaid buyers.',
      expectedBenefit: 'Estimated net profit gain of ₹19,200/month across combined channels.',
      assumptions: 'Assumes Website CAC remains within ₹260-₹310 per acquisition with 90%+ prepaid mix.',
      confidence: 'Medium',
      status: 'Proposed',
      createdAt: '2026-10-24T09:15:00Z',
      predictedImpactValue: 19200,
      predictedImpactMetric: 'INR Net Profit / Month'
    },
    {
      id: 'rec_4',
      sellerId: 'seller_aura_1',
      title: 'Review Amazon Sponsored Products Spend on Low-Margin Ethnic Footwear',
      category: 'Channel Rebalance',
      supportingData: 'Amazon commission (15.5%) + logistics (₹95) + ad spend (₹21,000) brings net margin on low-ticket footwear to under 4.2%.',
      explanation: 'Negative ROAS on products priced under ₹999 after courier weight slab escalation.',
      expectedBenefit: 'Prevent ₹7,800/month in margin bleeding on unprofitable SKUs.',
      assumptions: 'Seller pauses ad campaigns on 4 low-margin SKUs while maintaining organic listing visibility.',
      confidence: 'High',
      status: 'Completed',
      createdAt: '2026-10-18T11:00:00Z',
      implementationDate: '2026-10-20T00:00:00Z',
      predictedImpactValue: 7800,
      predictedImpactMetric: 'INR Monthly Savings',
      actualMeasuredImpact: 8420,
      actualMeasuredNotes: 'Audited post-implementation: Ad spend dropped by ₹8,900 with minimal organic revenue loss. Net savings ₹8,420.'
    }
  ];

  // Seed Privacy Lab Shared HMAC Signal Table (Demonstrating Seller A & Seller B isolated risk collaboration)
  // Let's create keyed HMAC for demo repeat abusers
  // Example: Phone +91 98765 43210 (Rahul Verma fake COD customer)
  const privacySignals: PrivacySignalRecord[] = [
    {
      id: 'sig_1',
      hmacHash: '9a8d4f6c7b1e2a3d5e8f0b2c4d6a8e1f3a5c7e9b0d2f4a6c8e0b2d4f6a8c0e2a',
      reportedBySellerId: 'seller_kavitha_2', // Reported by Kavitha Silks earlier!
      reportedBySellerName: 'Verified Seller Network Member (ID: ***)',
      reportedAt: '2026-10-20T14:30:00Z',
      reasonCode: 'REPEAT_COD_REFUSAL',
      timesReported: 3,
      notes: 'Customer repeatedly ordered high-value sarees COD across multiple stores and refused delivery at doorstep.'
    },
    {
      id: 'sig_2',
      hmacHash: '3c7b1e2a9a8d4f6c5e8f0b2c4d6a8e1f0b2d4f6a8c0e2a3a5c7e9b0d2f4a6c8e',
      reportedBySellerId: 'seller_aura_1',
      reportedBySellerName: 'Verified Seller Network Member (ID: ***)',
      reportedAt: '2026-10-24T18:00:00Z',
      reasonCode: 'ABUSIVE_RETURNS',
      timesReported: 2,
      notes: 'Customer reported returning empty packets / used goods instead of original ordered apparel.'
    }
  ];

  return {
    sellers: [seller1, seller2],
    sellerCredentials: {
      [seller1.id]: defaultHash,
      [seller2.id]: defaultHash,
    },
    orders,
    inventory,
    enquiries,
    channelConfigs,
    recommendations,
    privacySignals
  };
}

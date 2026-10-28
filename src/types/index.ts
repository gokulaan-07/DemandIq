export type ChannelType = 'Instagram' | 'WhatsApp' | 'Website' | 'Amazon' | 'Flipkart' | 'Other';
export type PaymentMethod = 'COD' | 'Prepaid';
export type RiskCategory = 'LOW' | 'MEDIUM' | 'HIGH';
export type DeliveryOutcome = 'Delivered' | 'Returned_RTO' | 'Cancelled' | 'Pending';

export interface Seller {
  id: string;
  email: string;
  name: string;
  storeName: string;
  currency: string;
  createdAt: string;
}

export interface RiskFactor {
  factor: string;
  impact: number; // positive increases risk, negative decreases risk
  description: string;
  type: 'risk' | 'protective';
}

export interface Order {
  id: string;
  sellerId: string;
  orderId: string;
  channel: ChannelType;
  orderDate: string;
  paymentMethod: PaymentMethod;
  orderValue: number;
  customerRef: string;
  customerPhoneMasked: string;
  customerPhone?: string;
  customerCity: string;
  customerPincode: string;
  itemsCount: number;
  prevOrderCount: number;
  prevCancellationCount: number;
  prevRtoCount: number;
  deliveryOutcome: DeliveryOutcome;
  addressScore: number; // 0-100
  riskScore: number; // 0-100
  riskCategory: RiskCategory;
  riskFactors: RiskFactor[];
  isFlagged: boolean;
  sellerFeedback: 'None' | 'Confirmed_Fraud_RTO' | 'False_Positive' | 'Seller_Override';
  duplicateCandidate: boolean;
  duplicateReason?: string;
  modelConfidence: number; // e.g. 88%
  missingDataWarning?: string;
  externalActionStatus?: 'None' | 'Requested_Confirmation' | 'Sent_Prepaid_Link' | 'Approved_For_Shipping';
}

export interface InventoryItem {
  id: string;
  sellerId: string;
  sku: string;
  productName: string;
  category: string;
  color: string;
  size: string;
  currentStock: number;
  minThreshold: number;
  sellingPrice: number;
  unitCost: number;
}

export interface Enquiry {
  id: string;
  sellerId: string;
  customerHandle: string;
  channel: ChannelType;
  rawText: string;
  timestamp: string;
  intent: 'availability' | 'pricing' | 'bulk' | 'general';
  extractedProduct?: string;
  extractedColor?: string;
  extractedSize?: string;
  extractedQuantity: number;
  isMatched: boolean;
  matchedSku?: string;
  isAvailable: boolean;
  missedDemandReason?: string;
  status: 'New' | 'Notified_When_Available' | 'Converted' | 'Closed';
}

export interface MissedDemandGroup {
  id: string;
  productName: string;
  color: string;
  size: string;
  enquiryCount: number;
  sampleEnquiries: string[];
  estimatedConversionRate: number; // e.g. 0.18 (18%)
  profitPerOrder: number; // in INR
  estimatedMissedProfit: number;
  dataConfidence: 'High' | 'Medium' | 'Tentative';
  restockPriority: 'High' | 'Medium' | 'Low';
  stockStatus: string;
}

export interface ChannelCostConfig {
  id: string;
  sellerId: string;
  channel: ChannelType;
  sellingPriceAvg: number;
  productCostAvg: number;
  commissionPercent: number;
  paymentFeePercent: number;
  forwardShipping: number;
  reverseShipping: number;
  returnRatePercent: number;
  adSpend: number;
  orderCount: number;
  refundAllowancePercent: number;
}

export interface ChannelProfitMetrics {
  channel: ChannelType;
  orders: number;
  grossRevenue: number;
  grossMargin: number;
  deliveredOrders: number;
  returnedOrders: number;
  forwardShippingCost: number;
  reverseShippingCost: number;
  totalLogisticsCost: number;
  platformFees: number;
  paymentGatewayFees: number;
  adSpend: number;
  refunds: number;
  contributionProfit: number;
  contributionProfitPerOrder: number;
  netMarginPercent: number;
}

export interface Recommendation {
  id: string;
  sellerId: string;
  title: string;
  category: 'Risk Mitigation' | 'Restock' | 'Channel Rebalance' | 'Pricing';
  supportingData: string;
  explanation: string;
  expectedBenefit: string;
  assumptions: string;
  confidence: 'High' | 'Medium' | 'Tentative';
  status: 'Proposed' | 'Accepted' | 'Rejected' | 'Completed';
  createdAt: string;
  implementationDate?: string;
  predictedImpactValue: number;
  predictedImpactMetric: string;
  actualMeasuredImpact?: number;
  actualMeasuredNotes?: string;
}

export interface PrivacySignalRecord {
  id: string;
  hmacHash: string;
  reportedBySellerId: string;
  reportedBySellerName: string;
  reportedAt: string;
  reasonCode: 'REPEAT_COD_REFUSAL' | 'FAKE_ADDRESS' | 'ABUSIVE_RETURNS' | 'PAYMENT_DISPUTE';
  timesReported: number;
  notes: string;
}

export interface DashboardMetrics {
  totalReportedOrders: number;
  ordersFlaggedForReview: number;
  estimatedTrustworthyDemand: number;
  duplicateCandidates: number;
  actualProfit: number;
  estimatedProfit: number;
  unavailableProductEnquiries: number;
  estimatedMissedProfit: number;
  topProfitChannel: string;
  lowestProfitChannel: string;
  pendingRecommendationsCount: number;
  recentAlerts: Array<{
    id: string;
    level: 'warning' | 'info' | 'danger';
    title: string;
    message: string;
    timestamp: string;
  }>;
}

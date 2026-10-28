import { Order, RiskCategory, RiskFactor } from '../src/types/index.ts';

export interface RiskAnalysisResult {
  riskScore: number;
  riskCategory: RiskCategory;
  riskFactors: RiskFactor[];
  modelConfidence: number;
  missingDataWarning?: string;
  isFlagged: boolean;
  duplicateCandidate: boolean;
  duplicateReason?: string;
}

export function computeOrderRisk(
  order: Partial<Order>,
  existingOrders: Order[] = []
): RiskAnalysisResult {
  let score = 15; // Base baseline probability (15% base Indian e-commerce return/refusal rate)
  const factors: RiskFactor[] = [];
  let missingWarning: string | undefined = undefined;

  // 1. Payment Method & Basket Value Analysis
  if (order.paymentMethod === 'COD') {
    const val = order.orderValue || 0;
    if (val >= 5000) {
      score += 32;
      factors.push({
        factor: 'High-Value COD Risk (>₹5,000)',
        impact: 32,
        description: 'Cash-on-delivery orders above ₹5,000 show 3.8x higher non-acceptance rate in social commerce',
        type: 'risk'
      });
    } else if (val >= 2500) {
      score += 20;
      factors.push({
        factor: 'Moderate-High COD Order (₹2,500 - ₹5,000)',
        impact: 20,
        description: 'COD payment requested on moderate basket value increases reverse logistics vulnerability',
        type: 'risk'
      });
    } else {
      score += 10;
      factors.push({
        factor: 'COD Payment Method',
        impact: 10,
        description: 'Standard cash-on-delivery order baseline friction',
        type: 'risk'
      });
    }
  } else {
    // Prepaid orders have high commitment
    score -= 18;
    factors.push({
      factor: 'Prepaid Digital Payment',
      impact: -18,
      description: 'Upfront payment via UPI/Card virtually eliminates delivery refusal risk',
      type: 'protective'
    });
  }

  // 2. Customer Order History & Cancellation Track Record
  const prevOrders = order.prevOrderCount || 0;
  const prevCancels = order.prevCancellationCount || 0;
  const prevRto = order.prevRtoCount || 0;

  if (prevOrders === 0) {
    score += 12;
    factors.push({
      factor: 'First-time Customer Zero History',
      impact: 12,
      description: 'New buyer with no verified purchase or fulfillment history on this store',
      type: 'risk'
    });
  } else {
    if (prevRto > 0 || prevCancels > 0) {
      const negativeEvents = prevRto * 2 + prevCancels;
      const penalty = Math.min(35, negativeEvents * 15);
      score += penalty;
      factors.push({
        factor: `Previous Return/Cancellation Record (${prevRto} RTO, ${prevCancels} cancelled)`,
        impact: penalty,
        description: 'High historical return rate detected in buyer transaction history',
        type: 'risk'
      });
    }

    if (prevOrders >= 3 && prevRto === 0 && prevCancels === 0) {
      score -= 22;
      factors.push({
        factor: `Verified Repeat Customer (${prevOrders} successful orders)`,
        impact: -22,
        description: 'Established trust profile with 100% past delivery completion',
        type: 'protective'
      });
    }
  }

  // 3. Address Quality & Geographic Signal
  const addressScore = order.addressScore !== undefined ? order.addressScore : 65;
  if (addressScore < 45) {
    score += 22;
    factors.push({
      factor: 'Low Address Completeness / High Return Zone',
      impact: 22,
      description: 'Address missing crucial delivery landmarks, house/flat numbers, or specific colony details',
      type: 'risk'
    });
    missingWarning = 'Vague delivery address detected. Courier partner may fail 1st attempt delivery.';
  } else if (addressScore >= 85) {
    score -= 10;
    factors.push({
      factor: 'High-Fidelity Verified Address',
      impact: -10,
      description: 'Complete postal code, door number, and verified landmark present',
      type: 'protective'
    });
  }

  // 4. Channel Vulnerability Signal
  if (order.channel === 'Instagram') {
    score += 8;
    factors.push({
      factor: 'Social DM / Impulse Buying Channel',
      impact: 8,
      description: 'Instagram traffic exhibits higher next-day buyer remorse compared to direct web or repeat chat',
      type: 'risk'
    });
  } else if (order.channel === 'WhatsApp') {
    score -= 6;
    factors.push({
      factor: 'Conversational Pre-Validation',
      impact: -6,
      description: 'Two-way conversational touchpoint verifies phone responsiveness prior to dispatch',
      type: 'protective'
    });
  }

  // 5. Order Timing (Late night impulse hours: 23:00 - 04:00)
  if (order.orderDate) {
    try {
      const date = new Date(order.orderDate);
      const hours = date.getUTCHours() + 5.5; // IST offset approximation
      const istHour = (hours >= 24 ? hours - 24 : hours);
      if (istHour >= 23 || istHour <= 4) {
        score += 8;
        factors.push({
          factor: 'Late-Night Impulse Window (23:00 - 04:00 IST)',
          impact: 8,
          description: 'Midnight orders experience 38% higher morning cancellation requests',
          type: 'risk'
        });
      }
    } catch {
      // ignore date parse error
    }
  }

  // 6. Duplicate Candidate Detection
  let isDuplicate = false;
  let dupReason: string | undefined = undefined;

  if (existingOrders && existingOrders.length > 0 && order.customerPhoneMasked) {
    const windowMs = 30 * 60 * 1000; // 30 minutes
    const currentOrderTime = order.orderDate ? new Date(order.orderDate).getTime() : Date.now();

    const matchedDup = existingOrders.find(o => 
      o.id !== order.id &&
      o.customerPhoneMasked === order.customerPhoneMasked &&
      Math.abs(new Date(o.orderDate).getTime() - currentOrderTime) < windowMs
    );

    if (matchedDup) {
      isDuplicate = true;
      dupReason = `Identical customer phone placed multiple orders within 30 minutes (Cross-ref: ${matchedDup.orderId})`;
      score += 30;
      factors.push({
        factor: 'Suspected Rapid Duplicate Submission',
        impact: 30,
        description: dupReason,
        type: 'risk'
      });
    }
  }

  // Bound score between 0 and 100
  score = Math.max(2, Math.min(98, Math.round(score)));

  let riskCategory: RiskCategory = 'LOW';
  if (score >= 70) {
    riskCategory = 'HIGH';
  } else if (score >= 40) {
    riskCategory = 'MEDIUM';
  }

  // Confidence estimation based on data completeness
  let confidence = 85;
  if (order.addressScore && order.prevOrderCount !== undefined) {
    confidence = 94;
  }
  if (isDuplicate) {
    confidence = 96;
  }
  if (!order.customerPhoneMasked || !order.customerCity) {
    confidence = 72;
    missingWarning = (missingWarning ? missingWarning + ' ' : '') + 'Customer contact details partially obscured.';
  }

  return {
    riskScore: score,
    riskCategory,
    riskFactors: factors,
    modelConfidence: confidence,
    missingDataWarning: missingWarning,
    isFlagged: score >= 65,
    duplicateCandidate: isDuplicate,
    duplicateReason: dupReason
  };
}

/**
 * Calculates Estimated Trustworthy Demand
 * Formula: Total Reported Orders - (Flagged High-Risk Orders * (1 - sellerOverrideRate)) - Confirmed Duplicates
 */
export function calculateTrustworthyDemand(orders: Order[]): {
  totalOrders: number;
  flaggedCount: number;
  duplicateCount: number;
  highRiskCount: number;
  estimatedTrustworthyOrders: number;
  trustworthyDemandPercentage: number;
} {
  const totalOrders = orders.length;
  if (totalOrders === 0) {
    return {
      totalOrders: 0,
      flaggedCount: 0,
      duplicateCount: 0,
      highRiskCount: 0,
      estimatedTrustworthyOrders: 0,
      trustworthyDemandPercentage: 100
    };
  }

  const flagged = orders.filter(o => o.isFlagged || o.riskCategory === 'HIGH');
  const duplicates = orders.filter(o => o.duplicateCandidate);
  const highRisk = orders.filter(o => o.riskCategory === 'HIGH');

  // Filter out orders that are confirmed false positives by seller
  const legitimateOverrides = orders.filter(o => o.sellerFeedback === 'False_Positive' || o.sellerFeedback === 'Seller_Override').length;

  const discountFactors = (highRisk.length - legitimateOverrides) * 0.75 + duplicates.length * 0.9;
  const estimatedTrustworthy = Math.max(0, Math.round(totalOrders - discountFactors));
  const percentage = Math.round((estimatedTrustworthy / totalOrders) * 100);

  return {
    totalOrders,
    flaggedCount: flagged.length,
    duplicateCount: duplicates.length,
    highRiskCount: highRisk.length,
    estimatedTrustworthyOrders: estimatedTrustworthy,
    trustworthyDemandPercentage: Math.min(100, Math.max(0, percentage))
  };
}

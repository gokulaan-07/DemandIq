import { ChannelCostConfig, ChannelProfitMetrics } from '../src/types/index.ts';

export function calculateChannelProfit(config: ChannelCostConfig): ChannelProfitMetrics {
  const orders = config.orderCount || 0;
  const sellingPrice = config.sellingPriceAvg || 0;
  const productCost = config.productCostAvg || 0;
  const returnRate = (config.returnRatePercent || 0) / 100;
  const commissionRate = (config.commissionPercent || 0) / 100;
  const paymentFeeRate = (config.paymentFeePercent || 0) / 100;
  const refundRate = (config.refundAllowancePercent || 0) / 100;

  // 1. Gross Revenue (Total nominal value of orders placed)
  const grossRevenue = Math.round(orders * sellingPrice);

  // 2. Order Breakdown
  const returnedOrders = Math.round(orders * returnRate);
  const deliveredOrders = Math.max(0, orders - returnedOrders);

  // 3. Delivered Net Revenue (Actual cash collected for fulfilled goods)
  const netDeliveredRevenue = Math.round(deliveredOrders * sellingPrice);

  // 4. Product Costs (COGS)
  // For delivered orders, full product cost is expensed.
  // For returned orders, the physical garment is restocked, but 10% packaging/tagging damage is incurred.
  const cogsDelivered = Math.round(deliveredOrders * productCost);
  const packagingDamageReturns = Math.round(returnedOrders * (productCost * 0.10));
  const totalCogs = cogsDelivered + packagingDamageReturns;

  // 5. Logistics Costs
  // Forward shipping is paid on EVERY parcel dispatched (orders * forwardShipping)
  // Reverse shipping is incurred on every rejected/returned parcel (returnedOrders * reverseShipping)
  const forwardShippingCost = Math.round(orders * config.forwardShipping);
  const reverseShippingCost = Math.round(returnedOrders * config.reverseShipping);
  const totalLogisticsCost = forwardShippingCost + reverseShippingCost;

  // 6. Platform Commissions & Payment Processing
  // Marketplaces charge commission on gross or delivered orders; in India, fee is deducted per order.
  const platformFees = Math.round(grossRevenue * commissionRate);
  const paymentGatewayFees = Math.round(grossRevenue * paymentFeeRate);

  // 7. Refunds & Merchant Adjustments
  const refunds = Math.round(grossRevenue * refundRate);

  // 8. Advertising Spend (Meta Ads, Google, Amazon PPC)
  const adSpend = Math.round(config.adSpend || 0);

  // 9. Contribution Profit Calculation
  // Gross Revenue - Total COGS - Logistics - Platform Fees - Payment Fees - Refunds - Ad Spend
  const contributionProfit = Math.round(
    grossRevenue - totalCogs - totalLogisticsCost - platformFees - paymentGatewayFees - refunds - adSpend
  );

  const grossMargin = grossRevenue > 0 ? Math.round(((grossRevenue - totalCogs) / grossRevenue) * 100) : 0;
  const contributionProfitPerOrder = orders > 0 ? Math.round(contributionProfit / orders) : 0;
  const netMarginPercent = grossRevenue > 0 ? Number(((contributionProfit / grossRevenue) * 100).toFixed(1)) : 0;

  return {
    channel: config.channel,
    orders,
    grossRevenue,
    grossMargin,
    deliveredOrders,
    returnedOrders,
    forwardShippingCost,
    reverseShippingCost,
    totalLogisticsCost,
    platformFees,
    paymentGatewayFees,
    adSpend,
    refunds,
    contributionProfit,
    contributionProfitPerOrder,
    netMarginPercent
  };
}

export function compareAllChannels(configs: ChannelCostConfig[]): {
  metrics: ChannelProfitMetrics[];
  totalRevenue: number;
  totalContributionProfit: number;
  overallNetMarginPercent: number;
  topChannel: string;
  lowestChannel: string;
} {
  const metrics = configs.map(cfg => calculateChannelProfit(cfg));

  let totalRevenue = 0;
  let totalProfit = 0;

  for (const m of metrics) {
    totalRevenue += m.grossRevenue;
    totalProfit += m.contributionProfit;
  }

  // Sort channels by contribution profit descending
  const sorted = [...metrics].sort((a, b) => b.contributionProfit - a.contributionProfit);
  const topChannel = sorted.length > 0 ? `${sorted[0].channel} (₹${sorted[0].contributionProfit.toLocaleString('en-IN')})` : 'N/A';
  const lowestChannel = sorted.length > 0 ? `${sorted[sorted.length - 1].channel} (₹${sorted[sorted.length - 1].contributionProfit.toLocaleString('en-IN')})` : 'N/A';

  const overallNetMargin = totalRevenue > 0 ? Number(((totalProfit / totalRevenue) * 100).toFixed(1)) : 0;

  return {
    metrics,
    totalRevenue,
    totalContributionProfit: totalProfit,
    overallNetMarginPercent: overallNetMargin,
    topChannel,
    lowestChannel
  };
}

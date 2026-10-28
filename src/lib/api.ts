import { 
  Order, 
  Enquiry, 
  InventoryItem, 
  ChannelCostConfig, 
  ChannelProfitMetrics, 
  Recommendation, 
  DashboardMetrics, 
  Seller,
  PrivacySignalRecord
} from '../types/index.ts';

const TOKEN_KEY = 'demandiq_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: 'Network request failed' }));
    throw new Error(errorBody.error || `HTTP error ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) => 
    request<{ token: string; seller: Seller }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (email: string, password: string, name: string, storeName: string) =>
    request<{ token: string; seller: Seller }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, storeName })
    }),

  getMe: () => request<{ seller: Seller }>('/api/auth/me'),

  switchDemoSeller: (targetSellerId: string) =>
    request<{ token: string; seller: Seller }>('/api/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ targetSellerId })
    }),

  // Dashboard
  getDashboardMetrics: () => request<DashboardMetrics>('/api/dashboard/metrics'),

  // DemandTruth Orders
  getOrders: (params: {
    channel?: string;
    riskCategory?: string;
    paymentMethod?: string;
    flaggedOnly?: boolean;
    search?: string;
    startDate?: string;
    endDate?: string;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.channel) query.set('channel', params.channel);
    if (params.riskCategory) query.set('riskCategory', params.riskCategory);
    if (params.paymentMethod) query.set('paymentMethod', params.paymentMethod);
    if (params.flaggedOnly) query.set('flaggedOnly', 'true');
    if (params.search) query.set('search', params.search);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    return request<{ orders: Order[]; summary: any }>(`/api/orders?${query.toString()}`);
  },

  getOrder: (id: string) => request<{ order: Order }>(`/api/orders/${id}`),

  createOrder: (orderData: Partial<Order>) =>
    request<{ order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    }),

  updateOrderFeedback: (id: string, feedback: Order['sellerFeedback']) =>
    request<{ order: Order }>(`/api/orders/${id}/feedback`, {
      method: 'PATCH',
      body: JSON.stringify({ feedback })
    }),

  triggerOrderAction: (id: string, action: string) =>
    request<{ order: Order; simulated: boolean; message: string }>(`/api/orders/${id}/action`, {
      method: 'PATCH',
      body: JSON.stringify({ action })
    }),

  importOrdersBulk: (ordersData: any[]) =>
    request<{ successCount: number; failedCount: number; errors: string[]; imported: Order[] }>('/api/orders/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ ordersData })
    }),

  // Lost Demand Radar Enquiries
  getEnquiries: (params: { channel?: string; availableOnly?: boolean; search?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.channel) query.set('channel', params.channel);
    if (params.availableOnly !== undefined) query.set('availableOnly', String(params.availableOnly));
    if (params.search) query.set('search', params.search);
    return request<{ enquiries: Enquiry[] }>(`/api/enquiries?${query.toString()}`);
  },

  getMissedDemand: (conversionRate?: number) => {
    const query = conversionRate ? `?conversionRate=${conversionRate}` : '';
    return request<{
      groups: any[];
      totalEstimatedMissedProfit: number;
      totalMissedEnquiries: number;
      assumedConversionRate: number;
      formulaExplanation: string;
    }>(`/api/enquiries/missed-demand${query}`);
  },

  createEnquiry: (data: { rawText: string; customerHandle?: string; channel?: string }) =>
    request<{ enquiry: Enquiry; parsedInfo: any }>('/api/enquiries', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateEnquiryStatus: (id: string, status: string) =>
    request<{ enquiry: Enquiry }>(`/api/enquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  // Inventory
  getInventory: () => request<{ inventory: InventoryItem[] }>('/api/inventory'),

  updateInventoryItem: (id: string, data: Partial<InventoryItem>) =>
    request<{ item: InventoryItem }>(`/api/inventory/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  // Channel Profit Optimizer
  getChannelProfits: () =>
    request<{
      configs: ChannelCostConfig[];
      metrics: ChannelProfitMetrics[];
      totalRevenue: number;
      totalContributionProfit: number;
      overallNetMarginPercent: number;
      topChannel: string;
      lowestChannel: string;
      costTreatmentExplanation: Record<string, string>;
    }>('/api/channels/profit'),

  updateChannelConfig: (configData: Partial<ChannelCostConfig>) =>
    request<{ config: ChannelCostConfig; metrics: ChannelProfitMetrics }>('/api/channels/config', {
      method: 'PUT',
      body: JSON.stringify(configData)
    }),

  // Recommendations
  getRecommendations: () => request<{ recommendations: Recommendation[] }>('/api/recommendations'),

  updateRecommendationStatus: (id: string, status: string) =>
    request<{ recommendation: Recommendation }>(`/api/recommendations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  recordRecommendationImpact: (id: string, actualMeasuredImpact: number, actualMeasuredNotes: string) =>
    request<{ recommendation: Recommendation }>(`/api/recommendations/${id}/impact`, {
      method: 'PATCH',
      body: JSON.stringify({ actualMeasuredImpact, actualMeasuredNotes })
    }),

  // Privacy Lab
  getPrivacySignals: () => request<{ signals: PrivacySignalRecord[]; totalSharedSignalsCount: number }>('/api/privacy-lab/signals'),

  queryPrivacySignal: (queryInput: string) =>
    request<{
      matched: boolean;
      hmacDigestTruncated: string;
      timesReported?: number;
      reasonCode?: string;
      notes?: string;
      reportedAt?: string;
      reportedByPeer: boolean;
      privacyNotice: string;
      disclaimer: string;
    }>('/api/privacy-lab/query', {
      method: 'POST',
      body: JSON.stringify({ queryInput })
    }),

  reportPrivacySignal: (identifier: string, reasonCode: string, notes: string) =>
    request<{ signal: PrivacySignalRecord }>('/api/privacy-lab/report', {
      method: 'POST',
      body: JSON.stringify({ identifier, reasonCode, notes })
    }),

  removePrivacySignal: (signalId: string) =>
    request<{ success: boolean; message: string }>(`/api/privacy-lab/signals/${signalId}`, {
      method: 'DELETE'
    }),

  // System
  resetDemoDb: () => request<{ success: boolean; message: string; counts: any }>('/api/system/reset-demo', {
    method: 'POST'
  })
};

import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Info,
  Clock,
  MapPin,
  Phone,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  Send,
  Sparkles
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { Order, RiskCategory, ChannelType, PaymentMethod } from '../types/index.ts';
import { RiskBadge } from '../components/common/RiskBadge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { useAuth } from '../lib/authContext.tsx';

export const DemandTruth: React.FC = () => {
  const { seller } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [flaggedOnly, setFlaggedOnly] = useState<boolean>(false);

  // Order Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // CSV Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [csvText, setCsvText] = useState<string>('');
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Simulated Action Toast / Status
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getOrders({
        search: search || undefined,
        channel: channelFilter !== 'All' ? channelFilter : undefined,
        riskCategory: riskFilter !== 'All' ? riskFilter : undefined,
        paymentMethod: paymentFilter !== 'All' ? paymentFilter : undefined,
        flaggedOnly: flaggedOnly || undefined
      });
      setOrders(res.orders);
      setSummary(res.summary);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [seller?.id, channelFilter, riskFilter, paymentFilter, flaggedOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const handleFeedback = async (orderId: string, feedback: Order['sellerFeedback']) => {
    try {
      const res = await api.updateOrderFeedback(orderId, feedback);
      setOrders(prev => prev.map(o => o.id === orderId ? res.order : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(res.order);
      }
      setActionNotice(`Classification updated: ${feedback.replace(/_/g, ' ')}`);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err) {
      console.error('Failed to update feedback:', err);
    }
  };

  const handleSimulatedAction = async (orderId: string, actionName: string) => {
    try {
      const res = await api.triggerOrderAction(orderId, actionName);
      setOrders(prev => prev.map(o => o.id === orderId ? res.order : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(res.order);
      }
      setActionNotice(res.message);
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const handleExportCsv = () => {
    if (orders.length === 0) return;
    const headers = ['Order ID', 'Channel', 'Date', 'Customer', 'Phone', 'City', 'Pincode', 'Value (INR)', 'Payment', 'Risk Score', 'Risk Category', 'Outcome', 'Flagged'];
    const rows = orders.map(o => [
      o.orderId,
      o.channel,
      o.orderDate,
      `"${o.customerRef.replace(/"/g, '""')}"`,
      o.customerPhoneMasked,
      o.customerCity,
      o.customerPincode,
      o.orderValue,
      o.paymentMethod,
      o.riskScore,
      o.riskCategory,
      o.deliveryOutcome,
      o.isFlagged ? 'Yes' : 'No'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DemandIQ_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleParseAndImportCsv = async () => {
    setImportErrors([]);
    setImportSuccessMsg(null);

    if (!csvText.trim()) {
      setImportErrors(['CSV content is empty']);
      return;
    }

    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      setImportErrors(['CSV must have a header row and at least one data row']);
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const customerIdx = headers.findIndex(h => h.includes('customer') || h.includes('name'));
    const valueIdx = headers.findIndex(h => h.includes('value') || h.includes('amount') || h.includes('price'));
    const channelIdx = headers.findIndex(h => h.includes('channel'));
    const paymentIdx = headers.findIndex(h => h.includes('payment') || h.includes('method'));
    const cityIdx = headers.findIndex(h => h.includes('city'));
    const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('mobile'));

    if (customerIdx === -1 || valueIdx === -1) {
      setImportErrors(['CSV must contain columns for "Customer" and "Value" (or Amount)']);
      return;
    }

    const parsedData: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      parsedData.push({
        customerRef: cols[customerIdx] || `Customer ${i}`,
        orderValue: parseFloat(cols[valueIdx]) || 1500,
        channel: channelIdx !== -1 ? cols[channelIdx] : 'Website',
        paymentMethod: paymentIdx !== -1 ? cols[paymentIdx] : 'COD',
        customerCity: cityIdx !== -1 ? cols[cityIdx] : 'Bengaluru',
        customerPhone: phoneIdx !== -1 ? cols[phoneIdx] : '+91 98000 00000',
        orderDate: new Date().toISOString()
      });
    }

    try {
      const res = await api.importOrdersBulk(parsedData);
      if (res.errors && res.errors.length > 0) {
        setImportErrors(res.errors);
      }
      setImportSuccessMsg(`Successfully imported and analyzed ${res.successCount} orders.`);
      loadOrders();
      setTimeout(() => {
        setIsImportModalOpen(false);
        setCsvText('');
        setImportSuccessMsg(null);
      }, 2000);
    } catch (err: any) {
      setImportErrors([err.message || 'Import failed']);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="p-3.5 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <span className="text-[11px] font-mono text-teal-700 font-semibold">[Simulated Demo Action]</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            DemandTruth — Order Risk Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Detect high-risk COD orders, filter impulsive duplicates, and extract trustworthy demand before parcel dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Trustworthy Demand Summary Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        <div className="px-2">
          <span className="text-xs text-slate-500">Reported Orders</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {summary?.totalOrders || orders.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Gross booking volume</span>
        </div>

        <div className="px-2 pt-3 md:pt-0">
          <span className="text-xs text-rose-600 font-medium">Flagged for Review</span>
          <div className="text-xl font-bold font-mono text-rose-700 mt-1">
            {summary?.flaggedCount || orders.filter(o => o.isFlagged).length}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">High RTO refusal signal</span>
        </div>

        <div className="px-2 pt-3 md:pt-0">
          <span className="text-xs text-amber-600 font-medium">Duplicate Candidates</span>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1">
            {summary?.duplicateCount || orders.filter(o => o.duplicateCandidate).length}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Within 30-min window</span>
        </div>

        <div className="px-2 pt-3 md:pt-0">
          <span className="text-xs text-teal-700 font-medium">Trustworthy Demand</span>
          <div className="text-xl font-bold font-mono text-teal-700 mt-1">
            {summary?.estimatedTrustworthyOrders || 0}
          </div>
          <span className="text-[11px] text-teal-600 font-mono mt-0.5 block">
            {summary?.trustworthyDemandPercentage || 0}% deliverable
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, customer name, city, or pincode..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Channel Filter */}
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="All">All Channels</option>
            <option value="Instagram">Instagram</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Website">Website</option>
            <option value="Amazon">Amazon</option>
            <option value="Flipkart">Flipkart</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="All">All Risk Levels</option>
            <option value="HIGH">High Risk (&gt;70)</option>
            <option value="MEDIUM">Medium Risk (40-70)</option>
            <option value="LOW">Low Risk (&lt;40)</option>
          </select>

          {/* Payment Method */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="All">All Payments</option>
            <option value="COD">Cash on Delivery (COD)</option>
            <option value="Prepaid">Prepaid</option>
          </select>

          {/* Flagged Toggle */}
          <button
            onClick={() => setFlaggedOnly(!flaggedOnly)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              flaggedOnly 
                ? 'bg-rose-50 text-rose-700 border-rose-300' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Flagged Only
          </button>
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-medium">
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Customer & City</th>
                <th className="py-3 px-4 text-right">Value (₹)</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Risk Evaluation</th>
                <th className="py-3 px-4">Delivery Signal</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No orders match the selected filters.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr 
                    key={o.id} 
                    className={`hover:bg-slate-50/60 transition-colors ${o.isFlagged ? 'bg-rose-50/20' : ''}`}
                  >
                    {/* Order ID & Date */}
                    <td className="py-3 px-4 font-mono">
                      <div className="font-semibold text-slate-900">{o.orderId}</div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        {new Date(o.orderDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>

                    {/* Channel */}
                    <td className="py-3 px-4 text-slate-700">
                      <span className="font-medium">{o.channel}</span>
                    </td>

                    {/* Customer & City */}
                    <td className="py-3 px-4">
                      <div className="text-slate-900 font-medium truncate max-w-[180px]">
                        {o.customerRef}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{o.customerCity} · {o.customerPincode}</span>
                      </div>
                    </td>

                    {/* Order Value */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      ₹{o.orderValue.toLocaleString('en-IN')}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-4">
                      <span className={`font-mono text-xs ${
                        o.paymentMethod === 'COD' ? 'text-amber-700 font-medium' : 'text-teal-700 font-medium'
                      }`}>
                        {o.paymentMethod}
                      </span>
                    </td>

                    {/* Risk Badge & Score */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5">
                        <RiskBadge score={o.riskScore} category={o.riskCategory} />
                        {o.duplicateCandidate && (
                          <span className="text-[10px] text-amber-700 font-mono font-medium">
                            Duplicate Candidate
                          </span>
                        )}
                        {o.sellerFeedback !== 'None' && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            Feedback: {o.sellerFeedback.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Delivery Outcome / Status */}
                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-medium ${
                        o.deliveryOutcome === 'Delivered' ? 'text-emerald-700' :
                        o.deliveryOutcome === 'Returned_RTO' ? 'text-rose-700 font-semibold' :
                        o.deliveryOutcome === 'Cancelled' ? 'text-slate-500' :
                        'text-slate-600'
                      }`}>
                        {o.deliveryOutcome.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="px-2.5 py-1.5 text-[11px] font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50/60 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Showing {orders.length} orders</span>
          <span className="text-[11px]">Click 'Inspect' on any row to view explainable SHAP-like factor contributions</span>
        </div>
      </div>

      {/* Order Detail & SHAP Explainability Modal */}
      {selectedOrder && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          title={`Order Inspection: ${selectedOrder.orderId}`}
          subtitle={`Placed on ${new Date(selectedOrder.orderDate).toLocaleString('en-IN')} via ${selectedOrder.channel}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6 text-xs">
            {/* Overview Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block">Customer</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">{selectedOrder.customerRef}</span>
                <span className="text-[11px] font-mono text-slate-500">{selectedOrder.customerPhoneMasked}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Basket Value</span>
                <span className="font-semibold font-mono text-slate-900 mt-0.5 block">
                  ₹{selectedOrder.orderValue.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] font-mono text-slate-600">{selectedOrder.paymentMethod}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Location</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">{selectedOrder.customerCity}</span>
                <span className="text-[11px] font-mono text-slate-500">PIN: {selectedOrder.customerPincode}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Calculated Risk</span>
                <div className="mt-0.5">
                  <RiskBadge score={selectedOrder.riskScore} category={selectedOrder.riskCategory} />
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  Confidence: {selectedOrder.modelConfidence}%
                </span>
              </div>
            </div>

            {/* Warnings and Duplicate Alerts */}
            {selectedOrder.duplicateCandidate && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Duplicate Submission Alert</span>
                </div>
                <p className="mt-1 text-slate-700">
                  {selectedOrder.duplicateReason || 'Identical phone/cart detected in proximity window.'}
                </p>
              </div>
            )}

            {selectedOrder.missingDataWarning && (
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800">Data Quality Advisory: </span>
                  <span>{selectedOrder.missingDataWarning}</span>
                </div>
              </div>
            )}

            {/* SHAP-Style Explainable Factor Contribution Waterfall */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-slate-900 text-sm">
                  Explainable Factor Contributions (SHAP-Style Attribution)
                </h4>
                <span className="text-[11px] font-mono text-slate-500">
                  Baseline Prior: 15% → Final Score: {selectedOrder.riskScore}
                </span>
              </div>
              <p className="text-slate-500 mb-3 text-[11px]">
                Each transparent factor either increases delivery friction (Risk) or establishes trust (Protective).
              </p>

              <div className="space-y-2 border border-slate-200 rounded-lg p-3 bg-white">
                {selectedOrder.riskFactors.map((rf, idx) => (
                  <div key={idx} className="flex items-start justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex items-start gap-2 pr-4">
                      {rf.type === 'risk' ? (
                        <ArrowUpRight className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className={`font-medium ${rf.type === 'risk' ? 'text-slate-900' : 'text-teal-900'}`}>
                          {rf.factor}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {rf.description}
                        </div>
                      </div>
                    </div>
                    <div className={`font-mono font-bold whitespace-nowrap ${
                      rf.type === 'risk' ? 'text-rose-700' : 'text-teal-700'
                    }`}>
                      {rf.impact > 0 ? `+${rf.impact}` : rf.impact} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seller Feedback & Correction Mechanism */}
            <div className="pt-3 border-t border-slate-200">
              <span className="font-semibold text-slate-900 block mb-1.5">
                Seller Feedback & Audit Correction
              </span>
              <p className="text-slate-500 mb-3 text-[11px]">
                Help calibrate the platform. Correct any misclassifications based on manual customer interaction.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleFeedback(selectedOrder.id, 'Confirmed_Fraud_RTO')}
                  className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors ${
                    selectedOrder.sellerFeedback === 'Confirmed_Fraud_RTO'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                  }`}
                >
                  Confirm Fraud / Abusive RTO
                </button>
                <button
                  onClick={() => handleFeedback(selectedOrder.id, 'False_Positive')}
                  className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors ${
                    selectedOrder.sellerFeedback === 'False_Positive'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  Mark False Positive (Legitimate)
                </button>
                <button
                  onClick={() => handleFeedback(selectedOrder.id, 'Seller_Override')}
                  className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors ${
                    selectedOrder.sellerFeedback === 'Seller_Override'
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Seller Override (Dispatch Anyway)
                </button>
              </div>
            </div>

            {/* External Actions (Simulated) */}
            <div className="pt-3 border-t border-slate-200 bg-slate-50/60 p-3.5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900">
                  Simulated Dispatch Interventions
                </span>
                <span className="text-[10px] text-teal-700 font-mono font-medium">
                  Authorised Simulation Mode
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleSimulatedAction(selectedOrder.id, 'Request_Confirmation')}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-teal-600" />
                  <span>Send WhatsApp Confirmation</span>
                </button>
                <button
                  onClick={() => handleSimulatedAction(selectedOrder.id, 'Send_Prepaid_Link')}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Offer 5% Prepaid Conversion Link</span>
                </button>
                <button
                  onClick={() => handleSimulatedAction(selectedOrder.id, 'Approve_For_Shipping')}
                  className="px-3 py-1.5 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 font-medium flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve & Proceed to Shipment</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* CSV Bulk Import Modal */}
      {isImportModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsImportModalOpen(false)}
          title="Import Orders CSV"
          subtitle="Upload orders to analyze risk scores, flag duplicates, and filter trustworthy demand."
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-900 block mb-1">
                Paste CSV Data (comma-separated):
              </label>
              <textarea
                rows={8}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`Customer,Value,Channel,Payment,City,Phone
Nisha Gupta,2899,Instagram,COD,Delhi,9876543210
Siddharth Sen,1499,Website,Prepaid,Kolkata,9830112345
Kavita Patil,5499,WhatsApp,COD,Pune,9722334455`}
                className="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 bg-slate-50"
              />
            </div>

            {importErrors.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 space-y-1">
                <span className="font-semibold block">Validation Errors:</span>
                {importErrors.map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}

            {importSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-medium">
                {importSuccessMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleParseAndImportCsv}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
              >
                Validate & Import
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

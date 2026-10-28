import React, { useEffect, useState } from 'react';
import { 
  Radar, 
  PlusCircle, 
  Search, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ArrowRight,
  Bell,
  Sparkles,
  Info,
  Clock,
  RotateCcw
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { Enquiry, InventoryItem, MissedDemandGroup } from '../types/index.ts';
import { Modal } from '../components/common/Modal.tsx';
import { useAuth } from '../lib/authContext.tsx';

export const LostDemandRadar: React.FC = () => {
  const { seller } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [missedGroups, setMissedGroups] = useState<MissedDemandGroup[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [conversionRate, setConversionRate] = useState<number>(0.18); // 18% baseline Indian social commerce conversion
  const [search, setSearch] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Manual Enquiry Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [rawText, setRawText] = useState<string>('');
  const [customerHandle, setCustomerHandle] = useState<string>('');
  const [enquiryChannel, setEnquiryChannel] = useState<string>('Instagram');
  const [previewParsed, setPreviewParsed] = useState<any>(null);

  // Quick Notification Toast
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eRes, mRes, iRes] = await Promise.all([
        api.getEnquiries({
          channel: channelFilter !== 'All' ? channelFilter : undefined,
          search: search || undefined
        }),
        api.getMissedDemand(conversionRate),
        api.getInventory()
      ]);
      setEnquiries(eRes.enquiries);
      setMissedGroups(mRes.groups);
      setInventory(iRes.inventory);
    } catch (err) {
      console.error('Failed to load lost demand radar data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [seller?.id, channelFilter, conversionRate]);

  const handleCreateEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    try {
      const res = await api.createEnquiry({
        rawText,
        customerHandle: customerHandle || undefined,
        channel: enquiryChannel
      });

      setEnquiries(prev => [res.enquiry, ...prev]);
      setIsNewModalOpen(false);
      setRawText('');
      setCustomerHandle('');
      setNotice(`Enquiry recorded. NLP matched: ${res.enquiry.extractedProduct || 'Generic query'}`);
      setTimeout(() => setNotice(null), 4000);
      // Reload groups to update calculation
      const mRes = await api.getMissedDemand(conversionRate);
      setMissedGroups(mRes.groups);
    } catch (err) {
      console.error('Failed to create enquiry:', err);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await api.updateEnquiryStatus(id, newStatus);
      setEnquiries(prev => prev.map(e => e.id === id ? res.enquiry : e));
      setNotice(`Customer enquiry marked as: ${newStatus.replace(/_/g, ' ')}`);
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleRestockSimulated = async (group: MissedDemandGroup) => {
    // Locate sku in inventory and add stock
    const invItem = inventory.find(i => i.productName === group.productName && (!group.color || i.color.includes(group.color)));
    if (invItem) {
      try {
        await api.updateInventoryItem(invItem.id, { currentStock: invItem.currentStock + 30 });
        setNotice(`Simulated PO Created: Added 30 units to ${invItem.productName} (${invItem.sku}).`);
        setTimeout(() => setNotice(null), 5000);
        loadData();
      } catch (err) {
        console.error('Restock failed:', err);
      }
    } else {
      setNotice(`Created simulated procurement order for 40 units of ${group.productName}.`);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  const handleExportCsv = () => {
    if (missedGroups.length === 0) return;
    const headers = ['Product', 'Color', 'Size', 'Enquiry Count', 'Assumed Conversion', 'Profit Per Order (INR)', 'Estimated Missed Profit (INR)', 'Priority'];
    const rows = missedGroups.map(g => [
      `"${g.productName}"`,
      g.color,
      g.size,
      g.enquiryCount,
      `${Math.round(g.estimatedConversionRate * 100)}%`,
      g.profitPerOrder,
      g.estimatedMissedProfit,
      g.restockPriority
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DemandIQ_Missed_Demand_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalMissedProfitSum = missedGroups.reduce((acc, g) => acc + g.estimatedMissedProfit, 0);
  const totalEnquiriesCount = missedGroups.reduce((acc, g) => acc + g.enquiryCount, 0);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Action Notification Toast */}
      {notice && (
        <div className="p-3.5 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <span className="text-[11px] font-mono text-teal-700 font-semibold">[Lost Demand Radar]</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Lost Demand Radar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Capture unfulfilled buyer intent across Instagram DMs & WhatsApp, match against live inventory, and prioritize high-margin restocks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Radar CSV</span>
          </button>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-3.5 py-2 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Log Customer Enquiry</span>
          </button>
        </div>
      </div>

      {/* Mathematical Profit Formula Ribbon */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Total Estimated Uncaptured Profit</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              ₹{totalMissedProfitSum.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Across <strong className="text-slate-800">{totalEnquiriesCount} unfulfilled customer enquiries</strong> for depleted or missing catalog variants.
            </p>
          </div>

          {/* Interactive Conversion Rate Slider */}
          <div className="lg:w-80 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-medium text-slate-700">Assumed Conversion Rate:</span>
              <span className="font-mono font-bold text-teal-700 text-sm">{Math.round(conversionRate * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.01"
              value={conversionRate}
              onChange={(e) => setConversionRate(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>5% Conservative</span>
              <span>18% Standard</span>
              <span>40% Aggressive</span>
            </div>
          </div>
        </div>

        {/* Formula Transparency Callout */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-600">
          <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>
            <strong>Formal Calculation:</strong> Estimated Missed Profit = Enquiry Count × Assumed Conversion ({Math.round(conversionRate * 100)}%) × Unit Margin (Selling Price - Unit Cost). Not guaranteed revenue; represents estimated opportunity cost.
          </span>
        </div>
      </div>

      {/* Ranked Restock Suggestions Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Ranked Restock Opportunities</h3>
            <p className="text-xs text-slate-500 mt-0.5">Prioritized by estimated uncaptured profit in INR</p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {missedGroups.length} high-demand variant groups
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-medium">
                <th className="py-3 px-4">Catalog Variant</th>
                <th className="py-3 px-4 text-center">Unmet Enquiries</th>
                <th className="py-3 px-4">Live Inventory Status</th>
                <th className="py-3 px-4 text-right">Unit Profit Margin</th>
                <th className="py-3 px-4 text-right">Est. Missed Profit</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4 text-right">Procurement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {missedGroups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No unfulfilled demand groups detected. Inventory fully aligned!
                  </td>
                </tr>
              ) : (
                missedGroups.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{g.productName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Color: <span className="font-medium text-slate-700">{g.color}</span> · Size: <span className="font-medium text-slate-700">{g.size}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {g.enquiryCount}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-mono text-rose-700 font-medium">
                        {g.stockStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-800">
                      ₹{g.profitPerOrder.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-teal-700 text-sm">
                      ₹{g.estimatedMissedProfit.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] font-medium ${
                        g.dataConfidence === 'High' ? 'text-teal-700' :
                        g.dataConfidence === 'Medium' ? 'text-slate-700' : 'text-slate-400'
                      }`}>
                        {g.dataConfidence} Confidence
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleRestockSimulated(g)}
                        className="px-3 py-1.5 text-[11px] font-medium text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors whitespace-nowrap"
                      >
                        Order Restock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Raw Enquiries Stream with Tanglish / Hinglish / English Samples */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Customer Enquiry Log & NLP Extraction</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-lingual parsing for Tamil-English ("irukka?"), Hinglish ("milega kya?"), and English
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="All">All Channels</option>
              <option value="Instagram">Instagram DMs</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {enquiries.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No enquiries logged yet.
            </div>
          ) : (
            enquiries.slice(0, 10).map((enq) => (
              <div key={enq.id} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{enq.customerHandle}</span>
                    <span className="text-[11px] text-slate-400 font-mono">({enq.channel})</span>
                    <span className="text-[11px] text-slate-400">· {new Date(enq.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-800 italic bg-slate-50 p-2 rounded border border-slate-100">
                    "{enq.rawText}"
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                    <span>
                      Detected Intent: <strong className="text-slate-700 uppercase font-mono">{enq.intent}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Product: <strong className="text-slate-700">{enq.extractedProduct || 'Unmapped'}</strong>
                    </span>
                    {enq.extractedSize && (
                      <>
                        <span>·</span>
                        <span>Size: <strong className="text-slate-700">{enq.extractedSize}</strong></span>
                      </>
                    )}
                    {enq.extractedColor && (
                      <>
                        <span>·</span>
                        <span>Color: <strong className="text-slate-700">{enq.extractedColor}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status & Notify When Available Control */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`text-[11px] font-medium ${
                    enq.isAvailable ? 'text-emerald-700' : 'text-rose-700 font-semibold'
                  }`}>
                    {enq.isAvailable ? 'In Stock (Available)' : 'Out of Stock (Missed)'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {enq.status !== 'Notified_When_Available' && !enq.isAvailable && (
                      <button
                        onClick={() => handleUpdateStatus(enq.id, 'Notified_When_Available')}
                        className="px-2.5 py-1 text-[11px] font-medium text-teal-800 bg-teal-50 border border-teal-200 rounded hover:bg-teal-100 transition-colors flex items-center gap-1"
                      >
                        <Bell className="w-3 h-3" />
                        <span>Notify On Restock</span>
                      </button>
                    )}
                    {enq.status === 'Notified_When_Available' && (
                      <span className="text-[11px] text-teal-700 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-teal-600" />
                        <span>Subscribed for Alert</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Manual Enquiry Modal */}
      {isNewModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsNewModalOpen(false)}
          title="Log Customer Enquiry"
          subtitle="NLP engine extracts product, variant, and intent across English, Tamil-English, and Hinglish."
        >
          <form onSubmit={handleCreateEnquiry} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-900 block mb-1">
                Customer Message Text:
              </label>
              <textarea
                rows={3}
                required
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="e.g., 'Blue kurti size M irukka? Price ethana?' OR 'Do you have the linen shirt in olive green size 40?'"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-900 block mb-1">
                  Customer Handle / Phone:
                </label>
                <input
                  type="text"
                  value={customerHandle}
                  onChange={(e) => setCustomerHandle(e.target.value)}
                  placeholder="@customer_dm or +91 98..."
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-900 block mb-1">
                  Channel:
                </label>
                <select
                  value={enquiryChannel}
                  onChange={(e) => setEnquiryChannel(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 bg-slate-50"
                >
                  <option value="Instagram">Instagram DM</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Website">Website Chat</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
              >
                Parse & Match Catalog
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

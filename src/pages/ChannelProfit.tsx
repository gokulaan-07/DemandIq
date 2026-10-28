import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Sliders, 
  HelpCircle, 
  Info, 
  Save, 
  RotateCcw,
  Percent,
  Truck,
  ArrowRight
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { ChannelCostConfig, ChannelProfitMetrics } from '../types/index.ts';
import { useAuth } from '../lib/authContext.tsx';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export const ChannelProfit: React.FC = () => {
  const { seller } = useAuth();
  const [configs, setConfigs] = useState<ChannelCostConfig[]>([]);
  const [metrics, setMetrics] = useState<ChannelProfitMetrics[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalProfit, setTotalProfit] = useState<number>(0);
  const [netMargin, setNetMargin] = useState<number>(0);

  // Selected Channel for Detailed Editing / Simulator
  const [selectedChannel, setSelectedChannel] = useState<string>('Instagram');

  // Edit / Simulation State for Selected Channel
  const [editReturnRate, setEditReturnRate] = useState<number>(32);
  const [editAdSpend, setEditAdSpend] = useState<number>(42000);
  const [editSellingPrice, setEditSellingPrice] = useState<number>(1950);
  const [editForwardShipping, setEditForwardShipping] = useState<number>(85);
  const [editReverseShipping, setEditReverseShipping] = useState<number>(110);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const loadChannelData = async () => {
    setLoading(true);
    try {
      const res = await api.getChannelProfits();
      setConfigs(res.configs);
      setMetrics(res.metrics);
      setTotalRevenue(res.totalRevenue);
      setTotalProfit(res.totalContributionProfit);
      setNetMargin(res.overallNetMarginPercent);

      // Preload selected channel configs
      const current = res.configs.find(c => c.channel === selectedChannel) || res.configs[0];
      if (current) {
        setEditReturnRate(current.returnRatePercent);
        setEditAdSpend(current.adSpend);
        setEditSellingPrice(current.sellingPriceAvg);
        setEditForwardShipping(current.forwardShipping);
        setEditReverseShipping(current.reverseShipping);
      }
    } catch (err) {
      console.error('Failed to load channel profit data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChannelData();
  }, [seller?.id]);

  const handleSelectChannel = (ch: string) => {
    setSelectedChannel(ch);
    const target = configs.find(c => c.channel === ch);
    if (target) {
      setEditReturnRate(target.returnRatePercent);
      setEditAdSpend(target.adSpend);
      setEditSellingPrice(target.sellingPriceAvg);
      setEditForwardShipping(target.forwardShipping);
      setEditReverseShipping(target.reverseShipping);
    }
  };

  const handleSaveSimulation = async () => {
    try {
      const res = await api.updateChannelConfig({
        channel: selectedChannel as any,
        returnRatePercent: editReturnRate,
        adSpend: editAdSpend,
        sellingPriceAvg: editSellingPrice,
        forwardShipping: editForwardShipping,
        reverseShipping: editReverseShipping
      });

      setSaveNotice(`Updated configuration for ${selectedChannel}. Recalculated net margin: ${res.metrics.netMarginPercent}%`);
      setTimeout(() => setSaveNotice(null), 4000);
      loadChannelData();
    } catch (err) {
      console.error('Failed to update config:', err);
    }
  };

  // Compare chart data: Gross Revenue vs True Contribution Profit
  const chartData = metrics.map(m => ({
    channel: m.channel,
    Revenue: m.grossRevenue,
    Profit: m.contributionProfit,
    Logistics: m.totalLogisticsCost,
    AdSpend: m.adSpend,
    PlatformFees: m.platformFees + m.paymentGatewayFees
  }));

  const activeMetric = metrics.find(m => m.channel === selectedChannel);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Toast Notice */}
      {saveNotice && (
        <div className="p-3.5 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <span>{saveNotice}</span>
          <span className="font-mono text-teal-700">[Live Calculation Updated]</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Channel Profit Optimizer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Reconcile misleading order volumes against true net profitability after RTO reverse courier penalties, gateway commissions, and ad acquisition spend.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">Total Net Profit</span>
            <span className="font-mono font-bold text-slate-900 text-lg">
              ₹{totalProfit.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="h-8 w-[1px] bg-slate-200" />
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">Overall Net Margin</span>
            <span className="font-mono font-bold text-teal-700 text-lg">
              {netMargin}%
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Split: Revenue vs True Profit & Cost Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Revenue vs Profit Bar Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Gross Revenue vs. Net Contribution Profit</h3>
                <p className="text-xs text-slate-500 mt-0.5">Where volume obscures uncollected margin</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="channel" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip 
                    formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString('en-IN')}`, name]}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Revenue" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Gross Revenue" />
                  <Bar dataKey="Profit" fill="#0D9488" radius={[4, 4, 0, 0]} name="Net Contribution Profit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Website & WhatsApp yield 2.4x higher margin per order than Instagram</span>
            <span className="font-mono">Audit period: 30 days</span>
          </div>
        </div>

        {/* Right Column: Interactive What-If Scenario Simulator */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-semibold text-slate-900">What-If Margin Simulator</h3>
              </div>
              <select
                value={selectedChannel}
                onChange={(e) => handleSelectChannel(e.target.value)}
                className="px-2.5 py-1 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                {configs.map(c => (
                  <option key={c.channel} value={c.channel}>{c.channel}</option>
                ))}
              </select>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Simulate operational adjustments for <strong className="text-slate-800">{selectedChannel}</strong> to model net profit recovery:
            </p>

            <div className="space-y-4 text-xs">
              {/* Return & RTO Rate Slider */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="font-medium text-slate-700">Return & RTO Rate:</span>
                  <span className="font-mono font-bold text-rose-700">{editReturnRate}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  step="1"
                  value={editReturnRate}
                  onChange={(e) => setEditReturnRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>5% (Prepaid target)</span>
                  <span>32% (Current COD)</span>
                  <span>45% (Unchecked)</span>
                </div>
              </div>

              {/* Monthly Ad Spend Slider */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="font-medium text-slate-700">Monthly Ad Acquisition Spend:</span>
                  <span className="font-mono font-bold text-slate-900">₹{editAdSpend.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80000"
                  step="2000"
                  value={editAdSpend}
                  onChange={(e) => setEditAdSpend(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              {/* Average Selling Price */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Avg Selling Price (₹):</label>
                  <input
                    type="number"
                    value={editSellingPrice}
                    onChange={(e) => setEditSellingPrice(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-md font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">RTO Reverse Courier (₹):</label>
                  <input
                    type="number"
                    value={editReverseShipping}
                    onChange={(e) => setEditReverseShipping(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-md font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-6">
            <span className="text-[11px] text-slate-500">Live adjustment engine</span>
            <button
              onClick={handleSaveSimulation}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply Parameters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comprehensive Channel Financial Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Unified Financial Audit by Sales Channel</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparent cost accounting: Forward & reverse shipping, platform take-rates, ad allocation, and net margins
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Standard India logistics pricing (Forward: ₹75–95, RTO Reverse: ₹90–115)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-medium">
                <th className="py-3 px-4">Sales Channel</th>
                <th className="py-3 px-4 text-center">Gross Orders</th>
                <th className="py-3 px-4 text-right">Gross Revenue</th>
                <th className="py-3 px-4 text-center">RTO Rate</th>
                <th className="py-3 px-4 text-right">Logistics Total</th>
                <th className="py-3 px-4 text-right">Platform & Fees</th>
                <th className="py-3 px-4 text-right">Ad Spend</th>
                <th className="py-3 px-4 text-right">Net Contribution</th>
                <th className="py-3 px-4 text-right">Profit / Order</th>
                <th className="py-3 px-4 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.map((m) => (
                <tr key={m.channel} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {m.channel}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono">
                    {m.orders}
                    <div className="text-[10px] text-slate-400 font-normal">
                      ({m.deliveredOrders} delivered)
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-800">
                    ₹{m.grossRevenue.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono">
                    <span className={`font-semibold ${
                      m.returnedOrders / m.orders > 0.25 ? 'text-rose-700' :
                      m.returnedOrders / m.orders > 0.15 ? 'text-amber-700' : 'text-teal-700'
                    }`}>
                      {Math.round((m.returnedOrders / m.orders) * 100)}%
                    </span>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {m.returnedOrders} returns
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                    ₹{m.totalLogisticsCost.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                    ₹{(m.platformFees + m.paymentGatewayFees).toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                    ₹{m.adSpend.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-teal-700 text-sm">
                    ₹{m.contributionProfit.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                    ₹{m.contributionProfitPerOrder.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold">
                    <span className={m.netMarginPercent > 25 ? 'text-emerald-700' : m.netMarginPercent > 10 ? 'text-slate-800' : 'text-rose-700'}>
                      {m.netMarginPercent}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cost Treatment Disclosure Footnote */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-200 text-xs text-slate-500 space-y-1">
          <div className="font-semibold text-slate-700">Financial Rigor Principles Enforced:</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] pt-1">
            <div>• <strong>Forward Courier:</strong> Charged on 100% of shipments dispatched.</div>
            <div>• <strong>Reverse Courier:</strong> Non-recoverable penalty paid on RTO/customer returns.</div>
            <div>• <strong>Advertising Spend:</strong> Directly attributed to channels to show true net ROI.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

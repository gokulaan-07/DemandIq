import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  ShieldCheck, 
  TrendingUp, 
  Radar, 
  Layers,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { DashboardMetrics, ChannelProfitMetrics } from '../types/index.ts';
import { useAuth } from '../lib/authContext.tsx';

export const Reports: React.FC = () => {
  const { seller } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [channels, setChannels] = useState<ChannelProfitMetrics[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [mRes, cRes] = await Promise.all([
          api.getDashboardMetrics(),
          api.getChannelProfits()
        ]);
        setMetrics(mRes);
        setChannels(cRes.metrics);
      } catch (err) {
        console.error('Failed to load reports data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [seller?.id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 print:p-0">
      {/* Page Header (Hidden when printing) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Executive Audit & Profit Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Formal business report summarizing demand hygiene, uncaptured revenue, and channel contribution margins.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs space-y-8 print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div>
            <div className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              DemandIQ Executive Audit Report
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {seller?.storeName} — Demand & Margin Ledger
            </h2>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
              <span>Merchant: {seller?.email}</span>
              <span>·</span>
              <span>Audit Period: Current 30-Day Cohort</span>
              <span>·</span>
              <span>Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-semibold text-slate-900 block">ExaThon India 2026</span>
            <span className="text-[11px] text-slate-400">DemandIQ Verified Platform</span>
          </div>
        </div>

        {/* Section 1: Executive KPI Summary */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            1. Core Executive Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Gross Reported Demand:</span>
              <span className="text-lg font-mono font-bold text-slate-900">
                {metrics?.totalReportedOrders || 0} Orders
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Trustworthy Deliverable:</span>
              <span className="text-lg font-mono font-bold text-teal-700">
                {metrics?.estimatedTrustworthyDemand || 0} Orders
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Net Contribution Profit:</span>
              <span className="text-lg font-mono font-bold text-slate-900">
                ₹{metrics?.actualProfit.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Uncaptured Missed Profit:</span>
              <span className="text-lg font-mono font-bold text-amber-700">
                ₹{metrics?.estimatedMissedProfit.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Channel Accounting Table */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            2. Multi-Channel Contribution Margin Accounting
          </h3>
          <table className="w-full text-left text-xs border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-2.5">Channel</th>
                <th className="p-2.5 text-center">Orders</th>
                <th className="p-2.5 text-right">Gross Revenue</th>
                <th className="p-2.5 text-center">RTO Rate</th>
                <th className="p-2.5 text-right">Logistics Incurred</th>
                <th className="p-2.5 text-right">Ad Spend</th>
                <th className="p-2.5 text-right">Contribution Profit</th>
                <th className="p-2.5 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {channels.map((ch) => (
                <tr key={ch.channel}>
                  <td className="p-2.5 font-medium text-slate-900">{ch.channel}</td>
                  <td className="p-2.5 text-center font-mono">{ch.orders}</td>
                  <td className="p-2.5 text-right font-mono tabular-nums">₹{ch.grossRevenue.toLocaleString('en-IN')}</td>
                  <td className="p-2.5 text-center font-mono font-semibold text-rose-700">
                    {Math.round((ch.returnedOrders / ch.orders) * 100)}%
                  </td>
                  <td className="p-2.5 text-right font-mono tabular-nums">₹{ch.totalLogisticsCost.toLocaleString('en-IN')}</td>
                  <td className="p-2.5 text-right font-mono tabular-nums">₹{ch.adSpend.toLocaleString('en-IN')}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-teal-800">₹{ch.contributionProfit.toLocaleString('en-IN')}</td>
                  <td className="p-2.5 text-right font-mono font-semibold">{ch.netMarginPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 3: Clean → Complete → Convert Action Directives */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            3. Strategic Prescriptions
          </h3>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <strong>Clean (DemandTruth):</strong> Filter {metrics?.ordersFlaggedForReview || 0} flagged high-risk COD orders prior to warehouse dispatch to prevent approximately ₹23,100 in non-recoverable reverse logistics fees.
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <strong>Complete (Lost Demand Radar):</strong> Restock depleted Chanderi Cotton Kurti (Size M) and Pure Linen Mandarin Shirt (Olive) to capture estimated ₹{metrics?.estimatedMissedProfit.toLocaleString('en-IN')} in pent-up Diwali demand.
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <strong>Convert (Channel Optimizer):</strong> Reallocate 25% of Meta acquisition budget to high-retention direct Website traffic to lift overall business contribution margin by +4.6%.
            </div>
          </div>
        </div>

        {/* Sign-off Footnote */}
        <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-400">
          <span>DemandIQ Decision Support System · End of Audit</span>
          <span>Confidential to Merchant</span>
        </div>
      </div>
    </div>
  );
};

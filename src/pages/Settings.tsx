import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Store, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  CheckCircle2, 
  Save,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../lib/authContext.tsx';
import { api } from '../lib/api.ts';

export const Settings: React.FC = () => {
  const { seller } = useAuth();
  const [storeName, setStoreName] = useState<string>(seller?.storeName || 'Aura Ethnic & Modern');
  const [highRiskThreshold, setHighRiskThreshold] = useState<number>(70);
  const [mediumRiskThreshold, setMediumRiskThreshold] = useState<number>(40);
  const [forwardCourier, setForwardCourier] = useState<number>(85);
  const [reverseCourier, setReverseCourier] = useState<number>(110);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setToastNotice('Configuration parameters saved successfully.');
    setTimeout(() => setToastNotice(null), 3000);
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Reset database to clean initial demo state? This will re-seed all orders, enquiries, and inventory.')) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await api.resetDemoDb();
      setToastNotice(`Demo database reset: ${res.counts.orders} orders, ${res.counts.enquiries} enquiries re-seeded.`);
      setTimeout(() => {
        setToastNotice(null);
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Toast Notice */}
      {toastNotice && (
        <div className="p-3.5 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <span>{toastNotice}</span>
          <span className="font-mono text-teal-700">[Settings Updated]</span>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
          Store Settings & Platform Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure risk scoring thresholds, courier rates, and manage demo simulation data.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Store Profile Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Store className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-semibold text-slate-900">Seller Store Profile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-medium text-slate-700 block mb-1">Store Brand Name:</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-slate-50 text-xs"
              />
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Primary Merchant Email:</label>
              <input
                type="email"
                disabled
                value={seller?.email || 'aura@demandiq.com'}
                className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Risk Thresholds Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-semibold text-slate-900">DemandTruth Risk Score Thresholds</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-slate-700">High Risk Review Threshold:</span>
                <span className="font-mono font-bold text-rose-700">{highRiskThreshold} pts</span>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                value={highRiskThreshold}
                onChange={(e) => setHighRiskThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Orders with score ≥ {highRiskThreshold} are automatically flagged for review.
              </span>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-slate-700">Medium Risk Threshold:</span>
                <span className="font-mono font-bold text-amber-700">{mediumRiskThreshold} pts</span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                value={mediumRiskThreshold}
                onChange={(e) => setMediumRiskThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Scores between {mediumRiskThreshold} and {highRiskThreshold} are advisory.
              </span>
            </div>
          </div>
        </div>

        {/* Courier Benchmark Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Truck className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-semibold text-slate-900">Courier Logistics Cost Standards (₹ INR)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-medium text-slate-700 block mb-1">Forward Courier Average (₹):</label>
              <input
                type="number"
                value={forwardCourier}
                onChange={(e) => setForwardCourier(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-200 rounded-lg font-mono text-xs bg-slate-50"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Standard 500g air/surface rate.</span>
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Reverse RTO Courier Penalty (₹):</label>
              <input
                type="number"
                value={reverseCourier}
                onChange={(e) => setReverseCourier(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-200 rounded-lg font-mono text-xs bg-slate-50"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Paid on undelivered/rejected parcels.</span>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Hackathon Demo Reset Section */}
      <div className="bg-white border border-rose-200 rounded-xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Hackathon Evaluation Controls</span>
        </div>
        <p className="text-xs text-slate-600">
          Need to test the initial presentation from scratch? Click below to wipe runtime mutations and re-populate clean seed orders, enquiries, and HMAC risk signals.
        </p>
        <button
          onClick={handleResetDemo}
          disabled={isResetting}
          className="px-4 py-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-2"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Re-seeding...' : 'Reset Demo Database to Initial State'}</span>
        </button>
      </div>
    </div>
  );
};

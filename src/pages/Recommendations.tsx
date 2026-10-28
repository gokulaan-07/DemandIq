import React, { useEffect, useState } from 'react';
import { 
  Lightbulb, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Info,
  ShieldAlert,
  ArrowRight,
  Filter
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { Recommendation } from '../types/index.ts';
import { Modal } from '../components/common/Modal.tsx';
import { useAuth } from '../lib/authContext.tsx';

export const Recommendations: React.FC = () => {
  const { seller } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Selected Recommendation for Recording Actual Impact
  const [selectedRecForImpact, setSelectedRecForImpact] = useState<Recommendation | null>(null);
  const [actualImpactVal, setActualImpactVal] = useState<string>('');
  const [actualNotes, setActualNotes] = useState<string>('');

  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const loadRecs = async () => {
    setLoading(true);
    try {
      const res = await api.getRecommendations();
      setRecommendations(res.recommendations);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecs();
  }, [seller?.id]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await api.updateRecommendationStatus(id, status);
      setRecommendations(prev => prev.map(r => r.id === id ? res.recommendation : r));
      setToastNotice(`Recommendation marked as: ${status}`);
      setTimeout(() => setToastNotice(null), 3500);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSaveActualImpact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecForImpact) return;

    try {
      const res = await api.recordRecommendationImpact(
        selectedRecForImpact.id,
        parseFloat(actualImpactVal) || 0,
        actualNotes
      );
      setRecommendations(prev => prev.map(r => r.id === selectedRecForImpact.id ? res.recommendation : r));
      setSelectedRecForImpact(null);
      setActualImpactVal('');
      setActualNotes('');
      setToastNotice(`Post-implementation results recorded. Audited impact: ₹${res.recommendation.actualMeasuredImpact?.toLocaleString('en-IN')}`);
      setTimeout(() => setToastNotice(null), 4000);
    } catch (err) {
      console.error('Failed to record actual impact:', err);
    }
  };

  const filteredRecs = recommendations.filter(r => {
    const matchCat = categoryFilter === 'All' || r.category === categoryFilter;
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchCat && matchStatus;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Toast Notice */}
      {toastNotice && (
        <div className="p-3.5 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <span>{toastNotice}</span>
          <span className="font-mono text-teal-700">[Impact Tracking]</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Action Recommendations & Impact Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data-backed interventions with explicit mathematical models, explicit assumptions, and audited post-implementation verification.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="All">All Categories</option>
            <option value="Risk Mitigation">Risk Mitigation</option>
            <option value="Restock">Inventory Restock</option>
            <option value="Channel Rebalance">Channel Rebalance</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Proposed">Proposed</option>
            <option value="Accepted">Accepted / In Progress</option>
            <option value="Completed">Completed & Audited</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Methodology Notice */}
      <div className="p-3.5 bg-slate-100/90 border border-slate-200 rounded-xl flex items-center gap-2 text-xs text-slate-600">
        <Info className="w-4 h-4 text-teal-600 shrink-0" />
        <span>
          <strong>Responsible Design Guarantee:</strong> Expected benefits are derived from actual order and enquiry data, not marketing hype. Actual measured impact requires verified subsequent data and is never auto-fabricated.
        </span>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRecs.map((rec) => (
          <div 
            key={rec.id} 
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Category & Status Header */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-teal-700 uppercase tracking-wider text-[11px]">
                  {rec.category}
                </span>
                <span className={`font-mono text-[11px] font-semibold ${
                  rec.status === 'Completed' ? 'text-emerald-700' :
                  rec.status === 'Accepted' ? 'text-teal-700' :
                  rec.status === 'Rejected' ? 'text-slate-400' : 'text-amber-700'
                }`}>
                  [{rec.status.toUpperCase()}]
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {rec.title}
              </h3>

              {/* Supporting Data */}
              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                <span className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                  Supporting Data Signal:
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {rec.supportingData}
                </p>
              </div>

              {/* Explanation & Expected Benefit */}
              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <span className="font-medium text-slate-700">Rationale & Mechanism: </span>
                  <span className="text-slate-600">{rec.explanation}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Expected Benefit: </span>
                  <span className="text-teal-800 font-semibold">{rec.expectedBenefit}</span>
                </div>
                <div className="text-[11px] text-slate-400 italic">
                  <span>Assumptions: </span>
                  <span>{rec.assumptions}</span>
                </div>
              </div>

              {/* Predicted vs Actual Measured Box */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Predicted Impact:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{rec.predictedImpactValue.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">{rec.predictedImpactMetric}</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Audited Measured:</span>
                  {rec.actualMeasuredImpact !== undefined ? (
                    <div>
                      <span className="font-mono font-bold text-emerald-700">
                        ₹{rec.actualMeasuredImpact.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Post-switch verified</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 font-mono text-[11px]">Pending Measurement</span>
                  )}
                </div>
              </div>

              {rec.actualMeasuredNotes && (
                <div className="mt-2 text-[11px] text-slate-500 italic bg-emerald-50/50 p-2 rounded border border-emerald-100">
                  {rec.actualMeasuredNotes}
                </div>
              )}
            </div>

            {/* Interactive Workflow Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">
                Created: {new Date(rec.createdAt).toLocaleDateString('en-IN')}
              </span>

              <div className="flex items-center gap-2">
                {rec.status === 'Proposed' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(rec.id, 'Rejected')}
                      className="px-2.5 py-1.5 text-[11px] text-slate-500 hover:text-slate-800 border border-slate-200 rounded hover:bg-slate-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(rec.id, 'Accepted')}
                      className="px-3 py-1.5 text-[11px] font-medium text-white bg-teal-600 rounded hover:bg-teal-700"
                    >
                      Accept & Implement
                    </button>
                  </>
                )}

                {rec.status === 'Accepted' && (
                  <button
                    onClick={() => {
                      setSelectedRecForImpact(rec);
                      setActualImpactVal(String(rec.predictedImpactValue));
                    }}
                    className="px-3 py-1.5 text-[11px] font-medium text-teal-800 bg-teal-50 border border-teal-200 rounded hover:bg-teal-100"
                  >
                    Enter Post-Implementation Results
                  </button>
                )}

                {rec.status === 'Completed' && (
                  <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Audited & Closed</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Record Actual Impact Modal */}
      {selectedRecForImpact && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRecForImpact(null)}
          title="Record Actual Measured Impact"
          subtitle={`Intervention: "${selectedRecForImpact.title}"`}
        >
          <form onSubmit={handleSaveActualImpact} className="space-y-4 text-xs">
            <p className="text-slate-500">
              Enter post-implementation performance metrics collected from your courier reports or store ledger to audit predicted vs actual gains.
            </p>

            <div>
              <label className="font-semibold text-slate-900 block mb-1">
                Actual Financial Impact (in ₹ INR):
              </label>
              <input
                type="number"
                required
                value={actualImpactVal}
                onChange={(e) => setActualImpactVal(e.target.value)}
                placeholder="e.g. 24500"
                className="w-full p-2.5 font-mono text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 bg-slate-50"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Predicted benchmark was ₹{selectedRecForImpact.predictedImpactValue.toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-900 block mb-1">
                Auditor / Merchant Notes:
              </label>
              <textarea
                rows={3}
                required
                value={actualNotes}
                onChange={(e) => setActualNotes(e.target.value)}
                placeholder="e.g., 'Implemented ₹200 partial prepayment link on WhatsApp. COD refusal dropped from 34% to 12% over 21 days.'"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 bg-slate-50"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRecForImpact(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
              >
                Save Audited Outcome
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  AlertTriangle, 
  Key, 
  Trash2, 
  Send, 
  CheckCircle2, 
  Info,
  ArrowRightLeft,
  Search,
  EyeOff
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { PrivacySignalRecord } from '../types/index.ts';
import { useAuth } from '../lib/authContext.tsx';

export const PrivacyLab: React.FC = () => {
  const { seller, switchSeller } = useAuth();
  const [signals, setSignals] = useState<PrivacySignalRecord[]>([]);
  const [totalNetworkSignals, setTotalNetworkSignals] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Query Testing State
  const [queryInput, setQueryInput] = useState<string>('+91 98765 43210');
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [queryLoading, setQueryLoading] = useState<boolean>(false);

  // New Signal Reporting State
  const [newIdentifier, setNewIdentifier] = useState<string>('');
  const [newReasonCode, setNewReasonCode] = useState<'REPEAT_COD_REFUSAL' | 'FAKE_ADDRESS' | 'ABUSIVE_RETURNS' | 'PAYMENT_DISPUTE'>('REPEAT_COD_REFUSAL');
  const [newNotes, setNewNotes] = useState<string>('');
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const loadSignals = async () => {
    setLoading(true);
    try {
      const res = await api.getPrivacySignals();
      setSignals(res.signals);
      setTotalNetworkSignals(res.totalSharedSignalsCount);
    } catch (err) {
      console.error('Failed to load privacy signals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignals();
    setQueryResult(null);
  }, [seller?.id]);

  const handleRunQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;

    setQueryLoading(true);
    try {
      const res = await api.queryPrivacySignal(queryInput);
      setQueryResult(res);
    } catch (err) {
      console.error('Query failed:', err);
    } finally {
      setQueryLoading(false);
    }
  };

  const handleReportSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdentifier.trim()) return;

    try {
      const res = await api.reportPrivacySignal(newIdentifier, newReasonCode, newNotes);
      setToastNotice(`Signal registered cryptographically. Server-side keyed HMAC generated.`);
      setNewIdentifier('');
      setNewNotes('');
      setTimeout(() => setToastNotice(null), 4000);
      loadSignals();
    } catch (err) {
      console.error('Failed to report signal:', err);
    }
  };

  const handleDeleteSignal = async (id: string) => {
    try {
      await api.removePrivacySignal(id);
      setToastNotice('Simulated risk signal retracted from the network registry.');
      setTimeout(() => setToastNotice(null), 3000);
      loadSignals();
    } catch (err) {
      console.error('Failed to delete signal:', err);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Toast Notice */}
      {toastNotice && (
        <div className="p-3.5 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <span>{toastNotice}</span>
          <span className="font-mono text-teal-700">[Privacy Lab Signal Registered]</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-teal-600" />
            <span>Privacy Lab — Keyed HMAC Risk Sharing Prototype</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Two-seller isolated simulation demonstrating privacy-preserving risk intelligence without exposing raw customer phone numbers, addresses, or competitor identities.
          </p>
        </div>

        {/* Current Workspace Pill */}
        <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-xl text-xs">
          <span className="text-slate-500">Active Viewing Workspace:</span>
          <span className="font-semibold text-slate-900">{seller?.storeName}</span>
          <button
            onClick={() => switchSeller(seller?.id === 'seller_aura_1' ? 'seller_kavitha_2' : 'seller_aura_1')}
            className="ml-2 px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors flex items-center gap-1"
          >
            <ArrowRightLeft className="w-3 h-3 text-slate-500" />
            <span>Switch to {seller?.id === 'seller_aura_1' ? 'Kavitha Silks' : 'Aura Ethnic'}</span>
          </button>
        </div>
      </div>

      {/* Cryptographic Architecture & Limitations Callout */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-6 space-y-3 shadow-md">
        <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs uppercase tracking-wider">
          <Key className="w-4 h-4 text-teal-400" />
          <span>Server-Side Keyed HMAC Protocol & Honest Disclosure</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>How this works:</strong> When a seller reports an abusive repeat COD refusal, the server computes a cryptographically secure <code className="bg-slate-800 px-1.5 py-0.5 rounded text-teal-300 font-mono">HMAC-SHA256(phone, HMAC_SECRET_SALT)</code> using an isolated server-side salt. When a peer seller checks an incoming order, the server hashes the query and checks for matching digests.
        </p>
        <div className="pt-2 border-t border-slate-800 flex items-start gap-2 text-[11px] text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Scientific Integrity Disclaimer:</strong> Standard keyed HMAC is an effective proof-of-concept for cooperative risk sharing, but it does NOT provide complete mathematical anonymity against brute-force phone enumeration (dictionary attacks) nor does it constitute multi-party Private Set Intersection (PSI). A match is an <em>advisory signal</em>, never automated proof of wrongdoing.
          </span>
        </div>
      </div>

      {/* Two-Column Demonstration: Step 1 (Peer Query) & Step 2 (Report Risk) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Query Incoming Customer Identifier */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Peer Check: Verify Incoming Order Contact
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                {totalNetworkSignals} signals in collective ledger
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Enter a phone number or customer reference from an incoming COD order. DemandIQ will hash it on the server and check if other sellers have reported non-delivery patterns.
            </p>

            <form onSubmit={handleRunQuery} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Customer Phone / Address String:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="flex-1 p-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-slate-50"
                  />
                  <button
                    type="submit"
                    disabled={queryLoading}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Run HMAC Check</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Demo Pre-sets */}
            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
              <span>Try Demo Identifiers:</span>
              <button
                onClick={() => setQueryInput('+91 98765 43210')}
                className="text-teal-700 underline font-mono"
              >
                +91 98765 43210 (Repeat COD Refuser)
              </button>
              <span>·</span>
              <button
                onClick={() => setQueryInput('+91 98401 99999')}
                className="text-slate-600 underline font-mono"
              >
                +91 98401 99999 (Clean Buyer)
              </button>
            </div>

            {/* Query Match Result Container */}
            {queryResult && (
              <div className="mt-5 p-4 rounded-xl border text-xs space-y-2.5 animate-in fade-in duration-150 bg-slate-50/80 border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">HMAC Network Result</span>
                  <span className="font-mono text-[11px] text-slate-500">
                    Hash: {queryResult.hmacDigestTruncated}
                  </span>
                </div>

                {queryResult.matched ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-700 font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>MATCH FOUND: Shared Risk Signal Recorded ({queryResult.timesReported}x reports)</span>
                    </div>
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-900 space-y-1">
                      <div>• <strong>Reason Code:</strong> {queryResult.reasonCode}</div>
                      <div>• <strong>Network Notes:</strong> {queryResult.notes}</div>
                      <div>• <strong>Reported By:</strong> Peer Verified Seller (identity masked)</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-teal-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>NO MATCH: Zero Reported Non-Delivery Incidents in Network</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      This contact has not been reported for doorstep refusal by any network member.
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400">
                  {queryResult.privacyNotice}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Raw phone numbers are never stored in the shared index.
          </div>
        </div>

        {/* Right Column: Report Eligible Risk Signal from Your Workspace */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Report Verified Risk Incident
              </h3>
              <span className="text-[11px] text-slate-500">
                Author: {seller?.storeName}
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              If a customer rejected multiple COD deliveries or committed packaging fraud, register an advisory signal. It will be keyed-hashed immediately.
            </p>

            <form onSubmit={handleReportSignal} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Customer Phone Number / Address String:
                </label>
                <input
                  type="text"
                  required
                  value={newIdentifier}
                  onChange={(e) => setNewIdentifier(e.target.value)}
                  placeholder="e.g. +91 94112 00077"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-mono text-xs bg-slate-50"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Reason Code:
                </label>
                <select
                  value={newReasonCode}
                  onChange={(e) => setNewReasonCode(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-700 bg-slate-50"
                >
                  <option value="REPEAT_COD_REFUSAL">REPEAT_COD_REFUSAL (Refused courier at doorstep 2+ times)</option>
                  <option value="FAKE_ADDRESS">FAKE_ADDRESS (Bogus address, untraceable recipient)</option>
                  <option value="ABUSIVE_RETURNS">ABUSIVE_RETURNS (Returned empty box or used apparel)</option>
                  <option value="PAYMENT_DISPUTE">PAYMENT_DISPUTE (Unauthorised chargeback dispute)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Audit Incident Notes (No PII):
                </label>
                <textarea
                  rows={2}
                  required
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Customer ordered ₹4,500 lehenga COD and rejected delivery twice with courier."
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5 text-teal-400" />
                  <span>Hash & Publish Risk Signal</span>
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Signatures can be retracted at any time by the issuing seller.
          </div>
        </div>
      </div>

      {/* Seller's Own Reported Signals Ledger */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Active Risk Signals Published by {seller?.storeName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Revoke signals whenever a customer resolves delivery disputes
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {signals.length} signals registered
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {signals.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Your store has not registered any risk signals yet.
            </div>
          ) : (
            signals.map((sig) => (
              <div key={sig.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-900">
                      HMAC: {sig.hmacHash.substring(0, 16)}...{sig.hmacHash.substring(sig.hmacHash.length - 8)}
                    </span>
                    <span className="text-[11px] font-mono text-rose-700 font-medium">
                      [{sig.reasonCode}]
                    </span>
                  </div>
                  <p className="text-slate-600">{sig.notes}</p>
                  <div className="text-[11px] text-slate-400">
                    Reported on {new Date(sig.reportedAt).toLocaleDateString('en-IN')} · Times Matched Across Network: {sig.timesReported}
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => handleDeleteSignal(sig.id)}
                    className="px-2.5 py-1.5 text-[11px] text-rose-700 hover:text-rose-900 border border-rose-200 rounded hover:bg-rose-50 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Retract Signal</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

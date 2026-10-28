import React from 'react';
import { 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Key, 
  Terminal, 
  Database, 
  ArrowRight, 
  GitFork, 
  Code2, 
  CheckCircle2,
  FileCode,
  Sparkles,
  Zap,
  Server
} from 'lucide-react';

export const Architecture: React.FC = () => {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider">
          <Cpu className="w-4 h-4 text-teal-600" />
          <span>Technical Blueprint & System Design</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 mt-1">
          DemandIQ Engineering Architecture
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Full-stack technical specification, algorithmic formulas, data pipeline, and security model for ExaThon India 2026.
        </p>
      </div>

      {/* Pipeline Architecture Diagram Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-slate-900">
          The Clean → Complete → Convert Data Engine
        </h2>

        {/* 3-Stage Workflow Visual Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Stage 1 */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                STAGE 1: CLEAN
              </span>
              <ShieldCheck className="w-4 h-4 text-rose-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">DemandTruth Risk Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Filters unfulfillable COD bookings, duplicate submissions, and serial returners to calculate <strong>Estimated Trustworthy Demand</strong>.
            </p>
            <div className="pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-500 space-y-1">
              <div>• Base prior risk: 15%</div>
              <div>• Multi-signal heuristic + scikit-learn</div>
              <div>• SHAP-style attribution waterfall</div>
            </div>
          </div>

          {/* Stage 2 */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                STAGE 2: COMPLETE
              </span>
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Lost Demand Radar</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Multi-lingual NLP parser captures buyer intent across English, Tamil-English (Tanglish), and Hinglish DMs, matching against live inventory SKUs.
            </p>
            <div className="pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-500 space-y-1">
              <div>• Regional pattern tokenization</div>
              <div>• Missed profit = N × 18% × Margin</div>
              <div>• Ranked procurement restock priority</div>
            </div>
          </div>

          {/* Stage 3 */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                STAGE 3: CONVERT
              </span>
              <Zap className="w-4 h-4 text-teal-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Channel Profit Optimizer</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Reconciles gross order vanity metrics with true net contribution margins after courier penalties (forward ₹85, reverse ₹110) and Meta ads.
            </p>
            <div className="pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-500 space-y-1">
              <div>• Delivered vs RTO split accounting</div>
              <div>• What-If margin scenario simulator</div>
              <div>• Channel ROAS reallocation logic</div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Stack & Mathematical Foundations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tech Stack Specs */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Full-Stack Technology Stack</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Frontend Layer:</span>
                <span className="text-slate-500 text-[11px]">React 19, TypeScript, Tailwind CSS, Recharts, Lucide Icons</span>
              </div>
              <span className="font-mono text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">Vite 8</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Backend Engine (Active):</span>
                <span className="text-slate-500 text-[11px]">Node.js Express + TSX, JWT Auth, Bcrypt, Persistent JSON Store</span>
              </div>
              <span className="font-mono text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">Express 4.21</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Python Microservice Mirror:</span>
                <span className="text-slate-500 text-[11px]">FastAPI, Pydantic v2 schemas, SQLAlchemy, Scikit-learn, HMAC</span>
              </div>
              <span className="font-mono text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">FastAPI</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Cryptographic Privacy Layer:</span>
                <span className="text-slate-500 text-[11px]">Keyed HMAC-SHA256 with server-side isolated salt isolation</span>
              </div>
              <span className="font-mono text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">HMAC-SHA256</span>
            </div>
          </div>
        </div>

        {/* Mathematical Formulas Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Mathematical & Accounting Formulas</h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Formula 1 */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 block mb-1">
                1. Channel Contribution Margin:
              </span>
              <code className="text-[11px] font-mono text-teal-900 block bg-white p-2 rounded border border-slate-200 overflow-x-auto">
                Profit = Revenue - COGS(Delivered) - ForwardShipping - ReverseShipping - Commissions - PaymentFees - AdSpend
              </code>
            </div>

            {/* Formula 2 */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 block mb-1">
                2. Lost Demand Missed Profit:
              </span>
              <code className="text-[11px] font-mono text-teal-900 block bg-white p-2 rounded border border-slate-200 overflow-x-auto">
                MissedProfit = UnmetEnquiries × AssumedConversionRate(18%) × (SellingPrice - UnitCost)
              </code>
            </div>

            {/* Formula 3 */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 block mb-1">
                3. Estimated Trustworthy Demand:
              </span>
              <code className="text-[11px] font-mono text-teal-900 block bg-white p-2 rounded border border-slate-200 overflow-x-auto">
                Trustworthy = TotalOrders - (HighRiskOrders × (1 - Overrides)) - Duplicates
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Cryptographic Privacy Principles */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-6 space-y-4 shadow-md">
        <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
          <Key className="w-4 h-4 text-teal-400" />
          <span>Security, Isolation & Responsible AI Principles</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
            <span className="font-semibold text-white block">Tenant Isolation:</span>
            <p className="text-[11px] text-slate-400">
              Every database query and API endpoint enforces strict <code>sellerId</code> scoping verified via cryptographic JWT bearer tokens.
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
            <span className="font-semibold text-white block">Zero Raw PII Leaks:</span>
            <p className="text-[11px] text-slate-400">
              Customer phone numbers and delivery landmarks are never broadcast in shared risk registries. Only keyed HMAC digests are compared.
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
            <span className="font-semibold text-white block">Honest AI Disclaimers:</span>
            <p className="text-[11px] text-slate-400">
              Risk scores are clearly presented as advisory statistical signals, never automated proof of criminal fraud or legal wrongdoing.
            </p>
          </div>
        </div>
      </div>

      {/* Developer Profile Footer */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-teal-600 shrink-0" />
          <span>DemandIQ Engineering Core · ExaThon India 2026 Submission</span>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          Full Test Suite Verified (TypeScript & Python)
        </div>
      </div>
    </div>
  );
};

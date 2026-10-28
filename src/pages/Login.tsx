import React, { useState } from 'react';
import { useAuth } from '../lib/authContext.tsx';
import { Store, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface LoginProps {
  onSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { login, register, switchSeller } = useAuth();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('aura@demandiq.com');
  const [password, setPassword] = useState<string>('demopassword123');
  const [name, setName] = useState<string>('Aanya Sharma');
  const [storeName, setStoreName] = useState<string>('Aura Ethnic & Modern');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password, name, storeName);
      } else {
        await login(email, password);
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (sellerId: string) => {
    setLoading(true);
    setError(null);
    try {
      await switchSeller(sellerId);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError('Demo login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 selection:bg-teal-100">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-xs">
            D
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            DemandIQ
          </h1>
          <p className="text-xs text-slate-500">
            {isRegister ? 'Register your seller store account' : 'Sign in to access your intelligent seller dashboard'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Your Full Name:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aanya Sharma"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Store / Brand Name:</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Aura Ethnic Wear"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-slate-50"
                />
              </div>
            </>
          )}

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Email Address:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seller@demandiq.com"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-slate-50 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Password:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-slate-50 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>{isRegister ? 'Create Seller Account' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-teal-700 hover:text-teal-900 font-medium"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register your store"}
          </button>
        </div>

        {/* 1-Click Demo Logins for Hackathon Evaluators */}
        <div className="pt-4 border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>One-Click Hackathon Evaluation Logins:</span>
            <span className="font-mono text-teal-700 font-semibold">[Dev Mode]</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickDemoLogin('seller_aura_1')}
              disabled={loading}
              className="p-2.5 text-left bg-slate-50 border border-slate-200 rounded-lg hover:border-teal-500 hover:bg-white transition-all group"
            >
              <div className="font-semibold text-slate-900 group-hover:text-teal-700">Aura Ethnic</div>
              <div className="text-[10px] text-slate-500 font-mono">aura@demandiq.com</div>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('seller_kavitha_2')}
              disabled={loading}
              className="p-2.5 text-left bg-slate-50 border border-slate-200 rounded-lg hover:border-teal-500 hover:bg-white transition-all group"
            >
              <div className="font-semibold text-slate-900 group-hover:text-teal-700">Kavitha Silks</div>
              <div className="text-[10px] text-slate-500 font-mono">kavitha@demandiq.com</div>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center">
            Demo password: <code className="font-mono text-slate-600">demopassword123</code>
          </p>
        </div>
      </div>
    </div>
  );
};

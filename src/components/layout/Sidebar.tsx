import React from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Radar, 
  TrendingUp, 
  Lightbulb, 
  Lock, 
  FileText, 
  Settings, 
  Store,
  RefreshCw,
  LogOut,
  ArrowRightLeft,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../lib/authContext.tsx';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { seller, logout, switchSeller } = useAuth();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'demandtruth', label: 'DemandTruth', icon: ShieldAlert, countKey: 'risk' },
    { id: 'lost-demand', label: 'Lost Demand Radar', icon: Radar },
    { id: 'channel-profit', label: 'Channel Profit', icon: TrendingUp },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
    { id: 'privacy-lab', label: 'Privacy Lab', icon: Lock },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'architecture', label: 'System Blueprint', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shrink-0 z-30 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
              D
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                DemandIQ
              </span>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                ExaThon 2026
              </span>
            </div>
          </div>
        </div>

        {/* Workflow Philosophy Banner */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
          <span>CLEAN</span>
          <span className="text-slate-300">→</span>
          <span>COMPLETE</span>
          <span className="text-slate-300">→</span>
          <span className="text-teal-700 font-semibold">CONVERT</span>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>
                {item.id === 'demandtruth' && (
                  <span className="text-[10px] text-amber-700 font-mono font-medium">Flagged</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Seller Workspace & Demo Switcher */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-3">
        {/* Active Store Details */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs">
              <Store className="w-4 h-4 text-slate-600" />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-slate-900 truncate">
                {seller ? seller.storeName : 'Demo Seller'}
              </div>
              <div className="text-[11px] text-slate-500 font-mono truncate">
                {seller ? seller.email : 'aura@demandiq.com'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Demo Switcher */}
        <div className="pt-2 border-t border-slate-200">
          <div className="text-[11px] font-medium text-slate-500 mb-1.5 flex items-center gap-1">
            <ArrowRightLeft className="w-3 h-3 text-slate-400" />
            <span>Switch Seller Workspace:</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => switchSeller('seller_aura_1')}
              className={`px-2 py-1.5 text-[11px] rounded border transition-colors truncate ${
                seller?.id === 'seller_aura_1'
                  ? 'bg-teal-600 text-white border-teal-600 font-semibold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Aura Ethnic Wear"
            >
              Aura Ethnic
            </button>
            <button
              onClick={() => switchSeller('seller_kavitha_2')}
              className={`px-2 py-1.5 text-[11px] rounded border transition-colors truncate ${
                seller?.id === 'seller_kavitha_2'
                  ? 'bg-teal-600 text-white border-teal-600 font-semibold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Kavitha Silks"
            >
              Kavitha Silks
            </button>
          </div>
        </div>

        {/* Logout action */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-500 font-mono">INR (₹) Base</span>
          <button
            onClick={logout}
            className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

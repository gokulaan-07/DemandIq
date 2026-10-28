import React from 'react';
import { PlusCircle, Menu } from 'lucide-react';

interface TopBarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenNewOrderModal?: () => void;
  onToggleMobileMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewOrderModal,
  onToggleMobileMenu
}) => {
  return (
    <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-8 sticky top-0 z-20">
      {/* Zone 1: Single text element Brand Zone */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button 
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
          DemandIQ Studio
        </div>
      </div>

      {/* Zone 2: 4-5 clean single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-600">
        <button
          onClick={() => onSelectTab('overview')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            currentTab === 'overview' ? 'text-teal-700 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => onSelectTab('demandtruth')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            currentTab === 'demandtruth' ? 'text-teal-700 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          DemandTruth
        </button>
        <button
          onClick={() => onSelectTab('lost-demand')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            currentTab === 'lost-demand' ? 'text-teal-700 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          Lost Demand
        </button>
        <button
          onClick={() => onSelectTab('channel-profit')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            currentTab === 'channel-profit' ? 'text-teal-700 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          Channel Profit
        </button>
        <button
          onClick={() => onSelectTab('recommendations')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            currentTab === 'recommendations' ? 'text-teal-700 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          Recommendations
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenNewOrderModal}
          className="px-3.5 py-2 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Order Check</span>
        </button>
      </div>
    </header>
  );
};

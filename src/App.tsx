import React, { useState } from 'react';
import { AuthProvider, useAuth } from './lib/authContext.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { TopBar } from './components/layout/TopBar.tsx';
import { Overview } from './pages/Overview.tsx';
import { DemandTruth } from './pages/DemandTruth.tsx';
import { LostDemandRadar } from './pages/LostDemandRadar.tsx';
import { ChannelProfit } from './pages/ChannelProfit.tsx';
import { Recommendations } from './pages/Recommendations.tsx';
import { PrivacyLab } from './pages/PrivacyLab.tsx';
import { Reports } from './pages/Reports.tsx';
import { Settings } from './pages/Settings.tsx';
import { Architecture } from './pages/Architecture.tsx';
import { Login } from './pages/Login.tsx';
import { NewOrderModal } from './components/modules/NewOrderModal.tsx';

function MainApp() {
  const { seller, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 animate-spin flex items-center justify-center text-white font-bold">
            D
          </div>
          <span className="text-xs text-slate-500 font-mono">Loading DemandIQ Studio...</span>
        </div>
      </div>
    );
  }

  if (!seller) {
    return <Login />;
  }

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'overview':
        return <Overview onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'demandtruth':
        return <DemandTruth />;
      case 'lost-demand':
        return <LostDemandRadar />;
      case 'channel-profit':
        return <ChannelProfit />;
      case 'recommendations':
        return <Recommendations />;
      case 'privacy-lab':
        return <PrivacyLab />;
      case 'reports':
        return <Reports />;
      case 'architecture':
        return <Architecture />;
      case 'settings':
        return <Settings />;
      default:
        return <Overview onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-[#0F172A]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar 
          currentTab={currentTab} 
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} 
        />
      </div>

      {/* Mobile Sidebar Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <div className="relative z-10 w-64 bg-white h-full shadow-2xl">
            <Sidebar 
              currentTab={currentTab} 
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                setIsMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
            />
          </div>
        </div>
      )}

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenNewOrderModal={() => setIsNewOrderModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="flex-1">
          {renderActiveTab()}
        </main>
      </div>

      {/* New Order Modal */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        onOrderCreated={() => {
          // If on DemandTruth or Overview, refresh will happen via state/re-render
          if (currentTab !== 'demandtruth') {
            setCurrentTab('demandtruth');
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

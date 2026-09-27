import React from 'react';
import { Home, Search, Plus, Building2, LayoutDashboard } from 'lucide-react';

interface MobileBottomBarProps {
  currentTab: string;
  onSelectTab: (tab: string, param?: string) => void;
  onOpenSearch: () => void;
  onOpenSubmit: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearch,
  onOpenSubmit,
}) => {
  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] px-2 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* 1. HOME TAB */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`flex-1 min-h-[48px] min-w-[44px] flex flex-col items-center justify-center gap-1 rounded-xl transition-colors cursor-pointer touch-manipulation active:bg-slate-100 ${
            currentTab === 'home'
              ? 'text-[#EA580C] font-extrabold'
              : 'text-slate-500 hover:text-slate-800 font-semibold'
          }`}
          aria-label="Go to Home"
        >
          <div className="relative">
            <Home className="w-5 h-5" />
            {currentTab === 'home' && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
            )}
          </div>
          <span className="text-[11px] leading-none">Home</span>
        </button>

        {/* 2. SEARCH TAB */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex-1 min-h-[48px] min-w-[44px] flex flex-col items-center justify-center gap-1 rounded-xl text-slate-500 hover:text-slate-800 font-semibold transition-colors cursor-pointer touch-manipulation active:bg-slate-100"
          aria-label="Open Search"
        >
          <Search className="w-5 h-5" />
          <span className="text-[11px] leading-none">Search</span>
        </button>

        {/* 3. CENTER CONTRIBUTE / SHARE BUTTON (Elevated & Tactile) */}
        <div className="flex-1 min-w-[44px] flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenSubmit}
            className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-[#EA580C] active:bg-[#C2410C] text-white shadow-lg shadow-orange-500/30 -mt-5 border-4 border-[#FAF8F5] flex items-center justify-center transition-transform active:scale-90 cursor-pointer touch-manipulation"
            aria-label="Share interview experience"
            title="Share Interview Experience"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* 4. COMPANIES TAB */}
        <button
          type="button"
          onClick={() => onSelectTab('companies')}
          className={`flex-1 min-h-[48px] min-w-[44px] flex flex-col items-center justify-center gap-1 rounded-xl transition-colors cursor-pointer touch-manipulation active:bg-slate-100 ${
            currentTab === 'companies' || currentTab === 'company-detail'
              ? 'text-[#EA580C] font-extrabold'
              : 'text-slate-500 hover:text-slate-800 font-semibold'
          }`}
          aria-label="Go to Companies directory"
        >
          <div className="relative">
            <Building2 className="w-5 h-5" />
            {(currentTab === 'companies' || currentTab === 'company-detail') && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
            )}
          </div>
          <span className="text-[11px] leading-none">Companies</span>
        </button>

        {/* 5. DASHBOARD TAB */}
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className={`flex-1 min-h-[48px] min-w-[44px] flex flex-col items-center justify-center gap-1 rounded-xl transition-colors cursor-pointer touch-manipulation active:bg-slate-100 ${
            currentTab === 'dashboard'
              ? 'text-[#EA580C] font-extrabold'
              : 'text-slate-500 hover:text-slate-800 font-semibold'
          }`}
          aria-label="Go to My Dashboard"
        >
          <div className="relative">
            <LayoutDashboard className="w-5 h-5" />
            {currentTab === 'dashboard' && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
            )}
          </div>
          <span className="text-[11px] leading-none">Dashboard</span>
        </button>
      </div>
    </nav>
  );
};

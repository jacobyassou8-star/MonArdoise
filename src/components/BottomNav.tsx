import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { calculateOverdueInfo } from '../utils/formatters';
import { 
  BookOpen, 
  Package, 
  Plus, 
  Building2, 
  SlidersHorizontal 
} from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenNewTx: () => void;
  onOpenMore: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenNewTx,
  onOpenMore,
}) => {
  const { contacts, transactions, overdueSettings } = useApp();

  const overdueCount = useMemo(() => {
    return contacts.filter(
      (c) => calculateOverdueInfo(c.id, transactions, overdueSettings.thresholdDays).isOverdue
    ).length;
  }, [contacts, transactions, overdueSettings.thresholdDays]);

  return (
    <nav 
      aria-label="Navigation principale mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2">
        
        {/* Tab 1: Ardoise / Comptes */}
        <button
          onClick={() => onTabChange('accounts')}
          className={`relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            currentTab === 'accounts'
              ? 'text-slate-950 dark:text-white font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <BookOpen className={`w-5 h-5 ${currentTab === 'accounts' ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
            {overdueCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Ardoise</span>
        </button>


        {/* Tab 2: Stock & Ventes */}
        <button
          onClick={() => onTabChange('stock')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            currentTab === 'stock'
              ? 'text-slate-950 dark:text-white font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Package className={`w-5 h-5 ${currentTab === 'stock' ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight mt-1">Stock/Vente</span>
        </button>

        {/* Tab 3: Action Center CTA */}
        <div className="flex items-center justify-center -mt-4">
          <button
            onClick={onOpenNewTx}
            className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform"
            aria-label="Enregistrer une nouvelle opération"
            title="Nouvelle opération"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 4: Boutiques & Équipe */}
        <button
          onClick={() => onTabChange('boutiques')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            currentTab === 'boutiques'
              ? 'text-slate-950 dark:text-white font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className={`w-5 h-5 ${currentTab === 'boutiques' ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight mt-1">Boutiques</span>
        </button>

        {/* Tab 5: Menu & Options */}
        <button
          onClick={onOpenMore}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            currentTab === 'more'
              ? 'text-slate-950 dark:text-white font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] tracking-tight mt-1">Menu</span>
        </button>

      </div>
    </nav>
  );
};

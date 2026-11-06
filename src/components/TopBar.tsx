import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { calculateOverdueInfo } from '../utils/formatters';
import { 
  Store, 
  ShieldCheck, 
  UserCheck, 
  Smartphone, 
  Monitor, 
  Tag, 
  CreditCard, 
  RotateCcw,
  Building2,
  ChevronDown,
  Download,
  AlertTriangle
} from 'lucide-react';


interface TopBarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenNewTx: () => void;
  onOpenPricing: () => void;
  onOpenPayments: () => void;
  onOpenExport?: () => void;
  onOpenReset?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onTabChange,
  onOpenNewTx,
  onOpenPricing,
  onOpenPayments,
  onOpenExport,
  onOpenReset,
}) => {
  const { 
    merchant, 
    boutiques, 
    activeBoutiqueId, 
    setActiveBoutiqueId, 
    currentUser, 
    switchUserRole,
    deviceMode,
    setDeviceMode,
    deviceType,
    setDeviceType,
    resetToDemo,
    clearAllData,
    contacts,
    transactions,
    overdueSettings
  } = useApp();

  const [showBoutiqueMenu, setShowBoutiqueMenu] = useState(false);

  const overdueCount = useMemo(() => {
    return contacts.filter(
      (c) => calculateOverdueInfo(c.id, transactions, overdueSettings.thresholdDays).isOverdue
    ).length;
  }, [contacts, transactions, overdueSettings.thresholdDays]);


  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
        
        {/* Zone 1: Brand wordmark & Boutique Switcher */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-950 dark:bg-white flex items-center justify-center text-white dark:text-slate-950 font-bold shadow-xs">
              <span className="text-sm sm:text-base font-black tracking-tight">MA</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight leading-none">
                MonArdoise
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[120px] sm:max-w-[180px]">
                {merchant.businessName}
              </span>
            </div>
          </div>

          {/* Boutique dropdown selector */}
          <div className="relative">
            <button
              onClick={() => setShowBoutiqueMenu(!showBoutiqueMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors max-w-[140px] sm:max-w-[210px] truncate"
              title="Changer de boutique active"
            >
              <Store className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 shrink-0" />
              <span className="truncate">
                {activeBoutiqueId === 'all' 
                  ? 'Toutes boutiques' 
                  : boutiques.find(b => b.id === activeBoutiqueId)?.name || 'Boutique'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {showBoutiqueMenu && (
              <div 
                className="absolute left-0 mt-1.5 w-60 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowBoutiqueMenu(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Boutique de l'espace
                </div>
                <button
                  onClick={() => setActiveBoutiqueId('all')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${
                    activeBoutiqueId === 'all'
                      ? 'bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Vue globale (Toutes)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{boutiques.length}</span>
                </button>
                {boutiques.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setActiveBoutiqueId(b.id)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${
                      activeBoutiqueId === b.id
                        ? 'bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                      <span className="truncate">{b.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone 2: Navigation Links for medium/large desktop */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => onTabChange('accounts')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'accounts'
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            <span>Comptes & Ardoises</span>
            {overdueCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-xs">
                {overdueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('stock')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'stock'
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            Ventes & Stock
          </button>
          <button
            onClick={() => onTabChange('boutiques')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'boutiques'
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            Boutiques & Équipe
          </button>
          <button
            onClick={() => onTabChange('audit')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'audit'
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            Journal d'audit
          </button>
          <button
            onClick={onOpenPricing}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors whitespace-nowrap"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Offre -20%</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Role Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Quick Payment Info trigger */}
          <button
            onClick={onOpenPayments}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Gérer vos comptes de paiement marchand (Wave, Orange Money, MoMo)"
          >
            <CreditCard className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span className="hidden lg:inline">Paiements Marchand</span>
          </button>

          {/* Export Data trigger */}
          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Exporter mes données (CSV ou PDF)"
            >
              <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span className="hidden lg:inline">Exporter</span>
            </button>
          )}

          {/* Role badge with instant click-to-switch */}
          <button
            onClick={switchUserRole}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentUser.role === 'gerant'
                ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60'
                : 'bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700/60'
            }`}
            title={`Connecté en tant que ${currentUser.name} (${currentUser.role === 'gerant' ? 'Gérant : peut corriger/annuler' : 'Employé : saisie uniquement'}). Cliquez pour basculer le rôle.`}
          >
            {currentUser.role === 'gerant' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            ) : (
              <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            )}
            <div className="flex flex-col text-left leading-none">
              <span className="font-bold text-[11px] truncate max-w-[80px] sm:max-w-[100px]">
                {currentUser.name}
              </span>
              <span className="text-[9px] opacity-75">
                {currentUser.role === 'gerant' ? 'Gérant (Audit OK)' : 'Employé (Saisie)'}
              </span>
            </div>
          </button>

          {/* Device viewport preview toggle */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setDeviceMode('frame')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                deviceMode === 'frame'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Aperçu mobile smartphone (iPhone / Android)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceMode('responsive')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                deviceMode === 'responsive'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Vue plein écran responsive"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick primary "+ Opération" CTA */}
          <button
            onClick={onOpenNewTx}
            className="px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-transform active:scale-95 whitespace-nowrap"
          >
            + Opération
          </button>

          {/* Clear all data button */}
          <button
            onClick={() => {
              if (onOpenReset) {
                onOpenReset();
              } else {
                clearAllData();
              }
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            title="Réinitialiser toutes les données de l'application (Double confirmation)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};

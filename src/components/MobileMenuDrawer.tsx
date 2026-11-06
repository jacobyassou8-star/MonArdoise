import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Tag, 
  CreditCard, 
  FileCheck, 
  ShieldCheck, 
  RotateCcw, 
  Store, 
  Smartphone, 
  Building2, 
  PhoneCall,
  Moon,
  Sun,
  Download,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface MobileMenuDrawerProps {
  onClose: () => void;
  onOpenPricing: () => void;
  onOpenPayments: () => void;
  onOpenKyc: () => void;
  onOpenAudit: () => void;
  onOpenExport: () => void;
  onOpenReset: () => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  onClose,
  onOpenPricing,
  onOpenPayments,
  onOpenKyc,
  onOpenAudit,
  onOpenExport,
  onOpenReset,
}) => {
  const { 
    merchant, 
    boutiques, 
    currentUser, 
    switchUserRole, 
    resetToDemo,
    clearAllData,
    deviceType,
    setDeviceType
  } = useApp();

  const [confirmWipe, setConfirmWipe] = React.useState(false);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-black text-sm">
                MA
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                  MonArdoise Mobile
                </h3>
                <span className="text-[11px] text-slate-500">{merchant.businessName}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current profile & Role switcher */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/70">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Session active & Autorisations
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {currentUser.name}
                </div>
                <div className="text-xs text-slate-500">
                  Rôle : <strong className={currentUser.role === 'gerant' ? 'text-amber-600' : 'text-blue-600'}>
                    {currentUser.role === 'gerant' ? 'Gérant (Audit & Annulation)' : 'Employé (Saisie uniquement)'}
                  </strong>
                </div>
              </div>
              <button
                onClick={switchUserRole}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs"
              >
                Changer rôle
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-3 space-y-1 text-xs">
            
            {/* Tarifs -20% */}
            <button
              onClick={() => { onClose(); onOpenPricing(); }}
              className="w-full p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-bold text-emerald-950 dark:text-emerald-100">
                    Tarifs de lancement (-20%)
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-300">
                    Formule Pro à 12 000 FCFA au lieu de 15 000 FCFA
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded-full">
                -20%
              </span>
            </button>

            {/* Paiements Marchands */}
            <button
              onClick={() => { onClose(); onOpenPayments(); }}
              className="w-full p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left flex items-center gap-2.5 text-slate-800 dark:text-slate-200 transition-colors"
            >
              <CreditCard className="w-4 h-4 text-slate-500" />
              <div>
                <div className="font-bold">Comptes Marchands (Wave, OM, MoMo)</div>
                <div className="text-[10px] text-slate-400">Paiements directs sans intermédiaire</div>
              </div>
            </button>

            {/* Journal d'Audit */}
            <button
              onClick={() => { onClose(); onOpenAudit(); }}
              className="w-full p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left flex items-center gap-2.5 text-slate-800 dark:text-slate-200 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <div>
                <div className="font-bold">Journal d'audit & Annulations</div>
                <div className="text-[10px] text-slate-400">Traçabilité complète des corrections</div>
              </div>
            </button>

            {/* Exporter mes données (CSV / PDF) */}
            <button
              onClick={() => { onClose(); onOpenExport(); }}
              className="w-full p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left flex items-center justify-between text-slate-800 dark:text-slate-200 transition-colors border border-slate-200/80 dark:border-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Exporter mes données</div>
                  <div className="text-[10px] text-slate-400">Transactions et carnet au format CSV ou PDF</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                CSV / PDF
              </span>
            </button>

            {/* Conformité / KYC */}
            <button
              onClick={() => { onClose(); onOpenKyc(); }}
              className="w-full p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left flex items-center gap-2.5 text-slate-800 dark:text-slate-200 transition-colors"
            >
              <FileCheck className="w-4 h-4 text-blue-500" />
              <div>
                <div className="font-bold">Conformité administrative & RCCM</div>
                <div className="text-[10px] text-slate-400">Pièces demandées uniquement si nécessaire</div>
              </div>
            </button>

            {/* Configuration : Réinitialisation avec double confirmation */}
            <button
              onClick={() => { onClose(); onOpenReset(); }}
              className="w-full p-3 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left flex items-center justify-between text-slate-800 dark:text-slate-200 transition-colors border border-rose-200/80 dark:border-rose-900/40 mt-1"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-rose-700 dark:text-rose-400">Réinitialiser toutes les données</div>
                  <div className="text-[10px] text-slate-400">Double confirmation obligatoire requise</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                2 étapes
              </span>
            </button>

            {/* Device Switcher in drawer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-3 mb-1.5">
                Cible mobile de test
              </span>
              <div className="grid grid-cols-2 gap-2 px-1">
                <button
                  onClick={() => setDeviceType('iphone')}
                  className={`p-2 rounded-xl text-center border text-[11px] font-semibold ${
                    deviceType === 'iphone'
                      ? 'border-slate-950 dark:border-white bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600'
                  }`}
                >
                  iPhone iOS
                </button>
                <button
                  onClick={() => setDeviceType('android')}
                  className={`p-2 rounded-xl text-center border text-[11px] font-semibold ${
                    deviceType === 'android'
                      ? 'border-slate-950 dark:border-white bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600'
                  }`}
                >
                  Android
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button
            onClick={() => { onClose(); onOpenReset(); }}
            className="w-full py-2.5 px-3 rounded-2xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Réinitialiser les données (Double confirmation)</span>
          </button>
        </div>

      </div>
    </div>
  );
};

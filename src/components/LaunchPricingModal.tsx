import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Tag, 
  Check, 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  Zap, 
  CreditCard 
} from 'lucide-react';

interface LaunchPricingModalProps {
  onClose: () => void;
}

export const LaunchPricingModal: React.FC<LaunchPricingModalProps> = ({ onClose }) => {
  const { merchant, updateMerchant, showToast } = useApp();

  const handleSelectPlan = (plan: 'starter' | 'pro' | 'reseau') => {
    updateMerchant({ plan });
    showToast(`Formule ${plan.toUpperCase()} activée avec la réduction de lancement de 20% !`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/40">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 mb-2">
              <Tag className="w-3.5 h-3.5" />
              <span>OFFRE OFFICIELLE DE LANCEMENT (-20%)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Tarifs de lancement de MonArdoise
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
              Conformément aux engagements du lancement, tous les tarifs d'abonnement bénéficient d'une <strong>remise immédiate de 20 %</strong> par rapport aux tarifs standards prévus.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: 3 Tier Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Plan 1: Starter */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
              merchant.plan === 'starter'
                ? 'border-slate-950 dark:border-white ring-2 ring-slate-950 dark:ring-white bg-slate-50/50 dark:bg-slate-850'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
            }`}>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Démarrage
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  1 Boutique
                </h4>
                <div className="mt-3">
                  <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                    4 800 FCFA
                    <span className="text-xs font-normal text-slate-400"> /mois</span>
                  </div>
                  <div className="text-xs text-slate-400 line-through mt-0.5">
                    Tarif standard : 6 000 FCFA/mois
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Économie : -20% de lancement
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>1 Boutique ou point de vente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Jusqu'à 2 employés</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Carnet d'ardoise & clients illimités</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Relances WhatsApp automatiques</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan('starter')}
                className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${
                  merchant.plan === 'starter'
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white'
                }`}
              >
                {merchant.plan === 'starter' ? 'Formule actuelle' : 'Choisir Starter'}
              </button>
            </div>

            {/* Plan 2: Pro Multi-Boutiques (Featured) */}
            <div className={`p-5 rounded-2xl border-2 flex flex-col justify-between relative shadow-lg ${
              merchant.plan === 'pro'
                ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                : 'border-emerald-500/80 bg-white dark:bg-slate-900'
            }`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                Formule Recommandée
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Commerce Pro Multi-Boutiques
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Réseau de Boutiques
                </h4>
                <div className="mt-3">
                  <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                    12 000 FCFA
                    <span className="text-xs font-normal text-slate-400"> /mois</span>
                  </div>
                  <div className="text-xs text-slate-400 line-through mt-0.5">
                    Tarif standard : 15 000 FCFA/mois
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Économie : 3 000 FCFA/mois (-20%)
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>Jusqu'à 5 boutiques & dépôts</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>Comptes clients partagés dans tout l'espace</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Collaborateurs illimités (Gérants & Vendeurs)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>Journal d'audit & sécurité annulation</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Module complet Ventes & Stock</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Intégration Wave, Orange Money, MoMo</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan('pro')}
                className="mt-6 w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-transform active:scale-95 shadow-md shadow-emerald-600/20"
              >
                {merchant.plan === 'pro' ? 'Formule active (Conseillée)' : 'Souscrire à Pro (-20%)'}
              </button>
            </div>

            {/* Plan 3: Réseau & Gros */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
              merchant.plan === 'reseau'
                ? 'border-slate-950 dark:border-white ring-2 ring-slate-950 dark:ring-white bg-slate-50/50 dark:bg-slate-850'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
            }`}>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Grossistes & Enseignes
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Réseau Illimité
                </h4>
                <div className="mt-3">
                  <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                    24 000 FCFA
                    <span className="text-xs font-normal text-slate-400"> /mois</span>
                  </div>
                  <div className="text-xs text-slate-400 line-through mt-0.5">
                    Tarif standard : 30 000 FCFA/mois
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Économie : 6 000 FCFA/mois (-20%)
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Boutiques & entrepôts illimités</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Multi-gérants avec matrice de droits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Export comptable Excel / FEC / CSV</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Assistance téléphonique dédiée 7j/7</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan('reseau')}
                className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${
                  merchant.plan === 'reseau'
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white'
                }`}
              >
                {merchant.plan === 'reseau' ? 'Formule actuelle' : 'Choisir Réseau'}
              </button>
            </div>

          </div>

          {/* Guarantee Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Sans engagement de durée · Règlement mensuel ou trimestriel par Wave / Orange Money</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Prix bloqué à vie</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-950 text-white dark:bg-white dark:text-slate-950"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Lock, 
  FileWarning 
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface ResetDataModalProps {
  onClose: () => void;
}

export const ResetDataModal: React.FC<ResetDataModalProps> = ({ onClose }) => {
  const { 
    transactions, 
    contacts, 
    products, 
    merchant, 
    totalReceivables, 
    clearAllData, 
    showToast 
  } = useApp();

  // 2-step confirmation state
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [understoodCheckbox, setUnderstoodCheckbox] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const REQUIRED_KEYWORD = 'SUPPRIMER';
  const isKeywordMatching = confirmationInput.trim().toUpperCase() === REQUIRED_KEYWORD;
  const isFinalStepValid = isKeywordMatching && understoodCheckbox;

  const handleFinalReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFinalStepValid) {
      setError(`Veuillez saisir exactement "${REQUIRED_KEYWORD}" et cocher la case d'attestation.`);
      return;
    }

    clearAllData();
    showToast('Toutes les données ont été réinitialisées avec succès.', 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-rose-50/60 dark:bg-rose-950/30">
          <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Réinitialisation des données
              </h3>
              <p className="text-[11px] text-rose-700 dark:text-rose-300">
                {step === 1 ? 'Étape 1 sur 2 : Avertissement & inventaire' : 'Étape 2 sur 2 : Double confirmation obligatoire'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
          
          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-2 pb-1">
            <div className={`h-1.5 rounded-full flex-1 transition-all ${
              step >= 1 ? 'bg-rose-600' : 'bg-slate-200 dark:bg-slate-700'
            }`} />
            <div className={`h-1.5 rounded-full flex-1 transition-all ${
              step >= 2 ? 'bg-rose-600' : 'bg-slate-200 dark:bg-slate-700'
            }`} />
          </div>

          {step === 1 ? (
            /* STEP 1: WARNING AND IMPACT SUMMARY */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-rose-800 dark:text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Action irréversible sur votre espace</span>
                </div>
                <p className="text-[11px] leading-relaxed text-rose-800 dark:text-rose-300">
                  Cette procédure efface l'intégralité des écritures commerciales, des créances en cours et des fiches clients de votre application. Aucune restauration automatique ne sera possible.
                </p>
              </div>

              {/* Data Inventory to be wiped */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Données qui seront effacées :
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-400 text-[10px]">Transactions d'ardoise</div>
                    <div className="text-base font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                      {transactions.length} enregistrée{transactions.length > 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-400 text-[10px]">Comptes clients & tiers</div>
                    <div className="text-base font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                      {contacts.length} personne{contacts.length > 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-400 text-[10px]">Créances en cours</div>
                    <div className="text-base font-bold text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
                      {formatCurrency(totalReceivables, merchant.currency)}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-400 text-[10px]">Articles de stock</div>
                    <div className="text-base font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                      {products.length} référence{products.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white transition-transform active:scale-95 shadow-md shadow-rose-600/20"
                >
                  <span>Continuer vers la confirmation finale</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: MANDATORY DOUBLE-CONFIRMATION (KEYWORD + CHECKBOX) */
            <form onSubmit={handleFinalReset} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-2 text-xs">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Sécurité anti-suppression accidentelle</strong>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                    Pour valider la remise à zéro définitive, veuillez taper le mot de déverrouillage ci-dessous et cocher la confirmation.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
                  {error}
                </div>
              )}

              {/* Keyword entry */}
              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  1. Saisissez le mot <span className="font-mono font-bold text-rose-600">{REQUIRED_KEYWORD}</span> pour déverrouiller :
                </label>
                <input
                  type="text"
                  autoFocus
                  value={confirmationInput}
                  onChange={(e) => {
                    setConfirmationInput(e.target.value);
                    setError(null);
                  }}
                  placeholder="Tapez SUPPRIMER en majuscules"
                  className="w-full p-3 text-sm font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                {confirmationInput && !isKeywordMatching && (
                  <span className="text-[10px] text-rose-500 mt-1 block">
                    Le mot saisi ne correspond pas exactement à "{REQUIRED_KEYWORD}".
                  </span>
                )}
                {isKeywordMatching && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mot-clé vérifié
                  </span>
                )}
              </div>

              {/* Mandatory Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={understoodCheckbox}
                    onChange={(e) => {
                      setUnderstoodCheckbox(e.target.checked);
                      setError(null);
                    }}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 mt-0.5 cursor-pointer"
                  />
                  <span className="text-slate-700 dark:text-slate-300 leading-snug">
                    Je confirme être le gérant de l'établissement et certifie vouloir <strong>réinitialiser l'ensemble des données</strong> de l'application.
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour</span>
                </button>

                <button
                  type="submit"
                  disabled={!isFinalStepValid}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white transition-all disabled:opacity-30 disabled:pointer-events-none shadow-md shadow-rose-600/30 active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Réinitialiser définitivement</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

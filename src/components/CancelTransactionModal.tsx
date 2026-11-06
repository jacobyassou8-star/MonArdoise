import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction } from '../types';
import { 
  formatCurrency, 
  formatDateTime, 
  getTransactionTypeLabel 
} from '../utils/formatters';
import { 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface CancelTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
  onSuccess: () => void;
}

export const CancelTransactionModal: React.FC<CancelTransactionModalProps> = ({
  transaction,
  onClose,
  onSuccess,
}) => {
  const { currentUser, merchant, boutiques, cancelTransaction } = useApp();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const typeInfo = getTransactionTypeLabel(transaction.type);
  const boutique = boutiques.find((b) => b.id === transaction.boutiqueId);
  const isGerant = currentUser.role === 'gerant';

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isGerant) {
      setError("Action refusée : Seul un utilisateur ayant le rôle 'Gérant' peut annuler ou corriger une opération.");
      return;
    }

    if (!reason || reason.trim().length < 5) {
      setError("Le motif d'annulation doit comporter au moins 5 caractères.");
      return;
    }

    const res = cancelTransaction(transaction.id, reason);
    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || 'Erreur lors de l’annulation');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Annulation & Audit d'opération
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          
          {/* Target transaction summary */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">
                {typeInfo.label} ({transaction.receiptNumber})
              </span>
              <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                {formatCurrency(transaction.amount, merchant.currency)}
              </span>
            </div>
            <div className="text-slate-500">
              {transaction.description || 'Sans description'}
            </div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between">
              <span>Boutique : {boutique?.name || 'Inconnue'}</span>
              <span>Enregistré le : {formatDateTime(transaction.timestamp)}</span>
            </div>
          </div>

          {/* Role Check Box */}
          {!isGerant ? (
            /* Restricted for Employee */
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold text-xs sm:text-sm">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Accès Restreint : Réservé au Gérant</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                Vous êtes actuellement identifié comme <strong>{currentUser.name}</strong> avec le rôle <strong>Employé</strong>.
                Conformément aux règles de sécurité de MonArdoise, seuls les gérants de boutique peuvent annuler ou rectifier des transactions afin d'éviter les fraudes en caisse.
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                💡 Pour tester cette fonctionnalité en mode démonstration, basculez votre rôle sur <strong>Gérant</strong> depuis la barre supérieure.
              </p>
            </div>
          ) : (
            /* Allowed for Manager with mandatory trace */
            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Autorisation Gérant confirmée ({currentUser.name})</strong>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                    L'opération d'origine sera conservée dans le registre d'audit avec votre nom et le motif, et le solde du client sera rectifié immédiatement.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Motif obligatoire d'annulation / correction <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex : Erreur de saisie du montant par le vendeur, transaction enregistrée en double..."
                  className="w-full p-3 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
                <span className="text-[11px] text-slate-400">
                  Ce motif restera gravé dans le journal d'audit de votre espace commerçant.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Abandonner
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-transform active:scale-95"
                >
                  Confirmer l'annulation (Gérant)
                </button>
              </div>
            </form>
          )}

          {!isGerant && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200"
              >
                Fermer
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

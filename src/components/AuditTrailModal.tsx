import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction } from '../types';
import { 
  formatCurrency, 
  formatDateTime, 
  formatFullDateTime, 
  getTransactionTypeLabel 
} from '../utils/formatters';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Building2, 
  User, 
  Ban, 
  CheckCircle2, 
  FileSpreadsheet, 
  Receipt,
  X
} from 'lucide-react';

interface AuditTrailModalProps {
  onClose?: () => void;
  onViewReceipt: (tx: Transaction) => void;
}

export const AuditTrailView: React.FC<AuditTrailModalProps> = ({ onClose, onViewReceipt }) => {
  const { transactions, boutiques, contacts, merchant, currentUser } = useApp();
  const [filter, setFilter] = useState<'all' | 'cancelled' | 'active'>('all');

  const filteredTx = transactions
    .filter((t) => {
      if (filter === 'all') return true;
      if (filter === 'cancelled') return t.status === 'cancelled';
      if (filter === 'active') return t.status === 'active';
      return true;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const cancelledCount = transactions.filter((t) => t.status === 'cancelled').length;

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Journal d'Audit & Sécurité des Opérations
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Registre infalsifiable : toute opération conserve sa boutique, son auteur et ses éventuelles annulations.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Toutes ({transactions.length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'cancelled'
                ? 'bg-rose-600 text-white shadow-xs font-bold'
                : 'text-rose-600 dark:text-rose-400 hover:text-rose-800'
            }`}
          >
            Annulées & Audit ({cancelledCount})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'active'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Actives ({transactions.length - cancelledCount})
          </button>
        </div>
      </div>

      {/* Audit Log Table / Cards */}
      <div className="space-y-2.5">
        {filteredTx.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            Aucune opération dans cette section du journal d'audit.
          </div>
        ) : (
          filteredTx.map((tx) => {
            const boutique = boutiques.find((b) => b.id === tx.boutiqueId);
            const contact = contacts.find((c) => c.id === tx.personId);
            const isCancelled = tx.status === 'cancelled';
            const typeInfo = getTransactionTypeLabel(tx.type);

            return (
              <div
                key={tx.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCancelled
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  
                  {/* Left: Transaction details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-bold ${isCancelled ? 'line-through text-slate-400' : typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {tx.receiptNumber}
                      </span>
                      {isCancelled ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                          ANNULÉE PAR GÉRANT
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200">
                          VALIDE
                        </span>
                      )}
                    </div>

                    <div className={`text-xs font-medium ${isCancelled ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                      {contact ? `${contact.name} (${contact.phone})` : 'Client de passage'} — {tx.description}
                    </div>

                    {/* Attribution & Timestamp info */}
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatFullDateTime(tx.timestamp)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Auteur : <strong>{tx.authorName}</strong> ({tx.authorRole})
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        Boutique : <strong>{boutique?.name || 'Inconnue'}</strong>
                      </span>
                    </div>

                    {/* Cancellation reason and author trace */}
                    {isCancelled && tx.cancelledBy && (
                      <div className="mt-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                          <ShieldAlert className="w-4 h-4" />
                          <span>Annulée par le Gérant {tx.cancelledBy.name}</span>
                        </div>
                        <div>
                          <strong>Motif d'audit obligatoire :</strong> {tx.cancelReason}
                        </div>
                        {tx.cancelledAt && (
                          <div className="text-[11px] text-slate-400 font-mono">
                            Date d'annulation : {formatFullDateTime(tx.cancelledAt)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Amount & Receipt trigger */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className={`text-base sm:text-lg font-bold tabular-nums ${isCancelled ? 'line-through text-slate-400' : typeInfo.color}`}>
                      {typeInfo.sign}{formatCurrency(tx.amount, merchant.currency)}
                    </div>

                    <button
                      onClick={() => onViewReceipt(tx)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                      title="Voir le reçu"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Ticket</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

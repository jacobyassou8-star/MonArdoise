import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Contact, Transaction } from '../types';
import { 
  calculateContactBalance, 
  formatCurrency, 
  formatDateTime, 
  getBalanceDisplay, 
  getContactTypeLabel, 
  getPaymentMethodLabel, 
  getTransactionTypeLabel, 
  generateWhatsAppReminderUrl 
} from '../utils/formatters';
import { 
  X, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Plus, 
  Receipt, 
  AlertCircle, 
  FileText, 
  ShieldAlert, 
  Building2, 
  Clock, 
  User, 
  CheckCircle2, 
  Ban,
  Share2
} from 'lucide-react';

interface AccountDetailModalProps {
  contact: Contact;
  onClose: () => void;
  onNewTx: (contact: Contact) => void;
  onViewReceipt: (tx: Transaction) => void;
  onRequestCancel: (tx: Transaction) => void;
}

export const AccountDetailModal: React.FC<AccountDetailModalProps> = ({
  contact,
  onClose,
  onNewTx,
  onViewReceipt,
  onRequestCancel,
}) => {
  const { 
    transactions, 
    merchant, 
    boutiques, 
    currentUser, 
    showToast 
  } = useApp();

  const [filterType, setFilterType] = useState<string>('all');

  // Unified balance across all boutiques
  const totalBalance = useMemo(() => {
    return calculateContactBalance(contact.id, transactions);
  }, [contact.id, transactions]);

  const balanceDisplay = getBalanceDisplay(totalBalance, merchant.currency, contact.type);

  // Per-boutique breakdown
  const boutiqueBreakdowns = useMemo(() => {
    return boutiques.map((b) => ({
      boutique: b,
      balance: calculateContactBalance(contact.id, transactions, b.id),
      txCount: transactions.filter((t) => t.personId === contact.id && t.boutiqueId === b.id).length,
    }));
  }, [boutiques, contact.id, transactions]);

  // All transactions for this person (active and cancelled)
  const contactTransactions = useMemo(() => {
    return transactions
      .filter((t) => t.personId === contact.id)
      .filter((t) => {
        if (filterType === 'all') return true;
        if (filterType === 'active') return t.status === 'active';
        if (filterType === 'cancelled') return t.status === 'cancelled';
        if (filterType === 'credit') return t.type === 'vente_credit' || t.type === 'pret_accorde';
        if (filterType === 'versement') return t.type === 'versement' || t.type === 'remboursement';
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [contact.id, transactions, filterType]);

  const copyStatementText = () => {
    const lines = [
      `📋 RELEVÉ DE COMPTE - ${contact.name.toUpperCase()}`,
      `Commerce : ${merchant.businessName}`,
      `Date : ${new Date().toLocaleDateString('fr-FR')}`,
      `Solde global : ${formatCurrency(totalBalance, merchant.currency)} (${balanceDisplay.sublabel})`,
      `---------------------------------------`,
      ...contactTransactions.slice(0, 10).map((t) => {
        const typeInfo = getTransactionTypeLabel(t.type);
        const b = boutiques.find((item) => item.id === t.boutiqueId)?.name || 'Boutique';
        return `${formatDateTime(t.timestamp)} | ${typeInfo.label} : ${formatCurrency(t.amount, merchant.currency)} [${b}] ${t.status === 'cancelled' ? '(ANNULÉE)' : ''}`;
      }),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    showToast('Relevé copié dans le presse-papier');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 bg-slate-50/50 dark:bg-slate-850/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                {getContactTypeLabel(contact.type)}
              </span>
              <span className="text-xs text-slate-400">Compte unifié multi-boutiques</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {contact.name}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {contact.phone}
              </span>
              {contact.address && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {contact.address}
                  </span>
                </>
              )}
              {contact.rccm && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>RCCM: {contact.rccm}</span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Main Balance Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="text-xs text-slate-400 dark:text-slate-600 font-medium">
                Solde actuel commun (Toutes boutiques)
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight tabular-nums mt-0.5">
                {totalBalance > 0 ? `+${formatCurrency(totalBalance, merchant.currency)}` : formatCurrency(totalBalance, merchant.currency)}
              </div>
              <div className="text-xs text-slate-300 dark:text-slate-700 mt-1">
                {balanceDisplay.sublabel}
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onNewTx(contact)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-transform active:scale-95 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>+ Opération</span>
              </button>

              {totalBalance > 0 && (
                <a
                  href={generateWhatsAppReminderUrl(contact, totalBalance, merchant.businessName, merchant.currency)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-emerald-500/20 text-emerald-300 dark:text-emerald-700 hover:bg-emerald-500/30 transition-colors"
                  title="Envoyer un rappel de solde sur WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Rappel WhatsApp</span>
                </a>
              )}

              <button
                onClick={copyStatementText}
                className="p-2.5 rounded-xl bg-white/10 dark:bg-slate-200 text-white dark:text-slate-900 hover:bg-white/20 transition-colors"
                title="Copier le relevé"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Multi-boutique balance breakdown */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Répartition par boutique (Compte commun)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {boutiqueBreakdowns.map(({ boutique, balance, txCount }) => (
                <div
                  key={boutique.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: boutique.color }} />
                    <span className="truncate">{boutique.name}</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                      {formatCurrency(balance, merchant.currency)}
                    </span>
                    <span className="text-[10px] text-slate-400">{txCount} op.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Credit Limit Alert if set */}
          {contact.creditLimit && contact.creditLimit > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className={`w-4 h-4 ${totalBalance > contact.creditLimit ? 'text-rose-500' : 'text-slate-400'}`} />
                <span>
                  Plafond de crédit autorisé : <strong>{formatCurrency(contact.creditLimit, merchant.currency)}</strong>
                </span>
              </div>
              <span className={`font-semibold ${totalBalance > contact.creditLimit ? 'text-rose-600' : 'text-slate-500'}`}>
                {totalBalance > contact.creditLimit ? '⚠️ Plafond dépassé !' : 'Plafond respecté'}
              </span>
            </div>
          )}

          {/* Transactions History Header & Filters */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Historique complet des opérations ({contactTransactions.length})
                </h4>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-1 text-[11px] overflow-x-auto">
                {[
                  { id: 'all', label: 'Toutes' },
                  { id: 'credit', label: 'Crédits' },
                  { id: 'versement', label: 'Versements' },
                  { id: 'cancelled', label: 'Annulées' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                      filterType === f.id
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Transactions */}
            <div className="space-y-2">
              {contactTransactions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  Aucune opération pour ce filtre.
                </div>
              ) : (
                contactTransactions.map((tx) => {
                  const typeInfo = getTransactionTypeLabel(tx.type);
                  const boutique = boutiques.find((b) => b.id === tx.boutiqueId);
                  const isCancelled = tx.status === 'cancelled';

                  return (
                    <div
                      key={tx.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isCancelled
                          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 opacity-80'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          
                          {/* Operation Title & Status */}
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${isCancelled ? 'line-through text-slate-400' : typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                            {isCancelled && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-200">
                                Opération Annulée
                              </span>
                            )}
                            <span className="text-[11px] font-mono text-slate-400">
                              {tx.receiptNumber}
                            </span>
                          </div>

                          {/* Description & items */}
                          <div className={`text-xs ${isCancelled ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {tx.description || 'Opération enregistrée sans note'}
                          </div>

                          {/* Items details if sales */}
                          {tx.items && tx.items.length > 0 && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              Articles : {tx.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                            </div>
                          )}

                          {/* Horodatage & Attribution: Date, Time, Author, Boutique */}
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {formatDateTime(tx.timestamp)}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              {tx.authorName} ({tx.authorRole === 'gerant' ? 'Gérant' : 'Employé'})
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {boutique?.name || 'Boutique'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{getPaymentMethodLabel(tx.paymentMethod)}</span>
                          </div>

                          {/* Cancellation Audit Trail Details */}
                          {isCancelled && tx.cancelledBy && (
                            <div className="mt-2 p-2 rounded-lg bg-rose-100/70 dark:bg-rose-900/40 text-[11px] text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800/60">
                              <div className="font-semibold flex items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                <span>Trace d'audit : Annulé par le Gérant {tx.cancelledBy.name}</span>
                              </div>
                              <div className="mt-0.5 text-rose-700 dark:text-rose-300">
                                <strong>Motif :</strong> {tx.cancelReason}
                              </div>
                              {tx.cancelledAt && (
                                <div className="text-[10px] text-rose-500 mt-0.5">
                                  Horodatage d'annulation : {formatDateTime(tx.cancelledAt)}
                                </div>
                              )}
                            </div>
                          )}

                        </div>

                        {/* Amount & action buttons */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <div className={`text-sm sm:text-base font-bold tabular-nums ${isCancelled ? 'line-through text-slate-400' : typeInfo.color}`}>
                            {typeInfo.sign}{formatCurrency(tx.amount, merchant.currency)}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onViewReceipt(tx)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Voir le reçu"
                            >
                              <Receipt className="w-4 h-4" />
                            </button>

                            {/* Cancel button: if not already cancelled */}
                            {!isCancelled && (
                              <button
                                onClick={() => onRequestCancel(tx)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  currentUser.role === 'gerant'
                                    ? 'text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                                    : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'
                                }`}
                                title={
                                  currentUser.role === 'gerant'
                                    ? "Annuler l'opération (Réservé au gérant)"
                                    : "Annulation restreinte (Réservé au gérant)"
                                }
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs text-slate-500">
          <span>{contactTransactions.filter(t => t.status === 'active').length} opérations actives</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

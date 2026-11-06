import React from 'react';
import { useApp } from '../context/AppContext';
import { Transaction } from '../types';
import { 
  formatCurrency, 
  formatFullDateTime, 
  getContactTypeLabel, 
  getPaymentMethodLabel, 
  getTransactionTypeLabel, 
  generateReceiptShareText 
} from '../utils/formatters';
import { 
  X, 
  Printer, 
  Share2, 
  MessageSquare, 
  CheckCircle, 
  Building2, 
  User, 
  Clock 
} from 'lucide-react';

interface TransactionReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  transaction,
  onClose,
}) => {
  const { merchant, boutiques, contacts, showToast } = useApp();

  const contact = contacts.find((c) => c.id === transaction.personId) || null;
  const boutique = boutiques.find((b) => b.id === transaction.boutiqueId) || null;
  const typeInfo = getTransactionTypeLabel(transaction.type);

  const receiptText = generateReceiptShareText(
    transaction,
    contact,
    boutique?.name || 'Boutique',
    merchant.businessName,
    merchant.currency
  );

  const handleCopyText = () => {
    navigator.clipboard.writeText(receiptText);
    showToast('Reçu copié dans le presse-papier');
  };

  const handleWhatsAppShare = () => {
    const phone = contact?.phone?.replace(/[^0-9]/g, '') || '';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(receiptText)}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-850">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Reçu d'opération certifié</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable thermal receipt layout */}
        <div id="printable-receipt" className="p-6 bg-white dark:bg-slate-900 space-y-4 text-xs font-mono">
          
          {/* Merchant header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
            <div className="text-base font-extrabold uppercase font-sans tracking-tight text-slate-900 dark:text-white">
              {merchant.businessName}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {boutique?.name} · {boutique?.address}
            </div>
            <div className="text-[10px] text-slate-400">
              Tél: {boutique?.phone || merchant.phone}
            </div>
          </div>

          {/* Receipt Info */}
          <div className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
            <div className="flex justify-between">
              <span>N° DE REÇU :</span>
              <strong className="text-slate-900 dark:text-white">{transaction.receiptNumber}</strong>
            </div>
            <div className="flex justify-between">
              <span>DATE & HEURE :</span>
              <span>{formatFullDateTime(transaction.timestamp)}</span>
            </div>
            <div className="flex justify-between">
              <span>OPÉRATEUR :</span>
              <span>{transaction.authorName} ({transaction.authorRole})</span>
            </div>
            {contact && (
              <div className="flex justify-between pt-1 border-t border-dotted border-slate-200 dark:border-slate-800">
                <span>BÉNÉFICIAIRE :</span>
                <strong className="text-slate-900 dark:text-white">{contact.name}</strong>
              </div>
            )}
          </div>

          {/* Transaction Core */}
          <div className="py-3 my-2 border-y-2 border-slate-900 dark:border-white text-center space-y-1">
            <div className="text-[11px] uppercase tracking-wider text-slate-500">
              {typeInfo.label}
            </div>
            <div className="text-2xl font-black tabular-nums tracking-tight text-slate-900 dark:text-white">
              {formatCurrency(transaction.amount, merchant.currency)}
            </div>
            <div className="text-[11px] text-slate-500">
              Règlement : {getPaymentMethodLabel(transaction.paymentMethod)}
            </div>
            {transaction.reference && (
              <div className="text-[10px] text-slate-400">
                Réf: {transaction.reference}
              </div>
            )}
          </div>

          {/* Items if any */}
          {transaction.items && transaction.items.length > 0 && (
            <div className="space-y-1 border-b border-dashed border-slate-300 dark:border-slate-700 pb-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Détail des articles</div>
              {transaction.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span>{item.productName} x{item.quantity}</span>
                  <span className="tabular-nums">{formatCurrency(item.total, merchant.currency)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {transaction.description && (
            <div className="text-[11px] text-slate-500 italic">
              « {transaction.description} »
            </div>
          )}

          {/* Audit status if cancelled */}
          {transaction.status === 'cancelled' && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-300 text-rose-800 dark:text-rose-200 text-center text-[10px]">
              ⚠️ CETTE OPÉRATION A ÉTÉ ANNULÉE LE {transaction.cancelledAt ? formatFullDateTime(transaction.cancelledAt) : ''}
              {transaction.cancelReason && <div>Motif: {transaction.cancelReason}</div>}
            </div>
          )}

          {/* Bottom slogan */}
          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
            MonArdoise · L'application mobile des commerçants
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-2">
          <button
            onClick={handleCopyText}
            className="flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Copier</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 transition-colors"
            title="Imprimer le ticket"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

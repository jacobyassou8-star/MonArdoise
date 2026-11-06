import { Contact, ContactType, Transaction, TransactionType } from '../types';

export function formatCurrency(amount: number, currency: string = 'FCFA'): string {
  const rounded = Math.round(Math.abs(amount));
  const formatted = rounded.toLocaleString('fr-FR');
  return `${formatted} ${currency}`;
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatFullDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * Calculates the balance for a contact across active (non-cancelled) transactions.
 * Positive (> 0): The contact OWES money to the merchant.
 * Negative (< 0): The merchant OWES money/goods to the contact (credit balance / advance received).
 * Zero (= 0): Fully settled.
 */
export function calculateContactBalance(
  contactId: string,
  transactions: Transaction[],
  boutiqueFilterId?: string
): number {
  return transactions
    .filter((t) => t.status === 'active' && t.personId === contactId)
    .filter((t) => !boutiqueFilterId || t.boutiqueId === boutiqueFilterId)
    .reduce((acc, t) => {
      switch (t.type) {
        case 'vente_credit':
        case 'pret_accorde':
        case 'avance_donnee':
          return acc + t.amount;
        case 'versement':
        case 'remboursement':
          return acc - t.amount;
        default:
          return acc;
      }
    }, 0);
}

export interface BalanceDisplay {
  label: string;
  sublabel: string;
  badgeClass: string;
  textClass: string;
  raw: number;
}

export function getBalanceDisplay(balance: number, currency: string = 'FCFA', contactType?: ContactType): BalanceDisplay {
  if (balance > 0) {
    return {
      label: `Doit ${formatCurrency(balance, currency)}`,
      sublabel: 'Reste à régler au commerçant',
      badgeClass: 'text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800',
      textClass: 'text-amber-600 dark:text-amber-400',
      raw: balance,
    };
  } else if (balance < 0) {
    return {
      label: `Avoir de ${formatCurrency(Math.abs(balance), currency)}`,
      sublabel: 'Vous lui devez (crédit en sa faveur)',
      badgeClass: 'text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      raw: balance,
    };
  } else {
    return {
      label: 'Solde à jour (0 FCFA)',
      sublabel: 'Aucune créance ni dette',
      badgeClass: 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
      textClass: 'text-slate-500 dark:text-slate-400',
      raw: 0,
    };
  }
}

export function getTransactionTypeLabel(type: TransactionType): { label: string; sign: '+' | '-' | ''; color: string } {
  switch (type) {
    case 'vente_credit':
      return { label: 'Vente à crédit', sign: '+', color: 'text-amber-600 dark:text-amber-400' };
    case 'versement':
      return { label: 'Versement reçu', sign: '-', color: 'text-emerald-600 dark:text-emerald-400' };
    case 'avance_donnee':
      return { label: 'Avance accordée', sign: '+', color: 'text-amber-600 dark:text-amber-400' };
    case 'pret_accorde':
      return { label: 'Prêt accordé', sign: '+', color: 'text-amber-600 dark:text-amber-400' };
    case 'remboursement':
      return { label: 'Remboursement', sign: '-', color: 'text-emerald-600 dark:text-emerald-400' };
    case 'vente_comptant':
      return { label: 'Vente comptant', sign: '', color: 'text-blue-600 dark:text-blue-400' };
  }
}

export function getPaymentMethodLabel(method: string): string {
  switch (method) {
    case 'wave':
      return 'Wave';
    case 'orange_money':
      return 'Orange Money';
    case 'mtn_momo':
      return 'MTN MoMo';
    case 'moov':
      return 'Moov Money';
    case 'virement':
      return 'Virement Bancaire';
    case 'especes':
    default:
      return 'Espèces';
  }
}

export function getContactTypeLabel(type: ContactType): string {
  switch (type) {
    case 'client':
      return 'Client';
    case 'fournisseur':
      return 'Fournisseur';
    case 'employe':
      return 'Employé';
    case 'partenaire':
      return 'Partenaire';
  }
}

export function generateWhatsAppReminderUrl(contact: Contact, balance: number, businessName: string, currency: string = 'FCFA'): string {
  const cleanPhone = contact.phone.replace(/[^0-9]/g, '');
  const message = `Bonjour ${contact.name},\nRappel de ${businessName} :\nVotre solde actuel est de ${formatCurrency(balance, currency)}.\nMerci de bien vouloir passer à la boutique ou effectuer votre règlement (Wave/Orange Money/Espèces).\nÀ bientôt !`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates an urgent WhatsApp debt recovery message emphasizing overdue days and available payment options.
 */
export function generateUrgentWhatsAppReminderUrl(
  contact: Contact,
  balance: number,
  daysOverdue: number,
  lastPaymentDate: string | null,
  businessName: string,
  currency: string = 'FCFA',
  paymentAccounts?: {
    waveNumber?: string;
    orangeMoneyCode?: string;
    mtnMoMoNumber?: string;
  }
): string {
  const cleanPhone = contact.phone.replace(/[^0-9]/g, '');
  const dateMention = lastPaymentDate 
    ? ` (aucun versement enregistré depuis le ${formatDate(lastPaymentDate)})`
    : ` (dette en cours depuis ${daysOverdue} jours sans versement)`;

  let paymentDetails = '';
  if (paymentAccounts?.waveNumber) {
    paymentDetails += `\n• Wave : ${paymentAccounts.waveNumber}`;
  }
  if (paymentAccounts?.orangeMoneyCode) {
    paymentDetails += `\n• Orange Money : ${paymentAccounts.orangeMoneyCode}`;
  }
  if (paymentAccounts?.mtnMoMoNumber) {
    paymentDetails += `\n• MTN MoMo : ${paymentAccounts.mtnMoMoNumber}`;
  }

  const message = 
    `🚨 *RAPPEL DE CRÉANCE EN RETARD - ${businessName.toUpperCase()}*\n\n` +
    `Bonjour ${contact.name},\n` +
    `Sauf erreur ou omission de notre part, votre solde de *${formatCurrency(balance, currency)}* accuse un retard important de *${daysOverdue} jours*${dateMention}.\n\n` +
    `Afin de préserver la confiance commerciale et votre compte client, merci de bien vouloir effectuer un règlement (partiel ou total) sans tarder.` +
    (paymentDetails ? `\n\nModes de règlement acceptés :${paymentDetails}\nOu directement au comptoir de la boutique.` : '\nRèglement possible en boutique ou par transfert mobile.') +
    `\n\nMerci de nous confirmer votre versement par retour de message. Bonne journée.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Calculates overdue tracking metrics for a contact based on their balance and repayment history.
 */
export function calculateOverdueInfo(
  contactId: string,
  transactions: Transaction[],
  thresholdDays: number = 30
): {
  contactId: string;
  daysOverdue: number;
  lastPaymentDate: string | null;
  referenceDate: string | null;
  referenceType: 'last_payment' | 'credit_start' | 'none';
  status: 'none' | 'moderate' | 'critical';
  isOverdue: boolean;
  balance: number;
} {
  const balance = calculateContactBalance(contactId, transactions);

  if (balance <= 0) {
    return {
      contactId,
      daysOverdue: 0,
      lastPaymentDate: null,
      referenceDate: null,
      referenceType: 'none',
      status: 'none',
      isOverdue: false,
      balance,
    };
  }

  // Active transactions for this contact
  const activeTx = transactions.filter((t) => t.status === 'active' && t.personId === contactId);

  // Find repayments (versement or remboursement) sorted descending by timestamp
  const payments = activeTx
    .filter((t) => t.type === 'versement' || t.type === 'remboursement')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Find credit-increasing transactions sorted ascending (earliest first)
  const creditTxs = activeTx
    .filter((t) => t.type === 'vente_credit' || t.type === 'pret_accorde' || t.type === 'avance_donnee')
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  let referenceDate: string | null = null;
  let referenceType: 'last_payment' | 'credit_start' | 'none' = 'none';
  const lastPaymentDate = payments.length > 0 ? payments[0].timestamp : null;

  if (payments.length > 0) {
    referenceDate = payments[0].timestamp;
    referenceType = 'last_payment';
  } else if (creditTxs.length > 0) {
    referenceDate = creditTxs[0].timestamp;
    referenceType = 'credit_start';
  } else {
    // Fallback: use first transaction of any type
    referenceDate = activeTx.length > 0 ? activeTx[0].timestamp : new Date().toISOString();
    referenceType = 'credit_start';
  }

  const now = Date.now();
  const refTime = new Date(referenceDate).getTime();
  const diffDays = Math.max(0, Math.floor((now - refTime) / (1000 * 60 * 60 * 24)));

  const moderateThreshold = Math.max(10, Math.floor(thresholdDays * 0.5));
  let status: 'none' | 'moderate' | 'critical' = 'none';
  let isOverdue = false;

  if (diffDays >= thresholdDays) {
    status = 'critical';
    isOverdue = true;
  } else if (diffDays >= moderateThreshold) {
    status = 'moderate';
    isOverdue = false;
  }

  return {
    contactId,
    daysOverdue: diffDays,
    lastPaymentDate,
    referenceDate,
    referenceType,
    status,
    isOverdue,
    balance,
  };
}

export function generateReceiptShareText(transaction: Transaction, contact: Contact | null, boutiqueName: string, businessName: string, currency: string = 'FCFA'): string {
  const dateStr = formatDateTime(transaction.timestamp);
  const typeInfo = getTransactionTypeLabel(transaction.type);
  const channel = getPaymentMethodLabel(transaction.paymentMethod);
  
  return `🧾 REÇU MONARDOISE\n` +
    `---------------------------\n` +
    `Commerce : ${businessName}\n` +
    `Boutique : ${boutiqueName}\n` +
    `N° Reçu : ${transaction.receiptNumber}\n` +
    `Date : ${dateStr}\n` +
    `Opération : ${typeInfo.label}\n` +
    `Montant : ${formatCurrency(transaction.amount, currency)}\n` +
    `Mode : ${channel}\n` +
    (contact ? `Bénéficiaire : ${contact.name} (${contact.phone})\n` : '') +
    (transaction.description ? `Note : ${transaction.description}\n` : '') +
    `Enregistré par : ${transaction.authorName}\n` +
    `---------------------------\n` +
    `MonArdoise - Gestion commerciale`;
}


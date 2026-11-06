export type UserRole = 'gerant' | 'employe';

export type ContactType = 'client' | 'fournisseur' | 'employe' | 'partenaire';

export type TransactionType = 
  | 'vente_credit'      // Client takes goods on credit (increases what they owe)
  | 'versement'         // Client pays back money / installment (decreases what they owe)
  | 'avance_donnee'     // Merchant gives an advance (e.g. to employee or supplier)
  | 'pret_accorde'      // Loan granted to a person
  | 'remboursement'     // Repayment made (settles advance/loan)
  | 'vente_comptant';   // Cash / immediate sale

export type PaymentMethod = 'especes' | 'wave' | 'orange_money' | 'mtn_momo' | 'moov' | 'virement';

export interface Boutique {
  id: string;
  name: string;
  address: string;
  phone: string;
  managerName: string;
  color: string;
  createdAt: string;
}

export interface UserStaff {
  id: string;
  name: string;
  role: UserRole;
  boutiqueId: string; // assigned primary boutique
  phone: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  type: ContactType;
  address?: string;
  notes?: string;
  idCardNumber?: string;  // optional KYC
  rccm?: string;          // optional commercial register
  creditLimit?: number;   // optional maximum credit allowed
  createdAt: string;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Transaction {
  id: string;
  personId: string | null;       // null for generic cash sale
  boutiqueId: string;            // where it took place
  authorId: string;              // who logged it
  authorName: string;            // cached name
  authorRole: UserRole;          // author role at time of transaction
  type: TransactionType;
  amount: number;
  description: string;
  timestamp: string;             // ISO date-time
  paymentMethod: PaymentMethod;
  reference?: string;
  receiptNumber: string;
  items?: TransactionItem[];
  status: 'active' | 'cancelled';
  cancelledAt?: string;
  cancelledBy?: {
    id: string;
    name: string;
    role: UserRole;
  };
  cancelReason?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  stockByBoutique: Record<string, number>; // boutiqueId -> qty
  minThreshold: number;
}

export interface MerchantProfile {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  currency: string;
  plan: 'starter' | 'pro' | 'reseau';
  launchDiscountActive: boolean;
  kycStatus: 'non_requis' | 'en_cours' | 'valide';
  idCardUploaded: boolean;
  rccmUploaded: boolean;
  paymentAccounts: {
    waveNumber: string;
    waveMerchantCode: string;
    orangeMoneyCode: string;
    mtnMoMoNumber: string;
    moovNumber: string;
    instructions: string;
  };
}

export type OverdueStatus = 'none' | 'moderate' | 'critical';

export interface OverdueInfo {
  contactId: string;
  daysOverdue: number;
  lastPaymentDate: string | null;
  referenceDate: string | null;
  referenceType: 'last_payment' | 'credit_start' | 'none';
  status: OverdueStatus;
  isOverdue: boolean;
  balance: number;
}

export interface OverdueAlertSettings {
  enabled: boolean;
  thresholdDays: number;
  cadence: 'weekly_monday' | 'daily' | 'monthly';
  browserNotificationsEnabled: boolean;
  lastAlertCheck?: string | null;
}


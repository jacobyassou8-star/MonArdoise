import { Boutique, Contact, MerchantProfile, Product, Transaction, UserStaff } from '../types';

export const initialMerchant: MerchantProfile = {
  id: 'm1',
  businessName: 'Mon Commerce',
  ownerName: 'Gérant',
  phone: '+221 77 000 00 00',
  email: 'contact@monardoise.pro',
  currency: 'FCFA',
  plan: 'pro',
  launchDiscountActive: true,
  kycStatus: 'non_requis',
  idCardUploaded: false,
  rccmUploaded: false,
  paymentAccounts: {
    waveNumber: '',
    waveMerchantCode: '',
    orangeMoneyCode: '',
    mtnMoMoNumber: '',
    moovNumber: '',
    instructions: '',
  },
};

export const initialBoutiques: Boutique[] = [
  {
    id: 'b1',
    name: 'Boutique Principale',
    address: 'Point de vente principal',
    phone: '+221 77 000 00 00',
    managerName: 'Gérant',
    color: '#0284c7', // sky-600
    createdAt: new Date().toISOString(),
  },
];

export const initialStaff: UserStaff[] = [
  {
    id: 'u1',
    name: 'Gérant Principal',
    role: 'gerant',
    boutiqueId: 'b1',
    phone: '+221 77 000 00 00',
  },
];

export const initialContacts: Contact[] = [];

export const initialTransactions: Transaction[] = [];

export const initialProducts: Product[] = [];

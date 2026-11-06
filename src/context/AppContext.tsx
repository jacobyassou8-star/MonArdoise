import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  Boutique, 
  Contact, 
  MerchantProfile, 
  Product, 
  Transaction, 
  TransactionType, 
  PaymentMethod, 
  UserRole, 
  UserStaff,
  OverdueAlertSettings 
} from '../types';
import { 
  initialBoutiques, 
  initialContacts, 
  initialMerchant, 
  initialProducts, 
  initialStaff, 
  initialTransactions 
} from '../data/mockData';
import { calculateContactBalance, calculateOverdueInfo, formatCurrency } from '../utils/formatters';


interface AppContextType {
  merchant: MerchantProfile;
  updateMerchant: (updates: Partial<MerchantProfile>) => void;
  boutiques: Boutique[];
  addBoutique: (boutique: Omit<Boutique, 'id' | 'createdAt'>) => Boutique;
  updateBoutique: (id: string, updates: Partial<Boutique>) => void;
  staff: UserStaff[];
  addStaff: (user: Omit<UserStaff, 'id'>) => UserStaff;
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => Contact;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  transactions: Transaction[];
  recordTransaction: (data: {
    personId: string | null;
    boutiqueId: string;
    type: TransactionType;
    amount: number;
    description: string;
    paymentMethod: PaymentMethod;
    reference?: string;
    items?: { productId: string; productName: string; quantity: number; unitPrice: number; total: number }[];
  }) => { success: boolean; transaction?: Transaction; error?: string };
  cancelTransaction: (transactionId: string, reason: string) => { success: boolean; error?: string };
  products: Product[];
  updateProductStock: (productId: string, boutiqueId: string, quantityChange: number) => void;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  
  // Navigation & session state
  activeBoutiqueId: string; // 'all' or specific boutiqueId
  setActiveBoutiqueId: (id: string) => void;
  currentUser: UserStaff;
  setCurrentUser: (user: UserStaff) => void;
  switchUserRole: () => void;
  
  // UI Display toggles
  deviceMode: 'frame' | 'responsive';
  setDeviceMode: (mode: 'frame' | 'responsive') => void;
  deviceType: 'iphone' | 'android';
  setDeviceType: (type: 'iphone' | 'android') => void;
  
  // Quick stats
  totalReceivables: number; // total créances (money clients owe)
  totalPayables: number;    // total dettes (money merchant owes)
  activeBoutiqueName: string;
  
  // Notification toast
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  resetToDemo: () => void;
  clearAllData: () => void;

  // Overdue recovery and scheduled notification system
  overdueSettings: OverdueAlertSettings;
  updateOverdueSettings: (updates: Partial<OverdueAlertSettings>) => void;
  requestBrowserNotificationPermission: () => Promise<boolean>;
  triggerOverdueAlertCheck: (forceToast?: boolean) => void;
  seedDemoOverdueAccount: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

// Automatically wipe previous demo records from client localStorage on first boot
if (typeof window !== 'undefined' && !localStorage.getItem('monardoise_wiped_v2')) {
  try {
    localStorage.clear();
    localStorage.setItem('monardoise_wiped_v2', 'true');
  } catch (e) {
    console.error('Failed to wipe legacy data', e);
  }
}

const STORAGE_KEYS = {
  MERCHANT: 'monardoise_merchant_v2',
  BOUTIQUES: 'monardoise_boutiques_v2',
  STAFF: 'monardoise_staff_v2',
  CONTACTS: 'monardoise_contacts_v2',
  TRANSACTIONS: 'monardoise_transactions_v2',
  PRODUCTS: 'monardoise_products_v2',
  CURRENT_USER_ID: 'monardoise_current_user_v2',
  ACTIVE_BOUTIQUE: 'monardoise_active_boutique_v2',
  DEVICE_MODE: 'monardoise_device_mode_v2',
  OVERDUE_SETTINGS: 'monardoise_overdue_settings_v2',
};

const defaultOverdueSettings: OverdueAlertSettings = {
  enabled: true,
  thresholdDays: 30,
  cadence: 'weekly_monday',
  browserNotificationsEnabled: false,
  lastAlertCheck: null,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [merchant, setMerchant] = useState<MerchantProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MERCHANT);
    return saved ? JSON.parse(saved) : initialMerchant;
  });

  const [boutiques, setBoutiques] = useState<Boutique[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOUTIQUES);
    return saved ? JSON.parse(saved) : initialBoutiques;
  });

  const [staff, setStaff] = useState<UserStaff[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
    return saved ? JSON.parse(saved) : initialStaff;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    return saved ? JSON.parse(saved) : initialContacts;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [activeBoutiqueId, setActiveBoutiqueId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_BOUTIQUE) || 'b1';
  });

  const [currentUser, setCurrentUser] = useState<UserStaff>(() => {
    const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const found = initialStaff.find((s) => s.id === savedId);
    return found || initialStaff[0]; // defaults to Amadou Diallo (Gérant)
  });

  const [deviceMode, setDeviceMode] = useState<'frame' | 'responsive'>(() => {
    return (localStorage.getItem(STORAGE_KEYS.DEVICE_MODE) as 'frame' | 'responsive') || 'frame';
  });

  const [deviceType, setDeviceType] = useState<'iphone' | 'android'>('android');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [overdueSettings, setOverdueSettings] = useState<OverdueAlertSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OVERDUE_SETTINGS);
    return saved ? JSON.parse(saved) : defaultOverdueSettings;
  });

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OVERDUE_SETTINGS, JSON.stringify(overdueSettings));
  }, [overdueSettings]);


  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MERCHANT, JSON.stringify(merchant));
  }, [merchant]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOUTIQUES, JSON.stringify(boutiques));
  }, [boutiques]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_BOUTIQUE, activeBoutiqueId);
  }, [activeBoutiqueId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEVICE_MODE, deviceMode);
  }, [deviceMode]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  const updateMerchant = (updates: Partial<MerchantProfile>) => {
    setMerchant((prev) => ({ ...prev, ...updates }));
    showToast('Paramètres commerçant mis à jour');
  };

  const addBoutique = (data: Omit<Boutique, 'id' | 'createdAt'>) => {
    const newBoutique: Boutique = {
      ...data,
      id: `b_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setBoutiques((prev) => [...prev, newBoutique]);
    showToast(`Boutique "${newBoutique.name}" ajoutée à votre espace`);
    return newBoutique;
  };

  const updateBoutique = (id: string, updates: Partial<Boutique>) => {
    setBoutiques((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    showToast('Boutique mise à jour');
  };

  const addStaff = (data: Omit<UserStaff, 'id'>) => {
    const newStaff: UserStaff = {
      ...data,
      id: `u_${Date.now()}`,
    };
    setStaff((prev) => [...prev, newStaff]);
    showToast(`Membre "${newStaff.name}" (${newStaff.role === 'gerant' ? 'Gérant' : 'Employé'}) ajouté`);
    return newStaff;
  };

  const addContact = (data: Omit<Contact, 'id' | 'createdAt'>) => {
    const newContact: Contact = {
      ...data,
      id: `c_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setContacts((prev) => [newContact, ...prev]);
    showToast(`Compte créé pour ${newContact.name}`);
    return newContact;
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Compte mis à jour');
  };

  const recordTransaction = (data: {
    personId: string | null;
    boutiqueId: string;
    type: TransactionType;
    amount: number;
    description: string;
    paymentMethod: PaymentMethod;
    reference?: string;
    items?: { productId: string; productName: string; quantity: number; unitPrice: number; total: number }[];
  }) => {
    if (data.amount <= 0) {
      return { success: false, error: 'Le montant doit être supérieur à zéro.' };
    }

    const receiptNum = `REC-${String(transactions.length + 101).padStart(5, '0')}`;
    const newTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      personId: data.personId,
      boutiqueId: data.boutiqueId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      type: data.type,
      amount: data.amount,
      description: data.description,
      timestamp: new Date().toISOString(),
      paymentMethod: data.paymentMethod,
      reference: data.reference,
      receiptNumber: receiptNum,
      items: data.items,
      status: 'active',
    };

    // If items were included, update stock in the chosen boutique
    if (data.items && data.items.length > 0) {
      setProducts((prev) =>
        prev.map((product) => {
          const item = data.items?.find((i) => i.productId === product.id);
          if (item) {
            const currentStock = product.stockByBoutique[data.boutiqueId] || 0;
            return {
              ...product,
              stockByBoutique: {
                ...product.stockByBoutique,
                [data.boutiqueId]: Math.max(0, currentStock - item.quantity),
              },
            };
          }
          return product;
        })
      );
    }

    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Opération enregistrée (${newTx.receiptNumber})`);
    return { success: true, transaction: newTx };
  };

  const cancelTransaction = (transactionId: string, reason: string) => {
    // Decision: "Seul un utilisateur ayant le rôle de gérant peut corriger ou annuler une opération.
    // Les corrections conservent la trace de l’opération d’origine."
    if (currentUser.role !== 'gerant') {
      const err = "Action refusée : Seul un utilisateur avec le rôle 'Gérant' est autorisé à annuler ou corriger une opération.";
      showToast(err, 'error');
      return { success: false, error: err };
    }

    if (!reason || reason.trim().length < 5) {
      const err = "Un motif précis d'annulation est obligatoire pour l'audit.";
      showToast(err, 'error');
      return { success: false, error: err };
    }

    const txToCancel = transactions.find((t) => t.id === transactionId);
    if (!txToCancel) {
      return { success: false, error: 'Opération introuvable' };
    }

    // Revert stock if it had items
    if (txToCancel.items && txToCancel.items.length > 0) {
      setProducts((prev) =>
        prev.map((product) => {
          const item = txToCancel.items?.find((i) => i.productId === product.id);
          if (item) {
            const currentStock = product.stockByBoutique[txToCancel.boutiqueId] || 0;
            return {
              ...product,
              stockByBoutique: {
                ...product.stockByBoutique,
                [txToCancel.boutiqueId]: currentStock + item.quantity,
              },
            };
          }
          return product;
        })
      );
    }

    // Mark as cancelled without deleting
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === transactionId) {
          return {
            ...t,
            status: 'cancelled',
            cancelledAt: new Date().toISOString(),
            cancelledBy: {
              id: currentUser.id,
              name: currentUser.name,
              role: currentUser.role,
            },
            cancelReason: reason.trim(),
          };
        }
        return t;
      })
    );

    showToast(`Opération ${txToCancel.receiptNumber} annulée avec trace d'audit.`);
    return { success: true };
  };

  const updateProductStock = (productId: string, boutiqueId: string, quantityChange: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const current = p.stockByBoutique[boutiqueId] || 0;
          return {
            ...p,
            stockByBoutique: {
              ...p.stockByBoutique,
              [boutiqueId]: Math.max(0, current + quantityChange),
            },
          };
        }
        return p;
      })
    );
    showToast('Stock mis à jour');
  };

  const addProduct = (data: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...data,
      id: `p_${Date.now()}`,
    };
    setProducts((prev) => [...prev, newProduct]);
    showToast(`Produit "${newProduct.name}" ajouté au catalogue`);
    return newProduct;
  };

  const switchUserRole = () => {
    if (currentUser.role === 'gerant') {
      // switch to an employee
      const employee = staff.find((s) => s.role === 'employe') || {
        id: 'u_emp',
        name: 'Vendeur Employé',
        role: 'employe' as UserRole,
        boutiqueId: activeBoutiqueId !== 'all' ? activeBoutiqueId : 'b1',
        phone: '+221 77 000 00 00',
      };
      setCurrentUser(employee);
      showToast('Session basculée sur : Employé (Ventes autorisées, Annulation restreinte)', 'info');
    } else {
      // switch to manager
      const manager = staff.find((s) => s.role === 'gerant') || initialStaff[0];
      setCurrentUser(manager);
      showToast('Session basculée sur : Gérant (Tous droits, Audit & Annulations)', 'info');
    }
  };

  const clearAllData = () => {
    try {
      localStorage.clear();
      localStorage.setItem('monardoise_wiped_v2', 'true');
    } catch (e) {
      console.error(e);
    }
    setMerchant(initialMerchant);
    setBoutiques(initialBoutiques);
    setStaff(initialStaff);
    setContacts([]);
    setTransactions([]);
    setProducts([]);
    setActiveBoutiqueId('b1');
    setCurrentUser(initialStaff[0]);
    showToast('Toutes les données ont été supprimées avec succès (Carnet à zéro)', 'info');
  };

  const resetToDemo = () => {
    clearAllData();
  };

  // Overdue recovery and notification handlers
  const updateOverdueSettings = (updates: Partial<OverdueAlertSettings>) => {
    setOverdueSettings((prev) => ({ ...prev, ...updates }));
    showToast('Paramètres de relance et alertes mis à jour', 'success');
  };

  const requestBrowserNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast('Notifications de navigateur non supportées sur cet appareil', 'error');
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setOverdueSettings((prev) => ({ ...prev, browserNotificationsEnabled: true }));
        showToast('Notifications autorisées pour les rappels de créances !', 'success');
        return true;
      } else {
        setOverdueSettings((prev) => ({ ...prev, browserNotificationsEnabled: false }));
        showToast('Autorisation de notification refusée par le navigateur', 'info');
        return false;
      }
    } catch {
      return false;
    }
  };

  const triggerOverdueAlertCheck = (forceToast: boolean = false) => {
    const overdueDebtors = contacts.filter((c) => {
      const info = calculateOverdueInfo(c.id, transactions, overdueSettings.thresholdDays);
      return info.isOverdue;
    });

    const overdueCount = overdueDebtors.length;
    const totalOverdue = overdueDebtors.reduce((sum, c) => {
      const bal = calculateContactBalance(c.id, transactions);
      return bal > 0 ? sum + bal : sum;
    }, 0);

    if (overdueCount > 0) {
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted' &&
        overdueSettings.browserNotificationsEnabled
      ) {
        try {
          new Notification('🚨 Alerte MonArdoise : Créances en retard', {
            body: `${overdueCount} compte(s) dépassent le seuil de ${overdueSettings.thresholdDays} jours. Total : ${formatCurrency(totalOverdue, merchant.currency)} à recouvrer.`,
            icon: '/favicon.ico',
          });
        } catch (e) {
          console.warn('Could not fire notification', e);
        }
      }

      showToast(
        `🚨 ${overdueCount} compte${overdueCount > 1 ? 's' : ''} en retard critique (> ${overdueSettings.thresholdDays}j) - Total : ${formatCurrency(totalOverdue, merchant.currency)}`,
        'error'
      );
    } else if (forceToast) {
      showToast(
        `✅ Aucune créance en retard critique détectée selon le seuil de ${overdueSettings.thresholdDays} jours.`,
        'success'
      );
    }
  };

  const seedDemoOverdueAccount = () => {
    const pastCreditDate = new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString();
    const pastPaymentDate = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString();
    const newContactId = `c_demo_overdue_${Date.now()}`;
    const demoContact: Contact = {
      id: newContactId,
      name: 'Moussa Diop (Client Épicerie)',
      phone: '+221 77 450 12 34',
      type: 'client',
      address: 'Marché Central, Allée 4',
      notes: 'Client habituel - Retard constaté pour test de relance',
      createdAt: pastCreditDate,
    };

    const demoTx1: Transaction = {
      id: `tx_demo_ov1_${Date.now()}`,
      personId: newContactId,
      boutiqueId: boutiques[0]?.id || 'b1',
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      type: 'vente_credit',
      amount: 45000,
      description: 'Sac de riz parfumé 50kg + carton de lait',
      timestamp: pastCreditDate,
      paymentMethod: 'especes',
      receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
      status: 'active',
    };

    const demoTx2: Transaction = {
      id: `tx_demo_ov2_${Date.now() + 1}`,
      personId: newContactId,
      boutiqueId: boutiques[0]?.id || 'b1',
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      type: 'versement',
      amount: 10000,
      description: 'Acompte partiel Wave',
      timestamp: pastPaymentDate,
      paymentMethod: 'wave',
      receiptNumber: `REC-${(Date.now() + 1).toString().slice(-6)}`,
      status: 'active',
    };

    setContacts((prev) => [demoContact, ...prev]);
    setTransactions((prev) => [demoTx1, demoTx2, ...prev]);
    showToast('Compte test en retard (35 jours sans versement, reste 35 000 FCFA) généré avec succès !', 'success');
  };

  // Automated scheduled alert check on startup
  useEffect(() => {
    if (!overdueSettings.enabled) return;

    const timer = setTimeout(() => {
      const now = new Date();
      const lastCheck = overdueSettings.lastAlertCheck ? new Date(overdueSettings.lastAlertCheck) : null;
      
      let shouldCheck = false;
      if (!lastCheck) {
        shouldCheck = true;
      } else {
        const diffHours = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60);
        if (overdueSettings.cadence === 'daily' && diffHours >= 18) {
          shouldCheck = true;
        } else if (overdueSettings.cadence === 'weekly_monday') {
          const isMonday = now.getDay() === 1;
          if (isMonday && diffHours >= 20) shouldCheck = true;
          else if (diffHours >= 144) shouldCheck = true;
        } else if (overdueSettings.cadence === 'monthly' && diffHours >= 600) {
          shouldCheck = true;
        }
      }

      if (shouldCheck) {
        const hasOverdue = contacts.some((c) => {
          const info = calculateOverdueInfo(c.id, transactions, overdueSettings.thresholdDays);
          return info.isOverdue;
        });
        if (hasOverdue) {
          triggerOverdueAlertCheck(false);
          setOverdueSettings((prev) => ({ ...prev, lastAlertCheck: now.toISOString() }));
        }
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [overdueSettings.enabled, overdueSettings.cadence, overdueSettings.thresholdDays]);

  // Calculations for quick KPIs
  const totalReceivables = useMemo(() => {
    return contacts.reduce((sum, c) => {
      const bal = calculateContactBalance(c.id, transactions);
      return bal > 0 ? sum + bal : sum;
    }, 0);
  }, [contacts, transactions]);

  const totalPayables = useMemo(() => {
    return contacts.reduce((sum, c) => {
      const bal = calculateContactBalance(c.id, transactions);
      return bal < 0 ? sum + Math.abs(bal) : sum;
    }, 0);
  }, [contacts, transactions]);

  const activeBoutiqueName = useMemo(() => {
    if (activeBoutiqueId === 'all') return 'Toutes les boutiques (Espace Commerçant)';
    const b = boutiques.find((item) => item.id === activeBoutiqueId);
    return b ? b.name : 'Boutique active';
  }, [activeBoutiqueId, boutiques]);

  return (
    <AppContext.Provider
      value={{
        merchant,
        updateMerchant,
        boutiques,
        addBoutique,
        updateBoutique,
        staff,
        addStaff,
        contacts,
        addContact,
        updateContact,
        transactions,
        recordTransaction,
        cancelTransaction,
        products,
        updateProductStock,
        addProduct,
        activeBoutiqueId,
        setActiveBoutiqueId,
        currentUser,
        setCurrentUser,
        switchUserRole,
        deviceMode,
        setDeviceMode,
        deviceType,
        setDeviceType,
        totalReceivables,
        totalPayables,
        activeBoutiqueName,
        toast,
        showToast,
        resetToDemo,
        clearAllData,
        overdueSettings,
        updateOverdueSettings,
        requestBrowserNotificationPermission,
        triggerOverdueAlertCheck,
        seedDemoOverdueAccount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};


export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

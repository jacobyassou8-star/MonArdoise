import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Contact, PaymentMethod, TransactionType } from '../types';
import { 
  formatCurrency, 
  calculateContactBalance, 
  getBalanceDisplay 
} from '../utils/formatters';
import { 
  X, 
  Plus, 
  Check, 
  User, 
  Store, 
  CreditCard, 
  Package, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface NewTransactionModalProps {
  initialContact?: Contact | null;
  onClose: () => void;
  onSuccess: (txId: string) => void;
  onOpenNewContact: () => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  initialContact,
  onClose,
  onSuccess,
  onOpenNewContact,
}) => {
  const { 
    contacts, 
    boutiques, 
    activeBoutiqueId, 
    currentUser, 
    merchant, 
    transactions, 
    products, 
    recordTransaction 
  } = useApp();

  const [type, setType] = useState<TransactionType>('vente_credit');
  const [selectedPersonId, setSelectedPersonId] = useState<string>(initialContact ? initialContact.id : '');
  const [selectedBoutiqueId, setSelectedBoutiqueId] = useState<string>(
    activeBoutiqueId !== 'all' ? activeBoutiqueId : (boutiques[0]?.id || 'b1')
  );
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('especes');
  const [reference, setReference] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Quick product attachment
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [productQty, setProductQty] = useState<number>(1);
  const [cartItems, setCartItems] = useState<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[]>([]);

  // Update selected person if initialContact changes
  useEffect(() => {
    if (initialContact) {
      setSelectedPersonId(initialContact.id);
    }
  }, [initialContact]);

  const currentContact = contacts.find((c) => c.id === selectedPersonId);
  const currentBalance = currentContact ? calculateContactBalance(currentContact.id, transactions) : 0;

  // Calculate new projected balance
  const parsedAmount = parseFloat(amount) || 0;
  const projectedBalance = (() => {
    if (!currentContact) return 0;
    switch (type) {
      case 'vente_credit':
      case 'pret_accorde':
      case 'avance_donnee':
        return currentBalance + parsedAmount;
      case 'versement':
      case 'remboursement':
        return currentBalance - parsedAmount;
      default:
        return currentBalance;
    }
  })();

  const handleAddProductToTx = () => {
    const prod = products.find((p) => p.id === selectedProduct);
    if (!prod) return;

    const total = prod.sellPrice * productQty;
    const newItem = {
      productId: prod.id,
      productName: prod.name,
      quantity: productQty,
      unitPrice: prod.sellPrice,
      total,
    };

    const newCart = [...cartItems, newItem];
    setCartItems(newCart);

    // Auto-sum amount
    const sum = newCart.reduce((acc, item) => acc + item.total, 0);
    setAmount(String(sum));

    // Auto-description if empty
    if (!description) {
      setDescription(newCart.map(i => `${i.productName} (x${i.quantity})`).join(', '));
    }

    setSelectedProduct('');
    setProductQty(1);
  };

  const handleRemoveCartItem = (index: number) => {
    const newCart = cartItems.filter((_, i) => i !== index);
    setCartItems(newCart);
    const sum = newCart.reduce((acc, item) => acc + item.total, 0);
    setAmount(sum > 0 ? String(sum) : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (type !== 'vente_comptant' && !selectedPersonId) {
      setError('Veuillez sélectionner le compte de la personne concernée.');
      return;
    }

    if (parsedAmount <= 0) {
      setError('Veuillez saisir un montant valide supérieur à 0.');
      return;
    }

    const res = recordTransaction({
      personId: type === 'vente_comptant' ? (selectedPersonId || null) : selectedPersonId,
      boutiqueId: selectedBoutiqueId,
      type,
      amount: parsedAmount,
      description: description.trim() || `${type} enregistrée`,
      paymentMethod,
      reference: reference.trim() || undefined,
      items: cartItems.length > 0 ? cartItems : undefined,
    });

    if (res.success && res.transaction) {
      onSuccess(res.transaction.id);
    } else {
      setError(res.error || 'Erreur lors de l’enregistrement');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-850/50">
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Horodaté & attribué à l'espace
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Nouvelle opération sur l'Ardoise
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Attribution Info Badge (Author + Time + Boutique) */}
          <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/70 text-xs flex flex-wrap items-center justify-between gap-2 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Auteur : <strong>{currentUser.name}</strong> ({currentUser.role === 'gerant' ? 'Gérant' : 'Employé'})</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Horodatage automatique
            </div>
          </div>

          {/* Operation Type Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nature de l'opération
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'vente_credit', label: 'Vente à crédit', desc: 'Le client doit +' },
                { id: 'versement', label: 'Versement reçu', desc: 'Règlement du client -' },
                { id: 'avance_donnee', label: 'Avance accordée', desc: 'Sur salaire / fournisseur +' },
                { id: 'pret_accorde', label: 'Prêt accordé', desc: 'Fonds prêtés +' },
                { id: 'remboursement', label: 'Remboursement', desc: 'Remboursement effectué -' },
                { id: 'vente_comptant', label: 'Vente comptant', desc: 'Payé immédiatement' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setType(opt.id as TransactionType)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    type === opt.id
                      ? 'border-slate-950 dark:border-white bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold leading-tight">{opt.label}</div>
                  <div className={`text-[10px] mt-0.5 ${type === opt.id ? 'opacity-80' : 'text-slate-400'}`}>
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Boutique Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Boutique où s'est déroulée l'opération
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {boutiques.map((b) => (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => setSelectedBoutiqueId(b.id)}
                  className={`p-2.5 rounded-xl text-left border flex items-center justify-between text-xs transition-all ${
                    selectedBoutiqueId === b.id
                      ? 'border-slate-950 dark:border-white bg-slate-50 dark:bg-slate-800 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                    <span className="truncate">{b.name}</span>
                  </div>
                  {selectedBoutiqueId === b.id && <Check className="w-3.5 h-3.5 text-slate-950 dark:text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Person Selector */}
          {type !== 'vente_comptant' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Personne concernée (Compte partagé entre boutiques)
                </label>
                <button
                  type="button"
                  onClick={onOpenNewContact}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Nouvelle personne</span>
                </button>
              </div>

              <select
                value={selectedPersonId}
                onChange={(e) => setSelectedPersonId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white"
                required
              >
                <option value="">-- Choisir un client, fournisseur ou employé --</option>
                {contacts.map((c) => {
                  const bal = calculateContactBalance(c.id, transactions);
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type}) — Solde: {formatCurrency(bal, merchant.currency)}
                    </option>
                  );
                })}
              </select>

              {/* Dynamic Balance Projection */}
              {currentContact && (
                <div className="mt-2 p-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-slate-500">Solde actuel : </span>
                    <strong className="font-mono">{formatCurrency(currentBalance, merchant.currency)}</strong>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <div>
                    <span className="text-slate-500">Nouveau solde prévu : </span>
                    <strong className="font-mono text-slate-900 dark:text-white font-bold">
                      {formatCurrency(projectedBalance, merchant.currency)}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Montant de l'opération ({merchant.currency})
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 25000"
                className="w-full px-3.5 py-3 text-lg font-bold tabular-nums rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {merchant.currency}
              </span>
            </div>
          </div>

          {/* Optional Stock attachment */}
          <div className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-slate-500" />
                <span>Ajouter des articles du stock (Optionnel)</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="">Sélectionner un produit du catalogue...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatCurrency(p.sellPrice, merchant.currency)} (Stock: {p.stockByBoutique[selectedBoutiqueId] || 0} {p.unit})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={productQty}
                onChange={(e) => setProductQty(parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1.5 text-xs text-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <button
                type="button"
                onClick={handleAddProductToTx}
                disabled={!selectedProduct}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 disabled:opacity-40"
              >
                Ajouter
              </button>
            </div>

            {cartItems.length > 0 && (
              <div className="space-y-1 pt-1">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span>{item.productName} (x{item.quantity})</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold tabular-nums">{formatCurrency(item.total, merchant.currency)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCartItem(idx)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description & Motif */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description ou motif de l'opération
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: 2 sacs de riz parfumé, ou versement partiel..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Canal de règlement
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {[
                { id: 'especes', label: 'Espèces' },
                { id: 'wave', label: 'Wave' },
                { id: 'orange_money', label: 'Orange Money' },
                { id: 'mtn_momo', label: 'MTN MoMo' },
                { id: 'moov', label: 'Moov Money' },
                { id: 'virement', label: 'Virement' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                  className={`py-2 px-1 text-center rounded-xl border text-[11px] font-medium transition-all ${
                    paymentMethod === m.id
                      ? 'border-slate-950 dark:border-white bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reference if digital payment */}
          {paymentMethod !== 'especes' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Référence de transaction ({paymentMethod.toUpperCase()})
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ex: ID transaction Wave ou code SMS"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-transform"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>Valider & Enregistrer l'opération</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

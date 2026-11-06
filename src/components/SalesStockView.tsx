import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, PaymentMethod } from '../types';
import { formatCurrency } from '../utils/formatters';
import { 
  Package, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  AlertTriangle, 
  Check, 
  Store, 
  User, 
  CreditCard,
  PlusCircle,
  X
} from 'lucide-react';
import { TurnoverChart } from './TurnoverChart';

interface SalesStockViewProps {
  onOpenNewTx: () => void;
  onSelectReceipt: (txId: string) => void;
}

export const SalesStockView: React.FC<SalesStockViewProps> = ({
  onOpenNewTx,
  onSelectReceipt,
}) => {
  const { 
    products, 
    boutiques, 
    activeBoutiqueId, 
    contacts, 
    merchant, 
    updateProductStock, 
    addProduct, 
    recordTransaction, 
    showToast 
  } = useApp();

  // Active boutique for stock operations (defaults to first boutique if 'all')
  const currentBoutiqueId = activeBoutiqueId !== 'all' ? activeBoutiqueId : (boutiques[0]?.id || 'b1');
  const currentBoutique = boutiques.find((b) => b.id === currentBoutiqueId);

  // Cart for fast POS checkout
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [saleType, setSaleType] = useState<'comptant' | 'credit'>('comptant');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('especes');
  
  // New product modal state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Épicerie');
  const [newProductUnit, setNewProductUnit] = useState('Pièce');
  const [newProductBuyPrice, setNewProductBuyPrice] = useState('');
  const [newProductSellPrice, setNewProductSellPrice] = useState('');
  const [newProductInitialStock, setNewProductInitialStock] = useState('20');
  const [newProductThreshold, setNewProductThreshold] = useState('5');

  // Stock replenishment modal state
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.sellPrice * item.quantity, 0);

  const addToCart = (product: Product) => {
    const available = product.stockByBoutique[currentBoutiqueId] || 0;
    const existing = cart.find((i) => i.product.id === product.id);
    const inCartQty = existing ? existing.quantity : 0;

    if (inCartQty >= available) {
      showToast(`Stock insuffisant en ${currentBoutique?.name} (${available} restants)`, 'error');
      return;
    }

    if (existing) {
      setCart((prev) =>
        prev.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
      );
    } else {
      setCart((prev) => [...prev, { product, quantity: 1 }]);
    }
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      showToast('Le panier est vide', 'error');
      return;
    }

    if (saleType === 'credit' && !selectedClientId) {
      showToast('Veuillez sélectionner un client pour la vente à crédit', 'error');
      return;
    }

    const itemsSummary = cart.map((i) => ({
      productId: i.product.id,
      productName: i.product.name,
      quantity: i.quantity,
      unitPrice: i.product.sellPrice,
      total: i.product.sellPrice * i.quantity,
    }));

    const desc = cart.map((i) => `${i.product.name} (x${i.quantity})`).join(', ');

    const res = recordTransaction({
      personId: saleType === 'credit' ? selectedClientId : null,
      boutiqueId: currentBoutiqueId,
      type: saleType === 'credit' ? 'vente_credit' : 'vente_comptant',
      amount: cartTotal,
      description: desc,
      paymentMethod,
      items: itemsSummary,
    });

    if (res.success && res.transaction) {
      setCart([]);
      onSelectReceipt(res.transaction.id);
      showToast('Vente enregistrée avec succès');
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    const buyPrice = parseFloat(newProductBuyPrice) || 0;
    const sellPrice = parseFloat(newProductSellPrice) || 0;
    const initialQty = parseInt(newProductInitialStock) || 0;
    const threshold = parseInt(newProductThreshold) || 5;

    addProduct({
      name: newProductName.trim(),
      category: newProductCategory,
      unit: newProductUnit,
      buyPrice,
      sellPrice,
      stockByBoutique: {
        [currentBoutiqueId]: initialQty,
      },
      minThreshold: threshold,
    });

    setShowAddProductModal(false);
    setNewProductName('');
    setNewProductBuyPrice('');
    setNewProductSellPrice('');
  };

  const handleConfirmRestock = () => {
    if (!restockProduct || restockQty <= 0) return;
    updateProductStock(restockProduct.id, currentBoutiqueId, restockQty);
    setRestockProduct(null);
    setRestockQty(10);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Ventes de Caisse & Gestion du Stock
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              MVP
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Point de vente rapide et suivi des stocks pour : <strong>{currentBoutique?.name}</strong>
          </p>
        </div>

        <button
          onClick={() => setShowAddProductModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Ajouter un Produit</span>
        </button>
      </div>

      {/* Turnover Evolution Chart (Recharts) */}
      <TurnoverChart boutiqueId={currentBoutiqueId} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Product Catalog & Stock List (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Catalogue d'articles ({products.length})</span>
            <span>Touchez un article pour l'ajouter au panier</span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Catalogue vide
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Aucun produit enregistré. Ajoutez vos articles pour suivre vos stocks et enregistrer des ventes comptant ou à crédit.
              </p>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 transition-colors"
              >
                + Ajouter mon premier article
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.map((prod) => {
              const stock = prod.stockByBoutique[currentBoutiqueId] || 0;
              const isLow = stock <= prod.minThreshold;
              const cartItem = cart.find((i) => i.product.id === prod.id);

              return (
                <div
                  key={prod.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    cartItem
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {prod.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {prod.name}
                        </h4>
                      </div>
                      <span className="text-xs font-bold tabular-nums text-slate-900 dark:text-white shrink-0">
                        {formatCurrency(prod.sellPrice, merchant.currency)}
                      </span>
                    </div>

                    {/* Stock level info */}
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                        <span className={isLow ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-600 dark:text-slate-300'}>
                          Stock : {stock} {prod.unit}s {isLow ? '(Alerte bas)' : ''}
                        </span>
                      </div>
                      <button
                        onClick={() => setRestockProduct(prod)}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                        title="Ajouter du stock"
                      >
                        + Réappro.
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart button */}
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Unité : {prod.unit}
                    </span>
                    <button
                      onClick={() => addToCart(prod)}
                      disabled={stock <= 0}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 transition-transform active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      {cartItem ? `Dans le panier (${cartItem.quantity})` : '+ Vendre'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* Right: POS Quick Checkout Cart (1 Col on lg) */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  Panier Caisse ({cart.length})
                </h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-rose-500 hover:underline"
                >
                  Vider
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="py-3 max-h-60 overflow-y-auto space-y-2">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Le panier est vide.<br />Sélectionnez un article à gauche pour l'ajouter.
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex-1 truncate pr-2">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {item.product.name}
                      </div>
                      <div className="text-[11px] text-slate-500 tabular-nums">
                        {formatCurrency(item.product.sellPrice, merchant.currency)} / {item.product.unit}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
                        <button
                          onClick={() => updateCartQty(item.product.id, -1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.product.id, 1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Total */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-baseline justify-between">
              <span className="text-xs text-slate-500 font-semibold uppercase">Total à encaisser :</span>
              <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(cartTotal, merchant.currency)}
              </span>
            </div>

            {/* Checkout Form */}
            {cart.length > 0 && (
              <form onSubmit={handleCheckout} className="mt-4 space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                {/* Sale Mode Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Modalité de vente
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSaleType('comptant')}
                      className={`p-2 rounded-xl text-xs font-bold text-center border transition-all ${
                        saleType === 'comptant'
                          ? 'border-slate-950 dark:border-white bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      💵 Comptant
                    </button>
                    <button
                      type="button"
                      onClick={() => setSaleType('credit')}
                      className={`p-2 rounded-xl text-xs font-bold text-center border transition-all ${
                        saleType === 'credit'
                          ? 'border-slate-950 dark:border-white bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      📝 Sur Ardoise (Crédit)
                    </button>
                  </div>
                </div>

                {/* If credit, client picker */}
                {saleType === 'credit' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Client débité (Compte commun)
                    </label>
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      required
                    >
                      <option value="">Sélectionner le client...</option>
                      {contacts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.type})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* If cash, channel */}
                {saleType === 'comptant' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mode de paiement
                    </label>
                    <div className="grid grid-cols-3 gap-1 text-[11px]">
                      {['especes', 'wave', 'orange_money'].map((m) => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => setPaymentMethod(m as PaymentMethod)}
                          className={`py-1.5 rounded-lg border text-center font-medium capitalize ${
                            paymentMethod === m
                              ? 'border-slate-950 dark:border-white bg-slate-100 dark:bg-slate-800 font-bold'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600'
                          }`}
                        >
                          {m === 'especes' ? 'Espèces' : m === 'wave' ? 'Wave' : 'Orange M.'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-transform"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Encaisser & Générer le ticket</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white">Nouveau produit du catalogue</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nom de l'article</label>
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Ex : Riz Parfumé 25kg, Sucre Saint Louis..."
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Catégorie</label>
                  <input
                    type="text"
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Unité (Sac, Kg, Carton...)</label>
                  <input
                    type="text"
                    value={newProductUnit}
                    onChange={(e) => setNewProductUnit(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Prix d'achat unitaire</label>
                  <input
                    type="number"
                    value={newProductBuyPrice}
                    onChange={(e) => setNewProductBuyPrice(e.target.value)}
                    placeholder="Ex: 18000"
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Prix de vente unitaire</label>
                  <input
                    type="number"
                    value={newProductSellPrice}
                    onChange={(e) => setNewProductSellPrice(e.target.value)}
                    placeholder="Ex: 21500"
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Stock initial ({currentBoutique?.name})</label>
                  <input
                    type="number"
                    value={newProductInitialStock}
                    onChange={(e) => setNewProductInitialStock(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Seuil d'alerte</label>
                  <input
                    type="number"
                    value={newProductThreshold}
                    onChange={(e) => setNewProductThreshold(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-bold mt-2"
              >
                Enregistrer le produit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-sm">Réapprovisionnement de stock</h4>
              <button onClick={() => setRestockProduct(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs space-y-1">
              <div>Article : <strong>{restockProduct.name}</strong></div>
              <div>Boutique destinataire : <strong>{currentBoutique?.name}</strong></div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Quantité reçue ({restockProduct.unit}s)</label>
              <input
                type="number"
                min="1"
                value={restockQty}
                onChange={(e) => setRestockQty(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold text-sm"
              />
            </div>
            <button
              onClick={handleConfirmRestock}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              Valider l'entrée en stock
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

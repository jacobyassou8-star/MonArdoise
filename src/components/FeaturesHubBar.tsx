import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  PlusCircle, 
  UserPlus, 
  ShoppingCart, 
  CreditCard, 
  Download, 
  Building2, 
  ShieldCheck, 
  Tag, 
  FileCheck, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  Search, 
  ChevronRight, 
  ChevronDown,
  X,
  TrendingUp,
  UserCheck,
  ShieldAlert
} from 'lucide-react';


interface FeaturesHubBarProps {
  onOpenNewTx: () => void;
  onOpenNewContact: () => void;
  onNavigateTab: (tab: 'accounts' | 'stock' | 'boutiques' | 'audit') => void;
  onOpenPayments: () => void;
  onOpenExport: () => void;
  onOpenPricing: () => void;
  onOpenKyc: () => void;
  onOpenReset: () => void;
}

export const FeaturesHubBar: React.FC<FeaturesHubBarProps> = ({
  onOpenNewTx,
  onOpenNewContact,
  onNavigateTab,
  onOpenPayments,
  onOpenExport,
  onOpenPricing,
  onOpenKyc,
  onOpenReset,
}) => {
  const { currentUser, switchUserRole } = useApp();
  const [showAllModal, setShowAllModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'operations' | 'stock' | 'payments' | 'admin'>('all');

  const allFeatures = [
    {
      id: 'new_tx',
      title: '+ Opération Ardoise',
      description: 'Enregistrer une vente à crédit, un versement, une avance ou un prêt',
      category: 'operations',
      badge: 'Prioritaire',
      icon: PlusCircle,
      iconColor: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/70',
      action: onOpenNewTx,
    },
    {
      id: 'new_contact',
      title: '+ Nouveau Compte',
      description: 'Créer la fiche d\'un client, fournisseur, employé ou partenaire',
      category: 'operations',
      badge: 'Carnet',
      icon: UserPlus,
      iconColor: 'text-blue-600 bg-blue-100 dark:bg-blue-950/70',
      action: onOpenNewContact,
    },
    {
      id: 'overdue_alerts',
      title: 'Alertes & Relance Créances',
      description: 'Surveillance des impayés, relances WhatsApp et alertes programmées',
      category: 'operations',
      badge: 'Recouvrement',
      icon: ShieldAlert,
      iconColor: 'text-rose-600 bg-rose-100 dark:bg-rose-950/70',
      action: () => onNavigateTab('accounts'),
    },
    {
      id: 'sales_pos',
      title: 'Caisse & Vente Rapide',
      description: 'Point de vente rapide, calcul du panier et encaissement',
      category: 'stock',
      badge: 'Caisse',
      icon: ShoppingCart,
      iconColor: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950/70',
      action: () => onNavigateTab('stock'),
    },
    {
      id: 'payments',
      title: 'Paiements Marchands',
      description: 'Comptes Wave, Orange Money et MoMo sans conservation de fonds',
      category: 'payments',
      badge: 'Zéro commission',
      icon: CreditCard,
      iconColor: 'text-teal-600 bg-teal-100 dark:bg-teal-950/70',
      action: onOpenPayments,
    },
    {
      id: 'export',
      title: 'Exporter mes données',
      description: 'Télécharger l\'historique des transactions et les contacts en CSV ou PDF',
      category: 'admin',
      badge: 'CSV / PDF',
      icon: Download,
      iconColor: 'text-sky-600 bg-sky-100 dark:bg-sky-950/70',
      action: onOpenExport,
    },
    {
      id: 'turnover',
      title: 'Évolution du Chiffre d\'Affaires',
      description: 'Graphique Recharts des ventes journalières sur les 30 derniers jours',
      category: 'stock',
      badge: 'Recharts 30j',
      icon: TrendingUp,
      iconColor: 'text-amber-600 bg-amber-100 dark:bg-amber-950/70',
      action: () => onNavigateTab('stock'),
    },
    {
      id: 'boutiques',
      title: 'Boutiques & Équipe',
      description: 'Gestion multi-boutiques et assignation des employés / gérants',
      category: 'admin',
      badge: 'Multi-points',
      icon: Building2,
      iconColor: 'text-purple-600 bg-purple-100 dark:bg-purple-950/70',
      action: () => onNavigateTab('boutiques'),
    },
    {
      id: 'audit',
      title: 'Journal d\'Audit & Annulations',
      description: 'Traçabilité des opérations, contrôles de corrections réservés au gérant',
      category: 'admin',
      badge: 'Sécurité Gérant',
      icon: ShieldCheck,
      iconColor: 'text-rose-600 bg-rose-100 dark:bg-rose-950/70',
      action: () => onNavigateTab('audit'),
    },
    {
      id: 'role_switch',
      title: `Bascule de Rôle (${currentUser.role === 'gerant' ? 'Gérant' : 'Employé'})`,
      description: `Actuellement ${currentUser.name}. Cliquez pour basculer vers ${currentUser.role === 'gerant' ? 'Employé' : 'Gérant'}`,
      category: 'admin',
      badge: currentUser.role === 'gerant' ? 'Gérant' : 'Employé',
      icon: currentUser.role === 'gerant' ? ShieldCheck : UserCheck,
      iconColor: 'text-amber-600 bg-amber-100 dark:bg-amber-950/70',
      action: switchUserRole,
    },
    {
      id: 'pricing',
      title: 'Tarifs de Lancement (-20%)',
      description: 'Formules d\'abonnement à prix réduit (-20% appliqués)',
      category: 'admin',
      badge: '-20% Réduction',
      icon: Tag,
      iconColor: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/70',
      action: onOpenPricing,
    },
    {
      id: 'kyc',
      title: 'Conformité & RCCM',
      description: 'Informations administratives optionnelles (demandées uniquement si nécessaire)',
      category: 'admin',
      badge: 'Optionnel',
      icon: FileCheck,
      iconColor: 'text-blue-600 bg-blue-100 dark:bg-blue-950/70',
      action: onOpenKyc,
    },
    {
      id: 'reset',
      title: 'Réinitialiser toutes les données',
      description: 'Remise à zéro sécurisée avec double confirmation obligatoire',
      category: 'admin',
      badge: '2 étapes',
      icon: RotateCcw,
      iconColor: 'text-rose-600 bg-rose-100 dark:bg-rose-950/70',
      action: onOpenReset,
    },
  ];

  // Filtered list for the modal search
  const filteredFeatures = allFeatures.filter((feat) => {
    const matchesSearch = 
      !searchQuery ||
      feat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feat.badge.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = activeCategory === 'all' || feat.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mb-4">
      {/* Horizontal Sleek Features Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2.5 sm:p-3 shadow-xs">
        
        {/* Title bar + View All trigger */}
        <div className="flex items-center justify-between gap-2 px-1 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-200 font-bold">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Barre des fonctionnalités</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAllModal(true)}
            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <span>Toutes les fonctions ({allFeatures.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Quick Action Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none text-xs">
          {allFeatures.slice(0, 7).map((feat) => {
            const Icon = feat.icon;
            return (
              <button
                key={feat.id}
                type="button"
                onClick={feat.action}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200/80 dark:border-slate-700/80 whitespace-nowrap transition-all active:scale-95 shrink-0 group text-left"
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${feat.iconColor}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-xs">
                    {feat.title}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-none">
                    {feat.badge}
                  </div>
                </div>
              </button>
            );
          })}

          {/* More button chip */}
          <button
            type="button"
            onClick={() => setShowAllModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-bold text-xs whitespace-nowrap shrink-0 transition-transform active:scale-95 shadow-xs"
          >
            <span>+ Tout voir</span>
          </button>
        </div>
      </div>

      {/* Central Features Palette & Hub Modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-850">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    Hub des Fonctionnalités MonArdoise
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Toutes les actions et tous les modules accessibles en un clic
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Category Filters */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une fonctionnalité (ex: crédit, stock, export, paiement, audit)..."
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white"
                />
              </div>

              {/* Category tabs */}
              <div className="flex items-center gap-1 overflow-x-auto text-xs pb-0.5">
                {[
                  { id: 'all', label: 'Toutes les fonctions' },
                  { id: 'operations', label: 'Opérations & Comptes' },
                  { id: 'stock', label: 'Caisse & Stock' },
                  { id: 'payments', label: 'Paiements Marchands' },
                  { id: 'admin', label: 'Administration & Outils' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                      activeCategory === cat.id
                        ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Features */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredFeatures.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  Aucune fonctionnalité ne correspond à votre recherche "{searchQuery}".
                </div>
              ) : (
                filteredFeatures.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <button
                      key={feat.id}
                      type="button"
                      onClick={() => {
                        setShowAllModal(false);
                        feat.action();
                      }}
                      className="w-full p-3 rounded-2xl bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-750 transition-all text-left flex items-center justify-between gap-3 group shadow-xs active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${feat.iconColor}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {feat.title}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {feat.description}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {feat.badge}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs text-slate-500">
              <span>{allFeatures.length} fonctionnalités centralisées</span>
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-750 font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

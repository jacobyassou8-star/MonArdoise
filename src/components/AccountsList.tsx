import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Contact, ContactType } from '../types';
import { 
  calculateContactBalance, 
  calculateOverdueInfo,
  formatCurrency, 
  formatDate,
  getBalanceDisplay, 
  getContactTypeLabel, 
  generateWhatsAppReminderUrl,
  generateUrgentWhatsAppReminderUrl 
} from '../utils/formatters';
import { OverdueAlertsModal } from './OverdueAlertsModal';
import { 
  Search, 
  UserPlus, 
  Phone, 
  MessageSquare, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Building2,
  Users,
  AlertTriangle,
  Clock,
  Bell,
  Sliders,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

interface AccountsListProps {
  onSelectContact: (contact: Contact) => void;
  onOpenNewContact: () => void;
  onQuickTx: (contact: Contact) => void;
}

export const AccountsList: React.FC<AccountsListProps> = ({
  onSelectContact,
  onOpenNewContact,
  onQuickTx,
}) => {
  const { 
    contacts, 
    transactions, 
    merchant, 
    boutiques, 
    activeBoutiqueId, 
    totalReceivables, 
    totalPayables,
    overdueSettings,
    updateOverdueSettings,
    triggerOverdueAlertCheck,
    seedDemoOverdueAccount
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ContactType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'debtors' | 'creditors' | 'settled' | 'overdue'>('all');
  const [showOverdueModal, setShowOverdueModal] = useState<boolean>(false);


  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query) ||
        (c.address && c.address.toLowerCase().includes(query)) ||
        (c.notes && c.notes.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // Type match
      if (selectedType !== 'all' && c.type !== selectedType) {
        return false;
      }

      // Solde status match
      const balance = calculateContactBalance(c.id, transactions);
      if (statusFilter === 'debtors' && balance <= 0) return false;
      if (statusFilter === 'creditors' && balance >= 0) return false;
      if (statusFilter === 'settled' && balance !== 0) return false;
      if (statusFilter === 'overdue') {
        const ovInfo = calculateOverdueInfo(c.id, transactions, overdueSettings.thresholdDays);
        if (!ovInfo.isOverdue) return false;
      }

      return true;
    });
  }, [contacts, transactions, searchQuery, selectedType, statusFilter, overdueSettings.thresholdDays]);

  // Active debtors
  const debtorCount = useMemo(() => {
    return contacts.filter((c) => calculateContactBalance(c.id, transactions) > 0).length;
  }, [contacts, transactions]);

  // Overdue debtors tracking
  const overdueDebtors = useMemo(() => {
    return contacts
      .map((c) => ({
        contact: c,
        overdueInfo: calculateOverdueInfo(c.id, transactions, overdueSettings.thresholdDays),
      }))
      .filter((item) => item.overdueInfo.isOverdue)
      .sort((a, b) => b.overdueInfo.daysOverdue - a.overdueInfo.daysOverdue);
  }, [contacts, transactions, overdueSettings.thresholdDays]);

  const totalOverdueAmount = useMemo(() => {
    return overdueDebtors.reduce((sum, item) => sum + item.overdueInfo.balance, 0);
  }, [overdueDebtors]);

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-8">
      
      {/* Top Banner & KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* KPI 1: Total créances (Ce qu'on vous doit) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Créances à recouvrer</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
              {formatCurrency(totalReceivables, merchant.currency)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {debtorCount} personne{debtorCount > 1 ? 's' : ''} avec ardoise en cours
            </div>
          </div>
        </div>

        {/* KPI 2: Total avoirs / dettes commerçant */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Dettes & Avoirs commerçant</span>
            <TrendingDown className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCurrency(totalPayables, merchant.currency)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Avances perçues ou crédits fournisseurs
            </div>
          </div>
        </div>

        {/* KPI 3: Réseau & Multi-boutique status */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Réseau d'espace</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              {boutiques.length} boutiques actives
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Comptes clients communs dans tout l'espace
            </div>
          </div>
        </div>

      </div>

      {/* Overdue Debt Recovery & Scheduled Notification Center */}
      {overdueDebtors.length > 0 ? (
        <div className="rounded-2xl border-2 border-rose-300 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/25 p-4 sm:p-5 shadow-xs transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                    Système d'Alerte & Créances en Souffrance
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100">
                    {overdueDebtors.length} compte{overdueDebtors.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  <span className="text-rose-600 dark:text-rose-400 tabular-nums">
                    {formatCurrency(totalOverdueAmount, merchant.currency)}
                  </span>
                  {' '}impayés depuis plus de {overdueSettings.thresholdDays} jours
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    Rappels : {overdueSettings.enabled ? (
                      overdueSettings.cadence === 'weekly_monday' ? 'Chaque lundi 08h' :
                      overdueSettings.cadence === 'daily' ? 'Quotidien' : 'Fin de mois'
                    ) : 'Désactivés'}
                  </span>
                  <span>·</span>
                  <span>Seuil : {overdueSettings.thresholdDays}j</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => setStatusFilter(statusFilter === 'overdue' ? 'all' : 'overdue')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'overdue'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 hover:bg-rose-100'
                }`}
              >
                {statusFilter === 'overdue' ? 'Afficher tous' : 'Filtrer ces retards'}
              </button>
              <button
                onClick={() => setShowOverdueModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Gérer les relances</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Status Banner when no overdue accounts exist */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Surveillance des retards active (Seuil : {overdueSettings.thresholdDays} jours)
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Aucune créance en retard critique détectée. Rappels programmés : {overdueSettings.enabled ? 'Actifs' : 'En pause'}.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={seedDemoOverdueAccount}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
              title="Créer un compte exemple avec un retard de 35 jours pour tester l'alerte"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Tester l'alerte</span>
            </button>
            <button
              onClick={() => setShowOverdueModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Paramètres alertes</span>
            </button>
          </div>
        </div>
      )}


      {/* Control bar: Search + Add contact + Category tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 space-y-3 shadow-xs">
        
        {/* Search & New button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, téléphone, quartier..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white transition-all"
            />
          </div>
          <button
            onClick={onOpenNewContact}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 transition-colors whitespace-nowrap min-h-[40px]"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau Compte</span>
            <span className="sm:hidden">Créer</span>
          </button>
        </div>

        {/* Filter Tab Row 1: Contact Category */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {(
            [
              { id: 'all', label: 'Tous les comptes', count: contacts.length },
              { id: 'client', label: 'Clients', count: contacts.filter(c => c.type === 'client').length },
              { id: 'fournisseur', label: 'Fournisseurs', count: contacts.filter(c => c.type === 'fournisseur').length },
              { id: 'employe', label: 'Employés', count: contacts.filter(c => c.type === 'employe').length },
              { id: 'partenaire', label: 'Partenaires', count: contacts.filter(c => c.type === 'partenaire').length },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedType === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Filter Tab Row 2: Balance Status */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-slate-400 text-[11px] whitespace-nowrap mr-1">Filtrer solde :</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Tous les soldes
          </button>
          <button
            onClick={() => setStatusFilter('debtors')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'debtors'
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 font-semibold'
                : 'text-amber-600 hover:text-amber-800 dark:text-amber-400'
            }`}
          >
            Doivent au commerçant ({contacts.filter(c => calculateContactBalance(c.id, transactions) > 0).length})
          </button>
          <button
            onClick={() => setStatusFilter('creditors')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'creditors'
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 font-semibold'
                : 'text-emerald-600 hover:text-emerald-800 dark:text-emerald-400'
            }`}
          >
            Ont un avoir ({contacts.filter(c => calculateContactBalance(c.id, transactions) < 0).length})
          </button>
          <button
            onClick={() => setStatusFilter('settled')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'settled'
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Soldés à 0 ({contacts.filter(c => calculateContactBalance(c.id, transactions) === 0).length})
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'overdue'
                ? 'bg-rose-600 text-white shadow-xs'
                : overdueDebtors.length > 0
                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <span>🚨 Retards critiques (&gt; {overdueSettings.thresholdDays}j)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-200 dark:bg-rose-900 text-rose-950 dark:text-rose-100 font-extrabold">
              {overdueDebtors.length}
            </span>
          </button>
        </div>

      </div>

      {/* Directory of Accounts */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>{filteredContacts.length} compte{filteredContacts.length > 1 ? 's' : ''} trouvé{filteredContacts.length > 1 ? 's' : ''}</span>
          <span>Solde global consolidé</span>
        </div>

        {filteredContacts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {statusFilter === 'overdue' ? 'Aucune créance en retard critique' : 'Aucun compte correspondant'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {statusFilter === 'overdue' 
                ? `Aucun compte n'a dépassé le seuil de retard de ${overdueSettings.thresholdDays} jours. Tout est sous contrôle.`
                : searchQuery 
                ? `Aucun résultat pour "${searchQuery}".` 
                : 'Commencez par ajouter un client, fournisseur ou employé pour ouvrir son ardoise.'}
            </p>
            {statusFilter === 'overdue' ? (
              <button
                onClick={() => setStatusFilter('all')}
                className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 transition-colors"
              >
                Afficher tous les comptes
              </button>
            ) : (
              <button
                onClick={onOpenNewContact}
                className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 transition-colors"
              >
                + Ajouter une personne
              </button>
            )}
          </div>
        ) : (
          filteredContacts.map((contact) => {
            const balance = calculateContactBalance(contact.id, transactions);
            const balanceDisplay = getBalanceDisplay(balance, merchant.currency, contact.type);
            const txCount = transactions.filter(t => t.status === 'active' && t.personId === contact.id).length;
            const overdueInfo = calculateOverdueInfo(contact.id, transactions, overdueSettings.thresholdDays);
            
            // Per-boutique breakdown
            const boutiqueBreakdown = boutiques
              .map((b) => ({
                boutiqueName: b.name,
                boutiqueColor: b.color,
                balance: calculateContactBalance(contact.id, transactions, b.id),
              }))
              .filter((item) => item.balance !== 0);

            return (
              <div
                key={contact.id}
                className={`group relative bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 transition-all shadow-xs ${
                  overdueInfo.isOverdue
                    ? 'border-2 border-rose-300 dark:border-rose-800/80 bg-rose-50/20 dark:bg-rose-950/15 hover:border-rose-400'
                    : 'border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  
                  {/* Left: Contact Info */}
                  <div 
                    onClick={() => onSelectContact(contact)}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {contact.name}
                      </h4>
                      {overdueInfo.isOverdue && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white flex items-center gap-1 shadow-xs animate-pulse">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>Retard {overdueInfo.daysOverdue}j</span>
                        </span>
                      )}
                    </div>

                    {/* Clean unboxed metadata with dot separators */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {getContactTypeLabel(contact.type)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {contact.phone}
                      </span>
                      {contact.address && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="truncate max-w-[150px] sm:max-w-[200px]">{contact.address}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span>{txCount} opération{txCount > 1 ? 's' : ''}</span>
                    </div>

                    {/* Overdue alert badge & recovery info */}
                    {overdueInfo.isOverdue ? (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300 dark:border-rose-800">
                          <Clock className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          <span>{overdueInfo.daysOverdue} jours sans versement</span>
                        </span>
                        {overdueInfo.lastPaymentDate ? (
                          <span className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">
                            (Dernier versement : {formatDate(overdueInfo.lastPaymentDate)})
                          </span>
                        ) : (
                          <span className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">
                            (Aucun versement depuis ouverture du crédit)
                          </span>
                        )}
                      </div>
                    ) : overdueInfo.status === 'moderate' ? (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-2.5 h-2.5 text-amber-600" />
                          <span>{overdueInfo.daysOverdue} jours sans versement</span>
                        </span>
                      </div>
                    ) : null}

                    {/* Multi-boutique attribution indicator */}
                    {boutiqueBreakdown.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[11px]">
                        <span className="text-slate-400 text-[10px]">Répartition boutiques :</span>
                        {boutiqueBreakdown.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]"
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.boutiqueColor }} />
                            <span className="truncate max-w-[100px]">{item.boutiqueName}:</span>
                            <span className="font-semibold tabular-nums">
                              {formatCurrency(item.balance, merchant.currency)}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Balance Display & Quick Actions */}
                  <div className="flex flex-col items-end shrink-0">
                    <div className="text-right">
                      <div className={`text-base sm:text-lg font-bold tracking-tight tabular-nums ${
                        overdueInfo.isOverdue ? 'text-rose-600 dark:text-rose-400' : balanceDisplay.textClass
                      }`}>
                        {balance > 0 ? `+${formatCurrency(balance, merchant.currency)}` : formatCurrency(balance, merchant.currency)}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {overdueInfo.isOverdue ? 'Retard critique' : balanceDisplay.sublabel}
                      </div>
                    </div>

                    {/* Quick Action buttons */}
                    <div className="flex items-center gap-1.5 mt-2">
                      {/* Urgent WhatsApp recovery button if overdue */}
                      {overdueInfo.isOverdue ? (
                        <a
                          href={generateUrgentWhatsAppReminderUrl(
                            contact,
                            balance,
                            overdueInfo.daysOverdue,
                            overdueInfo.lastPaymentDate,
                            merchant.businessName,
                            merchant.currency,
                            {
                              waveNumber: merchant.paymentAccounts.waveNumber,
                              orangeMoneyCode: merchant.paymentAccounts.orangeMoneyCode,
                              mtnMoMoNumber: merchant.paymentAccounts.mtnMoMoNumber,
                            }
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
                          title="Envoyer une relance de recouvrement urgente sur WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Relance Urgente</span>
                          <span className="sm:hidden">Urgent</span>
                        </a>
                      ) : balance > 0 ? (
                        /* Standard WhatsApp reminder button if debtor */
                        <a
                          href={generateWhatsAppReminderUrl(contact, balance, merchant.businessName, merchant.currency)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                          title="Envoyer un rappel de solde sur WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                      ) : null}

                      {/* "+ Opération" button */}
                      <button
                        onClick={() => onQuickTx(contact)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                        title="Enregistrer une opération pour ce compte"
                      >
                        + Opération
                      </button>

                      {/* Open details chevron */}
                      <button
                        onClick={() => onSelectContact(contact)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        title="Voir l'historique complet"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            );
          })
        )}

      </div>

      {/* Modal for managing overdue alerts & scheduled recovery system */}
      <OverdueAlertsModal
        isOpen={showOverdueModal}
        onClose={() => setShowOverdueModal(false)}
        onSelectContact={onSelectContact}
      />

    </div>
  );
};


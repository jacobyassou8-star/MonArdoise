import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Contact } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  calculateOverdueInfo, 
  generateUrgentWhatsAppReminderUrl 
} from '../utils/formatters';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  MessageSquare, 
  Copy, 
  Check, 
  ShieldAlert, 
  Sliders, 
  Send, 
  UserCheck, 
  Sparkles,
  Volume2
} from 'lucide-react';

interface OverdueAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact: (contact: Contact) => void;
}

export const OverdueAlertsModal: React.FC<OverdueAlertsModalProps> = ({
  isOpen,
  onClose,
  onSelectContact,
}) => {
  const {
    contacts,
    transactions,
    merchant,
    overdueSettings,
    updateOverdueSettings,
    requestBrowserNotificationPermission,
    triggerOverdueAlertCheck,
    seedDemoOverdueAccount,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'debtors' | 'config'>('debtors');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Compute overdue debtors based on current threshold
  const overdueDebtors = contacts
    .map((c) => ({
      contact: c,
      overdueInfo: calculateOverdueInfo(c.id, transactions, overdueSettings.thresholdDays),
    }))
    .filter((item) => item.overdueInfo.isOverdue)
    .sort((a, b) => b.overdueInfo.daysOverdue - a.overdueInfo.daysOverdue);

  const totalOverdueAmount = overdueDebtors.reduce(
    (sum, item) => sum + item.overdueInfo.balance,
    0
  );

  const handleCopyMessage = (item: typeof overdueDebtors[0]) => {
    const url = generateUrgentWhatsAppReminderUrl(
      item.contact,
      item.overdueInfo.balance,
      item.overdueInfo.daysOverdue,
      item.overdueInfo.lastPaymentDate,
      merchant.businessName,
      merchant.currency,
      {
        waveNumber: merchant.paymentAccounts.waveNumber,
        orangeMoneyCode: merchant.paymentAccounts.orangeMoneyCode,
        mtnMoMoNumber: merchant.paymentAccounts.mtnMoMoNumber,
      }
    );
    const textPart = decodeURIComponent(url.split('text=')[1] || '');
    navigator.clipboard.writeText(textPart);
    setCopiedId(item.contact.id);
    showToast(`Message de relance copié pour ${item.contact.name}`, 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCadenceChange = (cadence: 'weekly_monday' | 'daily' | 'monthly') => {
    updateOverdueSettings({ cadence });
  };

  const handleThresholdChange = (thresholdDays: number) => {
    updateOverdueSettings({ thresholdDays });
  };

  const isBrowserNotificationGranted =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'granted';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Centre de Relance & Créances
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Système d'alerte et de recouvrement des impayés
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Banner */}
        <div className="px-4 sm:px-5 py-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900/40 flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              Créances en retard (&gt; {overdueSettings.thresholdDays} jours)
            </div>
            <div className="text-lg sm:text-xl font-bold text-amber-950 dark:text-amber-200 tabular-nums">
              {formatCurrency(totalOverdueAmount, merchant.currency)}
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{overdueDebtors.length} compte{overdueDebtors.length > 1 ? 's' : ''} en retard</span>
            </div>
            <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
              Rappels : {overdueSettings.enabled ? 'Programmés' : 'Désactivés'}
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-4 sm:px-5 bg-white dark:bg-slate-900 shrink-0">
          <button
            onClick={() => setActiveTab('debtors')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'debtors'
                ? 'border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <UsersIcon className="w-4 h-4" />
            <span>Comptes à relancer ({overdueDebtors.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'config'
                ? 'border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Planification & Seuils</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'debtors' ? (
            <div className="space-y-3">
              {overdueDebtors.length === 0 ? (
                <div className="py-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                  <UserCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Aucune créance en retard critique !
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Tous vos clients et débiteurs sont à jour ou n'ont pas encore dépassé le seuil de retard fixé à {overdueSettings.thresholdDays} jours.
                  </p>
                  
                  <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                      Vous souhaitez tester le système de relance WhatsApp et d'alerte programmée ?
                    </p>
                    <button
                      onClick={seedDemoOverdueAccount}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Générer un compte test en retard (35 jours)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Classés par urgence de retard</span>
                    <span>Action directe WhatsApp</span>
                  </div>

                  {overdueDebtors.map(({ contact, overdueInfo }) => {
                    const urgentUrl = generateUrgentWhatsAppReminderUrl(
                      contact,
                      overdueInfo.balance,
                      overdueInfo.daysOverdue,
                      overdueInfo.lastPaymentDate,
                      merchant.businessName,
                      merchant.currency,
                      {
                        waveNumber: merchant.paymentAccounts.waveNumber,
                        orangeMoneyCode: merchant.paymentAccounts.orangeMoneyCode,
                        mtnMoMoNumber: merchant.paymentAccounts.mtnMoMoNumber,
                      }
                    );

                    return (
                      <div
                        key={contact.id}
                        className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-900/50 shadow-xs flex flex-col gap-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div 
                            className="cursor-pointer"
                            onClick={() => {
                              onSelectContact(contact);
                              onClose();
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white hover:text-amber-600 transition-colors">
                                {contact.name}
                              </h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{overdueInfo.daysOverdue} jours</span>
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-2">
                              <span>Tél : {contact.phone}</span>
                              {contact.address && <span>· {contact.address}</span>}
                              {overdueInfo.lastPaymentDate ? (
                                <span className="text-rose-600 dark:text-rose-400">
                                  · Dernier versement le {formatDate(overdueInfo.lastPaymentDate)}
                                </span>
                              ) : (
                                <span className="text-rose-600 dark:text-rose-400">
                                  · Aucun versement depuis l'ouverture du crédit
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                              {formatCurrency(overdueInfo.balance, merchant.currency)}
                            </div>
                            <div className="text-[10px] text-slate-400">Reste dû</div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handleCopyMessage({ contact, overdueInfo })}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                            title="Copier le message de relance dans le presse-papier"
                          >
                            {copiedId === contact.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600 font-semibold">Copié</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copier texte</span>
                              </>
                            )}
                          </button>

                          <a
                            href={urgentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Relancer WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          ) : (
            /* Tab Configuration & Scheduling */
            <div className="space-y-5">
              {/* Threshold Configuration */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Seuil d'alerte des créances en retard
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Définissez après combien de jours sans versement un compte est automatiquement classé en <strong>retard critique</strong> et nécessite une relance.
                </p>
                
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[15, 30, 45, 60].map((days) => (
                    <button
                      key={days}
                      onClick={() => handleThresholdChange(days)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                        overdueSettings.thresholdDays === days
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {days} jours
                      {days === 30 && <span className="block text-[9px] font-normal opacity-90">(Défaut)</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scheduled cadence configuration */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Rappels automatiques programmés
                    </h4>
                  </div>
                  
                  {/* Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overdueSettings.enabled}
                      onChange={(e) => updateOverdueSettings({ enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">
                  L'application analyse régulièrement les impayés et affiche des alertes récapitulatives prioritaires à chaque ouverture de commerce.
                </p>

                {overdueSettings.enabled && (
                  <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Fréquence de vérification & notification :
                    </div>
                    
                    <div className="space-y-1.5">
                      {[
                        {
                          id: 'weekly_monday',
                          title: 'Tous les lundis à 08h00 (Recommandé)',
                          desc: 'Idéal pour démarrer la semaine commerciale en envoyant la tournée de relances.',
                        },
                        {
                          id: 'daily',
                          title: 'Quotidien (Chaque matin)',
                          desc: 'Vérification quotidienne à la première ouverture de caisse.',
                        },
                        {
                          id: 'monthly',
                          title: 'Mensuel (Chaque fin de mois)',
                          desc: 'Pour les commerces fonctionnant au relevé mensuel de solde.',
                        },
                      ].map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleCadenceChange(item.id as any)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                            overdueSettings.cadence === item.id
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750'
                          }`}
                        >
                          <input
                            type="radio"
                            name="cadence"
                            checked={overdueSettings.cadence === item.id}
                            onChange={() => handleCadenceChange(item.id as any)}
                            className="mt-0.5 text-amber-600 focus:ring-amber-500"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {item.desc}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Browser Push Notifications */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Notifications système du navigateur
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Recevez une notification native sur votre téléphone ou ordinateur dès qu'une créance dépasse le seuil critique.
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Statut : </span>
                    <span className={`font-semibold ${
                      isBrowserNotificationGranted ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {isBrowserNotificationGranted ? 'Actif & Autorisé' : 'Non autorisé'}
                    </span>
                  </div>

                  {!isBrowserNotificationGranted ? (
                    <button
                      onClick={requestBrowserNotificationPermission}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    >
                      Autoriser les notifications
                    </button>
                  ) : (
                    <button
                      onClick={() => triggerOverdueAlertCheck(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Tester l'alerte système</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
                <button
                  onClick={seedDemoOverdueAccount}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ajouter compte test (35 jours)</span>
                </button>

                <button
                  onClick={() => triggerOverdueAlertCheck(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Lancer une vérification manuelle</span>
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Seuil actif : <strong>{overdueSettings.thresholdDays} jours</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  Users, 
  Receipt, 
  CheckCircle2, 
  Building2, 
  FileText,
  FileCheck2
} from 'lucide-react';
import { 
  exportContactsToCSV, 
  exportTransactionsToCSV, 
  printReportPDF 
} from '../utils/exportUtils';
import { formatCurrency } from '../utils/formatters';

interface ExportDataModalProps {
  onClose: () => void;
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({ onClose }) => {
  const { 
    merchant, 
    boutiques, 
    contacts, 
    transactions, 
    activeBoutiqueId, 
    totalReceivables, 
    totalPayables,
    showToast 
  } = useApp();

  const [scope, setScope] = useState<'all' | 'active'>('all');

  // Filter transactions according to selected scope
  const targetTransactions = scope === 'active' && activeBoutiqueId !== 'all'
    ? transactions.filter((t) => t.boutiqueId === activeBoutiqueId)
    : transactions;

  const activeBoutiqueObj = boutiques.find((b) => b.id === activeBoutiqueId);

  const handleExportTransactionsCSV = () => {
    exportTransactionsToCSV(targetTransactions, contacts, boutiques, merchant.currency);
    showToast('Fichier CSV des transactions téléchargé avec succès');
  };

  const handleExportContactsCSV = () => {
    exportContactsToCSV(contacts, targetTransactions, boutiques, merchant.currency);
    showToast('Fichier CSV des contacts et soldes téléchargé avec succès');
  };

  const handleExportTransactionsPDF = () => {
    printReportPDF('transactions', merchant, boutiques, contacts, targetTransactions);
    showToast('Aperçu PDF des transactions généré');
  };

  const handleExportContactsPDF = () => {
    printReportPDF('contacts', merchant, boutiques, contacts, targetTransactions);
    showToast('Aperçu PDF du carnet de comptes généré');
  };

  const handleExportFullPDF = () => {
    printReportPDF('full', merchant, boutiques, contacts, targetTransactions);
    showToast('Rapport complet consolidé généré pour impression / PDF');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-bold">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Exporter mes données
              </h3>
              <p className="text-[11px] text-slate-500">
                Téléchargement direct au format CSV (Excel) ou PDF officiel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          
          {/* Scope selection toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                Périmètre d'exportation
              </div>
              <div className="text-[11px] text-slate-500">
                {scope === 'all' 
                  ? `Toutes les boutiques de l'espace (${boutiques.length} boutiques)` 
                  : `Uniquement la boutique active : ${activeBoutiqueObj?.name || 'Active'}`}
              </div>
            </div>

            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  scope === 'all'
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Espace global (Toutes)
              </button>
              {activeBoutiqueId !== 'all' && (
                <button
                  type="button"
                  onClick={() => setScope('active')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    scope === 'active'
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Boutique active
                </button>
              )}
            </div>
          </div>

          {/* Module 1: Transactions & Operations */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-500" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    1. Historique des Transactions & Opérations
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {targetTransactions.length} opération{targetTransactions.length > 1 ? 's' : ''} (ventes à crédit, versements, avances, remboursements et annulations)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* CSV Button */}
              <button
                type="button"
                onClick={handleExportTransactionsCSV}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-left flex items-center gap-3 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="flex-1 truncate">
                  <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    Télécharger en CSV
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Format Excel / Google Sheets
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </button>

              {/* PDF Button */}
              <button
                type="button"
                onClick={handleExportTransactionsPDF}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-left flex items-center gap-3 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                  <Printer className="w-5 h-5" />
                </div>
                <div className="flex-1 truncate">
                  <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    Imprimer / PDF
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Rapport officiel prêt à imprimer
                  </div>
                </div>
                <Printer className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>
            </div>
          </div>

          {/* Module 2: Contacts & Balances Directory */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    2. Carnet des Comptes & Soldes (Clients & Fournisseurs)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {contacts.length} personnes inscrites · Total créances : {formatCurrency(totalReceivables, merchant.currency)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* CSV Button */}
              <button
                type="button"
                onClick={handleExportContactsCSV}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-left flex items-center gap-3 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="flex-1 truncate">
                  <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    Télécharger en CSV
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Soldes, téléphones et adresses
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </button>

              {/* PDF Button */}
              <button
                type="button"
                onClick={handleExportContactsPDF}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-left flex items-center gap-3 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                  <Printer className="w-5 h-5" />
                </div>
                <div className="flex-1 truncate">
                  <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    Imprimer / PDF
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Carnet d'ardoise récapitulatif
                  </div>
                </div>
                <Printer className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>
            </div>
          </div>

          {/* Module 3: Full Consolidated Report */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">
                  Grand Livre Consolidé Complet (PDF)
                </h4>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 max-w-md">
                Génère en un seul document l'en-tête de votre espace, la synthèse des créances, le carnet de tous vos contacts et l'historique complet des écritures.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportFullPDF}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 transition-transform active:scale-95 shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>Générer Bilan Complet (PDF)</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs text-slate-500">
          <span>Format CSV encodé en UTF-8 (compatible Excel et tableurs français)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

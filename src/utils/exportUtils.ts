import { Boutique, Contact, MerchantProfile, Transaction } from '../types';
import { 
  calculateContactBalance, 
  formatCurrency, 
  formatDateTime, 
  formatFullDateTime, 
  getContactTypeLabel, 
  getPaymentMethodLabel, 
  getTransactionTypeLabel 
} from './formatters';

/**
 * Escapes a field for CSV (RFC 4180).
 * Wraps with quotes if it contains semicolon, comma, newline, or quotes.
 */
function escapeCSV(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Triggers a file download in the browser.
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates CSV for Transactions.
 * Uses semicolon ';' delimiter standard in French Excel environments.
 * Adds UTF-8 BOM '\uFEFF' so Excel displays accents and special characters properly.
 */
export function exportTransactionsToCSV(
  transactions: Transaction[],
  contacts: Contact[],
  boutiques: Boutique[],
  currency: string = 'FCFA'
): void {
  const headers = [
    'N° Reçu',
    'Date & Heure',
    'Type d\'opération',
    'Montant',
    'Devise',
    'Bénéficiaire (Personne)',
    'Téléphone Bénéficiaire',
    'Boutique',
    'Auteur',
    'Rôle Auteur',
    'Canal de paiement',
    'Référence',
    'Statut',
    'Description / Articles',
    'Annulé le',
    'Annulé par',
    'Motif d\'annulation',
  ];

  const rows = transactions.map((t) => {
    const contact = contacts.find((c) => c.id === t.personId);
    const boutique = boutiques.find((b) => b.id === t.boutiqueId);
    const typeInfo = getTransactionTypeLabel(t.type);

    return [
      escapeCSV(t.receiptNumber),
      escapeCSV(formatDateTime(t.timestamp)),
      escapeCSV(typeInfo.label),
      escapeCSV(t.amount),
      escapeCSV(currency),
      escapeCSV(contact ? contact.name : 'Vente directe'),
      escapeCSV(contact ? contact.phone : ''),
      escapeCSV(boutique ? boutique.name : 'Inconnue'),
      escapeCSV(t.authorName),
      escapeCSV(t.authorRole === 'gerant' ? 'Gérant' : 'Employé'),
      escapeCSV(getPaymentMethodLabel(t.paymentMethod)),
      escapeCSV(t.reference || ''),
      escapeCSV(t.status === 'cancelled' ? 'Annulée' : 'Valide'),
      escapeCSV(t.description || ''),
      escapeCSV(t.cancelledAt ? formatDateTime(t.cancelledAt) : ''),
      escapeCSV(t.cancelledBy ? `${t.cancelledBy.name} (${t.cancelledBy.role})` : ''),
      escapeCSV(t.cancelReason || ''),
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `monardoise_transactions_${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Generates CSV for Contacts and their unified balances.
 */
export function exportContactsToCSV(
  contacts: Contact[],
  transactions: Transaction[],
  boutiques: Boutique[],
  currency: string = 'FCFA'
): void {
  const headers = [
    'Nom / Raison Sociale',
    'Catégorie',
    'Téléphone',
    'Adresse / Quartier',
    'Solde Global Unifié',
    'Situation du Solde',
    'Devise',
    'Nombre d\'opérations',
    'Plafond Crédit Autorisé',
    'N° CNI',
    'RCCM',
    'Notes',
    'Date de création',
  ];

  const rows = contacts.map((c) => {
    const balance = calculateContactBalance(c.id, transactions);
    const txCount = transactions.filter((t) => t.personId === c.id && t.status === 'active').length;
    let situation = 'Soldé à jour';
    if (balance > 0) situation = 'Doit au commerçant (Créance)';
    if (balance < 0) situation = 'Avoir (Le commerçant lui doit)';

    return [
      escapeCSV(c.name),
      escapeCSV(getContactTypeLabel(c.type)),
      escapeCSV(c.phone),
      escapeCSV(c.address || ''),
      escapeCSV(balance),
      escapeCSV(situation),
      escapeCSV(currency),
      escapeCSV(txCount),
      escapeCSV(c.creditLimit || ''),
      escapeCSV(c.idCardNumber || ''),
      escapeCSV(c.rccm || ''),
      escapeCSV(c.notes || ''),
      escapeCSV(c.createdAt ? formatDateTime(c.createdAt) : ''),
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `monardoise_contacts_carnet_${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Triggers a browser print / PDF download dialog for a full formatted report.
 */
export function printReportPDF(
  type: 'transactions' | 'contacts' | 'full',
  merchant: MerchantProfile,
  boutiques: Boutique[],
  contacts: Contact[],
  transactions: Transaction[]
): void {
  const totalReceivables = contacts.reduce((sum, c) => {
    const bal = calculateContactBalance(c.id, transactions);
    return bal > 0 ? sum + bal : sum;
  }, 0);

  const totalPayables = contacts.reduce((sum, c) => {
    const bal = calculateContactBalance(c.id, transactions);
    return bal < 0 ? sum + Math.abs(bal) : sum;
  }, 0);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Veuillez autoriser les fenêtres pop-up pour générer le rapport PDF.');
    return;
  }

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let contentHtml = '';

  if (type === 'full' || type === 'contacts') {
    contentHtml += `
      <div class="section">
        <h2>Carnet des Comptes & Soldes Clients / Partenaires</h2>
        <table>
          <thead>
            <tr>
              <th>Nom / Personne</th>
              <th>Catégorie</th>
              <th>Téléphone</th>
              <th>Adresse</th>
              <th style="text-align: right;">Solde Unifié</th>
              <th>Situation</th>
            </tr>
          </thead>
          <tbody>
            ${contacts.map((c) => {
              const bal = calculateContactBalance(c.id, transactions);
              const color = bal > 0 ? '#b45309' : bal < 0 ? '#047857' : '#64748b';
              const text = bal > 0 ? `Doit ${formatCurrency(bal, merchant.currency)}` : bal < 0 ? `Avoir ${formatCurrency(Math.abs(bal), merchant.currency)}` : 'À jour';
              return `
                <tr>
                  <td><strong>${c.name}</strong></td>
                  <td>${getContactTypeLabel(c.type)}</td>
                  <td>${c.phone}</td>
                  <td>${c.address || '-'}</td>
                  <td style="text-align: right; font-weight: bold; color: ${color};">${bal > 0 ? '+' : ''}${formatCurrency(bal, merchant.currency)}</td>
                  <td style="color: ${color}; font-size: 11px;">${text}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (type === 'full' || type === 'transactions') {
    contentHtml += `
      <div class="section" style="margin-top: 30px;">
        <h2>Historique Récent des Transactions & Opérations d'Ardoise</h2>
        <table>
          <thead>
            <tr>
              <th>N° Reçu</th>
              <th>Date</th>
              <th>Opération</th>
              <th>Bénéficiaire</th>
              <th>Boutique</th>
              <th>Auteur</th>
              <th>Mode</th>
              <th style="text-align: right;">Montant</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.slice(0, 50).map((t) => {
              const contact = contacts.find((c) => c.id === t.personId);
              const boutique = boutiques.find((b) => b.id === t.boutiqueId);
              const typeInfo = getTransactionTypeLabel(t.type);
              const isCancelled = t.status === 'cancelled';
              return `
                <tr style="${isCancelled ? 'background-color: #fef2f2; text-decoration: line-through; color: #991b1b;' : ''}">
                  <td><code>${t.receiptNumber}</code></td>
                  <td>${formatDateTime(t.timestamp)}</td>
                  <td>${typeInfo.label}</td>
                  <td>${contact ? contact.name : 'Vente directe'}</td>
                  <td>${boutique ? boutique.name : '-'}</td>
                  <td>${t.authorName} (${t.authorRole})</td>
                  <td>${getPaymentMethodLabel(t.paymentMethod)}</td>
                  <td style="text-align: right; font-weight: bold;">${typeInfo.sign}${formatCurrency(t.amount, merchant.currency)}</td>
                  <td>${isCancelled ? 'Annulée' : 'Valide'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>MonArdoise - Rapport Officiel ${merchant.businessName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          margin: 40px;
          color: #0f172a;
          line-height: 1.4;
          font-size: 12px;
        }
        .header {
          border-bottom: 2px solid #0f172a;
          padding-bottom: 15px;
          margin-bottom: 25px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .header h1 {
          margin: 0;
          font-size: 22px;
          text-transform: uppercase;
          letter-spacing: -0.5px;
        }
        .header p {
          margin: 3px 0 0;
          color: #64748b;
          font-size: 11px;
        }
        .summary-cards {
          display: flex;
          gap: 15px;
          margin-bottom: 25px;
        }
        .card {
          flex: 1;
          border: 1px solid #e2e8f0;
          padding: 12px 16px;
          border-radius: 8px;
          background-color: #f8fafc;
        }
        .card-label {
          font-size: 10px;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 600;
        }
        .card-val {
          font-size: 18px;
          font-weight: 800;
          margin-top: 4px;
        }
        .text-amber { color: #b45309; }
        .text-emerald { color: #047857; }
        .section h2 {
          font-size: 14px;
          margin: 0 0 10px;
          padding-bottom: 6px;
          border-bottom: 1px solid #cbd5e1;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        th {
          background-color: #f1f5f9;
          text-align: left;
          padding: 8px 6px;
          border-bottom: 1px solid #cbd5e1;
          font-size: 10px;
          text-transform: uppercase;
          color: #475569;
        }
        td {
          padding: 7px 6px;
          border-bottom: 1px solid #f1f5f9;
        }
        .footer {
          margin-top: 40px;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
          text-align: center;
          font-size: 10px;
          color: #94a3b8;
        }
        @media print {
          body { margin: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; padding: 12px; background: #e0f2fe; border: 1px solid #bae6fd; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 12px; color: #0369a1; font-weight: 600;">Aperçu avant impression / Téléchargement PDF de MonArdoise</span>
        <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
          🖨️ Enregistrer en PDF / Imprimer
        </button>
      </div>

      <div class="header">
        <div>
          <h1>${merchant.businessName}</h1>
          <p>Espace Commerçant Multi-Boutiques · Tél : ${merchant.phone}</p>
          <p>${boutiques.map(b => b.name).join(' · ')}</p>
        </div>
        <div style="text-align: right;">
          <p style="font-size: 10px; color: #64748b;">RAPPORT OFFICIEL MONARDOISE</p>
          <p style="font-weight: 600;">Date : ${currentDate}</p>
        </div>
      </div>

      <div class="summary-cards">
        <div class="card">
          <div class="card-label">Créances Clients Totales</div>
          <div class="card-val text-amber">${formatCurrency(totalReceivables, merchant.currency)}</div>
        </div>
        <div class="card">
          <div class="card-label">Dettes & Avoirs Commerçant</div>
          <div class="card-val text-emerald">${formatCurrency(totalPayables, merchant.currency)}</div>
        </div>
        <div class="card">
          <div class="card-label">Boutiques Actives</div>
          <div class="card-val">${boutiques.length} points de vente</div>
        </div>
      </div>

      ${contentHtml}

      <div class="footer">
        Document généré automatiquement par l'application mobile MonArdoise · Données certifiées sous la responsabilité du gérant
      </div>

      <script>
        // Auto open print prompt
        window.onload = function() {
          // Ready
        };
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();
}

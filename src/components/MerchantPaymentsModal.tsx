import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  QrCode, 
  Save, 
  Send, 
  Phone, 
  ExternalLink,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface MerchantPaymentsModalProps {
  onClose: () => void;
}

export const MerchantPaymentsModal: React.FC<MerchantPaymentsModalProps> = ({ onClose }) => {
  const { merchant, updateMerchant, contacts, showToast } = useApp();

  const [waveNumber, setWaveNumber] = useState(merchant.paymentAccounts?.waveNumber || '');
  const [waveMerchantCode, setWaveMerchantCode] = useState(merchant.paymentAccounts?.waveMerchantCode || '');
  const [orangeMoneyCode, setOrangeMoneyCode] = useState(merchant.paymentAccounts?.orangeMoneyCode || '');
  const [mtnMoMoNumber, setMtnMoMoNumber] = useState(merchant.paymentAccounts?.mtnMoMoNumber || '');
  const [moovNumber, setMoovNumber] = useState(merchant.paymentAccounts?.moovNumber || '');
  const [instructions, setInstructions] = useState(merchant.paymentAccounts?.instructions || '');

  // Payment simulator / request generator
  const [selectedContactId, setSelectedContactId] = useState('');
  const [paymentReqAmount, setPaymentReqAmount] = useState('15000');
  const [selectedChannel, setSelectedChannel] = useState<'wave' | 'orange_money' | 'mtn'>('wave');

  const handleSaveAccounts = (e: React.FormEvent) => {
    e.preventDefault();
    updateMerchant({
      paymentAccounts: {
        waveNumber,
        waveMerchantCode,
        orangeMoneyCode,
        mtnMoMoNumber,
        moovNumber,
        instructions,
      },
    });
    showToast('Paramètres de vos comptes marchands enregistrés');
  };

  const selectedContact = contacts.find((c) => c.id === selectedContactId);

  const getPaymentMessage = () => {
    const contactName = selectedContact ? selectedContact.name : 'Client';
    const formattedAmt = formatCurrency(parseFloat(paymentReqAmount) || 0, merchant.currency);
    
    let channelDetails = '';
    if (selectedChannel === 'wave') {
      channelDetails = `• Wave : Paiement vers ${waveNumber} (Code marchand: ${waveMerchantCode || 'En magasin'})`;
    } else if (selectedChannel === 'orange_money') {
      channelDetails = `• Orange Money : Composer ${orangeMoneyCode || '#144#'}`;
    } else {
      channelDetails = `• MTN MoMo : Transfert vers ${mtnMoMoNumber}`;
    }

    return `Bonjour ${contactName},\nPour régler votre ardoise chez ${merchant.businessName} d'un montant de ${formattedAmt} :\n${channelDetails}\n${instructions ? `Remarque : ${instructions}\n` : ''}Merci d'envoyer la confirmation après règlement.`;
  };

  const handleCopyPaymentMessage = () => {
    navigator.clipboard.writeText(getPaymentMessage());
    showToast('Message de demande de paiement copié');
  };

  const handleSendWhatsAppPayment = () => {
    const phone = selectedContact?.phone?.replace(/[^0-9]/g, '') || '';
    const text = encodeURIComponent(getPaymentMessage());
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Paiements Numériques & Comptes Marchands
              </h3>
              <p className="text-[11px] text-slate-500">
                Paiements directs sans intermédiaire
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Legal / Zero Escrow Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1.5 text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-950 dark:text-emerald-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Principe fondamental : Zéro conservation de fonds</span>
            </div>
            <p className="leading-relaxed text-emerald-800 dark:text-emerald-300 text-[11px]">
              Tous les paiements numériques initiés par vos clients arrivent <strong>directement sur vos comptes marchands officiels</strong> (Wave, Orange Money, MTN MoMo, Moov).
              L'application MonArdoise ne conserve, ne séquestre et ne redistribue aucun fond. Vos fonds restent en permanence dans votre trésorerie personnelle.
            </p>
          </div>

          {/* Form to configure accounts */}
          <form onSubmit={handleSaveAccounts} className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              1. Coordonnées de vos comptes marchands
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Numéro Wave Marchand
                </label>
                <input
                  type="text"
                  value={waveNumber}
                  onChange={(e) => setWaveNumber(e.target.value)}
                  placeholder="+221 77 000 00 00"
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Identifiant / Code QR Wave
                </label>
                <input
                  type="text"
                  value={waveMerchantCode}
                  onChange={(e) => setWaveMerchantCode(e.target.value)}
                  placeholder="WAVE-SHOP-1234"
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Code Marchand Orange Money (Syntaxe USSD)
                </label>
                <input
                  type="text"
                  value={orangeMoneyCode}
                  onChange={(e) => setOrangeMoneyCode(e.target.value)}
                  placeholder="#144#391823#"
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Numéro MTN MoMo Marchand
                </label>
                <input
                  type="text"
                  value={mtnMoMoNumber}
                  onChange={(e) => setMtnMoMoNumber(e.target.value)}
                  placeholder="+225 05 00 00 00"
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Instructions de libellé pour les clients
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Ex : Précisez votre nom et n° de téléphone dans la note du transfert."
                className="w-full p-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Enregistrer mes coordonnées marchandes</span>
            </button>
          </form>

          {/* Generator of Payment Request */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              2. Générer une demande de règlement pour un client
            </h4>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Client débiteur</label>
                  <select
                    value={selectedContactId}
                    onChange={(e) => setSelectedContactId(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  >
                    <option value="">Sélectionner un client...</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Montant demandé</label>
                  <input
                    type="number"
                    value={paymentReqAmount}
                    onChange={(e) => setPaymentReqAmount(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Canal privilégié</label>
                  <select
                    value={selectedChannel}
                    onChange={(e) => setSelectedChannel(e.target.value as any)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  >
                    <option value="wave">Wave</option>
                    <option value="orange_money">Orange Money</option>
                    <option value="mtn">MTN MoMo</option>
                  </select>
                </div>
              </div>

              {/* Message preview */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono whitespace-pre-line text-slate-700 dark:text-slate-300">
                {getPaymentMessage()}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyPaymentMessage}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier le texte</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendWhatsAppPayment}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer via WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

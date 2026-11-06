import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  ShieldCheck, 
  FileCheck, 
  Info, 
  Upload, 
  Building2, 
  IdCard, 
  CheckCircle2 
} from 'lucide-react';

interface KycAdminModalProps {
  onClose: () => void;
}

export const KycAdminModal: React.FC<KycAdminModalProps> = ({ onClose }) => {
  const { merchant, updateMerchant, showToast } = useApp();

  const [idCardNumber, setIdCardNumber] = useState(merchant.idCardUploaded ? 'CNI-SN-18992019' : '');
  const [rccmNumber, setRccmNumber] = useState(merchant.rccmUploaded ? 'SN-DKR-2022-B-9981' : '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMerchant({
      idCardUploaded: Boolean(idCardNumber.trim()),
      rccmUploaded: Boolean(rccmNumber.trim()),
      kycStatus: (idCardNumber.trim() || rccmNumber.trim()) ? 'valide' : 'non_requis',
    });
    showToast('Documents administratifs enregistrés');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Conformité & Documents Commerçant
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 text-xs">
          
          {/* Key Rule Note */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2 text-blue-900 dark:text-blue-200">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Principe : Documents demandés uniquement si nécessaire</span>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
              Pour démarrer et utiliser MonArdoise au quotidien (suivi des crédits, avances et stocks), <strong>la pièce d’identité et le registre de commerce (RCCM) ne sont pas obligatoires</strong>.
              Vous pouvez renseigner ces informations à votre convenance si un partenaire grossiste ou bancaire vous le demande.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Numéro de Carte Nationale d'Identité ou Passeport (Optionnel)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={idCardNumber}
                  onChange={(e) => setIdCardNumber(e.target.value)}
                  placeholder="Ex : 1 899 2002 01923"
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-400">Demandé uniquement si nécessaire</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Numéro RCCM - Registre du Commerce et du Crédit Mobilier (Optionnel)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={rccmNumber}
                  onChange={(e) => setRccmNumber(e.target.value)}
                  placeholder="Ex : SN-DKR-2024-B-1082"
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-400">Utile pour les grossistes certifiés</span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800"
              >
                Enregistrer mes informations
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

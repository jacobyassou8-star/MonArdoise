import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ContactType } from '../types';
import { X, UserPlus, Phone, MapPin, FileText, Check } from 'lucide-react';

interface NewContactModalProps {
  onClose: () => void;
  onSuccess: (contactId: string) => void;
}

export const NewContactModal: React.FC<NewContactModalProps> = ({ onClose, onSuccess }) => {
  const { addContact, merchant } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<ContactType>('client');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [rccm, setRccm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newContact = addContact({
      name: name.trim(),
      phone: phone.trim() || '+221 77 000 00 00',
      type,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
      creditLimit: creditLimit ? parseFloat(creditLimit) : undefined,
      idCardNumber: idCardNumber.trim() || undefined,
      rccm: rccm.trim() || undefined,
    });

    onSuccess(newContact.id);
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
            <UserPlus className="w-5 h-5 text-slate-900 dark:text-white" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Nouveau Compte / Personne
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
          
          {/* Category */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Catégorie de personne
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'client', label: 'Client' },
                { id: 'fournisseur', label: 'Fournisseur' },
                { id: 'employe', label: 'Employé' },
                { id: 'partenaire', label: 'Partenaire' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setType(opt.id as ContactType)}
                  className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition-all ${
                    type === opt.id
                      ? 'border-slate-950 dark:border-white bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nom complet ou raison sociale <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Madame Fatou Diop, ou Alimentation Touba..."
              className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Numéro de Téléphone (WhatsApp)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+221 77 123 45 67"
                className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quartier / Adresse
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex : Marché Tilène, Médina..."
                className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Plafond maximum de crédit autorisé ({merchant.currency}) — Optionnel
            </label>
            <input
              type="number"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              placeholder="Ex : 100000"
              className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes commerciales
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Habitudes d'achat, délais de versement accordés..."
              className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* Optional Administrative details (ID/RCCM) */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 block font-medium">
              Pièce d'identité et RCCM demandés uniquement si nécessaire :
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={idCardNumber}
                onChange={(e) => setIdCardNumber(e.target.value)}
                placeholder="N° CNI (Optionnel)"
                className="p-2 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-mono text-[11px]"
              />
              <input
                type="text"
                value={rccm}
                onChange={(e) => setRccm(e.target.value)}
                placeholder="N° RCCM (Optionnel)"
                className="p-2 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-semibold bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800"
            >
              Créer le compte
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Boutique, UserRole, UserStaff } from '../types';
import { formatCurrency } from '../utils/formatters';
import { 
  Building2, 
  Store, 
  Users, 
  Plus, 
  ShieldCheck, 
  UserCheck, 
  MapPin, 
  Phone, 
  X,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const BoutiquesTeamView: React.FC = () => {
  const { 
    boutiques, 
    addBoutique, 
    staff, 
    addStaff, 
    merchant, 
    transactions, 
    activeBoutiqueId, 
    setActiveBoutiqueId, 
    currentUser, 
    setCurrentUser,
    switchUserRole, 
    showToast 
  } = useApp();

  // Add boutique modal
  const [showAddBoutique, setShowAddBoutique] = useState(false);
  const [newBoutiqueName, setNewBoutiqueName] = useState('');
  const [newBoutiqueAddress, setNewBoutiqueAddress] = useState('');
  const [newBoutiquePhone, setNewBoutiquePhone] = useState('');
  const [newBoutiqueManager, setNewBoutiqueManager] = useState('');
  const [newBoutiqueColor, setNewBoutiqueColor] = useState('#0284c7');

  // Add staff modal
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('employe');
  const [newStaffBoutiqueId, setNewStaffBoutiqueId] = useState(boutiques[0]?.id || 'b1');
  const [newStaffPhone, setNewStaffPhone] = useState('');

  const handleCreateBoutique = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoutiqueName.trim()) return;

    addBoutique({
      name: newBoutiqueName.trim(),
      address: newBoutiqueAddress.trim() || 'Adresse non renseignée',
      phone: newBoutiquePhone.trim() || merchant.phone,
      managerName: newBoutiqueManager.trim() || currentUser.name,
      color: newBoutiqueColor,
    });

    setShowAddBoutique(false);
    setNewBoutiqueName('');
    setNewBoutiqueAddress('');
    setNewBoutiquePhone('');
    setNewBoutiqueManager('');
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;

    addStaff({
      name: newStaffName.trim(),
      role: newStaffRole,
      boutiqueId: newStaffBoutiqueId,
      phone: newStaffPhone.trim() || '+221 77 000 00 00',
    });

    setShowAddStaff(false);
    setNewStaffName('');
    setNewStaffPhone('');
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      
      {/* Top Banner: Private Merchant Space Overview */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Espace Privé Commerçant
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {merchant.businessName}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Cet espace regroupe vos différentes boutiques et vos collaborateurs. Tous vos comptes clients, fournisseurs et partenaires sont automatiquement synchronisés entre vos points de vente.
          </p>
        </div>

        {/* Current Acting Profile Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
              currentUser.role === 'gerant' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
            }`}>
              {currentUser.role === 'gerant' ? <ShieldCheck className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500">
                Rôle actif : <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{currentUser.role === 'gerant' ? 'Gérant (Droits d’annulation)' : 'Employé (Saisie)'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={switchUserRole}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
            title="Tester l'application avec un autre rôle"
          >
            Changer rôle
          </button>
        </div>
      </div>

      {/* Section 1: Boutiques */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-slate-500" />
              <span>Vos Boutiques & Dépôts ({boutiques.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Chaque opération reste attribuée à la boutique où elle s'est déroulée.
            </p>
          </div>

          <button
            onClick={() => setShowAddBoutique(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Ajouter une Boutique</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {boutiques.map((b) => {
            const bTxCount = transactions.filter((t) => t.boutiqueId === b.id && t.status === 'active').length;
            const bStaffCount = staff.filter((s) => s.boutiqueId === b.id).length;
            const isActive = activeBoutiqueId === b.id;

            return (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                  isActive
                    ? 'border-slate-950 dark:border-white bg-slate-50/50 dark:bg-slate-850 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {b.name}
                      </h4>
                    </div>
                    {isActive && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{b.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{b.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <span>Responsable : <strong>{b.managerName}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">{bTxCount} opérations · {bStaffCount} membre{bStaffCount > 1 ? 's' : ''}</span>
                  <button
                    onClick={() => setActiveBoutiqueId(b.id)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Sélectionner
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Team & Roles */}
      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              <span>Collaborateurs & Gestion des Rôles ({staff.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Seuls les utilisateurs avec le rôle <strong>Gérant</strong> peuvent corriger ou annuler une opération.
            </p>
          </div>

          <button
            onClick={() => setShowAddStaff(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Ajouter un Collaborateur</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {staff.map((member) => {
            const assignedBoutique = boutiques.find((b) => b.id === member.boutiqueId);
            const isCurrentUser = member.id === currentUser.id;

            return (
              <div
                key={member.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCurrentUser
                    ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {member.name}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-400">
                        {member.phone}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      member.role === 'gerant'
                        ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {member.role === 'gerant' ? 'Gérant' : 'Employé'}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                    <Store className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{assignedBoutique?.name || 'Non assigné'}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    {member.role === 'gerant' ? 'Tous droits' : 'Saisie'}
                  </span>
                  <button
                    onClick={() => setCurrentUser(member)}
                    className={`text-xs font-semibold ${isCurrentUser ? 'text-blue-600 font-bold' : 'text-slate-600 dark:text-slate-300 hover:underline'}`}
                  >
                    {isCurrentUser ? 'Session active' : 'Prendre l’identité'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Boutique Modal */}
      {showAddBoutique && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm sm:text-base">Ajouter une nouvelle boutique</h3>
              <button onClick={() => setShowAddBoutique(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBoutique} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nom de la boutique ou dépôt</label>
                <input
                  type="text"
                  value={newBoutiqueName}
                  onChange={(e) => setNewBoutiqueName(e.target.value)}
                  placeholder="Ex : Boutique Carrefour Médina"
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Adresse / Emplacement</label>
                <input
                  type="text"
                  value={newBoutiqueAddress}
                  onChange={(e) => setNewBoutiqueAddress(e.target.value)}
                  placeholder="Ex : Rue 6 angle 11, face Mosquée"
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Téléphone boutique</label>
                  <input
                    type="text"
                    value={newBoutiquePhone}
                    onChange={(e) => setNewBoutiquePhone(e.target.value)}
                    placeholder="+221 77 000 00 00"
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Couleur repère</label>
                  <div className="flex items-center gap-2 h-10">
                    <input
                      type="color"
                      value={newBoutiqueColor}
                      onChange={(e) => setNewBoutiqueColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <span className="font-mono text-[11px]">{newBoutiqueColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nom du gérant / responsable</label>
                <input
                  type="text"
                  value={newBoutiqueManager}
                  onChange={(e) => setNewBoutiqueManager(e.target.value)}
                  placeholder="Ex : Cheikh Ndiaye"
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-bold mt-2"
              >
                Créer la boutique dans l'espace
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm sm:text-base">Ajouter un collaborateur</h3>
              <button onClick={() => setShowAddStaff(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nom et Prénom</label>
                <input
                  type="text"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="Ex : Seydou Diallo"
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Téléphone</label>
                <input
                  type="text"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  placeholder="+221 78 000 00 00"
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Rôle et autorisations</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStaffRole('employe')}
                    className={`p-2.5 rounded-xl border text-left ${
                      newStaffRole === 'employe'
                        ? 'border-slate-950 dark:border-white bg-slate-100 dark:bg-slate-800 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    <div>Employé (Vendeur)</div>
                    <div className="text-[10px] text-slate-400 font-normal">Saisie des ventes et crédits</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewStaffRole('gerant')}
                    className={`p-2.5 rounded-xl border text-left ${
                      newStaffRole === 'gerant'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 font-bold text-amber-900 dark:text-amber-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    <div>Gérant (Manager)</div>
                    <div className="text-[10px] text-amber-600 font-normal">Droit d'annulation & audit</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Boutique principale d'affectation</label>
                <select
                  value={newStaffBoutiqueId}
                  onChange={(e) => setNewStaffBoutiqueId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                >
                  {boutiques.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-bold mt-2"
              >
                Enregistrer le collaborateur
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

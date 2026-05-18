import React, { useState } from 'react';
import type { Utilisateur, Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Users, PlusCircle, Shield, Building2, UserCheck, UserX } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

interface AdminUsersProps {
  onUpdate: (msg: string) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ onUpdate }) => {
  const { currentUser, allUsers, refreshUsers } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Nouveau state utilisateur
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('client');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [error, setError] = useState('');

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'banquier')) return null;

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nom || !prenom || !email) {
      setError('Les champs Nom, Prénom et Email sont obligatoires.');
      return;
    }

    if (allUsers.find((u: Utilisateur) => u.email.toLowerCase() === email.toLowerCase())) {
      setError('Un utilisateur avec cet email existe déjà.');
      return;
    }

    api.addUser({
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: email.trim().toLowerCase(),
      role,
      statut: 'actif',
      telephone: telephone.trim(),
      adresse: adresse.trim()
    });

    refreshUsers();
    onUpdate(`L'utilisateur ${prenom} ${nom} a été créé avec le rôle ${role.toUpperCase()}.`);
    setNom('');
    setPrenom('');
    setEmail('');
    setTelephone('');
    setAdresse('');
    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: number, currentStatut: string) => {
    if (id === currentUser.id_utilisateur) {
      alert("Vous ne pouvez pas modifier votre propre statut en cours de session.");
      return;
    }
    const nextStatut = currentStatut === 'actif' ? 'suspendu' : 'actif';
    api.updateUserStatus(id, nextStatut as any);
    refreshUsers();
    onUpdate(`Le statut de l'utilisateur a été basculé en : ${nextStatut.toUpperCase()}.`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-lg">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-400" /> Gestion des Utilisateurs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Supervisez les clients, banquiers et administrateurs du système bancaire.
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 self-start md:self-auto flex-shrink-0"
          >
            <PlusCircle className="w-5 h-5" /> Inscrire un Utilisateur
          </button>
        )}
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allUsers.map((user: Utilisateur) => {
          const isActif = user.statut === 'actif';
          return (
            <div
              key={user.id_utilisateur}
              className={`glass-panel rounded-3xl p-6 border transition-all duration-300 relative flex flex-col justify-between shadow-xl ${
                isActif ? 'hover:border-slate-600' : 'border-red-500/30 bg-red-950/10 opacity-85'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                    user.role === 'admin' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                    user.role === 'banquier' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' :
                    'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {user.role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : user.role === 'banquier' ? <Building2 className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                    {user.role}
                  </span>

                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                    isActif ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}>
                    {user.statut}
                  </span>
                </div>

                <div className="text-xl font-bold text-white mb-1">
                  {user.prenom} {user.nom}
                </div>
                <div className="text-xs text-slate-400 font-mono mb-4">{user.email}</div>

                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-800/50 p-3 rounded-2xl border border-slate-700/80">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Téléphone :</span>
                    <span className="font-mono">{user.telephone || 'Non renseigné'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Adresse :</span>
                    <span>{user.adresse || 'Non renseignée'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  ID Utilisateur : #{user.id_utilisateur}
                </div>

                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => handleToggleStatus(user.id_utilisateur, user.statut)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isActif ? 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30' : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isActif ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    {isActif ? 'Suspendre' : 'Activer'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Creation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Créer un Nouvel Utilisateur">
        <form onSubmit={handleCreateUser} className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Prénom</label>
              <input type="text" placeholder="Ex: Karim" value={prenom} onChange={e => setPrenom(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Nom</label>
              <input type="text" placeholder="Ex: Tazi" value={nom} onChange={e => setNom(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email (Identifiant de connexion)</label>
            <input type="email" placeholder="Ex: karim@client.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Rôle dans le système</label>
            <select value={role} onChange={e => setRole(e.target.value as Role)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500">
              <option value="client">Client</option>
              <option value="banquier">Banquier</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Téléphone</label>
            <input type="text" placeholder="Ex: +212 600 000000" value={telephone} onChange={e => setTelephone(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Adresse de résidence / agence</label>
            <input type="text" placeholder="Ex: Quartier Gauthier, Casablanca" value={adresse} onChange={e => setAdresse(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 font-semibold text-sm rounded-xl">Annuler</button>
            <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-500/25">Valider</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

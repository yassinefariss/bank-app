import React, { useState } from 'react';
import type { Compte, Utilisateur } from '../types';
import { useAuth } from '../context/AuthContext';
import { AccountModal } from '../components/accounts/AccountModal';
import { api } from '../services/api';
import { CreditCard, PlusCircle, Search, CheckCircle, Lock, User } from 'lucide-react';

interface AccountsProps {
  accounts: Compte[];
  onUpdate: (msg: string) => void;
  allAccounts: Compte[];
}

export const Accounts: React.FC<AccountsProps> = ({ accounts, onUpdate, allAccounts }) => {
  const { currentUser, allUsers } = useAuth();
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  if (!currentUser) return null;

  const isAdminOrBanker = currentUser.role === 'admin' || currentUser.role === 'banquier';
  const displayedAccounts = isAdminOrBanker ? allAccounts : accounts;

  const filteredAccounts = displayedAccounts.filter(acc => {
    const matchesSearch = acc.numero_compte.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (acc.utilisateur?.nom.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (acc.utilisateur?.prenom.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || acc.type_compte === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleStatusToggle = (accId: number, currentStatut: string) => {
    const nextStatut = currentStatut === 'actif' ? 'bloque' : 'actif';
    api.updateAccountStatus(accId, nextStatut as any);
    onUpdate(`Le statut du compte a été mis à jour à : ${nextStatut.toUpperCase()}.`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-lg">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-emerald-400" />
            {isAdminOrBanker ? 'Supervision des Comptes Bancaires' : 'Mes Comptes Bancaires'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isAdminOrBanker
              ? 'Consultez et administrez l\'ensemble des comptes clients enregistrés dans la banque.'
              : 'Gérez vos comptes courants et comptes d\'épargne en toute sécurité.'}
          </p>
        </div>

        <button
          onClick={() => setIsAccModalOpen(true)}
          className="px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 self-start md:self-auto flex-shrink-0"
        >
          <PlusCircle className="w-5 h-5" /> Ouvrir un Compte
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={isAdminOrBanker ? "Rechercher par RIB ou Nom du titulaire..." : "Rechercher par numéro de compte (RIB)..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => setTypeFilter('all')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              typeFilter === 'all'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tous les comptes
          </button>
          <button
            onClick={() => setTypeFilter('courant')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              typeFilter === 'courant'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Courant
          </button>
          <button
            onClick={() => setTypeFilter('epargne')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              typeFilter === 'epargne'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Épargne
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-slate-800/40 rounded-3xl border border-slate-800">
            Aucun compte trouvé correspondant à vos critères.
          </div>
        ) : (
          filteredAccounts.map(acc => {
            const isCourant = acc.type_compte === 'courant';
            const isActif = acc.statut === 'actif';
            const owner = acc.utilisateur || allUsers.find((u: Utilisateur) => u.id_utilisateur === acc.id_utilisateur);

            return (
              <div
                key={acc.id_compte}
                className={`glass-panel rounded-3xl p-6 border transition-all duration-300 relative flex flex-col justify-between shadow-xl ${
                  isActif ? 'hover:border-emerald-500/50' : 'border-red-500/30 opacity-80 bg-red-950/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full border flex items-center gap-1 ${
                      isCourant
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                    }`}>
                      {isCourant ? 'Compte Courant' : 'Compte Épargne'}
                    </span>

                    <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
                      isActif
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                      {acc.statut}
                    </span>
                  </div>

                  <div className="text-2xl font-black text-white font-mono tracking-tight mb-2">
                    {acc.numero_compte}
                  </div>

                  {isAdminOrBanker && owner && (
                    <div className="text-xs text-slate-300 flex items-center gap-1.5 mb-4 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
                      <User className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{owner.prenom} {owner.nom} ({owner.email})</span>
                    </div>
                  )}

                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Solde du Compte
                  </div>
                  <div className="text-3xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                    {acc.solde.toLocaleString()} <span className="text-sm font-bold text-slate-400">MAD</span>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Créé le {new Date(acc.date_creation || Date.now()).toLocaleDateString('fr-FR')}
                  </div>

                  {isAdminOrBanker && (
                    <button
                      onClick={() => handleStatusToggle(acc.id_compte, acc.statut)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isActif
                          ? 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isActif ? <Lock className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      {isActif ? 'Bloquer' : 'Activer'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <AccountModal
        isOpen={isAccModalOpen}
        onClose={() => setIsAccModalOpen(false)}
        onSuccess={onUpdate}
        currentUser={currentUser}
        clientUsers={allUsers.filter((u: Utilisateur) => u.role === 'client')}
      />
    </div>
  );
};

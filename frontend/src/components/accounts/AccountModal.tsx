import React, { useState } from 'react';
import type { AccountType, Utilisateur } from '../../types';
import { Modal } from '../ui/Modal';
import { api } from '../../services/api';
import { CreditCard, DollarSign } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  currentUser: Utilisateur;
  clientUsers: Utilisateur[];
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
  clientUsers,
}) => {
  const [accountType, setAccountType] = useState<AccountType>('courant');
  const [initialDeposit, setInitialDeposit] = useState<string>('1000');
  const [selectedUserId, setSelectedUserId] = useState<number>(currentUser.id_utilisateur);
  const [error, setError] = useState<string>('');

  const isAdminOrBanker = currentUser.role === 'admin' || currentUser.role === 'banquier';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const depositNum = Number(initialDeposit);
    if (depositNum < 0 || isNaN(depositNum)) {
      setError('Veuillez entrer un montant de dépôt initial valide.');
      return;
    }

    try {
      api.createAccount(selectedUserId, accountType, depositNum);
      onSuccess(`Nouveau compte ${accountType} créé avec succès avec un dépôt initial de ${depositNum.toLocaleString()} MAD.`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du compte.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ouvrir un Nouveau Compte Bancaire">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Titulaire du compte (Banquier / Admin peut choisir n'importe quel client) */}
        {isAdminOrBanker ? (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Titulaire du Compte (Client)
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {clientUsers.map(client => (
                <option key={client.id_utilisateur} value={client.id_utilisateur}>
                  {client.prenom} {client.nom} ({client.email})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80 text-xs text-slate-300">
            <span className="font-semibold text-white">Titulaire :</span> {currentUser.prenom} {currentUser.nom} ({currentUser.email})
          </div>
        )}

        {/* Type de compte */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Type de Compte
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              accountType === 'courant'
                ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 shadow-sm shadow-emerald-500/10 font-semibold'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}>
              <input
                type="radio"
                name="accountType"
                value="courant"
                checked={accountType === 'courant'}
                onChange={() => setAccountType('courant')}
                className="hidden"
              />
              <div className="w-4 h-4 rounded-full border border-emerald-500 flex items-center justify-center">
                {accountType === 'courant' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
              </div>
              <div>
                <div className="text-sm">Compte Courant</div>
                <div className="text-[10px] text-slate-500 font-normal">Idéal pour les dépenses quotidiennes</div>
              </div>
            </label>

            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              accountType === 'epargne'
                ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 shadow-sm shadow-emerald-500/10 font-semibold'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}>
              <input
                type="radio"
                name="accountType"
                value="epargne"
                checked={accountType === 'epargne'}
                onChange={() => setAccountType('epargne')}
                className="hidden"
              />
              <div className="w-4 h-4 rounded-full border border-emerald-500 flex items-center justify-center">
                {accountType === 'epargne' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
              </div>
              <div>
                <div className="text-sm">Compte Épargne</div>
                <div className="text-[10px] text-slate-500 font-normal">Faites fructifier vos économies</div>
              </div>
            </label>
          </div>
        </div>

        {/* Dépôt Initial */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Dépôt initial à l'ouverture (MAD)
          </label>
          <div className="relative">
            <input
              type="number"
              step="100"
              min="0"
              placeholder="Ex: 1000"
              value={initialDeposit}
              onChange={(e) => setInitialDeposit(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-3.5 pr-12 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              MAD
            </span>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-colors border border-slate-700"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
          >
            Créer le Compte
          </button>
        </div>
      </form>
    </Modal>
  );
};

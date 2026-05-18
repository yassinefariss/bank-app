import React, { useState } from 'react';
import type { Compte, TransactionType } from '../../types';
import { Modal } from '../ui/Modal';
import { api } from '../../services/api';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, DollarSign, Wallet } from 'lucide-react';

interface OperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  defaultType?: TransactionType;
  userAccounts: Compte[];
  allAccounts: Compte[];
}

export const OperationModal: React.FC<OperationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultType = 'depot',
  userAccounts,
  allAccounts,
}) => {
  const [operationType, setOperationType] = useState<TransactionType>(defaultType);
  const [sourceAccountId, setSourceAccountId] = useState<number>(userAccounts[0]?.id_compte || 0);
  const [destAccountId, setDestAccountId] = useState<number>(userAccounts[0]?.id_compte || 0);
  const [externalRib, setExternalRib] = useState<string>('');
  const [isInternalTransfer, setIsInternalTransfer] = useState<boolean>(true);
  const [montant, setMontant] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');

  const activeAccounts = userAccounts.filter(a => a.statut === 'actif');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!montant || Number(montant) <= 0) {
      setError('Veuillez entrer un montant valide supérieur à 0.');
      return;
    }

    let targetDestId: number | null | undefined = null;
    let targetSourceId: number | null | undefined = null;

    if (operationType === 'depot') {
      targetDestId = destAccountId;
      if (!targetDestId) {
        setError('Veuillez sélectionner un compte de destination.');
        return;
      }
    } else if (operationType === 'retrait') {
      targetSourceId = sourceAccountId;
      if (!targetSourceId) {
        setError('Veuillez sélectionner un compte source.');
        return;
      }
    } else if (operationType === 'virement') {
      targetSourceId = sourceAccountId;
      if (!targetSourceId) {
        setError('Veuillez sélectionner un compte source.');
        return;
      }
      if (isInternalTransfer) {
        targetDestId = destAccountId;
        if (targetSourceId === targetDestId) {
          setError('Le compte source et le compte destination doivent être différents.');
          return;
        }
      } else {
        if (!externalRib.trim()) {
          setError('Veuillez entrer le RIB du bénéficiaire externe.');
          return;
        }
        // Recherche si le compte externe existe dans la banque
        const found = allAccounts.find(a => a.numero_compte.toLowerCase() === externalRib.trim().toLowerCase());
        if (found) {
          targetDestId = found.id_compte;
        } else {
          setError('RIB bénéficiaire non reconnu dans le système bancaire.');
          return;
        }
      }
    }

    const res = api.createTransaction({
      type_transaction: operationType,
      montant: Number(montant),
      description: description.trim() || (
        operationType === 'depot' ? 'Dépôt d\'espèces' : 
        operationType === 'retrait' ? 'Retrait d\'espèces' : 'Virement bancaire'
      ),
      statut: 'complete',
      compte_source_id: targetSourceId,
      compte_destination_id: targetDestId,
    });

    if (res.success) {
      onSuccess(res.message);
      setMontant('');
      setDescription('');
      onClose();
    } else {
      setError(res.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Effectuer une Opération Bancaire">
      {/* Type Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-800 rounded-xl mb-6 border border-slate-700">
        <button
          type="button"
          onClick={() => setOperationType('depot')}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            operationType === 'depot'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" /> Dépôt
        </button>
        <button
          type="button"
          onClick={() => setOperationType('retrait')}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            operationType === 'retrait'
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" /> Retrait
        </button>
        <button
          type="button"
          onClick={() => setOperationType('virement')}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            operationType === 'virement'
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" /> Virement
        </button>
      </div>

      {activeAccounts.length === 0 ? (
        <div className="text-center py-6 text-slate-400">
          Vous n'avez aucun compte actif pour effectuer des opérations.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Compte Source (Retrait et Virement) */}
          {(operationType === 'retrait' || operationType === 'virement') && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-slate-400" /> Compte à débiter (Source)
              </label>
              <select
                value={sourceAccountId}
                onChange={(e) => setSourceAccountId(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {activeAccounts.map(acc => (
                  <option key={acc.id_compte} value={acc.id_compte}>
                    {acc.numero_compte} ({acc.type_compte === 'courant' ? 'Compte Courant' : 'Compte Épargne'}) - Solde : {acc.solde.toLocaleString()} MAD
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Compte Destination (Dépôt et Virement) */}
          {operationType === 'depot' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-slate-400" /> Compte à créditer (Destination)
              </label>
              <select
                value={destAccountId}
                onChange={(e) => setDestAccountId(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {activeAccounts.map(acc => (
                  <option key={acc.id_compte} value={acc.id_compte}>
                    {acc.numero_compte} ({acc.type_compte}) - Solde : {acc.solde.toLocaleString()} MAD
                  </option>
                ))}
              </select>
            </div>
          )}

          {operationType === 'virement' && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    checked={isInternalTransfer}
                    onChange={() => setIsInternalTransfer(true)}
                    className="accent-emerald-500"
                  />
                  Mes autres comptes
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    checked={!isInternalTransfer}
                    onChange={() => setIsInternalTransfer(false)}
                    className="accent-emerald-500"
                  />
                  Compte Externe (RIB / Autre client)
                </label>
              </div>

              {isInternalTransfer ? (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Compte bénéficiaire
                  </label>
                  <select
                    value={destAccountId}
                    onChange={(e) => setDestAccountId(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {activeAccounts.map(acc => (
                      <option key={acc.id_compte} value={acc.id_compte}>
                        {acc.numero_compte} ({acc.type_compte}) - Solde : {acc.solde.toLocaleString()} MAD
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    RIB du compte bénéficiaire
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: RIB-2120000883726154"
                    value={externalRib}
                    onChange={(e) => setExternalRib(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>
              )}
            </div>
          )}

          {/* Montant */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Montant de l'opération (MAD)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="1"
                placeholder="Ex: 1500.00"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-3.5 pr-12 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                MAD
              </span>
            </div>
          </div>

          {/* Motif / Description */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Motif de l'opération (Optionnel)
            </label>
            <input
              type="text"
              placeholder="Ex: Facture, Loyer, Épargne mensuelle..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
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
              Confirmer
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

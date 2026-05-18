import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Compte, Transaction, TransactionType, Utilisateur } from '../types';
import { OperationModal } from '../components/transactions/OperationModal';
import { AccountModal } from '../components/accounts/AccountModal';
import { 
  Wallet, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, PlusCircle, 
  TrendingUp, Clock, ShieldCheck, Activity, ChevronRight
} from 'lucide-react';

interface DashboardProps {
  accounts: Compte[];
  transactions: Transaction[];
  onOperationSuccess: (msg: string) => void;
  onNavigateTab: (tab: string) => void;
  allAccounts: Compte[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  accounts,
  transactions,
  onOperationSuccess,
  onNavigateTab,
  allAccounts,
}) => {
  const { currentUser, allUsers } = useAuth();
  const [isOpModalOpen, setIsOpModalOpen] = useState(false);
  const [opModalDefaultType, setOpModalDefaultType] = useState<TransactionType>('depot');
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);

  if (!currentUser) return null;

  const totalBalance = accounts.reduce((acc, curr) => acc + (curr.statut === 'actif' ? curr.solde : 0), 0);
  const totalDepots = transactions.filter(t => t.type_transaction === 'depot').reduce((acc, curr) => acc + curr.montant, 0);
  const totalRetraits = transactions.filter(t => t.type_transaction === 'retrait').reduce((acc, curr) => acc + curr.montant, 0);

  const recentTransactions = transactions.slice(0, 5);
  const activeAccounts = accounts.filter(a => a.statut === 'actif');

  const openOperation = (type: TransactionType) => {
    setOpModalDefaultType(type);
    setIsOpModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-8 md:p-10 text-white shadow-2xl shadow-emerald-500/10">
        <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 translate-y-1/2 w-80 h-80 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-emerald-200 border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5" /> Espace Sécurisé {currentUser.role === 'admin' ? 'Administration' : currentUser.role === 'banquier' ? 'Gestionnaire' : 'Client'}
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Bonjour, {currentUser.prenom} {currentUser.nom}
          </h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            Consultez en un coup d'œil l'activité de vos comptes, effectuez des virements instantanés et pilotez vos finances en toute sérénité.
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden transition-all duration-300 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 group">
          <div className="absolute right-4 top-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Solde Total Disponible</div>
          <div className="text-3xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-1">
            {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-lg font-bold text-emerald-400">MAD</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1 mt-3">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Sur {activeAccounts.length} compte(s) actif(s)
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden transition-all duration-300 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 group">
          <div className="absolute right-4 top-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Total des Dépôts</div>
          <div className="text-3xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-1">
            {totalDepots.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-lg font-bold text-blue-400">MAD</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1 mt-3">
            <Activity className="w-3.5 h-3.5 text-blue-400" /> Dépôts et crédits comptabilisés
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden transition-all duration-300 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5 group">
          <div className="absolute right-4 top-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Total des Retraits</div>
          <div className="text-3xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-1">
            {totalRetraits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-lg font-bold text-amber-400">MAD</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1 mt-3">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Retraits et débits sur la période
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" /> Actions Rapides
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => openOperation('depot')}
            className="p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 hover:from-emerald-500/20 hover:to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/40 rounded-3xl transition-all flex flex-col items-center justify-center gap-3 text-center group shadow-sm hover:shadow-emerald-500/10"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white mb-0.5">Faire un Dépôt</div>
              <div className="text-[11px] text-slate-400">Créditer un compte</div>
            </div>
          </button>

          <button
            onClick={() => openOperation('retrait')}
            className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/5 hover:from-amber-500/20 hover:to-orange-500/10 border border-amber-500/20 hover:border-amber-500/40 rounded-3xl transition-all flex flex-col items-center justify-center gap-3 text-center group shadow-sm hover:shadow-amber-500/10"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white mb-0.5">Retirer des Fonds</div>
              <div className="text-[11px] text-slate-400">Débiter un compte</div>
            </div>
          </button>

          <button
            onClick={() => openOperation('virement')}
            className="p-5 bg-gradient-to-br from-indigo-500/10 to-blue-500/5 hover:from-indigo-500/20 hover:to-blue-500/10 border border-indigo-500/20 hover:border-indigo-500/40 rounded-3xl transition-all flex flex-col items-center justify-center gap-3 text-center group shadow-sm hover:shadow-indigo-500/10"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white mb-0.5">Nouveau Virement</div>
              <div className="text-[11px] text-slate-400">Interne ou Externe</div>
            </div>
          </button>

          <button
            onClick={() => setIsAccModalOpen(true)}
            className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/5 hover:from-purple-500/20 hover:to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 rounded-3xl transition-all flex flex-col items-center justify-center gap-3 text-center group shadow-sm hover:shadow-purple-500/10"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white mb-0.5">Ouvrir un Compte</div>
              <div className="text-[11px] text-slate-400">Courant ou Épargne</div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Grid: Accounts Summary & Recent Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Accounts List */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" /> Vos Comptes
            </h2>
            <button
              onClick={() => onNavigateTab('accounts')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
            >
              Voir tout <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {accounts.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-800/40 rounded-3xl border border-slate-800">
                Aucun compte bancaire associé.
              </div>
            ) : (
              accounts.map(acc => (
                <div
                  key={acc.id_compte}
                  className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 transition-all hover:border-slate-600 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                      acc.type_compte === 'courant'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {acc.type_compte === 'courant' ? 'CC' : 'CE'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        {acc.type_compte === 'courant' ? 'Compte Courant' : 'Compte Épargne'}
                        {acc.statut !== 'actif' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 uppercase font-semibold">
                            {acc.statut}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-slate-400">{acc.numero_compte}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-white">
                      {acc.solde.toLocaleString()} <span className="text-xs text-slate-400">MAD</span>
                    </div>
                    <div className="text-[11px] text-emerald-400">Actif</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Recent Transactions */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" /> Transactions Récentes
            </h2>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
            >
              Historique complet <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden border border-slate-700/80 divide-y divide-slate-800 shadow-xl">
            {recentTransactions.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                Aucune transaction enregistrée pour le moment.
              </div>
            ) : (
              recentTransactions.map(t => {
                const isDepot = t.type_transaction === 'depot';
                const isRetrait = t.type_transaction === 'retrait';
                const isVirement = t.type_transaction === 'virement';

                return (
                  <div key={t.id_transaction} className="p-4 md:p-5 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                        isDepot ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        isRetrait ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      }`}>
                        {isDepot && <ArrowDownLeft className="w-5 h-5" />}
                        {isRetrait && <ArrowUpRight className="w-5 h-5" />}
                        {isVirement && <ArrowRightLeft className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          {t.description}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                            t.statut === 'complete' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            t.statut === 'en_attente' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {t.statut === 'complete' ? 'Complétée' : t.statut === 'en_attente' ? 'En attente' : 'Annulée'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 font-mono">
                          <span>Ref: TX-{t.id_transaction}</span>
                          <span>•</span>
                          <span>{new Date(t.date_transaction).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`text-right font-black text-base flex items-center gap-1 ${
                      isDepot ? 'text-emerald-400' :
                      isRetrait ? 'text-amber-400' : 'text-indigo-400'
                    }`}>
                      {isDepot ? '+' : '-'}{t.montant.toLocaleString()} <span className="text-xs text-slate-400 font-bold">MAD</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Operation Modal */}
      <OperationModal
        isOpen={isOpModalOpen}
        onClose={() => setIsOpModalOpen(false)}
        onSuccess={onOperationSuccess}
        defaultType={opModalDefaultType}
        userAccounts={accounts}
        allAccounts={allAccounts}
      />

      {/* Account Creation Modal */}
      <AccountModal
        isOpen={isAccModalOpen}
        onClose={() => setIsAccModalOpen(false)}
        onSuccess={onOperationSuccess}
        currentUser={currentUser}
        clientUsers={allUsers.filter((u: Utilisateur) => u.role === 'client')}
      />
    </div>
  );
};

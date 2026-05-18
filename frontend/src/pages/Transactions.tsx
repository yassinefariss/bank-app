import React, { useState } from 'react';
import type { Transaction, Compte } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  History, Search, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, 
  Calendar, Download, FileText
} from 'lucide-react';

interface TransactionsProps {
  transactions: Transaction[];
  accounts: Compte[];
  allAccounts: Compte[];
}

export const Transactions: React.FC<TransactionsProps> = ({ transactions }) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateOrder, setDateOrder] = useState<'desc' | 'asc'>('desc');

  if (!currentUser) return null;

  const isAdminOrBanker = currentUser.role === 'admin' || currentUser.role === 'banquier';

  // Filtrage
  const filteredTxs = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (t.compte_source?.numero_compte.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (t.compte_destination?.numero_compte.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      t.id_transaction.toString().includes(searchTerm);
    const matchesType = typeFilter === 'all' || t.type_transaction === typeFilter;
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    const timeA = new Date(a.date_transaction).getTime();
    const timeB = new Date(b.date_transaction).getTime();
    return dateOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  const handleExportCSV = () => {
    const headers = ['Ref', 'Type', 'Montant (MAD)', 'Date', 'Description', 'Statut', 'Source RIB', 'Destination RIB'];
    const rows = filteredTxs.map(t => [
      `TX-${t.id_transaction}`,
      t.type_transaction.toUpperCase(),
      t.montant,
      new Date(t.date_transaction).toISOString(),
      `"${t.description.replace(/"/g, '""')}"`,
      t.statut,
      t.compte_source?.numero_compte || 'N/A',
      t.compte_destination?.numero_compte || 'N/A'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `releve_operations_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-lg">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
            <History className="w-8 h-8 text-emerald-400" /> Historique des Transactions
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isAdminOrBanker 
              ? 'Consultez et suivez l\'ensemble des flux financiers de la banque en temps réel.'
              : 'Retrouvez le relevé complet de vos dépôts, retraits et virements bancaires.'}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 self-start md:self-auto flex-shrink-0 shadow-sm"
        >
          <Download className="w-4 h-4 text-emerald-400" /> Exporter Relevé (CSV)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par libellé, référence, RIB..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${typeFilter === 'all' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Toutes
            </button>
            <button
              onClick={() => setTypeFilter('depot')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${typeFilter === 'depot' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Dépôts
            </button>
            <button
              onClick={() => setTypeFilter('retrait')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${typeFilter === 'retrait' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Retraits
            </button>
            <button
              onClick={() => setTypeFilter('virement')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${typeFilter === 'virement' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Virements
            </button>
          </div>

          <button
            onClick={() => setDateOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="px-3.5 py-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            {dateOrder === 'desc' ? 'Plus récentes d\'abord' : 'Plus anciennes d\'abord'}
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-700/80 divide-y divide-slate-800 shadow-2xl">
        {filteredTxs.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            Aucune transaction ne correspond à vos critères de recherche.
          </div>
        ) : (
          filteredTxs.map(t => {
            const isDepot = t.type_transaction === 'depot';
            const isRetrait = t.type_transaction === 'retrait';
            const isVirement = t.type_transaction === 'virement';

            return (
              <div key={t.id_transaction} className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md ${
                    isDepot ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    isRetrait ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  }`}>
                    {isDepot && <ArrowDownLeft className="w-6 h-6" />}
                    {isRetrait && <ArrowUpRight className="w-6 h-6" />}
                    {isVirement && <ArrowRightLeft className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="text-base font-bold text-white flex items-center gap-2.5 flex-wrap">
                      {t.description}
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                        t.statut === 'complete' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        t.statut === 'en_attente' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {t.statut === 'complete' ? 'Complétée' : t.statut === 'en_attente' ? 'En attente' : 'Annulée'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2 font-mono">
                      <span className="text-slate-300">Ref: TX-{t.id_transaction}</span>
                      <span>•</span>
                      <span>{new Date(t.date_transaction).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Affichage des comptes impliqués */}
                    <div className="text-xs mt-2.5 flex flex-wrap items-center gap-2 font-mono">
                      {t.compte_source && (
                        <span className="bg-slate-800 text-amber-300 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1">
                          <span className="text-slate-400 font-sans text-[10px]">De:</span> {t.compte_source.numero_compte}
                        </span>
                      )}
                      {t.compte_destination && (
                        <span className="bg-slate-800 text-emerald-300 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1">
                          <span className="text-slate-400 font-sans text-[10px]">Vers:</span> {t.compte_destination.numero_compte}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t border-slate-800 md:border-none pt-3 md:pt-0">
                  <div className={`font-black text-xl flex items-center gap-1 ${
                    isDepot ? 'text-emerald-400' :
                    isRetrait ? 'text-amber-400' : 'text-indigo-400'
                  }`}>
                    {isDepot ? '+' : '-'}{t.montant.toLocaleString()} <span className="text-xs text-slate-400 font-bold">MAD</span>
                  </div>
                  <div className="text-[11px] uppercase font-semibold text-slate-500">
                    {t.type_transaction}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

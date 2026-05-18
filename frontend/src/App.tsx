import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Toast } from './components/ui/Toast';
import { Dashboard } from './pages/Dashboard';
import { Accounts } from './pages/Accounts';
import { Transactions } from './pages/Transactions';
import { AdminUsers } from './pages/AdminUsers';
import { OperationModal } from './components/transactions/OperationModal';
import { api } from './services/api';
import type { Compte, Transaction, TransactionType } from './types';
import { Building2, ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // States des données
  const [userAccounts, setUserAccounts] = useState<Compte[]>([]);
  const [allAccounts, setAllAccounts] = useState<Compte[]>([]);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  const [isOpModalOpen, setIsOpModalOpen] = useState<boolean>(false);
  const [opModalType, setOpModalType] = useState<TransactionType>('depot');

  const refreshData = () => {
    if (!currentUser) return;
    const accs = api.getUserAccounts(currentUser.id_utilisateur);
    const txs = api.getUserTransactions(currentUser.id_utilisateur);
    const allAccs = api.getAccounts();
    const allTxs = api.getTransactions();

    setUserAccounts(accs);
    setUserTransactions(txs);
    setAllAccounts(allAccs);
    setAllTransactions(allTxs);
  };

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  const handleOperationSuccess = (msg: string) => {
    setToast({ message: msg, type: 'success' });
    refreshData();
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="glass-panel max-w-md w-full p-8 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">NovaBank</h1>
          <p className="text-slate-400 text-sm">Chargement de la session bancaire...</p>
        </div>
      </div>
    );
  }

  const isAdminOrBanker = currentUser.role === 'admin' || currentUser.role === 'banquier';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <Dashboard 
              accounts={userAccounts} 
              transactions={userTransactions} 
              onOperationSuccess={handleOperationSuccess}
              onNavigateTab={setActiveTab}
              allAccounts={allAccounts}
            />
          )}

          {activeTab === 'accounts' && (
            <Accounts 
              accounts={userAccounts} 
              allAccounts={allAccounts}
              onUpdate={handleOperationSuccess}
            />
          )}

          {activeTab === 'transactions' && (
            <Transactions 
              transactions={isAdminOrBanker ? allTransactions : userTransactions} 
              accounts={userAccounts} 
              allAccounts={allAccounts}
            />
          )}

          {activeTab === 'operations' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-lg">
                <h1 className="text-2xl font-extrabold text-white mb-2">Virements & Opérations Bancaires</h1>
                <p className="text-sm text-slate-400">Sélectionnez le type d'opération que vous souhaitez effectuer sur vos comptes.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <button
                  onClick={() => { setOpModalType('depot'); setIsOpModalOpen(true); }}
                  className="glass-panel p-8 rounded-3xl text-left hover:border-emerald-500/50 group transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ArrowDownLeft className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Dépôt d'Espèces</h3>
                  <p className="text-sm text-slate-400">Créditez instantanément l'un de vos comptes bancaires actifs.</p>
                </button>

                <button
                  onClick={() => { setOpModalType('retrait'); setIsOpModalOpen(true); }}
                  className="glass-panel p-8 rounded-3xl text-left hover:border-amber-500/50 group transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ArrowUpRight className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Retrait de Fonds</h3>
                  <p className="text-sm text-slate-400">Effectuez un retrait depuis votre compte courant ou compte d'épargne.</p>
                </button>

                <button
                  onClick={() => { setOpModalType('virement'); setIsOpModalOpen(true); }}
                  className="glass-panel p-8 rounded-3xl text-left hover:border-indigo-500/50 group transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ArrowRightLeft className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Virement Bancaire</h3>
                  <p className="text-sm text-slate-400">Transférez des fonds vers vos autres comptes ou vers un bénéficiaire externe (RIB).</p>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'admin' && <AdminUsers onUpdate={handleOperationSuccess} />}
        </main>
      </div>

      <OperationModal
        isOpen={isOpModalOpen}
        onClose={() => setIsOpModalOpen(false)}
        onSuccess={handleOperationSuccess}
        defaultType={opModalType}
        userAccounts={userAccounts}
        allAccounts={allAccounts}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, CreditCard, ArrowRightLeft, History, Users, RefreshCw } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const isAdminOrBanker = currentUser.role === 'admin' || currentUser.role === 'banquier';

  const navItems = [
    { id: 'dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { id: 'accounts', label: isAdminOrBanker ? 'Gestion des Comptes' : 'Mes Comptes', icon: CreditCard },
    { id: 'transactions', label: 'Historique des Opérations', icon: History },
    { id: 'operations', label: 'Virements & Retraits', icon: ArrowRightLeft },
    ...(currentUser.role === 'admin' ? [{ id: 'admin', label: 'Gestion Utilisateurs', icon: Users }] : []),
  ];

  return (
    <aside className="w-64 flex-shrink-0 min-h-[calc(100vh-73px)] border-r border-slate-800 bg-slate-900/40 backdrop-blur-md p-4 hidden md:flex flex-col justify-between">
      <div className="space-y-1">
        <div className="text-xs font-semibold text-slate-500 px-3 py-2 uppercase tracking-wider">
          Menu de Navigation
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="font-semibold text-slate-300 flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" /> Données en Direct
        </div>
        <div>
          Les opérations en mode démo sont persistées et synchronisées en temps réel.
        </div>
      </div>
    </aside>
  );
};

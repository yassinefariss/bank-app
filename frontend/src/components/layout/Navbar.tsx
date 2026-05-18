import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Building2, Sun, Moon, Shield, Users, LogOut, ChevronDown, Check } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, allUsers, switchUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'admin':
        return <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1"><Shield className="w-3 h-3" /> Admin</span>;
      case 'banquier':
        return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1"><Building2 className="w-3 h-3" /> Banquier</span>;
      default:
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1"><Users className="w-3 h-3" /> Client</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-900/80 border-b border-slate-800 px-4 md:px-8 py-3.5 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            NovaBank
          </span>
          <span className="text-[10px] text-emerald-400 block font-mono uppercase tracking-widest font-semibold">Portail Financier</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Toggle Theme */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/60 shadow-sm"
          title={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-300" />}
        </button>

        {/* User Info & Switcher */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-3 pl-3 pr-4 py-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl transition-all shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-slate-900 text-sm">
                {currentUser.prenom[0]}{currentUser.nom[0]}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-sm font-semibold text-white leading-tight flex items-center gap-2">
                  {currentUser.prenom} {currentUser.nom}
                  {getRoleBadge(currentUser.role)}
                </div>
                <div className="text-xs text-slate-400">{currentUser.email}</div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-3 w-72 bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 backdrop-blur-2xl">
                <div className="text-xs font-semibold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                  Changer d'utilisateur (Démo)
                </div>
                <div className="space-y-1 my-1">
                  {allUsers.map((u) => (
                    <button
                      key={u.id_utilisateur}
                      onClick={() => {
                        switchUser(u.id_utilisateur);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between transition-colors ${
                        u.id_utilisateur === currentUser.id_utilisateur
                          ? 'bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/30'
                          : 'text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">
                          {u.prenom[0]}{u.nom[0]}
                        </div>
                        <div>
                          <div>{u.prenom} {u.nom}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            {u.role === 'admin' ? '🛡️ Admin' : u.role === 'banquier' ? '🏦 Banquier' : '👤 Client'}
                          </div>
                        </div>
                      </div>
                      {u.id_utilisateur === currentUser.id_utilisateur && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-800 pt-2 mt-2">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 font-medium flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

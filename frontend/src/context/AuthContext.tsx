import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Utilisateur } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: Utilisateur | null;
  login: (email: string) => boolean;
  logout: () => void;
  switchUser: (userId: number) => void;
  allUsers: Utilisateur[];
  refreshUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Utilisateur | null>(null);
  const [allUsers, setAllUsers] = useState<Utilisateur[]>([]);

  const refreshUsers = () => {
    const users = api.getUsers();
    setAllUsers(users);
  };

  useEffect(() => {
    refreshUsers();
    // Par défaut, on connecte Yassine (Client) pour un accès immédiat
    const savedUserId = localStorage.getItem('active_user_id');
    const users = api.getUsers();
    if (savedUserId) {
      const user = users.find(u => u.id_utilisateur === Number(savedUserId));
      if (user) setCurrentUser(user);
    } else if (users.length > 0) {
      setCurrentUser(users[0]);
      localStorage.setItem('active_user_id', String(users[0].id_utilisateur));
    }
  }, []);

  const login = (email: string): boolean => {
    const users = api.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.statut === 'actif') {
      setCurrentUser(user);
      localStorage.setItem('active_user_id', String(user.id_utilisateur));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('active_user_id');
  };

  const switchUser = (userId: number) => {
    const users = api.getUsers();
    const user = users.find(u => u.id_utilisateur === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('active_user_id', String(user.id_utilisateur));
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, switchUser, allUsers, refreshUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé au sein d\'un AuthProvider');
  return context;
};

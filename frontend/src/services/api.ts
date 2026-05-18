import type { Utilisateur, Compte, Transaction, TransactionType, AccountType } from '../types';
import { initialUsers, initialAccounts, initialTransactions } from './mockData';

const STORAGE_USERS = 'bank_app_users';
const STORAGE_ACCOUNTS = 'bank_app_accounts';
const STORAGE_TRANSACTIONS = 'bank_app_transactions';

// Initialisation du localStorage
const initStorage = () => {
  if (!localStorage.getItem(STORAGE_USERS)) {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem(STORAGE_ACCOUNTS)) {
    localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(initialAccounts));
  }
  if (!localStorage.getItem(STORAGE_TRANSACTIONS)) {
    localStorage.setItem(STORAGE_TRANSACTIONS, JSON.stringify(initialTransactions));
  }
};

initStorage();

export const api = {
  // --- UTILISATEURS ---
  getUsers: (): Utilisateur[] => {
    return JSON.parse(localStorage.getItem(STORAGE_USERS) || '[]');
  },

  getUserById: (id: number): Utilisateur | undefined => {
    const users = api.getUsers();
    return users.find(u => u.id_utilisateur === id);
  },

  addUser: (user: Omit<Utilisateur, 'id_utilisateur'>): Utilisateur => {
    const users = api.getUsers();
    const newId = Math.max(0, ...users.map(u => u.id_utilisateur)) + 1;
    const newUser: Utilisateur = {
      ...user,
      id_utilisateur: newId,
      date_creation: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_USERS, JSON.stringify([...users, newUser]));
    return newUser;
  },

  updateUserStatus: (id: number, statut: Utilisateur['statut']): Utilisateur => {
    const users = api.getUsers();
    const updated = users.map(u => u.id_utilisateur === id ? { ...u, statut } : u);
    localStorage.setItem(STORAGE_USERS, JSON.stringify(updated));
    return updated.find(u => u.id_utilisateur === id)!;
  },

  // --- COMPTES ---
  getAccounts: (): Compte[] => {
    const accounts: Compte[] = JSON.parse(localStorage.getItem(STORAGE_ACCOUNTS) || '[]');
    const users = api.getUsers();
    return accounts.map(acc => ({
      ...acc,
      utilisateur: users.find(u => u.id_utilisateur === acc.id_utilisateur)
    }));
  },

  getUserAccounts: (userId: number): Compte[] => {
    return api.getAccounts().filter(a => a.id_utilisateur === userId);
  },

  createAccount: (userId: number, type: AccountType, initialDeposit: number = 0): Compte => {
    const accounts: Compte[] = JSON.parse(localStorage.getItem(STORAGE_ACCOUNTS) || '[]');
    const newId = Math.max(0, ...accounts.map(a => a.id_compte)) + 1;
    const randomRibNum = Math.floor(100000000000 + Math.random() * 900000000000);
    const newAccount: Compte = {
      id_compte: newId,
      numero_compte: `RIB-212${randomRibNum}`,
      type_compte: type,
      solde: Number(initialDeposit),
      statut: 'actif',
      id_utilisateur: userId,
      date_creation: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify([...accounts, newAccount]));

    if (initialDeposit > 0) {
      api.createTransaction({
        type_transaction: 'depot',
        montant: Number(initialDeposit),
        description: 'Dépôt initial à l\'ouverture du compte',
        statut: 'complete',
        compte_destination_id: newId
      });
    }

    return newAccount;
  },

  updateAccountStatus: (id: number, statut: Compte['statut']): Compte => {
    const accounts: Compte[] = JSON.parse(localStorage.getItem(STORAGE_ACCOUNTS) || '[]');
    const updated = accounts.map(a => a.id_compte === id ? { ...a, statut } : a);
    localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(updated));
    return api.getAccounts().find(a => a.id_compte === id)!;
  },

  // --- TRANSACTIONS & OPERATIONS ---
  getTransactions: (): Transaction[] => {
    const txs: Transaction[] = JSON.parse(localStorage.getItem(STORAGE_TRANSACTIONS) || '[]');
    const accounts = api.getAccounts();
    return txs.map(t => ({
      ...t,
      compte_source: accounts.find(a => a.id_compte === t.compte_source_id),
      compte_destination: accounts.find(a => a.id_compte === t.compte_destination_id),
    })).sort((a, b) => new Date(b.date_transaction).getTime() - new Date(a.date_transaction).getTime());
  },

  getUserTransactions: (userId: number): Transaction[] => {
    const userAccIds = api.getUserAccounts(userId).map(a => a.id_compte);
    return api.getTransactions().filter(t => 
      (t.compte_source_id && userAccIds.includes(t.compte_source_id)) ||
      (t.compte_destination_id && userAccIds.includes(t.compte_destination_id))
    );
  },

  createTransaction: (data: {
    type_transaction: TransactionType;
    montant: number;
    description: string;
    statut: Transaction['statut'];
    compte_source_id?: number | null;
    compte_destination_id?: number | null;
  }): { success: boolean; message: string; transaction?: Transaction } => {
    const accounts: Compte[] = JSON.parse(localStorage.getItem(STORAGE_ACCOUNTS) || '[]');
    const montantNum = Number(data.montant);

    if (montantNum <= 0) {
      return { success: false, message: 'Le montant doit être supérieur à zéro.' };
    }

    // Vérification compte source pour retrait et virement
    if (data.type_transaction === 'retrait' || data.type_transaction === 'virement') {
      const source = accounts.find(a => a.id_compte === data.compte_source_id);
      if (!source) return { success: false, message: 'Compte source introuvable.' };
      if (source.statut !== 'actif') return { success: false, message: 'Le compte source n\'est pas actif.' };
      if (source.solde < montantNum) return { success: false, message: 'Solde insuffisant pour effectuer cette opération.' };
    }

    // Vérification compte destination pour dépôt et virement
    if (data.type_transaction === 'depot' || data.type_transaction === 'virement') {
      const dest = accounts.find(a => a.id_compte === data.compte_destination_id);
      if (!dest) return { success: false, message: 'Compte de destination introuvable.' };
      if (dest.statut !== 'actif') return { success: false, message: 'Le compte de destination n\'est pas actif.' };
    }

    // Mise à jour des soldes
    const updatedAccounts = accounts.map(acc => {
      if (acc.id_compte === data.compte_source_id) {
        return { ...acc, solde: acc.solde - montantNum };
      }
      if (acc.id_compte === data.compte_destination_id) {
        return { ...acc, solde: acc.solde + montantNum };
      }
      return acc;
    });

    localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(updatedAccounts));

    // Enregistrement de la transaction
    const txs: Transaction[] = JSON.parse(localStorage.getItem(STORAGE_TRANSACTIONS) || '[]');
    const newId = Math.max(0, ...txs.map(t => t.id_transaction)) + 1;
    const newTx: Transaction = {
      ...data,
      id_transaction: newId,
      date_transaction: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_TRANSACTIONS, JSON.stringify([...txs, newTx]));
    return { success: true, message: 'Opération effectuée avec succès.', transaction: newTx };
  },

  resetAllData: () => {
    localStorage.removeItem(STORAGE_USERS);
    localStorage.removeItem(STORAGE_ACCOUNTS);
    localStorage.removeItem(STORAGE_TRANSACTIONS);
    initStorage();
  }
};

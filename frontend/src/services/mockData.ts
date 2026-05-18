import type { Utilisateur, Compte, Transaction } from '../types';

export const initialUsers: Utilisateur[] = [
  {
    id_utilisateur: 1,
    nom: 'Fariss',
    prenom: 'Yassine',
    email: 'yassine@client.com',
    telephone: '+212 600 123456',
    adresse: 'Casablanca, Maroc',
    role: 'client',
    statut: 'actif',
    date_creation: '2025-01-15T10:30:00Z',
  },
  {
    id_utilisateur: 2,
    nom: 'Martin',
    prenom: 'Sophie',
    email: 'sophie@banque.com',
    telephone: '+33 6 12 34 56 78',
    adresse: 'Paris, France',
    role: 'banquier',
    statut: 'actif',
    date_creation: '2024-06-10T09:00:00Z',
  },
  {
    id_utilisateur: 3,
    nom: 'Dupont',
    prenom: 'Marc',
    email: 'admin@banque.com',
    telephone: '+33 1 40 00 00 00',
    adresse: 'Lyon, France',
    role: 'admin',
    statut: 'actif',
    date_creation: '2023-11-01T08:15:00Z',
  },
  {
    id_utilisateur: 4,
    nom: 'Alaoui',
    prenom: 'Fatima',
    email: 'fatima@client.com',
    telephone: '+212 661 987654',
    adresse: 'Rabat, Maroc',
    role: 'client',
    statut: 'actif',
    date_creation: '2025-03-20T14:45:00Z',
  }
];

export const initialAccounts: Compte[] = [
  {
    id_compte: 101,
    numero_compte: 'RIB-2120000192837465',
    type_compte: 'courant',
    solde: 34500.75,
    statut: 'actif',
    id_utilisateur: 1,
    date_creation: '2025-01-15T10:35:00Z',
  },
  {
    id_compte: 102,
    numero_compte: 'RIB-2120000883726154',
    type_compte: 'epargne',
    solde: 125000.00,
    statut: 'actif',
    id_utilisateur: 1,
    date_creation: '2025-01-20T11:00:00Z',
  },
  {
    id_compte: 103,
    numero_compte: 'RIB-2120000475839201',
    type_compte: 'courant',
    solde: 8900.20,
    statut: 'actif',
    id_utilisateur: 4,
    date_creation: '2025-03-20T15:00:00Z',
  }
];

export const initialTransactions: Transaction[] = [
  {
    id_transaction: 1001,
    type_transaction: 'depot',
    montant: 5000.00,
    date_transaction: '2026-05-15T09:30:00Z',
    description: 'Dépôt initial en agence',
    statut: 'complete',
    compte_destination_id: 101,
  },
  {
    id_transaction: 1002,
    type_transaction: 'retrait',
    montant: 1200.00,
    date_transaction: '2026-05-16T14:20:00Z',
    description: 'Retrait au distributeur automatique',
    statut: 'complete',
    compte_source_id: 101,
  },
  {
    id_transaction: 1003,
    type_transaction: 'virement',
    montant: 3000.00,
    date_transaction: '2026-05-17T11:10:00Z',
    description: 'Virement vers compte épargne',
    statut: 'complete',
    compte_source_id: 101,
    compte_destination_id: 102,
  },
  {
    id_transaction: 1004,
    type_transaction: 'virement',
    montant: 1500.00,
    date_transaction: '2026-05-18T16:45:00Z',
    description: 'Paiement prestataire',
    statut: 'complete',
    compte_source_id: 101,
    compte_destination_id: 103,
  }
];

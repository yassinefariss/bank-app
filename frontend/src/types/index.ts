export type Role = 'client' | 'banquier' | 'admin';
export type UserStatus = 'actif' | 'inactif' | 'suspendu';
export type AccountType = 'courant' | 'epargne';
export type AccountStatus = 'actif' | 'ferme' | 'bloque';
export type TransactionType = 'depot' | 'retrait' | 'virement';
export type TransactionStatus = 'complete' | 'en_attente' | 'annulee';

export interface Utilisateur {
  id_utilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  role: Role;
  statut: UserStatus;
  date_creation?: string;
}

export interface Compte {
  id_compte: number;
  numero_compte: string;
  type_compte: AccountType;
  solde: number;
  statut: AccountStatus;
  id_utilisateur: number;
  utilisateur?: Utilisateur;
  date_creation?: string;
}

export interface Transaction {
  id_transaction: number;
  type_transaction: TransactionType;
  montant: number;
  date_transaction: string;
  description: string;
  statut: TransactionStatus;
  compte_source_id?: number | null;
  compte_destination_id?: number | null;
  compte_source?: Compte;
  compte_destination?: Compte;
}

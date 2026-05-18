# 🏛️ NovaBank - Application Web de Gestion Bancaire

<div align="center">
  <img src="https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
</div>

<br />

**NovaBank** est une plateforme web moderne, intuitive et hautement sécurisée de gestion de comptes bancaires en ligne. Conçue pour offrir une expérience utilisateur premium, l'application combine un **Backend robuste en Laravel 11** (API RESTful) et un **Frontend dynamique en React & TypeScript** (Vite).

---

## 🌟 Fonctionnalités Principales

### 🔐 Gestion Multi-Rôles
- **Client** : Accès à ses comptes (courants et épargne), consultation du solde en temps réel, exécution de virements internes et externes.
- **Banquier / Gestionnaire** : Supervision globale de tous les comptes clients, contrôle des flux financiers, blocage ou déblocage des comptes en anomalie.
- **Administrateur** : Gestion complète des utilisateurs (inscriptions, attributions de rôles, suspensions de comptes).

### 💳 Gestion des Comptes & Opérations
- **Comptes Bancaires** : Ouverture instantanée de comptes courants et d'épargne avec génération automatique de RIB/IBAN uniques.
- **Dépôts & Retraits** : Enregistrement de dépôts d'espèces et retraits de fonds avec mise à jour immédiate et sécurisée des soldes.
- **Virements Bancaires** : Transfert instantané de fonds entre ses propres comptes ou vers un bénéficiaire externe via son RIB.

### 📊 Suivi & Historique
- **Dashboard Synthétique** : Calcul des soldes totaux, graphiques d'activité et accès direct aux actions rapides.
- **Historique des Transactions** : Relevé filtrable par type d'opération (dépôt, retrait, virement), recherche par mot-clé ou numéro de compte, et **export au format CSV**.
- **Mode Sombre / Clair** : Thème visuel personnalisable et interface fluide utilisant le *glassmorphism*.

---

## 🏗️ Architecture & Stack Technique

```text
bank-app/
├── backend/                  # API REST Laravel (PHP 8.2+ & MySQL)
│   ├── app/Models/           # Modèles Eloquent (Utilisateur, Compte, Transaction)
│   ├── app/Http/Controllers/ # Logique métier & Transactions atomiques SQL
│   ├── database/migrations/  # Schémas de base de données stricts
│   └── routes/api.php        # Routes sécurisées par Laravel Sanctum
│
└── frontend/                 # Single Page Application (React 18 & TypeScript)
    ├── src/components/       # UI Components (Modales, Navbar, Sidebar, Toasts)
    ├── src/context/          # Gestion globale (AuthContext, ThemeContext)
    ├── src/pages/            # Vues (Dashboard, Comptes, Transactions, Admin)
    └── src/services/         # API & Persistance locale hybride
```

### dd Schéma de Base de Données

1. **`utilisateurs`** : `id_utilisateur` (PK), `nom`, `prenom`, `email` (UNIQUE), `mot_de_passe`, `telephone`, `adresse`, `role` (client, banquier, admin), `statut`.
2. **`comptes`** : `id_compte` (PK), `numero_compte` (UNIQUE), `type_compte` (courant, epargne), `solde`, `statut`, `id_utilisateur` (FK).
3. **`transactions`** : `id_transaction` (PK), `type_transaction` (depot, retrait, virement), `montant`, `date_transaction`, `description`, `statut`, `compte_source_id` (FK), `compte_destination_id` (FK).

---

## 🚀 Guide de Démarrage Rapide (En local)

### 1️⃣ Lancer le Frontend (Mode Démo / Autonome)
Le frontend dispose d'un mode de persistance locale permettant de tester toutes les fonctionnalités immédiatement, même sans base de données active.

```bash
# 1. Accédez au dossier frontend
cd frontend

# 2. Installez les dépendances
npm install

# 3. Démarrez le serveur de développement
npm run dev
```
👉 Accédez ensuite à `http://localhost:5173` dans votre navigateur. Vous pourrez basculer de rôle (Client Yassine, Banquier Sophie ou Admin Marc) via le menu en haut à droite.

---

### 2️⃣ Configuration du Backend Laravel (Optionnel pour connexion MySQL)
Si vous souhaitez connecter l'API Laravel à une base de données MySQL locale :

```bash
# 1. Accédez au dossier backend
cd backend

# 2. Installez les dépendances Composer
composer install

# 3. Configurez votre environnement
cp .env.example .env
php artisan key:generate

# 4. Exécutez les migrations et le Seeder de démo
php artisan migrate:fresh --seed

# 5. Lancez le serveur API
php artisan serve
```

---

## 🛡️ Sécurité & Bonnes Pratiques
- **Authentification Sanctum** : Émission et vérification de tokens d'accès sécurisés pour chaque requête API.
- **Transactions Atomiques SQL** (`DB::transaction`) : Garantit qu'aucun transfert de fonds n'est validé si l'une des étapes (débit source / crédit destination) échoue.
- **Validation TypeScript Stricte** : Typage complet de bout en bout éliminant les erreurs d'exécution.

---
<div align="center">
  Développé avec passion pour la gestion bancaire en ligne moderne. © NovaBank.
</div>

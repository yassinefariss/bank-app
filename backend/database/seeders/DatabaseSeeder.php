<?php

namespace Database\Seeders;

use App\Models\Compte;
use App\Models\Transaction;
use App\Models\Utilisateur;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Création des Utilisateurs
        $client1 = Utilisateur::create([
            'nom' => 'Fariss',
            'prenom' => 'Yassine',
            'email' => 'yassine@client.com',
            'mot_de_passe' => Hash::make('password123'),
            'telephone' => '+212 600 123456',
            'adresse' => 'Casablanca, Maroc',
            'role' => 'client',
            'statut' => 'actif',
        ]);

        $client2 = Utilisateur::create([
            'nom' => 'Alaoui',
            'prenom' => 'Fatima',
            'email' => 'fatima@client.com',
            'mot_de_passe' => Hash::make('password123'),
            'telephone' => '+212 661 987654',
            'adresse' => 'Rabat, Maroc',
            'role' => 'client',
            'statut' => 'actif',
        ]);

        $banquier = Utilisateur::create([
            'nom' => 'Martin',
            'prenom' => 'Sophie',
            'email' => 'sophie@banque.com',
            'mot_de_passe' => Hash::make('banker123'),
            'telephone' => '+33 6 12 34 56 78',
            'adresse' => 'Paris, France',
            'role' => 'banquier',
            'statut' => 'actif',
        ]);

        $admin = Utilisateur::create([
            'nom' => 'Dupont',
            'prenom' => 'Marc',
            'email' => 'admin@banque.com',
            'mot_de_passe' => Hash::make('admin123'),
            'telephone' => '+33 1 40 00 00 00',
            'adresse' => 'Lyon, France',
            'role' => 'admin',
            'statut' => 'actif',
        ]);

        // 2. Création des Comptes
        $compteCourantYassine = Compte::create([
            'numero_compte' => 'RIB-2120000192837465',
            'type_compte' => 'courant',
            'solde' => 34500.75,
            'statut' => 'actif',
            'id_utilisateur' => $client1->id_utilisateur,
        ]);

        $compteEpargneYassine = Compte::create([
            'numero_compte' => 'RIB-2120000883726154',
            'type_compte' => 'epargne',
            'solde' => 125000.00,
            'statut' => 'actif',
            'id_utilisateur' => $client1->id_utilisateur,
        ]);

        $compteCourantFatima = Compte::create([
            'numero_compte' => 'RIB-2120000475839201',
            'type_compte' => 'courant',
            'solde' => 8900.20,
            'statut' => 'actif',
            'id_utilisateur' => $client2->id_utilisateur,
        ]);

        // 3. Transactions de démo
        Transaction::create([
            'type_transaction' => 'depot',
            'montant' => 5000.00,
            'description' => 'Dépôt initial en agence',
            'statut' => 'complete',
            'compte_destination_id' => $compteCourantYassine->id_compte,
        ]);

        Transaction::create([
            'type_transaction' => 'retrait',
            'montant' => 1200.00,
            'description' => 'Retrait au distributeur automatique',
            'statut' => 'complete',
            'compte_source_id' => $compteCourantYassine->id_compte,
        ]);

        Transaction::create([
            'type_transaction' => 'virement',
            'montant' => 3000.00,
            'description' => 'Virement vers compte épargne',
            'statut' => 'complete',
            'compte_source_id' => $compteCourantYassine->id_compte,
            'compte_destination_id' => $compteEpargneYassine->id_compte,
        ]);
    }
}

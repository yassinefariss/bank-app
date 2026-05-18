<?php

namespace App\Http\Controllers;

use App\Models\Compte;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CompteController extends Controller
{
    /**
     * Liste des comptes (selon le rôle de l'utilisateur)
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin' || $user->role === 'banquier') {
            $comptes = Compte::with('utilisateur')->get();
        } else {
            $comptes = Compte::where('id_utilisateur', $user->id_utilisateur)->get();
        }

        return response()->json($comptes);
    }

    /**
     * Création d'un compte bancaire
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $isAdminOrBanker = ($user->role === 'admin' || $user->role === 'banquier');

        $validated = $request->validate([
            'id_utilisateur' => $isAdminOrBanker ? 'required|exists:utilisateurs,id_utilisateur' : 'nullable',
            'type_compte' => 'required|in:courant,epargne',
            'solde_initial' => 'nullable|numeric|min:0',
        ]);

        $titulaireId = $isAdminOrBanker ? $validated['id_utilisateur'] : $user->id_utilisateur;

        // Génération d'un RIB unique
        $randomRibNum = random_int(100000000000, 999999999999);
        $numeroCompte = 'RIB-212' . $randomRibNum;

        $soldeInitial = $validated['solde_initial'] ?? 0;

        $compte = DB::transaction(function () use ($titulaireId, $validated, $numeroCompte, $soldeInitial) {
            $nouveauCompte = Compte::create([
                'numero_compte' => $numeroCompte,
                'type_compte' => $validated['type_compte'],
                'solde' => $soldeInitial,
                'statut' => 'actif',
                'id_utilisateur' => $titulaireId,
            ]);

            if ($soldeInitial > 0) {
                $nouveauCompte->credits()->create([
                    'type_transaction' => 'depot',
                    'montant' => $soldeInitial,
                    'description' => 'Dépôt initial à l\'ouverture du compte',
                    'statut' => 'complete',
                ]);
            }

            return $nouveauCompte;
        });

        return response()->json([
            'message' => 'Compte bancaire créé avec succès.',
            'compte' => $compte->load('utilisateur')
        ], 201);
    }

    /**
     * Consultation d'un compte spécifique
     */
    public function show(Request $request, $id)
    {
        $compte = Compte::with(['utilisateur', 'debits', 'credits'])->findOrFail($id);
        $user = $request->user();

        if ($user->role === 'client' && $compte->id_utilisateur !== $user->id_utilisateur) {
            return response()->json(['message' => 'Accès non autorisé à ce compte.'], 403);
        }

        return response()->json($compte);
    }

    /**
     * Mise à jour du statut d'un compte (Banquier / Admin)
     */
    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role === 'client') {
            return response()->json(['message' => 'Seul un banquier ou administrateur peut modifier le statut d\'un compte.'], 403);
        }

        $validated = $request->validate([
            'statut' => 'required|in:actif,ferme,bloque',
        ]);

        $compte = Compte::findOrFail($id);
        $compte->update(['statut' => $validated['statut']]);

        return response()->json([
            'message' => 'Statut du compte mis à jour.',
            'compte' => $compte
        ]);
    }
}

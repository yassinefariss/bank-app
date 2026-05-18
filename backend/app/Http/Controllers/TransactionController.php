<?php

namespace App\Http\Controllers;

use App\Models\Compte;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    /**
     * Liste des transactions (selon rôle)
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin' || $user->role === 'banquier') {
            $transactions = Transaction::with(['compteSource', 'compteDestination'])->latest('date_transaction')->get();
        } else {
            $comptesIds = Compte::where('id_utilisateur', $user->id_utilisateur)->pluck('id_compte');
            $transactions = Transaction::with(['compteSource', 'compteDestination'])
                ->whereIn('compte_source_id', $comptesIds)
                ->orWhereIn('compte_destination_id', $comptesIds)
                ->latest('date_transaction')
                ->get();
        }

        return response()->json($transactions);
    }

    /**
     * Effectuer une opération (dépôt, retrait, virement)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type_transaction' => 'required|in:depot,retrait,virement',
            'montant' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
            'compte_source_id' => 'nullable|exists:comptes,id_compte',
            'compte_destination_id' => 'nullable|exists:comptes,id_compte',
            'rib_destination' => 'nullable|string',
        ]);

        $type = $validated['type_transaction'];
        $montant = (float) $validated['montant'];
        $description = $validated['description'] ?? ($type === 'depot' ? 'Dépôt d\'espèces' : ($type === 'retrait' ? 'Retrait d\'espèces' : 'Virement bancaire'));

        $user = $request->user();

        return DB::transaction(function () use ($type, $montant, $description, $validated, $user) {
            $compteSource = null;
            $compteDest = null;

            // Vérifications Compte Source
            if ($type === 'retrait' || $type === 'virement') {
                $compteSource = Compte::findOrFail($validated['compte_source_id']);
                
                // Vérification permission (Client)
                if ($user->role === 'client' && $compteSource->id_utilisateur !== $user->id_utilisateur) {
                    return response()->json(['message' => 'Non autorisé sur ce compte source.'], 403);
                }

                if ($compteSource->statut !== 'actif') {
                    return response()->json(['message' => 'Le compte source n\'est pas actif.'], 422);
                }

                if ($compteSource->solde < $montant) {
                    return response()->json(['message' => 'Solde insuffisant sur le compte source.'], 422);
                }
            }

            // Vérifications Compte Destination
            if ($type === 'depot' || $type === 'virement') {
                if (!empty($validated['rib_destination'])) {
                    $compteDest = Compte::where('numero_compte', $validated['rib_destination'])->first();
                    if (!$compteDest) {
                        return response()->json(['message' => 'RIB bénéficiaire introuvable.'], 404);
                    }
                } else {
                    $compteDest = Compte::findOrFail($validated['compte_destination_id']);
                }

                if ($compteDest->statut !== 'actif') {
                    return response()->json(['message' => 'Le compte de destination n\'est pas actif.'], 422);
                }
            }

            // Application des mouvements
            if ($compteSource) {
                $compteSource->decrement('solde', $montant);
            }

            if ($compteDest) {
                $compteDest->increment('solde', $montant);
            }

            // Enregistrement transaction
            $transaction = Transaction::create([
                'type_transaction' => $type,
                'montant' => $montant,
                'description' => $description,
                'statut' => 'complete',
                'compte_source_id' => $compteSource ? $compteSource->id_compte : null,
                'compte_destination_id' => $compteDest ? $compteDest->id_compte : null,
            ]);

            return response()->json([
                'message' => 'Opération bancaire effectuée avec succès.',
                'transaction' => $transaction->load(['compteSource', 'compteDestination'])
            ], 201);
        });
    }
}

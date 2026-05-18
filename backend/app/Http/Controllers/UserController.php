<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Liste des utilisateurs (Admin & Banquier)
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'client') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        return response()->json(Utilisateur::all());
    }

    /**
     * Modification du statut d'un utilisateur (Admin)
     */
    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Seul un administrateur peut modifier le statut d\'un utilisateur.'], 403);
        }

        $validated = $request->validate([
            'statut' => 'required|in:actif,inactif,suspendu',
        ]);

        $cible = Utilisateur::findOrFail($id);
        
        if ($cible->id_utilisateur === $user->id_utilisateur) {
            return response()->json(['message' => 'Vous ne pouvez pas modifier votre propre statut.'], 422);
        }

        $cible->update(['statut' => $validated['statut']]);

        return response()->json([
            'message' => 'Statut de l\'utilisateur mis à jour.',
            'user' => $cible
        ]);
    }
}

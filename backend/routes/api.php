<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompteController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Routes publiques (Authentification)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées par Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Session & Profil
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);

    // Gestion des Comptes Bancaires
    Route::get('/comptes', [CompteController::class, 'index']);
    Route::get('/comptes/{id}', [CompteController::class, 'show']);
    Route::post('/comptes', [CompteController::class, 'store']);
    Route::patch('/comptes/{id}/statut', [CompteController::class, 'updateStatus']);

    // Transactions Financières
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);

    // Gestion des Utilisateurs (Admin)
    Route::get('/utilisateurs', [UserController::class, 'index']);
    Route::patch('/utilisateurs/{id}/statut', [UserController::class, 'updateStatus']);
});

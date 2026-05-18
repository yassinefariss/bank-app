<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Compte extends Model
{
    use HasFactory;

    protected $table = 'comptes';
    protected $primaryKey = 'id_compte';

    protected $fillable = [
        'numero_compte',
        'type_compte',
        'solde',
        'statut',
        'id_utilisateur',
    ];

    /**
     * Get the user that owns the account.
     */
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur', 'id_utilisateur');
    }

    /**
     * Get transactions where this account is the source.
     */
    public function debits()
    {
        return $this->hasMany(Transaction::class, 'compte_source_id', 'id_compte');
    }

    /**
     * Get transactions where this account is the destination.
     */
    public function credits()
    {
        return $this->hasMany(Transaction::class, 'compte_destination_id', 'id_compte');
    }
}

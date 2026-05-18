<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $table = 'transactions';
    protected $primaryKey = 'id_transaction';

    protected $fillable = [
        'type_transaction',
        'montant',
        'date_transaction',
        'description',
        'statut',
        'compte_source_id',
        'compte_destination_id',
    ];

    protected $casts = [
        'date_transaction' => 'datetime',
        'montant' => 'decimal:2',
    ];

    /**
     * Get the source account.
     */
    public function compteSource()
    {
        return $this->belongsTo(Compte::class, 'compte_source_id', 'id_compte');
    }

    /**
     * Get the destination account.
     */
    public function compteDestination()
    {
        return $this->belongsTo(Compte::class, 'compte_destination_id', 'id_compte');
    }
}

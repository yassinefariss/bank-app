<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id('id_transaction');
            $table->enum('type_transaction', ['depot', 'retrait', 'virement']);
            $table->decimal('montant', 15, 2);
            $table->timestamp('date_transaction')->useCurrent();
            $table->string('description')->nullable();
            $table->enum('statut', ['complete', 'en_attente', 'annulee'])->default('complete');
            $table->foreignId('compte_source_id')->nullable()->constrained('comptes', 'id_compte')->nullOnDelete();
            $table->foreignId('compte_destination_id')->nullable()->constrained('comptes', 'id_compte')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};

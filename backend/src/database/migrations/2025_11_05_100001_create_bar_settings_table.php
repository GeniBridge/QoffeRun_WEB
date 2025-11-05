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
        Schema::create('bar_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bar_id')->constrained()->onDelete('cascade');
            $table->string('key'); // Chiave dell'impostazione specifica del bar
            $table->text('value'); // Valore dell'impostazione
            $table->string('type')->default('string'); // string, json, boolean, number
            $table->string('category'); // stripe, social, notifications, customizations
            $table->string('name'); // Nome leggibile dell'impostazione
            $table->text('description')->nullable(); // Descrizione dell'impostazione
            $table->boolean('is_encrypted')->default(false); // Se il valore deve essere crittografato
            $table->timestamps();
            
            // Vincolo di unicità per bar e chiave
            $table->unique(['bar_id', 'key']);
            
            // Indici per performance
            $table->index(['bar_id', 'category']);
            $table->index(['category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bar_settings');
    }
};
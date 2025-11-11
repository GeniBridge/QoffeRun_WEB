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
        Schema::create('branch_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');
            $table->string('key', 255);
            $table->text('value');
            $table->enum('type', ['string', 'number', 'boolean', 'json', 'encrypted'])->default('string');
            $table->timestamps();
            
            // Unique constraint per branch + key
            $table->unique(['branch_id', 'key']);
            
            // Index for faster queries
            $table->index(['branch_id', 'key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branch_settings');
    }
};

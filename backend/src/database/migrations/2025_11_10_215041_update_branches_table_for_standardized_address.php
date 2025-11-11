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
        Schema::table('branches', function (Blueprint $table) {
            // Check and add new standardized address fields only if they don't exist
            if (!Schema::hasColumn('branches', 'via')) {
                $table->string('via')->nullable()->after('address')->comment('Street name (e.g., "Via Giuseppe Garibaldi")');
            }
            if (!Schema::hasColumn('branches', 'numero_civico')) {
                $table->string('numero_civico', 20)->nullable()->after('via')->comment('Street number (e.g., "78", "12/A")');
            }
            if (!Schema::hasColumn('branches', 'citta')) {
                $table->string('citta', 100)->nullable()->after('numero_civico')->comment('City name');
            }
            // provincia already exists, rename existing one to match our format
            if (!Schema::hasColumn('branches', 'regione')) {
                $table->string('regione', 100)->nullable()->after('provincia')->comment('Region name (e.g., "Campania", "Lombardia")');
            }
            // cap already exists
            if (!Schema::hasColumn('branches', 'paese')) {
                $table->string('paese', 100)->default('Italia')->after('cap')->comment('Country name');
            }
            if (!Schema::hasColumn('branches', 'lat')) {
                $table->decimal('lat', 10, 8)->nullable()->after('paese')->comment('Latitude coordinate');
            }
            if (!Schema::hasColumn('branches', 'lng')) {
                $table->decimal('lng', 11, 8)->nullable()->after('lat')->comment('Longitude coordinate');
            }
            
            // Keep existing fields for backward compatibility initially
            // We'll migrate data and then remove them in a separate migration
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            // Only drop columns that we added
            if (Schema::hasColumn('branches', 'via')) {
                $table->dropColumn('via');
            }
            if (Schema::hasColumn('branches', 'numero_civico')) {
                $table->dropColumn('numero_civico');
            }
            if (Schema::hasColumn('branches', 'citta')) {
                $table->dropColumn('citta');
            }
            if (Schema::hasColumn('branches', 'regione')) {
                $table->dropColumn('regione');
            }
            if (Schema::hasColumn('branches', 'paese')) {
                $table->dropColumn('paese');
            }
            if (Schema::hasColumn('branches', 'lat')) {
                $table->dropColumn('lat');
            }
            if (Schema::hasColumn('branches', 'lng')) {
                $table->dropColumn('lng');
            }
            // Don't drop provincia and cap as they existed before
        });
    }
};

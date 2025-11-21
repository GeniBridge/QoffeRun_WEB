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
        Schema::table('menus', function (Blueprint $table) {
            // Add missing columns
            if (!Schema::hasColumn('menus', 'description')) {
                $table->text('description')->nullable()->after('name');
            }
            if (!Schema::hasColumn('menus', 'menu_type')) {
                $table->enum('menu_type', ['breakfast', 'lunch', 'dinner', 'drinks', 'desserts', 'specials'])->default('drinks')->after('description');
            }
            if (!Schema::hasColumn('menus', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('menu_type');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->dropColumn(['description', 'menu_type']);
            // Keep is_active as it might be used elsewhere
        });
    }
};

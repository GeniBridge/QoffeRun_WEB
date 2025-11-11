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
        Schema::table('chains', function (Blueprint $table) {
            $table->string('cover_image_path', 500)->nullable()->after('logo_path');
            $table->string('brand_logo_path', 500)->nullable()->after('cover_image_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chains', function (Blueprint $table) {
            $table->dropColumn(['cover_image_path', 'brand_logo_path']);
        });
    }
};

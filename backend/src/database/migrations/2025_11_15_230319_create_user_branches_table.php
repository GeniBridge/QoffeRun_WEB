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
        Schema::create('user_branches', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('branch_id');
            $table->string('role_at_branch')->default('staff'); // staff, manager, supervisor
            $table->boolean('is_primary_branch')->default(false);
            $table->date('assigned_at')->default(now());
            $table->date('unassigned_at')->nullable();
            $table->json('permissions')->nullable(); // branch-specific permissions
            $table->json('work_schedule')->nullable(); // schedule for this branch
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('branch_id')->references('id')->on('branches')->onDelete('cascade');
            
            $table->unique(['user_id', 'branch_id']);
            $table->index(['user_id', 'branch_id', 'role_at_branch']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_branches');
    }
};

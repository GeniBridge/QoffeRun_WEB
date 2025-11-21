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
        Schema::create('branch_feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('set null');
            $table->integer('rating')->unsigned()->comment('Rating 1-5 stars');
            $table->text('comment')->nullable();
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['branch_id', 'rating']);
            $table->index(['user_id', 'branch_id']);
            $table->index(['order_id']);
            
            // Prevent multiple feedback for same order
            $table->unique(['user_id', 'order_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branch_feedback');
    }
};

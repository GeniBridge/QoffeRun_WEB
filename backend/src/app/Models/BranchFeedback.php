<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BranchFeedback extends Model
{
    protected $table = 'branch_feedback';

    protected $fillable = [
        'user_id',
        'branch_id',
        'order_id',
        'rating',
        'comment'
    ];

    protected $casts = [
        'rating' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that gave the feedback
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the branch that received the feedback
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Get the order related to this feedback
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}

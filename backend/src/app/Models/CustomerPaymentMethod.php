<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerPaymentMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'stripe_payment_method_id',
        'card_brand',
        'card_last4',
        'card_exp_month',
        'card_exp_year',
        'card_fingerprint',
        'is_default',
        'billing_details',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'billing_details' => 'array',
        'card_exp_month' => 'integer',
        'card_exp_year' => 'integer',
    ];

    protected $hidden = [
        'stripe_payment_method_id',
        'card_fingerprint',
    ];

    protected $appends = [
        'display_name',
        'is_expired',
    ];

    /**
     * Relationship with User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get display name for card
     */
    public function getDisplayNameAttribute()
    {
        return ucfirst($this->card_brand) . ' •••• ' . $this->card_last4;
    }

    /**
     * Check if card is expired
     */
    public function getIsExpiredAttribute()
    {
        $now = now();
        $expiry = \Carbon\Carbon::createFromDate($this->card_exp_year, $this->card_exp_month, 1)->endOfMonth();
        return $now->greaterThan($expiry);
    }

    /**
     * Scope for default cards
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Scope for non-expired cards
     */
    public function scopeValid($query)
    {
        $currentYear = now()->year;
        $currentMonth = now()->month;
        
        return $query->where(function($q) use ($currentYear, $currentMonth) {
            $q->where('card_exp_year', '>', $currentYear)
              ->orWhere(function($subQ) use ($currentYear, $currentMonth) {
                  $subQ->where('card_exp_year', $currentYear)
                       ->where('card_exp_month', '>=', $currentMonth);
              });
        });
    }
}

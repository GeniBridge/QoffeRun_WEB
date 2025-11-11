<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    use HasFactory;

    protected $fillable = [
        'chain_id',
        'code',
        'name',
        'address',
        'city',
        'province',
        'cap',
        'region',
        'country',
        'latitude',
        'longitude',
        // New standardized address fields
        'via',
        'numero_civico',
        'citta',
        'provincia',
        'regione',
        'paese',
        'lat',
        'lng',
        'phone',
        'email',
        'opening_hours',
        'delivery_enabled',
        'takeaway_enabled',
        'table_service_enabled',
        'has_separate_billing',
        'stripe_account_id',
        'pos_system',
        'max_daily_orders',
        'seating_capacity',
        'staff_count',
        'status',
        'opening_date',
    ];

    protected $casts = [
        'opening_hours' => 'array',
        'delivery_enabled' => 'boolean',
        'takeaway_enabled' => 'boolean',
        'table_service_enabled' => 'boolean',
        'has_separate_billing' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'lat' => 'decimal:8',
        'lng' => 'decimal:8',
        'max_daily_orders' => 'integer',
        'seating_capacity' => 'integer',
        'staff_count' => 'integer',
        'opening_date' => 'date',
    ];

    /**
     * Relazioni
     */
    public function chain(): BelongsTo
    {
        return $this->belongsTo(Chain::class);
    }

    public function managers(): HasMany
    {
        return $this->hasMany(BranchManager::class);
    }

    public function activeManagers(): HasMany
    {
        return $this->managers()->where('status', 'active');
    }

    public function settings(): HasMany
    {
        return $this->hasMany(BranchSettings::class);
    }

    public function primaryManager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id')
            ->whereHas('branchManagers', function ($query) {
                $query->where('branch_id', $this->id)
                    ->where('status', 'active')
                    ->where('is_primary_manager', true);
            });
    }

    /**
     * Accessor per indirizzo completo
     */
    public function getFullAddressAttribute(): string
    {
        $parts = array_filter([
            $this->address,
            $this->cap . ' ' . $this->city . ($this->province ? " ({$this->province})" : ''),
            $this->region,
            $this->country,
        ]);

        return implode(', ', $parts);
    }
}

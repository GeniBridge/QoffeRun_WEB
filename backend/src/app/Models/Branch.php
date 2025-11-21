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
        // Legacy field (keep for backward compatibility)
        'stripe_account_id',
        // Stripe Connect fields
        'stripe_connect_account_id',
        'stripe_connect_status',
        'stripe_connect_capabilities',
        'stripe_connect_verified_at',
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
     * Menu and Order relationships for the new ordering system
     */
    public function menus(): HasMany
    {
        return $this->hasMany(Menu::class);
    }

    public function activeMenu(): HasMany
    {
        return $this->menus()->where('is_active', true);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function todaysOrders(): HasMany
    {
        return $this->orders()->whereDate('created_at', today());
    }

    /**
     * Many-to-many relationship with users (staff assignments)
     */
    public function assignedUsers()
    {
        return $this->belongsToMany(User::class, 'user_branches')
                    ->withPivot([
                        'role_at_branch', 
                        'is_primary_branch', 
                        'assigned_at', 
                        'unassigned_at',
                        'permissions',
                        'work_schedule'
                    ]);
    }

    /**
     * Get a specific setting value
     */
    public function getSetting(string $key, $default = null)
    {
        $setting = $this->settings()->where('key', $key)->first();
        return $setting ? $setting->typed_value : $default;
    }

    /**
     * Set a setting value
     */
    public function setSetting(string $key, $value, string $type = 'string'): void
    {
        BranchSettings::updateOrCreate(
            ['branch_id' => $this->id, 'key' => $key],
            ['value' => $value, 'type' => $type]
        );
    }

    /**
     * Delete a setting
     */
    public function deleteSetting(string $key): bool
    {
        return $this->settings()->where('key', $key)->delete() > 0;
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

    public function reviews(): HasMany
    {
        return $this->hasMany(\App\Models\Review::class);
    }

    public function products(): HasMany
    {
        // Adjust the model and foreign key if needed
        return $this->hasMany(\App\Models\Product::class, 'branch_id');
    }
}

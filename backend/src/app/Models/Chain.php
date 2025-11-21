<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Chain extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'name',
        'description',
        'business_name',
        'vat_number',
        'tax_code',
        'legal_address',
        'billing_address',
        // New standardized legal address fields
        'legal_via',
        'legal_numero_civico',
        'legal_citta',
        'legal_provincia',
        'legal_regione',
        'legal_cap',
        'legal_paese',
        'legal_lat',
        'legal_lng',
        // New standardized billing address fields
        'billing_via',
        'billing_numero_civico',
        'billing_citta',
        'billing_provincia',
        'billing_regione',
        'billing_cap',
        'billing_paese',
        'billing_lat',
        'billing_lng',
        'phone',
        'email',
        'pec_email',
        'website',
        'logo_path',
        'brand_logo_path',
        'cover_image_path',
        'stripe_account_id',
        'payment_mode',
        'commission_rate',
        'status',
        'onboarding_completed',
        'total_branches',
        'settings',
    ];

    protected $casts = [
        'onboarding_completed' => 'boolean',
        'commission_rate' => 'decimal:2',
        'total_branches' => 'integer',
        'settings' => 'array',
        'legal_lat' => 'decimal:8',
        'legal_lng' => 'decimal:8',
        'billing_lat' => 'decimal:8',
        'billing_lng' => 'decimal:8',
    ];

    /**
     * Relazioni
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Accessor per contare le filiali
     */
    public function updateBranchCount(): void
    {
        $this->update(['total_branches' => $this->branches()->count()]);
    }

    /**
     * Accessor for logo_path (backward compatibility)
     * Returns brand_logo_path if available, falls back to legacy logo_path
     */
    public function getLogoPathAttribute($value)
    {
        // If brand_logo_path exists, use it (new format)
        if ($this->attributes['brand_logo_path'] ?? null) {
            return $this->attributes['brand_logo_path'];
        }
        // Otherwise return the legacy logo_path value
        return $value;
    }

    /**
     * Accessor for cover_image_path to ensure it's in the correct format
     */
    public function getCoverImagePathAttribute($value)
    {
        return $value;
    }
}

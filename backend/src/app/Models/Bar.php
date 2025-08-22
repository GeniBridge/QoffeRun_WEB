<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bar extends Model
{
    protected $fillable = [
        'user_id',
        'name',

        // Legacy combined address (kept for compat)
        'address',

        // New flat address fields
        'address_street',
        'address_number',
        'address_city',
        'address_province',
        'address_region',
        'address_postal_code',

        // Geo
        'latitude',
        'longitude',

        // Details
        'description',
        'weekdays_open',
        'weekdays_close',
        'weekend_open',
        'weekend_close',

        // Media
        'logo',
        'photo',
        'cover_image',

        // System
        'qr_code',
        'status',
    ];

    /**
     * Automatically include these computed attributes in JSON.
     */
    protected $appends = [
        'logo_url',
        'photo_url',
        'cover_image_url',
        'address_structured',
        'full_address',
    ];

    /* ---------------------------
     | Accessors (URLs & Address)
     |--------------------------- */

    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo ? url('storage/' . ltrim($this->logo, '/')) : null;
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo ? url('storage/' . ltrim($this->photo, '/')) : null;
    }

    public function getCoverImageUrlAttribute(): ?string
    {
        return $this->cover_image ? url('storage/' . ltrim($this->cover_image, '/')) : null;
    }

    /**
     * Structured address assembled from flat columns.
     * Falls back to nulls if fields are missing.
     */
    public function getAddressStructuredAttribute(): array
    {
        return [
            'street'     => $this->address_street,
            'number'     => $this->address_number,
            'city'       => $this->address_city,
            'province'   => $this->address_province,
            'region'     => $this->address_region,
            'postalCode' => $this->address_postal_code,
        ];
    }

    /**
     * Human-readable full address.
     * Uses flat fields if present; otherwise returns legacy 'address'.
     */
    public function getFullAddressAttribute(): ?string
    {
        // Prefer the new fields when at least street & city exist
        if ($this->address_street || $this->address_city) {
            $parts = array_filter([
                trim(($this->address_street ?? '') . ' ' . ($this->address_number ?? '')),
                trim(($this->address_city ?? '') . ($this->address_province ? " ({$this->address_province})" : '')),
                $this->address_region,
                $this->address_postal_code,
            ]);

            return count($parts) ? implode(', ', $parts) : null;
        }

        // Fallback to legacy combined text column
        return $this->address ?: null;
    }

    /* -------------
     | Relationships
     |------------- */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function menu(): HasMany
    {
        return $this->hasMany(Menu::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(Payout::class);
    }
}

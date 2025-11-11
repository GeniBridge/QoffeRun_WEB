<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BranchManager extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'user_id',
        'assigned_by',
        'assigned_at',
        'status',
        'is_primary_manager',
        'permissions',
        'max_discount_percentage',
        'can_access_reports',
        'can_manage_staff',
        'can_modify_menu',
        'work_schedule',
        'hourly_rate',
        'notes',
        'last_activity_at',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'is_primary_manager' => 'boolean',
        'permissions' => 'array',
        'max_discount_percentage' => 'decimal:2',
        'can_access_reports' => 'boolean',
        'can_manage_staff' => 'boolean',
        'can_modify_menu' => 'boolean',
        'work_schedule' => 'array',
        'hourly_rate' => 'decimal:2',
        'last_activity_at' => 'datetime',
    ];

    /**
     * Relazioni
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * Scope per gestori attivi
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope per gestori principali
     */
    public function scopePrimary($query)
    {
        return $query->where('is_primary_manager', true);
    }

    /**
     * Verifica se ha un permesso specifico
     */
    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions ?? []);
    }
}

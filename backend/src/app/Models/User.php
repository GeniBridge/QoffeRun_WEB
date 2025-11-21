<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'chain_id',
        'employee_code',
        'hire_date',
        'termination_date',
        'emergency_contact',
        'work_preferences',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'hire_date' => 'date',
        'termination_date' => 'date',
        'emergency_contact' => 'array',
        'work_preferences' => 'array',
    ];

    protected $attributes = [
        'role' => 'customer',
    ];

    // Role Checkers
    public function isAdmin()           { return $this->role === 'admin'; }
    public function isChainOwner()      { return $this->role === 'chain_owner'; }
    public function isBranchManager()   { return $this->role === 'branch_manager'; }
    public function isStaff()           { return $this->role === 'staff'; }
    public function isCustomer()        { return $this->role === 'customer'; }
    // Legacy - manteniamo per retrocompatibilità, esteso per includere chain_owner
    public function isBarista()         { return $this->role === 'barista' || $this->role === 'branch_manager' || $this->role === 'chain_owner'; }

    // Multi-Tenant Relationships
    public function chain()
    {
        return $this->belongsTo(Chain::class);
    }

    public function ownedChains()
    {
        return $this->hasMany(Chain::class, 'owner_id');
    }

    public function branchManagers()
    {
        return $this->hasMany(BranchManager::class);
    }

    public function managedBranches()
    {
        return $this->belongsToMany(Branch::class, 'branch_managers')
                    ->withPivot(['status', 'is_primary_manager', 'permissions'])
                    ->wherePivot('status', 'active');
    }

    /**
     * Many-to-many relationship with branches (for staff assignments)
     */
    public function assignedBranches()
    {
        return $this->belongsToMany(Branch::class, 'user_branches')
                    ->withPivot([
                        'role_at_branch', 
                        'is_primary_branch', 
                        'assigned_at', 
                        'unassigned_at',
                        'permissions',
                        'work_schedule'
                    ])
                    ->whereNull('user_branches.unassigned_at');
    }

    /**
     * Get primary branch for this user
     */
    public function primaryBranch()
    {
        return $this->assignedBranches()
                    ->wherePivot('is_primary_branch', true)
                    ->first();
    }

    /**
     * Check if user can access a specific branch
     */
    public function canAccessBranch($branchId): bool
    {
        // Admin can access all branches
        if ($this->isAdmin()) {
            return true;
        }

        // Chain owners can access all branches in their chains
        if ($this->isChainOwner()) {
            $branch = Branch::find($branchId);
            return $branch && $this->ownedChains()->where('id', $branch->chain_id)->exists();
        }

        // Branch managers can access their managed branches
        if ($this->isBranchManager()) {
            return $this->managedBranches()->where('branches.id', $branchId)->exists();
        }

        // Staff can access their assigned branches
        if ($this->isStaff() || $this->isBranchManager() || $this->isBarista()) {
            return $this->assignedBranches()->where('branches.id', $branchId)->exists();
        }

        return false;
    }

    // Legacy Relationships
    public function bar()
    {
        return $this->hasOne(Bar::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
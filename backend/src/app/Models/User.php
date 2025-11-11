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

    // Role Checkers
    public function isAdmin()           { return $this->role === 'admin'; }
    public function isChainOwner()      { return $this->role === 'chain_owner'; }
    public function isBranchManager()   { return $this->role === 'branch_manager'; }
    public function isStaff()           { return $this->role === 'staff'; }
    public function isCustomer()        { return $this->role === 'customer'; }
    // Legacy - manteniamo per retrocompatibilità
    public function isBarista()         { return $this->role === 'barista' || $this->role === 'branch_manager'; }

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
<?php

namespace App\Services;

use App\Mail\StaffCredentialsNotification;
use App\Mail\ShiftAssignmentNotification;
use App\Models\User;
use App\Models\Branch;
use App\Models\Chain;
use Illuminate\Support\Facades\Log;

class StaffEmailService
{
    /**
     * Send credentials notification to new staff member
     */
    public static function sendCredentialsNotification(
        User $staffUser, 
        Branch $branch, 
        string $plainPassword,
        array $additionalData = []
    ): bool {
        try {
            // Load chain data
            $chain = $branch->chain;
            
            if (!$chain) {
                Log::error("Chain not found for branch {$branch->id}");
                return false;
            }
            
            // Prepare staff data
            $staffData = [
                'name' => $staffUser->name,
                'email' => $staffUser->email,
                'role' => $staffUser->role,
                'employee_code' => $staffUser->employee_code,
                'permissions' => $staffUser->work_preferences['permissions'] ?? []
            ];
            
            // Prepare branch data
            $branchData = [
                'name' => $branch->name,
                'phone' => $branch->phone,
                'email' => $branch->email,
                // Standardized address fields
                'via' => $branch->via,
                'numero_civico' => $branch->numero_civico,
                'citta' => $branch->citta,
                'provincia' => $branch->provincia,
                'cap' => $branch->cap,
                'regione' => $branch->regione,
                'paese' => $branch->paese,
                // Legacy address fields (fallback)
                'address' => $branch->address,
                'city' => $branch->city,
                'province' => $branch->province
            ];
            
            // Prepare chain data
            $chainData = [
                'name' => $chain->name
            ];
            
            // Prepare login credentials
            $loginCredentials = [
                'email' => $staffUser->email,
                'password' => $plainPassword
            ];
            
            // Create and send email
            $email = new StaffCredentialsNotification(
                $staffData,
                $branchData,
                $chainData,
                $loginCredentials
            );
            
            $result = EmailService::sendFromNoReply($email, [$staffUser->email]);
            
            if ($result) {
                Log::info("Staff credentials notification sent successfully", [
                    'staff_id' => $staffUser->id,
                    'staff_email' => $staffUser->email,
                    'staff_role' => $staffUser->role,
                    'branch_id' => $branch->id,
                    'branch_name' => $branch->name,
                    'chain_id' => $chain->id,
                    'chain_name' => $chain->name
                ]);
            } else {
                Log::error("Failed to send staff credentials notification", [
                    'staff_id' => $staffUser->id,
                    'staff_email' => $staffUser->email,
                    'branch_id' => $branch->id
                ]);
            }
            
            return $result;
            
        } catch (\Exception $e) {
            Log::error("Exception while sending staff credentials notification: " . $e->getMessage(), [
                'staff_id' => $staffUser->id ?? null,
                'branch_id' => $branch->id ?? null,
                'exception' => $e->getTraceAsString()
            ]);
            return false;
        }
    }
    
    /**
     * Send shift assignment notification to staff member
     */
    public static function sendShiftAssignmentNotification(
        User $staffUser,
        Branch $branch,
        array $shiftData
    ): bool {
        try {
            // Load chain data
            $chain = $branch->chain;
            
            if (!$chain) {
                Log::error("Chain not found for branch {$branch->id}");
                return false;
            }
            
            // Prepare staff data
            $staffData = [
                'name' => $staffUser->name,
                'email' => $staffUser->email,
                'role' => $staffUser->role
            ];
            
            // Prepare branch data
            $branchData = [
                'name' => $branch->name,
                'phone' => $branch->phone,
                'email' => $branch->email,
                'via' => $branch->via,
                'numero_civico' => $branch->numero_civico,
                'citta' => $branch->citta,
                'provincia' => $branch->provincia,
                'cap' => $branch->cap,
                'regione' => $branch->regione,
                'paese' => $branch->paese,
                'address' => $branch->address,
                'city' => $branch->city,
                'province' => $branch->province
            ];
            
            // Prepare chain data
            $chainData = [
                'name' => $chain->name
            ];
            
            // Create and send email
            $email = new ShiftAssignmentNotification(
                $staffData,
                $branchData,
                $chainData,
                $shiftData
            );
            
            $result = EmailService::sendFromNoReply($email, [$staffUser->email]);
            
            if ($result) {
                Log::info("Shift assignment notification sent successfully", [
                    'staff_id' => $staffUser->id,
                    'staff_email' => $staffUser->email,
                    'branch_id' => $branch->id,
                    'shift_date' => $shiftData['date'] ?? null
                ]);
            } else {
                Log::error("Failed to send shift assignment notification", [
                    'staff_id' => $staffUser->id,
                    'staff_email' => $staffUser->email,
                    'branch_id' => $branch->id
                ]);
            }
            
            return $result;
            
        } catch (\Exception $e) {
            Log::error("Exception while sending shift assignment notification: " . $e->getMessage(), [
                'staff_id' => $staffUser->id ?? null,
                'branch_id' => $branch->id ?? null,
                'exception' => $e->getTraceAsString()
            ]);
            return false;
        }
    }
    
    /**
     * Send branch assignment notification to branch manager
     */
    public static function sendBranchAssignmentNotification(
        User $managerUser,
        Branch $branch,
        array $managerData = []
    ): bool {
        try {
            // Load chain data
            $chain = $branch->chain;
            
            if (!$chain) {
                Log::error("Chain not found for branch {$branch->id}");
                return false;
            }
            
            // For branch managers, we'll use the same credentials notification
            // but with enhanced permissions data
            $staffData = [
                'name' => $managerUser->name,
                'email' => $managerUser->email,
                'role' => 'branch_manager',
                'employee_code' => $managerUser->employee_code,
                'permissions' => $managerData['permissions'] ?? []
            ];
            
            // Prepare branch data
            $branchData = [
                'name' => $branch->name,
                'phone' => $branch->phone,
                'email' => $branch->email,
                'via' => $branch->via,
                'numero_civico' => $branch->numero_civico,
                'citta' => $branch->citta,
                'provincia' => $branch->provincia,
                'cap' => $branch->cap,
                'regione' => $branch->regione,
                'paese' => $branch->paese,
                'address' => $branch->address,
                'city' => $branch->city,
                'province' => $branch->province
            ];
            
            // Prepare chain data
            $chainData = [
                'name' => $chain->name
            ];
            
            // For existing users, we don't send password, just login info
            $loginCredentials = [
                'email' => $managerUser->email,
                'password' => 'Utilizza la tua password esistente'
            ];
            
            // Create and send email
            $email = new StaffCredentialsNotification(
                $staffData,
                $branchData,
                $chainData,
                $loginCredentials
            );
            
            $result = EmailService::sendFromNoReply($email, [$managerUser->email]);
            
            if ($result) {
                Log::info("Branch manager assignment notification sent successfully", [
                    'manager_id' => $managerUser->id,
                    'manager_email' => $managerUser->email,
                    'branch_id' => $branch->id,
                    'branch_name' => $branch->name,
                    'chain_id' => $chain->id,
                    'chain_name' => $chain->name
                ]);
            }
            
            return $result;
            
        } catch (\Exception $e) {
            Log::error("Exception while sending branch manager assignment notification: " . $e->getMessage());
            return false;
        }
    }
}
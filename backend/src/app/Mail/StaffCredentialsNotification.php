<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class StaffCredentialsNotification extends Mailable
{
    use SerializesModels;

    public $staffData;
    public $branchData;
    public $chainData;
    public $loginCredentials;

    /**
     * Create a new message instance.
     */
    public function __construct(array $staffData, array $branchData, array $chainData, array $loginCredentials)
    {
        $this->staffData = $staffData;
        $this->branchData = $branchData;
        $this->chainData = $chainData;
        $this->loginCredentials = $loginCredentials;
        
        $role = $staffData['role'] === 'branch_manager' ? 'Gestore Filiale' : 'Staff';
        $this->subject = "Benvenuto in QoffeRun - Accesso {$role} per {$branchData['name']}";
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->view('emails.staff-credentials-notification')
                    ->text('emails.staff-credentials-notification-text')
                    ->with([
                        'staffName' => $this->staffData['name'],
                        'staffEmail' => $this->staffData['email'],
                        'staffRole' => $this->staffData['role'],
                        'roleName' => $this->staffData['role'] === 'branch_manager' ? 'Gestore Filiale' : 'Membro dello Staff',
                        'branchName' => $this->branchData['name'],
                        'branchAddress' => $this->getBranchAddress(),
                        'branchPhone' => $this->branchData['phone'] ?? 'Non specificato',
                        'branchEmail' => $this->branchData['email'] ?? 'Non specificato',
                        'chainName' => $this->chainData['name'],
                        'loginUrl' => 'https://bar.qofferun.com',
                        'email' => $this->loginCredentials['email'],
                        'password' => $this->loginCredentials['password'],
                        'employeeCode' => $this->staffData['employee_code'] ?? 'Non assegnato',
                        'permissions' => $this->formatPermissions(),
                        'currentYear' => date('Y'),
                        'supportEmail' => 'supporto@qofferun.com'
                    ]);
    }
    
    /**
     * Format the branch address
     */
    private function getBranchAddress(): string
    {
        $address = [];
        
        if (!empty($this->branchData['via'])) {
            $street = $this->branchData['via'];
            if (!empty($this->branchData['numero_civico'])) {
                $street .= ', ' . $this->branchData['numero_civico'];
            }
            $address[] = $street;
        } elseif (!empty($this->branchData['address'])) {
            $address[] = $this->branchData['address'];
        }
        
        if (!empty($this->branchData['citta'])) {
            $cityLine = $this->branchData['citta'];
            if (!empty($this->branchData['cap'])) {
                $cityLine = $this->branchData['cap'] . ' ' . $cityLine;
            }
            if (!empty($this->branchData['provincia'])) {
                $cityLine .= ' (' . $this->branchData['provincia'] . ')';
            }
            $address[] = $cityLine;
        } elseif (!empty($this->branchData['city'])) {
            $cityLine = $this->branchData['city'];
            if (!empty($this->branchData['cap'])) {
                $cityLine = $this->branchData['cap'] . ' ' . $cityLine;
            }
            if (!empty($this->branchData['province'])) {
                $cityLine .= ' (' . $this->branchData['province'] . ')';
            }
            $address[] = $cityLine;
        }
        
        return implode(', ', $address) ?: 'Indirizzo non specificato';
    }
    
    /**
     * Format permissions for display
     */
    private function formatPermissions(): array
    {
        $permissions = $this->staffData['permissions'] ?? [];
        
        $permissionLabels = [
            'orders.view' => 'Visualizzazione ordini',
            'orders.create' => 'Creazione ordini',
            'orders.update' => 'Modifica ordini',
            'orders.cancel' => 'Annullamento ordini',
            'menu.view' => 'Visualizzazione menu',
            'menu.update' => 'Modifica menu',
            'inventory.view' => 'Visualizzazione inventario',
            'inventory.update' => 'Gestione inventario',
            'payments.view' => 'Visualizzazione pagamenti',
            'payments.process' => 'Elaborazione pagamenti',
            'payments.refund' => 'Rimborsi',
            'reports.view' => 'Visualizzazione report',
            'reports.export' => 'Esportazione report',
            'analytics.view' => 'Visualizzazione analisi',
            'staff.view' => 'Visualizzazione staff',
            'staff.manage' => 'Gestione staff',
            'schedules.manage' => 'Gestione turni',
            'settings.branch' => 'Impostazioni filiale'
        ];
        
        $formatted = [];
        foreach ($permissions as $permission) {
            if (isset($permissionLabels[$permission])) {
                $formatted[] = $permissionLabels[$permission];
            }
        }
        
        return $formatted;
    }
}
<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ShiftAssignmentNotification extends Mailable
{
    use SerializesModels;

    public $staffData;
    public $branchData;
    public $chainData;
    public $shiftData;

    /**
     * Create a new message instance.
     */
    public function __construct(array $staffData, array $branchData, array $chainData, array $shiftData)
    {
        $this->staffData = $staffData;
        $this->branchData = $branchData;
        $this->chainData = $chainData;
        $this->shiftData = $shiftData;
        
        $this->subject = "Nuovo Turno Assegnato - {$branchData['name']} | {$shiftData['date']}";
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->view('emails.shift-assignment-notification')
                    ->text('emails.shift-assignment-notification-text')
                    ->with([
                        'staffName' => $this->staffData['name'],
                        'staffRole' => $this->staffData['role'] === 'branch_manager' ? 'Gestore Filiale' : 'Membro dello Staff',
                        'branchName' => $this->branchData['name'],
                        'branchAddress' => $this->getBranchAddress(),
                        'branchPhone' => $this->branchData['phone'] ?? 'Non specificato',
                        'chainName' => $this->chainData['name'],
                        'shiftDate' => $this->formatDate($this->shiftData['date']),
                        'shiftType' => $this->formatShiftType($this->shiftData['shift_type']),
                        'shiftTime' => $this->formatShiftTime(),
                        'shiftNotes' => $this->shiftData['notes'] ?? '',
                        'loginUrl' => 'https://bar.qofferun.com',
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
     * Format date for display
     */
    private function formatDate(string $date): string
    {
        return \Carbon\Carbon::parse($date)->locale('it')->isoFormat('dddd D MMMM YYYY');
    }
    
    /**
     * Format shift type for display
     */
    private function formatShiftType(string $shiftType): string
    {
        $types = [
            'morning' => 'Mattino',
            'afternoon' => 'Pomeriggio',
            'evening' => 'Sera',
            'night' => 'Notte',
            'full_day' => 'Giornata intera'
        ];
        
        return $types[$shiftType] ?? ucfirst($shiftType);
    }
    
    /**
     * Format shift time for display
     */
    private function formatShiftTime(): string
    {
        $startTime = $this->shiftData['start_time'];
        $endTime = $this->shiftData['end_time'];
        
        if ($startTime && $endTime) {
            return "dalle {$startTime} alle {$endTime}";
        } elseif ($startTime) {
            return "dalle {$startTime}";
        } elseif ($endTime) {
            return "fino alle {$endTime}";
        }
        
        return 'Orario da definire';
    }
}
<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BarPasswordReset extends Mailable
{
    use SerializesModels;

    public $barData;
    public $resetData;

    /**
     * Create a new message instance.
     */
    public function __construct(array $barData, array $resetData)
    {
        $this->barData = $barData;
        $this->resetData = $resetData;
        $this->subject = 'Reset password - Pannello QoffeRun';
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->view('emails.bar-password-reset')
                    ->text('emails.bar-password-reset-text')
                    ->with([
                        'barName' => $this->barData['nome'],
                        'userEmail' => $this->resetData['email'],
                        'userName' => $this->resetData['name'],
                        'resetToken' => $this->resetData['token'],
                        'resetUrl' => $this->resetData['url'],
                        'expiresAt' => $this->resetData['expires_at'],
                    ]);
    }
}
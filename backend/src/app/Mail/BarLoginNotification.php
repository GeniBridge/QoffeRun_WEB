<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BarLoginNotification extends Mailable
{
    use SerializesModels;

    public $barData;
    public $loginData;

    /**
     * Create a new message instance.
     */
    public function __construct(array $barData, array $loginData)
    {
        $this->barData = $barData;
        $this->loginData = $loginData;
        $this->subject = 'Accesso effettuato al pannello QoffeRun';
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->view('emails.bar-login-notification')
                    ->text('emails.bar-login-notification-text')
                    ->with([
                        'barName' => $this->barData['nome'],
                        'userEmail' => $this->loginData['email'],
                        'loginTime' => $this->loginData['time'],
                        'ipAddress' => $this->loginData['ip'],
                        'userAgent' => $this->loginData['user_agent'] ?? 'Non disponibile',
                    ]);
    }
}
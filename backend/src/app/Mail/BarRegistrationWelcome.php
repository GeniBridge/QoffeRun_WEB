<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BarRegistrationWelcome extends Mailable
{
    use Queueable, SerializesModels;

    public $barData;
    public $userData;

    public function __construct($barData, $userData)
    {
        $this->barData = $barData;
        $this->userData = $userData;
    }

    public function build()
    {
        return $this->subject('Benvenuto su QoffeRun - Registrazione completata!')
                    ->view('emails.bar-registration-welcome')
                    ->text('emails.bar-registration-welcome-text')
                    ->with([
                        'barName' => $this->barData['nome'],
                        'gestoreName' => $this->userData['nome'],
                        'barCity' => $this->barData['citta']
                    ]);
    }
}
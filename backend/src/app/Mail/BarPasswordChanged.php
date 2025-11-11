<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BarPasswordChanged extends Mailable
{
    use SerializesModels;

    public $barData;
    public $changeData;

    /**
     * Create a new message instance.
     */
    public function __construct(array $barData, array $changeData)
    {
        $this->barData = $barData;
        $this->changeData = $changeData;
        $this->subject = 'Password modificata - Pannello QoffeRun';
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->view('emails.bar-password-changed')
                    ->text('emails.bar-password-changed-text')
                    ->with([
                        'barName' => $this->barData['nome'],
                        'userEmail' => $this->changeData['email'],
                        'userName' => $this->changeData['name'],
                        'changeTime' => $this->changeData['time'],
                        'ipAddress' => $this->changeData['ip'],
                    ]);
    }
}
<?php

namespace App\Services;

use App\Models\SystemSetting;
use App\Providers\EmailServiceProvider;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;
use Illuminate\Mail\Mailable;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport;
use Symfony\Component\Mime\Email;

class EmailService
{
    /**
     * Invia email (sempre e solo da noreply@qofferun.com)
     */
    public static function sendEmail(Mailable $mailable, array $to): bool
    {
        return self::sendEmailInternal($mailable, $to);
    }

    /**
     * Metodo legacy per compatibilità (usa sempre noreply)
     */
    public static function sendFromNoReply(Mailable $mailable, array $to): bool
    {
        return self::sendEmail($mailable, $to);
    }

    /**
     * Invia email usando transport Symfony diretto (funziona con Aruba) 
     */
    private static function sendEmailInternal(Mailable $mailable, array $to): bool
    {
        try {
            // Crea transport diretto Symfony che funziona con Aruba
            $transport = new EsmtpTransport('smtps.aruba.it', 465, true);
            
            // USA SEMPRE SOLO NOREPLY - MAI PIÙ INFO
            $transport->setUsername('noreply@qofferun.com');
            $transport->setPassword('QofeRun2025@');
            
            // Mittente sempre noreply
            $fromEmail = 'noreply@qofferun.com';
            $fromName = null; // Nessun display name per evitare errori RFC
            
            // Converti Mailable in Symfony Email
            $rendered = $mailable->render();
            $subject = $mailable->subject ?? 'QoffeRun Email';
            
                        // Configurazione messaggio (sempre da noreply)
            $message = (new Email())
                ->from($fromEmail) // Solo email senza nome per evitare errori
                ->to($to[0]) // Prende il primo indirizzo dall'array
                ->subject($subject)
                ->html($rendered);

            // Invia
            $transport->send($message);
            
            \Log::info("Email sent successfully to: " . implode(', ', $to) . " from: {$fromEmail}");
            return true;

        } catch (\Exception $e) {
            \Log::error("Email sending failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Ottieni l'email di supporto
     */
    public static function getSupportEmail(): string
    {
        $setting = SystemSetting::where('category', 'emails')
                                ->where('key', 'support_email')
                                ->first();
        
        return $setting ? $setting->value : 'info@qofferun.com';
    }

    /**
     * Ottieni l'email info
     */
    public static function getInfoEmail(): string
    {
        $setting = SystemSetting::where('category', 'emails')
                                ->where('key', 'info_email')
                                ->first();
        
        return $setting ? $setting->value : 'info@qofferun.com';
    }

    /**
     * Ottieni l'email noreply
     */
    public static function getNoReplyEmail(): string
    {
        $setting = SystemSetting::where('category', 'emails')
                                ->where('key', 'noreply_email')
                                ->first();
        
        return $setting ? $setting->value : 'noreply@qofferun.com';
    }

    /**
     * Test della configurazione email
     */
    public static function testEmailConfiguration(): array
    {
        $results = [];

        // Test email info
        try {
            $testMail = new \App\Mail\TestEmail('Test da info@qofferun.com');
            $result = self::sendFromInfo($testMail, [self::getInfoEmail()]);
            $results['info'] = $result ? 'SUCCESS' : 'FAILED';
        } catch (\Exception $e) {
            $results['info'] = 'ERROR: ' . $e->getMessage();
        }

        // Test email noreply  
        try {
            $testMail = new \App\Mail\TestEmail('Test da noreply@qofferun.com');
            $result = self::sendFromNoReply($testMail, [self::getInfoEmail()]);
            $results['noreply'] = $result ? 'SUCCESS' : 'FAILED';
        } catch (\Exception $e) {
            $results['noreply'] = 'ERROR: ' . $e->getMessage();
        }

        return $results;
    }
}
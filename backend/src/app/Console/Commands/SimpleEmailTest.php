<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SimpleEmailTest extends Command
{
    protected $signature = 'email:simple-test {email=test@gmail.com}';
    protected $description = 'Simple email test with raw Laravel mailer';

    public function handle()
    {
        $email = $this->argument('email');
        
        $this->info('📧 Test Email Semplice');
        $this->info('======================');
        $this->info("Destinatario: {$email}");
        
        try {
            // Test con configurazione temporanea
            config([
                'mail.mailers.smtp.host' => 'smtps.aruba.it',
                'mail.mailers.smtp.port' => 465,
                'mail.mailers.smtp.encryption' => 'ssl',
                'mail.mailers.smtp.username' => 'info@qofferun.com',
                'mail.mailers.smtp.password' => 'QofeRun2025@',
            ]);
            
            Mail::raw('Questo è un test email da QoffeRun!', function ($message) use ($email) {
                $message->to($email)
                        ->from('info@qofferun.com', 'QoffeRun')
                        ->subject('Test Email da QoffeRun');
            });
            
            $this->info('✅ Email inviata con successo!');
            
        } catch (\Exception $e) {
            $this->error('❌ Errore nell\'invio: ' . $e->getMessage());
            
            // Log dell'errore completo
            $this->error('Stack trace: ' . $e->getTraceAsString());
        }
        
        return Command::SUCCESS;
    }
}
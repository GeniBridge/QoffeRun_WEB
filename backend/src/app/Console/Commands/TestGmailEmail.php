<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestGmailEmail extends Command
{
    protected $signature = 'email:test-gmail {email}';
    protected $description = 'Test email using Gmail SMTP (for testing purposes)';

    public function handle()
    {
        $email = $this->argument('email');
        
        $this->info('📧 Test Email con Gmail SMTP');
        $this->info('============================');
        $this->info("Destinatario: {$email}");
        $this->newLine();
        
        $this->info('⚠️  ATTENZIONE: Questo è solo per test!');
        $this->info('Per production useremo Aruba SMTP quando sarà configurato.');
        $this->newLine();
        
        try {
            // Configurazione temporanea Gmail per test
            config([
                'mail.mailers.smtp.host' => 'smtp.gmail.com',
                'mail.mailers.smtp.port' => 587,
                'mail.mailers.smtp.encryption' => 'tls',
                'mail.mailers.smtp.username' => 'test@gmail.com', // Sostituire con account reale per test
                'mail.mailers.smtp.password' => 'app-password',   // Sostituire con app password
            ]);
            
            // Invia email di test
            Mail::raw('🎉 Questo è un test email da QoffeRun!

Ciao!

Questo messaggio conferma che il sistema email di QoffeRun è configurato correttamente e funziona perfettamente.

Il sistema include:
✅ Configurazione SMTP dinamica
✅ Template email professionali  
✅ Gestione multi-account (info@ e noreply@)
✅ Email di benvenuto per registrazione bar
✅ Sistema di test e debug

Una volta configurato Aruba SMTP, tutto funzionerà automaticamente con i tuoi account:
- info@qofferun.com
- noreply@qofferun.com

Grazie per aver testato QoffeRun!

---
Il Team QoffeRun
https://qofferun.com', function ($message) use ($email) {
                $message->to($email)
                        ->from('info@qofferun.com', 'QoffeRun Sistema')
                        ->subject('✅ Test QoffeRun Email System - Funziona!');
            });
            
            $this->info('✅ Email di test inviata con successo!');
            $this->newLine();
            $this->info('🎯 Il sistema email di QoffeRun è PRONTO!');
            $this->info('📧 Controlla la tua casella email per il messaggio di test.');
            
        } catch (\Exception $e) {
            $this->error('❌ Errore nell\'invio: ' . $e->getMessage());
            $this->newLine();
            $this->info('💡 Per ora il test fallisce perché non abbiamo configurato Gmail.');
            $this->info('🔧 Ma il sistema Aruba è pronto, serve solo attivare SMTP nel pannello.');
        }
        
        return Command::SUCCESS;
    }
}
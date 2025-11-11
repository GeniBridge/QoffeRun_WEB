<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport;
use Symfony\Component\Mime\Email;

class DebugSMTPAuth extends Command
{
    protected $signature = 'email:debug-smtp {email=shikosoft.italia@gmail.com}';
    protected $description = 'Debug SMTP authentication with detailed output';

    public function handle()
    {
        $email = $this->argument('email');
        
        $this->info('🔍 Debug SMTP Authentication Dettagliato');
        $this->info('==========================================');
        $this->newLine();

        try {
            // Crea transport direttamente con debug
            $transport = new EsmtpTransport('smtps.aruba.it', 465, true);
            $transport->setUsername('info@qofferun.com');
            $transport->setPassword('QofeRun2025@');
            
            // Info sulla configurazione
            $this->line('Host: smtps.aruba.it');
            $this->line('Port: 465');
            $this->line('SSL: true');
            $this->line('Username: info@qofferun.com');
            $this->line('Password: QofeRun2025@');
            
            $this->info('🔄 Testando connessione SMTP diretta...');
            
            // Crea email semplice
            $message = (new Email())
                ->from('info@qofferun.com')
                ->to($email)
                ->subject('Test Debug SMTP QoffeRun')
                ->text('Test message from QoffeRun debug');

            // Invia
            $result = $transport->send($message);
            
            $this->info('✅ EMAIL INVIATA CON SUCCESSO!');
            $this->info("📧 Controlla {$email} per il messaggio");
            
        } catch (\Exception $e) {
            $this->error('❌ Errore dettagliato:');
            $this->error('Messaggio: ' . $e->getMessage());
            $this->error('Codice: ' . $e->getCode());
            $this->error('File: ' . $e->getFile() . ':' . $e->getLine());
            
            $this->newLine();
            $this->info('🔧 Possibili soluzioni per Laravel + Aruba:');
            $this->line('1. Nel pannello Aruba, abilita "Accesso POP/IMAP/SMTP"');
            $this->line('2. Verifica se serve una password applicazione diversa');
            $this->line('3. Controlla le impostazioni di sicurezza account');
            $this->line('4. Prova a disabilitare temporaneamente 2FA');
            $this->line('5. Verifica restrizioni IP nel pannello Aruba');
        }
        
        return Command::SUCCESS;
    }
}
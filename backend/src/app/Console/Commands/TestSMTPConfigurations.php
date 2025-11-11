<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestSMTPConfigurations extends Command
{
    protected $signature = 'email:test-configurations {email=shikosoft.italia@gmail.com}';
    protected $description = 'Test different SMTP configurations for Aruba';

    public function handle()
    {
        $email = $this->argument('email');
        
        $this->info('🔧 Test Configurazioni SMTP Multiple');
        $this->info('===================================');
        $this->info("Destinatario: {$email}");
        $this->newLine();

        $configurations = [
            [
                'name' => 'Aruba SMTPS (SSL 465)',
                'host' => 'smtps.aruba.it',
                'port' => 465,
                'encryption' => 'ssl'
            ],
            [
                'name' => 'Aruba SMTP (SSL 465) - Configurazione Ufficiale', 
                'host' => 'smtp.aruba.it',
                'port' => 465,
                'encryption' => 'ssl'
            ],
            [
                'name' => 'Aruba SMTP (TLS 587)', 
                'host' => 'smtp.aruba.it',
                'port' => 587,
                'encryption' => 'tls'
            ],
            [
                'name' => 'Aruba SMTP (STARTTLS 25)',
                'host' => 'smtp.aruba.it', 
                'port' => 25,
                'encryption' => 'tls'
            ],
            [
                'name' => 'MX QoffeRun (SSL 465)',
                'host' => 'mx.qofferun.com',
                'port' => 465, 
                'encryption' => 'ssl'
            ]
        ];

        foreach ($configurations as $config) {
            $this->info("🧪 Testando: {$config['name']}");
            $this->line("   Host: {$config['host']}:{$config['port']} ({$config['encryption']})");
            
            try {
                // Test basic connectivity first
                $socket = @fsockopen($config['host'], $config['port'], $errno, $errstr, 5);
                
                if (!$socket) {
                    $this->error("   ❌ Connessione fallita: {$errstr} ({$errno})");
                    continue;
                }
                fclose($socket);
                $this->info("   ✅ Connettività TCP OK");
                
                // Test email sending
                config([
                    'mail.mailers.smtp.host' => $config['host'],
                    'mail.mailers.smtp.port' => $config['port'],
                    'mail.mailers.smtp.encryption' => $config['encryption'],
                    'mail.mailers.smtp.username' => 'info@qofferun.com',
                    'mail.mailers.smtp.password' => 'QofeRun2025@',
                ]);

                Mail::raw("Test da {$config['name']} - " . now()->format('H:i:s'), function ($message) use ($email, $config) {
                    $message->to($email)
                            ->from('info@qofferun.com', 'QoffeRun Test')
                            ->subject("Test {$config['name']}");
                });
                
                $this->info("   ✅ EMAIL INVIATA CON SUCCESSO!");
                $this->newLine();
                
                // Se funziona, aggiorna la configurazione nel database
                $this->info("🎉 CONFIGURAZIONE FUNZIONANTE TROVATA!");
                $this->info("Vuoi salvarla nel database? [y/N]");
                
                return Command::SUCCESS;
                
            } catch (\Exception $e) {
                $this->error("   ❌ Errore email: " . substr($e->getMessage(), 0, 80) . '...');
            }
            
            $this->newLine();
        }
        
        $this->error('❌ Nessuna configurazione funzionante trovata');
        $this->newLine();
        $this->info('💡 Possibili soluzioni:');
        $this->line('1. Verifica che SMTP sia abilitato nel pannello Aruba');
        $this->line('2. Controlla se serve autenticazione a due fattori');
        $this->line('3. Verifica che gli account email esistano realmente');
        $this->line('4. Contatta il supporto Aruba per configurazione SMTP');
        
        return Command::FAILURE;
    }
}
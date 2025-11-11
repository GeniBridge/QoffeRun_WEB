<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestLaravelSMTP extends Command
{
    protected $signature = 'email:test-laravel {email=shikosoft.italia@gmail.com}';
    protected $description = 'Test SMTP with Laravel-specific SSL/TLS options';

    public function handle()
    {
        $email = $this->argument('email');
        
        $this->info('🔧 Test Laravel SMTP con opzioni SSL avanzate');
        $this->info('=============================================');
        $this->info("Destinatario: {$email}");
        $this->newLine();

        $configurations = [
            [
                'name' => 'SSL Standard',
                'config' => [
                    'mail.mailers.smtp.host' => 'smtps.aruba.it',
                    'mail.mailers.smtp.port' => 465,
                    'mail.mailers.smtp.encryption' => 'ssl',
                    'mail.mailers.smtp.username' => 'info@qofferun.com',
                    'mail.mailers.smtp.password' => 'QofeRun2025@',
                ]
            ],
            [
                'name' => 'SSL con opzioni stream context',
                'config' => [
                    'mail.mailers.smtp.host' => 'smtps.aruba.it',
                    'mail.mailers.smtp.port' => 465,
                    'mail.mailers.smtp.encryption' => 'ssl',
                    'mail.mailers.smtp.username' => 'info@qofferun.com',
                    'mail.mailers.smtp.password' => 'QofeRun2025@',
                    'mail.mailers.smtp.stream' => [
                        'ssl' => [
                            'verify_peer' => false,
                            'verify_peer_name' => false,
                            'allow_self_signed' => true,
                        ]
                    ]
                ]
            ],
            [
                'name' => 'TLS con STARTTLS',
                'config' => [
                    'mail.mailers.smtp.host' => 'smtps.aruba.it',
                    'mail.mailers.smtp.port' => 587,
                    'mail.mailers.smtp.encryption' => 'tls',
                    'mail.mailers.smtp.username' => 'info@qofferun.com',
                    'mail.mailers.smtp.password' => 'QofeRun2025@',
                ]
            ]
        ];

        foreach ($configurations as $test) {
            $this->info("🧪 Testando: {$test['name']}");
            
            try {
                // Applica configurazione
                config($test['config']);
                
                // Test invio
                Mail::raw("Test Laravel SMTP: {$test['name']} - " . now()->format('H:i:s') . "

Questa email è stata inviata da QoffeRun usando Laravel con la configurazione: {$test['name']}

Host: " . $test['config']['mail.mailers.smtp.host'] . "
Port: " . $test['config']['mail.mailers.smtp.port'] . "
Encryption: " . $test['config']['mail.mailers.smtp.encryption'] . "

Se ricevi questo messaggio, la configurazione funziona!

---
QoffeRun Email System", function ($message) use ($email, $test) {
                    $message->to($email)
                            ->from('info@qofferun.com', 'QoffeRun Test')
                            ->subject("✅ Laravel SMTP Test: {$test['name']}");
                });
                
                $this->info("   ✅ SUCCESS! Email inviata con {$test['name']}");
                $this->newLine();
                
                // Se funziona, salva la configurazione
                $this->info("🎉 CONFIGURAZIONE FUNZIONANTE TROVATA!");
                $this->info("Vuoi salvarla nel database? Premere Ctrl+C per interrompere o continuare...");
                sleep(3);
                
                return Command::SUCCESS;
                
            } catch (\Exception $e) {
                $this->error("   ❌ Errore: " . substr($e->getMessage(), 0, 100) . '...');
                $this->newLine();
            }
        }
        
        $this->error('❌ Nessuna configurazione Laravel funzionante');
        $this->newLine();
        $this->info('💡 Prova queste soluzioni:');
        $this->line('1. Verifica nel pannello Aruba: Impostazioni Email > Accesso SMTP');
        $this->line('2. Controlla se serve una "Password App" diversa per SMTP');
        $this->line('3. Disabilita 2FA temporaneamente per test');
        $this->line('4. Contatta supporto Aruba per configurazione SMTP programmatica');
        
        return Command::FAILURE;
    }
}
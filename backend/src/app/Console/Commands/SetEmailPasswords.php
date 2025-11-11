<?php

namespace App\Console\Commands;

use App\Models\SystemSetting;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Crypt;

class SetEmailPasswords extends Command
{
    protected $signature = 'email:set-passwords {--info= : Password for info@qofferun.com} {--noreply= : Password for noreply@qofferun.com}';
    protected $description = 'Set email account passwords securely';

    public function handle()
    {
        $this->info('🔐 QoffeRun Email Passwords Setup');
        $this->info('==================================');
        $this->newLine();

        // Get passwords from options or prompt
        $infoPassword = $this->option('info') ?: $this->secret('Password per info@qofferun.com');
        $noreplyPassword = $this->option('noreply') ?: $this->secret('Password per noreply@qofferun.com');

        if (empty($infoPassword) || empty($noreplyPassword)) {
            $this->error('❌ Entrambe le password sono richieste!');
            return Command::FAILURE;
        }

        try {
            // Encrypt and save passwords
            SystemSetting::updateOrCreate(
                ['key' => 'info_email_password'],
                [
                    'name' => 'Password Info Email',
                    'value' => Crypt::encryptString($infoPassword), 
                    'is_encrypted' => true,
                    'category' => 'email',
                    'type' => 'string'
                ]
            );

            SystemSetting::updateOrCreate(
                ['key' => 'noreply_email_password'],
                [
                    'name' => 'Password NoReply Email',
                    'value' => Crypt::encryptString($noreplyPassword), 
                    'is_encrypted' => true,
                    'category' => 'email',
                    'type' => 'string'
                ]
            );

            $this->info('✅ Password salvate con successo (criptate)');
            
            // Show current email configuration
            $this->newLine();
            $this->info('📧 Configurazione Email Completa:');
            $this->table(
                ['Account', 'Email', 'Password Status'],
                [
                    ['Info', SystemSetting::where('key', 'info_email')->value('value') ?? 'info@qofferun.com', '✅ Configurata'],
                    ['NoReply', SystemSetting::where('key', 'noreply_email')->value('value') ?? 'noreply@qofferun.com', '✅ Configurata'],
                ]
            );

            $this->newLine();
            $this->info('🧪 Vuoi testare la configurazione? Esegui: php artisan email:test');

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('❌ Errore nel salvare le password: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
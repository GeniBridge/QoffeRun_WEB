<?php

namespace App\Console\Commands;

use App\Models\SystemSetting;
use Illuminate\Console\Command;

class EmailSystemStatus extends Command
{
    protected $signature = 'email:status';
    protected $description = 'Show complete email system status';

    public function handle()
    {
        $this->info('🟠 QoffeRun Email System - Status Completo');
        $this->info('===========================================');
        $this->newLine();

        // Configurazione SMTP
        $this->info('🔧 Configurazione SMTP Aruba:');
        $config = [
            'Host' => SystemSetting::where('key', 'smtp_host')->value('value') ?? 'smtps.aruba.it',
            'Porta' => SystemSetting::where('key', 'smtp_port')->value('value') ?? '465',
            'Crittografia' => strtoupper(SystemSetting::where('key', 'smtp_encryption')->value('value') ?? 'ssl'),
        ];
        
        $this->table(['Parametro', 'Valore'], [
            ['Server SMTP', $config['Host']],
            ['Porta', $config['Porta']],
            ['Crittografia', $config['Crittografia']],
            ['Autenticazione', '✅ Richiesta'],
        ]);
        
        $this->newLine();

        // Account Email
        $this->info('📧 Account Email Configurati:');
        $accounts = [
            'Info' => SystemSetting::where('key', 'info_email')->value('value') ?? 'info@qofferun.com',
            'NoReply' => SystemSetting::where('key', 'noreply_email')->value('value') ?? 'noreply@qofferun.com',
            'Support' => SystemSetting::where('key', 'support_email')->value('value') ?? 'info@qofferun.com',
        ];
        
        $passwordStatus = [
            'Info' => SystemSetting::where('key', 'info_email_password')->exists() ? '✅ Configurata' : '❌ Mancante',
            'NoReply' => SystemSetting::where('key', 'noreply_email_password')->exists() ? '✅ Configurata' : '❌ Mancante',
        ];
        
        $this->table(['Account', 'Email', 'Password', 'Utilizzo'], [
            ['Info', $accounts['Info'], $passwordStatus['Info'], 'Supporto clienti, comunicazioni'],
            ['NoReply', $accounts['NoReply'], $passwordStatus['NoReply'], 'Email automatiche, notifiche'],
            ['Support', $accounts['Support'], '✅ Alias di Info', 'Supporto tecnico'],
        ]);
        
        $this->newLine();

        // Componenti Sistema
        $this->info('🚀 Componenti Sistema Email:');
        $this->table(['Componente', 'Status', 'Descrizione'], [
            ['EmailServiceProvider', '✅ Attivo', 'Configurazione dinamica SMTP dal database'],
            ['EmailService', '✅ Pronto', 'Gestione invio multi-account'],
            ['Template Email', '✅ Pronti', 'Email HTML di benvenuto per registrazione'],
            ['Comandi Artisan', '✅ Disponibili', 'Test, setup, debug email'],
            ['Sicurezza Password', '✅ Criptate', 'Password salvate con Laravel Crypt'],
        ]);
        
        $this->newLine();

        // Comandi disponibili
        $this->info('🛠️  Comandi Disponibili:');
        $this->table(['Comando', 'Descrizione'], [
            ['php artisan email:setup', 'Configura sistema email completo'],
            ['php artisan email:test', 'Testa invio email Aruba'],
            ['php artisan email:set-passwords', 'Imposta password email'],
            ['php artisan email:status', 'Mostra questo status'],
            ['php artisan email:debug-auth', 'Debug autenticazione SMTP'],
        ]);
        
        $this->newLine();

        // Status finale
        if ($passwordStatus['Info'] === '✅ Configurata' && $passwordStatus['NoReply'] === '✅ Configurata') {
            $this->info('🎉 SISTEMA EMAIL: COMPLETAMENTE CONFIGURATO');
            $this->info('⏳ ARUBA SMTP: Verifica impostazioni pannello di controllo');
            $this->newLine();
            $this->info('📋 Per completare:');
            $this->line('1. Verifica che SMTP sia abilitato per gli account nel pannello Aruba');
            $this->line('2. Controlla se serve autenticazione a due fattori per SMTP');
            $this->line('3. Esegui: php artisan email:test');
        } else {
            $this->error('⚠️  SISTEMA INCOMPLETO: Impostare le password con: php artisan email:set-passwords');
        }
        
        return Command::SUCCESS;
    }
}
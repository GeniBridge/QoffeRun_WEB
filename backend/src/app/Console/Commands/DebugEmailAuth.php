<?php

namespace App\Console\Commands;

use App\Models\SystemSetting;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Crypt;

class DebugEmailAuth extends Command
{
    protected $signature = 'email:debug-auth';
    protected $description = 'Debug email authentication';

    public function handle()
    {
        $this->info('🔍 Debug Email Authentication');
        $this->info('============================');
        
        try {
            // Get encrypted passwords
            $infoPass = SystemSetting::where('key', 'info_email_password')->first();
            $noreplyPass = SystemSetting::where('key', 'noreply_email_password')->first();
            
            if (!$infoPass || !$noreplyPass) {
                $this->error('❌ Password non trovate nel database');
                return Command::FAILURE;
            }
            
            // Decrypt passwords
            $infoDecrypted = Crypt::decryptString($infoPass->value);
            $noreplyDecrypted = Crypt::decryptString($noreplyPass->value);
            
            $this->info('🔐 Password decriptate:');
            $this->line("Info password: '{$infoDecrypted}'");
            $this->line("NoReply password: '{$noreplyDecrypted}'");
            
            // Test manual SMTP connection
            $this->info('🔄 Test connessione SMTP manuale...');
            
            $host = SystemSetting::where('key', 'smtp_host')->value('value') ?? 'smtp.aruba.it';
            $port = SystemSetting::where('key', 'smtp_port')->value('value') ?? '587';
            $encryption = SystemSetting::where('key', 'smtp_encryption')->value('value') ?? 'tls';
            
            $this->info("Connessione a: {$host}:{$port} ({$encryption})");
            
            // Test with direct PHP socket connection
            $this->info('🔌 Tentativo connessione diretta...');
            
            $context = stream_context_create([
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                ]
            ]);
            
            $socket = stream_socket_client("tcp://{$host}:{$port}", $errno, $errstr, 30, STREAM_CLIENT_CONNECT, $context);
            
            if (!$socket) {
                $this->error("❌ Connessione fallita: {$errstr} ({$errno})");
                return Command::FAILURE;
            }
            
            $response = fgets($socket);
            $this->info("📡 Risposta server: " . trim($response));
            
            fclose($socket);
            $this->info('✅ Connessione TCP riuscita al server SMTP');
            
        } catch (\Exception $e) {
            $this->error('❌ Errore: ' . $e->getMessage());
            return Command::FAILURE;
        }
        
        return Command::SUCCESS;
    }
}
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class TestSMTPConnection extends Command
{
    protected $signature = 'smtp:test-connection {host=smtp.aruba.it} {port=587}';
    protected $description = 'Test SMTP server connection';

    public function handle()
    {
        $host = $this->argument('host');
        $port = $this->argument('port');
        
        $this->info("🔄 Testing SMTP connection to {$host}:{$port}...");
        
        try {
            // Test basic connection
            $socket = fsockopen($host, $port, $errno, $errstr, 10);
            
            if (!$socket) {
                $this->error("❌ Connection failed: {$errstr} ({$errno})");
                return Command::FAILURE;
            }
            
            $response = fgets($socket);
            $this->info("📡 Server response: " . trim($response));
            
            // Send EHLO
            fwrite($socket, "EHLO qofferun.com\r\n");
            $ehloResponse = '';
            while ($line = fgets($socket)) {
                $ehloResponse .= $line;
                if (substr($line, 3, 1) == ' ') break;
            }
            
            $this->info("📋 EHLO Response:");
            $this->line($ehloResponse);
            
            // Check if STARTTLS is available
            if (strpos($ehloResponse, 'STARTTLS') !== false) {
                $this->info("✅ STARTTLS is supported");
            } else {
                $this->warn("⚠️  STARTTLS not found in EHLO response");
            }
            
            // Send QUIT
            fwrite($socket, "QUIT\r\n");
            fclose($socket);
            
            $this->info("✅ Basic SMTP connection successful!");
            return Command::SUCCESS;
            
        } catch (\Exception $e) {
            $this->error("❌ Error: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}

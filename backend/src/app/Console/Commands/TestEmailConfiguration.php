<?php

namespace App\Console\Commands;

use App\Services\EmailService;
use App\Mail\TestEmail;
use App\Models\SystemSetting as Setting;
use Illuminate\Support\Facades\Mail;
use Illuminate\Console\Command;
use App\Providers\EmailServiceProvider;
use App\Models\SystemSetting;

class TestEmailConfiguration extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:test {--to=info@qofferun.com : Email address to send test to}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the Aruba email configuration for QoffeRun';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $toEmail = $this->option('to');
        
        $this->info('🟠 QoffeRun Email Configuration Test');
        $this->info('=====================================');
        
        $this->line("Testing email configuration with Aruba SMTP...");
        $this->line("Recipient: {$toEmail}");
        $this->newLine();
        
        // Test info email con configurazione diretta
        $this->info('📧 Testing info@qofferun.com...');
        try {
            config([
                'mail.mailers.smtp.host' => 'smtps.aruba.it',
                'mail.mailers.smtp.port' => 465,
                'mail.mailers.smtp.encryption' => 'ssl',
                'mail.mailers.smtp.username' => 'info@qofferun.com',
                'mail.mailers.smtp.password' => 'QofeRun2025@',
            ]);

            Mail::raw('Test da info@qofferun.com - ' . now()->format('H:i:s'), function ($message) use ($toEmail) {
                $message->to($toEmail)
                        ->from('info@qofferun.com', 'QoffeRun')
                        ->subject('Test QoffeRun - Info Account');
            });
            
            $this->info('✅ info@qofferun.com: SUCCESS');
        } catch (\Exception $e) {
            $this->error("❌ info@qofferun.com: ERROR - {$e->getMessage()}");
        }
        
        $this->newLine();
        
        // Test noreply email  
        $this->info('📧 Testing noreply@qofferun.com...');
        try {
            Mail::raw('Test da noreply@qofferun.com - ' . now()->format('H:i:s'), function ($message) use ($toEmail) {
                $message->to($toEmail)
                        ->from('noreply@qofferun.com', 'QoffeRun')
                        ->subject('Test QoffeRun - NoReply Account');
            });
            
            $this->info('✅ noreply@qofferun.com: SUCCESS');
        } catch (\Exception $e) {
            $this->error("❌ noreply@qofferun.com: ERROR - {$e->getMessage()}");
        }
        
        $this->newLine();
        
                // Show current configuration
        $this->info('📋 Current Email Configuration:');
        $this->table(
            ['Setting', 'Value'],
            [
                ['Info Email', EmailService::getInfoEmail()],
                ['NoReply Email', EmailService::getNoReplyEmail()],
                ['Support Email', EmailService::getSupportEmail()],
                ['SMTP Host', Setting::where('key', 'smtp_host')->value('value') ?? 'smtps.aruba.it'],
                ['SMTP Port', Setting::where('key', 'smtp_port')->value('value') ?? '465'],
                ['SMTP Encryption', Setting::where('key', 'smtp_encryption')->value('value') ?? 'ssl'],
            ]
        );
        
        $this->info('✅ Email configuration test completed!');
        return Command::SUCCESS;
    }
}

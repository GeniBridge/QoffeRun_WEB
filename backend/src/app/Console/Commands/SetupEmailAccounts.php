<?php

namespace App\Console\Commands;

use App\Models\SystemSetting;
use Illuminate\Console\Command;

class SetupEmailAccounts extends Command
{
    protected $signature = 'email:setup {--test : Test the configuration after setup}';
    protected $description = 'Setup email accounts configuration for QoffeRun';

    public function handle()
    {
        $this->info('🟠 QoffeRun Email Accounts Setup');
        $this->info('==================================');
        $this->newLine();

        // Aruba SMTP Configuration
        $this->info('📧 Configuring Aruba SMTP settings...');
        
        SystemSetting::updateOrCreate(['key' => 'smtp_host'], ['value' => 'smtps.aruba.it']);
        SystemSetting::updateOrCreate(['key' => 'smtp_port'], ['value' => '465']);
        SystemSetting::updateOrCreate(['key' => 'smtp_encryption'], ['value' => 'ssl']);
        
        $this->info('✅ SMTP configuration updated');
        $this->newLine();

        // Email accounts setup
        $this->info('📧 Email Accounts to create in Aruba Panel:');
        $this->table(
            ['Account', 'Username', 'Password', 'Usage'],
            [
                ['Info', 'info@qofferun.com', 'Runrun78*', 'Customer support, general inquiries'],
                ['NoReply', 'noreply@qofferun.com', 'Runrun78*', 'Automated emails, notifications'],
            ]
        );
        
        $this->newLine();
        $this->info('📋 Steps to complete setup:');
        $this->line('1. Login to Aruba control panel');
        $this->line('2. Go to Email section');
        $this->line('3. Create both email accounts with the specified passwords');
        $this->line('4. Wait 5-10 minutes for propagation');
        $this->line('5. Run: php artisan email:test');
        
        if ($this->option('test')) {
            $this->newLine();
            $this->info('🧪 Testing email configuration...');
            $this->call('email:test');
        }
        
        return Command::SUCCESS;
    }
}
<?php

namespace App\Providers;

use App\Models\SystemSetting;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class EmailServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Configure email settings when mail manager is resolved
        $this->app->resolving('mail.manager', function () {
            try {
                $this->configureEmailSettings();
            } catch (\Exception $e) {
                Log::warning('Could not load email settings from database: ' . $e->getMessage());
            }
        });
    }

    /**
     * Configura le impostazioni email dinamicamente dal database
     */
    private function configureEmailSettings(): void
    {
        // Verifica che la tabella system_settings esista
        if (!\Schema::hasTable('system_settings')) {
            return;
        }

        // Ottieni le configurazioni email dal database
        $emailSettings = SystemSetting::where('category', 'emails')->get()->keyBy('key');

        if ($emailSettings->isEmpty()) {
            return;
        }

        // Configura SMTP dinamicamente
        if ($emailSettings->has('smtp_host')) {
            Config::set([
                'mail.default' => 'smtp',
                'mail.mailers.smtp.transport' => 'smtp',
                'mail.mailers.smtp.host' => $emailSettings->get('smtp_host')->value ?? 'smtps.aruba.it',
                'mail.mailers.smtp.port' => (int) ($emailSettings->get('smtp_port')->value ?? 465),
                'mail.mailers.smtp.encryption' => $emailSettings->get('smtp_encryption')->value ?? 'ssl',
                'mail.mailers.smtp.username' => $emailSettings->get('info_email')->value ?? 'info@qofferun.com',
                'mail.mailers.smtp.password' => $emailSettings->get('info_password')->value ?? null,
                'mail.mailers.smtp.timeout' => null,
                'mail.mailers.smtp.local_domain' => env('MAIL_EHLO_DOMAIN'),
            ]);
        }

        // Configura gli indirizzi di default
        if ($emailSettings->has('info_email')) {
            Config::set([
                'mail.from.address' => $emailSettings->get('info_email')->value,
                'mail.from.name' => $emailSettings->get('from_name')->value ?? 'QoffeRun',
            ]);
        }
    }

    /**
     * Ottieni la configurazione SMTP per un email specifico
     */
    public static function getMailerConfig(string $email = null): array
    {
        $emailSettings = SystemSetting::where('category', 'emails')->get()->keyBy('key');
        
        if ($email === 'noreply@qofferun.com' && $emailSettings->has('noreply_email')) {
            return [
                'transport' => 'smtp',
                'host' => $emailSettings->get('smtp_host')->value ?? 'smtps.aruba.it',
                'port' => (int) ($emailSettings->get('smtp_port')->value ?? 465),
                'encryption' => $emailSettings->get('smtp_encryption')->value ?? 'ssl',
                'username' => $emailSettings->get('noreply_email')->value,
                'password' => $emailSettings->get('noreply_password')->value,
                'timeout' => null,
                'local_domain' => env('MAIL_EHLO_DOMAIN'),
            ];
        }

        // Default to info email
        return [
            'transport' => 'smtp',
            'host' => $emailSettings->get('smtp_host')->value ?? 'smtps.aruba.it',
            'port' => (int) ($emailSettings->get('smtp_port')->value ?? 465),
            'encryption' => $emailSettings->get('smtp_encryption')->value ?? 'ssl',
            'username' => $emailSettings->get('info_email')->value ?? 'info@qofferun.com',
            'password' => $emailSettings->get('info_password')->value,
            'timeout' => null,
            'local_domain' => env('MAIL_EHLO_DOMAIN'),
        ];
    }
}
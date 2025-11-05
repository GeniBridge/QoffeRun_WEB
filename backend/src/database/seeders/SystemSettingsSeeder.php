<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SystemSetting;

class SystemSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // Google Maps Configuration
            [
                'key' => 'google_maps_api_key',
                'value' => '',
                'type' => 'string',
                'category' => 'google_maps',
                'name' => 'Google Maps API Key',
                'description' => 'Chiave API per Google Maps e Places API',
                'is_encrypted' => true,
                'is_public' => true
            ],
            [
                'key' => 'google_maps_region',
                'value' => 'IT',
                'type' => 'string',
                'category' => 'google_maps',
                'name' => 'Google Maps Region',
                'description' => 'Regione predefinita per Google Maps (IT = Italia)',
                'is_encrypted' => false,
                'is_public' => true
            ],

            // Email Configuration
            [
                'key' => 'support_email',
                'value' => 'support@qofferun.com',
                'type' => 'string',
                'category' => 'emails',
                'name' => 'Email di Supporto',
                'description' => 'Email per richieste di supporto clienti',
                'is_encrypted' => false,
                'is_public' => true
            ],
            [
                'key' => 'noreply_email',
                'value' => 'noreply@qofferun.com',
                'type' => 'string',
                'category' => 'emails',
                'name' => 'Email No-Reply',
                'description' => 'Email per notifiche automatiche',
                'is_encrypted' => false,
                'is_public' => false
            ],
            [
                'key' => 'info_email',
                'value' => 'info@qofferun.com',
                'type' => 'string',
                'category' => 'emails',
                'name' => 'Email Informazioni',
                'description' => 'Email per informazioni generali',
                'is_encrypted' => false,
                'is_public' => true
            ],
            [
                'key' => 'admin_email',
                'value' => 'admin@qofferun.com',
                'type' => 'string',
                'category' => 'emails',
                'name' => 'Email Amministratore',
                'description' => 'Email amministratore sistema',
                'is_encrypted' => false,
                'is_public' => false
            ],

            // Stripe System Configuration
            [
                'key' => 'stripe_public_key',
                'value' => '',
                'type' => 'string',
                'category' => 'stripe_system',
                'name' => 'Stripe Public Key',
                'description' => 'Chiave pubblica Stripe per il sistema',
                'is_encrypted' => false,
                'is_public' => true
            ],
            [
                'key' => 'stripe_secret_key',
                'value' => '',
                'type' => 'string',
                'category' => 'stripe_system',
                'name' => 'Stripe Secret Key',
                'description' => 'Chiave segreta Stripe per il sistema',
                'is_encrypted' => true,
                'is_public' => false
            ],
            [
                'key' => 'stripe_webhook_secret',
                'value' => '',
                'type' => 'string',
                'category' => 'stripe_system',
                'name' => 'Stripe Webhook Secret',
                'description' => 'Segreto per webhook Stripe',
                'is_encrypted' => true,
                'is_public' => false
            ],
            [
                'key' => 'stripe_connect_client_id',
                'value' => '',
                'type' => 'string',
                'category' => 'stripe_system',
                'name' => 'Stripe Connect Client ID',
                'description' => 'Client ID per Stripe Connect',
                'is_encrypted' => false,
                'is_public' => true
            ],

            // Social Login Configuration
            [
                'key' => 'facebook_app_id',
                'value' => '',
                'type' => 'string',
                'category' => 'social',
                'name' => 'Facebook App ID',
                'description' => 'ID applicazione Facebook per login social',
                'is_encrypted' => false,
                'is_public' => true
            ],
            [
                'key' => 'facebook_app_secret',
                'value' => '',
                'type' => 'string',
                'category' => 'social',
                'name' => 'Facebook App Secret',
                'description' => 'Segreto applicazione Facebook',
                'is_encrypted' => true,
                'is_public' => false
            ],
            [
                'key' => 'google_client_id',
                'value' => '',
                'type' => 'string',
                'category' => 'social',
                'name' => 'Google Client ID',
                'description' => 'Client ID Google per login social',
                'is_encrypted' => false,
                'is_public' => true
            ],
            [
                'key' => 'google_client_secret',
                'value' => '',
                'type' => 'string',
                'category' => 'social',
                'name' => 'Google Client Secret',
                'description' => 'Segreto client Google',
                'is_encrypted' => true,
                'is_public' => false
            ],

            // Notification App Configuration
            [
                'key' => 'firebase_server_key',
                'value' => '',
                'type' => 'string',
                'category' => 'notifications',
                'name' => 'Firebase Server Key',
                'description' => 'Chiave server Firebase per notifiche push',
                'is_encrypted' => true,
                'is_public' => false
            ],
            [
                'key' => 'firebase_project_id',
                'value' => '',
                'type' => 'string',
                'category' => 'notifications',
                'name' => 'Firebase Project ID',
                'description' => 'ID progetto Firebase',
                'is_encrypted' => false,
                'is_public' => true
            ],
            [
                'key' => 'apns_certificate_path',
                'value' => '',
                'type' => 'string',
                'category' => 'notifications',
                'name' => 'APNS Certificate Path',
                'description' => 'Percorso certificato Apple Push Notifications',
                'is_encrypted' => false,
                'is_public' => false
            ],
            [
                'key' => 'apns_certificate_password',
                'value' => '',
                'type' => 'string',
                'category' => 'notifications',
                'name' => 'APNS Certificate Password',
                'description' => 'Password certificato APNS',
                'is_encrypted' => true,
                'is_public' => false
            ],

            // Commission Configuration
            [
                'key' => 'default_commission_rate',
                'value' => '0.05',
                'type' => 'number',
                'category' => 'commissions',
                'name' => 'Commissione Predefinita (%)',
                'description' => 'Percentuale di commissione predefinita applicata a tutti gli ordini (0.05 = 5%)',
                'is_encrypted' => false,
                'is_public' => false
            ],
            [
                'key' => 'min_commission_amount',
                'value' => '0.50',
                'type' => 'number',
                'category' => 'commissions',
                'name' => 'Commissione Minima (€)',
                'description' => 'Importo minimo di commissione per ordine in euro',
                'is_encrypted' => false,
                'is_public' => false
            ],
            [
                'key' => 'max_commission_amount',
                'value' => '10.00',
                'type' => 'number',
                'category' => 'commissions',
                'name' => 'Commissione Massima (€)',
                'description' => 'Importo massimo di commissione per ordine in euro',
                'is_encrypted' => false,
                'is_public' => false
            ],
            [
                'key' => 'commission_calculation_method',
                'value' => 'percentage',
                'type' => 'string',
                'category' => 'commissions',
                'name' => 'Metodo Calcolo Commissione',
                'description' => 'Metodo di calcolo commissione: percentage, fixed, tiered',
                'is_encrypted' => false,
                'is_public' => false
            ],

            // App Configuration
            [
                'key' => 'app_version',
                'value' => '1.0.0',
                'type' => 'string',
                'category' => 'app',
                'name' => 'Versione App',
                'description' => 'Versione corrente dell\'applicazione',
                'is_encrypted' => false,
                'is_public' => true
            ],
            [
                'key' => 'maintenance_mode',
                'value' => false,
                'type' => 'boolean',
                'category' => 'app',
                'name' => 'Modalità Manutenzione',
                'description' => 'Abilita/disabilita modalità manutenzione',
                'is_encrypted' => false,
                'is_public' => true
            ],
            [
                'key' => 'max_upload_size',
                'value' => '10485760',
                'type' => 'number',
                'category' => 'app',
                'name' => 'Dimensione Max Upload (bytes)',
                'description' => 'Dimensione massima file upload in bytes (10MB = 10485760)',
                'is_encrypted' => false,
                'is_public' => true
            ]
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
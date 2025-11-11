<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Chain;

class TestChainOwnerSeeder extends Seeder
{
    public function run()
    {
        // Creiamo un chain owner di test
        $chainOwner = User::firstOrCreate(
            ['email' => 'chainowner@test.com'],
            [
                'name' => 'Test Chain Owner',
                'password' => bcrypt('password123'),
                'role' => 'chain_owner',
                'email_verified_at' => now()
            ]
        );

        // Creiamo alcune catene di test
        Chain::firstOrCreate(
            ['owner_id' => $chainOwner->id, 'name' => 'Catena Caffè Milano'],
            [
                'business_name' => 'Caffè Milano S.r.l.',
                'vat_number' => '12345678901',
                'phone' => '+39 02 1234567',
                'email' => 'info@caffemilano.it',
                'payment_mode' => 'unified',
                'commission_rate' => 3.5
            ]
        );

        Chain::firstOrCreate(
            ['owner_id' => $chainOwner->id, 'name' => 'Bar Centrale'],
            [
                'business_name' => 'Bar Centrale di Rossi Mario',
                'tax_code' => 'RSSMRA80A01F205X',
                'phone' => '+39 06 9876543',
                'email' => 'centrale@bar.it',
                'payment_mode' => 'separate',
                'commission_rate' => 4.0
            ]
        );

        echo "Chain Owner e catene di test create con successo!\n";
        echo "Email: chainowner@test.com\n";
        echo "Password: password123\n";
    }
}
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\Branch;
use App\Models\User;
use Carbon\Carbon;

class TestOrdersSeeder extends Seeder
{
    public function run()
    {
        echo "Creating test orders...\n";
        
        // Get a test branch (first available)
        $branch = Branch::first();
        if (!$branch) {
            echo "No branch found. Please run BarPanelTestSeeder first.\n";
            return;
        }

        // Get some menu items
        $menuItems = MenuItem::where('menu_id', $branch->menu_id ?? 1)->take(5)->get();
        if ($menuItems->isEmpty()) {
            echo "No menu items found for branch {$branch->id}.\n";
            return;
        }

        $customers = [
            ['name' => 'Marco Rossi', 'email' => 'marco.rossi@email.com', 'phone' => '+393331234567'],
            ['name' => 'Laura Bianchi', 'email' => 'laura.bianchi@email.com', 'phone' => '+393339876543'],
            ['name' => 'Giuseppe Verde', 'email' => 'giuseppe.verde@email.com', 'phone' => '+393335551234'],
            ['name' => 'Sofia Neri', 'email' => 'sofia.neri@email.com', 'phone' => '+393337778899'],
            ['name' => 'Alessandro Gialli', 'email' => 'alex.gialli@email.com', 'phone' => '+393334445566']
        ];

        // Create orders with different statuses
        $statuses = ['pending', 'confirmed', 'ready', 'completed', 'cancelled'];
        $orderNumber = 2000 + rand(1, 999);

        foreach ($statuses as $index => $status) {
            $customer = $customers[$index];
            
            // Calculate times based on status
            $createdAt = Carbon::now()->subMinutes(rand(5, 120));
            $preparedAt = in_array($status, ['ready', 'completed']) ? $createdAt->copy()->addMinutes(rand(10, 30)) : null;
            $deliveredAt = $status === 'completed' ? $preparedAt?->copy()->addMinutes(rand(5, 15)) : null;

            $order = Order::create([
                'branch_id' => $branch->id,
                'chain_id' => $branch->chain_id,
                'customer_name' => $customer['name'],
                'customer_email' => $customer['email'],
                'customer_phone' => $customer['phone'],
                'order_number' => $orderNumber++,
                'code_4digit' => str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT),
                'status' => $status,
                'payment_status' => 'paid',
                'order_type' => 'table_service',
                'subtotal_amount' => 0, // Will be calculated
                'tax_amount' => 0,
                'total_amount' => 0,
                'total' => 0,
                'currency' => 'EUR',
                'notes' => $status === 'pending' ? 'Nuovo ordine da confermare' : null,
                'stripe_payment_intent_id' => 'pi_test_' . uniqid(),
                'commission_rate' => 5.00,
                'commission_status' => $status === 'completed' ? 'transferred' : 'pending',
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
                'prepared_at' => $preparedAt,
                'delivered_at' => $deliveredAt
            ]);

            // Add 1-3 random menu items to each order
            $itemCount = rand(1, 3);
            $subtotal = 0;

            for ($i = 0; $i < $itemCount; $i++) {
                $menuItem = $menuItems->random();
                $quantity = rand(1, 2);
                $price = $menuItem->price;
                $itemTotal = $price * $quantity;
                $subtotal += $itemTotal;

                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $quantity,
                    'price_at_time' => $price
                ]);
            }

            // Update order totals
            $taxAmount = $subtotal * 0.10; // 10% tax
            $totalAmount = $subtotal + $taxAmount;

            $order->update([
                'subtotal_amount' => $subtotal,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'total' => $totalAmount,
                'branch_amount' => $totalAmount - ($totalAmount * $order->commission_rate / 100),
                'commission_amount' => $totalAmount * $order->commission_rate / 100
            ]);

            echo "Created {$status} order #{$order->order_number} for {$customer['name']} - Total: €{$totalAmount}\n";
        }

        // Create additional pending orders for testing
        for ($i = 0; $i < 3; $i++) {
            $customer = $customers[array_rand($customers)];
            $createdAt = Carbon::now()->subMinutes(rand(1, 30));
            
            $order = Order::create([
                'branch_id' => $branch->id,
                'chain_id' => $branch->chain_id,
                'customer_name' => $customer['name'] . " (#{$i})",
                'customer_email' => str_replace('@', "+{$i}@", $customer['email']),
                'customer_phone' => $customer['phone'],
                'order_number' => $orderNumber++,
                'code_4digit' => str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT),
                'status' => 'pending',
                'payment_status' => 'paid',
                'order_type' => rand(0, 1) ? 'table_service' : 'takeaway',
                'subtotal_amount' => 0,
                'tax_amount' => 0,
                'total_amount' => 0,
                'total' => 0,
                'currency' => 'EUR',
                'notes' => 'Ordine di test #' . ($i + 1),
                'stripe_payment_intent_id' => 'pi_test_' . uniqid(),
                'commission_rate' => 5.00,
                'commission_status' => 'pending',
                'created_at' => $createdAt,
                'updated_at' => $createdAt
            ]);

            // Add random items
            $itemCount = rand(1, 4);
            $subtotal = 0;

            for ($j = 0; $j < $itemCount; $j++) {
                $menuItem = $menuItems->random();
                $quantity = rand(1, 3);
                $price = $menuItem->price;
                $itemTotal = $price * $quantity;
                $subtotal += $itemTotal;

                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $quantity,
                    'price_at_time' => $price
                ]);
            }

            // Update totals
            $taxAmount = $subtotal * 0.10;
            $totalAmount = $subtotal + $taxAmount;

            $order->update([
                'subtotal_amount' => $subtotal,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'total' => $totalAmount,
                'branch_amount' => $totalAmount - ($totalAmount * $order->commission_rate / 100),
                'commission_amount' => $totalAmount * $order->commission_rate / 100
            ]);

            echo "Created additional pending order #{$order->order_number} - Total: €{$totalAmount}\n";
        }

        echo "Test orders created successfully!\n";
    }
}
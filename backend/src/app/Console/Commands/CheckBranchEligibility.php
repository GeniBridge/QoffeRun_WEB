<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Branch;

class CheckBranchEligibility extends Command
{
    protected $signature = 'branch:eligibility {id}';
    protected $description = 'Check eligibility status for a branch to be published';

    public function handle(): int
    {
        $id = (int) $this->argument('id');

        $branch = Branch::with(['chain', 'menus.items'])->find($id);
        if (!$branch) {
            $this->error("Branch {$id} not found");
            return self::FAILURE;
        }

        $ordersToday = $branch->orders()->whereDate('created_at', today())->count();
        $averageRating = $branch->reviews()->avg('rating');
        $monthlyRevenue = $branch->orders()->whereMonth('created_at', now()->month)->sum('total');

        $hasMinimumMenuItems = $branch->menus()
            ->where('is_active', true)
            ->withCount(['availableItems as available_items_count'])
            ->get()
            ->sum('available_items_count') >= 5;

        $chain = $branch->chain;
        $chainHasLogoAndCover = !empty($chain?->logo_path) && !empty($chain?->cover_image_path);
        $stripeConnected = !empty($branch->stripe_connect_account_id) && $branch->stripe_connect_status === 'active';
        $addressComplete = !empty($branch->address) && !empty($branch->lat) && !empty($branch->lng);

        $eligibleToPublish = [
            'has_minimum_menu_items' => $hasMinimumMenuItems,
            'chain_has_logo_and_cover' => $chainHasLogoAndCover,
            'stripe_connected' => $stripeConnected,
            'address_complete' => $addressComplete,
        ];

        $payload = [
            'success' => true,
            'branch_id' => $branch->id,
            'branch_name' => $branch->name,
            'data' => [
                'ordini_oggi' => $ordersToday,
                'rating_medio' => $averageRating,
                'fatturato_mese' => $monthlyRevenue,
                'eligible_to_publish' => $eligibleToPublish,
            ],
        ];

        $this->line(json_encode($payload, JSON_PRETTY_PRINT));
        return self::SUCCESS;
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bar;
use App\Models\Order;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function listBars()
    {
        $bars = Bar::with('user:id,name,email', 'orders')
            ->withCount('orders')
            ->withSum('orders', 'total')
            ->paginate(10);

        return response()->json($bars);
    }

    public function updateBarStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:active,paused']);

        $bar = Bar::findOrFail($id);
        $bar->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Bar status updated.',
            'bar' => $bar
        ]);
    }

    public function revenue()
    {
        $totalRevenue = Order::sum('total');
        $commission = $totalRevenue * 0.10;

        return response()->json([
            'total_revenue' => round($totalRevenue, 2),
            'commission_earned' => round($commission, 2),
            'total_bars' => Bar::count(),
            'total_customers' => \App\Models\User::where('role', 'customer')->count(),
        ]);
    }
}
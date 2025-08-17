<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bar;
use App\Models\Order;
use Illuminate\Http\Request;

class BaristaController extends Controller
{
    public function registerBar(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric'
        ]);

        if ($request->user()->bar) {
            return response()->json(['error' => 'You already manage a bar.'], 400);
        }

        do {
            $qr = 'QR' . strtoupper(substr(md5(uniqid()), 0, 6));
        } while (Bar::where('qr_code', $qr)->exists());

        $bar = Bar::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'address' => $request->address,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'qr_code' => $qr,
            'status' => 'active'
        ]);

        return response()->json([
            'message' => 'Bar registered successfully!',
            'bar' => $bar
        ], 201);
    }

    public function dashboard(Request $request)
    {
        $bar = $request->user()->bar;
        if (!$bar) {
            return response()->json(['error' => 'Bar not found.'], 404);
        }

        return response()->json([
            'bar' => $bar,
            'today_orders' => $bar->orders()->whereDate('created_at', today())->count(),
            'revenue_today' => $bar->orders()->whereDate('created_at', today())->sum('total'),
            'pending_orders' => $bar->orders()->whereIn('status', ['pending', 'confirmed'])->count(),
        ]);
    }

    public function pendingOrders(Request $request)
    {
        $bar = $request->user()->bar;
        $orders = $bar->orders()
            ->whereIn('status', ['pending', 'confirmed'])
            ->with('user:id,name', 'items.menuItem')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    public function confirmOrder(Request $request, $id)
    {
        $bar = $request->user()->bar;
        $order = $bar->orders()->findOrFail($id);

        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return response()->json(['error' => 'Order cannot be confirmed.'], 400);
        }

        $order->update(['status' => 'ready']);

        return response()->json([
            'message' => 'Order is ready for pickup',
            'code' => $order->code_4digit
        ]);
    }
}
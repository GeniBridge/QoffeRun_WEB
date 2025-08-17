<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bar;
use App\Models\Order;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function bars()
    {
        $bars = Bar::where('status', 'active')
            ->with('menu.items')
            ->get()
            ->map(function ($bar) {
                return [
                    'id' => $bar->id,
                    'name' => $bar->name,
                    'address' => $bar->address,
                    'latitude' => $bar->latitude,
                    'longitude' => $bar->longitude,
                    'qr_code' => $bar->qr_code,
                    'logo_url' => $bar->logo_url,
                    'cover_image_url' => $bar->cover_image_url,
                    'menu' => $bar->menu->map(function ($menu) {
                        return [
                            'name' => $menu->name,
                            'items' => $menu->items->map(function ($item) {
                                return [
                                    'id' => $item->id,
                                    'name' => $item->name,
                                    'price' => $item->price,
                                    'category' => $item->category,
                                    'is_available' => $item->is_available,
                                    'image_url' => $item->image_url,
                                ];
                            })
                        ];
                    })
                ];
            });

        return response()->json($bars);
    }

    public function myOrders(Request $request)
    {
        $orders = $request->user()->orders()
            ->with('bar:id,name,address', 'items.menuItem')
            ->latest()
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'bar_name' => $order->bar->name,
                    'total' => $order->total,
                    'status' => $order->status,
                    'code_4digit' => $order->code_4digit,
                    'created_at' => $order->created_at,
                    'items' => $order->items->map(function ($item) {
                        return [
                            'name' => $item->menuItem->name,
                            'quantity' => $item->quantity,
                            'price' => $item->price_at_time,
                        ];
                    })
                ];
            });

        return response()->json($orders);
    }
}
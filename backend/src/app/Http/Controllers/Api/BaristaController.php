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
        // --- Compatibility shim: accept nested payloads and map to flat fields ---
        // If the client sends address.* and hours.* we merge them into flat inputs.
        if ($request->has('address.street')) {
            $request->merge([
                'address_street'      => data_get($request, 'address.street'),
                'address_number'      => data_get($request, 'address.number'),
                'address_city'        => data_get($request, 'address.city'),
                'address_province'    => data_get($request, 'address.province'),
                'address_region'      => data_get($request, 'address.region'),
                'address_postal_code' => data_get($request, 'address.postalCode'),
            ]);
        }
        if ($request->has('hours.weekdays.open')) {
            $request->merge([
                'weekdays_open'  => data_get($request, 'hours.weekdays.open'),
                'weekdays_close' => data_get($request, 'hours.weekdays.close'),
                'weekend_open'   => data_get($request, 'hours.weekend.open'),
                'weekend_close'  => data_get($request, 'hours.weekend.close'),
            ]);
        }

        // --- Validation for flat fields (works for both, after merge above) ---
        $request->validate([
            'name' => 'required|string|max:255',

            // Address (flat, required)
            'address_street'      => 'required|string|max:255',
            'address_number'      => 'required|string|max:20',
            'address_city'        => 'required|string|max:120',
            'address_province'    => 'required|string|max:10',
            'address_region'      => 'required|string|max:120',
            'address_postal_code' => 'required|string|max:20',

            // Geo
            'latitude'  => 'required|numeric',
            'longitude' => 'required|numeric',

            // Details
            'description' => 'nullable|string',

            // Hours (flat time strings "HH:MM")
            'weekdays_open'  => 'required|date_format:H:i',
            'weekdays_close' => 'required|date_format:H:i',
            'weekend_open'   => 'required|date_format:H:i',
            'weekend_close'  => 'required|date_format:H:i',

            // Files (multipart/form-data)
            'photo' => 'nullable|image|max:2048',
            'logo'  => 'nullable|image|max:2048',
        ]);

        if ($request->user()->bar) {
            return response()->json(['error' => 'You already manage a bar.'], 400);
        }

        // Generate unique QR code
        do {
            $qr = 'QR' . strtoupper(substr(md5(uniqid()), 0, 6));
        } while (Bar::where('qr_code', $qr)->exists());

        // Uploads
        $photoPath = $request->hasFile('photo')
            ? $request->file('photo')->store('bars/photos', 'public')
            : null;

        $logoPath = $request->hasFile('logo')
            ? $request->file('logo')->store('bars/logos', 'public')
            : null;

        // Optional: keep legacy "address" text for backward compatibility
        $fullAddress = sprintf(
            '%s %s, %s (%s), %s, %s',
            $request->address_street,
            $request->address_number,
            $request->address_city,
            $request->address_province,
            $request->address_region,
            $request->address_postal_code
        );

        $bar = Bar::create([
            'user_id' => $request->user()->id,
            'name'    => $request->name,

            // Flat address columns
            'address_street'      => $request->address_street,
            'address_number'      => $request->address_number,
            'address_city'        => $request->address_city,
            'address_province'    => $request->address_province,
            'address_region'      => $request->address_region,
            'address_postal_code' => $request->address_postal_code,

            // Legacy combined address (exists in your table)
            'address'  => $fullAddress,

            // Geo
            'latitude'  => $request->latitude,
            'longitude' => $request->longitude,

            // Details
            'description'   => $request->description,
            'weekdays_open' => $request->weekdays_open,
            'weekdays_close'=> $request->weekdays_close,
            'weekend_open'  => $request->weekend_open,
            'weekend_close' => $request->weekend_close,

            // Media
            'photo' => $photoPath,
            'logo'  => $logoPath,

            // System
            'qr_code' => $qr,
            'status'  => 'active',
        ]);

        return response()->json([
            'message' => 'Bar registered successfully!',
            'bar'     => $bar
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
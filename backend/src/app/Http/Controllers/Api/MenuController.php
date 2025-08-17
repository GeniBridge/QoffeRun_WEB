<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\MenuItem;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        $bar = $request->user()->bar;
        $menu = $bar->menu()->with('items')->first();
        return response()->json($menu);
    }

    public function addItem(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category' => 'nullable|string',
            'is_available' => 'boolean',
            'image' => 'nullable|string'
        ]);

        $bar = $request->user()->bar;
        $menu = $bar->menu()->firstOrCreate(['name' => 'Main Menu']);

        $item = MenuItem::create([
            'menu_id' => $menu->id,
            'name' => $request->name,
            'price' => $request->price,
            'category' => $request->category,
            'is_available' => $request->is_available ?? true,
            'image' => $request->image,
        ]);

        return response()->json(['message' => 'Item added', 'item' => $item], 201);
    }
}
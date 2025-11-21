<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    /**
     * Get all favorites for authenticated user
     */
    public function index(): JsonResponse
    {
        $favorites = Favorite::with(['branch.chain'])
            ->where('user_id', Auth::id())
            ->get()
            ->map(function ($favorite) {
                return [
                    'id' => $favorite->id,
                    'branch' => [
                        'id' => $favorite->branch->id,
                        'name' => $favorite->branch->name,
                        'address' => $favorite->branch->address,
                        'city' => $favorite->branch->city,
                        'status' => $favorite->branch->status,
                        'chain_name' => $favorite->branch->chain->name ?? null,
                    ],
                    'added_at' => $favorite->created_at->toIso8601String(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $favorites
        ]);
    }

    /**
     * Add a branch to favorites
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'branch_id' => 'required|exists:branches,id'
        ]);

        // Check if branch exists and is active
        $branch = Branch::find($request->branch_id);
        if (!$branch || $branch->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Branch not found or not available'
            ], 404);
        }

        // Check if already favorited
        $existing = Favorite::where('user_id', Auth::id())
            ->where('branch_id', $request->branch_id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Branch already in favorites'
            ], 409);
        }

        $favorite = Favorite::create([
            'user_id' => Auth::id(),
            'branch_id' => $request->branch_id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Branch added to favorites',
            'data' => [
                'id' => $favorite->id,
                'branch_id' => $favorite->branch_id,
                'added_at' => $favorite->created_at->toIso8601String()
            ]
        ], 201);
    }

    /**
     * Remove a branch from favorites
     */
    public function destroy(int $branchId): JsonResponse
    {
        $favorite = Favorite::where('user_id', Auth::id())
            ->where('branch_id', $branchId)
            ->first();

        if (!$favorite) {
            return response()->json([
                'success' => false,
                'message' => 'Favorite not found'
            ], 404);
        }

        $favorite->delete();

        return response()->json([
            'success' => true,
            'message' => 'Branch removed from favorites'
        ]);
    }

    /**
     * Check if a branch is favorited
     */
    public function check(int $branchId): JsonResponse
    {
        $isFavorite = Favorite::where('user_id', Auth::id())
            ->where('branch_id', $branchId)
            ->exists();

        return response()->json([
            'success' => true,
            'data' => [
                'is_favorite' => $isFavorite
            ]
        ]);
    }
}

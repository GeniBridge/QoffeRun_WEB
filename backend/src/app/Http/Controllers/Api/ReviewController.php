<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\Branch;
use App\Models\Order;
use App\Models\Review;

class ReviewController extends Controller
{
    /**
     * Create or update a review for a branch.
     * Only users who completed at least one order at the branch can rate.
     * POST /api/v1/branches/{branchId}/reviews
     */
    public function store(Request $request, int $branchId): JsonResponse
    {
        $user = Auth::user();
        $branch = Branch::find($branchId);
        if (!$branch) {
            return response()->json(['success' => false, 'message' => 'Filiale non trovata'], 404);
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dati non validi',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check user eligibility: must have at least one completed order at this branch
        $hasCompletedOrder = Order::where('user_id', $user->id)
            ->where('branch_id', $branchId)
            ->where('status', Order::STATUS_COMPLETED)
            ->exists();

        if (!$hasCompletedOrder) {
            return response()->json([
                'success' => false,
                'message' => 'Solo i clienti con almeno un ordine completato possono lasciare una recensione'
            ], 403);
        }

        // One review per user per branch; update if already exists
        $review = Review::updateOrCreate(
            [
                'branch_id' => $branchId,
                'user_id' => $user->id,
            ],
            [
                'rating' => $request->integer('rating'),
                'comment' => $request->get('comment'),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Recensione salvata',
            'data' => $review
        ], 201);
    }
}

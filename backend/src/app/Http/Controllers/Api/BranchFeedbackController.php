<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BranchFeedback;
use App\Models\Branch;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BranchFeedbackController extends Controller
{
    /**
     * Get all feedback for a branch (public)
     */
    public function index(int $branchId): JsonResponse
    {
        $feedback = BranchFeedback::with('user:id,first_name,last_name')
            ->where('branch_id', $branchId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $avgRating = BranchFeedback::where('branch_id', $branchId)->avg('rating');
        $totalCount = BranchFeedback::where('branch_id', $branchId)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'feedback' => $feedback->items(),
                'pagination' => [
                    'current_page' => $feedback->currentPage(),
                    'last_page' => $feedback->lastPage(),
                    'per_page' => $feedback->perPage(),
                    'total' => $feedback->total(),
                ],
                'statistics' => [
                    'average_rating' => round($avgRating, 2),
                    'total_feedback' => $totalCount
                ]
            ]
        ]);
    }

    /**
     * Submit feedback for a branch
     */
    public function store(Request $request, int $branchId): JsonResponse
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000'
        ]);

        // Verify branch exists
        $branch = Branch::find($branchId);
        if (!$branch) {
            return response()->json([
                'success' => false,
                'message' => 'Branch not found'
            ], 404);
        }

        // Verify order belongs to user and is completed
        $order = Order::where('id', $request->order_id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found or does not belong to you'
            ], 404);
        }

        if ($order->status !== 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Can only submit feedback for completed orders',
                'eligible' => false
            ], 422);
        }

        // Check if feedback already exists for this order
        $existing = BranchFeedback::where('user_id', Auth::id())
            ->where('order_id', $request->order_id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Feedback already submitted for this order'
            ], 409);
        }

        $feedback = BranchFeedback::create([
            'user_id' => Auth::id(),
            'branch_id' => $branchId,
            'order_id' => $request->order_id,
            'rating' => $request->rating,
            'comment' => $request->comment
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Feedback submitted successfully',
            'data' => [
                'id' => $feedback->id,
                'rating' => $feedback->rating,
                'comment' => $feedback->comment,
                'created_at' => $feedback->created_at->toIso8601String()
            ]
        ], 201);
    }

    /**
     * Check feedback eligibility for an order
     */
    public function checkEligibility(int $orderId): JsonResponse
    {
        $order = Order::where('id', $orderId)
            ->where('user_id', Auth::id())
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        $alreadySubmitted = BranchFeedback::where('user_id', Auth::id())
            ->where('order_id', $orderId)
            ->exists();

        $isEligible = $order->status === 'completed' && !$alreadySubmitted;

        return response()->json([
            'success' => true,
            'data' => [
                'eligible' => $isEligible,
                'reason' => !$isEligible 
                    ? ($order->status !== 'completed' ? 'Order not completed' : 'Feedback already submitted')
                    : null,
                'order_status' => $order->status,
                'feedback_submitted' => $alreadySubmitted
            ]
        ]);
    }

    /**
     * Get user's feedback history
     */
    public function myFeedback(): JsonResponse
    {
        $feedback = BranchFeedback::with(['branch', 'order'])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $feedback
        ]);
    }
}

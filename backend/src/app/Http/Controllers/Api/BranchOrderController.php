<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Branch;
use App\Services\StripePaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class BranchOrderController extends Controller
{
    /**
     * Get all orders for a specific branch
     */
    public function index(Request $request, int $branchId): JsonResponse
    {
        try {
            // Verify user has access to this branch
            $user = $request->user();
            if (!$this->userCanAccessBranch($user, $branchId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied to this branch'
                ], 403);
            }

            $query = Order::with(['items.menuItem', 'branch'])
                          ->where('branch_id', $branchId);

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            if ($request->has('payment_status')) {
                $query->where('payment_status', $request->payment_status);
            }

            // Search by order id, order number or customer fields
            if ($request->filled('order_id')) {
                $query->where('id', intval($request->order_id));
            }
            if ($request->filled('q')) {
                $q = trim($request->q);
                $query->where(function($sub) use ($q) {
                    $sub->where('order_number', 'ILIKE', "%$q%")
                        ->orWhere('customer_name', 'ILIKE', "%$q%")
                        ->orWhere('customer_email', 'ILIKE', "%$q%")
                        ->orWhere('customer_phone', 'ILIKE', "%$q%")
                        ->orWhere('code_4digit', 'ILIKE', "%$q%")
                        ->orWhere('id', $q);
                });
            }

            // Order by most recent first
            $perPage = min(max(intval($request->get('per_page', 20)), 1), 100);
            $orders = $query->orderBy('created_at', 'desc')
                           ->paginate($perPage)
                           ->appends($request->all());

            return response()->json([
                'success' => true,
                'data' => $orders
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch branch orders', [
                'branch_id' => $branchId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch orders'
            ], 500);
        }
    }

    /**
     * Get a specific order
     */
    public function show(Request $request, int $branchId, int $orderId): JsonResponse
    {
        try {
            // Verify user has access to this branch
            $user = $request->user();
            if (!$this->userCanAccessBranch($user, $branchId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied to this branch'
                ], 403);
            }

            $order = Order::with(['items.menuItem', 'branch.chain'])
                          ->where('branch_id', $branchId)
                          ->find($orderId);

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $order
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch order', [
                'branch_id' => $branchId,
                'order_id' => $orderId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch order'
            ], 500);
        }
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, int $branchId, int $orderId): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,ready,completed,cancelled'
        ]);

        try {
            // Verify user has access to this branch
            $user = $request->user();
            if (!$this->userCanAccessBranch($user, $branchId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied to this branch'
                ], 403);
            }

            $order = Order::where('branch_id', $branchId)->find($orderId);

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Check if status transition is valid
            if (!$this->isValidStatusTransition($order->status, $request->status)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid status transition'
                ], 400);
            }

            $oldStatus = $order->status;
            
            $order->update([
                'status' => $request->status,
                'status_updated_at' => now()
            ]);

            // Handle payment capture when order is completed
            $paymentResult = null;
            if ($request->status === 'completed' && $oldStatus !== 'completed') {
                try {
                    $stripeService = new StripePaymentService();
                    $paymentResult = $stripeService->capturePaymentAndTransfer($order);
                    
                    Log::info('Payment captured for completed order', [
                        'order_id' => $orderId,
                        'payment_result' => $paymentResult
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to capture payment for completed order', [
                        'order_id' => $orderId,
                        'error' => $e->getMessage()
                    ]);
                    
                    // Don't fail the status update, but log the payment issue
                    $paymentResult = [
                        'success' => false,
                        'error' => $e->getMessage()
                    ];
                }
            }

            // Log status change for audit
            Log::info('Order status updated', [
                'order_id' => $orderId,
                'old_status' => $oldStatus,
                'new_status' => $request->status,
                'updated_by' => $user->id,
                'payment_capture' => $paymentResult
            ]);

            $response = [
                'success' => true,
                'data' => $order->fresh(),
                'message' => 'Order status updated successfully'
            ];

            // Include payment capture information in response
            if ($paymentResult) {
                $response['payment_capture'] = $paymentResult;
            }

            return response()->json($response);

        } catch (\Exception $e) {
            Log::error('Failed to update order status', [
                'branch_id' => $branchId,
                'order_id' => $orderId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status'
            ], 500);
        }
    }

    /**
     * Get orders statistics for dashboard
     */
    public function getStats(Request $request, int $branchId): JsonResponse
    {
        try {
            // Verify user has access to this branch
            $user = $request->user();
            if (!$this->userCanAccessBranch($user, $branchId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied to this branch'
                ], 403);
            }

            $today = now()->startOfDay();
            $thisWeek = now()->startOfWeek();
            $thisMonth = now()->startOfMonth();

            $stats = [
                'today' => [
                    'total_orders' => Order::where('branch_id', $branchId)
                                          ->whereDate('created_at', $today)
                                          ->count(),
                    'revenue' => Order::where('branch_id', $branchId)
                                    ->whereDate('created_at', $today)
                                    ->where('payment_status', 'paid')
                                    ->sum('total_amount'),
                    'pending_orders' => Order::where('branch_id', $branchId)
                                            ->whereDate('created_at', $today)
                                            ->whereIn('status', ['pending', 'confirmed'])
                                            ->count(),
                    'completed_orders' => Order::where('branch_id', $branchId)
                                                ->whereDate('created_at', $today)
                                                ->whereIn('status', ['completed'])
                                                ->count()
                ],
                'this_week' => [
                    'total_orders' => Order::where('branch_id', $branchId)
                                          ->where('created_at', '>=', $thisWeek)
                                          ->count(),
                    'revenue' => Order::where('branch_id', $branchId)
                                    ->where('created_at', '>=', $thisWeek)
                                    ->where('payment_status', 'paid')
                                    ->sum('total_amount')
                ],
                'this_month' => [
                    'total_orders' => Order::where('branch_id', $branchId)
                                          ->where('created_at', '>=', $thisMonth)
                                          ->count(),
                    'revenue' => Order::where('branch_id', $branchId)
                                    ->where('created_at', '>=', $thisMonth)
                                    ->where('payment_status', 'paid')
                                    ->sum('total_amount')
                ],
                'status_breakdown' => Order::where('branch_id', $branchId)
                                          ->whereDate('created_at', $today)
                                          ->selectRaw('status, COUNT(*) as count')
                                          ->groupBy('status')
                                          ->get()
                                          ->pluck('count', 'status'),
                'hourly_orders' => Order::where('branch_id', $branchId)
                                       ->whereDate('created_at', $today)
                                       ->selectRaw('EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as count')
                                       ->groupBy('hour')
                                       ->orderBy('hour')
                                       ->get()
                                       ->pluck('count', 'hour')
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch order stats', [
                'branch_id' => $branchId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics'
            ], 500);
        }
    }

    /**
     * Get active orders (orders that need attention)
     */
    public function getActiveOrders(Request $request, int $branchId): JsonResponse
    {
        try {
            // Verify user has access to this branch
            $user = $request->user();
            if (!$this->userCanAccessBranch($user, $branchId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied to this branch'
                ], 403);
            }

            $activeOrders = Order::with(['items.menuItem'])
                                 ->where('branch_id', $branchId)
                                 ->whereIn('status', ['pending', 'confirmed', 'ready'])
                                 ->orderBy('created_at', 'asc')
                                 ->get();

            return response()->json([
                'success' => true,
                'data' => $activeOrders
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch active orders', [
                'branch_id' => $branchId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch active orders'
            ], 500);
        }
    }

    /**
     * Add notes to an order
     */
    public function addNotes(Request $request, int $branchId, int $orderId): JsonResponse
    {
        $request->validate([
            'notes' => 'required|string|max:1000'
        ]);

        try {
            // Verify user has access to this branch
            $user = $request->user();
            if (!$this->userCanAccessBranch($user, $branchId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied to this branch'
                ], 403);
            }

            $order = Order::where('branch_id', $branchId)->find($orderId);

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Append new notes to existing ones with timestamp
            $existingNotes = $order->notes ? $order->notes . "\n\n" : '';
            $newNotes = $existingNotes . now()->format('Y-m-d H:i') . ' - ' . $user->name . ': ' . $request->notes;

            $order->update(['notes' => $newNotes]);

            return response()->json([
                'success' => true,
                'data' => $order->fresh(),
                'message' => 'Notes added successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to add order notes', [
                'branch_id' => $branchId,
                'order_id' => $orderId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to add notes'
            ], 500);
        }
    }

    /**
     * Get order pickup information
     */
    public function getPickupInfo(Request $request, int $branchId, int $orderId): JsonResponse
    {
        try {
            // Verify user has access to this branch
            $user = $request->user();
            if (!$this->userCanAccessBranch($user, $branchId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied to this branch'
                ], 403);
            }

            $order = Order::where('branch_id', $branchId)->find($orderId);

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            $pickupInfo = [
                'order_number' => $order->order_number,
                'pickup_code' => $order->code_4digit,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'status' => $order->status,
                'estimated_time' => $this->calculateEstimatedTime($order),
                'items_count' => $order->items->count(),
                'total_amount' => $order->total_amount
            ];

            return response()->json([
                'success' => true,
                'data' => $pickupInfo
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch pickup info', [
                'branch_id' => $branchId,
                'order_id' => $orderId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch pickup information'
            ], 500);
        }
    }

    /**
     * Check if user can access the specified branch
     */
    private function userCanAccessBranch($user, int $branchId): bool
    {
        // Chain owners can access all branches in their chains
        if ($user->role === 'chain_owner') {
            return Branch::whereHas('chain', function($query) use ($user) {
                $query->where('owner_id', $user->id);
            })->where('id', $branchId)->exists();
        }

        // Branch managers and staff can access their assigned branches
        if (in_array($user->role, ['branch_manager', 'barista'])) {
            // Check managed branches first
            $hasManagedAccess = $user->managedBranches()->where('branch_id', $branchId)->exists();
            
            if ($hasManagedAccess) {
                return true;
            }
            
            // Fallback: Check if user is in same chain as branch (for simplified testing)
            if ($user->chain_id) {
                return Branch::where('id', $branchId)->where('chain_id', $user->chain_id)->exists();
            }
        }

        return false;
    }

    /**
     * Check if status transition is valid
     */
    private function isValidStatusTransition(string $currentStatus, string $newStatus): bool
    {
        $transitions = [
            'pending' => ['confirmed', 'cancelled'],
            'confirmed' => ['ready', 'cancelled'],
            'ready' => ['completed', 'cancelled'],
            'completed' => [], // Terminal state
            'cancelled' => [] // Terminal state
        ];

        // Allow special case: any non-terminal status can go to completed for payment capture
        if ($newStatus === 'completed' && !in_array($currentStatus, ['completed', 'cancelled'])) {
            return true;
        }

        // Allow any status to be cancelled (except already cancelled/completed)
        if ($newStatus === 'cancelled' && !in_array($currentStatus, ['completed', 'cancelled'])) {
            return true;
        }

        return in_array($newStatus, $transitions[$currentStatus] ?? []);
    }

    /**
     * Calculate estimated completion time for an order
     */
    private function calculateEstimatedTime($order): ?string
    {
        if (in_array($order->status, ['picked_up', 'delivered', 'cancelled'])) {
            return null; // Order is completed
        }

        $totalPrepTime = $order->items->sum(function($item) {
            return ($item->menuItem->preparation_time ?? 10) * $item->quantity;
        });

        $estimatedTime = $order->created_at->addMinutes($totalPrepTime);
        
        return $estimatedTime->format('H:i');
    }

    /**
     * Create a test order (PUBLIC - for testing only)
     * WARNING: Remove this endpoint in production
     */
    public function createTestOrder(Request $request, int $branchId): JsonResponse
    {
        try {
            // Validate input
            $request->validate([
                'order_number' => 'required|string|max:50',
                'customer_name' => 'required|string|max:255',
                'customer_phone' => 'nullable|string|max:20',
                'total' => 'required|numeric|min:0',
                'notes' => 'nullable|string|max:1000',
                'items' => 'required|array|min:1',
                'items.*.name' => 'required|string',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.price' => 'required|numeric|min:0',
                'items.*.customizations' => 'nullable|array'
            ]);

            // Check if branch exists
            $branch = Branch::findOrFail($branchId);

            // Create order
            $order = Order::create([
                'branch_id' => $branchId,
                'chain_id' => $branch->chain_id,
                'order_number' => $request->order_number,
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'total' => $request->total, // Main total field (required)
                'total_amount' => $request->total, // Secondary total field
                'status' => 'pending',
                'payment_status' => 'paid', // Test orders are pre-paid
                'notes' => $request->notes,
                'order_type' => 'takeaway', // Valid order type
                'code_4digit' => str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT), // Generate pickup code
                'commission_rate' => 5.0, // 5% commission
                'commission_amount' => $request->total * 0.05,
                'branch_amount' => $request->total * 0.95,
                'commission_status' => 'pending',
                'currency' => 'eur',
                'tax_amount' => 0.0
            ]);

            // Create order items
            foreach ($request->items as $item) {
                // Try to find matching menu item by name, or use a default one
                $menuItem = \App\Models\MenuItem::whereHas('menu.branch', function($q) use ($branchId) {
                    $q->where('id', $branchId);
                })->where('name', 'ILIKE', '%' . $item['name'] . '%')->first();
                
                if (!$menuItem) {
                    // If no exact match, use first available menu item for this branch
                    $menuItem = \App\Models\MenuItem::whereHas('menu.branch', function($q) use ($branchId) {
                        $q->where('id', $branchId);
                    })->first();
                }
                
                if ($menuItem) {
                    $order->items()->create([
                        'menu_item_id' => $menuItem->id,
                        'quantity' => $item['quantity'],
                        'price_at_time' => $item['price']
                    ]);
                }
            }

            Log::info('Test order created', [
                'order_id' => $order->id,
                'branch_id' => $branchId,
                'customer' => $request->customer_name,
                'total' => $request->total
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'message' => 'Test order created successfully'
                ]
            ], 201);

        } catch (\Exception $e) {
            Log::error('Failed to create test order', [
                'branch_id' => $branchId,
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage()
            ], 500);
        }
    }
}
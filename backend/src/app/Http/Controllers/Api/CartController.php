<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /**
     * Get cart contents
     */
    public function getCart(Request $request): JsonResponse
    {
        try {
            $userId = Auth::id();
            $sessionId = $this->getSessionIdentifier($request);

            // Get existing cart
            $query = Cart::where('status', 'active');
            
            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }

            $cart = $query->with(['branch.chain', 'items.menuItem'])->first();

            // Return empty cart if no cart exists
            if (!$cart) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'id' => null,
                        'branch' => null,
                        'items' => [],
                        'summary' => [
                            'item_count' => 0,
                            'subtotal' => '0.00',
                            'tax_amount' => '0.00',
                            'total_amount' => '0.00'
                        ],
                        'expires_at' => null,
                        'session_id' => $sessionId
                    ]
                ]);
            }
            
            $cartData = [
                'id' => $cart->id,
                'branch' => [
                    'id' => $cart->branch->id,
                    'name' => $cart->branch->name,
                    'chain_name' => $cart->branch->chain->name,
                    'address' => $cart->branch->address,
                    'opening_hours' => $cart->branch->opening_hours,
                    'is_open_now' => (bool) $cart->branch->is_open_now,
                ],
                'items' => $cart->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'menu_item' => [
                            'id' => $item->menuItem->id,
                            'name' => $item->menuItem->name,
                            'description' => $item->menuItem->description,
                            'image_url' => $item->menuItem->image_url,
                            'base_price' => $item->getBasePrice()
                        ],
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'total_price' => $item->total_price,
                        'customizations' => $item->getFormattedCustomizations(),
                        'special_instructions' => $item->special_instructions
                    ];
                }),
                'summary' => [
                    'item_count' => $cart->getItemCount(),
                    'subtotal' => $cart->subtotal,
                    'tax_amount' => $cart->tax_amount,
                    'total_amount' => $cart->total_amount
                ],
                'expires_at' => $cart->expires_at,
                'session_id' => $cart->session_id
            ];

            return response()->json([
                'success' => true,
                'data' => $cartData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add item to cart
     */
    public function addItem(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'branch_id' => 'required|exists:branches,id',
            'menu_item_id' => 'required|exists:menu_items,id',
            'quantity' => 'required|integer|min:1|max:10',
            'customizations' => 'nullable|array',
            'special_instructions' => 'nullable|string|max:500',
            'guest_id' => 'nullable|string|max:100' // Optional guest identifier
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $menuItem = MenuItem::findOrFail($request->menu_item_id);
            
            // Verify menu item belongs to the specified branch
            if ($menuItem->menu->branch_id != $request->branch_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Menu item does not belong to the specified branch'
                ], 422);
            }

            // Validate customizations
            $customizations = $request->customizations ?? [];
            if (!$this->validateCustomizations($customizations, $menuItem)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid customizations provided'
                ], 422);
            }

            // Get session ID - try multiple sources
            $sessionId = $this->getSessionIdentifier($request);

            // Get or create cart for this branch
            $cart = Cart::getOrCreateCart(
                Auth::id(),
                $sessionId,
                $request->branch_id
            );

            // Check if cart already has items from different branch
            if ($cart->branch_id != $request->branch_id && $cart->items()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart already contains items from a different branch. Please clear your cart first.',
                    'requires_cart_clear' => true
                ], 422);
            }

            $cartItem = $cart->addItem(
                $menuItem,
                $request->quantity,
                $customizations,
                $request->special_instructions
            );

            return response()->json([
                'success' => true,
                'message' => 'Item added to cart successfully',
                'data' => [
                    'cart_item_id' => $cartItem->id,
                    'session_id' => $sessionId, // Return session ID for client to store
                    'cart_summary' => [
                        'item_count' => $cart->getItemCount(),
                        'subtotal' => $cart->subtotal,
                        'total_amount' => $cart->total_amount
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add item to cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update cart item quantity
     */
    public function updateItem(Request $request, int $cartItemId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:0|max:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $userId = Auth::id();
            $sessionId = $this->getSessionIdentifier($request);

            // Get existing cart
            $query = Cart::where('status', 'active');
            
            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }

            $cart = $query->with(['items'])->first();

            if (!$cart) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart not found'
                ], 404);
            }
            
            if ($cart->updateItemQuantity($cartItemId, $request->quantity)) {
                return response()->json([
                    'success' => true,
                    'message' => 'Cart item updated successfully',
                    'data' => [
                        'cart_summary' => [
                            'item_count' => $cart->getItemCount(),
                            'subtotal' => $cart->subtotal,
                            'total_amount' => $cart->total_amount
                        ]
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Cart item not found'
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update cart item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove item from cart
     */
    public function removeItem(Request $request, int $cartItemId): JsonResponse
    {
        try {
            $userId = Auth::id();
            $sessionId = $this->getSessionIdentifier($request);

            // Get existing cart
            $query = Cart::where('status', 'active');
            
            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }

            $cart = $query->with(['items'])->first();

            if (!$cart) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart not found'
                ], 404);
            }
            
            if ($cart->removeItem($cartItemId)) {
                return response()->json([
                    'success' => true,
                    'message' => 'Item removed from cart successfully',
                    'data' => [
                        'cart_summary' => [
                            'item_count' => $cart->getItemCount(),
                            'subtotal' => $cart->subtotal,
                            'total_amount' => $cart->total_amount
                        ]
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Cart item not found'
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove cart item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear cart
     */
    public function clearCart(Request $request): JsonResponse
    {
        try {
            $userId = Auth::id();
            $sessionId = $this->getSessionIdentifier($request);

            // Get existing cart
            $query = Cart::where('status', 'active');
            
            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }

            $cart = $query->first();

            if (!$cart) {
                return response()->json([
                    'success' => true,
                    'message' => 'Cart is already empty'
                ]);
            }

            $cart->clear();

            return response()->json([
                'success' => true,
                'message' => 'Cart cleared successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get session identifier from multiple sources
     */
    private function getSessionIdentifier(Request $request): string
    {
        // For authenticated users, use user ID as session identifier
        if (Auth::check()) {
            return 'user-' . Auth::id();
        }

        // Try to get session ID from Laravel session
        try {
            $sessionId = $request->session()->getId();
            if ($sessionId) {
                return $sessionId;
            }
        } catch (\Exception $e) {
            // Session might not be available
        }

        // Try to get guest_id from request
        if ($request->has('guest_id') && $request->guest_id) {
            return 'guest-' . $request->guest_id;
        }

        // Try to get from X-Guest-Session header (for mobile apps)
        $headerGuestSession = $request->header('X-Guest-Session');
        if ($headerGuestSession) {
            return $headerGuestSession;
        }

        // Try to get from X-Guest-ID header (legacy)
        $headerGuestId = $request->header('X-Guest-ID');
        if ($headerGuestId) {
            return 'guest-' . $headerGuestId;
        }

        // Generate a new guest session ID based on IP and user agent (consistent per session)
        $ip = $request->ip();
        $userAgent = $request->userAgent();
        return 'guest-' . md5($ip . $userAgent);
    }

    /**
     * Get or create user's cart
     */
    private function getOrCreateUserCart(Request $request, ?int $branchId = null): Cart
    {
        $userId = Auth::id();
        $sessionId = $this->getSessionIdentifier($request);

        if ($branchId) {
            return Cart::getOrCreateCart($userId, $sessionId, $branchId);
        }

        // Get existing cart
        $query = Cart::where('status', 'active');
        
        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('session_id', $sessionId);
        }

        $cart = $query->with(['branch.chain', 'items.menuItem'])->first();

        if (!$cart) {
            // No existing cart, will be created when first item is added
            throw new \Exception('No active cart found. Add items to create a cart.');
        }

        return $cart;
    }

    /**
     * Validate customizations against menu item options
     */
    private function validateCustomizations(array $customizations, MenuItem $menuItem): bool
    {
        if (empty($customizations)) {
            return true;
        }

        if (!$menuItem->customization_options) {
            return false; // No customizations allowed but some were provided
        }

        $availableOptions = is_string($menuItem->customization_options) 
            ? json_decode($menuItem->customization_options, true) 
            : $menuItem->customization_options;

        foreach ($customizations as $type => $selectedOption) {
            if (!isset($availableOptions[$type]['options'][$selectedOption])) {
                return false;
            }
        }

        return true;
    }
}

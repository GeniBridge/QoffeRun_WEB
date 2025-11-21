<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Chain;
use App\Models\Menu;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CustomerOrderingController extends Controller
{
    /**
     * Get all available branches for ordering
     * GET /api/v1/customer/branches
     */
    public function getBranches(Request $request): JsonResponse
    {
        try {
            $branches = Branch::with(['chain:id,name,logo_path'])
                ->where('status', 'active')
                ->where('accepts_online_orders', true)
                ->whereHas('menus.items') // Only branches that have menu items
                ->select([
                    'id', 'chain_id', 'name', 'code',
                    'via', 'numero_civico', 'citta', 'provincia', 'cap', 'regione', 'paese',
                    'address', 'city', 'province', // Legacy fields as fallback
                    'phone', 'email',
                    'online_ordering_start', 'online_ordering_end',
                    'delivery_enabled', 'takeaway_enabled', 'table_service_enabled',
                    'lat', 'lng'
                ])
                ->get()
                ->map(function ($branch) {
                    // Format address for display
                    $address = $this->formatBranchAddress($branch);
                    
                    // Check if currently accepting orders
                    $acceptingOrders = $this->isBranchAcceptingOrders($branch);
                    
                    return [
                        'id' => $branch->id,
                        'name' => $branch->name,
                        'code' => $branch->code,
                        'address' => $address,
                        'phone' => $branch->phone,
                        'email' => $branch->email,
                        'chain' => [
                            'id' => $branch->chain->id,
                            'name' => $branch->chain->name,
                            'logo' => $branch->chain->logo_path
                        ],
                        'services' => [
                            'delivery' => $branch->delivery_enabled,
                            'takeaway' => $branch->takeaway_enabled,
                            'table_service' => $branch->table_service_enabled
                        ],
                        'coordinates' => [
                            'lat' => $branch->lat,
                            'lng' => $branch->lng
                        ],
                        'accepting_orders' => $acceptingOrders,
                        'ordering_hours' => [
                            'start' => $branch->online_ordering_start,
                            'end' => $branch->online_ordering_end
                        ]
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $branches
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel caricamento delle filiali',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get menu items for a specific branch
     * GET /api/v1/customer/branches/{branchId}/menu
     */
    public function getBranchMenu(Request $request, int $branchId): JsonResponse
    {
        try {
            $branch = Branch::with(['chain:id,name'])
                ->where('id', $branchId)
                ->where('status', 'active')
                ->where('accepts_online_orders', true)
                ->first();

            if (!$branch) {
                return response()->json([
                    'success' => false,
                    'message' => 'Filiale non trovata o non accetta ordini online'
                ], 404);
            }

            // Check if branch is currently accepting orders
            if (!$this->isBranchAcceptingOrders($branch)) {
                return response()->json([
                    'success' => false,
                    'message' => 'La filiale non accetta ordini in questo momento',
                    'ordering_hours' => [
                        'start' => $branch->online_ordering_start,
                        'end' => $branch->online_ordering_end
                    ]
                ], 422);
            }

            // Get all menu items for this branch
            $menuItems = MenuItem::whereHas('menu', function ($query) use ($branchId) {
                    $query->where('branch_id', $branchId);
                })
                ->where('is_available', true)
                ->with(['menu:id,name'])
                ->orderBy('category')
                ->orderBy('name')
                ->get()
                ->groupBy('category')
                ->map(function ($items, $category) {
                    return [
                        'category' => $category ?: 'Altri',
                        'items' => $items->map(function ($item) {
                            return [
                                'id' => $item->id,
                                'name' => $item->name,
                                'price' => number_format($item->price, 2),
                                'price_raw' => $item->price,
                                'category' => $item->category,
                                'image' => $item->image_url,
                                'description' => $item->description ?? '',
                                'is_available' => $item->is_available,
                                'customizable' => $item->customizable ?? false,
                                'customization_options' => $item->customization_options ?? []
                            ];
                        })
                    ];
                })
                ->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'branch' => [
                        'id' => $branch->id,
                        'name' => $branch->name,
                        'chain_name' => $branch->chain->name
                    ],
                    'menu' => $menuItems
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel caricamento del menu',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specific menu item details with customization options
     * GET /api/v1/customer/menu-items/{itemId}
     */
    public function getMenuItem(Request $request, int $itemId): JsonResponse
    {
        try {
            $menuItem = MenuItem::with(['menu.branch'])
                ->where('id', $itemId)
                ->where('is_available', true)
                ->first();

            if (!$menuItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Prodotto non trovato o non disponibile'
                ], 404);
            }

            // Check if branch accepts online orders
            if (!$menuItem->menu->branch->accepts_online_orders) {
                return response()->json([
                    'success' => false,
                    'message' => 'Questo prodotto non è disponibile per ordini online'
                ], 422);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $menuItem->id,
                    'name' => $menuItem->name,
                    'description' => $menuItem->description ?? '',
                    'price' => number_format($menuItem->price, 2),
                    'price_raw' => $menuItem->price,
                    'category' => $menuItem->category,
                    'image' => $menuItem->image_url,
                    'customizable' => $menuItem->customizable ?? false,
                    'customization_options' => $menuItem->customization_options ?? [],
                    'nutritional_info' => $menuItem->nutritional_info ?? [],
                    'allergens' => $menuItem->allergens ?? [],
                    'branch' => [
                        'id' => $menuItem->menu->branch->id,
                        'name' => $menuItem->menu->branch->name
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel caricamento del prodotto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Format branch address for display
     */
    private function formatBranchAddress(Branch $branch): string
    {
        $address = [];
        
        // Use standardized address fields if available
        if (!empty($branch->via)) {
            $street = $branch->via;
            if (!empty($branch->numero_civico)) {
                $street .= ', ' . $branch->numero_civico;
            }
            $address[] = $street;
        } elseif (!empty($branch->address)) {
            $address[] = $branch->address;
        }
        
        if (!empty($branch->citta)) {
            $cityLine = $branch->citta;
            if (!empty($branch->cap)) {
                $cityLine = $branch->cap . ' ' . $cityLine;
            }
            if (!empty($branch->provincia)) {
                $cityLine .= ' (' . $branch->provincia . ')';
            }
            $address[] = $cityLine;
        } elseif (!empty($branch->city)) {
            $cityLine = $branch->city;
            if (!empty($branch->cap)) {
                $cityLine = $branch->cap . ' ' . $cityLine;
            }
            if (!empty($branch->province)) {
                $cityLine .= ' (' . $branch->province . ')';
            }
            $address[] = $cityLine;
        }
        
        return implode(', ', $address) ?: 'Indirizzo non specificato';
    }

    /**
     * Check if branch is currently accepting orders
     */
    private function isBranchAcceptingOrders(Branch $branch): bool
    {
        if (!$branch->accepts_online_orders) {
            return false;
        }

        // If no specific hours set, accept orders 24/7
        if (empty($branch->online_ordering_start) || empty($branch->online_ordering_end)) {
            return true;
        }

        $now = now()->format('H:i:s');
        $start = $branch->online_ordering_start;
        $end = $branch->online_ordering_end;

        // Handle cases where ordering spans midnight
        if ($start <= $end) {
            return $now >= $start && $now <= $end;
        } else {
            return $now >= $start || $now <= $end;
        }
    }
}
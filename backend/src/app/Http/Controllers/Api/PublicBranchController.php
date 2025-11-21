<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Chain;
use App\Models\MenuItem;
use App\Models\BranchSettings;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PublicBranchController extends Controller
{
    /**
     * Get all public branches with required criteria
     */
    public function getPublicBranches(Request $request): JsonResponse
    {
        try {
            $branches = Branch::with(['chain', 'menus.items'])
                ->whereNotNull('lat')
                ->whereNotNull('lng')
                ->whereNotNull('stripe_connect_account_id')
                ->where('stripe_connect_status', 'active')
                ->where('status', 'active')
                ->get()
                ->filter(function ($branch) {
                    // Filter branches with at least 5 products
                    $totalProducts = $branch->menus->sum(function ($menu) {
                        return $menu->items->count();
                    });
                    return $totalProducts >= 5;
                })
                ->map(function ($branch) {
                    $hours = $this->getPublicOpeningHours($branch);
                    $todayInfo = $this->getTodayInfo($hours);
                    return [
                        'id' => $branch->id,
                        'name' => $branch->name,
                        'address' => $this->getFullAddress($branch),
                        'lat' => $branch->lat,
                        'lng' => $branch->lng,
                        'phone' => $branch->phone,
                        'city' => $branch->citta ?: $branch->city,
                        'province' => $branch->provincia ?: $branch->province,
                        'chain' => [
                            'id' => $branch->chain->id,
                            'name' => $branch->chain->name,
                            'logo_url' => $branch->chain->logo_path ? url('storage/' . $branch->chain->logo_path) : null,
                            'cover_url' => $branch->chain->cover_image_path ? url('storage/' . $branch->chain->cover_image_path) : null,
                            'description' => 'Autentico caffè italiano nel cuore di Roma',
                        ],
                        'products_count' => $branch->menus->sum(function ($menu) {
                            return $menu->items->count();
                        }),
                        'delivery_enabled' => $branch->delivery_enabled,
                        'takeaway_enabled' => $branch->takeaway_enabled,
                        'table_service_enabled' => $branch->table_service_enabled,
                        'opening_hours' => $hours,
                        'is_open_now' => $todayInfo['is_open_now'],
                        'today_hours' => $todayInfo['today_hours'],
                        'has_stripe_account' => !empty($branch->stripe_connect_account_id) && $branch->stripe_connect_status === 'active',
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $branches->values(),
                'total' => $branches->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel caricamento delle filiali: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single branch details with full menu
     */
    public function getBranchDetails(Request $request, int $branchId): JsonResponse
    {
        try {
            $branch = Branch::with(['chain', 'menus.items'])
                ->where('id', $branchId)
                ->where('status', 'active')
                ->whereNotNull('lat')
                ->whereNotNull('lng')
                ->whereNotNull('stripe_connect_account_id')
                ->where('stripe_connect_status', 'active')
                ->first();

            if (!$branch) {
                return response()->json([
                    'success' => false,
                    'message' => 'Filiale non trovata o non disponibile'
                ], 404);
            }

            // Get customer reviews/feedback
            $reviews = $this->getBranchReviews($branchId);

            // Organize menu by categories
            $categorizedMenu = [];
            foreach ($branch->menus as $menu) {
                foreach ($menu->items as $item) {
                    $category = $item->category ?: 'Altro';
                    if (!isset($categorizedMenu[$category])) {
                        $categorizedMenu[$category] = [];
                    }
                    
                    $categorizedMenu[$category][] = [
                        'id' => $item->id,
                        'name' => $item->name,
                        'description' => $item->description,
                        'price' => $item->price,
                        'image_url' => $item->image_url,
                        'is_available' => $item->is_available,
                        'preparation_time' => $item->preparation_time,
                        'allergens' => $item->allergens,
                        'customization_options' => $item->customization_options,
                        'menu_id' => $menu->id,
                    ];
                }
            }

            $hours = $this->getPublicOpeningHours($branch);
            $todayInfo = $this->getTodayInfo($hours);

            return response()->json([
                'success' => true,
                'data' => [
                    'branch' => [
                        'id' => $branch->id,
                        'name' => $branch->name,
                        'address' => $this->getFullAddress($branch),
                        'lat' => $branch->lat,
                        'lng' => $branch->lng,
                        'phone' => $branch->phone,
                        'email' => $branch->email,
                        'delivery_enabled' => $branch->delivery_enabled,
                        'takeaway_enabled' => $branch->takeaway_enabled,
                        'table_service_enabled' => $branch->table_service_enabled,
                        'opening_hours' => $hours,
                        'is_open_now' => $todayInfo['is_open_now'],
                        'today_hours' => $todayInfo['today_hours'],
                        'has_stripe_account' => !empty($branch->stripe_connect_account_id) && $branch->stripe_connect_status === 'active',
                    ],
                    'chain' => [
                        'id' => $branch->chain->id,
                        'name' => $branch->chain->name,
                        'logo_url' => $branch->chain->logo_path ? url('storage/' . $branch->chain->logo_path) : null,
                        'cover_url' => $branch->chain->cover_image_path ? url('storage/' . $branch->chain->cover_image_path) : null,
                        'description' => 'Autentico caffè italiano nel cuore di Roma',
                    ],
                    'menu' => $categorizedMenu,
                    'reviews' => $reviews,
                    'stats' => [
                        'total_products' => collect($categorizedMenu)->flatten(1)->count(),
                        'categories' => count($categorizedMenu),
                        'average_rating' => $reviews['average_rating'] ?? 0,
                        'total_reviews' => $reviews['total_reviews'] ?? 0,
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel caricamento dei dettagli: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get branch reviews (placeholder - implement with your review system)
     */
    private function getBranchReviews(int $branchId): array
    {
        // This is a placeholder. Implement your actual review system
        return [
            'average_rating' => 4.5,
            'total_reviews' => 127,
            'recent_reviews' => [
                [
                    'id' => 1,
                    'customer_name' => 'Mario R.',
                    'rating' => 5,
                    'comment' => 'Ottimo caffè e servizio veloce!',
                    'date' => '2025-11-10',
                ],
                [
                    'id' => 2,
                    'customer_name' => 'Giulia M.',
                    'rating' => 4,
                    'comment' => 'Buona qualità, ambiente accogliente.',
                    'date' => '2025-11-08',
                ],
                [
                    'id' => 3,
                    'customer_name' => 'Luca T.',
                    'rating' => 5,
                    'comment' => 'Il miglior cappuccino della zona!',
                    'date' => '2025-11-05',
                ]
            ]
        ];
    }

    /**
     * Get full formatted address
     */
    private function getFullAddress(Branch $branch): string
    {
        $parts = [];
        
        // Use new standardized fields if available, fallback to legacy
        $via = $branch->via ?: '';
        $numero = $branch->numero_civico ?: '';
        $city = $branch->citta ?: $branch->city;
        $province = $branch->provincia ?: $branch->province;
        $cap = $branch->cap;

        if ($via) {
            $parts[] = $via . ($numero ? ' ' . $numero : '');
        } elseif ($branch->address) {
            $parts[] = $branch->address;
        }

        if ($cap && $city) {
            $cityPart = $cap . ' ' . $city;
            if ($province) {
                $cityPart .= ' (' . $province . ')';
            }
            $parts[] = $cityPart;
        }

        return implode(', ', $parts);
    }

    /**
     * Search branches by location or name
     */
    public function searchBranches(Request $request): JsonResponse
    {
        $query = $request->input('query', '');
        $lat = $request->input('lat');
        $lng = $request->input('lng');
        $radius = $request->input('radius', 10); // km

        try {
            $branchQuery = Branch::with(['chain', 'menus.items'])
                ->whereNotNull('lat')
                ->whereNotNull('lng')
                ->whereNotNull('stripe_account_id')
                ->where('status', 'active');

            // Text search
            if ($query) {
                $branchQuery->where(function ($q) use ($query) {
                    $q->where('name', 'LIKE', "%{$query}%")
                      ->orWhere('address', 'LIKE', "%{$query}%")
                      ->orWhere('city', 'LIKE', "%{$query}%")
                      ->orWhere('citta', 'LIKE', "%{$query}%")
                      ->orWhereHas('chain', function ($chainQuery) use ($query) {
                          $chainQuery->where('name', 'LIKE', "%{$query}%");
                      });
                });
            }

            // Location-based search
            if ($lat && $lng) {
                $branchQuery->selectRaw("
                    *,
                    (6371 * acos(cos(radians(?)) * cos(radians(lat)) * cos(radians(lng) - radians(?)) + sin(radians(?)) * sin(radians(lat)))) AS distance
                ", [$lat, $lng, $lat])
                ->having('distance', '<=', $radius)
                ->orderBy('distance');
            }

            $branches = $branchQuery->get()
                ->filter(function ($branch) {
                    // Filter branches with at least 5 products
                    $totalProducts = $branch->menus->sum(function ($menu) {
                        return $menu->items->count();
                    });
                    return $totalProducts >= 5;
                })
                ->map(function ($branch) {
                    return [
                        'id' => $branch->id,
                        'name' => $branch->name,
                        'address' => $this->getFullAddress($branch),
                        'lat' => $branch->lat,
                        'lng' => $branch->lng,
                        'phone' => $branch->phone,
                        'city' => $branch->citta ?: $branch->city,
                        'province' => $branch->provincia ?: $branch->province,
                        'distance' => isset($branch->distance) ? round($branch->distance, 2) : null,
                        'chain' => [
                            'id' => $branch->chain->id,
                            'name' => $branch->chain->name,
                            'logo_url' => $branch->chain->logo_path ? url('storage/' . $branch->chain->logo_path) : null,
                        ],
                        'products_count' => $branch->menus->sum(function ($menu) {
                            return $menu->items->count();
                        }),
                        'delivery_enabled' => $branch->delivery_enabled,
                        'takeaway_enabled' => $branch->takeaway_enabled,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $branches->values(),
                'total' => $branches->count(),
                'query' => $query,
                'location' => $lat && $lng ? ['lat' => $lat, 'lng' => $lng, 'radius' => $radius] : null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nella ricerca: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Build opening hours object for public APIs.
     * Priority: branch.opening_hours JSON -> BranchSettings hours_* -> defaults.
     */
    private function getPublicOpeningHours(Branch $branch): array
    {
        // If branch has opening_hours JSON, trust it
        if (is_array($branch->opening_hours) && !empty($branch->opening_hours)) {
            return $this->normalizeHours($branch->opening_hours);
        }

        // Otherwise, reconstruct from BranchSettings hours_*
        $settings = $branch->settings()
            ->where('key', 'like', 'hours_%')
            ->get()
            ->keyBy('key');

        $days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
        $hours = [];
        foreach ($days as $day) {
            $value = $settings['hours_'.$day]->typed_value ?? null;
            if (is_array($value)) {
                $hours[$day] = [
                    'open' => $value['open'] ?? '08:00',
                    'close' => $value['close'] ?? '20:00',
                    'closed' => (bool)($value['closed'] ?? false)
                ];
            } else {
                // default
                $hours[$day] = [
                    'open' => in_array($day, ['saturday','sunday']) ? '09:00' : '08:00',
                    'close' => in_array($day, ['saturday','sunday']) ? '19:00' : '20:00',
                    'closed' => false
                ];
            }
        }

        return $hours;
    }

    private function normalizeHours(array $hours): array
    {
        $days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
        $normalized = [];
        foreach ($days as $day) {
            $info = $hours[$day] ?? [];
            $normalized[$day] = [
                'open' => $info['open'] ?? '08:00',
                'close' => $info['close'] ?? '20:00',
                'closed' => (bool)($info['closed'] ?? false)
            ];
        }
        return $normalized;
    }

    private function getTodayInfo(array $hours): array
    {
        $now = Carbon::now();
        $weekday = strtolower($now->englishDayOfWeek); // monday..sunday
        $today = $hours[$weekday] ?? ['open' => '08:00', 'close' => '20:00', 'closed' => false];
        $isOpen = false;
        if (!$today['closed']) {
            $start = Carbon::createFromFormat('H:i', $today['open']);
            $end = Carbon::createFromFormat('H:i', $today['close']);
            // Handle potential overnight ranges
            if ($end->lessThanOrEqualTo($start)) {
                $end->addDay();
            }
            $current = $now->copy();
            if ($current->lessThan($start)) {
                // same day window
            } elseif ($current->greaterThan($end)) {
                // After end
            }
            $isOpen = $current->between($start, $end, true);
        }
        return [
            'is_open_now' => $isOpen,
            'today_hours' => $today
        ];
    }
}
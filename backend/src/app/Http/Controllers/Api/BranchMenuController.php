<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class BranchMenuController extends Controller
{
    /**
     * Get all menus for a specific branch
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

            $branch = Branch::with(['menus.items'])->find($branchId);
            
            if (!$branch) {
                return response()->json([
                    'success' => false,
                    'message' => 'Branch not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'branch' => $branch,
                    'menus' => $branch->menus
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch branch menus', [
                'branch_id' => $branchId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch menus'
            ], 500);
        }
    }

    /**
     * Create a new menu for a branch
     */
    public function createMenu(Request $request, int $branchId): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'menu_type' => 'required|in:breakfast,lunch,dinner,drinks,desserts,specials'
        ]);

        try {
            // Verify user has access to this branch and manage_menu permission
            $user = $request->user();
            if (!$this->userCanAccessBranch($user, $branchId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied to this branch'
                ], 403);
            }

            if (!$this->userHasPermission($user, $branchId, 'manage_menu')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Permission denied: manage_menu required'
                ], 403);
            }

            $branch = Branch::find($branchId);
            if (!$branch) {
                return response()->json([
                    'success' => false,
                    'message' => 'Branch not found'
                ], 404);
            }

            $menu = Menu::create([
                'branch_id' => $branchId,
                'name' => $request->name,
                'description' => $request->description,
                'is_active' => $request->is_active ?? true,
                'menu_type' => $request->menu_type
            ]);

            return response()->json([
                'success' => true,
                'data' => $menu,
                'message' => 'Menu created successfully'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Failed to create menu', [
                'branch_id' => $branchId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create menu'
            ], 500);
        }
    }

    /**
     * Get menu items for a specific menu
     */
    public function getMenuItems(Request $request, int $branchId, int $menuId): JsonResponse
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

            $menu = Menu::with('items')
                        ->where('branch_id', $branchId)
                        ->find($menuId);

            if (!$menu) {
                return response()->json([
                    'success' => false,
                    'message' => 'Menu not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'menu' => $menu,
                    'items' => $menu->items
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch menu items', [
                'branch_id' => $branchId,
                'menu_id' => $menuId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch menu items'
            ], 500);
        }
    }

    /**
     * Add a new item to a menu
     */
    public function addMenuItem(Request $request, int $branchId, int $menuId): JsonResponse
    {
        Log::info('addMenuItem called', [
            'branch_id' => $branchId,
            'menu_id' => $menuId,
            'has_image' => $request->hasFile('image'),
            'request_data' => $request->all()
        ]);

        // Convert string boolean values from FormData to actual booleans
        $data = $request->all();
        if (isset($data['is_available'])) {
            $data['is_available'] = filter_var($data['is_available'], FILTER_VALIDATE_BOOLEAN);
        }
        if (isset($data['track_inventory'])) {
            $data['track_inventory'] = filter_var($data['track_inventory'], FILTER_VALIDATE_BOOLEAN);
        }
        
        // Handle JSON string arrays from FormData
        if (isset($data['allergens']) && is_string($data['allergens'])) {
            $data['allergens'] = json_decode($data['allergens'], true) ?: [];
        }
        if (isset($data['customization_options']) && is_string($data['customization_options'])) {
            $data['customization_options'] = json_decode($data['customization_options'], true) ?: [];
        }
        
        // Replace request data
        $request->merge($data);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:100',
            'is_available' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240',
            'preparation_time' => 'nullable|integer|min:1|max:120',
            'allergens' => 'nullable|array',
            'allergens.*' => 'string|max:50',
            'customization_options' => 'nullable|array',
            'track_inventory' => 'boolean',
            'inventory_count' => 'nullable|integer|min:0'
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

            $menu = Menu::where('branch_id', $branchId)->find($menuId);
            if (!$menu) {
                return response()->json([
                    'success' => false,
                    'message' => 'Menu not found'
                ], 404);
            }

            $data = [
                'menu_id' => $menuId,
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'category' => $request->category,
                'is_available' => $request->is_available ?? true,
                'preparation_time' => $request->preparation_time,
                'allergens' => json_encode($request->allergens ?? []),
                'customization_options' => json_encode($request->customization_options ?? []),
                'track_inventory' => $request->track_inventory ?? false,
                'inventory_count' => $request->inventory_count
            ];

            // Handle image upload
            if ($request->hasFile('image')) {
                Log::info('Image file received for menu item', [
                    'original_name' => $request->file('image')->getClientOriginalName(),
                    'size' => $request->file('image')->getSize()
                ]);
                $imagePath = $request->file('image')->store('menu-items', 'public');
                $data['image'] = $imagePath;
                Log::info('Image stored successfully', ['path' => $imagePath]);
            } else {
                Log::info('No image file in request');
            }

            $menuItem = MenuItem::create($data);

            return response()->json([
                'success' => true,
                'data' => $menuItem,
                'message' => 'Menu item added successfully'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Failed to add menu item', [
                'branch_id' => $branchId,
                'menu_id' => $menuId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to add menu item'
            ], 500);
        }
    }

    /**
     * Update a menu item
     */
    public function updateMenuItem(Request $request, int $branchId, int $menuId, int $itemId): JsonResponse
    {
        Log::info('updateMenuItem called', [
            'branch_id' => $branchId,
            'menu_id' => $menuId,
            'item_id' => $itemId,
            'has_image' => $request->hasFile('image'),
            'request_data' => $request->all()
        ]);

        try {
            // Convert string boolean values from FormData to actual booleans
            $data = $request->all();
            if (isset($data['is_available'])) {
                $data['is_available'] = filter_var($data['is_available'], FILTER_VALIDATE_BOOLEAN);
            }
            if (isset($data['track_inventory'])) {
                $data['track_inventory'] = filter_var($data['track_inventory'], FILTER_VALIDATE_BOOLEAN);
            }
            
            // Handle JSON string arrays from FormData
            if (isset($data['allergens']) && is_string($data['allergens'])) {
                $data['allergens'] = json_decode($data['allergens'], true) ?: [];
            }
            if (isset($data['customization_options']) && is_string($data['customization_options'])) {
                $data['customization_options'] = json_decode($data['customization_options'], true) ?: [];
            }
            
            // Replace request data
            $request->merge($data);
            
            $request->validate([
                'name' => 'sometimes|string|max:255',
                'description' => 'nullable|string|max:1000',
                'price' => 'sometimes|numeric|min:0',
                'category' => 'sometimes|string|max:100',
                'is_available' => 'sometimes|boolean',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240', // Increased to 10MB
                'preparation_time' => 'nullable|integer|min:1|max:120',
                'allergens' => 'nullable|array',
                'allergens.*' => 'string|max:50',
                'customization_options' => 'nullable|array',
                'track_inventory' => 'sometimes|boolean',
                'inventory_count' => 'nullable|integer|min:0'
            ]);
            Log::info('Validation passed for updateMenuItem', ['item_id' => $itemId]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed for updateMenuItem', [
                'item_id' => $itemId,
                'errors' => $e->errors(),
                'input' => $request->all()
            ]);
            throw $e;
        }

        try {
            // Verify user has access to this branch
            $user = $request->user();
            if (!$this->userCanAccessBranch($user, $branchId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied to this branch'
                ], 403);
            }

            $menuItem = MenuItem::whereHas('menu', function($query) use ($branchId) {
                $query->where('branch_id', $branchId);
            })->where('menu_id', $menuId)->find($itemId);

            if (!$menuItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Menu item not found'
                ], 404);
            }

            $data = $request->only([
                'name', 'description', 'price', 'category', 'is_available',
                'preparation_time', 'track_inventory', 'inventory_count'
            ]);

            if ($request->has('allergens')) {
                $data['allergens'] = json_encode($request->allergens);
            }

            if ($request->has('customization_options')) {
                $data['customization_options'] = json_encode($request->customization_options);
            }

            // Handle image upload
            Log::info('About to process image upload', [
                'item_id' => $itemId,
                'hasFile_image' => $request->hasFile('image'),
                'all_files' => array_keys($request->allFiles()),
                'request_method' => $request->method(),
                '_method_param' => $request->input('_method')
            ]);
            
            if ($request->hasFile('image')) {
                Log::info('Image file received for menu item update', [
                    'item_id' => $itemId,
                    'original_name' => $request->file('image')->getClientOriginalName(),
                    'size' => $request->file('image')->getSize()
                ]);
                // Delete old image if exists
                if ($menuItem->image) {
                    Storage::disk('public')->delete($menuItem->image);
                    Log::info('Old image deleted', ['old_path' => $menuItem->image]);
                }
                $imagePath = $request->file('image')->store('menu-items', 'public');
                $data['image'] = $imagePath;
                Log::info('Image stored successfully for update', ['path' => $imagePath]);
            } else {
                Log::info('No image file in update request', ['item_id' => $itemId]);
            }

            $menuItem->update($data);

            return response()->json([
                'success' => true,
                'data' => $menuItem->fresh(),
                'message' => 'Menu item updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update menu item', [
                'branch_id' => $branchId,
                'menu_id' => $menuId,
                'item_id' => $itemId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update menu item'
            ], 500);
        }
    }

    /**
     * Delete a menu item
     */
    public function deleteMenuItem(Request $request, int $branchId, int $menuId, int $itemId): JsonResponse
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

            $menuItem = MenuItem::whereHas('menu', function($query) use ($branchId) {
                $query->where('branch_id', $branchId);
            })->where('menu_id', $menuId)->find($itemId);

            if (!$menuItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Menu item not found'
                ], 404);
            }

            // Delete image if exists
            if ($menuItem->image) {
                Storage::disk('public')->delete($menuItem->image);
            }

            $menuItem->delete();

            return response()->json([
                'success' => true,
                'message' => 'Menu item deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to delete menu item', [
                'branch_id' => $branchId,
                'menu_id' => $menuId,
                'item_id' => $itemId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete menu item'
            ], 500);
        }
    }

    /**
     * Toggle menu item availability
     */
    public function toggleAvailability(Request $request, int $branchId, int $menuId, int $itemId): JsonResponse
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

            $menuItem = MenuItem::whereHas('menu', function($query) use ($branchId) {
                $query->where('branch_id', $branchId);
            })->where('menu_id', $menuId)->find($itemId);

            if (!$menuItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Menu item not found'
                ], 404);
            }

            $menuItem->update(['is_available' => !$menuItem->is_available]);

            return response()->json([
                'success' => true,
                'data' => $menuItem->fresh(),
                'message' => 'Availability updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to toggle menu item availability', [
                'branch_id' => $branchId,
                'menu_id' => $menuId,
                'item_id' => $itemId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update availability'
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

        // Branch managers and staff can access their assigned branches (using new system)
        if (in_array($user->role, ['branch_manager', 'barista'])) {
            return $user->assignedBranches()->where('branches.id', $branchId)->exists();
        }

        return false;
    }

    /**
     * Check if user has specific permission for a branch
     */
    private function userHasPermission($user, int $branchId, string $permission): bool
    {
        // Chain owners have all permissions
        if ($user->role === 'chain_owner') {
            return $this->userCanAccessBranch($user, $branchId);
        }

        // Check permissions in user_branches pivot table
        $branchAssignment = $user->assignedBranches()->where('branches.id', $branchId)->first();
        
        if (!$branchAssignment) {
            return false;
        }

        $permissions = $branchAssignment->pivot->permissions;
        
        // If permissions is string, decode it
        if (is_string($permissions)) {
            $permissions = json_decode($permissions, true);
        }

        return isset($permissions[$permission]) && $permissions[$permission] === true;
    }
}
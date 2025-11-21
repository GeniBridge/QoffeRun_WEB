import authService from './authService';

class MenuService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'https://api.qofferun.com';
  }

  async apiCall(endpoint, options = {}) {
    const token = authService.getToken();
    console.log('MenuService apiCall - Token available:', !!token, 'Endpoint:', endpoint);
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...(options.isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers
      },
      ...options
    };

    // Remove isFormData from config as it's not a fetch option
    delete config.isFormData;
    
    // Debug logging
    console.log('apiCall config:', {
      method: config.method,
      headers: config.headers,
      bodyType: config.body ? config.body.constructor.name : 'undefined',
      isFormData: config.body instanceof FormData,
      endpoint: `${this.baseUrl}/api/bar-panel${endpoint}`
    });

    const response = await fetch(`${this.baseUrl}/api/bar-panel${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }
    
    return response.json();
  }

  // Menu operations
  async getBranchMenus(branchId) {
    try {
      const response = await this.apiCall(`/branches/${branchId}/menus`);
      return response.data;
    } catch (error) {
      console.error('Error fetching branch menus:', error);
      throw error;
    }
  }

  async createMenu(branchId, menuData) {
    try {
      const response = await this.apiCall(`/branches/${branchId}/menus`, {
        method: 'POST',
        body: JSON.stringify(menuData)
      });
      return response.data;
    } catch (error) {
      console.error('Error creating menu:', error);
      throw error;
    }
  }

  // Menu items operations
  async getMenuItems(branchId, menuId) {
    try {
      const response = await this.apiCall(`/branches/${branchId}/menus/${menuId}/items`);
      return response.data;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  }

  async addMenuItem(branchId, menuId, itemData) {
    try {
      const formData = new FormData();
      
      // Add all fields to FormData
      Object.keys(itemData).forEach(key => {
        if (key === 'allergens' || key === 'customization_options') {
          formData.append(key, JSON.stringify(itemData[key]));
        } else if (key === 'image' && itemData[key] instanceof File) {
          formData.append(key, itemData[key]);
        } else if (itemData[key] !== null && itemData[key] !== undefined) {
          formData.append(key, itemData[key]);
        }
      });

      const response = await this.apiCall(`/branches/${branchId}/menus/${menuId}/items`, {
        method: 'POST',
        body: formData,
        isFormData: true
      });
      
      return response.data;
    } catch (error) {
      console.error('Error adding menu item:', error);
      throw error;
    }
  }

  async updateMenuItem(branchId, menuId, itemId, itemData) {
    try {
      console.log('updateMenuItem - Processing item data:', itemData);
      
      // Check if there's an image to upload
      const hasImage = itemData.image && itemData.image instanceof File;
      
      if (hasImage) {
        // Use FormData for image uploads
        const formData = new FormData();
        
        Object.keys(itemData).forEach(key => {
          if (key === 'allergens' || key === 'customization_options') {
            formData.append(key, JSON.stringify(itemData[key]));
            console.log(`FormData append: ${key} = ${JSON.stringify(itemData[key])}`);
          } else if (key === 'image' && itemData[key] instanceof File) {
            formData.append(key, itemData[key]);
            console.log(`FormData append: ${key} = File(${itemData[key].name}, ${itemData[key].size})`);
          } else if (itemData[key] !== null && itemData[key] !== undefined) {
            formData.append(key, itemData[key]);
            console.log(`FormData append: ${key} = ${itemData[key]}`);
          }
        });
        
        // Add method spoofing for FormData + Laravel
        formData.append('_method', 'PUT');
        console.log('Using FormData with method spoofing for image upload');

        const response = await this.apiCall(`/branches/${branchId}/menus/${menuId}/items/${itemId}`, {
          method: 'POST', // POST with _method=PUT for FormData
          body: formData,
          isFormData: true
        });
        
        return response.data;
      } else {
        // Use JSON for updates without images
        console.log('Using JSON for update without image');
        const jsonData = { ...itemData };
        delete jsonData.image; // Remove image field for JSON requests
        
        const response = await this.apiCall(`/branches/${branchId}/menus/${menuId}/items/${itemId}`, {
          method: 'PUT', // Direct PUT for JSON
          body: JSON.stringify(jsonData)
        });
        
        return response.data;
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  }

  async deleteMenuItem(branchId, menuId, itemId) {
    try {
      const response = await this.apiCall(`/branches/${branchId}/menus/${menuId}/items/${itemId}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  }

  async toggleItemAvailability(branchId, menuId, itemId) {
    try {
      const response = await this.apiCall(`/branches/${branchId}/menus/${menuId}/items/${itemId}/toggle-availability`, {
        method: 'PATCH'
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling item availability:', error);
      throw error;
    }
  }

  // Helper methods
  getImageUrl(imagePath) {
    if (!imagePath) return `${this.baseUrl}/api/placeholder/150/150`;
    if (imagePath.startsWith('http')) return imagePath;
    return `${this.baseUrl}/storage/${imagePath}`;
  }

  formatPrice(price) {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  // Category helpers
  getMenuCategories() {
    return [
      'coffee', 'espresso', 'cappuccino', 'latte', 'macchiato',
      'tea', 'herbal_tea', 'chai',
      'cold_drinks', 'iced_coffee', 'frappuccino', 'smoothie',
      'pastry', 'croissant', 'muffin', 'cake', 'cookie',
      'sandwich', 'panini', 'salad', 'soup',
      'breakfast', 'lunch', 'snacks',
      'desserts', 'gelato',
      'specials', 'seasonal'
    ];
  }

  getCategoryLabel(category) {
    const labels = {
      'coffee': 'Caffè',
      'espresso': 'Espresso',
      'cappuccino': 'Cappuccino',
      'latte': 'Latte',
      'macchiato': 'Macchiato',
      'tea': 'Tè',
      'herbal_tea': 'Tisane',
      'chai': 'Chai',
      'cold_drinks': 'Bevande Fredde',
      'iced_coffee': 'Caffè Freddo',
      'frappuccino': 'Frappuccino',
      'smoothie': 'Smoothie',
      'pastry': 'Pasticceria',
      'croissant': 'Cornetti',
      'muffin': 'Muffin',
      'cake': 'Torte',
      'cookie': 'Biscotti',
      'sandwich': 'Sandwich',
      'panini': 'Panini',
      'salad': 'Insalate',
      'soup': 'Zuppe',
      'breakfast': 'Colazione',
      'lunch': 'Pranzo',
      'snacks': 'Snack',
      'desserts': 'Dessert',
      'gelato': 'Gelato',
      'specials': 'Specialità',
      'seasonal': 'Stagionali'
    };
    return labels[category] || category;
  }

  getMenuTypes() {
    return [
      { value: 'breakfast', label: 'Colazione' },
      { value: 'lunch', label: 'Pranzo' },
      { value: 'dinner', label: 'Cena' },
      { value: 'drinks', label: 'Bevande' },
      { value: 'desserts', label: 'Dessert' },
      { value: 'specials', label: 'Specialità' }
    ];
  }

  // Allergens list
  getAllergens() {
    return [
      'gluten', 'dairy', 'eggs', 'nuts', 'peanuts', 'soy', 
      'fish', 'shellfish', 'sesame', 'sulfites', 'celery', 'mustard'
    ];
  }

  getAllergenLabel(allergen) {
    const labels = {
      'gluten': 'Glutine',
      'dairy': 'Latticini',
      'eggs': 'Uova',
      'nuts': 'Frutta a guscio',
      'peanuts': 'Arachidi',
      'soy': 'Soia',
      'fish': 'Pesce',
      'shellfish': 'Crostacei',
      'sesame': 'Sesamo',
      'sulfites': 'Solfiti',
      'celery': 'Sedano',
      'mustard': 'Senape'
    };
    return labels[allergen] || allergen;
  }
}

const menuService = new MenuService();
export default menuService;
// src/services/adminSettingsService.js
import adminAuthService from './adminAuthService';

class AdminSettingsService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'https://api.qofferun.com';
    this.apiPrefix = '/api/admin-panel';
  }

  // Make API request with auth headers
  async apiRequest(endpoint, options = {}) {
    const token = adminAuthService.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseURL}${this.apiPrefix}${endpoint}`, config);
    
    if (response.status === 401) {
      adminAuthService.removeToken();
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  }

  // =====================================
  // SYSTEM SETTINGS (Full CRUD for Admin)
  // =====================================

  // Get all system settings
  async getSystemSettings(category = null) {
    try {
      let endpoint = '/settings';
      if (category) {
        endpoint += `?category=${encodeURIComponent(category)}`;
      }
      
      const response = await this.apiRequest(endpoint);
      
      // L'API restituisce dati raggruppati per categoria, dobbiamo appiattirli
      if (response.data && typeof response.data === 'object') {
        const allSettings = [];
        Object.values(response.data).forEach(categorySettings => {
          if (Array.isArray(categorySettings)) {
            allSettings.push(...categorySettings);
          }
        });
        return allSettings;
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Get system settings error:', error);
      throw error;
    }
  }

  // Get specific system setting by key
  async getSystemSetting(key) {
    try {
      const response = await this.apiRequest(`/settings/${key}`);
      return response.data;
    } catch (error) {
      console.error('Get system setting error:', error);
      throw error;
    }
  }

  // Create new system setting
  async createSystemSetting(settingData) {
    try {
      const response = await this.apiRequest('/settings', {
        method: 'POST',
        body: JSON.stringify(settingData),
      });
      return response.data;
    } catch (error) {
      console.error('Create system setting error:', error);
      throw error;
    }
  }

  // Update system setting
  async updateSystemSetting(key, settingData) {
    try {
      const response = await this.apiRequest(`/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify(settingData),
      });
      return response.data;
    } catch (error) {
      console.error('Update system setting error:', error);
      throw error;
    }
  }

  // Delete system setting
  async deleteSystemSetting(key) {
    try {
      const response = await this.apiRequest(`/settings/${key}`, {
        method: 'DELETE',
      });
      return response.data;
    } catch (error) {
      console.error('Delete system setting error:', error);
      throw error;
    }
  }

  // Batch update system settings
  async batchUpdateSystemSettings(settings) {
    try {
      const response = await this.apiRequest('/settings/batch', {
        method: 'POST',
        body: JSON.stringify({ settings }),
      });
      return response.data;
    } catch (error) {
      console.error('Batch update system settings error:', error);
      throw error;
    }
  }

  // =====================================
  // BAR SETTINGS (Full CRUD for Admin)
  // =====================================

  // Get all bar settings
  async getBarSettings(barId, category = null) {
    try {
      let endpoint = `/bars/${barId}/settings`;
      if (category) {
        endpoint += `?category=${encodeURIComponent(category)}`;
      }
      
      const response = await this.apiRequest(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get bar settings error:', error);
      throw error;
    }
  }

  // Get specific bar setting by key
  async getBarSetting(barId, key) {
    try {
      const response = await this.apiRequest(`/bars/${barId}/settings/${key}`);
      return response.data;
    } catch (error) {
      console.error('Get bar setting error:', error);
      throw error;
    }
  }

  // Create new bar setting
  async createBarSetting(barId, settingData) {
    try {
      const response = await this.apiRequest(`/bars/${barId}/settings`, {
        method: 'POST',
        body: JSON.stringify(settingData),
      });
      return response.data;
    } catch (error) {
      console.error('Create bar setting error:', error);
      throw error;
    }
  }

  // Update bar setting
  async updateBarSetting(barId, key, settingData) {
    try {
      const response = await this.apiRequest(`/bars/${barId}/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify(settingData),
      });
      return response.data;
    } catch (error) {
      console.error('Update bar setting error:', error);
      throw error;
    }
  }

  // Delete bar setting
  async deleteBarSetting(barId, key) {
    try {
      const response = await this.apiRequest(`/bars/${barId}/settings/${key}`, {
        method: 'DELETE',
      });
      return response.data;
    } catch (error) {
      console.error('Delete bar setting error:', error);
      throw error;
    }
  }

  // Batch update bar settings
  async batchUpdateBarSettings(barId, settings) {
    try {
      const response = await this.apiRequest(`/bars/${barId}/settings/batch`, {
        method: 'POST',
        body: JSON.stringify({ settings }),
      });
      return response.data;
    } catch (error) {
      console.error('Batch update bar settings error:', error);
      throw error;
    }
  }

  // Initialize default bar settings
  async initializeBarDefaults(barId) {
    try {
      const response = await this.apiRequest(`/bars/${barId}/settings/initialize`, {
        method: 'POST',
      });
      return response.data;
    } catch (error) {
      console.error('Initialize bar defaults error:', error);
      throw error;
    }
  }

  // =====================================
  // ADMIN-SPECIFIC BAR MANAGEMENT
  // =====================================

  // Get all bars (admin only)
  async getAllBars() {
    try {
      const response = await this.apiRequest('/bars');
      return response.data;
    } catch (error) {
      console.error('Get all bars error:', error);
      throw error;
    }
  }

  // Get all bars with their settings
  async getAllBarsWithSettings(category = null) {
    try {
      const bars = await this.getAllBars();
      const barsWithSettings = await Promise.all(
        bars.map(async (bar) => {
          try {
            const settings = await this.getBarSettings(bar.id, category);
            return { ...bar, settings };
          } catch (error) {
            console.error(`Error loading settings for bar ${bar.id}:`, error);
            return { ...bar, settings: [] };
          }
        })
      );
      return barsWithSettings;
    } catch (error) {
      console.error('Get all bars with settings error:', error);
      throw error;
    }
  }

  // =====================================
  // UTILITY METHODS
  // =====================================

  // Get complete settings overview (system + all bars)
  async getCompleteSettingsOverview(category = null) {
    try {
      const [systemSettings, barsWithSettings] = await Promise.all([
        this.getSystemSettings(category),
        this.getAllBarsWithSettings(category)
      ]);

      return {
        system: systemSettings,
        bars: barsWithSettings
      };
    } catch (error) {
      console.error('Get complete settings overview error:', error);
      throw error;
    }
  }

  // Update system settings object
  async updateSystemSettingsObject(settingsObject) {
    try {
      const settingsArray = Object.entries(settingsObject).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value)
      }));

      return await this.batchUpdateSystemSettings(settingsArray);
    } catch (error) {
      console.error('Update system settings object error:', error);
      throw error;
    }
  }

  // Update bar settings object
  async updateBarSettingsObject(barId, settingsObject) {
    try {
      const settingsArray = Object.entries(settingsObject).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value)
      }));

      return await this.batchUpdateBarSettings(barId, settingsArray);
    } catch (error) {
      console.error('Update bar settings object error:', error);
      throw error;
    }
  }

  // Mass initialize all bars with default settings
  async initializeAllBarsDefaults() {
    try {
      const bars = await this.getAllBars();
      const results = await Promise.all(
        bars.map(bar => this.initializeBarDefaults(bar.id))
      );
      return results;
    } catch (error) {
      console.error('Initialize all bars defaults error:', error);
      throw error;
    }
  }
}

export default new AdminSettingsService();
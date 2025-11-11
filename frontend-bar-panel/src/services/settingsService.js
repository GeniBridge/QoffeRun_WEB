// src/services/settingsService.js
import authService from './authService';

class SettingsService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'https://api.qofferun.com';
    this.apiPrefix = '/api/bar-panel';
  }

  // Make API request with auth headers
  async apiRequest(endpoint, options = {}) {
    const token = authService.getToken();
    
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
      authService.removeToken();
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
  // SYSTEM SETTINGS (Read Only for Bar)
  // =====================================

  // Get all system settings
  async getSystemSettings(category = null) {
    try {
      let endpoint = '/settings';
      if (category) {
        endpoint += `?category=${encodeURIComponent(category)}`;
      }
      
      const response = await this.apiRequest(endpoint);
      return response.data;
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

  // =====================================
  // BAR SETTINGS (Full CRUD for Bar)
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
  // UTILITY METHODS
  // =====================================

  // Get settings by category (system + bar combined)
  async getAllSettings(barId, category = null) {
    try {
      const [systemSettings, barSettings] = await Promise.all([
        this.getSystemSettings(category),
        this.getBarSettings(barId, category)
      ]);

      return {
        system: systemSettings,
        bar: barSettings
      };
    } catch (error) {
      console.error('Get all settings error:', error);
      throw error;
    }
  }

  // Update multiple bar settings at once
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
}

export default new SettingsService();
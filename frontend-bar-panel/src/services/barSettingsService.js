import authService from './authService';

class BarSettingsService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'https://api.qofferun.com';
  }

  async apiCall(endpoint, options = {}) {
    const token = authService.getToken();
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const response = await fetch(`${this.baseUrl}/api${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }
    
    return response.json();
  }

  // Get all settings for a branch
  async getSettings(branchId) {
    return await this.apiCall(`/bar/settings/${branchId}`);
  }

  // Get a specific setting
  async getSetting(branchId, key) {
    return await this.apiCall(`/bar/settings/${branchId}/${key}`);
  }

  // Update or create a setting
  async updateSetting(branchId, key, value, category = 'general', description = '') {
    return await this.apiCall(`/bar/settings/${branchId}`, {
      method: 'PUT',
      body: JSON.stringify({
        key,
        value,
        category,
        description
      })
    });
  }

  // Delete a setting
  async deleteSetting(branchId, key) {
    return await this.apiCall(`/bar/settings/${branchId}/${key}`, {
      method: 'DELETE'
    });
  }

  // Batch update settings
  async batchUpdate(branchId, settings) {
    return await this.apiCall(`/bar/settings/${branchId}/batch`, {
      method: 'POST',
      body: JSON.stringify({ settings })
    });
  }

  // Verify PIN
  async verifyPin(branchId, pin) {
    return await this.apiCall(`/bar/settings/${branchId}/verify-pin`, {
      method: 'POST',
      body: JSON.stringify({ pin })
    });
  }
}

export default new BarSettingsService();

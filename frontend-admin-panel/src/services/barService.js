// src/services/barService.js
import adminAuthService from './adminAuthService';

class BarService {
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

  // Get all bars
  async getBars() {
    try {
      const response = await this.apiRequest('/bars');
      return response.data || [];
    } catch (error) {
      console.error('Get bars error:', error);
      throw error;
    }
  }

  // Get single bar by ID
  async getBar(id) {
    try {
      const response = await this.apiRequest(`/bars/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get bar error:', error);
      throw error;
    }
  }

  // Create new bar
  async createBar(barData) {
    try {
      const response = await this.apiRequest('/bars', {
        method: 'POST',
        body: JSON.stringify(barData)
      });
      return response.data;
    } catch (error) {
      console.error('Create bar error:', error);
      throw error;
    }
  }

  // Update bar
  async updateBar(id, barData) {
    try {
      const response = await this.apiRequest(`/bars/${id}`, {
        method: 'PUT',
        body: JSON.stringify(barData)
      });
      return response.data;
    } catch (error) {
      console.error('Update bar error:', error);
      throw error;
    }
  }

  // Delete bar
  async deleteBar(id) {
    try {
      await this.apiRequest(`/bars/${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Delete bar error:', error);
      throw error;
    }
  }

  // Get bar statistics
  async getBarStats() {
    try {
      const response = await this.apiRequest('/bars/stats');
      return response.data;
    } catch (error) {
      console.error('Get bar stats error:', error);
      throw error;
    }
  }
}

const barService = new BarService();
export default barService;
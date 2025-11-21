// src/services/authService.js
class AuthService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'https://api.qofferun.com';
    this.apiPrefix = '/api/bar-panel';
  }

  // Get auth token from localStorage
  getToken() {
    return localStorage.getItem('auth_token');
  }

  // Set auth token in localStorage
  setToken(token) {
    localStorage.setItem('auth_token', token);
  }

  // Remove auth token from localStorage
  removeToken() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  }

  // Get user info from localStorage
  getUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  // Set user info in localStorage
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Make API request with auth headers
  async apiRequest(endpoint, options = {}) {
    const token = this.getToken();
    
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
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      this.removeToken();
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  }

  // Login user
  async login(email, password) {
    try {
      const response = await this.apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.access_token && response.user) {
        this.setToken(response.access_token);
        this.setUser(response.user);
        return response;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      const token = this.getToken();
      if (token) {
        await this.apiRequest('/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.removeToken();
    }
  }

  // Request password reset
  async forgotPassword(email) {
    try {
      const response = await this.apiRequest('/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  // Reset password with token
  async resetPassword(token, password, passwordConfirmation) {
    try {
      const response = await this.apiRequest('/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          email: '', // Will be extracted from token
          password,
          password_confirmation: passwordConfirmation,
        }),
      });
      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
}

export default new AuthService();
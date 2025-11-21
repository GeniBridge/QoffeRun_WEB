// src/services/branchService.js
import authService from './authService';

class BranchService {
  // Get branches accessible by current user
  async getUserBranches() {
    try {
      const response = await authService.apiRequest('/user/branches');
      // The API returns {branches: [...]} directly
      return response.branches || response.data || [];
    } catch (error) {
      console.error('Error fetching user branches:', error);
      throw error;
    }
  }

  // Get selected branch from localStorage
  getSelectedBranch() {
    const branchData = localStorage.getItem('selected_branch');
    return branchData ? JSON.parse(branchData) : null;
  }

  // Set selected branch in localStorage
  setSelectedBranch(branch) {
    localStorage.setItem('selected_branch', JSON.stringify(branch));
  }

  // Remove selected branch from localStorage
  removeSelectedBranch() {
    localStorage.removeItem('selected_branch');
  }

  // Check if user has valid role for bar panel access
  hasValidRole(user) {
    if (!user || !user.role) return false;
    
    const validRoles = ['barista', 'branch_manager', 'chain_owner'];
    return validRoles.includes(user.role);
  }

  // Get branch details by ID
  async getBranchDetails(branchId) {
    try {
      const response = await authService.apiRequest(`/branches/${branchId}`);
      return response.data || response.branch;
    } catch (error) {
      console.error('Error fetching branch details:', error);
      throw error;
    }
  }

  // Get branch statistics
  async getBranchStats(branchId) {
    try {
      const response = await authService.apiRequest(`/branches/${branchId}/stats`);
      return response.data || response.stats;
    } catch (error) {
      console.error('Error fetching branch stats:', error);
      throw error;
    }
  }
}

export { BranchService };
export default new BranchService();
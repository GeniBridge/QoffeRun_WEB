import authService from './authService';

class OrderService {
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

    const response = await fetch(`${this.baseUrl}/api/bar-panel${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }
    
    return response.json();
  }

  // Order management methods
  async getBranchOrders(branchId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);
      if (filters.payment_status) queryParams.append('payment_status', filters.payment_status);
      if (filters.per_page) queryParams.append('per_page', filters.per_page);
      
      const queryString = queryParams.toString();
      const endpoint = `/branches/${branchId}/orders${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.apiCall(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching branch orders:', error);
      throw error;
    }
  }

  async getOrder(branchId, orderId) {
    try {
      const response = await this.apiCall(`/branches/${branchId}/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async updateOrderStatus(branchId, orderId, status) {
    try {
      const response = await this.apiCall(`/branches/${branchId}/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async addOrderNotes(branchId, orderId, notes) {
    try {
      const response = await this.apiCall(`/branches/${branchId}/orders/${orderId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ notes })
      });
      return response.data;
    } catch (error) {
      console.error('Error adding order notes:', error);
      throw error;
    }
  }

  async getOrderPickupInfo(branchId, orderId) {
    try {
      const response = await this.apiCall(`/branches/${branchId}/orders/${orderId}/pickup-info`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pickup info:', error);
      throw error;
    }
  }

  async getOrderStats(branchId) {
    try {
      const response = await this.apiCall(`/branches/${branchId}/orders-stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw error;
    }
  }

  async getActiveOrders(branchId) {
    try {
      const response = await this.apiCall(`/branches/${branchId}/active-orders`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active orders:', error);
      throw error;
    }
  }

  // Utility methods
  formatOrderStatus(status) {
    const statusMap = {
      'pending': { text: 'In Attesa', class: 'warning', icon: 'clock' },
      'confirmed': { text: 'Confermato', class: 'info', icon: 'check-circle' },
      'ready': { text: 'Pronto', class: 'success', icon: 'check-square' },
      'completed': { text: 'Completato', class: 'secondary', icon: 'box-seam' },
      'cancelled': { text: 'Annullato', class: 'danger', icon: 'x-circle' }
    };
    
    return statusMap[status] || { text: status, class: 'secondary', icon: 'question' };
  }

  formatPaymentStatus(status) {
    const statusMap = {
      'paid': { text: 'Pagato', class: 'success', icon: 'credit-card' },
      'failed': { text: 'Fallito', class: 'danger', icon: 'exclamation-triangle' },
      'pending': { text: 'In Attesa', class: 'warning', icon: 'clock' },
      'refunded': { text: 'Rimborsato', class: 'info', icon: 'arrow-counterclockwise' }
    };
    
    return statusMap[status] || { text: status, class: 'secondary', icon: 'question' };
  }

  formatPrice(amount) {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatDateTime(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  formatTime(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getOrderStatusOptions() {
    return [
      { value: 'pending', label: 'In Attesa' },
      { value: 'confirmed', label: 'Confermato' },
      { value: 'ready', label: 'Pronto' },
      { value: 'completed', label: 'Completato' },
      { value: 'cancelled', label: 'Annullato' }
    ];
  }

  getValidNextStatuses(currentStatus) {
    const transitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['ready', 'cancelled'],
      'ready': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };
    
    return transitions[currentStatus] || [];
  }

  calculateEstimatedTime(order) {
    if (!order.items || order.items.length === 0) return null;
    
    const totalPrepTime = order.items.reduce((total, item) => {
      const prepTime = item.menuItem?.preparation_time || 10;
      return total + (prepTime * item.quantity);
    }, 0);
    
    const orderTime = new Date(order.created_at);
    const estimatedTime = new Date(orderTime.getTime() + totalPrepTime * 60000);
    
    return this.formatTime(estimatedTime);
  }

  isOrderOverdue(order) {
    if (['picked_up', 'delivered', 'cancelled'].includes(order.status)) {
      return false;
    }
    
    const estimatedTime = this.calculateEstimatedTime(order);
    if (!estimatedTime) return false;
    
    const now = new Date();
    const [hours, minutes] = estimatedTime.split(':').map(Number);
    const estimatedDate = new Date(order.created_at);
    estimatedDate.setHours(hours, minutes, 0, 0);
    
    return now > estimatedDate;
  }

  getOrderTypeLabel(orderType) {
    const types = {
      'takeaway': 'Da Asporto',
      'delivery': 'Consegna',
      'table_service': 'Servizio al Tavolo'
    };
    return types[orderType] || orderType;
  }
}

const orderService = new OrderService();
export default orderService;
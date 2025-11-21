import { api } from './client'

// AUTH
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) => api.post('/register', data),
  login: (data: { email: string; password: string }) => api.post('/login', data),
  socialLogin: (data: { provider: 'google' | 'apple'; token: string }) => api.post('/auth/social-login', data),
  forgotPassword: (data: { email: string }) => api.post('/auth/forgot-password', data),
  resetPassword: (data: { email: string; token: string; password: string }) => api.post('/auth/reset-password', data),
  me: () => api.get('/me'),
}

// PUBLIC BRANCH DISCOVERY
export const discoveryAPI = {
  listPublicBranches: (params?: { eligible?: boolean }) => api.get('/public/branches', { params }),
  searchBranches: (params: { query?: string; lat?: number; lng?: number; radius?: number }) => api.get('/public/branches/search', { params }),
  getPublicBranch: (branchId: number) => api.get(`/public/branches/${branchId}`),
}

// CUSTOMER BROWSING & MENU
export const customerAPI = {
  getOrderingBranches: () => api.get('/customer/branches'),
  getBranchMenu: (branchId: number) => api.get(`/customer/branches/${branchId}/menu`),
  getMenuItem: (itemId: number) => api.get(`/customer/menu-items/${itemId}`),
}

// CART
export const cartAPI = {
  getCart: () => api.get('/customer/cart'),
  addItem: (data: { menu_item_id: number; quantity: number; customizations?: any }) => api.post('/customer/cart/add', data),
  updateItem: (cartItemId: number, data: { quantity?: number; customizations?: any }) => api.put(`/customer/cart/items/${cartItemId}`, data),
  removeItem: (cartItemId: number) => api.delete(`/customer/cart/items/${cartItemId}`),
  clear: () => api.delete('/customer/cart/clear'),
  checkout: (data: { guest_id: string; customer_name: string; customer_email: string; items: { menu_item_id: number; quantity: number; extras?: number[] }[]; payment_method_id?: string; notes?: string }) => api.post('/customer/orders', data),
}

// ORDERS
export const ordersAPI = {
  createOrder: (data: { guest_id: string; customer_name: string; customer_email: string; customer_phone?: string; payment_method_id: string; notes?: string }) => api.post('/customer/orders', data),
  createDirectOrder: (data: { branch_id: number; items: { menu_item_id: number; quantity: number; extras?: number[] }[]; customer_name: string; customer_email: string; customer_phone?: string; payment_method_id: string; notes?: string }) => api.post('/customer/orders/direct', data),
  getOrder: (orderId: number) => api.get(`/customer/orders/${orderId}`),
  myOrders: (params?: { status?: string; per_page?: number }) => api.get('/orders', { params }),
}

// REVIEWS
export const reviewsAPI = {
  create: (branchId: number, data: { rating: number; comment?: string }) => api.post(`/branches/${branchId}/reviews`, data),
}

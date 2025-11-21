import axios from 'axios';

// Configurazione base API con normalizzazione del path /api/v1
const RAW_API_BASE = import.meta.env.VITE_API_URL || 'https://api.qofferun.com';
const API_BASE_URL = RAW_API_BASE.endsWith('/api/v1')
  ? RAW_API_BASE
  : `${RAW_API_BASE.replace(/\/+$/, '')}/api/v1`;

// Crea istanza axios con configurazione base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor per aggiungere automaticamente il token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('qofferun_token') || localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor per gestire errori di autenticazione
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('qofferun_token');
      localStorage.removeItem('qofferun_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// AUTH API
export const authAPI = {
  login: (credentials) => api.post('/api/v1/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// CHAINS API
export const chainsAPI = {
  list: (params) => api.get('/chains', { params }),
  create: (data) => api.post('/chains', data),
  get: (id) => api.get(`/chains/${id}`),
  update: (id, data) => api.put(`/chains/${id}`, data),
  delete: (id) => api.delete(`/chains/${id}`),
};

// BRANCHES API
export const branchesAPI = {
  list: (params) => api.get('/branches', { params }),
  create: (data) => api.post('/branches', data),
  get: (id) => api.get(`/branches/${id}`),
  update: (id, data) => api.put(`/branches/${id}`, data),
  delete: (id) => api.delete(`/branches/${id}`),
  clone: (id, data) => api.post(`/branches/${id}/clone`, data),
  stats: (id) => api.get(`/branches/${id}/stats`),
  updateStatus: (id, status) => api.patch(`/branches/${id}/status`, { status }),
  // Overview endpoint (baseURL already includes /api/v1)
  overview: (id) => api.get(`/branches/${id}/overview`),
  // Orders endpoints
  orders: (id, params) => api.get(`/branches/${id}/orders`, { params }),
  orderDetails: (id, orderId) => api.get(`/branches/${id}/orders/${orderId}`),
  orderStats: (id) => api.get(`/branches/${id}/orders-stats`),
};

// BRANCH MANAGERS API
export const managersAPI = {
  list: (params) => api.get('/branch-managers', { params }),
  create: (data) => api.post('/branch-managers', data),
  get: (id) => api.get(`/branch-managers/${id}`),
  update: (id, data) => api.put(`/branch-managers/${id}`, data),
  delete: (id) => api.delete(`/branch-managers/${id}`),
  updateStatus: (id, status) => api.patch(`/branch-managers/${id}/status`, { status }),
  availableManagers: (search) => api.get('/available-managers', { params: { search } }),
};

// ORDERS API (da implementare nel backend)
export const ordersAPI = {
  list: (params) => api.get('/orders', { params }),
  get: (id) => api.get(`/orders/${id}`),
  update: (id, data) => api.put(`/orders/${id}`, data),
  stats: (params) => api.get('/orders/stats', { params }),
};

// PAYMENTS API (da implementare nel backend)
export const paymentsAPI = {
  list: (params) => api.get('/payments', { params }),
  stats: (params) => api.get('/payments/stats', { params }),
  transactions: (params) => api.get('/payments/transactions', { params }),
};

// PRODUCTS API (da implementare nel backend)
export const productsAPI = {
  list: (params) => api.get('/products', { params }),
  create: (data) => api.post('/products', data),
  get: (id) => api.get(`/products/${id}`),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// REVIEWS API (da implementare nel backend)
export const reviewsAPI = {
  list: (params) => api.get('/reviews', { params }),
  get: (id) => api.get(`/reviews/${id}`),
  respond: (id, response) => api.post(`/reviews/${id}/respond`, response),
  stats: (params) => api.get('/reviews/stats', { params }),
};

export default api;
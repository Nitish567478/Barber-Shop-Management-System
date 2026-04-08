import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: async (userData) => api.post('/auth/register', userData),
  login: async (credentials) => api.post('/auth/login', credentials),
  getProfile: async () => api.get('/auth/profile'),
  updateProfile: async (data) => api.put('/auth/profile', data),
};

export const servicesAPI = {
  getAll: async (params) => api.get('/services', { params }),
  getMine: async () => api.get('/services/me/mine'),
  getById: async (id) => api.get(`/services/${id}`),
  create: async (data) => api.post('/services', data),
  update: async (id, data) => api.put(`/services/${id}`, data),
  delete: async (id) => api.delete(`/services/${id}`),
};

export const barbersAPI = {
  getAll: async () => api.get('/barbers'),
  getMine: async () => api.get('/barbers/me/profile'),
  getById: async (id) => api.get(`/barbers/${id}`),
  getAvailability: async (id) => api.get(`/barbers/${id}/availability`),
  getPending: async () => api.get('/barbers/admin/pending'),
  add: async (data) => api.post('/barbers', data),
  update: async (id, data) => api.put(`/barbers/${id}`, data),
  updateMine: async (data) => api.put('/barbers/me/profile', data),
  approve: async (id) => api.put(`/barbers/admin/${id}/approve`),
  reject: async (id) => api.delete(`/barbers/admin/${id}/reject`),
};

export const appointmentsAPI = {
  getAll: async () => api.get('/appointments'),
  getUserAppointments: async () => api.get('/appointments/my-appointments'),
  getBarberBookings: async () => api.get('/appointments/barber/my-bookings'),
  getById: async (id) => api.get(`/appointments/${id}`),
  create: async (data) => api.post('/appointments', data),
  update: async (id, data) => api.put(`/appointments/${id}`, data),
  updateBarberBooking: async (id, data) => api.put(`/appointments/barber/${id}`, data),
  cancel: async (id) => api.delete(`/appointments/${id}`),
};

export const invoicesAPI = {
  getAll: async () => api.get('/invoices'),
  getUserInvoices: async () => api.get('/invoices/my-invoices'),
  getById: async (id) => api.get(`/invoices/${id}`),
  create: async (data) => api.post('/invoices', data),
  updatePaymentStatus: async (id, data) => api.put(`/invoices/${id}`, data),
  getRevenueStats: async () => api.get('/invoices/stats/revenue'),
};

export default api;

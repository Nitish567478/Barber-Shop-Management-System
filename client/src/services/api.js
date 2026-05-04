import axios from 'axios';

const API_BASE_URL =
   'https://barber-shop-management-system-1.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

/* Attach Token */
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('token') ||
      sessionStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   AUTH API
========================= */
export const authAPI = {
  register: async (userData) =>
    api.post('/auth/register', userData),

  login: async (credentials) =>
    api.post('/auth/login', credentials),

  forgotPassword: async (data) =>
    api.post('/auth/forgot-password', data),

  resetPassword: async (token, data) =>
    api.post(`/auth/reset-password/${token}`, data),

  getProfile: async () =>
    api.get('/auth/profile'),

  updateProfile: async (data) =>
    api.put('/auth/profile', data),
};

/* =========================
   SERVICES API
========================= */
export const servicesAPI = {
  getAll: async (params) =>
    api.get('/services', { params }),

  getMine: async () =>
    api.get('/services/me/mine'),

  getById: async (id) =>
    api.get(`/services/${id}`),

  create: async (data) =>
    api.post('/services', data),

  update: async (id, data) =>
    api.put(`/services/${id}`, data),

  delete: async (id) =>
    api.delete(`/services/${id}`),
};

/* =========================
   BARBERS API
========================= */
export const barbersAPI = {
  getAll: async () =>
    api.get('/barbers'),

  getMine: async () =>
    api.get('/barbers/me/profile'),

  getById: async (id) =>
    api.get(`/barbers/${id}`),

  getAvailability: async (id) =>
    api.get(`/barbers/${id}/availability`),

  getPending: async () =>
    api.get('/barbers/admin/pending'),

  getAdminAll: async () =>
    api.get('/barbers/admin/all'),

  add: async (data) =>
    api.post('/barbers', data),

  update: async (id, data) =>
    api.put(`/barbers/${id}`, data),

  updateMine: async (data) =>
    api.put('/barbers/me/profile', data),

  submitListing: async () =>
    api.post('/barbers/me/submit-listing'),

  approve: async (id) =>
    api.put(`/barbers/admin/${id}/approve`),

  reject: async (id) =>
    api.delete(`/barbers/admin/${id}/reject`),
};

/* =========================
   APPOINTMENTS API
========================= */
export const appointmentsAPI = {
  getAll: async () =>
    api.get('/appointments'),

  getUserAppointments: async () =>
    api.get('/appointments/my-appointments'),

  getBarberBookings: async () =>
    api.get('/appointments/barber/my-bookings'),

  getById: async (id) =>
    api.get(`/appointments/${id}`),

  create: async (data) =>
    api.post('/appointments', data),

  update: async (id, data) =>
    api.put(`/appointments/${id}`, data),

  updateBarberBooking: async (id, data) =>
    api.put(`/appointments/barber/${id}`, data),

  submitFeedback: async (id, data) =>
    api.post(`/appointments/${id}/feedback`, data),

  cancel: async (id) =>
    api.delete(`/appointments/${id}`),
};

/* =========================
   REPORTS API
========================= */
export const reportsAPI = {
  create: async (data) =>
    api.post('/reports', data),

  getAdminReports: async () =>
    api.get('/reports/admin'),

  verify: async (id, data) =>
    api.put(`/reports/admin/${id}/verify`, data),
};

/* =========================
   COUPONS API
========================= */
export const couponsAPI = {
  getMyVouchers: async () =>
    api.get('/coupons/my-vouchers'),

  getBarberCoupons: async () =>
    api.get('/coupons/barber'),

  getRegularCustomers: async () =>
    api.get('/coupons/barber/regular-customers'),

  create: async (data) =>
    api.post('/coupons/barber', data),

  update: async (id, data) =>
    api.put(`/coupons/barber/${id}`, data),
};

/* =========================
   INVOICES API
========================= */
export const invoicesAPI = {
  getAll: async () =>
    api.get('/invoices'),

  getUserInvoices: async () =>
    api.get('/invoices/my-invoices'),

  getById: async (id) =>
    api.get(`/invoices/${id}`),

  create: async (data) =>
    api.post('/invoices', data),

  updatePaymentStatus: async (id, data) =>
    api.put(`/invoices/${id}`, data),

  getRevenueStats: async () =>
    api.get('/invoices/stats/revenue'),
};

/* =========================
   USERS API
========================= */
export const usersAPI = {
  getAll: async () =>
    api.get('/users'),

  getById: async (id) =>
    api.get(`/users/${id}`),

  create: async (data) =>
    api.post('/users', data),

  update: async (id, data) =>
    api.put(`/users/${id}`, data),

  delete: async (id) =>
    api.delete(`/users/${id}`),
};

/* =========================
   CUSTOMERS API
========================= */
export const customersAPI = {
  getAll: async () =>
    api.get('/customers'),

  getStats: async () =>
    api.get('/customers/stats'),

  getById: async (id) =>
    api.get(`/customers/${id}`),

  create: async (data) =>
    api.post('/customers', data),

  update: async (id, data) =>
    api.put(`/customers/${id}`, data),

  delete: async (id) =>
    api.delete(`/customers/${id}`),
};

/* =========================
   NOTIFICATIONS API
========================= */
export const notificationsAPI = {
  getAll: async () =>
    api.get('/notifications'),

  getRecent: async (limit = 10) =>
    api.get('/notifications/recent', { params: { limit } }),

  getById: async (id) =>
    api.get(`/notifications/${id}`),

  markAsRead: async (id) =>
    api.put(`/notifications/${id}/read`),

  markAllAsRead: async () =>
    api.put('/notifications/read-all'),

  delete: async (id) =>
    api.delete(`/notifications/${id}`),

  deleteAll: async () =>
    api.delete('/notifications'),
};

/* =========================
   DEFAULT EXPORT
========================= */
export default api;

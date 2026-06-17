import axios from 'axios';
import Cookies from 'js-cookie';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

API.interceptors.request.use((config) => {
  const token = Cookies.get('jimat_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove('jimat_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const changePassword = (data) => API.put('/auth/change-password', data);
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);

// Bill
export const saveAppliances = (data) => API.post('/bill/appliances', data);
export const getChainInfo = () => API.get('/bill/chain');

// Scan only — OCR fires, returns extracted values, NO DB save
export const scanBills = (formData) => API.post('/bill/scan', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Confirm — user verified values, save to DB, generate analysis
export const confirmBills = (data) => API.post('/bill/confirm', data);

// Keep uploadBills for any legacy references
export const uploadBills = scanBills;

export const getBillingHistory = () => API.get('/bill/history');

// Payment
export const createPayment = (data) => API.post('/payment/create', data);
export const checkPaymentStatus = (recordId) => API.get(`/payment/status/${recordId}`);

// Report
export const getTeaser = (recordId) => API.get(`/report/teaser/${recordId}`);
export const getReport = (recordId) => API.get(`/report/${recordId}`);

// Admin
export const adminLogin = (data) => API.post('/admin/login', data);
export const getDashboardStats = () => API.get('/admin/dashboard');
export const getAllUsers = () => API.get('/admin/users');
export const toggleUserStatus = (userId) => API.put(`/admin/users/${userId}/toggle`);
export const updateAfaRate = (data) => API.post('/admin/afa', data);
export const getAfaRates = () => API.get('/admin/afa');

export default API;
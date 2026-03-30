import axios from 'axios';

const API = axios.create({ baseURL: 'https://vendorpro-backend.onrender.com/api' });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data || err);
  }
);

export const auth = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  me: () => API.get('/auth/me'),
};

export const vendors = {
  list: (params) => API.get('/vendors', { params }),
  get: (id) => API.get(`/vendors/${id}`),
  create: (data) => API.post('/vendors', data),
  update: (id, data) => API.put(`/vendors/${id}`, data),
  approve: (id) => API.post(`/vendors/${id}/approve`),
  blacklist: (id, data) => API.post(`/vendors/${id}/blacklist`, data),
  evaluate: (id, data) => API.post(`/vendors/${id}/evaluate`, data),
  stats: () => API.get('/vendors/stats'),
};

export const rfqs = {
  list: (params) => API.get('/rfqs', { params }),
  get: (id) => API.get(`/rfqs/${id}`),
  create: (data) => API.post('/rfqs', data),
  send: (id, data) => API.post(`/rfqs/${id}/send`, data),
  close: (id) => API.post(`/rfqs/${id}/close`),
  compare: (rfqId) => API.get(`/rfqs/${rfqId}/compare`),
};

export const quotations = {
  list: (params) => API.get('/quotations', { params }),
  submit: (data) => API.post('/quotations', data),
  accept: (id) => API.post(`/quotations/${id}/accept`),
  negotiations: (quotationId) => API.get(`/quotations/${quotationId}/negotiations`),
  addNegotiation: (data) => API.post('/negotiations', data),
};

export const purchaseOrders = {
  list: (params) => API.get('/purchase-orders', { params }),
  get: (id) => API.get(`/purchase-orders/${id}`),
  create: (data) => API.post('/purchase-orders', data),
  approve: (id) => API.post(`/purchase-orders/${id}/approve`),
  updateStatus: (id, data) => API.patch(`/purchase-orders/${id}/status`, data),
  stats: () => API.get('/purchase-orders/stats'),
};

export const invoices = {
  list: (params) => API.get('/invoices', { params }),
  get: (id) => API.get(`/invoices/${id}`),
  create: (data) => API.post('/invoices', data),
  approve: (id) => API.post(`/invoices/${id}/approve`),
  schedulePayment: (id, data) => API.post(`/invoices/${id}/payment`, data),
  stats: () => API.get('/invoices/stats'),
};

export const inventory = {
  list: (params) => API.get('/inventory', { params }),
  receive: (data) => API.post('/inventory/receive', data),
  qualityCheck: (receiptId, data) => API.post(`/inventory/quality-check/${receiptId}`, data),
  processReturn: (data) => API.post('/inventory/return', data),
  receipts: () => API.get('/inventory/receipts'),
};

export const dashboard = {
  get: () => API.get('/dashboard'),
};

export default API;

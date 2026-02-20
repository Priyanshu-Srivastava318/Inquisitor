import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('inquisitor_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('inquisitor_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

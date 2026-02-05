import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  // или через env:
  // baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
});

// добавляем токен из localStorage в Authorization
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

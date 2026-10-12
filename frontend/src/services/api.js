import axios from 'axios';

const DEFAULT_BACKEND_URL = 'https://foresafe-backend.onrender.com/api';

export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    let clean = envUrl.trim().replace(/\/+$/, '');
    if (!clean.endsWith('/api') && !clean.includes('/api/')) {
      clean += '/api';
    }
    return clean;
  }
  return DEFAULT_BACKEND_URL;
};

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token and Current baseURL
api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    const token = localStorage.getItem('access_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Refresh Token & Network Errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const currentBaseUrl = getApiBaseUrl();
    
    // Detailed message for network disconnection
    if (!error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      const detailedMsg = `Network Error: Cannot connect to ForeSafe backend at ${currentBaseUrl}. Please verify your internet connection.`;
      if (!error.response) {
        error.response = {
          data: { detail: detailedMsg }
        };
      }
      error.message = detailedMsg;
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          const res = await axios.post(`${currentBaseUrl}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          if (res.data.access_token) {
            localStorage.setItem('access_token', res.data.access_token);
            if (res.data.refresh_token) {
              localStorage.setItem('refresh_token', res.data.refresh_token);
            }
            originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// src/utils/axiosInterceptor.ts
import axios from 'axios';
import { TokenService } from '../services/tokenService';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = TokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is due to unauthorized (likely expired token) and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshSuccess = await TokenService.refreshToken();
        if (refreshSuccess) {
          const newToken = TokenService.getAccessToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        TokenService.clearTokens();
        window.location.href = '/admin/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);
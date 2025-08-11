// src/services/tokenService.ts
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiration

interface TokenPayload {
  exp: number;
  // other token payload properties
}

let refreshTimeout: NodeJS.Timeout | null = null;

export const TokenService = {
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },

  setTokens: (access: string, refresh: string): void => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  },

  clearTokens: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
      refreshTimeout = null;
    }
  },

  isAccessTokenValid: (): boolean => {
    const token = TokenService.getAccessToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },

  scheduleTokenRefresh: (): void => {
    const refreshToken = TokenService.getRefreshToken();
    const accessToken = TokenService.getAccessToken();

    if (!refreshToken || !accessToken) return;

    // Clear any existing timeout
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }

    try {
      const decoded = jwtDecode<TokenPayload>(accessToken);
      const expiresAt = decoded.exp * 1000;
      const now = Date.now();
      const timeUntilRefresh = expiresAt - now - REFRESH_THRESHOLD;

      if (timeUntilRefresh > 0) {
        refreshTimeout = setTimeout(() => {
          TokenService.refreshToken();
        }, timeUntilRefresh);
      } else {
        // Token is already expired or about to expire, refresh immediately
        TokenService.refreshToken();
      }
    } catch (error) {
      console.error('Error scheduling token refresh:', error);
    }
  },

  refreshToken: async (): Promise<boolean> => {
    const refreshToken = TokenService.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/accounts/token/refresh/`,
        { refresh: refreshToken }
      );

      const { access } = response.data;
      TokenService.setTokens(access, refreshToken);
      TokenService.scheduleTokenRefresh();
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, try again after 1 minute
      setTimeout(() => {
        TokenService.refreshToken();
      }, 60000);
      return false;
    }
  },

   getUserRole: (): string | null => {
    const userData = localStorage.getItem('userData');
    if (!userData) return null;
    
    try {
      const parsed = JSON.parse(userData);
      return parsed.role || null;
    } catch {
      return null;
    }
  },

  hasRole: (requiredRole: string): boolean => {
    const userRole = TokenService.getUserRole();
    return userRole === requiredRole;
  }
};
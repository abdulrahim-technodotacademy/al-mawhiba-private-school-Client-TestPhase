// src/utils/authUtils.ts
import { TokenService } from '../services/tokenService';

export const logout = () => {
  TokenService.clearTokens();
  window.location.href = '/admin/login';
};
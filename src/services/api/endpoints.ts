import { API_ENDPOINTS } from '@/config/constants';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types/auth';
import apiClient from './client';

export const authEndpoints = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>(API_ENDPOINTS.LOGIN, data),

  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>(API_ENDPOINTS.REGISTER, data),

  logout: () =>
    apiClient.post(API_ENDPOINTS.LOGOUT),

  getProfile: () =>
    apiClient.get<User>(API_ENDPOINTS.USER_PROFILE),

  refreshToken: (refresh: string) =>
    apiClient.post(API_ENDPOINTS.REFRESH_TOKEN, { refresh })
};
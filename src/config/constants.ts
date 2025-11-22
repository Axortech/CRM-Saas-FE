export const API_TIMEOUT = 30000; // 30 seconds

export const AUTH_STORAGE_KEY = 'crm_auth_token';
export const USER_STORAGE_KEY = 'crm_user';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  HOME: '/',
} as const;

export const API_ENDPOINTS = {
  LOGIN: '/v1/auth/login/',
  REGISTER: '/v1/auth/register/',
  LOGOUT: '/v1/auth/logout/',
  REFRESH_TOKEN: '/v1/auth/refresh/',
  USER_PROFILE: '/v1/auth/users/me/',
} as const;
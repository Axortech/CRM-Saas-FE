import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_TIMEOUT } from '@/config/constants';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Check if we're running in frontend-only mode (no backend)
export const isFrontendOnlyMode = !API_BASE_URL || API_BASE_URL === '';

if (isFrontendOnlyMode && typeof window !== 'undefined') {
  console.warn('⚠️ Running in frontend-only mode. No backend API configured.');
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:8000', // Fallback URL (won't be used in frontend-only mode)
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // In frontend-only mode, don't try to refresh tokens or redirect
    if (isFrontendOnlyMode) {
      console.warn('API call failed in frontend-only mode:', error.message);
      return Promise.reject(error);
    }

    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log('🔄 Got 401, attempting token refresh...');

      try {
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
          console.error('❌ No refresh token available');
          throw new Error('No refresh token available');
        }

        console.log('🔑 Refresh token found, calling refresh endpoint...');
        const response = await axios.post(`${API_BASE_URL}/v1/auth/refresh/`, {
          refresh: refreshToken,
        });

        console.log('✅ Token refresh successful');
        localStorage.setItem('access_token', response.data.access);
        apiClient.defaults.headers.Authorization = `Bearer ${response.data.access}`;
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

        return apiClient(originalRequest);
      } catch (refreshError: any) {
        console.error('❌ Token refresh failed:', refreshError.response?.data || refreshError.message);

        // Only redirect to login if refresh fails
        if (typeof window !== 'undefined') {
          console.log('🔒 Clearing auth and redirecting to login...');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');

          // Add a small delay to allow console logs to be visible
          setTimeout(() => {
            window.location.href = '/login';
          }, 500);
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
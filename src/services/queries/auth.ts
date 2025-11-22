import { useMutation, useQuery, UseQueryResult } from 'react-query';
import { AxiosError } from 'axios';
import { authEndpoints } from '@/services/api/endpoints';
import { isFrontendOnlyMode } from '@/services/api/client';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  AuthError
} from '@/types/auth';
import { useAuthStore } from '@/store/authStore';

// Helper to generate mock tokens for frontend-only mode
const generateMockToken = () => {
  return 'mock_token_' + Math.random().toString(36).substring(7);
};

// Helper to create mock user from login data
const createMockUser = (email: string, firstName?: string, lastName?: string): User => {
  return {
    id: Math.floor(Math.random() * 10000),
    email,
    first_name: firstName || email.split('@')[0],
    last_name: lastName || 'User',
    is_active: true,
    created_at: new Date().toISOString(),
  };
};

// Login Mutation
export const useLoginMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<AuthResponse, AxiosError<AuthError>, LoginRequest>(
    async (data) => {
      // Frontend-only mode: generate mock data
      if (isFrontendOnlyMode) {
        const mockUser = createMockUser(data.email);
        return {
          access: generateMockToken(),
          refresh: generateMockToken(),
          user: mockUser,
        };
      }

      // Backend mode: make actual API call
      const response = await authEndpoints.login(data);
      console.log('🔐 Login API full response:', response.data);

      // Extract from nested data structure
      const responseData = (response.data as any);
      const authData = {
        access: responseData.data?.access || responseData.access,
        refresh: responseData.data?.refresh || responseData.refresh,
        user: responseData.data?.user || responseData.user,
      };

      console.log('📦 Extracted auth data:', authData);
      return authData as AuthResponse;
    },
    {
      onSuccess: (data) => {
        console.log('✅ Login successful! Data:', data);
        console.log('📝 Access token:', data.access?.substring(0, 30) + '...');
        console.log('📝 Refresh token:', data.refresh?.substring(0, 30) + '...');
        console.log('👤 User:', data.user);

        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        setAuth(data.access, data.refresh);
        setUser(data.user);

        console.log('💾 Tokens saved to localStorage and store');
      },
      onError: (error) => {
        console.error('❌ Login failed:', error.response?.data);
      },
    }
  );
};

// Register Mutation
export const useRegisterMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<AuthResponse, AxiosError<AuthError>, RegisterRequest>(
    async (data) => {
      // Frontend-only mode: generate mock data
      if (isFrontendOnlyMode) {
        const mockUser = createMockUser(data.email, data.first_name, data.last_name);
        return {
          access: generateMockToken(),
          refresh: generateMockToken(),
          user: mockUser,
        };
      }

      // Backend mode: make actual API call
      const response = await authEndpoints.register(data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        setAuth(data.access, data.refresh);
        setUser(data.user);
      },
      onError: (error) => {
        console.error('Registration failed:', error.response?.data);
      },
    }
  );
};

// Get Profile Query
export const useProfileQuery = (): UseQueryResult<User> => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery<User>(
    ['profile'],
    async () => {
      // In frontend-only mode, return user from localStorage
      if (isFrontendOnlyMode) {
        const userData = localStorage.getItem('user_data');
        if (userData) {
          return JSON.parse(userData);
        }
        throw new Error('No user data available');
      }

      // Backend mode: fetch from API
      console.log('Fetching profile with token:', accessToken?.substring(0, 20) + '...');
      const response = await authEndpoints.getProfile();
      console.log('Profile full response:', response.data);

      // Extract from nested data structure
      const responseData = (response.data as any);
      const userData = responseData.data || responseData; // Extract from data.data or data
      console.log('Extracted user data:', userData);
      return userData;
    },
    {
      enabled: isAuthenticated && !!accessToken, // Only fetch when authenticated and have token
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: isFrontendOnlyMode ? 0 : 1, // Don't retry in frontend-only mode
      onError: (error: any) => {
        console.error('Profile query error:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
      },
    }
  );
};

// Logout Mutation
export const useLogoutMutation = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation(
    async () => {
      // In frontend-only mode, just clear local storage
      if (isFrontendOnlyMode) {
        return Promise.resolve();
      }

      // Backend mode: call logout endpoint
      await authEndpoints.logout();
    },
    {
      onSuccess: () => {
        clearAuth();
      },
      onError: (error) => {
        // Even if API call fails, still clear local auth
        console.error('Logout API call failed, but clearing local auth anyway:', error);
        clearAuth();
      },
    }
  );
};

import { useAuthStore as useStore } from '@/store/authStore';

export const useAuthStore = () => {
  return useStore();
};
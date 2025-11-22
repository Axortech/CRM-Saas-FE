import { AxiosError } from 'axios';
import { message } from 'antd';

interface UseApiCallOptions {
  showSuccessMessage?: boolean;
  showErrorMessage?: boolean;
  successMessage?: string;
}

export const useApiCall = (options: UseApiCallOptions = {}) => {
  const {
    showSuccessMessage = true,
    showErrorMessage = true,
    successMessage = 'Operation successful',
  } = options;

  const handleSuccess = (data: any) => {
    if (showSuccessMessage) {
      message.success(successMessage);
    }
    return data;
  };

  const handleError = (error: AxiosError<any>) => {
    if (showErrorMessage) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Something went wrong';
      message.error(errorMessage);
    }
    throw error;
  };

  return { handleSuccess, handleError };
};
import { AxiosError } from 'axios';

export const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const getFieldErrors = (error: AxiosError<any>): Record<string, string> => {
  const errors: Record<string, string> = {};
  const data = error.response?.data;

  if (data) {
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (Array.isArray(value)) {
        errors[key] = value[0];
      } else if (typeof value === 'string') {
        errors[key] = value;
      }
    });
  }

  return errors;
};

export const classNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};  
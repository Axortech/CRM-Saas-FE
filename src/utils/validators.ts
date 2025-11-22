export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validators = {
  email: (email: string): boolean => {
    return emailRegex.test(email);
  },

  password: (password: string): boolean => {
    return password.length >= 8;
  },

  required: (value: string | number): boolean => {
    return value !== null && value !== undefined && value !== '';
  },

  minLength: (value: string, length: number): boolean => {
    return value.length >= length;
  },

  maxLength: (value: string, length: number): boolean => {
    return value.length <= length;
  },
};
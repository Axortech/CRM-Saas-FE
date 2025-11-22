export interface Notification {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface FormFieldError {
  [key: string]: string | string[];
}
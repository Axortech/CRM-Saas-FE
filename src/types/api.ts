export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: boolean;
}

export interface ApiError {
  response?: {
    data: Record<string, any>;
    status: number;
  };
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
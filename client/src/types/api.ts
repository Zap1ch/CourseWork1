export interface ApiMessageResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

export interface ApiErrorResponse {
  error?: string;
  message?: string;
}
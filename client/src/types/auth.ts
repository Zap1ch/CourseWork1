export interface AuthUser {
  id?: number;
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success?: boolean;
  token: string;
  message?: string;
  error?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  error?: string;
}
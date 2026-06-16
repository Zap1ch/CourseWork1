import { apiRequest } from "./api";
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
} from "../types/auth";

export function loginUser(payload: LoginPayload) {
  return apiRequest<LoginResponse>("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function registerUser(payload: RegisterPayload) {
  return apiRequest<RegisterResponse>("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
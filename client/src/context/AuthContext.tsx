import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { loginUser, registerUser } from "../services/authService";
import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
} from "../types/auth";

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(atob(normalizedPayload));

    return {
      id: decodedPayload.id,
      email: decodedPayload.email || "User",
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedToken = localStorage.getItem("token");
    return savedToken ? decodeJwtPayload(savedToken) : null;
  });

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    setUser(decodeJwtPayload(token));
  }, [token]);

  async function login(payload: LoginPayload) {
    const response = await loginUser(payload);

    if (!response.token) {
      throw new Error(response.message || "Login failed");
    }

    localStorage.setItem("token", response.token);
    setToken(response.token);
    setUser(decodeJwtPayload(response.token));
  }

  async function register(payload: RegisterPayload) {
    return registerUser(payload);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
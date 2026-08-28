"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api } from "@/lib/api";
import type { User, LoginCredentials, RegisterData } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "arch3d_access_token";
const REFRESH_KEY = "arch3d_refresh_token";

function saveTokens(access: string, refresh: string) {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

function getStoredTokens() {
  if (typeof window === "undefined") return { access: null, refresh: null };
  return {
    access: localStorage.getItem(TOKEN_KEY),
    refresh: localStorage.getItem(REFRESH_KEY),
  };
}

function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const stored = getStoredTokens();
      if (!stored.access) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await api.getMe(stored.access);
        setUser(userData);
        setToken(stored.access);
      } catch {
        if (stored.refresh) {
          try {
            const refreshed = await api.refreshToken(stored.refresh);
            saveTokens(refreshed.access_token, refreshed.refresh_token);
            setUser(refreshed.user);
            setToken(refreshed.access_token);
          } catch {
            clearTokens();
          }
        } else {
          clearTokens();
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await api.login(credentials);
    saveTokens(response.access_token, response.refresh_token);
    setUser(response.user);
    setToken(response.access_token);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    await api.register(data);
    await login({ email: data.email, password: data.password });
  }, [login]);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
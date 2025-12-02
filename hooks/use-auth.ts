"use client";

import { useState, useCallback } from "react";
import { authApi } from "@/lib/api/auth";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ChangePasswordRequest,
  PendingRegistration,
  ApproveRegistrationRequest,
  UserInfo,
} from "@/types";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (request: LoginRequest): Promise<LoginResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(request);
      if (response.success && response.data) {
        // Store tokens and user info
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        return response.data;
      } else {
        setError(response.message || "Login failed");
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (request: RegisterRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(request);
      if (response.success) {
        return true;
      } else {
        setError(response.message || "Registration failed");
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      localStorage.removeItem("userEmail");
    }
  }, []);

  const changePassword = useCallback(async (request: ChangePasswordRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.changePassword(request);
      if (response.success) {
        return true;
      } else {
        setError(response.message || "Failed to change password");
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to change password";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCurrentUser = useCallback((): UserInfo | null => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }, []);

  const getToken = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }, []);

  const isAuthenticated = useCallback((): boolean => {
    return !!getToken();
  }, [getToken]);

  return {
    login,
    register,
    logout,
    changePassword,
    getCurrentUser,
    getToken,
    isAuthenticated,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

export function usePendingRegistrations() {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingRegistrations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.getPendingRegistrations();
      if (response.success && response.data) {
        setRegistrations(response.data);
      } else {
        setError(response.message || "Failed to fetch pending registrations");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch pending registrations";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveRegistration = useCallback(async (request: ApproveRegistrationRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.approveRegistration(request);
      if (response.success) {
        // Refresh the list
        await fetchPendingRegistrations();
        return true;
      } else {
        setError(response.message || "Failed to process registration");
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to process registration";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchPendingRegistrations]);

  return {
    registrations,
    fetchPendingRegistrations,
    approveRegistration,
    isLoading,
    error,
  };
}

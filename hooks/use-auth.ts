"use client";

import { useState, useCallback } from "react";
import { authApi } from "@/lib/api/auth";
import { storage } from "@/lib/storage-manager";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
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
        // Store tokens and user info using storage manager (sessionStorage by default)
        storage.setItem("token", response.data.token);
        storage.setItem("refreshToken", response.data.refreshToken);
        storage.setItem("role", response.data.role);
        storage.setItem("user", JSON.stringify(response.data.user));
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
      storage.removeItem("token");
      storage.removeItem("refreshToken");
      storage.removeItem("role");
      storage.removeItem("user");
      storage.removeItem("userEmail");
      storage.removeItem("tokenExpiry");
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

  const forgotPassword = useCallback(async (request: ForgotPasswordRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.forgotPassword(request);
      if (response.success) {
        return true;
      } else {
        setError(response.message || "Failed to send verification code");
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send verification code";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (request: ResetPasswordRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.resetPassword(request);
      if (response.success) {
        return true;
      } else {
        setError(response.message || "Failed to reset password");
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reset password";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCurrentUser = useCallback((): UserInfo | null => {
    if (typeof window === "undefined") return null;
    const userStr = storage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }, []);

  const getToken = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    return storage.getItem("token");
  }, []);

  const isAuthenticated = useCallback((): boolean => {
    return !!getToken();
  }, [getToken]);

  return {
    login,
    register,
    logout,
    changePassword,
    forgotPassword,
    resetPassword,
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

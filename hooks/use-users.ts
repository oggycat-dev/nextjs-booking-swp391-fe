"use client";

import { useState, useCallback } from "react";
import { usersApi } from "@/lib/api/users";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  GetUsersQuery,
  PaginatedResult,
} from "@/types";

export function useUsers() {
  const [users, setUsers] = useState<PaginatedResult<User> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (query?: GetUsersQuery) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersApi.getAll(query);
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        const errorMessage = response.message || 
                           (response.errors && Array.isArray(response.errors) ? response.errors.join(", ") : null) ||
                           "Failed to fetch users";
        setError(errorMessage);
        console.error("Failed to fetch users - Response:", response);
      }
    } catch (err) {
      let message = "Failed to fetch users";
      if (err instanceof Error) {
        message = err.message;
        // Check for common error cases
        if (message.includes("401") || message.includes("Unauthorized")) {
          message = "Authentication failed. Please login again.";
        } else if (message.includes("403") || message.includes("Forbidden")) {
          message = "You don't have permission to access this resource.";
        } else if (message.includes("500") || message.includes("Internal Server Error")) {
          message = "An internal server error occurred. Please try again later.";
        }
      }
      setError(message);
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    users,
    fetchUsers,
    isLoading,
    error,
  };
}

export function useUser(id?: string) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersApi.getById(userId);
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setError(response.message || "Failed to fetch user");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch user";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    fetchUser,
    isLoading,
    error,
  };
}

export function useUserMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = useCallback(async (request: CreateUserRequest): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersApi.create(request);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || "Failed to create user");
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create user";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, request: UpdateUserRequest): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersApi.update(id, request);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || "Failed to update user");
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update user";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersApi.delete(id);
      if (response.success) {
        return true;
      } else {
        setError(response.message || "Failed to delete user");
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete user";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createUser,
    updateUser,
    deleteUser,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

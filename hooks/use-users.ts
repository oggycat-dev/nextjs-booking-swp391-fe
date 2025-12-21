"use client";

import { useState, useCallback } from "react";
import { usersApi } from "@/lib/api/users";
import { campusApi } from "@/lib/api/campus";
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
      // Fetch users and campuses in parallel
      const [usersResponse, campusesResponse] = await Promise.all([
        usersApi.getAll(query),
        campusApi.getAll()
      ]);

      if (usersResponse.success && usersResponse.data) {
        let enrichedUsers = usersResponse.data.items;

        // Enrich users with campus names if campuses were fetched successfully
        if (campusesResponse.success && campusesResponse.data) {
          const campusMap = new Map(
            campusesResponse.data.map(campus => [campus.id, campus.campusName])
          );

          enrichedUsers = usersResponse.data.items.map(user => ({
            ...user,
            campusName: user.campusId ? (campusMap.get(user.campusId) || null) : null
          }));
        }

        setUsers({
          ...usersResponse.data,
          items: enrichedUsers
        });
      } else {
        const errorMessage = usersResponse.message ||
          (usersResponse.errors && Array.isArray(usersResponse.errors) ? usersResponse.errors.join(", ") : null) ||
          "Failed to fetch users";
        setError(errorMessage);
        console.error("Failed to fetch users - Response:", usersResponse);
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

  const resetPassword = useCallback(async (id: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersApi.resetPassword(id, newPassword);
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

  return {
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

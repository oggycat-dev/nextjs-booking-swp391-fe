/**
 * Users API (CMS - Admin only)
 * Handles all user management API calls
 */

import { getAuthHeaders, apiConfig } from '../api-client';
import type {
  ApiResponse,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  GetUsersQuery,
  PaginatedResult,
} from '@/types';

const API_URL = apiConfig.baseURL;

export const usersApi = {
  /**
   * Get all users with pagination and filters (Admin only)
   */
  getAll: async (query?: GetUsersQuery): Promise<ApiResponse<PaginatedResult<User>>> => {
    const params = new URLSearchParams();
    if (query?.pageNumber) params.append("pageNumber", String(query.pageNumber));
    if (query?.pageSize) params.append("pageSize", String(query.pageSize));
    if (query?.searchTerm) params.append("searchTerm", query.searchTerm);
    if (query?.role) params.append("role", query.role);
    if (query?.isActive !== undefined) params.append("isActive", String(query.isActive));

    const url = `${API_URL}/cms/Users${params.toString() ? `?${params.toString()}` : ""}`;
    
    try {
      const headers = getAuthHeaders();
      const headersObj = headers as Record<string, string>;
      console.log("Fetching users from:", url);
      console.log("Headers:", { ...headersObj, Authorization: headersObj.Authorization ? "Bearer ***" : "None" });
      
      const response = await fetch(url, {
        method: "GET",
        headers,
      });
      
      // Check content type before parsing JSON
      const contentType = response.headers.get("content-type");
      let data: any;
      
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch (jsonError) {
          const text = await response.text();
          console.error("Failed to parse JSON response:", text);
          throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
        }
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(`Expected JSON but got ${contentType || "unknown"}: ${text.substring(0, 100)}`);
      }
      
      if (!response.ok) {
        console.error("API Error - Status:", response.status);
        console.error("API Error - Response:", data);
        const errorMessage = data?.message || 
                           (data?.errors && Array.isArray(data.errors) ? data.errors.join(", ") : null) ||
                           data?.title ||
                           `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      console.log("Users fetched successfully:", data);
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred while fetching users");
    }
  },

  /**
   * Get user by ID (Admin only)
   */
  getById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_URL}/cms/Users/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Create a new user (Admin only)
   */
  create: async (request: CreateUserRequest): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_URL}/cms/Users`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return response.json();
  },

  /**
   * Update an existing user (Admin only)
   */
  update: async (id: string, request: UpdateUserRequest): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_URL}/cms/Users/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, ...request }),
    });
    return response.json();
  },

  /**
   * Delete a user (soft delete) (Admin only)
   */
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_URL}/cms/Users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Reset user password (Admin only)
   */
  resetPassword: async (id: string, newPassword: string): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_URL}/cms/Users/${id}/reset-password`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId: id, newPassword }),
    });
    return response.json();
  },
};



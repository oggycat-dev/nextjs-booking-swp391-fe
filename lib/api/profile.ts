/**
 * Profile API
 * Handles user profile API calls for Students and Lecturers
 */

import { getAuthHeaders, apiConfig } from '../api-client';
import type {
  ApiResponse,
  User,
  UpdateProfileRequest,
} from '@/types';

const API_URL = apiConfig.baseURL;

export const profileApi = {
  /**
   * Get current user profile (Student/Lecturer only)
   */
  getMyProfile: async (): Promise<ApiResponse<User>> => {
    try {
      const url = `${API_URL}/Profile`;
      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      });

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
        console.error("API Error - URL:", url);
        console.error("API Error - Response:", data);

        let errorMessage = `Server error (${response.status})`;
        if (data?.message) {
          errorMessage = data.message;
        } else if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          errorMessage = data.errors.join(", ");
        } else if (data?.title) {
          errorMessage = data.title;
        }

        if (response.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else if (response.status === 403) {
          errorMessage = "You don't have permission to access this resource.";
        }

        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred while fetching profile");
    }
  },

  /**
   * Update current user profile (Student/Lecturer only)
   */
  updateMyProfile: async (request: UpdateProfileRequest): Promise<ApiResponse<null>> => {
    try {
      const url = `${API_URL}/Profile`;
      const response = await fetch(url, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      });

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
        console.error("API Error - URL:", url);
        console.error("API Error - Response:", data);

        let errorMessage = `Server error (${response.status})`;
        if (data?.message) {
          errorMessage = data.message;
        } else if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          errorMessage = data.errors.join(", ");
        } else if (data?.title) {
          errorMessage = data.title;
        }

        if (response.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else if (response.status === 403) {
          errorMessage = "You don't have permission to access this resource.";
        } else if (response.status === 400) {
          errorMessage = data?.message || "Invalid request. Please check your input.";
        }

        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error("Update error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred while updating profile");
    }
  },
};


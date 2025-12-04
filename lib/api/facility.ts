/**
 * Facility API
 * Handles all facility-related API calls
 */

import { getAuthHeaders, apiConfig } from '../api-client';
import type {
  ApiResponse,
  Facility,
  CreateFacilityRequest,
  UpdateFacilityRequest,
  GetFacilitiesQuery,
} from '@/types';

const API_URL = apiConfig.baseURL;

export const facilityApi = {
  /**
   * Get all facilities with optional filters
   */
  getAll: async (query?: GetFacilitiesQuery): Promise<ApiResponse<Facility[]>> => {
    const params = new URLSearchParams();
    if (query?.campusId) params.append("campusId", query.campusId);
    if (query?.facilityTypeId) params.append("facilityTypeId", query.facilityTypeId);
    if (query?.availableOnly !== undefined) params.append("availableOnly", String(query.availableOnly));

    const url = `${API_URL}/Facility${params.toString() ? `?${params.toString()}` : ""}`;
    
    try {
      // Use auth headers so backend can auto-filter by campus for Student/Lecturer roles
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

        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred while fetching facilities");
    }
  },

  /**
   * Get facility by ID
   */
  getById: async (id: string): Promise<ApiResponse<Facility>> => {
    // Use auth headers for consistency and potential role-based filtering
    const response = await fetch(`${API_URL}/Facility/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Create a new facility (Admin only)
   * Supports both JSON (for backward compatibility) and FormData (for file uploads)
   */
  create: async (request: CreateFacilityRequest & { images?: File[] }): Promise<ApiResponse<Facility>> => {
    // If images are provided, use FormData (multipart/form-data)
    if (request.images && request.images.length > 0) {
      const formData = new FormData();
      
      // Add all text fields
      formData.append("facilityCode", request.facilityCode);
      formData.append("facilityName", request.facilityName);
      formData.append("typeId", request.typeId);
      formData.append("campusId", request.campusId);
      if (request.building) formData.append("building", request.building);
      if (request.floor) formData.append("floor", request.floor);
      if (request.roomNumber) formData.append("roomNumber", request.roomNumber);
      formData.append("capacity", request.capacity.toString());
      if (request.description) formData.append("description", request.description);
      if (request.equipment) formData.append("equipment", request.equipment);
      
      // Add image files
      request.images.forEach((image) => {
        formData.append("images", image);
      });
      
      const response = await fetch(`${API_URL}/Facility`, {
        method: "POST",
        headers: getAuthHeaders("multipart/form-data"),
        body: formData,
      });
      return response.json();
    }
    
    // Otherwise, use JSON (backward compatibility)
    const response = await fetch(`${API_URL}/Facility`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return response.json();
  },

  /**
   * Update a facility (Admin only)
   */
  update: async (id: string, request: UpdateFacilityRequest): Promise<ApiResponse<Facility>> => {
    const response = await fetch(`${API_URL}/Facility/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return response.json();
  },

  /**
   * Delete a facility (Admin only)
   */
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_URL}/Facility/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};


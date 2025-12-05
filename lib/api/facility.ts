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

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorData: any;
        
        if (contentType && contentType.includes("application/json")) {
          try {
            errorData = await response.json();
          } catch {
            errorData = null;
          }
        } else {
          const text = await response.text();
          try {
            errorData = text ? JSON.parse(text) : null;
          } catch {
            errorData = null;
          }
        }
        
        const errorMessage = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        const text = await response.text();
        if (!text || text.trim() === '') {
          throw new Error('Empty response from server');
        }
        try {
          return JSON.parse(text);
        } catch (parseError) {
          throw new Error(`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
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
    try {
      console.log(`Fetching facility by ID: ${id}`);
      const response = await fetch(`${API_URL}/Facility/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      console.log('Response status:', response.status);

      const text = await response.text();
      console.log('Response text:', text);

      if (!response.ok) {
        let errorData;
        try {
          errorData = text ? JSON.parse(text) : null;
        } catch (e) {
          // Not JSON
        }
        const errorMessage = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      if (!text || text.trim() === '') {
        throw new Error('Empty response from server');
      }

      const data = JSON.parse(text);
      console.log('Parsed facility detail:', data);
      return data;
    } catch (error) {
      console.error('Error fetching facility by ID:', error);
      throw error;
    }
  },

  /**
   * Create a new facility with images (Admin only)
   * Supports FormData for file uploads
   */
  create: async (request: CreateFacilityRequest): Promise<ApiResponse<Facility>> => {
    // Create FormData for multipart/form-data
    const formData = new FormData();
    formData.append("facilityCode", request.facilityCode);
    formData.append("facilityName", request.facilityName);
    formData.append("typeId", request.typeId);
    formData.append("campusId", request.campusId);
    formData.append("capacity", request.capacity.toString());
    
    // Optional fields
    if (request.building) formData.append("building", request.building);
    if (request.floor) formData.append("floor", request.floor);
    if (request.roomNumber) formData.append("roomNumber", request.roomNumber);
    if (request.description) formData.append("description", request.description);
    if (request.equipment) formData.append("equipment", request.equipment);
    
    // Add images
    if (request.images && request.images.length > 0) {
      request.images.forEach((image) => {
        formData.append("images", image);
      });
    }
    
    const response = await fetch(`${API_URL}/Facility`, {
      method: "POST",
      headers: getAuthHeaders("multipart/form-data"),
      body: formData,
    });
    
    if (!response.ok) {
      const text = await response.text();
      let errorData;
      try {
        errorData = text ? JSON.parse(text) : null;
      } catch (e) {
        // Not JSON
      }
      const errorMessage = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }
    
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


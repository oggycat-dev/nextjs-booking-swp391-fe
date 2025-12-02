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
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response.json();
  },

  /**
   * Get facility by ID
   */
  getById: async (id: string): Promise<ApiResponse<Facility>> => {
    const response = await fetch(`${API_URL}/Facility/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response.json();
  },

  /**
   * Create a new facility (Admin only)
   */
  create: async (request: CreateFacilityRequest): Promise<ApiResponse<Facility>> => {
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


/**
 * Facility Type API
 * Handles all facility type-related API calls
 */

import { getAuthHeaders, apiConfig } from '../api-client';
import type {
  ApiResponse,
  FacilityType,
  CreateFacilityTypeRequest,
} from '@/types';

export interface UpdateFacilityTypeRequest {
  typeName: string;
  description?: string;
  isActive: boolean;
}

const API_URL = apiConfig.baseURL;

export const facilityTypeApi = {
  /**
   * Get all facility types
   */
  getAll: async (activeOnly?: boolean): Promise<ApiResponse<FacilityType[]>> => {
    const params = activeOnly !== undefined ? `?activeOnly=${activeOnly}` : "";
    const response = await fetch(`${API_URL}/FacilityType${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response.json();
  },

  /**
   * Create a new facility type (Admin only)
   */
  create: async (request: CreateFacilityTypeRequest): Promise<ApiResponse<FacilityType>> => {
    const response = await fetch(`${API_URL}/FacilityType`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return response.json();
  },

  /**
   * Update a facility type (Admin only)
   */
  update: async (id: string, request: UpdateFacilityTypeRequest): Promise<ApiResponse<FacilityType>> => {
    const response = await fetch(`${API_URL}/FacilityType/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return response.json();
  },
};


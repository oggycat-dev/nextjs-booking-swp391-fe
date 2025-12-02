/**
 * Campus API
 * Handles all campus-related API calls
 */

import { getAuthHeaders, apiConfig } from '../api-client';
import type {
  ApiResponse,
  Campus,
  CreateCampusRequest,
  UpdateCampusRequest,
} from '@/types';

const API_URL = apiConfig.baseURL;

export const campusApi = {
  /**
   * Get all active campuses
   * Note: Use auth headers because campus endpoints may require authentication.
   */
  getAll: async (): Promise<ApiResponse<Campus[]>> => {
    const response = await fetch(`${API_URL}/Campus`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Get campus by ID
   */
  getById: async (id: string): Promise<ApiResponse<Campus>> => {
    const response = await fetch(`${API_URL}/Campus/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response.json();
  },

  /**
   * Get campus by code
   */
  getByCode: async (code: string): Promise<ApiResponse<Campus>> => {
    const response = await fetch(`${API_URL}/Campus/code/${code}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response.json();
  },

  /**
   * Create a new campus (Admin only)
   */
  create: async (request: CreateCampusRequest): Promise<ApiResponse<Campus>> => {
    const response = await fetch(`${API_URL}/Campus`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return response.json();
  },

  /**
   * Update an existing campus (Admin only)
   */
  update: async (id: string, request: UpdateCampusRequest): Promise<ApiResponse<Campus>> => {
    const response = await fetch(`${API_URL}/Campus/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return response.json();
  },

  /**
   * Delete a campus (Admin only)
   */
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_URL}/Campus/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};


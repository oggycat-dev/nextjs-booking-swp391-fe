/**
 * Campus Change Requests API
 * Handles all campus change request API calls
 */

import { getAuthHeaders, apiConfig } from '../api-client';
import type {
  ApiResponse,
  CampusChangeRequest,
  RequestCampusChangeRequest,
  ApproveCampusChangeRequest,
  MyCampusChangeRequest,
} from '@/types';

const API_URL = apiConfig.baseURL;

export const campusChangeRequestsApi = {
  /**
   * Get pending campus change requests (Admin only)
   */
  getPending: async (): Promise<ApiResponse<CampusChangeRequest[]>> => {
    const response = await fetch(`${API_URL}/campus-change-requests/pending`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Get my campus change requests (Student/Lecturer)
   */
  getMyRequests: async (): Promise<ApiResponse<MyCampusChangeRequest[]>> => {
    const response = await fetch(`${API_URL}/campus-change-requests/my-requests`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Request campus change (Student/Lecturer)
   */
  request: async (request: RequestCampusChangeRequest): Promise<ApiResponse<CampusChangeRequest>> => {
    const response = await fetch(`${API_URL}/campus-change-requests`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return response.json();
  },

  /**
   * Approve or reject campus change request (Admin only)
   */
  approve: async (requestId: string, request: ApproveCampusChangeRequest): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_URL}/campus-change-requests/${requestId}/approve`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return response.json();
  },
};

/**
 * Campus Change Request API
 * Handles campus change request API calls for Students and Lecturers
 */

import { getAuthHeaders, apiConfig } from '../api-client';
import type {
  ApiResponse,
  CampusChangeRequest,
} from '@/types';

const API_URL = apiConfig.baseURL;

export interface RequestCampusChangeRequest {
  requestedCampusId: string;
  reason: string;
}

export interface MyCampusChangeRequestDto {
  id: string;
  currentCampusId: string | null;
  currentCampusName: string | null;
  requestedCampusId: string;
  requestedCampusName: string;
  reason: string;
  status: string;
  reviewComment: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export const campusChangeRequestApi = {
  /**
   * Request campus change (Student/Lecturer only)
   */
  requestCampusChange: async (request: RequestCampusChangeRequest): Promise<ApiResponse<CampusChangeRequest>> => {
    try {
      const url = `${API_URL}/campus-change-requests`;
      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit campus change request");
      }

      return data;
    } catch (error) {
      console.error("Request campus change error:", error);
      throw error;
    }
  },

  /**
   * Get my campus change requests history (Student/Lecturer only)
   */
  getMyRequests: async (): Promise<ApiResponse<MyCampusChangeRequestDto[]>> => {
    try {
      const url = `${API_URL}/campus-change-requests/my-requests`;
      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch campus change requests");
      }

      return data;
    } catch (error) {
      console.error("Get my campus change requests error:", error);
      throw error;
    }
  },
};

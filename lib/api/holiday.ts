import { API_URL, getAuthHeaders } from "../api-client";
import type { ApiResponse, Holiday, CreateHolidayRequest } from "@/types";

/**
 * Holiday API client
 * 
 * Endpoints:
 * - GET /api/holidays - Get all holidays (All roles)
 * - POST /api/holidays - Create holiday (Admin only)
 * - DELETE /api/holidays/{id} - Delete holiday (Admin only)
 */
export const holidayApi = {
  /**
   * Get all holidays (All roles)
   */
  getAll: async (): Promise<ApiResponse<Holiday[]>> => {
    try {
      console.log('Fetching all holidays...');
      const response = await fetch(`${API_URL}/holidays`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch holidays:', response.status, errorText);
        throw new Error(`Failed to fetch holidays: ${response.status}`);
      }

      const data = await response.json();
      console.log('Holidays fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error fetching holidays:', error);
      throw error;
    }
  },

  /**
   * Create a new holiday (Admin only)
   */
  create: async (request: CreateHolidayRequest): Promise<ApiResponse<Holiday>> => {
    try {
      console.log('Creating holiday:', request);
      const response = await fetch(`${API_URL}/holidays`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create holiday:', errorData);
        throw new Error(errorData.message || 'Failed to create holiday');
      }

      const data = await response.json();
      console.log('Holiday created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating holiday:', error);
      throw error;
    }
  },

  /**
   * Delete a holiday (Admin only)
   */
  delete: async (id: string): Promise<ApiResponse<null>> => {
    try {
      console.log('Deleting holiday:', id);
      const response = await fetch(`${API_URL}/holidays/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to delete holiday:', errorData);
        throw new Error(errorData.message || 'Failed to delete holiday');
      }

      const data = await response.json();
      console.log('Holiday deleted successfully:', data);
      return data;
    } catch (error) {
      console.error('Error deleting holiday:', error);
      throw error;
    }
  },
};

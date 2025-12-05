/**
 * Booking API
 * Handles booking-related API calls
 */

import { getAuthHeaders, apiConfig } from '../api-client';
import type { ApiResponse, BookingListDto, ApproveBookingRequest } from '@/types';

// Remove /api from baseURL since it's already included
const API_URL = apiConfig.baseURL.replace(/\/api$/, '');

export const bookingApi = {
  /**
   * Get bookings waiting for admin approval (Admin only)
   */
  getPendingAdminApprovals: async (): Promise<ApiResponse<BookingListDto[]>> => {
    const headers = getAuthHeaders();
    const url = `${API_URL}/api/bookings/pending-admin-approval`;
    
    console.log('=== Fetching Pending Bookings ===');
    console.log('URL:', url);
    console.log('Headers:', headers);
    
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log('Response text length:', text.length);
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

    try {
      const data = JSON.parse(text);
      console.log('Parsed data:', data);
      return data;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error(`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  },

  /**
   * Admin approve or reject booking (Admin only)
   */
  adminApproveBooking: async (
    bookingId: string,
    request: ApproveBookingRequest
  ): Promise<ApiResponse<null>> => {
    const headers = getAuthHeaders();
    const url = `${API_URL}/api/bookings/${bookingId}/admin-approve`;
    
    console.log('=== Approving Booking ===');
    console.log('URL:', url);
    console.log('Request:', request);
    
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

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

    try {
      const data = JSON.parse(text);
      console.log('Parsed data:', data);
      return data;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error(`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  },

  /**
   * Check-in to a booking (Student/Lecturer only)
   */
  checkIn: async (bookingId: string): Promise<ApiResponse<null>> => {
    const headers = getAuthHeaders();
    const url = `${API_URL}/api/bookings/${bookingId}/check-in`;
    
    const response = await fetch(url, {
      method: "POST",
      headers,
    });

    const text = await response.text();

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

    try {
      const data = JSON.parse(text);
      return data;
    } catch (parseError) {
      throw new Error(`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  },

  /**
   * Check-out from a booking (Student/Lecturer only)
   */
  checkOut: async (bookingId: string): Promise<ApiResponse<null>> => {
    const headers = getAuthHeaders();
    const url = `${API_URL}/api/bookings/${bookingId}/check-out`;
    
    const response = await fetch(url, {
      method: "POST",
      headers,
    });

    const text = await response.text();

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

    try {
      const data = JSON.parse(text);
      return data;
    } catch (parseError) {
      throw new Error(`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  },

  /**
   * Get my booking history (Student/Lecturer)
   */
  getMyBookingHistory: async (): Promise<ApiResponse<BookingListDto[]>> => {
    const headers = getAuthHeaders();
    const url = `${API_URL}/api/bookings/my-history`;
    
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    const text = await response.text();

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

    try {
      const data = JSON.parse(text);
      return data;
    } catch (parseError) {
      throw new Error(`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  },
};

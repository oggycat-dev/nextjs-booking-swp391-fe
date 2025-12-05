/**
 * Booking API
 * Handles all booking-related API calls
 */

import { getAuthHeaders, apiConfig } from '../api-client';
import type {
  ApiResponse,
  Booking,
  BookingListDto,
  CreateBookingRequest,
  ApproveBookingRequest,
  LecturerApproveBookingRequest,
  RejectBookingRequest,
  GetBookingsQuery,
} from '@/types';

const API_URL = apiConfig.baseURL;

export const bookingApi = {
  /**
   * Get all bookings with optional filters
   */
  getAll: async (query?: GetBookingsQuery): Promise<ApiResponse<Booking[]>> => {
    const params = new URLSearchParams();
    if (query?.status) params.append("status", query.status);
    if (query?.facilityId) params.append("facilityId", query.facilityId);
    if (query?.userId) params.append("userId", query.userId);
    if (query?.startDate) params.append("startDate", query.startDate);
    if (query?.endDate) params.append("endDate", query.endDate);
    if (query?.pageNumber) params.append("pageNumber", query.pageNumber.toString());
    if (query?.pageSize) params.append("pageSize", query.pageSize.toString());

    const url = `${API_URL}/bookings${params.toString() ? `?${params.toString()}` : ""}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Get booking by ID
   */
  getById: async (id: string): Promise<ApiResponse<Booking>> => {
    const response = await fetch(`${API_URL}/bookings/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Create a new booking (Student/Lecturer)
   * For Student: status will be "WaitingLecturerApproval"
   * For Lecturer: status will be "WaitingAdminApproval"
   */
  create: async (request: CreateBookingRequest): Promise<ApiResponse<Booking>> => {
    const response = await fetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return response.json();
  },

  /**
   * Cancel a booking
   */
  cancel: async (id: string): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_URL}/bookings/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Approve a booking (Lecturer/Admin)
   * Lecturer can approve Student bookings → status becomes "WaitingAdminApproval"
   * Admin can approve bookings → status becomes "Approved"
   */
  // Legacy/admin approve endpoint
  approve: async (id: string, request?: ApproveBookingRequest): Promise<ApiResponse<Booking>> => {
    const response = await fetch(`${API_URL}/bookings/${id}/approve`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: request ? JSON.stringify(request) : undefined,
    });
    return response.json();
  },

  /**
   * Reject a booking (Lecturer/Admin)
   * Lecturer reject → status becomes "Rejected" (final)
   * Admin reject → status becomes "Rejected" (final)
   */
  reject: async (id: string, request: RejectBookingRequest): Promise<ApiResponse<Booking>> => {
    const response = await fetch(`${API_URL}/bookings/${id}/reject`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return response.json();
  },

  /**
   * Lecturer approve or reject a student booking
   * Maps to Swagger: POST /api/bookings/{bookingId}/lecturer-approve
   */
  lecturerApprove: async (
    id: string,
    request: { approved: boolean; comment?: string }
  ): Promise<ApiResponse<Booking>> => {
    const response = await fetch(`${API_URL}/bookings/${id}/lecturer-approve`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }
    
    return response.json();
  },

  /**
   * Get pending bookings for lecturer approval (Lecturer only)
   */
  getPendingLecturerApproval: async (): Promise<ApiResponse<Booking[]>> => {
    const response = await fetch(`${API_URL}/bookings/pending-lecturer-approval`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Get pending bookings for admin approval (Admin only)
   */
  getPendingAdminApproval: async (): Promise<ApiResponse<Booking[]>> => {
    const response = await fetch(`${API_URL}/bookings/pending-admin-approval`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Get my bookings (Student/Lecturer)
   */
  getMyBookings: async (query?: GetBookingsQuery): Promise<ApiResponse<Booking[]>> => {
    const params = new URLSearchParams();
    if (query?.status) params.append("status", query.status);
    if (query?.startDate) params.append("startDate", query.startDate);
    if (query?.endDate) params.append("endDate", query.endDate);

    const url = `${API_URL}/bookings/my-bookings${params.toString() ? `?${params.toString()}` : ""}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Get bookings waiting for admin approval (Admin only) - Alternative method
   */
  getPendingAdminApprovals: async (): Promise<ApiResponse<BookingListDto[]>> => {
    const headers = getAuthHeaders();
    const url = `${API_URL}/bookings/pending-admin-approval`;
    
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return response.json();
  },

  /**
   * Admin approve or reject booking (Admin only)
   */
  adminApproveBooking: async (
    bookingId: string,
    request: LecturerApproveBookingRequest
  ): Promise<ApiResponse<null>> => {
    const headers = getAuthHeaders();
    const url = `${API_URL}/bookings/${bookingId}/admin-approve`;
    
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return response.json();
  },

  /**
   * Get my booking history (Student/Lecturer)
   * Returns bookings that have been approved/completed
   */
  getMyHistory: async (): Promise<ApiResponse<Booking[]>> => {
    const response = await fetch(`${API_URL}/bookings/my-history`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Check-in to a booking (Student/Lecturer only)
   */
  checkIn: async (bookingId: string): Promise<ApiResponse<null>> => {
    const headers = getAuthHeaders();
    const url = `${API_URL}/bookings/${bookingId}/check-in`;
    
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
    const url = `${API_URL}/bookings/${bookingId}/check-out`;
    
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
    const url = `${API_URL}/bookings/my-history`;
    
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

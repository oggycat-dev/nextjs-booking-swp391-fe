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
  BookingCalendarDto,
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
   * Get bookings for calendar view
   * Maps to: GET /api/bookings/calendar
   */
  getCalendarBookings: async (params: {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    facilityId?: string;
    campusId?: string;
  }): Promise<ApiResponse<BookingCalendarDto[]>> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("startDate", params.startDate);
      queryParams.append("endDate", params.endDate);
      if (params.facilityId) queryParams.append("facilityId", params.facilityId);
      if (params.campusId) queryParams.append("campusId", params.campusId);

      const url = `${API_URL}/bookings/calendar?${queryParams.toString()}`;
      console.log('Fetching calendar bookings:', url);
      
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" }, // No auth needed - AllowAnonymous
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
        return {
          statusCode: 200,
          success: true,
          message: "No bookings found",
          data: [],
          errors: null,
          timestamp: new Date().toISOString(),
        };
      }

      return JSON.parse(text);
    } catch (error) {
      console.error('Error fetching calendar bookings:', error);
      throw error;
    }
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
    const requestBody = JSON.stringify(request);
    
    // Debug log
    console.log("Creating booking:", request);
    
    const response = await fetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: requestBody,
    });

    // Get raw response text first
    const responseText = await response.text();
    console.log("Raw response:", responseText);
    console.log("Response status:", response.status, response.statusText);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    let data: any = {};
    if (responseText && responseText.trim()) {
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError, "Raw text:", responseText);
        // If it's not JSON, use the raw text as error message
        if (!response.ok) {
          throw new Error(responseText || `HTTP ${response.status}: ${response.statusText}`);
        }
      }
    }

    if (!response.ok) {
      // For 422 or other errors, extract detailed error message
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      // Try to extract error message from various possible formats
      if (data?.message) {
        errorMessage = data.message;
      } else if (data?.error) {
        errorMessage = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      } else if (data?.errors && Array.isArray(data.errors)) {
        errorMessage = data.errors.join(", ");
      } else if (data?.errors && typeof data.errors === 'object' && Object.keys(data.errors).length > 0) {
        // Handle validation errors object (e.g., { field: ["error1", "error2"] })
        const errorMessages = Object.entries(data.errors)
          .map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return `${field}: ${messages.join(", ")}`;
            }
            return `${field}: ${messages}`;
          })
          .join("; ");
        errorMessage = errorMessages || errorMessage;
      } else if (responseText && responseText.trim() && !data || Object.keys(data).length === 0) {
        // If we have raw text but couldn't parse it or data is empty, use the raw text
        errorMessage = responseText.trim();
      }
      
      console.error("Booking creation failed:", {
        status: response.status,
        statusText: response.statusText,
        rawResponse: responseText,
        parsedData: data,
        errorMessage
      });
      
      throw new Error(errorMessage);
    }

    return data;
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
    console.log('🔵 lecturerApprove API call');
    console.log('URL:', `${API_URL}/bookings/${id}/lecturer-approve`);
    console.log('Request body:', JSON.stringify(request));
    
    const response = await fetch(`${API_URL}/bookings/${id}/lecturer-approve`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    
    console.log('Response status:', response.status, response.statusText);
    console.log('Response ok:', response.ok);
    
    const text = await response.text();
    console.log('Response text:', text);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = text ? JSON.parse(text) : null;
      } catch (e) {
        console.error('Failed to parse error response as JSON');
      }
      const errorMessage = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error('❌ API Error:', errorMessage);
      throw new Error(errorMessage);
    }
    
    let data;
    try {
      data = text ? JSON.parse(text) : {};
      console.log('✅ Parsed response data:', data);
    } catch (e) {
      console.error('Failed to parse success response as JSON');
      throw new Error('Invalid JSON response from server');
    }
    
    return data;
  },

  /**
   * Get pending bookings for lecturer approval (Lecturer only)
   * Maps to: GET /api/bookings/pending-lecturer-approval
   */
  getPendingLecturerApproval: async (): Promise<ApiResponse<Booking[]>> => {
    try {
      const response = await fetch(`${API_URL}/bookings/pending-lecturer-approval`, {
        method: "GET",
        headers: getAuthHeaders(),
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

      // Handle empty response
      if (!text || text.trim() === '') {
        return {
          statusCode: 200,
          success: true,
          message: "No pending approvals",
          data: [],
          errors: null,
          timestamp: new Date().toISOString(),
        };
      }

      return JSON.parse(text);
    } catch (error) {
      console.error('Error fetching pending lecturer approvals:', error);
      throw error;
    }
  },

  /**
   * Get pending bookings for admin approval (Admin only)
   * Maps to: GET /api/bookings/pending-admin-approval
   */
  getPendingAdminApproval: async (): Promise<ApiResponse<Booking[]>> => {
    try {
      const response = await fetch(`${API_URL}/bookings/pending-admin-approval`, {
        method: "GET",
        headers: getAuthHeaders(),
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

      // Handle empty response
      if (!text || text.trim() === '') {
        return {
          statusCode: 200,
          success: true,
          message: "No pending approvals",
          data: [],
          errors: null,
          timestamp: new Date().toISOString(),
        };
      }

      return JSON.parse(text);
    } catch (error) {
      console.error('Error fetching pending admin approvals:', error);
      throw error;
    }
  },

  /**
   * Get my bookings (Student/Lecturer)
   * Maps to: GET /api/bookings/my-history
   */
  getMyBookings: async (query?: GetBookingsQuery): Promise<ApiResponse<Booking[]>> => {
    try {
      const url = `${API_URL}/bookings/my-history`;
      
      console.log('Fetching my bookings from:', url);
      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
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

      // Handle empty response
      if (!text || text.trim() === '') {
        return {
          statusCode: 200,
          success: true,
          message: "No bookings found",
          data: [],
          errors: null,
          timestamp: new Date().toISOString(),
        };
      }

      return JSON.parse(text);
    } catch (error) {
      console.error('Error fetching my bookings:', error);
      throw error;
    }
  },

  /**
   * Get my pending bookings (Student/Lecturer)
   * Maps to: GET /api/bookings/my-pending
   */
  getMyPendingBookings: async (): Promise<ApiResponse<Booking[]>> => {
    try {
      const url = `${API_URL}/bookings/my-pending`;
      
      console.log('Fetching my pending bookings from:', url);
      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
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

      // Handle empty response
      if (!text || text.trim() === '') {
        return {
          statusCode: 200,
          success: true,
          message: "No pending bookings found",
          data: [],
          errors: null,
          timestamp: new Date().toISOString(),
        };
      }

      return JSON.parse(text);
    } catch (error) {
      console.error('Error fetching my pending bookings:', error);
      throw error;
    }
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
    try {
      const response = await fetch(`${API_URL}/bookings/my-history`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      // Handle 404 gracefully
      if (response.status === 404) {
        console.warn('Booking history endpoint not found (404). Returning empty array.');
        return {
          statusCode: 200,
          success: true,
          message: "Booking history endpoint not available",
          data: [],
          errors: null,
          timestamp: new Date().toISOString(),
        };
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = errorText ? JSON.parse(errorText) : null;
          errorMessage = errorData?.message || errorMessage;
        } catch {
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        if (!text || text.trim() === '') {
          return {
            statusCode: 200,
            success: true,
            message: "No booking history found",
            data: [],
            errors: null,
            timestamp: new Date().toISOString(),
          };
        }
        return JSON.parse(text);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching booking history:', error);
      // Return empty array instead of throwing for better UX
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('Not Found'))) {
        return {
          statusCode: 200,
          success: true,
          message: "Booking history endpoint not available",
          data: [],
          errors: null,
          timestamp: new Date().toISOString(),
        };
      }
      throw error;
    }
  },

  /**
   * Check-in to a booking (Student/Lecturer only)
   */
  checkIn: async (bookingId: string): Promise<ApiResponse<null>> => {
    const headers = getAuthHeaders();
    // API_URL already includes /api, so don't add it again
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
    // API_URL already includes /api, so don't add it again
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
    try {
      const headers = getAuthHeaders();
      // API_URL already includes /api, so don't add it again
      const url = `${API_URL}/bookings/my-history`;
      
      console.log('Fetching booking history from:', url);
      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      // Handle 404 gracefully - endpoint might not be implemented yet
      if (response.status === 404) {
        console.warn('Booking history endpoint not found (404). Returning empty array.');
        return {
          statusCode: 200,
          success: true,
          message: "Booking history endpoint not available",
          data: [],
          errors: null,
          timestamp: new Date().toISOString(),
        };
      }

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
        // Return empty array instead of throwing
        return {
          statusCode: 200,
          success: true,
          message: "No booking history found",
          data: [],
          errors: null,
          timestamp: new Date().toISOString(),
        };
      }

      try {
        const data = JSON.parse(text);
        return data;
      } catch (parseError) {
        throw new Error(`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching booking history:', error);
      // Return empty array instead of throwing for better UX
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('Not Found'))) {
        return {
          statusCode: 200,
          success: true,
          message: "Booking history endpoint not available",
          data: [],
          errors: null,
          timestamp: new Date().toISOString(),
        };
      }
      throw error;
    }
  },
};

/**
 * Booking API
 * Handles all booking-related API calls
 */

import { getAuthHeaders, apiConfig } from '../api-client';
import { storage } from '../storage-manager';
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
    try {
      const params = new URLSearchParams();
      if (query?.status) params.append("status", query.status);
      if (query?.facilityId) params.append("facilityId", query.facilityId);
      if (query?.userId) params.append("userId", query.userId);
      if (query?.startDate) params.append("startDate", query.startDate);
      if (query?.endDate) params.append("endDate", query.endDate);
      if (query?.pageNumber) params.append("pageNumber", query.pageNumber.toString());
      if (query?.pageSize) params.append("pageSize", query.pageSize.toString());

      const url = `${API_URL}/bookings${params.toString() ? `?${params.toString()}` : ""}`;

      const response = await fetch(url, { //Gọi fetch để lấy dữ liệu từ API
        method: "GET",
        headers: getAuthHeaders(),
      });

      const text = await response.text(); // Đọc raw text từ response

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
      console.error('Error fetching bookings:', error);
      throw error;
    }
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
    //fetch POST
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

      // Error message is thrown below for error handling
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
   * Cancel a booking with a reason (preferred - backend: POST /bookings/{id}/cancel)
   */
  cancelWithReason: async (id: string, reason?: string): Promise<ApiResponse<null>> => {
    try {
      const url = `${API_URL}/bookings/${id}/cancel`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      const text = await response.text().catch(() => '');

      if (!response.ok) {
        let errorData: any = null;
        try {
          errorData = text ? JSON.parse(text) : null;
        } catch (e) {
          // ignore
        }
        const errorMessage = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
        return {
          statusCode: response.status,
          success: false,
          message: errorMessage,
          data: null,
          errors: null,
          timestamp: new Date().toISOString(),
        };
      }

      if (!text || text.trim() === '') {
        return {
          statusCode: 200,
          success: true,
          message: 'Booking cancelled',
          data: null,
          errors: null,
          timestamp: new Date().toISOString(),
        };
      }

      try {
        return JSON.parse(text);
      } catch (e) {
        return {
          statusCode: 200,
          success: true,
          message: 'Booking cancelled',
          data: null,
          errors: null,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.error('Error cancelling booking with reason:', err);
      return {
        statusCode: 500,
        success: false,
        message: (err as Error).message || 'Failed to cancel booking',
        data: null,
        errors: null,
        timestamp: new Date().toISOString(),
      };
    }
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
   * Get approved bookings (Admin only)
   * Maps to: GET /api/bookings/approved
   */
  getApprovedBookings: async (query?: GetBookingsQuery): Promise<ApiResponse<any>> => {
    // Similar to other admin endpoints, attempt an auth refresh on 401/403 and retry once.
    const params = new URLSearchParams();
    if (query?.facilityId) params.append('facilityId', query.facilityId);
    if (query?.campusId) params.append('campusId', query.campusId);
    if (query?.pageNumber) params.append('pageNumber', String(query.pageNumber));
    if (query?.pageSize) params.append('pageSize', String(query.pageSize));
    if (query?.startDate) params.append('fromDate', query.startDate);
    if (query?.endDate) params.append('toDate', query.endDate);
    if ((query as any)?.searchTerm) params.append('searchTerm', (query as any).searchTerm);

    const url = `${API_URL}/bookings/approved${params.toString() ? `?${params.toString()}` : ''}`;

    // First request
    let response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    // If 401/403, try refresh token and retry once
    if ((response.status === 401 || response.status === 403) && typeof window !== 'undefined') {
      const refreshToken = storage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json().catch(() => null);
            if (refreshData?.success && refreshData.data) {
              storage.setItem('token', refreshData.data.token);
              storage.setItem('refreshToken', refreshData.data.refreshToken);
              // retry
              response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }
    }

    // Handle 404/405 gracefully by returning empty result
    if (response.status === 404 || response.status === 405) {
      return {
        statusCode: 200,
        success: true,
        message: 'Approved bookings endpoint not available',
        data: [],
        errors: null,
        timestamp: new Date().toISOString(),
      };
    }

    const text = await response.text().catch(() => '');

    if (!response.ok) {
      let errorData: any = null;
      try {
        errorData = text ? JSON.parse(text) : null;
      } catch (e) {
        // ignore
      }
      const errorMessage = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
      // Use warn to avoid Next's error overlay for expected API errors — include URL and response text for debugging
      try {
        console.warn('Approved bookings request failed', { url, status: response.status, message: errorMessage, responseText: text });
      } catch (e) {
        // fallback
        console.warn('Approved bookings request failed:', errorMessage);
      }
      return {
        statusCode: response.status,
        success: false,
        message: errorMessage,
        data: [],
        errors: null,
        timestamp: new Date().toISOString(),
      };
    }

    if (!text || text.trim() === '') {
      return {
        statusCode: 200,
        success: true,
        message: 'No approved bookings found',
        data: [],
        errors: null,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse approved bookings response:', parseError);
      return {
        statusCode: 200,
        success: false,
        message: 'Invalid JSON response from approved bookings endpoint',
        data: [],
        errors: null,
        timestamp: new Date().toISOString(),
      };
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
    const url = `${API_URL}/bookings/pending-admin-approval`;

    // First attempt
    let response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    // If 401 or 403, try to refresh token and retry once
    if ((response.status === 401 || response.status === 403) && typeof window !== "undefined") {
      console.log("Got 401/403, attempting token refresh and retry...");

      const refreshToken = storage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_URL}/auth/refresh-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.success && refreshData.data) {
              storage.setItem("token", refreshData.data.token);
              storage.setItem("refreshToken", refreshData.data.refreshToken);

              // Retry the original request with new token
              response = await fetch(url, {
                method: "GET",
                headers: getAuthHeaders(),
              });
            }
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;

      // If still 401/403 after retry, user needs to re-login
      if (response.status === 401 || response.status === 403) {
        console.error("Authentication failed after retry, redirecting to login...");
        storage.clear();
        window.location.href = "/";
      }

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
    const url = `${API_URL}/bookings/${bookingId}/admin-approve`;

    // First attempt
    let response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });

    // If 401 or 403, try to refresh token and retry once
    if ((response.status === 401 || response.status === 403) && typeof window !== "undefined") {
      console.log("Got 401/403, attempting token refresh and retry...");

      const refreshToken = storage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_URL}/auth/refresh-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.success && refreshData.data) {
              storage.setItem("token", refreshData.data.token);
              storage.setItem("refreshToken", refreshData.data.refreshToken);

              // Retry the original request with new token
              response = await fetch(url, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(request),
              });
            }
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;

      // If still 401/403 after retry, user needs to re-login
      if (response.status === 401 || response.status === 403) {
        console.error("Authentication failed after retry, redirecting to login...");
        storage.clear();
        window.location.href = "/";
      }

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

  /**
   * Get all bookings for admin with filters and pagination (Admin only)
   * Maps to: GET /api/bookings/admin/all
   */
  getAllBookingsForAdmin: async (query?: {
    pageNumber?: number;
    pageSize?: number;
    facilityId?: string;
    campusId?: string;
    fromDate?: string;
    toDate?: string;
    status?: string;
    searchTerm?: string;
  }): Promise<ApiResponse<any>> => {
    try {
      const params = new URLSearchParams();
      if (query?.pageNumber) params.append('pageNumber', String(query.pageNumber));
      if (query?.pageSize) params.append('pageSize', String(query.pageSize));
      if (query?.facilityId) params.append('facilityId', query.facilityId);
      if (query?.campusId) params.append('campusId', query.campusId);
      if (query?.fromDate) params.append('fromDate', query.fromDate);
      if (query?.toDate) params.append('toDate', query.toDate);
      if (query?.status) params.append('status', query.status);
      if (query?.searchTerm) params.append('searchTerm', query.searchTerm);

      const url = `${API_URL}/bookings/admin/all${params.toString() ? `?${params.toString()}` : ''}`;

      // First request
      let response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      // If 401/403, try refresh token and retry once
      if ((response.status === 401 || response.status === 403) && typeof window !== 'undefined') {
        const refreshToken = storage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(`${API_URL}/auth/refresh-token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json().catch(() => null);
              if (refreshData?.success && refreshData.data) {
                storage.setItem('token', refreshData.data.token);
                storage.setItem('refreshToken', refreshData.data.refreshToken);
                // retry
                response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        }
      }

      const text = await response.text().catch(() => '');

      if (!response.ok) {
        let errorData: any = null;
        try {
          errorData = text ? JSON.parse(text) : null;
        } catch (e) {
          // ignore
        }
        const errorMessage = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
        return {
          statusCode: response.status,
          success: false,
          message: errorMessage,
          data: null,
          errors: null,
          timestamp: new Date().toISOString(),
        };
      }

      if (!text || text.trim() === '') {
        return {
          statusCode: 200,
          success: true,
          message: 'No bookings found',
          data: { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0 },
          errors: null,
          timestamp: new Date().toISOString(),
        };
      }

      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse all bookings response:', parseError);
        return {
          statusCode: 200,
          success: false,
          message: 'Invalid JSON response from all bookings endpoint',
          data: null,
          errors: null,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.error('Error fetching all bookings for admin:', err);
      return {
        statusCode: 500,
        success: false,
        message: (err as Error).message || 'Failed to fetch all bookings',
        data: null,
        errors: null,
        timestamp: new Date().toISOString(),
      };
    }
  },
};

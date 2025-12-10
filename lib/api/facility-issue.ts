/**
 * Facility Issue API
 * Handles all facility issue-related API calls
 */

import { getAuthHeaders, apiConfig } from '../api-client';
import type {
  ApiResponse,
  FacilityIssue,
  ReportFacilityIssueRequest,
  ChangeRoomRequest,
  ChangeRoomResponse,
  RejectIssueRequest,
} from '@/types';

const API_URL = apiConfig.baseURL;

export const facilityIssueApi = {
  /**
   * Report a facility issue (Student/Lecturer only)
   * Requires: User must be checked in to the booking
   * POST /api/FacilityIssue/report
   */
  reportIssue: async (request: ReportFacilityIssueRequest): Promise<ApiResponse<FacilityIssue>> => {
    try {
      const formData = new FormData();
      formData.append('bookingId', request.bookingId);
      formData.append('issueTitle', request.issueTitle);
      formData.append('issueDescription', request.issueDescription);
      formData.append('severity', request.severity);
      formData.append('category', request.category);

      // Append images if provided
      if (request.images && request.images.length > 0) {
        request.images.forEach((image, index) => {
          formData.append('images', image);
        });
      }

      // For FormData, we need to let browser set Content-Type with boundary
      // So we only get auth headers without Content-Type
      // Use getAuthHeaders with "multipart/form-data" to skip Content-Type header
      const headers = getAuthHeaders("multipart/form-data");

      const url = `${API_URL}/FacilityIssue/report`;
      console.log('Reporting issue to:', url);
      console.log('FormData keys:', Array.from(formData.keys()));

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = errorText ? JSON.parse(errorText) : null;
          if (errorData) {
            errorMessage = errorData.message || errorData.error || errorMessage;
            // Include validation errors if available
            if (errorData.errors && Array.isArray(errorData.errors)) {
              errorMessage += `: ${errorData.errors.join(', ')}`;
            }
          }
        } catch {
          if (errorText) errorMessage = errorText;
        }
        console.error('Report issue error:', errorMessage);
        console.error('Response status:', response.status);
        console.error('Response text:', errorText);
        throw new Error(errorMessage);
      }

      const text = await response.text();
      if (!text || text.trim() === '') {
        throw new Error('Empty response from server');
      }
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', text);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error reporting facility issue:', error);
      throw error;
    }
  },

  /**
   * Get pending facility issue reports (Admin only)
   * GET /api/FacilityIssue/pending
   */
  getPendingIssues: async (): Promise<ApiResponse<FacilityIssue[]>> => {
    try {
      const response = await fetch(`${API_URL}/FacilityIssue/pending`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

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

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (!text || text.trim() === '') {
          return {
            statusCode: 200,
            success: true,
            message: 'No pending issues found',
            data: [],
            errors: null,
            timestamp: new Date().toISOString(),
          };
        }
        return JSON.parse(text);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching pending facility issues:', error);
      throw error;
    }
  },

  /**
   * Get my facility issue reports (Student/Lecturer)
   * GET /api/FacilityIssue/my-reports
   */
  getMyReports: async (): Promise<ApiResponse<FacilityIssue[]>> => {
    try {
      const response = await fetch(`${API_URL}/FacilityIssue/my-reports`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

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

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (!text || text.trim() === '') {
          return {
            statusCode: 200,
            success: true,
            message: 'No reports found',
            data: [],
            errors: null,
            timestamp: new Date().toISOString(),
          };
        }
        return JSON.parse(text);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching my facility issue reports:', error);
      throw error;
    }
  },

  /**
   * Change room for a reported issue (Admin only)
   * When admin calls this API, the room change is executed immediately (no additional approval needed):
   * - New facility will be set to booked status automatically
   * - Email will be sent to user about room change
   * - Booking time will be from approval time to original booking end time
   * - Only the facility is changed, the booking owner remains the same
   * POST /api/FacilityIssue/{reportId}/change-room
   */
  changeRoom: async (
    reportId: string,
    request: ChangeRoomRequest
  ): Promise<ApiResponse<ChangeRoomResponse>> => {
    try {
      const url = `${API_URL}/FacilityIssue/${reportId}/change-room`;
      console.log('Changing room for issue:', reportId);
      console.log('Request body:', request);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = errorText ? JSON.parse(errorText) : null;
          if (errorData) {
            errorMessage = errorData.message || errorData.error || errorMessage;
            // Include validation errors if available
            if (errorData.errors && Array.isArray(errorData.errors)) {
              errorMessage += `: ${errorData.errors.join(', ')}`;
            }
          }
        } catch {
          if (errorText) {
            errorMessage = errorText;
          }
        }
        console.error('Change room error:', errorMessage);
        console.error('Response status:', response.status);
        console.error('Response text:', errorText);
        console.error('Request body:', JSON.stringify(request));
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (!text || text.trim() === '') {
          throw new Error('Empty response from server');
        }
        return JSON.parse(text);
      }

      return response.json();
    } catch (error) {
      console.error('Error changing room for facility issue:', error);
      throw error;
    }
  },

  /**
   * Reject a facility issue report (Admin only)
   * POST /api/FacilityIssue/{reportId}/reject
   */
  rejectIssue: async (
    reportId: string,
    request: RejectIssueRequest
  ): Promise<ApiResponse<FacilityIssue>> => {
    try {
      const url = `${API_URL}/FacilityIssue/${reportId}/reject`;
      console.log('Rejecting issue:', reportId);
      console.log('Request body:', request);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = errorText ? JSON.parse(errorText) : null;
          if (errorData) {
            errorMessage = errorData.message || errorData.error || errorMessage;
            // Include validation errors if available
            if (errorData.errors && Array.isArray(errorData.errors)) {
              errorMessage += `: ${errorData.errors.join(', ')}`;
            }
          }
        } catch {
          if (errorText) {
            errorMessage = errorText;
          }
        }
        console.error('Reject issue error:', errorMessage);
        console.error('Response status:', response.status);
        console.error('Response text:', errorText);
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (!text || text.trim() === '') {
          throw new Error('Empty response from server');
        }
        return JSON.parse(text);
      }

      return response.json();
    } catch (error) {
      console.error('Error rejecting facility issue:', error);
      throw error;
    }
  },
};


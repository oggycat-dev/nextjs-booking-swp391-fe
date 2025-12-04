/**
 * Booking API
 * Handles all booking-related API calls
 */

import { getAuthHeaders, apiConfig } from '../api-client';
import type {
  ApiResponse,
  Booking,
  CreateBookingRequest,
  ApproveBookingRequest,
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
};


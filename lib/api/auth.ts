/**
 * Authentication API
 * Handles all authentication-related API calls
 */

import { getAuthHeaders, apiConfig } from '../api-client';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenRequest,
  ChangePasswordRequest,
  PendingRegistration,
  ApproveRegistrationRequest,
} from '@/types';

const API_URL = apiConfig.baseURL;

export const authApi = {
  /**
   * Login with email and password
   */
  login: async (request: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await fetch(`${API_URL}/Auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    return response.json();
  },

  /**
   * Register a new user account (requires admin approval)
   */
  register: async (request: RegisterRequest): Promise<ApiResponse<string>> => {
    const response = await fetch(`${API_URL}/Auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    return response.json();
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: async (request: RefreshTokenRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await fetch(`${API_URL}/Auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    return response.json();
  },

  /**
   * Change current user password
   */
  changePassword: async (request: ChangePasswordRequest): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_URL}/Auth/change-password`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return response.json();
  },

  /**
   * Logout from the system
   */
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_URL}/Auth/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Get pending registrations (Admin only)
   */
  getPendingRegistrations: async (): Promise<ApiResponse<PendingRegistration[]>> => {
    const response = await fetch(`${API_URL}/Auth/pending-registrations`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Approve or reject a registration (Admin only)
   */
  approveRegistration: async (request: ApproveRegistrationRequest): Promise<ApiResponse<boolean>> => {
    const response = await fetch(`${API_URL}/Auth/approve-registration`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return response.json();
  },
};


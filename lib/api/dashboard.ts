/**
 * Dashboard API
 * Handles dashboard statistics API calls
 */

import { getAuthHeaders, apiConfig } from '../api-client';
import type { ApiResponse } from '@/types';

const API_URL = apiConfig.baseURL;

export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalLecturers: number;
  pendingRegistrations: number;
  pendingCampusChangeRequests: number;
  totalBookingsToday: number;
  totalBookingsThisWeek: number;
  totalBookingsThisMonth: number;
  pendingLecturerApprovals: number;
  pendingAdminApprovals: number;
  approvedBookingsToday: number;
  rejectedBookingsToday: number;
  inUseBookingsNow: number;
  totalFacilities: number;
  availableFacilities: number;
  inUseFacilities: number;
  maintenanceFacilities: number;
  totalCampuses: number;
  recentBookings: RecentBooking[];
  recentRegistrations: RecentRegistration[];
  facilityUtilizationRate: number;
}

export interface RecentBooking {
  id: string;
  bookingCode: string;
  facilityName: string;
  bookedByName: string;  // Added alias for userName
  userName: string;
  userRole: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
}

export interface RecentRegistration {
  id: string;
  userCode: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  isApproved: boolean;  // Added based on status
  createdAt: string;
}

export const dashboardApi = {
  /**
   * Get admin dashboard statistics
   * Maps to: GET /api/Dashboard/admin
   */
  getAdminStats: async (): Promise<ApiResponse<DashboardStats>> => {
    try {
      const url = `${API_URL}/Dashboard/admin`;
      console.log('Fetching admin dashboard stats from:', url);
      
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
        throw new Error('Empty response from server');
      }

      return JSON.parse(text);
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      throw error;
    }
  },
};

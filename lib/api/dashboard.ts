/**
 * Dashboard API
 * Handles dashboard statistics API calls
 */

import { getAuthHeaders, apiConfig } from '../api-client';
import type { ApiResponse, DashboardStats } from '@/types';

const API_URL = apiConfig.baseURL;

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

      const data = JSON.parse(text);
      
      // Map backend data to frontend format
      if (data.data) {
        // Map recent bookings: userName -> bookedByName
        if (data.data.recentBookings && Array.isArray(data.data.recentBookings)) {
          data.data.recentBookings = data.data.recentBookings.map((booking: any) => ({
            ...booking,
            bookedByName: booking.userName || booking.bookedByName || '',
            // Ensure date strings are properly formatted
            bookingDate: booking.bookingDate || '',
            startTime: booking.startTime || '',
            endTime: booking.endTime || '',
            createdAt: booking.createdAt || '',
          }));
        }
        
        // Map recent registrations: status -> isApproved
        if (data.data.recentRegistrations && Array.isArray(data.data.recentRegistrations)) {
          data.data.recentRegistrations = data.data.recentRegistrations.map((registration: any) => ({
            ...registration,
            isApproved: registration.status === 'Approved' || registration.isApproved || false,
          }));
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      throw error;
    }
  },
};

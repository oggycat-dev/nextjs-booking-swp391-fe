/**
 * Booking Hook
 * Custom hook for managing booking operations (Admin only)
 */

import { useState, useCallback } from 'react';
import { bookingApi } from '@/lib/api/booking';
import type { BookingListDto, ApproveBookingRequest } from '@/types';

export function useAdminBookings() {
  const [bookings, setBookings] = useState<BookingListDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch pending admin approval bookings
   */
  const fetchPendingApprovals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingApi.getPendingAdminApprovals();
      console.log('API Response:', response);
      
      if (response.success && response.data) {
        // Data is an array directly
        const bookingsArray = Array.isArray(response.data) ? response.data : [];
        console.log('Bookings array:', bookingsArray);
        setBookings(bookingsArray);
      } else {
        setError(response.message || 'Failed to fetch pending bookings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching pending approvals:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Approve or reject a booking
   */
  const approveBooking = useCallback(async (
    bookingId: string,
    request: ApproveBookingRequest
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingApi.adminApproveBooking(bookingId, request);
      if (response.success) {
        // Refresh the list after approval/rejection
        await fetchPendingApprovals();
        return true;
      } else {
        setError(response.message || 'Failed to process booking');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error approving booking:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchPendingApprovals]);

  return {
    bookings,
    isLoading,
    error,
    fetchPendingApprovals,
    approveBooking,
  };
}

/**
 * Booking Actions Hook
 * Custom hook for check-in and check-out operations (Student/Lecturer only)
 */

import { useState, useCallback } from 'react';
import { bookingApi } from '@/lib/api/booking';

export function useBookingActions() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check-in to a booking
   */
  const checkIn = useCallback(async (bookingId: string): Promise<boolean> => {
    setIsProcessing(true);
    setError(null);
    try {
      const response = await bookingApi.checkIn(bookingId);
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to check-in');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during check-in';
      setError(errorMessage);
      console.error('Error checking in:', err);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Check-out from a booking
   */
  const checkOut = useCallback(async (bookingId: string): Promise<boolean> => {
    setIsProcessing(true);
    setError(null);
    try {
      const response = await bookingApi.checkOut(bookingId);
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to check-out');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during check-out';
      setError(errorMessage);
      console.error('Error checking out:', err);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    checkIn,
    checkOut,
    isProcessing,
    error,
    resetError,
  };
}

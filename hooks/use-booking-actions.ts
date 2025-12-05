/**
 * Booking Actions Hook
 * Provides hooks for check-in and check-out actions
 */

import { useState, useCallback } from 'react';
import { bookingApi } from '@/lib/api/booking';

export function useBookingActions() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkIn = useCallback(async (bookingId: string): Promise<boolean> => {
    setIsProcessing(true);
    setError(null);
    try {
      const response = await bookingApi.checkIn(bookingId);
      if (response.success) {
        return true;
      } else {
        setError(response.message || "Failed to check in");
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to check in";
      setError(message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const checkOut = useCallback(async (bookingId: string): Promise<boolean> => {
    setIsProcessing(true);
    setError(null);
    try {
      const response = await bookingApi.checkOut(bookingId);
      if (response.success) {
        return true;
      } else {
        setError(response.message || "Failed to check out");
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to check out";
      setError(message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    checkIn,
    checkOut,
    isProcessing,
    error,
  };
}


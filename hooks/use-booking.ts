/**
 * Booking Hooks
 * Provides hooks for booking operations
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { bookingApi } from '@/lib/api/booking';
import type {
  Booking,
  CreateBookingRequest,
  ApproveBookingRequest,
  RejectBookingRequest,
  GetBookingsQuery,
} from '@/types';

/**
 * Hook to get all bookings with filters
 */
export function useBookings(query?: GetBookingsQuery) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingApi.getAll(query);// gọi API để lấy tất cả booking với query
      if (response.success && response.data) {
        setBookings(response.data);
      } else {
        setError(response.message || "Failed to fetch bookings");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch bookings";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { //Giá trị trả về cho component sử dụng hook này
    bookings,
    fetchBookings,
    isLoading,
    error,
  };
}

/**
 * Hook to get my bookings (Student/Lecturer)
 */
export function useMyBookings(query?: GetBookingsQuery) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getCurrentUser } = useAuth();

  const fetchMyBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingApi.getMyBookings(query);
      if (response.success && response.data) {
        setBookings(response.data);
      } else if (response.statusCode === 404) {
        const user = getCurrentUser();
        if (user?.id) {
          const fallback = await bookingApi.getAll({ userId: user.id });
          if (fallback.success && fallback.data) {
            setBookings(fallback.data);
          } else {
            setError(fallback.message || "Failed to fetch my bookings");
          }
        } else {
          setError(response.message || "Failed to fetch my bookings");
        }
      } else {
        setError(response.message || "Failed to fetch my bookings");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch my bookings";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  return {
    bookings,
    fetchMyBookings,
    isLoading,
    error,
  };
}

/**
 * Hook to get my pending bookings (Student/Lecturer)
 */
export function useMyPendingBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyPendingBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingApi.getMyPendingBookings();
      if (response.success && response.data) {
        setBookings(response.data);
      } else {
        setError(response.message || "Failed to fetch my pending bookings");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch my pending bookings";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyPendingBookings();
  }, [fetchMyPendingBookings]);

  return {
    bookings,
    fetchMyPendingBookings,
    isLoading,
    error,
  };
}

/**
 * Hook to get pending bookings for lecturer approval
 */
export function usePendingLecturerApprovals(shouldFetch: boolean = true) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingApprovals = useCallback(async () => {
    if (!shouldFetch) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingApi.getPendingLecturerApproval();
      if (response.success && response.data) {
        setBookings(response.data);
      } else {
        setError(response.message || "Failed to fetch pending approvals");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch pending approvals";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [shouldFetch]);

  useEffect(() => {
    if (shouldFetch) {
      fetchPendingApprovals();
    }
  }, [fetchPendingApprovals, shouldFetch]);

  return {
    bookings,
    fetchPendingApprovals,
    isLoading,
    error,
  };
}

/**
 * Hook to get pending bookings for admin approval
 */
export function usePendingAdminApprovals() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingApprovals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingApi.getPendingAdminApproval();
      if (response.success && response.data) {
        setBookings(response.data);
      } else {
        setError(response.message || "Failed to fetch pending approvals");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch pending approvals";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingApprovals();
  }, [fetchPendingApprovals]);

  return {
    bookings,
    fetchPendingApprovals,
    isLoading,
    error,
  };
}

/**
 * Hook for booking mutations (create, approve, reject, cancel)
 */
export function useBookingMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = useCallback(async (request: CreateBookingRequest): Promise<Booking | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingApi.create(request);
      if (response.success && response.data) {
        return response.data;
      } else {
        const errorMsg = response.message || response.errors?.join?.(", ") || "Failed to create booking";
        setError(errorMsg);
        // Throw error so it can be caught in handleSubmit catch block
        throw new Error(errorMsg);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create booking";
      setError(message);
      // Re-throw error so handleSubmit can catch it and display the message
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveBooking = useCallback(async (id: string, request?: ApproveBookingRequest): Promise<Booking | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingApi.approve(id, request);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || "Failed to approve booking");
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to approve booking";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rejectBooking = useCallback(async (id: string, request: RejectBookingRequest): Promise<Booking | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingApi.reject(id, request);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || "Failed to reject booking");
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reject booking";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Lecturer review booking (approve or reject) using lecturer-approve endpoint
   */
  const approveBookingAsLecturer = useCallback(
    async (id: string, comment?: string): Promise<Booking | null> => {
      setIsLoading(true);
      setError(null);
      console.log('=== approveBookingAsLecturer START ===');
      console.log('Booking ID:', id);
      console.log('Comment:', comment);
      try {
        const response = await bookingApi.lecturerApprove(id, { approved: true, comment });
        console.log('API Response:', response);
        console.log('Response success:', response.success);
        console.log('Response data:', response.data);
        console.log('Response message:', response.message);
        
        // Backend returns success with null data, just check success flag
        if (response.success) {
          console.log('✅ Approval successful');
          // Return a dummy booking object since backend doesn't return the updated booking
          return { id } as Booking;
        } else {
          const errorMsg = response.message || "Failed to approve booking";
          console.error('❌ Approval failed - success check failed');
          console.error('Error message:', errorMsg);
          setError(errorMsg);
          return null;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to approve booking";
        console.error('❌ Approval failed - exception caught');
        console.error('Error:', err);
        console.error('Error message:', message);
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
        console.log('=== approveBookingAsLecturer END ===');
      }
    },
    []
  );

  const rejectBookingAsLecturer = useCallback(
    async (id: string, comment: string): Promise<Booking | null> => {
      setIsLoading(true);
      setError(null);
      console.log('=== rejectBookingAsLecturer START ===');
      console.log('Booking ID:', id);
      console.log('Comment:', comment);
      try {
        const response = await bookingApi.lecturerApprove(id, { approved: false, comment });
        console.log('API Response:', response);
        
        // Backend returns success with null data, just check success flag
        if (response.success) {
          console.log('✅ Rejection successful');
          // Return a dummy booking object since backend doesn't return the updated booking
          return { id } as Booking;
        } else {
          const errorMsg = response.message || "Failed to reject booking";
          console.error('❌ Rejection failed');
          setError(errorMsg);
          return null;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to reject booking";
        console.error('❌ Rejection failed - exception caught:', err);
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
        console.log('=== rejectBookingAsLecturer END ===');
      }
    },
    []
  );

  const cancelBooking = useCallback(async (id: string, reason?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = reason ? await bookingApi.cancelWithReason(id, reason) : await bookingApi.cancel(id);
      if (response && response.success) {
        return true;
      } else {
        setError(response?.message || "Failed to cancel booking");
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to cancel booking";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Admin approve booking (Admin only) - uses admin-approve endpoint
   */
  const approveBookingAsAdmin = useCallback(
    async (id: string, comment?: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await bookingApi.adminApproveBooking(id, { approved: true, comment });
        if (response.success) {
          return true;
        } else {
          setError(response.message || "Failed to approve booking");
          return false;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to approve booking";
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Admin reject booking (Admin only) - uses admin-approve endpoint with approved: false
   */
  const rejectBookingAsAdmin = useCallback(
    async (id: string, reason: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await bookingApi.adminApproveBooking(id, { approved: false, comment: reason });
        if (response.success) {
          return true;
        } else {
          setError(response.message || "Failed to reject booking");
          return false;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to reject booking";
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    createBooking,
    approveBooking,
    rejectBooking,
    approveBookingAsLecturer,
    rejectBookingAsLecturer,
    approveBookingAsAdmin,
    rejectBookingAsAdmin,
    cancelBooking,
    isLoading,
    error,
  };
}

/**
 * Hook to get booking history (approved/completed bookings)
 */
export function useBookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingApi.getMyHistory();
      if (response.success && response.data) {
        // Filter to show approved/completed/rejected bookings
        const historyBookings = response.data.filter(
          (booking: Booking) => 
            booking.status === "Approved" || 
            booking.status === "Completed" || 
            booking.status === "InUse" ||
            booking.status === "NoShow" ||
            booking.status === "Rejected"
        );
        setBookings(historyBookings);
      } else {
        setError(response.message || "Failed to fetch booking history");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch booking history";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    bookings,
    fetchHistory,
    isLoading,
    error,
  };
}

/**
 * Hook to get approved bookings (Admin)
 */
export function useApprovedBookings(facilityId?: string, pageNumber: number = 1, pageSize: number = 50) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApproved = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingApi.getApprovedBookings({ facilityId, pageNumber, pageSize });
      if (response && response.success && response.data) {
        // response.data may be paginated or a list depending on backend
        // try to normalize
        const data = Array.isArray(response.data) ? response.data : (response.data.items || []);
        setBookings(data);
      } else {
        setError(response?.message || 'Failed to fetch approved bookings');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch approved bookings';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [facilityId, pageNumber, pageSize]);

  useEffect(() => {
    fetchApproved();
  }, [fetchApproved]);

  return { bookings, fetchApproved, isLoading, error };
}


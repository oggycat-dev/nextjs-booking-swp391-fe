/**
 * Facility Issue Hooks
 * Provides hooks for facility issue operations
 */

import { useState, useCallback, useEffect } from 'react';
import { facilityIssueApi } from '@/lib/api/facility-issue';
import type {
  FacilityIssue,
  ReportFacilityIssueRequest,
  ChangeRoomRequest,
} from '@/types';

/**
 * Hook to get pending facility issues (Admin only)
 */
export function usePendingFacilityIssues() {
  const [issues, setIssues] = useState<FacilityIssue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingIssues = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await facilityIssueApi.getPendingIssues();
      if (response.success && response.data) {
        setIssues(response.data);
      } else {
        setError(response.message || 'Failed to fetch pending issues');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch pending issues';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingIssues();
  }, [fetchPendingIssues]);

  return {
    issues,
    fetchPendingIssues,
    isLoading,
    error,
  };
}

/**
 * Hook to get my facility issue reports (Student/Lecturer)
 */
export function useMyFacilityIssues() {
  const [issues, setIssues] = useState<FacilityIssue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyIssues = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await facilityIssueApi.getMyReports();
      if (response.success && response.data) {
        setIssues(response.data);
      } else {
        setError(response.message || 'Failed to fetch my reports');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch my reports';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyIssues();
  }, [fetchMyIssues]);

  return {
    issues,
    fetchMyIssues,
    isLoading,
    error,
  };
}

/**
 * Hook for facility issue mutations (report, change room)
 */
export function useFacilityIssueMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Report a facility issue (Student/Lecturer only)
   * Requires: User must be checked in to the booking
   */
  const reportIssue = useCallback(
    async (request: ReportFacilityIssueRequest): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await facilityIssueApi.reportIssue(request);
        if (response.success) {
          return true;
        } else {
          setError(response.message || 'Failed to report issue');
          return false;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to report issue';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Change room for a reported issue (Admin only)
   * When admin calls this function, the room change is executed immediately (no additional approval needed):
   * - New facility will be set to booked status automatically
   * - Email will be sent to user about room change
   * - Booking time will be from approval time to original booking end time
   * - Only the facility is changed, the booking owner remains the same
   */
  const changeRoom = useCallback(
    async (reportId: string, request: ChangeRoomRequest): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await facilityIssueApi.changeRoom(reportId, request);
        if (response.success) {
          return true;
        } else {
          setError(response.message || 'Failed to change room');
          return false;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to change room';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    reportIssue,
    changeRoom,
    isLoading,
    error,
    resetError,
  };
}

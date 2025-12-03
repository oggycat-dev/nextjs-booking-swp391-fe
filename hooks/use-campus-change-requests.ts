"use client";

import { useState, useCallback } from "react";
import { campusChangeRequestsApi } from "@/lib/api/campus-change-requests";
import type {
  CampusChangeRequest,
  RequestCampusChangeRequest,
  ApproveCampusChangeRequest,
  MyCampusChangeRequest,
} from "@/types";

export function useCampusChangeRequests() {
  const [requests, setRequests] = useState<CampusChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await campusChangeRequestsApi.getPending();
      if (response.success && response.data) {
        setRequests(response.data);
      } else {
        setError(response.message || "Failed to fetch campus change requests");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch campus change requests";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    requests,
    fetchPending,
    isLoading,
    error,
  };
}

export function useMyCampusChangeRequests() {
  const [myRequests, setMyRequests] = useState<MyCampusChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await campusChangeRequestsApi.getMyRequests();
      if (response.success && response.data) {
        setMyRequests(response.data);
      } else {
        setError(response.message || "Failed to fetch your campus change requests");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch your campus change requests";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    myRequests,
    fetchMyRequests,
    isLoading,
    error,
  };
}

export function useCampusChangeRequestMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestCampusChange = useCallback(
    async (request: RequestCampusChangeRequest): Promise<CampusChangeRequest | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await campusChangeRequestsApi.request(request);
        if (response.success && response.data) {
          return response.data;
        } else {
          setError(response.message || "Failed to submit campus change request");
          return null;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to submit campus change request";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const approveRequest = useCallback(
    async (requestId: string, request: ApproveCampusChangeRequest): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await campusChangeRequestsApi.approve(requestId, request);
        if (response.success) {
          return true;
        } else {
          setError(response.message || "Failed to process campus change request");
          return false;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to process campus change request";
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    requestCampusChange,
    approveRequest,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

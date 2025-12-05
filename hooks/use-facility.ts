"use client";

import { useState, useCallback, useEffect } from "react";
import { facilityApi } from "@/lib/api/facility";
import type {
  Facility,
  CreateFacilityRequest,
  UpdateFacilityRequest,
  GetFacilitiesQuery,
} from "@/types";

export function useFacilities(initialQuery?: GetFacilitiesQuery) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFacilities = useCallback(async (query?: GetFacilitiesQuery) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await facilityApi.getAll(query);
      console.log('=== Facilities API Response ===', response);
      if (response.success && response.data) {
        console.log('Facilities data:', response.data);
        console.log('First facility imageUrl:', response.data[0]?.imageUrl);
        setFacilities(response.data);
      } else {
        setError(response.message || "Failed to fetch facilities");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch facilities";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount with initial query
  useEffect(() => {
    fetchFacilities(initialQuery);
  }, [fetchFacilities, initialQuery]);

  return {
    facilities,
    fetchFacilities,
    isLoading,
    error,
  };
}

export function useFacility(id?: string) {
  const [facility, setFacility] = useState<Facility | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFacility = useCallback(async (facilityId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await facilityApi.getById(facilityId);
      if (response.success && response.data) {
        setFacility(response.data);
      } else {
        setError(response.message || "Failed to fetch facility");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch facility";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchFacility(id);
    }
  }, [id, fetchFacility]);

  return {
    facility,
    fetchFacility,
    isLoading,
    error,
  };
}

export function useFacilityMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFacility = useCallback(async (request: CreateFacilityRequest): Promise<Facility | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await facilityApi.create(request);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || "Failed to create facility");
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create facility";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFacility = useCallback(async (id: string, request: UpdateFacilityRequest): Promise<Facility | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await facilityApi.update(id, request);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || "Failed to update facility");
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update facility";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteFacility = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await facilityApi.delete(id);
      if (response.success) {
        return true;
      } else {
        setError(response.message || "Failed to delete facility");
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete facility";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createFacility,
    updateFacility,
    deleteFacility,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

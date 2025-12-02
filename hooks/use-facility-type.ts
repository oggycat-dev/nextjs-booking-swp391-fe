"use client";

import { useState, useCallback, useEffect } from "react";
import { facilityTypeApi } from "@/lib/api/facility-type";
import type { FacilityType, CreateFacilityTypeRequest } from "@/types";

export function useFacilityTypes(activeOnly?: boolean) {
  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFacilityTypes = useCallback(async (onlyActive?: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await facilityTypeApi.getAll(onlyActive);
      if (response.success && response.data) {
        setFacilityTypes(response.data);
      } else {
        setError(response.message || "Failed to fetch facility types");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch facility types";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchFacilityTypes(activeOnly);
  }, [fetchFacilityTypes, activeOnly]);

  return {
    facilityTypes,
    fetchFacilityTypes,
    isLoading,
    error,
  };
}

export function useFacilityTypeMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFacilityType = useCallback(async (request: CreateFacilityTypeRequest): Promise<FacilityType | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await facilityTypeApi.create(request);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || "Failed to create facility type");
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create facility type";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createFacilityType,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

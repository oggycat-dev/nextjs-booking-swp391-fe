"use client";

import { useState, useCallback, useEffect } from "react";
import { campusApi } from "@/lib/api/campus";
import type { Campus, CreateCampusRequest, UpdateCampusRequest } from "@/types";

export function useCampuses() {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampuses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await campusApi.getAll();
      if (response.success && response.data) {
        setCampuses(response.data);
      } else {
        setError(response.message || "Failed to fetch campuses");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch campuses";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchCampuses();
  }, [fetchCampuses]);

  return {
    campuses,
    fetchCampuses,
    isLoading,
    error,
  };
}

export function useCampus(id?: string) {
  const [campus, setCampus] = useState<Campus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampus = useCallback(async (campusId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await campusApi.getById(campusId);
      if (response.success && response.data) {
        setCampus(response.data);
      } else {
        setError(response.message || "Failed to fetch campus");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch campus";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchCampus(id);
    }
  }, [id, fetchCampus]);

  return {
    campus,
    fetchCampus,
    isLoading,
    error,
  };
}

export function useCampusMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCampus = useCallback(async (request: CreateCampusRequest): Promise<Campus | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await campusApi.create(request);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || "Failed to create campus");
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create campus";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCampus = useCallback(async (id: string, request: UpdateCampusRequest): Promise<Campus | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await campusApi.update(id, request);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || "Failed to update campus");
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update campus";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCampus = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await campusApi.delete(id);
      if (response.success) {
        return true;
      } else {
        setError(response.message || "Failed to delete campus");
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete campus";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createCampus,
    updateCampus,
    deleteCampus,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

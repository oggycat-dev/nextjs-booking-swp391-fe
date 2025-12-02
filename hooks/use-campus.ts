"use client";

import { useState, useCallback, useEffect } from "react";
import { campusApi } from "@/lib/api/campus";
import type { Campus, CreateCampusRequest, UpdateCampusRequest } from "@/types";

// Helper function to ensure time format is HH:mm:ss (24-hour)
const ensureTimeFormat = (time: string): string => {
  if (!time) return time;
  
  // Remove any whitespace
  let cleanTime = time.trim();
  
  // Check if it has AM/PM
  const hasAMPM = /\s*(AM|PM|am|pm)$/i.test(cleanTime);
  
  if (hasAMPM) {
    // Extract hours, minutes, and AM/PM
    const match = cleanTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const period = match[3].toUpperCase();
      
      // Convert to 24-hour format
      if (period === "PM" && hours !== 12) {
        hours += 12;
      } else if (period === "AM" && hours === 12) {
        hours = 0;
      }
      
      // Format as HH:mm:ss
      return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
    }
  }
  
  // If already in HH:mm or HH:mm:ss format, just ensure :ss is present
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(cleanTime)) {
    const parts = cleanTime.split(':');
    const hours = parts[0].padStart(2, '0');
    const minutes = parts[1];
    const seconds = parts[2] || '00';
    return `${hours}:${minutes}:${seconds}`;
  }
  
  // Return as-is if format is unrecognized
  return cleanTime;
};

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
      // Ensure time format is HH:mm:ss (24-hour)
      const sanitizedRequest = {
        ...request,
        workingHoursStart: ensureTimeFormat(request.workingHoursStart),
        workingHoursEnd: ensureTimeFormat(request.workingHoursEnd),
      };
      
      const response = await campusApi.create(sanitizedRequest);
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
      // Ensure time format is HH:mm:ss (24-hour)
      const sanitizedRequest = {
        ...request,
        workingHoursStart: ensureTimeFormat(request.workingHoursStart),
        workingHoursEnd: ensureTimeFormat(request.workingHoursEnd),
      };
      
      const response = await campusApi.update(id, sanitizedRequest);
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

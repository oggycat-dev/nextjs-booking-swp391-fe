import { useState, useCallback, useEffect } from "react";
import { holidayApi } from "@/lib/api/holiday";
import type { Holiday, CreateHolidayRequest } from "@/types";

export function useHolidays() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHolidays = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await holidayApi.getAll();
      if (response.success && response.data) {
        setHolidays(response.data);
      } else {
        setError(response.message || "Failed to fetch holidays");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch holidays";
      setError(message);
      console.error("Error fetching holidays:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  return {
    holidays,
    isLoading,
    error,
    fetchHolidays,
  };
}

export function useHolidayMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createHoliday = useCallback(async (request: CreateHolidayRequest): Promise<Holiday | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await holidayApi.create(request);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || "Failed to create holiday");
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create holiday";
      setError(message);
      console.error("Error creating holiday:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteHoliday = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await holidayApi.delete(id);
      if (response.success) {
        return true;
      } else {
        setError(response.message || "Failed to delete holiday");
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete holiday";
      setError(message);
      console.error("Error deleting holiday:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createHoliday,
    deleteHoliday,
    isLoading,
    error,
  };
}

"use client";

import { useState, useCallback, useEffect } from "react";
import { profileApi } from "@/lib/api/profile";
import type { User, UpdateProfileRequest } from "@/types";

export function useProfile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await profileApi.getMyProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError(response.message || "Failed to fetch profile");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch profile";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (request: UpdateProfileRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await profileApi.updateMyProfile(request);
      if (response.success) {
        // Refetch profile to get updated data
        await fetchProfile();
        return true;
      } else {
        setError(response.message || "Failed to update profile");
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    fetchProfile,
    updateProfile,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}


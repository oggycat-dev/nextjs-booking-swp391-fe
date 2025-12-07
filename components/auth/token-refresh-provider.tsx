"use client";

import { useEffect, useCallback, useRef } from "react";
import { authApi } from "@/lib/api/auth";
import { storage } from "@/lib/storage-manager";
import { useRouter } from "next/navigation";

/**
 * TokenRefreshProvider Component
 * Automatically refreshes access token before it expires
 * Monitors token expiry and handles refresh logic
 */
export function TokenRefreshProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  const logout = useCallback(() => {
    // Clear all auth data from storage
    storage.clear();
    
    // Redirect to login
    window.location.href = "/";
  }, []);

  const parseJwt = (token: string): { exp?: number } | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Failed to parse JWT:", error);
      return null;
    }
  };

  const getTokenExpiry = (token: string): number | null => {
    const payload = parseJwt(token);
    if (payload && payload.exp) {
      return payload.exp * 1000; // Convert to milliseconds
    }
    return null;
  };

  const refreshAccessToken = useCallback(async () => {
    // Prevent concurrent refresh attempts
    if (isRefreshingRef.current) {
      return;
    }

    isRefreshingRef.current = true;

    try {
      const refreshToken = storage.getItem("refreshToken");
      
      if (!refreshToken) {
        console.log("No refresh token available, logging out");
        logout();
        return;
      }

      console.log("Refreshing access token...");
      const response = await authApi.refreshToken({ refreshToken });

      if (response.success && response.data) {
        // Update tokens in storage
        storage.setItem("token", response.data.token);
        storage.setItem("refreshToken", response.data.refreshToken);
        
        // Update user info if provided
        if (response.data.user) {
          storage.setItem("user", JSON.stringify(response.data.user));
        }
        
        // Store expiry time
        const expiryTime = getTokenExpiry(response.data.token);
        if (expiryTime) {
          storage.setItem("tokenExpiry", expiryTime.toString());
        }

        console.log("Token refreshed successfully");
        
        // Schedule next refresh
        scheduleTokenRefresh(response.data.token);
      } else {
        console.error("Failed to refresh token:", response.message);
        logout();
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      logout();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [logout]);

  const scheduleTokenRefresh = useCallback((token: string) => {
    // Clear existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const expiryTime = getTokenExpiry(token);
    
    if (!expiryTime) {
      console.warn("Could not determine token expiry, will check again in 5 minutes");
      // Check again in 5 minutes
      refreshTimerRef.current = setTimeout(() => {
        refreshAccessToken();
      }, 5 * 60 * 1000);
      return;
    }

    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;
    
    // Refresh 5 minutes before expiry
    const refreshTime = timeUntilExpiry - (5 * 60 * 1000);

    if (refreshTime <= 0) {
      // Token already expired or about to expire, refresh immediately
      console.log("Token expired or about to expire, refreshing now");
      refreshAccessToken();
    } else {
      console.log(`Token will be refreshed in ${Math.round(refreshTime / 1000 / 60)} minutes`);
      refreshTimerRef.current = setTimeout(() => {
        refreshAccessToken();
      }, refreshTime);
    }
  }, [refreshAccessToken]);

  const checkTokenExpiry = useCallback(() => {
    const token = storage.getItem("token");
    
    if (!token) {
      return;
    }

    const expiryTime = getTokenExpiry(token);
    
    if (!expiryTime) {
      return;
    }

    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;

    // If token expires in less than 5 minutes, refresh now
    if (timeUntilExpiry < 5 * 60 * 1000) {
      refreshAccessToken();
    } else {
      scheduleTokenRefresh(token);
    }
  }, [refreshAccessToken, scheduleTokenRefresh]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") {
      return;
    }

    // Check token expiry on mount
    checkTokenExpiry();

    // Also check periodically (every minute) as a fallback
    const intervalId = setInterval(() => {
      checkTokenExpiry();
    }, 60 * 1000); // Check every minute

    // Handle visibility change - refresh if tab becomes visible and token is about to expire
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkTokenExpiry();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkTokenExpiry]);

  return <>{children}</>;
}

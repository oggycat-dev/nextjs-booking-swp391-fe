"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

/**
 * SessionManager Component
 * Handles session management including:
 * - Auto logout on tab/window close (optional)
 * - Session timeout detection
 * - Idle timeout (optional)
 */
export function SessionManager() {
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined" || !isAuthenticated()) {
      return;
    }

    // Option 1: Clear session on browser/tab close
    // This will logout user when they close the tab/browser
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only clear if user actually closes the browser/tab
      // Not when just navigating within the app
      if (performance.navigation.type === 1) {
        // This is a page refresh, don't logout
        return;
      }
      
      // Store a flag to detect browser close
      sessionStorage.setItem("browserClosing", "true");
    };

    const handleUnload = () => {
      // Check if this is a browser close (not a refresh)
      const browserClosing = sessionStorage.getItem("browserClosing");
      
      if (browserClosing === "true") {
        // Clear all auth data
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        localStorage.removeItem("tokenExpiry");
      }
    };

    // Option 2: Track session start time
    const sessionStart = sessionStorage.getItem("sessionStart");
    if (!sessionStart) {
      sessionStorage.setItem("sessionStart", Date.now().toString());
    }

    // Option 3: Idle timeout - logout after X minutes of inactivity
    let idleTimer: NodeJS.Timeout;
    const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(async () => {
        console.log("User idle for too long, logging out");
        await logout();
        window.location.href = "/";
      }, IDLE_TIMEOUT);
    };

    // Track user activity
    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetIdleTimer);
    });

    // Start idle timer
    resetIdleTimer();

    // Detect when user opens multiple tabs
    const handleStorageChange = (e: StorageEvent) => {
      // If token was removed in another tab, logout this tab too
      if (e.key === "token" && e.newValue === null) {
        window.location.href = "/";
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // UNCOMMENT these lines if you want to auto-logout on browser close
    // window.addEventListener("beforeunload", handleBeforeUnload);
    // window.addEventListener("unload", handleUnload);

    // Cleanup
    return () => {
      clearTimeout(idleTimer);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer);
      });
      window.removeEventListener("storage", handleStorageChange);
      // window.removeEventListener("beforeunload", handleBeforeUnload);
      // window.removeEventListener("unload", handleUnload);
    };
  }, [logout, isAuthenticated]);

  return null; // This component doesn't render anything
}

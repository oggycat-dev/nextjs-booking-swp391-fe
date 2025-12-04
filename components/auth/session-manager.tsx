"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

/**
 * SessionManager Component
 * Handles session management including:
 * - Multi-tab sync (logout all tabs when logout in one tab)
 * - Idle timeout (optional, can be disabled)
 */
export function SessionManager() {
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined" || !isAuthenticated()) {
      return;
    }

    // Detect when user opens multiple tabs - sync logout across tabs
    const handleStorageChange = (e: StorageEvent) => {
      // If token was removed in another tab, logout this tab too
      if (e.key === "token" && e.newValue === null) {
        window.location.href = "/";
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Optional: Idle timeout - logout after X minutes of inactivity
    // Disabled by default - can be enabled if needed
    // Uncomment below to enable idle timeout
    /*
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

    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetIdleTimer);
    });

    resetIdleTimer();
    */

    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      // Uncomment if using idle timeout
      // clearTimeout(idleTimer);
      // activityEvents.forEach((event) => {
      //   window.removeEventListener(event, resetIdleTimer);
      // });
    };
  }, [logout, isAuthenticated]);

  return null; // This component doesn't render anything
}

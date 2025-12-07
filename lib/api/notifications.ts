import { getAuthHeaders, API_URL } from "@/lib/api-client";
import type { ApiResponse, RegisterFcmTokenRequest, NotificationSummaryDto, NotificationDto } from "@/types";

/**
 * Notifications API
 * Handles Firebase Cloud Messaging token registration/unregistration and notification management
 */
export const notificationsApi = {
  /**
   * Register FCM token for current user (Admin only)
   * POST /api/notifications/register-token
   */
  registerToken: async (request: RegisterFcmTokenRequest): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_URL}/notifications/register-token`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to register FCM token");
    }

    return response.json();
  },

  /**
   * Unregister FCM token for current user (on logout)
   * DELETE /api/notifications/unregister-token
   */
  unregisterToken: async (): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_URL}/notifications/unregister-token`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to unregister FCM token");
    }

    return response.json();
  },

  /**
   * Get my notifications from backend
   * GET /api/notifications/my-notifications?isRead={boolean}&limit={number}
   */
  getMyNotifications: async (
    isRead?: boolean | null,
    limit?: number
  ): Promise<ApiResponse<NotificationSummaryDto>> => {
    const params = new URLSearchParams();
    if (isRead !== null && isRead !== undefined) {
      params.append("isRead", isRead.toString());
    }
    if (limit !== undefined) {
      params.append("limit", limit.toString());
    }

    const url = `${API_URL}/notifications/my-notifications${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to get notifications");
    }

    return response.json();
  },

  /**
   * Mark notification as read
   * POST /api/notifications/{notificationId}/mark-read
   */
  markAsRead: async (notificationId: string): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_URL}/notifications/${notificationId}/mark-read`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to mark notification as read");
    }

    return response.json();
  },

  /**
   * Mark all notifications as read
   * POST /api/notifications/mark-all-read
   */
  markAllAsRead: async (): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_URL}/notifications/mark-all-read`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to mark all notifications as read");
    }

    return response.json();
  },
};

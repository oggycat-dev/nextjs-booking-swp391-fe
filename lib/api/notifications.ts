import { getAuthHeaders, API_URL } from "@/lib/api-client";
import type { ApiResponse, RegisterFcmTokenRequest } from "@/types";

/**
 * Notifications API
 * Handles Firebase Cloud Messaging token registration/unregistration
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
};

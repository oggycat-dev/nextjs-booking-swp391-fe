/**
 * Base API Client Configuration
 * Provides common utilities for making API requests
 */

import { storage } from './storage-manager';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000');

export const apiConfig = {
  baseURL: API_URL,
  timeout: API_TIMEOUT,
};

/**
 * Get API URL for an endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_URL}/${cleanEndpoint}`;
};

/**
 * Check if token is expired or about to expire (within 1 minute)
 */
function isTokenExpiringSoon(token: string): boolean {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    
    if (payload.exp) {
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiryTime - now;
      
      // Return true if token expires in less than 1 minute
      return timeUntilExpiry < 60 * 1000;
    }
  } catch (error) {
    console.error("Failed to check token expiry:", error);
  }
  return false;
}

/**
 * Refresh token if needed
 */
async function refreshTokenIfNeeded(): Promise<boolean> {
  const token = typeof window !== "undefined" ? storage.getItem("token") : null;
  
  if (!token || !isTokenExpiringSoon(token)) {
    return true; // Token is fine
  }

  const refreshToken = typeof window !== "undefined" ? storage.getItem("refreshToken") : null;
  
  if (!refreshToken) {
    console.error("No refresh token available");
    return false;
  }

  try {
    console.log("Token expiring soon, refreshing...");
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        storage.setItem("token", data.data.token);
        storage.setItem("refreshToken", data.data.refreshToken);
        
        if (data.data.user) {
          storage.setItem("user", JSON.stringify(data.data.user));
        }
        
        console.log("Token refreshed successfully");
        return true;
      }
    }
    
    console.error("Failed to refresh token");
    return false;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return false;
  }
}

/**
 * Get authentication headers with token
 * Automatically refreshes token if it's about to expire
 */
export async function getAuthHeadersAsync(contentType: string = "application/json"): Promise<HeadersInit> {
  // Try to refresh token if needed
  await refreshTokenIfNeeded();
  
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: HeadersInit = {};
  
  // Only set Content-Type if not multipart/form-data (browser will set it with boundary)
  if (contentType !== "multipart/form-data") {
    headers["Content-Type"] = contentType;
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Get authentication headers with token (synchronous version for backward compatibility)
 */
export function getAuthHeaders(contentType: string = "application/json"): HeadersInit {
  const token = typeof window !== "undefined" ? storage.getItem("token") : null;
  const headers: HeadersInit = {};
  
  // Only set Content-Type if not multipart/form-data (browser will set it with boundary)
  if (contentType !== "multipart/form-data") {
    headers["Content-Type"] = contentType;
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Generic fetch wrapper with error handling and timeout
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = getApiUrl(endpoint);
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  };

  // Add timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

/**
 * Convenience methods for HTTP verbs
 */
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};


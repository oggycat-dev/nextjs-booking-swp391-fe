"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { notificationsApi } from '@/lib/api/notifications';
import type { NotificationDto } from '@/types';
import {
  getStoredNotifications,
  saveNotificationsToStorage,
  addNotificationToStorage,
  markNotificationAsRead as markReadInStorage,
  markAllNotificationsAsRead as markAllReadInStorage,
  deleteNotificationFromStorage,
} from '@/lib/notifications-storage';
import type { PushNotification, NotificationData } from '@/types';

/**
 * Hook for managing notifications
 * Handles loading from backend, syncing with localStorage, and real-time updates
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Convert backend NotificationDto to PushNotification
  const convertToPushNotification = useCallback((dto: NotificationDto): PushNotification => {
    let data: NotificationData | undefined = undefined;
    if (dto.data) {
      try {
        data = JSON.parse(dto.data);
      } catch (e) {
        console.error('Failed to parse notification data:', e);
      }
    }

    return {
      id: dto.id,
      type: dto.type,
      title: dto.title,
      body: dto.body,
      data: data,
      read: dto.isRead,
      createdAt: dto.createdAt,
    };
  }, []);

  // Load notifications from backend and sync with localStorage
  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await notificationsApi.getMyNotifications(undefined, 100);
      
      if (response.success && response.data) {
        const backendNotifications = response.data.notifications.map(convertToPushNotification);
        
        // Merge with localStorage (keep local notifications that aren't in backend)
        const localNotifications = getStoredNotifications();
        const backendIds = new Set(backendNotifications.map(n => n.id));
        const localOnly = localNotifications.filter(n => !backendIds.has(n.id));
        
        // Combine: backend first, then local-only
        const merged = [...backendNotifications, ...localOnly]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 100);
        
        setNotifications(merged);
        saveNotificationsToStorage(merged);
      }
    } catch (err) {
      console.error('Failed to load notifications from backend:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
      
      // Fallback to localStorage
      const stored = getStoredNotifications();
      setNotifications(stored);
      
      toast({
        title: "Warning",
        description: "Could not load notifications from server. Showing cached notifications.",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  }, [convertToPushNotification, toast]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    // Update UI immediately
    setNotifications(prev => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      // Save to localStorage immediately
      markReadInStorage(id);
      return updated;
    });

    // Sync with backend
    try {
      await notificationsApi.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read on backend:', err);
      toast({
        title: "Warning",
        description: "Could not sync with server. Changes saved locally.",
        variant: "default",
      });
    }
  }, [toast]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    // Update UI immediately
    setNotifications(prev => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      // Save to localStorage immediately
      markAllReadInStorage();
      return updated;
    });

    // Sync with backend
    try {
      await notificationsApi.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read on backend:', err);
      toast({
        title: "Warning",
        description: "Could not sync with server. Changes saved locally.",
        variant: "default",
      });
    }
  }, [toast]);

  // Delete notification
  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter((n) => n.id !== id);
      // Save to localStorage immediately
      deleteNotificationFromStorage(id);
      return updated;
    });
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    saveNotificationsToStorage([]);
  }, []);

  // Add new notification (from push notification)
  const addNotification = useCallback((newNotification: PushNotification) => {
    setNotifications(prev => {
      // Check if notification already exists (avoid duplicates)
      const exists = prev.some(n => n.id === newNotification.id);
      if (exists) return prev;
      // Add new notification at the beginning, keep max 100
      const updated = [newNotification, ...prev].slice(0, 100);
      // Save to localStorage
      addNotificationToStorage(newNotification);
      return updated;
    });
  }, []);

  // Load notifications from backend on mount
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (notifications.length > 0 || typeof window !== 'undefined') {
      saveNotificationsToStorage(notifications);
    }
  }, [notifications]);

  // Listen for new notifications from service worker and BroadcastChannel
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Listen for messages from service worker
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NEW_NOTIFICATION' && event.data.notification) {
        addNotification(event.data.notification);
      }
    };

    // Listen for BroadcastChannel messages (from other tabs)
    let broadcastChannel: BroadcastChannel | null = null;
    if (window.BroadcastChannel) {
      broadcastChannel = new BroadcastChannel('notifications');
      broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'NEW_NOTIFICATION' && event.data.notification) {
          addNotification(event.data.notification);
        } else if (event.data?.type === 'NOTIFICATIONS_UPDATED') {
          // Reload from storage when updated from another tab
          const stored = getStoredNotifications();
          setNotifications(stored);
        }
      }
    }

    // Listen for storage events (from other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_notifications' && e.newValue) {
        try {
          const stored = JSON.parse(e.newValue);
          setNotifications(stored);
        } catch (error) {
          console.error('Error parsing storage update:', error);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Listen for service worker messages
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
    }

    return () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
      }
      if (broadcastChannel) {
        broadcastChannel.close();
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [addNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
  };
}


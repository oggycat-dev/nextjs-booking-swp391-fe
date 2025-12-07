"use client";

import { useEffect, useState, useCallback } from 'react';
import { messaging, getToken, onMessage, isFirebaseConfigured, MessagePayload } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { notificationsApi } from '@/lib/api/notifications';
import type { NotificationData, FirebaseNotificationState } from '@/types';

export function useFirebaseNotification() {
  const [state, setState] = useState<FirebaseNotificationState>({
    fcmToken: null,
    isSupported: false,
    isLoading: false,
    error: null,
  });
  const { toast } = useToast();
  const router = useRouter();

  // Check if browser supports notifications
  useEffect(() => {
    const supported = typeof window !== 'undefined' && 'Notification' in window && messaging && isFirebaseConfigured();
    if (supported) {
      setState(prev => ({ ...prev, isSupported: true }));
    }
  }, []);

  // Request notification permission and get FCM token
  const requestPermission = useCallback(async (): Promise<string | null> => {
    if (!state.isSupported || !messaging) {
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Unregister old service workers first
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          if (registration.active?.scriptURL.includes('firebase-messaging-sw.js')) {
            await registration.unregister();
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });
        
        await navigator.serviceWorker.ready;

        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });
        
        if (token) {
          setState(prev => ({ ...prev, fcmToken: token, isLoading: false }));
          return token;
        } else {
          setState(prev => ({ ...prev, isLoading: false, error: 'No registration token available' }));
          return null;
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false, error: 'Notification permission denied' }));
        return null;
      }
    } catch (error) {
      console.error('[FCM] Error getting FCM token:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get notification token';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return null;
    }
  }, [state.isSupported]);

  // Register FCM token with backend
  const registerToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      await notificationsApi.registerToken({ fcmToken: token });
      toast({
        title: "Notifications Enabled",
        description: "You will now receive push notifications",
      });
      return true;
    } catch (error) {
      console.error('[FCM] Error registering token:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register token",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  // Unregister FCM token from backend
  const unregisterToken = useCallback(async (): Promise<boolean> => {
    try {
      await notificationsApi.unregisterToken();
      setState(prev => ({ ...prev, fcmToken: null }));
      return true;
    } catch (error) {
      console.error('[FCM] Error unregistering token:', error);
      return false;
    }
  }, []);

  // Handle notification click - navigate to appropriate page
  const handleNotificationClick = useCallback((data?: NotificationData) => {
    if (!data) return;

    switch (data.type) {
      case 'new_registration':
        router.push('/dashboard/admin/users');
        break;
      case 'campus_change_request':
        router.push('/dashboard/admin/users');
        break;
      case 'new_booking':
        if (data.bookingId) {
          router.push(`/dashboard/admin/bookings?bookingId=${data.bookingId}`);
        } else {
          router.push('/dashboard/admin/bookings');
        }
        break;
      default:
        router.push('/dashboard');
    }
  }, [router]);

  // Save notification to localStorage
  const saveNotification = useCallback((payload: MessagePayload) => {
    try {
      const title = payload.notification?.title || 'New Notification';
      const body = payload.notification?.body || '';
      const data = payload.data as NotificationData | undefined;

      const notification = {
        id: Date.now().toString(),
        type: data?.type || 'notification',
        title,
        body,
        data: data,
        read: false,
        createdAt: new Date().toISOString(),
      };

      // Get existing notifications
      const storageKey = 'admin_notifications';
      const existing = localStorage.getItem(storageKey);
      const notifications = existing ? JSON.parse(existing) : [];
      
      // Add new notification at the beginning
      notifications.unshift(notification);
      
      // Keep only last 100 notifications
      const trimmed = notifications.slice(0, 100);
      
      // Save back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(trimmed));

      // Broadcast to other tabs/pages
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        const channel = new BroadcastChannel('notifications');
        channel.postMessage({ type: 'NEW_NOTIFICATION', notification });
        channel.close();
      }
    } catch (error) {
      console.error('[FCM] Error saving notification:', error);
    }
  }, []);

  // Listen for foreground messages
  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
      const title = payload.notification?.title || 'New Notification';
      const body = payload.notification?.body || '';

      saveNotification(payload);

      toast({
        title,
        description: body,
        duration: 8000,
      });
    });

    return () => {
      unsubscribe();
    };
  }, [toast, handleNotificationClick, saveNotification]);

  // Setup notifications for admin user
  const setupNotifications = useCallback(async (): Promise<boolean> => {
    const token = await requestPermission();
    if (token) {
      return await registerToken(token);
    }
    return false;
  }, [requestPermission, registerToken]);

  return {
    ...state,
    requestPermission,
    registerToken,
    unregisterToken,
    setupNotifications,
    handleNotificationClick,
  };
}

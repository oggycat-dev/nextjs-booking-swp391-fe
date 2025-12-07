"use client";

import { useEffect, useRef } from 'react';
import { useFirebaseNotification } from '@/hooks/use-firebase-notification';

interface FirebaseNotificationProviderProps {
  children: React.ReactNode;
  userRole: string;
}

/**
 * Firebase Notification Provider
 * Automatically sets up Firebase Cloud Messaging for admin users
 * 
 * This component should be placed in the dashboard layout to automatically
 * request notification permissions and register FCM tokens for admin users.
 */
export function FirebaseNotificationProvider({ 
  children, 
  userRole 
}: FirebaseNotificationProviderProps) {
  const { isSupported, setupNotifications, unregisterToken } = useFirebaseNotification();
  const hasSetup = useRef(false);

  useEffect(() => {
    const setupAdminNotifications = async () => {
      if (userRole === 'admin' && isSupported && !hasSetup.current) {
        hasSetup.current = true;
        
        setTimeout(async () => {
          const permission = Notification.permission;
          
          if (permission === 'denied') {
            hasSetup.current = false;
            return;
          }
          
          const success = await setupNotifications();
          if (!success) {
            hasSetup.current = false;
          }
        }, 2000);
      }
    };

    setupAdminNotifications();
  }, [userRole, isSupported, setupNotifications]);


  return <>{children}</>;
}

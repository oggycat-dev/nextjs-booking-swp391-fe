import type { PushNotification } from '@/types';

const NOTIFICATIONS_STORAGE_KEY = 'admin_notifications';
const MAX_NOTIFICATIONS = 100;

/**
 * Get all notifications from localStorage
 */
export function getStoredNotifications(): PushNotification[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!stored) return [];
    
    const notifications = JSON.parse(stored);
    return Array.isArray(notifications) ? notifications : [];
  } catch (error) {
    console.error('[Notifications Storage] Error reading notifications:', error);
    return [];
  }
}

/**
 * Save notifications to localStorage
 */
export function saveNotificationsToStorage(notifications: PushNotification[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Keep only last MAX_NOTIFICATIONS
    const trimmed = notifications.slice(0, MAX_NOTIFICATIONS);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(trimmed));
    
    // Broadcast to other tabs
    if (window.BroadcastChannel) {
      const channel = new BroadcastChannel('notifications');
      channel.postMessage({ 
        type: 'NOTIFICATIONS_UPDATED',
        count: trimmed.length,
        unreadCount: trimmed.filter(n => !n.read).length
      });
      channel.close();
    }
  } catch (error) {
    console.error('[Notifications Storage] Error saving notifications:', error);
  }
}

/**
 * Add a new notification to storage
 */
export function addNotificationToStorage(notification: PushNotification): void {
  const existing = getStoredNotifications();
  
  // Check if notification already exists (avoid duplicates)
  const exists = existing.some(n => n.id === notification.id);
  if (exists) return;
  
  // Add new notification at the beginning
  const updated = [notification, ...existing];
  saveNotificationsToStorage(updated);
}

/**
 * Update a notification in storage
 */
export function updateNotificationInStorage(id: string, updates: Partial<PushNotification>): void {
  const existing = getStoredNotifications();
  const updated = existing.map(n => 
    n.id === id ? { ...n, ...updates } : n
  );
  saveNotificationsToStorage(updated);
}

/**
 * Delete a notification from storage
 */
export function deleteNotificationFromStorage(id: string): void {
  const existing = getStoredNotifications();
  const updated = existing.filter(n => n.id !== id);
  saveNotificationsToStorage(updated);
}

/**
 * Mark notification as read
 */
export function markNotificationAsRead(id: string): void {
  updateNotificationInStorage(id, { read: true });
}

/**
 * Mark all notifications as read
 */
export function markAllNotificationsAsRead(): void {
  const existing = getStoredNotifications();
  const updated = existing.map(n => ({ ...n, read: true }));
  saveNotificationsToStorage(updated);
}

/**
 * Clear all notifications
 */
export function clearAllNotificationsFromStorage(): void {
  saveNotificationsToStorage([]);
}

/**
 * Get unread count
 */
export function getUnreadCount(): number {
  const notifications = getStoredNotifications();
  return notifications.filter(n => !n.read).length;
}


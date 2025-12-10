/**
 * Storage Manager
 * Provides abstraction layer for browser storage
 * Supports localStorage, sessionStorage, and cookies
 * 
 * Storage options:
 * - 'local': localStorage - Shared across all tabs, persists after browser close
 * - 'session': sessionStorage - Each tab has its own session, cleared on tab close
 * - 'cookie': Cookies - Shared across all tabs, can be httpOnly (server-side only) or accessible from JS
 */

import Cookies from 'js-cookie';

export type StorageType = 'session' | 'local' | 'cookie';

// Default to cookies for better security and cross-tab sharing
// Cookies can be configured with secure, sameSite, and expires options
const DEFAULT_STORAGE_TYPE: StorageType = 'cookie';

// Cookie options
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  path: '/',
  sameSite: 'strict' as const, // 'strict' | 'lax' | 'none'
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:' ? true : false,
};

class StorageManager {
  private storageType: StorageType;

  constructor(type: StorageType = DEFAULT_STORAGE_TYPE) {
    this.storageType = type;
  }

  /**
   * Get the storage object based on type
   */
  private getStorage(): Storage | null {
    if (typeof window === 'undefined') return null;
    if (this.storageType === 'cookie') return null; // Cookies handled separately
    return this.storageType === 'session' ? sessionStorage : localStorage;
  }

  /**
   * Set storage type (session or local)
   */
  setStorageType(type: StorageType): void {
    this.storageType = type;
  }

  /**
   * Get storage type
   */
  getStorageType(): StorageType {
    return this.storageType;
  }

  /**
   * Set item in storage
   */
  setItem(key: string, value: string): void {
    if (this.storageType === 'cookie') {
      Cookies.set(key, value, COOKIE_OPTIONS);
      return;
    }
    
    const storage = this.getStorage();
    if (storage) {
      storage.setItem(key, value);
    }
  }

  /**
   * Get item from storage
   */
  getItem(key: string): string | null {
    if (this.storageType === 'cookie') {
      return Cookies.get(key) || null;
    }
    
    const storage = this.getStorage();
    return storage ? storage.getItem(key) : null;
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): void {
    if (this.storageType === 'cookie') {
      Cookies.remove(key, { path: COOKIE_OPTIONS.path });
      return;
    }
    
    const storage = this.getStorage();
    if (storage) {
      storage.removeItem(key);
    }
  }

  /**
   * Clear all items from storage
   */
  clear(): void {
    if (this.storageType === 'cookie') {
      // Remove all auth-related cookies
      const keysToRemove = ['token', 'refreshToken', 'role', 'user', 'tokenExpiry', 'userEmail'];
      keysToRemove.forEach(key => {
        Cookies.remove(key, { path: COOKIE_OPTIONS.path });
      });
      return;
    }
    
    const storage = this.getStorage();
    if (storage) {
      storage.clear();
    }
  }

  /**
   * Check if key exists in storage
   */
  hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }

  /**
   * Get all keys from storage
   */
  keys(): string[] {
    if (this.storageType === 'cookie') {
      // For cookies, we can't easily get all keys, return known auth keys
      const knownKeys = ['token', 'refreshToken', 'role', 'user', 'tokenExpiry', 'userEmail'];
      return knownKeys.filter(key => Cookies.get(key));
    }
    
    const storage = this.getStorage();
    if (!storage) return [];
    
    const keys: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  }

  /**
   * Migrate data from localStorage to sessionStorage
   */
  migrateFromLocalStorage(): void {
    if (typeof window === 'undefined') return;
    
    const keysToMigrate = ['token', 'refreshToken', 'role', 'user', 'tokenExpiry'];
    
    keysToMigrate.forEach(key => {
      const value = localStorage.getItem(key);
      if (value && !sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, value);
      }
    });
  }

  /**
   * Migrate data from sessionStorage to localStorage
   */
  migrateFromSessionStorage(): void {
    if (typeof window === 'undefined') return;
    
    const keysToMigrate = ['token', 'refreshToken', 'role', 'user', 'tokenExpiry'];
    
    keysToMigrate.forEach(key => {
      const value = sessionStorage.getItem(key);
      if (value && !localStorage.getItem(key)) {
        localStorage.setItem(key, value);
      }
    });
  }

  /**
   * Migrate data from localStorage/sessionStorage to cookies
   */
  migrateToCookies(): void {
    if (typeof window === 'undefined') return;
    
    const keysToMigrate = ['token', 'refreshToken', 'role', 'user', 'tokenExpiry'];
    
    keysToMigrate.forEach(key => {
      // Check localStorage first
      let value = localStorage.getItem(key);
      // If not in localStorage, check sessionStorage
      if (!value) {
        value = sessionStorage.getItem(key);
      }
      // If value exists and not already in cookies, migrate to cookies
      if (value && !Cookies.get(key)) {
        Cookies.set(key, value, COOKIE_OPTIONS);
      }
    });
  }

  /**
   * Copy data from one storage to another
   */
  copyTo(targetType: StorageType): void {
    if (typeof window === 'undefined') return;
    
    const sourceStorage = this.getStorage();
    const targetStorage = targetType === 'session' ? sessionStorage : localStorage;
    
    if (!sourceStorage) return;
    
    for (let i = 0; i < sourceStorage.length; i++) {
      const key = sourceStorage.key(i);
      if (key) {
        const value = sourceStorage.getItem(key);
        if (value) {
          targetStorage.setItem(key, value);
        }
      }
    }
  }
}

// Export singleton instance
export const storage = new StorageManager();

// Export class for custom instances
export default StorageManager;

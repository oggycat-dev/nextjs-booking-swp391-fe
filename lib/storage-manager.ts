/**
 * Storage Manager
 * Provides abstraction layer for browser storage
 * Supports both localStorage (persistent) and sessionStorage (per-tab)
 * 
 * To enable multi-account login in same browser:
 * - Use sessionStorage: Each tab has its own session
 * - Use localStorage: Shared across all tabs (single session)
 */

export type StorageType = 'session' | 'local';

// Default to sessionStorage for multi-account support
const DEFAULT_STORAGE_TYPE: StorageType = 'session';

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
    const storage = this.getStorage();
    if (storage) {
      storage.setItem(key, value);
    }
  }

  /**
   * Get item from storage
   */
  getItem(key: string): string | null {
    const storage = this.getStorage();
    return storage ? storage.getItem(key) : null;
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): void {
    const storage = this.getStorage();
    if (storage) {
      storage.removeItem(key);
    }
  }

  /**
   * Clear all items from storage
   */
  clear(): void {
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

import { GeneratedKeyframe } from '../ai/providers/ImageGenProvider';

export class KeyframeStorageService {
  private static DB_NAME = 'minimax_studio_db';
  private static STORE_NAME = 'scene_keyframes';

  private static openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public static async saveKeyframe(keyframe: GeneratedKeyframe): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      tx.objectStore(this.STORE_NAME).put(keyframe);
    } catch (e) {
      console.warn('[KeyframeStorageService] IndexedDB save error:', e);
    }
  }

  public static async getAllKeyframes(): Promise<GeneratedKeyframe[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(this.STORE_NAME, 'readonly');
        const req = tx.objectStore(this.STORE_NAME).getAll();
        req.onsuccess = () => {
          const list = req.result || [];
          // Sort descending by creation date
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          resolve(list);
        };
        req.onerror = () => resolve([]);
      });
    } catch (e) {
      console.warn('[KeyframeStorageService] IndexedDB fetch error:', e);
      return [];
    }
  }

  public static async deleteKeyframe(id: string): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      tx.objectStore(this.STORE_NAME).delete(id);
    } catch (e) {
      console.warn('[KeyframeStorageService] IndexedDB delete error:', e);
    }
  }
}

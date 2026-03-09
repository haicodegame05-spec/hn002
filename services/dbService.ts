
const DB_NAME = 'QuantumNarratorDB';
const DB_VERSION = 3;
const STORE_NAME = 'gameState';
const IMAGE_STORE = 'localImages';
const SETTINGS_STORE = 'appSettings';

export interface SaveMetadata {
  playerName: string;
  level: number;
  timestamp: number;
  genre: string;
  worldId: string;
  turnCount: number;
  avatar?: string;
}

export class DBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = (e) => {
        console.error("IndexedDB Open Error:", e);
        reject('Lỗi mở IndexedDB');
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
        if (!db.objectStoreNames.contains(IMAGE_STORE)) {
          db.createObjectStore(IMAGE_STORE);
        }
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
          db.createObjectStore(SETTINGS_STORE);
        }
      };
    });
  }

  async save(data: any, slot: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const metadata: SaveMetadata = {
        playerName: data.player?.name || 'Vô Danh',
        level: data.player?.level || 1,
        timestamp: Date.now(),
        genre: data.selectedWorld?.genre || 'Chưa rõ',
        worldId: data.selectedWorld?.id || 'unknown',
        turnCount: data.player?.turnCount || 0,
        avatar: data.player?.avatar
      };

      try {
        const request = store.put({ ...data, metadata }, slot);
        request.onsuccess = () => {
          resolve();
        };
        request.onerror = (e) => {
          console.error("IndexedDB Put Error:", e);
          reject('Lỗi lưu dữ liệu: ' + (request.error?.message || 'Unknown error'));
        };
      } catch (err) {
        console.error("IndexedDB Sync Error:", err);
        reject('Lỗi đồng bộ IndexedDB: ' + err);
      }
    });
  }

  async load(slot: string): Promise<any> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(slot);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Lỗi tải dữ liệu');
    });
  }

  async delete(slot: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(slot);
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => reject('Lỗi xóa slot');
    });
  }

  async getLatestSave(): Promise<{slot: string, data: any} | null> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAllKeys();
      request.onsuccess = async () => {
        const keys = request.result as string[];
        let latest: {slot: string, data: any} | null = null;

        for (const slot of keys) {
          const data = await this.load(slot);
          if (data && data.metadata) {
            if (!latest || data.metadata.timestamp > latest.data.metadata.timestamp) {
              latest = { slot, data };
            }
          }
        }
        resolve(latest);
      };
      request.onerror = () => reject('Lỗi tìm tệp lưu mới nhất');
    });
  }

  async getSlotsInfo(): Promise<Record<string, SaveMetadata | null>> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAllKeys();
      request.onsuccess = async () => {
        const keys = request.result as string[];
        const result: Record<string, SaveMetadata | null> = {};
        for (const key of keys) {
          const data = await this.load(key);
          result[key] = data?.metadata || null;
        }
        resolve(result);
      };
      request.onerror = () => reject('Lỗi lấy danh sách slot');
    });
  }

  async getAllSaves(): Promise<any[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const allData = request.result || [];
        // Map to include slot ID if needed, but here we just need the data
        resolve(allData.map((d, i) => ({ ...d, id: `slot_${i}` })));
      };
      request.onerror = () => reject('Lỗi lấy toàn bộ dữ liệu lưu');
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => reject('Lỗi xóa toàn bộ dữ liệu');
    });
  }

  // --- Local Image Library Methods ---

  async saveLocalImage(url: string, tags: string[] = [], genre?: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([IMAGE_STORE], 'readwrite');
      const store = transaction.objectStore(IMAGE_STORE);
      const request = store.put({ url, tags, genre, timestamp: Date.now() }, url);
      request.onsuccess = () => resolve();
      request.onerror = () => reject('Lỗi lưu ảnh cục bộ');
    });
  }

  async getLocalImages(): Promise<any[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([IMAGE_STORE], 'readonly');
      const store = transaction.objectStore(IMAGE_STORE);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject('Lỗi lấy danh sách ảnh cục bộ');
    });
  }

  async deleteLocalImage(url: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([IMAGE_STORE], 'readwrite');
      const store = transaction.objectStore(IMAGE_STORE);
      const request = store.delete(url);
      request.onsuccess = () => resolve();
      request.onerror = () => reject('Lỗi xóa ảnh cục bộ');
    });
  }

  async clearLocalImages(): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([IMAGE_STORE], 'readwrite');
      const store = transaction.objectStore(IMAGE_STORE);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject('Lỗi dọn dẹp ảnh cục bộ');
    });
  }

  // --- App Settings Methods ---

  async saveSettings(settings: any): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SETTINGS_STORE], 'readwrite');
      const store = transaction.objectStore(SETTINGS_STORE);
      const request = store.put(settings, 'current_settings');
      request.onsuccess = () => resolve();
      request.onerror = () => reject('Lỗi lưu cấu hình');
    });
  }

  async getSettings(): Promise<any | null> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SETTINGS_STORE], 'readonly');
      const store = transaction.objectStore(SETTINGS_STORE);
      const request = store.get('current_settings');
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject('Lỗi tải cấu hình');
    });
  }
}

export const dbService = new DBService();

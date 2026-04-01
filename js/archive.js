/**
 * archive.js — Platinum Document Archive
 * Local storage for hundreds of letters using IndexedDB
 */

const DB_NAME = "DIN-BriefNEO-Archive";
const DB_VERSION = 1;
const STORE_NAME = "letters";

export class ArchiveService {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve();
      };

      request.onerror = (e) => reject(e.target.error);
    });
  }

  /**
   * Speichert den aktuellen Brief
   * @param {Object} state - Der komplette State
   * @returns {Promise<number>} Die ID des neuen Eintrags
   */
  async save(state) {
    if (!this.db) await this.init();
    
    const entry = {
      timestamp: Temporal.Now.instant().toString(),
      title: state.content.betreff || "Unbenannter Brief",
      recipient: state.content.empf_nachname || state.content.empf_firma || "Unbekannt",
      data: JSON.parse(JSON.stringify(state)) // Deep Clone
    };

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.add(entry);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Lädt alle gespeicherten Briefe (Metadaten)
   */
  async getAll() {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async delete(id) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(Number(id));
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async get(id) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(Number(id));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
}

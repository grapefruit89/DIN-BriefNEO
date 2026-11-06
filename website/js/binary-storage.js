// @ts-check
// @adr [[ADR-BINARY-ASSETS]] {openDB, saveBlob, loadBlob, deleteBlob}
// @guide [[glossary]]

/**
 * @file binary-storage.js — Binär-Assets (Signaturbild, Schriftdatei) in IndexedDB.
 *
 * `localStorage` kann nur Strings speichern; Base64 bläht Binärdaten um ~33 % auf und ist
 * im Quota teuer. Deshalb liegen die beiden Binär-Assets als `Blob` in IndexedDB.
 * **Strukturierte** Produktdaten (Draft, Einstellungen, Adressen, Schema-Version) bleiben
 * in `localStorage` — synchron und ohne FOUC (Law S1, A34).
 *
 * Einziger Speicherort für Blobs. `tools/antipatterns/project.json` (P10) exempted genau
 * diese Datei, damit IndexedDB nicht versehentlich als Produktspeicher zurückkehrt.
 */

/* Kein `din-`-Praefix im DB-Namen: dieser Namensraum ist der IMR-Registry vorbehalten
 * und wird von tools/imr.js als Tag gelesen. */
const DB_NAME = 'briefneo-assets';
const DB_VERSION = 1;
const STORE = 'assets';

/** @type {Promise<IDBDatabase> | null} */
let dbPromise = null;

/**
 * Öffnet die Datenbank lazy — erst beim ersten Zugriff. Ein Fehlschlag wird nicht
 * dauerhaft zwischengespeichert, damit ein späterer Versuch es erneut probieren kann.
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  if (dbPromise) return dbPromise;
  const promise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB nicht verfügbar'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB open fehlgeschlagen'));
    request.onblocked = () => reject(new Error('IndexedDB blockiert (anderer Tab hält die alte Version)'));
  });
  dbPromise = promise;
  promise.catch(() => {
    if (dbPromise === promise) dbPromise = null;
  });
  return promise;
}

/**
 * Speichert einen Blob unter einem Key. Schlägt der Speicher fehl (privater Modus,
 * deaktivierte Speicher-API), bleibt es bei einer Warnung — die Oberfläche meldet den
 * Fehlschlag selbst.
 * @param {string} key — 'signature' oder 'font'
 * @param {Blob} blob
 * @returns {Promise<boolean>} true bei Erfolg
 */
export async function saveBlob(key, blob) {
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(blob, key);
      tx.oncomplete = () => resolve(undefined);
      tx.onerror = () => reject(tx.error || new Error('Transaktion fehlgeschlagen'));
      tx.onabort = () => reject(tx.error || new Error('Transaktion abgebrochen'));
    });
    return true;
  } catch (error) {
    console.warn('[BinaryStorage] Speichern fehlgeschlagen, nichts gespeichert:', error);
    return false;
  }
}

/**
 * Lädt einen Blob. Fehlt der Key oder ist der Speicher nicht verfügbar, kommt `null`.
 * @param {string} key
 * @returns {Promise<Blob | null>}
 */
export async function loadBlob(key) {
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const request = tx.objectStore(STORE).get(key);
      request.onsuccess = () => {
        const value = request.result;
        resolve(value instanceof Blob ? value : null);
      };
      request.onerror = () => reject(request.error || new Error('Lesen fehlgeschlagen'));
    });
  } catch (error) {
    console.warn('[BinaryStorage] Laden fehlgeschlagen:', error);
    return null;
  }
}

/**
 * Löscht einen Blob. Ein fehlender Key ist kein Fehler.
 * @param {string} key
 * @returns {Promise<boolean>}
 */
export async function deleteBlob(key) {
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => resolve(undefined);
      tx.onerror = () => reject(tx.error || new Error('Löschen fehlgeschlagen'));
      tx.onabort = () => reject(tx.error || new Error('Löschen abgebrochen'));
    });
    return true;
  } catch (error) {
    console.warn('[BinaryStorage] Löschen fehlgeschlagen:', error);
    return false;
  }
}

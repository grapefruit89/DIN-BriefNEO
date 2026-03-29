/**
 * js/opfs-worker.js — High-Integrity Journaling Persistence
 * [SPEC-068] Shadow Paging & Journaling Protocol
 * ─────────────────────────────────────────────────────────────
 * Operiert im Dedicated Worker Thread für blockierungsfreie I/O.
 */

const FILE_NAME = "din-brief-neo.draft";
const JOURNAL_NAME = "din-brief-neo.journal";
const TMP_NAME = "din-brief-neo.draft.tmp";

let saveCounter = 0;

self.onmessage = async (e) => {
  const { type, data } = e.data;

  if (type === "SAVE_DATA") {
    await saveWithJournaling(data);
  } else if (type === "LOAD_DATA") {
    await loadWithRecovery();
  }
};

/**
 * [High-Integrity] Load with Recovery Protocol
 * PrÃ¼ft Journal auf ungespeicherte Daten nach Absturz.
 */
async function loadWithRecovery() {
  try {
    const root = await navigator.storage.getDirectory();

    // 1. Versuche Hauptdatei zu laden
    let data = null;
    try {
      const fileHandle = await root.getFileHandle(FILE_NAME);
      const file = await fileHandle.getFile();
      data = JSON.parse(await file.text());
    } catch (e) {
      console.warn("[OPFS] Main draft not found, starting fresh.");
    }

    // 2. PrÃ¼fe Journal auf "Late-Arrival" Daten (Recovery)
    try {
      const journalHandle = await root.getFileHandle(JOURNAL_NAME);
      const journalFile = await journalHandle.getFile();
      const journalText = await journalFile.text();
      if (journalText) {
        const journalData = JSON.parse(journalText);
        data = { ...data, ...journalData, _recovered: true };
        console.info("[OPFS] Data recovered from Journal.");
      }
    } catch (e) {
      /* No journal, no problem */
    }

    self.postMessage({ type: "LOAD_CONFIRMED", data });
  } catch (err) {
    self.postMessage({ type: "LOAD_ERROR", error: err.message });
  }
}

/**
 * [High-Integrity] Journaling & Shadow Paging
 * Verhindert Datenverlust durch redundante SchreibvorgÃ¤nge.
 * Nutzt Web Locks API (navigator.locks.request) fÃ¼r Concurrency-Schutz.
 */
async function saveWithJournaling(data) {
  try {
    // [ADR-015] Concurrency Guard: Exklusive Sperre fÃ¼r OPFS-Zugriff
    // Wir nutzen ifAvailable: true, um sofort zu scheitern, wenn ein anderer Tab schreibt.
    await navigator.locks.request(
      "opfs-io-lock",
      { ifAvailable: true },
      async (lock) => {
        if (!lock) {
          self.postMessage({
            type: "CONCURRENCY_CONFLICT",
            message: "TAB-KONFLIKT: READ-ONLY",
          });
          return;
        }

        const root = await navigator.storage.getDirectory();

        // 1. Journaling: Schreibe Snapshot in Journal
        const journalHandle = await root.getFileHandle(JOURNAL_NAME, {
          create: true,
        });
        const jAccess = await journalHandle.createSyncAccessHandle();
        const encoder = new TextEncoder();
        const buffer = encoder.encode(JSON.stringify(data));
        jAccess.truncate(0);
        jAccess.write(buffer, { at: 0 });
        jAccess.flush();
        jAccess.close();

        saveCounter++;

        // 2. Periodic Compaction: Alle 5 Saves wird die Hauptdatei aktualisiert
        if (saveCounter >= 5) {
          const tmpHandle = await root.getFileHandle(TMP_NAME, {
            create: true,
          });
          const accessHandle = await tmpHandle.createSyncAccessHandle();

          accessHandle.truncate(0);
          accessHandle.write(buffer, { at: 0 });
          accessHandle.flush();
          accessHandle.close();

          // Atomares Replacement
          await tmpHandle.move(FILE_NAME);

          // Journal leeren nach erfolgreicher Compaction
          const journalHandleFinal = await root.getFileHandle(JOURNAL_NAME);
          const jFinalAccess =
            await journalHandleFinal.createSyncAccessHandle();
          jFinalAccess.truncate(0);
          jFinalAccess.close();

          saveCounter = 0;
          console.log("[OPFS] Checkpoint reached: Main draft updated.");
        }

        self.postMessage({ type: "SAVE_CONFIRMED", timestamp: Date.now() });
      },
    );
  } catch (err) {
    console.error("[OPFS Worker] Save Error:", err);
    self.postMessage({ type: "SAVE_ERROR", error: err.message });
  }
}

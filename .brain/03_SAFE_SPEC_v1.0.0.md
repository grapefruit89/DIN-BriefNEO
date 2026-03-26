# SAFE-SPEC: WEB LOCKS & OPFS DATA PERSISTENCE (v1.0.0)
# Status: CEMENTED | Doctrine: Aviation Grade Platinum | Stand: März 2026

## 1. LEADER ELECTION (Web Locks API)
Multi-Tab Synchronisation ohne Datenkonflikte.
- **Engine:** `navigator.locks.request('din_brief_leader', { mode: 'exclusive' }, callback)`.
- **Logic:** Nur der Tab, der den exklusiven Lock hält (Leader), darf aktiv in das OPFS schreiben. 
- **Heartbeat:** Der Lock wird für die gesamte Lebensdauer des Tabs gehalten. Stirbt der Tab (Crash/Close), wird der Lock vom Browser nativ freigegeben und ein Follower-Tab wird automatisch zum neuen Leader (Phoenix-Eigenschaft).
- **Broadcast:** Der Leader verteilt State-Updates via `BroadcastChannel('din_neo_sync')`.

## 2. ORIGIN PRIVATE FILE SYSTEM (OPFS)
Blockierungsfreie, synchrone I/O-Operationen im Worker.
- **Worker:** `js/core/opfs-worker.js` operiert isoliert vom Main Thread.
- **Access:** `createSyncAccessHandle({ mode: "readwrite-unsafe" })` für maximale Performance (C++ native Speed).
- **I/O Operations:**
    - `accessHandle.truncate(0)` vor jedem neuen Schreibvorgang.
    - `accessHandle.write(buffer)` für den atomaren Daten-Dump.
    - `accessHandle.flush()` zwingend vor `accessHandle.close()`, um Hardware-Persistenz zu garantieren.

## 3. ATOMIC SHADOW PAGING (The Phoenix Save)
- **Protocol:** Daten werden in `din-brief-neo.draft.tmp` geschrieben. 
- **Commit:** Erst nach erfolgreichem `flush()` wird die Datei via `move('din-brief-neo.draft')` atomar umbenannt.
- **Integrity:** Ein `Temporal.Now.instant().epochMilliseconds` Zeitstempel im JSON-Header dient als Validitäts-Check für das Journal.

## 4. SYSTEM-LEVEL IDLE DETECTION (Native Debounce)
- **Engine:** `IdleDetector API`.
- **Threshold:** 60.000ms (1 Minute Inaktivität).
- **Behavior:** Der `IOCoordinator` triggert den Save-Worker erst, wenn der Browser `userState: 'idle'` meldet. Dies schont CPU-Ressourcen während intensiver Schreibphasen.

---
**GEZ. LEAD SYSTEMS ARCHITECT**
"Aviation Grade: Synchronized, isolated, and hardware-flushed."
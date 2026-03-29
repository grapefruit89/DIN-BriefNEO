/**
 * js/io-coordinator.js — Phoenix Protocol Coordinator
 * [MANDATE-v4.0] Zero-Loss Persistence & Leader Election
 * ─────────────────────────────────────────────────────────────
 * Architecture:
 *   1. Leader Election (Web Locks API)
 *   2. Broadcast Sync (BroadcastChannel API)
 *   3. Background Saving (IdleDetector API)
 *   4. Dedicated Storage Worker (OPFS)
 */

export class IOCoordinator {
  constructor(stateManager) {
    this.sm = stateManager;
    this.channel = new BroadcastChannel("din_neo_sync");
    this.isLeader = false;
    this.worker = null;
    this.idleDetector = null;
  }

  async init() {
    // Phase 1: Web Locks API (Leader Election)
    // Using ifAvailable: true to immediately know if we are the Leader or Follower
    return navigator.locks.request(
      "din_neo_opfs_leader",
      { ifAvailable: true },
      async (lock) => {
        if (!lock) {
          this.initFollower();
          // In Follower mode, we don't return a "forever" promise here,
          // because we want to retry occasionally if the leader tab closes.
          this.setupLockRetry();
          return;
        }

        // We are the LEADER
        await this.initLeader();

        // Return a promise that never resolves to keep the lock for the life of the tab
        return new Promise(() => {});
      },
    );
  }

  /**
   * Periodically check if the leader has vacated the lock
   */
  setupLockRetry() {
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && !this.isLeader) {
        this.init(); // Retry elevation to leader
      }
    });
  }

  async initLeader() {
    this.isLeader = true;
    document.body.classList.remove("is-follower");
    console.info("[Phoenix] Primary Tab: Elected as Leader.");

    // Phase 2: Boot OPFS Worker
    this.worker = new Worker("js/opfs-worker.js");
    this.worker.onmessage = (e) => {
      if (e.data.type === "SAVE_CONFIRMED") {
        console.debug("[Phoenix] Save Confirmed:", e.data.timestamp);
      }
      if (e.data.type === "LOAD_CONFIRMED") {
        console.info("[Phoenix] OPFS State Loaded.");
        this.sm.updateFromOPFS(e.data.data);
      }
    };

    // Leader listens for Follower updates
    this.channel.onmessage = (msg) => {
      if (msg.data.type === "STATE_DELTA") {
        this.save(msg.data.state);
      }
    };

    // Request initial load from OPFS
    this.worker.postMessage({ type: "LOAD_DATA" });

    // Phase 3: Idle Detector API (Native Debounce)
    await this.setupIdleDetection();
  }

  initFollower() {
    this.isLeader = false;
    document.body.classList.add("is-follower");
    console.info("[Phoenix] Secondary Tab: Following Leader.");

    // Follower sends state to Leader
    this.sm.subscribe((path, value, scope) => {
      if (scope === "load" || scope === "opfs") return;
      this.channel.postMessage({ type: "STATE_DELTA", state: this.sm.state });
    });
  }

  async setupIdleDetection() {
    if (!("IdleDetector" in window)) {
      console.error(
        "[Phoenix] IdleDetector API not supported. Falling back to explicit saves only.",
      );
      return;
    }

    try {
      const state = await IdleDetector.requestPermission();
      if (state === "granted") {
        this.idleDetector = new IdleDetector();
        this.idleDetector.addEventListener("change", () => {
          // [CMD-1] Native Idle Detection for OPFS Sync
          // Trigger OPFS background sync exclusively when user is "idle"
          if (this.idleDetector.userState === "idle") {
            console.debug("[Phoenix] User Idle: Triggering OPFS Save.");
            this.save(this.sm.state);
          }
        });

        // Set threshold to 1 minute (60000ms is minimum allowed by spec)
        await this.idleDetector.start({ threshold: 60000 });
        console.info("[Phoenix] Native IdleDetector active.");
      }
    } catch (e) {
      console.warn("[Phoenix] IdleDetector failed:", e);
    }
  }

  save(state) {
    if (!this.isLeader || !this.worker) return;

    // [ADR-016] Modern Task Scheduling (Chrome 94+)
    // Prioritize background saving to keep the Main Thread free for EditContext/IME.
    if (globalThis.scheduler?.postTask) {
      scheduler.postTask(
        () => {
          this.worker.postMessage({ type: "SAVE_DATA", data: state });
        },
        { priority: "background" },
      );
    } else {
      // Fallback: Legacy async dispatch
      setTimeout(() => {
        this.worker.postMessage({ type: "SAVE_DATA", data: state });
      }, 0);
    }
  }

  /**
   * Emergency Save during Lifecycle Events
   */
  emergencySave() {
    if (this.isLeader && this.worker) {
      this.worker.postMessage({ type: "SAVE_DATA", data: this.sm.state });
    } else {
      this.channel.postMessage({ type: "STATE_DELTA", state: this.sm.state });
    }
  }
}

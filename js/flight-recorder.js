/**
 * js/flight-recorder.js — Black Box Decoder Runtime
 * v4.0 V16 | SPEC-047 | BRAIN-047-SPEC | PLAN-047
 * ───────────────────────────────────────────────────────────────
 * DETERMINISTISCHE DIAGNOSE-ENGINE
 * Erfasst den vollständigen System-Zustand bei CMA-Verstößen oder Drifts.
 */

import { IMR } from "./constants.js";
import { readDOMasJSON } from "./logic.js";

export const FlightRecorder = {
  /**
   * Misst physische Abweichungen der IMR-Zonen vom DIN-Standard.
   * Nutzt getBoundingClientRect() fÃ¼r Echtzeit-Telemetrie.
   */
  measureCMA: () => {
    return IMR.map((entry) => {
      const el = document.querySelector(entry.tag);
      if (!el) return null;
      const rect = el.getBoundingClientRect();

      // Umrechnung von PX in MM (Baseline: 96 DPI -> 1mm = 3.7795px)
      const pxToMm = (px) => Math.round((px / 3.7795) * 10) / 10;

      return {
        tag: entry.tag,
        key: entry.key,
        height_mm: pxToMm(rect.height),
        width_mm: pxToMm(rect.width),
        top_mm: pxToMm(rect.top),
      };
    }).filter(Boolean);
  },

  /**
   * Generiert die vollstÃ¤ndige Payload fÃ¼r den Black Box Decoder (KI).
   * @param {string} errorType â€” CMA_VIOLATION | DOM_DRIFT | MANUAL
   * @param {string} message â€” Kurze Fehlerbeschreibung
   */
  record: (errorType = "MANUAL_TRIGGER", message = "") => {
    return {
      header: {
        app: "DIN-BriefNEO v4.0",
        version: "16.0.0",
        timestamp: Temporal.Now.instant().toString(),
        incident_id: crypto.randomUUID(),
      },
      context: {
        error_type: errorType,
        error_message: message,
      },
      telemetry: {
        imr_state: readDOMasJSON(),
        cma_sensor: FlightRecorder.measureCMA(),
        console_buffer: [], // Platzhalter fÃ¼r Log-Aggregation
      },
      environment: {
        engine: "Chrome 147+",
        userAgent: navigator.userAgent,
        screen: `${window.innerWidth}x${window.innerHeight}`,
      },
    };
  },
};

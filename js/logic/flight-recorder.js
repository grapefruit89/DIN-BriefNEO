/**
 * js/logic/flight-recorder.js — Black Box Decoder Runtime
 * Platinum V16 | SPEC-047 | BRAIN-047-SPEC | PLAN-047
 * ─────────────────────────────────────────────────────────────────────────────
 * DETERMINISTISCHE DIAGNOSE-ENGINE
 * Erfasst den vollständigen System-Zustand bei CMA-Verstößen oder Drifts.
 */

import { IMR } from '../core/constants.js';
import { readDOMasJSON } from './logic.js';

export const FlightRecorder = {
  
  /**
   * Misst physische Abweichungen der IMR-Zonen vom DIN-Standard.
   * Nutzt getBoundingClientRect() für Echtzeit-Telemetrie.
   */
  measureCMA: () => {
    return IMR.map(entry => {
      const el = document.querySelector(entry.tag);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      
      // Umrechnung von PX in MM (Baseline: 96 DPI -> 1mm = 3.7795px)
      const pxToMm = px => Math.round((px / 3.7795) * 10) / 10;

      return {
        tag: entry.tag,
        key: entry.key,
        height_mm: pxToMm(rect.height),
        width_mm:  pxToMm(rect.width),
        top_mm:    pxToMm(rect.top)
      };
    }).filter(Boolean);
  },

  /**
   * Generiert die vollständige Payload für den Black Box Decoder (KI).
   * @param {string} errorType — CMA_VIOLATION | DOM_DRIFT | MANUAL
   * @param {string} message — Kurze Fehlerbeschreibung
   */
  record: (errorType = 'MANUAL_TRIGGER', message = '') => {
    return {
      header: {
        app: "DIN-BriefNEO Platinum",
        version: "16.0.0",
        timestamp: Temporal.Now.instant().toString(),
        incident_id: crypto.randomUUID()
      },
      context: {
        error_type: errorType,
        error_message: message
      },
      telemetry: {
        imr_state: readDOMasJSON(),
        cma_sensor: FlightRecorder.measureCMA(),
        console_buffer: [] // Platzhalter für Log-Aggregation
      },
      environment: {
        engine: "Chrome 147+",
        userAgent: navigator.userAgent,
        screen: `${window.innerWidth}x${window.innerHeight}`
      }
    };
  }
};

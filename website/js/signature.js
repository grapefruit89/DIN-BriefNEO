// @ts-check
// @adr [[ADR-JS]] {SignatureFeature}
// @guide [[din-5008-css-architektur]]

/**
 * @file signature.js — Bild-Upload, Kompression, interaktives Drag/Resize/Rotate
 * und Persistenz der Unterschrift. Aus `settings.js` ausgelagert (2026-11-08):
 * die Signatur-Engine teilt fachlich nichts mit Theme- und Layout-Toggles.
 */

import { deleteBlob, loadBlob, saveBlob } from './binary-storage.js';
import { Constants, notify } from './core.js';

/** Typ-Referenz auf den SettingsManager (nur Typ, kein Laufzeit-Import). */
/** @typedef {import('./settings.js').SettingsManager} SettingsManager */

export class SignatureFeature {
  /**
   * @param {SettingsManager | { settings: any, updateSettings?: () => void } | null} [settingsManager]
   */
  constructor(settingsManager = null) {
    this.settingsManager = settingsManager;
    /** @type {any} */
    this.settings = settingsManager ? settingsManager.settings : {};
    this.imgElement = /** @type {HTMLImageElement | null} */ (document.getElementById('unterschriftsbild-vorschau'));
    this.uploader = /** @type {HTMLInputElement | null} */ (document.getElementById('unterschriftsbild-datei'));
    this.btnAktion = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-unterschrift-aktion'));
    
    /** @type {{x: number, y: number, scale: number, rot: number}} */
    this.state = { x: 11.9, y: 96.0, scale: 0.5, rot: 0 };

    this.bbox = document.getElementById('unterschriftsbild-box');
    this.container = document.getElementById('unterschriftsbild-container');

    // Config: Maximale Dimension für hochauflösende Druck-/PDF-Wiedergabe (< 15 KB WebP)
    this.MAX_DIM = 800;

    /** @type {string | null} */
    this.currentBlobUrl = null;
  }

  init() {
    if (!this.uploader || !this.imgElement) return;

    // Zero-Base64: Alte Base64-Signaturbilder aus Settings restlos bereinigen
    if (this.settings?.signatureImage) {
      this.settings.signatureImage = undefined;
      this.#saveSettings();
    }

    this.uploader.addEventListener('change', (e) => {
      const target = /** @type {HTMLInputElement} */ (e.target);
      const file = target?.files?.[0] ?? null;
      if (file) {
        this.processFile(file);
      }
      if (target) target.value = '';
    });

    if (this.btnAktion) {
      this.btnAktion.addEventListener('click', () => {
        if (this.btnAktion?.dataset.state === 'loaded') {
          this.resetImage();
        } else {
          this.uploader?.click();
        }
      });
    }

    this.initWysiwyg();

    // Bild liegt als Blob in IndexedDB; der Restore ist async und erscheint nach dem Paint.
    loadBlob('signature').then((blob) => {
      if (!blob) return;
      this.#setImageFromBlob(blob);
      this.applyTransform();
      this.#updateButtonState(true);
    });
  }

  initWysiwyg() {
    const bbox = this.bbox;
    const container = this.container;
    if (!bbox || !container) return;

    const savedState = this.settings?.signatureState || this.settings?.signature?.transform;
    if (savedState) {
      this.state = {
        x: typeof savedState.x === 'number' && Number.isFinite(savedState.x) ? savedState.x : 11.9,
        y: typeof savedState.y === 'number' && Number.isFinite(savedState.y) ? savedState.y : 96.0,
        scale: typeof savedState.scale === 'number' && Number.isFinite(savedState.scale)
          ? Math.max(0.15, Math.min(4.5, savedState.scale))
          : 0.5,
        rot: typeof savedState.rot === 'number' && Number.isFinite(savedState.rot) ? savedState.rot : 0
      };
    }
    this.applyTransform();

    /** @type {{
     *   action: string | null,
     *   startX: number, startY: number,
     *   centerX: number, centerY: number,
     *   startAngle: number, startDistance: number,
     *   pxToCqw?: number,
     *   initial: {x: number, y: number, scale: number, rot: number} | null
     * }} */
    const interaction = {
      action: null,
      startX: 0, startY: 0,
      centerX: 0, centerY: 0,
      startAngle: 0, startDistance: 0,
      pxToCqw: 0.125,
      initial: null
    };

    bbox.addEventListener('pointerdown', (e) => {
      // :focus-within ersetzt den früheren .active-Zustand. preventDefault
      // verhindert Textauswahl, unterdrückt aber auch den Standard-Fokus —
      // deshalb explizit fokussieren.
      bbox.focus({ preventScroll: true });
      e.preventDefault();

      const target = /** @type {HTMLElement} */ (e.target);
      interaction.action = target.dataset.aktion || 'drag';

      interaction.startX = e.clientX;
      interaction.startY = e.clientY;
      interaction.initial = { x: this.state.x, y: this.state.y, scale: this.state.scale, rot: this.state.rot };

      const rect = bbox.getBoundingClientRect();
      interaction.centerX = rect.left + rect.width / 2;
      interaction.centerY = rect.top + rect.height / 2;

      interaction.startAngle = Math.atan2(e.clientY - interaction.centerY, e.clientX - interaction.centerX);
      interaction.startDistance = Math.hypot(e.clientX - interaction.centerX, e.clientY - interaction.centerY);

      const blatt = document.querySelector('din-blatt');
      const blattWidth = blatt ? blatt.getBoundingClientRect().width : 800;
      interaction.pxToCqw = 100 / (blattWidth || 1);

      bbox.setPointerCapture(e.pointerId);
    });

    const SNAP_TARGETS = [0, 54.74, -54.74, 90, -90, 180, -180];
    const SNAP_TOLERANCE = 2.5;

    bbox.addEventListener('pointermove', (e) => {
      if (!interaction.action || !interaction.initial) return;
      e.preventDefault();

      if (interaction.action === 'drag') {
        const pxToCqw = interaction.pxToCqw || 0.125;
        this.state.x = interaction.initial.x + (e.clientX - interaction.startX) * pxToCqw;
        this.state.y = interaction.initial.y + (e.clientY - interaction.startY) * pxToCqw;
      } else if (interaction.action === 'rotate') {
        const currentAngle = Math.atan2(e.clientY - interaction.centerY, e.clientX - interaction.centerX);
        const deltaRot = (currentAngle - interaction.startAngle) * (180 / Math.PI);
        const rawRot = interaction.initial.rot + deltaRot;

        // Magnetisches Snapping (CAD-Modus)
        const normalized = ((rawRot + 180) % 360 + 360) % 360 - 180;
        let snapped = rawRot;
        for (const target of SNAP_TARGETS) {
          if (Math.abs(normalized - target) <= SNAP_TOLERANCE) {
            snapped = rawRot + (target - normalized);
            break;
          }
        }
        this.state.rot = snapped;
      } else if (interaction.action === 'resize') {
        const currentDist = Math.hypot(e.clientX - interaction.centerX, e.clientY - interaction.centerY);
        const scaleFactor = currentDist / (interaction.startDistance || 1);
        const newScale = interaction.initial.scale * scaleFactor;
        this.state.scale = Math.max(0.15, Math.min(4.5, newScale));
      }
      this.applyTransform();
    });

    bbox.addEventListener('pointerup', (e) => {
      if (interaction.action) {
        bbox.releasePointerCapture(e.pointerId);
        interaction.action = null;
        this.saveState();
      }
    });
    bbox.addEventListener('pointercancel', (e) => {
      if (interaction.action) {
        bbox.releasePointerCapture(e.pointerId);
        interaction.action = null;
      }
    });
  }

  applyTransform() {
    if (this.container) {
      this.container.style.setProperty('--sig-x', `${this.state.x}cqw`);
      this.container.style.setProperty('--sig-y', `${this.state.y}cqw`);
      this.container.style.setProperty('--sig-scale', `${this.state.scale}`);
      this.container.style.setProperty('--sig-rot', `${this.state.rot}deg`);
    }
  }

  #saveSettings() {
    if (this.settingsManager && typeof this.settingsManager.updateSettings === 'function') {
      this.settingsManager.updateSettings();
    }
  }

  saveState() {
    if (!this.settings) this.settings = {};
    this.settings.signatureState = { x: this.state.x, y: this.state.y, scale: this.state.scale, rot: this.state.rot };
    this.settings.signatureImage = undefined;
    this.#saveSettings();
  }

  /**
   * Setzt das Vorschaubild aus einem Blob und gibt die vorherige Object-URL frei.
   * @param {Blob} blob
   */
  #setImageFromBlob(blob) {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
    }
    this.currentBlobUrl = URL.createObjectURL(blob);
    if (this.imgElement) {
      this.imgElement.src = this.currentBlobUrl;
    }
  }

  /**
   * Kompaktes WebP als Blob in IndexedDB (Key `signature`, siehe [[ADR-BINARY-ASSETS]]).
   * @param {File} file
   */
  async processFile(file) {
    /** @type {ImageBitmap} */
    let bitmap;
    try {
      bitmap = await createImageBitmap(file);
    } catch (error) {
      /* Sichtbar machen: ein nicht decodierbares Bild (z. B. HEIC vom Handy)
         scheiterte bisher nur in der Konsole - der Klick auf "laden" tat
         scheinbar nichts (gemeldet 2026-11-12). */
      console.warn('[Signature] createImageBitmap failed:', error);
      notify(Constants.TOASTS.SIGNATURE.DECODE_ERROR, 'error');
      return;
    }

    const maxDim = this.MAX_DIM || 800;
    const scale = Math.min(1, maxDim / bitmap.width, maxDim / bitmap.height);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    try {
      const blob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.82 });
      const saved = await saveBlob('signature', blob);
      if (!saved) {
        notify(Constants.TOASTS.SIGNATURE.SAVE_ERROR, 'error');
        return;
      }

      this.#setImageFromBlob(blob);
      this.saveState();
      this.#updateButtonState(true);
    } catch (error) {
      console.warn('[Signature] convertToBlob / save failed:', error);
    }
  }

  /**
   * Aktualisiert den 2-Zustände-Button in der Seitenleiste.
   * @param {boolean} hasImage
   */
  #updateButtonState(hasImage) {
    if (!this.btnAktion) return;
    if (hasImage) {
      this.btnAktion.dataset.state = 'loaded';
      this.btnAktion.textContent = '🗑️ Unterschrift / Stempel entfernen';
    } else {
      this.btnAktion.dataset.state = 'empty';
      this.btnAktion.textContent = '✒️ Unterschrift / Stempel laden';
    }
  }

  resetImage() {
    void deleteBlob('signature');

    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }

    if (this.imgElement) {
      this.imgElement.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
    }

    if (this.settings) {
      this.settings.signatureImage = undefined;
      this.settings.signatureState = undefined;
    }
    
    this.state = { x: 11.9, y: 96.0, scale: 0.5, rot: 0 };
    this.applyTransform();

    this.#updateButtonState(false);
    this.#saveSettings();
  }
}

// @ts-check
// @guide [[glossary]] 

/* js/signature.js */
/* @adr [[ADR-JS]] {SignatureFeature} */
export class SignatureFeature {
  /**
   * @param {{ settings: any, saveSettings: () => void }} uiContext
   */
  constructor(uiContext) {
    this.ui = uiContext;
    this.imgElement = /** @type {HTMLImageElement | null} */ (document.getElementById('signature-image'));
    this.uploader = /** @type {HTMLInputElement | null} */ (document.getElementById('sig-uploader'));
    this.btnTrigger = document.getElementById('btn-upload-sig-trigger');
    this.btnReset = document.getElementById('btn-reset-sig');
    
    /** @type {{x: number, y: number, scale: number, rot: number}} */
    this.state = { x: 0, y: 0, scale: 1, rot: 0 };

    this.bbox = document.getElementById('sig-bbox');
    this.container = document.getElementById('signature-container');

    // Config: Maximum dimensions for the compressed signature
    this.MAX_WIDTH = 400;
    this.MAX_HEIGHT = 200;
  }

  init() {
    if (!this.uploader || !this.imgElement) return;

    // Load existing from state
    if (this.ui.settings?.signatureImage) {
      this.applyImage(this.ui.settings.signatureImage);
    }

    // Event Listeners
    this.uploader.addEventListener('change', (e) => {
      const target = /** @type {HTMLInputElement} */ (e.target);
      const file = target && target.files ? target.files[0] : null;
      if (file) {
        this.processFile(file);
      }
      if (target) target.value = '';
    });

    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => {
        this.resetImage();
      });
    }

    this.initWysiwyg();
  }

  initWysiwyg() {
    const bbox = this.bbox;
    const container = this.container;
    if (!bbox || !container) return;

    if (this.ui.settings?.signatureState) {
      this.state = { ...this.state, ...this.ui.settings.signatureState };
    }
    this.applyTransform();

    // Activation logic
    document.addEventListener('pointerdown', (e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      if (bbox.contains(target)) {
        if (this.imgElement && this.imgElement.src && this.imgElement.src !== window.location.href) {
            bbox.classList.add('active');
        }
      } else {
        bbox.classList.remove('active');
      }
    });

    /** @type {{
     *   action: string | null,
     *   startX: number, startY: number,
     *   centerX: number, centerY: number,
     *   startAngle: number, startDistance: number,
     *   initial: {x: number, y: number, scale: number, rot: number} | null
     * }} */
    const interaction = {
      action: null,
      startX: 0, startY: 0,
      centerX: 0, centerY: 0,
      startAngle: 0, startDistance: 0,
      initial: null
    };

    bbox.addEventListener('pointerdown', (e) => {
      if (!bbox.classList.contains('active')) return;
      e.preventDefault();

      const target = /** @type {HTMLElement} */ (e.target);
      interaction.action = target.dataset.action || 'drag';

      interaction.startX = e.clientX;
      interaction.startY = e.clientY;
      interaction.initial = { x: this.state.x, y: this.state.y, scale: this.state.scale, rot: this.state.rot };

      // Center is captured once per gesture and reused in pointermove --
      // recomputing it live would read a rect already shifted by the
      // in-progress transform, making rotate/resize maths inconsistent.
      const rect = bbox.getBoundingClientRect();
      interaction.centerX = rect.left + rect.width / 2;
      interaction.centerY = rect.top + rect.height / 2;

      interaction.startAngle = Math.atan2(e.clientY - interaction.centerY, e.clientX - interaction.centerX);
      interaction.startDistance = Math.hypot(e.clientX - interaction.centerX, e.clientY - interaction.centerY);

      bbox.setPointerCapture(e.pointerId);
    });

    bbox.addEventListener('pointermove', (e) => {
      if (!interaction.action || !interaction.initial) return;
      e.preventDefault();

      if (interaction.action === 'drag') {
        this.state.x = interaction.initial.x + (e.clientX - interaction.startX);
        this.state.y = interaction.initial.y + (e.clientY - interaction.startY);
      } else if (interaction.action === 'rotate') {
        const currentAngle = Math.atan2(e.clientY - interaction.centerY, e.clientX - interaction.centerX);
        const deltaRot = (currentAngle - interaction.startAngle) * (180 / Math.PI);
        this.state.rot = interaction.initial.rot + deltaRot;
      } else if (interaction.action === 'resize') {
        const currentDist = Math.hypot(e.clientX - interaction.centerX, e.clientY - interaction.centerY);
        const scaleFactor = currentDist / interaction.startDistance;
        this.state.scale = Math.max(0.1, Math.min(5, interaction.initial.scale * scaleFactor));
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
    if (this.bbox) {
      this.bbox.style.setProperty('--x', this.state.x + 'px');
      this.bbox.style.setProperty('--y', this.state.y + 'px');
      this.bbox.style.setProperty('--scale', this.state.scale.toString());
      this.bbox.style.setProperty('--rot', this.state.rot + 'deg');
    }
  }

  saveState() {
    if (!this.ui.settings) this.ui.settings = {};
    this.ui.settings.signatureState = { x: this.state.x, y: this.state.y, scale: this.state.scale, rot: this.state.rot };
    if (typeof this.ui.saveSettings === 'function') {
      this.ui.saveSettings();
    }
  }

  /**
   * @param {File} file
   */
  async processFile(file) {
    /** @type {ImageBitmap} */
    let bitmap;
    try {
      bitmap = await createImageBitmap(file);
    } catch (error) {
      console.warn('[Signature] createImageBitmap failed:', error);
      return;
    }
    const compressedBase64 = this.compressImage(bitmap);
    bitmap.close();
    this.saveAndApply(compressedBase64);
  }

  /**
   * Scales down to fit within MAX_WIDTH x MAX_HEIGHT (aspect ratio kept,
   * never upscales a smaller image). PNG to keep transparency.
   * @param {ImageBitmap} bitmap
   * @returns {string}
   */
  compressImage(bitmap) {
    const scale = Math.min(1, this.MAX_WIDTH / bitmap.width, this.MAX_HEIGHT / bitmap.height);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(bitmap, 0, 0, width, height);
    }
    return canvas.toDataURL('image/png');
  }

  /**
   * @param {string} base64
   */
  saveAndApply(base64) {
    this.applyImage(base64);

    // On first upload (no saved position), place signature in the typical DIN 5008 signing area
    if (!this.ui.settings?.signatureState) {
      const dinA4 = document.querySelector('din-a4');
      if (dinA4) {
        const rect = dinA4.getBoundingClientRect();
        // ~left margin (8%), ~70% down the sheet, half-size
        this.state = { x: rect.width * 0.08, y: rect.height * 0.70, scale: 0.5, rot: 0 };
        this.applyTransform();
      }
    }

    // Save to settings
    if (!this.ui.settings) this.ui.settings = {};
    this.ui.settings.signatureImage = base64;

    if (typeof this.ui.saveSettings === 'function') {
      this.ui.saveSettings();
    }
  }

  /**
   * @param {string} base64
   */
  applyImage(base64) {
    if (this.imgElement) {
      this.imgElement.src = base64;
    }
  }

  resetImage() {
    if (this.imgElement) {
      this.imgElement.src = '';
      this.imgElement.setAttribute('src', '');
    }

    if (this.ui.settings) {
      delete this.ui.settings.signatureImage;
      delete this.ui.settings.signatureState;
    }
    
    // Reset state in memory
    this.state = { x: 0, y: 0, scale: 1, rot: 0 };
    this.applyTransform();
    if (this.bbox) this.bbox.classList.remove('active');

    if (typeof this.ui.saveSettings === 'function') {
      this.ui.saveSettings();
    }
  }
}
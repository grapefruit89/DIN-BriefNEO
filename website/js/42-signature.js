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

    /** @type {string | null} */
    let activeAction = null;
    let startX = 0, startY = 0;
    /** @type {{x: number, y: number, scale: number, rot: number} | null} */
    let initialState = null;
    let startAngle = 0;
    let startDist = 0;

    bbox.addEventListener('pointerdown', (e) => {
      if (!bbox.classList.contains('active')) return;
      e.preventDefault();
      
      const target = /** @type {HTMLElement} */ (e.target);
      activeAction = target.dataset.action || 'drag';
      
      startX = e.clientX;
      startY = e.clientY;
      initialState = { x: this.state.x, y: this.state.y, scale: this.state.scale, rot: this.state.rot };

      const rect = bbox.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      startDist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

      bbox.setPointerCapture(e.pointerId);
    });

    bbox.addEventListener('pointermove', (e) => {
      if (!activeAction || !initialState) return;
      e.preventDefault();

      if (activeAction === 'drag') {
        this.state.x = initialState.x + (e.clientX - startX);
        this.state.y = initialState.y + (e.clientY - startY);
      } else if (activeAction === 'rotate') {
        const rect = bbox.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        
        let deltaRot = (currentAngle - startAngle) * (180 / Math.PI);
        this.state.rot = initialState.rot + deltaRot;
      } else if (activeAction === 'resize') {
        const rect = bbox.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const currentDist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
        
        let scaleFactor = currentDist / startDist;
        this.state.scale = Math.max(0.1, Math.min(5, initialState.scale * scaleFactor));
      }
      this.applyTransform();
    });

    bbox.addEventListener('pointerup', (e) => {
      if (activeAction) {
        bbox.releasePointerCapture(e.pointerId);
        activeAction = null;
        this.saveState();
      }
    });
    bbox.addEventListener('pointercancel', (e) => {
      if (activeAction) {
        bbox.releasePointerCapture(e.pointerId);
        activeAction = null;
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
  processFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const target = /** @type {FileReader} */ (event.target);
      const result = target ? target.result : null;
      if (typeof result !== 'string') return;
      const img = new Image();
      img.onload = () => {
        const compressedBase64 = this.compressImage(img);
        this.saveAndApply(compressedBase64);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  }

  /**
   * @param {HTMLImageElement} img
   * @returns {string}
   */
  compressImage(img) {
    let width = img.width;
    let height = img.height;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, width, height);
    }
    return canvas.toDataURL('image/png');
  }

  /**
   * @param {string} base64
   */
  saveAndApply(base64) {
    this.applyImage(base64);
    
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
      this.imgElement.setAttribute('src', base64);
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
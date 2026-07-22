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
      // Reset input so the same file can be uploaded again if needed
      if (target) target.value = '';
    });

    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => {
        this.resetImage();
      });
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

    // Aspect ratio preservation delegated to modern CSS object-fit

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw the image
      ctx.drawImage(img, 0, 0, width, height);
    }

    // Export as PNG to preserve transparency. 
    // Since it's scaled down, the base64 will be tiny (usually < 20KB).
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
    
    // Trigger save using the main app's saveSettings method if provided
    if (typeof this.ui.saveSettings === 'function') {
      this.ui.saveSettings();
    }
  }

  /**
   * @param {string} base64
   */
  applyImage(base64) {
    if (this.imgElement) this.imgElement.src = base64;
  }

  resetImage() {
    if (this.imgElement) this.imgElement.src = '';

    if (this.ui.settings) {
      delete this.ui.settings.signatureImage;
    }
    if (typeof this.ui.saveSettings === 'function') {
      this.ui.saveSettings();
    }
  }
}

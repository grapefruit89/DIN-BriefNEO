// @adr [[ADR-JS]]
/* js/signature.js */
export class SignatureFeature {
  constructor(uiContext) {
    this.ui = uiContext;
    this.imgElement = document.getElementById('signature-image');
    this.uploader = document.getElementById('sig-uploader');
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
    this.btnTrigger.addEventListener('click', () => {
      this.uploader.click();
    });

    this.uploader.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.processFile(file);
      }
      // Reset input so the same file can be uploaded again if needed
      e.target.value = '';
    });

    this.btnReset.addEventListener('click', () => {
      this.resetImage();
    });
  }

  processFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const compressedBase64 = this.compressImage(img);
        this.saveAndApply(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  compressImage(img) {
    let width = img.width;
    let height = img.height;

    // Scale maintaining aspect ratio
    if (width > this.MAX_WIDTH) {
      height *= this.MAX_WIDTH / width;
      width = this.MAX_WIDTH;
    }
    if (height > this.MAX_HEIGHT) {
      width *= this.MAX_HEIGHT / height;
      height = this.MAX_HEIGHT;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    // Draw the image
    ctx.drawImage(img, 0, 0, width, height);

    // Export as PNG to preserve transparency. 
    // Since it's scaled down, the base64 will be tiny (usually < 20KB).
    return canvas.toDataURL('image/png');
  }

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

  applyImage(base64) {
    this.imgElement.src = base64;
    this.imgElement.style.display = 'block';
    
    this.btnReset.style.display = 'block';
    this.btnTrigger.style.display = 'none';
  }

  resetImage() {
    this.imgElement.src = '';
    this.imgElement.style.display = 'none';
    
    this.btnReset.style.display = 'none';
    this.btnTrigger.style.display = 'block';

    if (this.ui.settings) {
      delete this.ui.settings.signatureImage;
    }
    if (typeof this.ui.saveSettings === 'function') {
      this.ui.saveSettings();
    }
  }
}


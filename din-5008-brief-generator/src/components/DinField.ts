// src/components/DinField.ts
import { setState, getState } from '../store/state';
import { debounce } from '../utils/debounce';

export class DinField extends HTMLElement {
  private fieldName: string = '';
  private updateState = debounce((value: string) => {
    setState({ [this.fieldName]: value });
  }, 400);

  connectedCallback() {
    this.fieldName = this.getAttribute('id') || this.getAttribute('name') || '';
    
    // Setup contenteditable and styling attributes
    this.contentEditable = 'plaintext-only';
    if (this.contentEditable !== 'plaintext-only') {
      this.contentEditable = 'true';
    }
    
    this.classList.add('din-field-element');

    // Initialwert aus State laden
    const current = getState()[this.fieldName];
    if (current) {
      this.textContent = current;
    }
    
    this.updatePlaceholder();

    this.addEventListener('input', () => {
      this.updateState(this.textContent || '');
      this.updatePlaceholder();
    });
  }
  
  private updatePlaceholder() {
    if (this.textContent?.trim() === '') {
      this.classList.add('has-placeholder');
    } else {
      this.classList.remove('has-placeholder');
    }
  }
}

// Registrierung der Web Component
if (!customElements.get('din-field')) {
  customElements.define('din-field', DinField);
}

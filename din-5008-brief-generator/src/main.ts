// src/main.ts
// Haupt-Entrypoint für die Vanilla JS + Web Components Variante

// 1. Globale Styles
import './index.css';

// 2. Icons
import { createIcons, FileText, Printer, RefreshCw, MapPin, Calendar, Sliders, Download } from 'lucide';

// 3. State & Store Init
import { getState, setState, loadInitialData } from './store/state';

// 4. Web Components Registrierung
import './components/DinField';
import './components/AddressAutocomplete';
import './components/DateSwiper';
import './components/DinPaper';
import './components/DevPanel';

document.addEventListener('DOMContentLoaded', () => {
  // Initiale Daten aus localStorage laden
  loadInitialData();

  // Developer Mode Init
  const initDevMode = () => {
    const isDevMode = localStorage.getItem('din-dev-mode') === 'true';
    if (isDevMode) {
      document.documentElement.setAttribute('data-dev-mode', 'true');
    }
  };
  initDevMode();

  // Developer Mode Toggle Logic (Single Click)
  const versionBadge = document.getElementById('version-badge');
  if (versionBadge) {
    versionBadge.addEventListener('click', () => {
      const isDev = document.documentElement.getAttribute('data-dev-mode') === 'true';
      const newState = !isDev;

      if (newState) {
        document.documentElement.setAttribute('data-dev-mode', 'true');
        localStorage.setItem('din-dev-mode', 'true');
        console.log('Developer Mode: ACTIVATED');
      } else {
        document.documentElement.removeAttribute('data-dev-mode');
        localStorage.setItem('din-dev-mode', 'false');
        console.log('Developer Mode: DEACTIVATED');
      }

      // Sync the custom element fallback class just in case :host-context isn't supported
      const devPanel = document.querySelector('dev-panel');
      if (devPanel && 'syncVisibility' in devPanel) {
        (devPanel as any).syncVisibility(newState);
      }
    });
  }

  // Initialize Icons
  createIcons({
    icons: { FileText, Printer, RefreshCw, MapPin, Calendar, Sliders, Download }
  });

  // Bind layout selector
  const layoutSelect = document.getElementById('layout-mode-select') as HTMLSelectElement;
  if (layoutSelect) {
    layoutSelect.value = getState().layoutMode || 'form-b';
    layoutSelect.addEventListener('change', (e) => {
      setState({ layoutMode: (e.target as HTMLSelectElement).value as 'form-a' | 'form-b' });
    });
  }
  
  console.log('DIN 5008 App initialisiert (Vanilla JS Mode).');
  console.log('Current Layout Mode:', getState().layoutMode);
});

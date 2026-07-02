// src/store/state.ts
import { debounce } from '../utils/debounce';

export type LetterData = {
  layoutMode: 'form-a' | 'form-b';
  info_date?: string;
  [key: string]: any;
};

let state: LetterData = {
  layoutMode: 'form-b',
};

const listeners: Array<() => void> = [];

const saveToLocalStorage = debounce(() => {
  localStorage.setItem('din-letter-data', JSON.stringify(state));
}, 400);

export function loadInitialData() {
  const saved = localStorage.getItem('din-letter-data');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed };
    } catch (e) {
      console.warn('Fehler beim Laden der gespeicherten Daten');
    }
  }
}

export function getState(): LetterData {
  return { ...state };
}

export function setState(newState: Partial<LetterData>) {
  state = { ...state, ...newState };
  saveToLocalStorage();
  listeners.forEach(fn => fn()); // alle Abonnenten benachrichtigen
}

export function subscribe(callback: () => void) {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) listeners.splice(index, 1);
  };
}

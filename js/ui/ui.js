/**
 * js/ui/ui.js — DOM Controller (V14 Platinum / IMR 2.0)
 * DIN-BriefNEO | SPEC-002, SPEC-007, ADR-003, CAA-008, PLAN-010
 * ─────────────────────────────────────────────────────────────────
 * IMR 2.0 MIGRATION:
 *   FIELD_MAP nutzt jetzt Tag-Selektoren statt HTML-IDs.
 *   _cacheFields() scannt via querySelector(tag).
 *   _deriveFields() nutzt tag-basierte Schlüssel.
 *   _bindGreetingGuard() reagiert auf <din-greeting> direkt.
 *
 * CEMETERY [TOMB-U001]:
 *   Alte IDs: 'f-date', 'f-subject', 'f-salut', 'f-body', etc.
 *   Ersatz: IMR-Tag-Selektoren 'din-date', 'din-subject', etc.
 */

import {
  formatDate, todayISO, getTag,
  parseRecipient, updateSalutationHint,
  deriveReturnLine, readDOMasJSON, syncGhostMirror, validateIBAN, formatIBAN, ghostIBAN,
} from '../logic/logic.js';

import { IMR } from '../core/constants.js';

/* ── TAG-MAP: Tag-Selektor → State-Key ──────────────────────── */
// Gebaut automatisch aus IMR — kein Hardcoding
const TAG_MAP = Object.fromEntries(IMR.map(e => [e.tag, e.key]));

const debounce = (fn, ms) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

export class UIController {
  constructor(stateManager) {
    this.sm      = stateManager;
    this._tags   = {};   // tag-selektor → Element (z.B. 'din-subject' → <din-subject>)
  }


  /* ── Data-IO Actions (Aviation Grade Event Delegation) ─────── */
  _bindActions() {
    document.addEventListener('click', e => {
      const action = e.target.closest('[data-action]');
      if (!action) return;
      
      switch (action.dataset.action) {
        case 'export':    this._doExport(); break;
        case 'reset':     this._doReset(); break;
      }
    });

    document.getElementById('file-import')?.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try { 
          this.sm.load(JSON.parse(ev.target.result)); 
          this._syncAllToDOM(); 
          this._syncMirrors();
          this._toast('✅ Backup geladen'); 
        } catch { this._toast('❌ Ungültige Datei', 'error'); }
      };
      reader.readAsText(file);
      e.target.value = '';
    });
  }

  init() {
    this._cacheTags();
    this._bindTagInputs();
    this._bindProfileDialog();
    this._bindKeyboard();
    this._bindGreetingGuard();
    this._bindActions();

    this.sm.subscribe((path, value, scope) => {
      if (scope === 'content') this._onContentChange(path, value);
    });

    this._syncAllToDOM();
    this._syncMirrors();
    this._setStatus('✅ Bereit');
  }

  /* ── Tag-Cache via IMR ───────────────────────────────────────── */
  _cacheTags() {
    for (const entry of IMR) {
      this._tags[entry.tag] = document.querySelector(entry.tag);
    }
  }

  /* ── Cursor-Safety: schreibt nie in fokussiertes Element ────── */
  _safeSet(el, text) {
    if (!el || document.activeElement === el) return;
    if (el.textContent !== text) el.textContent = text;
  }

  /* ── din-* Tags → State (input events) ─────────────────────── */
  _bindTagInputs() {
    const debouncedHistory = debounce(() => this.sm.pushHistory(), 800);
    const debouncedSave    = debounce(() => this.sm.save(), 1200);


    
    // --- SMART AUTO-SAVE (Denkpausen-Logic) ---
    const debouncedSave = this._debounce(() => {
      this._syncDOMToState();
      this._toast('💾 Auto-Save');
    }, 1500);

    document.getElementById('paper')?.addEventListener('input', e => {
      if (e.target.tagName.toLowerCase().startsWith('din-')) {
        debouncedSave();
        if (e.target.tagName.toLowerCase() === 'din-body') this._syncMirrors();
      }
    });

    // --- PASSIVE DOM-SSOT Logic ---
    // JavaScript schläft während du tippst. Erst bei Fokus-Wechsel 
    // oder Speichern wird das DOM gelesen und persistiert.
    document.getElementById('paper')?.addEventListener('focusin', e => {
      const tag = e.target.tagName.toLowerCase();
      if (tag.startsWith('din-')) {
        // Setze den CSS-Anchor für die Toolbar
        e.target.style.setProperty('--active-anchor', `--anchor-${tag.slice(4)}`);
      }
    });

    document.getElementById('paper')?.addEventListener('focusout', e => {
      // Automatischer Sync beim Verlassen eines Feldes
      if (e.target.tagName.toLowerCase().startsWith('din-')) {
        this._syncDOMToState();
        if (e.target.tagName.toLowerCase() === 'din-body') this._syncMirrors();
      }
    });

}

  /* ── Abgeleitete Felder ──────────────────────────────────────── */
  _deriveFields(changedKey, sourceEl) {
    const c = this.sm.state.content;

    // Absenderzeile aus Profil-Daten ableiten
    if (changedKey === 'sender') {
      const senderEl = this._tags['din-sender'];
      if (senderEl?.dataset.auto === 'true' || !c.sender) {
        const derived = deriveReturnLine({
          name:    c.senderName    || '',
          street:  c.senderStreet  || '',
          zipCity: c.senderZipCity || '',
        });
        this._safeSet(senderEl, derived);
        this.sm._raw.content.sender = derived;
        if (senderEl) senderEl.dataset.auto = 'true';
      }
    }

    // Anrede: SPEC-002 — nur Attribute setzen, CSS rendert
    if (changedKey === 'recipient') {
      const salEl    = this._tags['din-salutation'];
      const paper    = document.getElementById('paper');
      const formality     = paper?.dataset.formality     || 'formal';
      const recipientType = paper?.dataset.recipientType || 'none';
      updateSalutationHint(salEl, parseRecipient(c.recipient || ''), formality, recipientType);
    }
  }

    _doExport() {
    const data = JSON.stringify(this.sm.serialize(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: `din-brief-${todayISO()}.json` }).click();
    URL.revokeObjectURL(url);
    this._toast('💾 Export gespeichert');
  }

  _doReset() {
    this.sm.load(null);
    this.sm.save();
    this._syncAllToDOM();
    this._toast('🗑 Neues Blatt');
  }

  /* ── Profil-Dialog ───────────────────────────────────────────── */
  _bindProfileDialog() {
    document.getElementById('p-iban')?.addEventListener('input', e => {
      const formatted = formatIBAN(e.target.value);
      e.target.value = formatted;
      const ghost = document.getElementById('iban-ghost');
      if (ghost) ghost.textContent = ghostIBAN(formatted);
      if (formatted.replace(/\s/g,'').length >= 22) {
        const ok = validateIBAN(formatted);
        e.target.setAttribute('aria-invalid', ok ? 'false' : 'true');
        this._toast(ok ? '✅ IBAN gültig' : '❌ IBAN ungültig', ok ? '' : 'error');
      }
    });

    document.getElementById('btn-profile-save')?.addEventListener('click', () => {
      ['company','name','street','zip','city','phone','email','iban'].forEach(k => {
        const el = document.getElementById(`p-${k}`);
        if (el) this.sm.state.profile[k] = el.value.trim();
      });
      this.sm.save();
      document.getElementById('dialog-profile')?.hidePopover?.();
      this._applyProfileToSender();
      this._toast('👤 Profil gespeichert');
    });

    document.getElementById('btn-save-keys')?.addEventListener('click', () => {
      const g = document.getElementById('key-geoapify')?.value?.trim();
      const l = document.getElementById('key-languagetool')?.value?.trim();
      if (g) localStorage.setItem('neo_key_geoapify', g);
      if (l) localStorage.setItem('neo_key_languagetool', l);
      this._toast('🔑 API-Keys gespeichert');
    });
  }

  _applyProfileToSender() {
    const p = this.sm.state.profile;
    const setIfEmpty = (key, val) => { if (!this.sm._raw.content[key]) this.sm._raw.content[key] = val; };
    setIfEmpty('senderName',    p.name || p.company || '');
    setIfEmpty('senderStreet',  p.street || '');
    setIfEmpty('senderZipCity', [p.zip, p.city].filter(Boolean).join(' '));
    this._syncAllToDOM();
  }

  /* ── Grussformel-Wächter (SPEC-002 FR-008) ───────────────────── */
  _bindGreetingGuard() {
    // Event Delegation am #paper — reagiert auf <din-greeting> direkt
    document.getElementById('paper')?.addEventListener('input', e => {
      if (e.target.tagName.toLowerCase() !== 'din-greeting') return;
      const bad = /[,\.]$/.test(e.target.textContent.trim());
      e.target.setAttribute('aria-invalid', bad ? 'true' : 'false');
    });
  }

  /* ── Keyboard-Shortcuts ──────────────────────────────────────── */
  _bindKeyboard() {
    document.addEventListener('keydown', e => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 's')                               { e.preventDefault(); this.sm.save(); this._toast('💾 Gespeichert'); }
      if (ctrl && e.key === 'z' && !e.shiftKey)               { e.preventDefault(); if (this.sm.undo()) { this._syncAllToDOM(); this._toast('↩ Rückgängig'); } }
      if (ctrl && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); if (this.sm.redo()) { this._syncAllToDOM(); this._toast('↪ Wiederhergestellt'); } }
      if (ctrl && e.key === 'p')                               { e.preventDefault(); this._setStatus('🖨 Drucken…'); setTimeout(() => { window.print(); this._setStatus('✅ Bereit'); }, 120); }
    });
  }

  /* ── State → DOM Sync ───────────────────────────────────────── */
  _onContentChange(path, value) {
    const key   = path.split('.').pop();
    const entry = IMR.find(e => e.key === key);
    if (!entry) return;
    const el = this._tags[entry.tag];
    if (!el) return;
    this._safeSet(el, value || '');
  }

  _syncAllToDOM() {
    const c = this.sm.state.content;
    for (const entry of IMR) {
      const el = this._tags[entry.tag];
      if (!el) continue;
      this._safeSet(el, c[entry.key] || '');
    }
    // Profil-Inputs sync
    const p = this.sm.state.profile;
    ['company','name','street','zip','city','phone','email','iban'].forEach(k => {
      const el = document.getElementById(`p-${k}`);
      if (el && document.activeElement !== el) el.value = p[k] || '';
    });
  }

  /* ── Toast ───────────────────────────────────────────────────── */
  _toast(msg, type = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = Object.assign(document.createElement('div'), {
      className: `toast ${type}`.trim(),
      textContent: msg,
    });
    container.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  _setStatus(msg) {
    const el = document.getElementById('statusbar');
    if (el) el.textContent = msg;
  }

} // end UIController

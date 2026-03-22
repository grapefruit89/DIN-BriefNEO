/**
 * js/ui.js — DOM Controller & View Layer
 * Claude Brief · DIN 5008 Generator
 * ─────────────────────────────────────────────────────────
 * Responsibilities:
 *   1. Read contenteditable → write to state (input events)
 *   2. React to state changes → write to DOM
 *      CURSOR-SAFETY: NEVER update innerHTML/textContent of a
 *      field that currently has focus (document.activeElement).
 *   3. Manage dialogs, toasts, sidebar controls
 *   4. Bind settings controls → state.config
 *
 * Imports: StateManager (instance), logic.js functions
 */

import {
  formatDate, todayISO, parseDate,
  parseRecipient, deriveSalutation, deriveGreeting,
  deriveReturnLine, validateIBAN, formatIBAN, ghostIBAN,
} from './logic.js';

/* ── Field → state-key mapping ───────────────────────────────── */
const FIELD_MAP = {
  'f-sender-name':    'senderName',
  'f-sender-street':  'senderStreet',
  'f-sender-zip':     'senderZipCity',
  'f-sender-phone':   'senderPhone',
  'f-sender-email':   'senderEmail',
  'f-return':         'returnAddress',
  'f-special':        'specialNote',
  'f-rec-company':    'recipientCompany',
  'f-rec-salut':      'recipientSalut',
  'f-rec-name':       'recipientName',
  'f-rec-street':     'recipientStreet',
  'f-rec-zip':        'recipientZip',
  'f-rec-city':       'recipientCity',
  'f-date':           'date',
  'f-subject':        'subject',
  'f-salut':          'salutation',
  'f-body':           'body',
  'f-greeting':       'greeting',
  'f-sig-name':       'signatureName',
};

/* ── Debounce helper ─────────────────────────────────────────── */
const debounce = (fn, ms) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

export class UIController {
  constructor(stateManager) {
    this.sm = stateManager;
    this._saveTimer = null;
    this._histTimer = null;
    this._fields    = {};   // id → element cache
  }

  init() {
    this._cacheFields();
    this._bindFieldInputs();
    this._bindSettings();
    this._bindActions();
    this._bindEditorToolbar();
    this._bindDialogProfile();
    this._bindKeyboard();

    // Subscribe to state changes → update DOM
    this.sm.subscribe((path, value, scope) => {
      if (scope === 'content') this._onContentChange(path, value);
      if (scope === 'config')  this._onConfigChange();
    });

    this._applyAllToDOM();
    this._setStatus('✅ Bereit');
  }

  /* ── DOM helpers ─────────────────────────────────────────────── */

  _cacheFields() {
    Object.keys(FIELD_MAP).forEach(id => {
      this._fields[id] = document.getElementById(id);
    });
  }

  /** Safe DOM write: skip if the element is focused */
  _safeSet(el, html) {
    if (!el) return;
    if (document.activeElement === el) return;   // ← CURSOR-SAFETY GUARD
    if (el.innerHTML !== html) el.innerHTML = html;
    el.dataset.empty = el.textContent.trim() === '' ? 'true' : '';
  }

  _getText(el) {
    return el ? el.innerText.trim() : '';
  }

  /* ── Bind: contenteditable input events ─────────────────────── */

  _bindFieldInputs() {
    const debouncedHistory = debounce(() => this.sm.pushHistory(), 800);
    const debouncedSave    = debounce(() => this.sm.save(), 1200);

    Object.entries(FIELD_MAP).forEach(([id, key]) => {
      const el = this._fields[id];
      if (!el) return;
      el.addEventListener('input', () => {
        const val = id === 'f-body' ? el.innerHTML : this._getText(el);
        this.sm.state.content[key] = val;
        el.dataset.empty = el.textContent.trim() === '' ? 'true' : '';
        // Derive dependent fields
        this._deriveFields(key);
        debouncedHistory();
        debouncedSave();
      });
      // Mark empty on blur for placeholder visibility
      el.addEventListener('blur', () => {
        el.dataset.empty = el.textContent.trim() === '' ? 'true' : '';
      });
    });
  }

  /** Derive related fields when a source field changes */
  _deriveFields(changedKey) {
    const c = this.sm.state.content;
    const cfg = this.sm.state.config;

    // Return address: auto-derive from sender fields
    if (['senderName','senderStreet','senderZipCity'].includes(changedKey)) {
      const derived = deriveReturnLine({
        name:    c.senderName,
        street:  c.senderStreet,
        zipCity: c.senderZipCity,
      });
      // Only auto-fill if return field is empty or was auto-generated
      const retEl = this._fields['f-return'];
      if (retEl && (retEl.dataset.auto === 'true' || !c.returnAddress)) {
        this._safeSet(retEl, derived);
        this.sm._raw.content.returnAddress = derived;
        retEl.dataset.auto = 'true';
      }
    }

    // Salutation: auto-derive from recipient name + config
    if (['recipientName','recipientSalut','recipientCompany'].includes(changedKey)) {
      const analysis = parseRecipient(c.recipientName || c.recipientSalut);
      const sal = deriveSalutation(analysis, cfg.formality, cfg.recipientType);
      if (!c.salutation || this._fields['f-salut']?.dataset.auto === 'true') {
        this._safeSet(this._fields['f-salut'], sal);
        this.sm._raw.content.salutation = sal;
        if (this._fields['f-salut']) this._fields['f-salut'].dataset.auto = 'true';
      }
    }
  }

  /* ── Bind: sidebar settings ──────────────────────────────────── */

  _bindSettings() {
    // Radio groups → config
    document.querySelectorAll('input[type=radio]').forEach(radio => {
      radio.addEventListener('change', () => {
        if (!radio.checked) return;
        const { name, value } = radio;
        const keyMap = {
          layout: 'layout', formality: 'formality',
          recipientType: 'recipientType', dateFormat: 'dateFormat',
        };
        if (keyMap[name]) {
          this.sm.state.config[keyMap[name]] = value;
          this._onConfigChange();
          this.sm.save();
        }
      });
    });

    // Guides toggle
    const guidesChk = document.getElementById('toggle-guides');
    guidesChk?.addEventListener('change', () => {
      this.sm.state.config.showGuides = guidesChk.checked;
      this._applyLayout();
      this.sm.save();
    });
  }

  /* ── Bind: action buttons ────────────────────────────────────── */

  _bindActions() {
    const on = (id, fn) => document.getElementById(id)?.addEventListener('click', fn);

    on('btn-print',   () => this._doPrint());
    on('btn-export',  () => this._doExport());
    on('btn-import',  () => document.getElementById('file-import')?.click());
    on('btn-reset',   () => this._showConfirm());
    on('btn-profile', () => this._openProfile());

    // Confirm dialog
    on('btn-confirm-yes', () => {
      document.getElementById('dialog-confirm')?.close();
      this._doReset();
    });
    on('btn-confirm-no', () => document.getElementById('dialog-confirm')?.close());

    // Generic dialog-close buttons
    document.querySelectorAll('[data-js="action:dialog-close"]').forEach(btn => {
      btn.addEventListener('click', () => btn.closest('dialog')?.close());
    });

    // File import
    document.getElementById('file-import')?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          this.sm.load(data);
          this._applyAllToDOM();
          this._toast('✅ Backup geladen');
        } catch { this._toast('❌ Ungültige Datei', 'error'); }
      };
      reader.readAsText(file);
      e.target.value = '';
    });
  }

  _doPrint() {
    this._setStatus('🖨 Drucken…');
    // Allow layout to settle, then print
    setTimeout(() => { window.print(); this._setStatus('✅ Bereit'); }, 120);
  }

  _doExport() {
    const data = JSON.stringify(this.sm.serialize(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), {
      href: url, download: `brief-backup-${todayISO()}.json`,
    });
    a.click(); URL.revokeObjectURL(url);
    this._toast('💾 Export gespeichert');
  }

  _doReset() {
    this.sm.load(null);   // StateManager falls back to DEFAULT_STATE
    this.sm.save();
    this._applyAllToDOM();
    this._toast('🗑 Neues Blatt geladen');
  }

  _showConfirm() {
    document.getElementById('dialog-confirm')?.showModal();
  }

  /* ── Bind: floating editor toolbar ──────────────────────────── */

  _bindEditorToolbar() {
    const toolbar = document.getElementById('editor-toolbar');
    if (!toolbar) return;

    // Show toolbar when any contenteditable in #paper gains focus
    document.getElementById('paper')?.addEventListener('focusin', (e) => {
      if (e.target.isContentEditable) toolbar.classList.add('visible');
    });
    document.addEventListener('focusout', (e) => {
      // Hide only if focus leaves the paper entirely
      setTimeout(() => {
        if (!document.activeElement?.isContentEditable) {
          toolbar.classList.remove('visible');
        }
      }, 120);
    });

    // Format commands
    toolbar.querySelectorAll('[data-cmd]').forEach(btn => {
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault(); // keep focus on contenteditable
        const cmd = btn.dataset.cmd;
        const val = btn.dataset.val || null;
        document.execCommand(cmd, false, val);
      });
    });

    // Undo / Redo
    toolbar.querySelector('[data-js="action:undo"]')?.addEventListener('click', () => {
      if (this.sm.undo()) { this._applyAllToDOM(); this._toast('↩ Rückgängig'); }
    });
    toolbar.querySelector('[data-js="action:redo"]')?.addEventListener('click', () => {
      if (this.sm.redo()) { this._applyAllToDOM(); this._toast('↪ Wiederhergestellt'); }
    });
  }

  /* ── Bind: profile dialog ────────────────────────────────────── */

  _openProfile() {
    const prof = this.sm.state.profile;
    ['company','name','street','zip','city','phone','email','iban'].forEach(k => {
      const el = document.getElementById(`p-${k}`);
      if (el) el.value = prof[k] || '';
    });
    this._updateIBANGhost(prof.iban || '');
    document.getElementById('dialog-profile')?.showModal();
  }

  _bindDialogProfile() {
    document.getElementById('btn-profile-save')?.addEventListener('click', () => {
      ['company','name','street','zip','city','phone','email','iban'].forEach(k => {
        const el = document.getElementById(`p-${k}`);
        if (el) this.sm.state.profile[k] = el.value.trim();
      });
      this.sm.save();
      document.getElementById('dialog-profile')?.close();
      this._applyProfileToSender();
      this._toast('👤 Profil gespeichert');
    });

    // IBAN ghost overlay
    document.getElementById('p-iban')?.addEventListener('input', (e) => {
      const formatted = formatIBAN(e.target.value);
      e.target.value = formatted;
      this._updateIBANGhost(formatted);
      // IBAN validation feedback
      if (formatted.replace(/\s/g,'').length >= 22) {
        const valid = validateIBAN(formatted);
        this._toast(valid ? '✅ IBAN gültig' : '❌ IBAN ungültig', valid ? '' : 'error');
      }
    });
  }

  _updateIBANGhost(typed) {
    const ghost = document.getElementById('iban-ghost');
    if (ghost) ghost.textContent = ghostIBAN(typed);
  }

  _applyProfileToSender() {
    const p = this.sm.state.profile;
    const set = (key, val) => {
      if (!this.sm._raw.content[key]) {   // only fill if field is empty
        this.sm._raw.content[key] = val;
      }
    };
    const name    = [p.company, p.name].filter(Boolean).join('\n');
    const zipCity = [p.zip, p.city].filter(Boolean).join(' ');
    set('senderName',    p.name    || p.company);
    set('senderStreet',  p.street);
    set('senderZipCity', zipCity);
    set('senderPhone',   p.phone);
    set('senderEmail',   p.email);
    this._applyAllToDOM();
  }

  /* ── Bind: keyboard shortcuts ────────────────────────────────── */

  _bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 's') { e.preventDefault(); this.sm.save(); this._toast('💾 Gespeichert'); }
      if (ctrl && e.key === 'z') { e.preventDefault(); if (this.sm.undo()) { this._applyAllToDOM(); this._toast('↩ Rückgängig'); } }
      if (ctrl && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        if (this.sm.redo()) { this._applyAllToDOM(); this._toast('↪ Wiederhergestellt'); }
      }
      if (e.key === 'Escape') {
        document.querySelectorAll('dialog[open]').forEach(d => d.close());
      }
    });
  }

  /* ── Reactive: state → DOM ───────────────────────────────────── */

  _onContentChange(path, value) {
    const key = path.split('.').pop();
    const fieldId = Object.entries(FIELD_MAP).find(([,v]) => v === key)?.[0];
    if (!fieldId) return;
    const el = this._fields[fieldId];
    if (!el) return;
    const html = fieldId === 'f-body' ? value : (value || '');
    this._safeSet(el, html);
  }

  _onConfigChange() {
    this._applyLayout();
    this._applySidebarState();
  }

  /* ── Full DOM sync (on load / undo / redo) ───────────────────── */

  _applyAllToDOM() {
    const c   = this.sm.state.content;
    const cfg = this.sm.state.config;

    Object.entries(FIELD_MAP).forEach(([id, key]) => {
      const el = this._fields[id];
      if (!el) return;
      const val = c[key] || '';
      this._safeSet(el, id === 'f-body' ? val : val);
    });

    this._applyLayout();
    this._applySidebarState();
  }

  _applyLayout() {
    const cfg = this.sm.state.config;
    const html = document.documentElement;
    const paper = document.getElementById('paper');

    // Form A / B
    html.dataset.layout = cfg.layout;
    paper?.classList.toggle('form-a', cfg.layout === 'form-a');
    paper?.classList.toggle('form-b', cfg.layout !== 'form-a');

    // Guides
    paper?.classList.toggle('show-guides', !!cfg.showGuides);
    const guidesChk = document.getElementById('toggle-guides');
    if (guidesChk) guidesChk.checked = !!cfg.showGuides;

    // Date label previews in sidebar
    const now = new Date();
    const safe = (id, fmt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = formatDate(now, fmt);
    };
    safe('lbl-date-de',   'de');
    safe('lbl-date-long', 'long');
    safe('lbl-date-iso',  'iso');
  }

  _applySidebarState() {
    const cfg = this.sm.state.config;
    // Sync radio buttons
    const setRadio = (name, val) => {
      const el = document.querySelector(`input[name="${name}"][value="${val}"]`);
      if (el) el.checked = true;
    };
    setRadio('layout',        cfg.layout);
    setRadio('formality',     cfg.formality);
    setRadio('recipientType', cfg.recipientType);
    setRadio('dateFormat',    cfg.dateFormat);
  }

  /* ── Toast notifications ─────────────────────────────────────── */

  _toast(msg, type = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`.trim();
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  /* ── Status bar ──────────────────────────────────────────────── */

  _setStatus(msg) {
    const el = document.getElementById('statusbar');
    if (el) el.textContent = msg;
  }

  /* ── Init helpers: today's date ──────────────────────────────── */

  _setInitialDate() {
    const c = this.sm.state.content;
    if (!c.date) {
      const fmt = this.sm.state.config.dateFormat;
      const today = formatDate(new Date(), fmt);
      this.sm.state.content.date = today;
      const el = this._fields['f-date'];
      if (el) { this._safeSet(el, today); el.dataset.auto = 'true'; }
    }
  }

}  // end UIController

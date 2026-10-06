// @ts-check
// @adr [[ADR-OFFLINE-ADDRESS-INTELLIGENCE]]
// @guide [[din-5008-css-architektur]]

import { AddressIntelligence } from './45-address-intelligence.js';

/**
 * @typedef {object} AddressCandidate
 * @property {number} [score]
 * @property {string} [firma]
 * @property {string} [name]
 * @property {string} [zusatz]
 * @property {string} strasse
 * @property {string} plz
 * @property {string} ort
 * @property {string} [source_type]
 */

/**
 * ClipboardAddressParser: 95%-KISS Adressparser für deutsche Firmen- und Personenanschriften.
 * Folgt dem Kernmuster: PLZ-Zeile als Anker, Zeile davor als Straße, Zeilen davor als Empfänger.
 * Bietet bei Mehrdeutigkeit ein sauberes Popover zur Nutzer-Auswahl statt überfrachteter Heuristiken.
 */
export class ClipboardAddressParser {
  /**
   * Typische deutsche Rechtsformen und Organisationen
   */
  static CORP_REGEX = /\b(gmbh\s*&\s*co\.?\s*kg|gmbh|ag|se|kg|ohg|e\.v\.|ug|gbr|e\.k\.|e\.?g\.?|universität|hochschule|verband|stiftung|behörde|institut|verlag|kanzlei|praxis|apotheke|büro|agentur|studio|klinik|hotel|restaurant|bank|sparkasse)\b/i;

  /**
   * Anreden und Empfänger-Prefixe
   */
  static PERSON_PREFIX_REGEX = /^(herr|frau|herrn|dr\.|prof\.|z\.\s*hd\.|zu\s*händen)\b/i;

  /**
   * Straßenschlüsselwörter und Postfach
   */
  static STREET_REGEX = /(?:str(?:aße|asse|\.)?|weg|platz|allee|damm|ring|ufer|gasse|zeile|chaussee|speersort|spitze|bellevue|postfach)\b/i;

  /**
   * Zeilen-Marker für nicht-adressrelevante Metadaten (Telefon, Web, Register etc.)
   */
  static METADATA_LINE_REGEX = /^(tel[:\.\d\+\/]|telefon|fax[:\.\d\+\/]|telefax|e-?mail|www\.|https?:\/\/|amtsgericht|handelsregister|hr[ab]\b|ust-?id|steuernummer|ihr zeichen|unsere zeichen|datum:)/i;

  /**
   * Abschnittsüberschriften, die nicht als Empfängername interpretiert werden dürfen
   */
  static SECTION_LABEL_REGEX = /^(hauptsitz|niederlassung|standort|filiale|zentrale|werk|postadresse|hausanschrift|anschrift|adresse|impressum|kontakt)[:\s]*$/i;

  /**
   * Extrahiert Adress-Kandidaten aus unstrukturiertem Text.
   * @param {string} text
   * @returns {AddressCandidate[]}
   */
  static parse(text) {
    if (!text || typeof text !== 'string') return [];

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    const plzOrtRegex = /\b(\d{5})\s+([A-ZÄÖÜ][a-zäöüßA-Z\s\-\/\.]+)/;
    /** @type {AddressCandidate[]} */
    const candidates = [];

    // PASS 1: Mehrzeilige Adressblöcke (PLZ-Zeile als Anker)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const plzMatch = line.match(plzOrtRegex);
      if (!plzMatch) continue;

      const plz = plzMatch[1];
      let ort = plzMatch[2].trim().split(/[,;\(]|\b(Tel|Fax|E-Mail|Telefon)\b/i)[0].trim();
      if (i === 0) continue;

      const prevLine = lines[i - 1].trim();
      const isStreet = (/\d+/.test(prevLine) && this.STREET_REGEX.test(prevLine)) ||
                       this.STREET_REGEX.test(prevLine) ||
                       /\d+/.test(prevLine) ||
                       /^postfach\s+\d+/i.test(prevLine);
      if (!isStreet) continue;

      const street = prevLine.replace(/^(postanschrift|hausanschrift|anschrift|adresse|postadresse)\s*:\s*/i, '').replace(/,+$/, '').trim();

      let candFirma = '';
      let candName = '';
      let candZusatz = '';

      // Maximal 2 Zeilen vor der Straße betrachten
      /** @type {string[]} */
      const preLines = [];
      for (let j = i - 2; j >= Math.max(0, i - 4); j--) {
        const l = lines[j].trim();
        if (this.METADATA_LINE_REGEX.test(l) || l.length > 80 || l.includes('|')) break;
        if (plzOrtRegex.test(l) || /^\d{5}\b/.test(l)) break; // Stopp bei vorangehender Adresse
        if (this.SECTION_LABEL_REGEX.test(l)) continue;

        const cleanL = l.replace(/^(anbieterin|anbieter|unsere daten|kontakt|impressum|herausgeber|geschäftsführung|geschäftsführer|vertreten durch)\s*:\s*/i, '').trim();
        if (cleanL && !cleanL.endsWith(':')) preLines.unshift(cleanL);
      }

      if (preLines.length === 1) {
        const single = preLines[0];
        if (this.CORP_REGEX.test(single)) {
          candFirma = single;
        } else {
          candName = single;
        }
      } else if (preLines.length >= 2) {
        const l0 = preLines[preLines.length - 2];
        const l1 = preLines[preLines.length - 1];

        if (this.CORP_REGEX.test(l0)) {
          candFirma = l0;
          if (this.PERSON_PREFIX_REGEX.test(l1) || !/\d/.test(l1)) {
            candName = l1.replace(/^(z\.\s*hd\.|zu\s*händen)\s*:?\s*/i, '').trim();
          } else {
            candZusatz = l1;
          }
        } else if (this.CORP_REGEX.test(l1)) {
          candFirma = l1;
          candName = l0;
        } else {
          candFirma = l0;
          candName = l1;
        }
      }

      candidates.push({
        firma: candFirma,
        name: candName,
        zusatz: candZusatz,
        strasse: street,
        plz,
        ort,
        source_type: 'multiline'
      });
    }

    // PASS 2: Einzeilige, kommagetrennte Adressen
    for (const line of lines) {
      if (!line.includes(',')) continue;
      const parts = line.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length < 3) continue;

      const lastPart = parts[parts.length - 1];
      const plzMatch = lastPart.match(plzOrtRegex);
      if (!plzMatch) continue;

      const streetPart = parts[parts.length - 2];
      if (!this.STREET_REGEX.test(streetPart) && !/\d+/.test(streetPart)) continue;

      const nameParts = parts.slice(0, parts.length - 2);
      const first = nameParts[0] || '';
      const second = nameParts[1] || '';

      let candFirma = '';
      let candName = '';
      let candZusatz = '';

      if (this.CORP_REGEX.test(first)) {
        candFirma = first;
        if (second) candName = second;
      } else {
        candName = first;
        if (second) candZusatz = second;
      }

      candidates.push({
        firma: candFirma,
        name: candName,
        zusatz: candZusatz,
        strasse: streetPart,
        plz: plzMatch[1],
        ort: plzMatch[2].trim(),
        source_type: 'inline'
      });
    }

    // Deduplizieren nach PLZ und bereinigter Straße
    /** @type {AddressCandidate[]} */
    const unique = [];
    const seen = new Set();
    for (const c of candidates) {
      const key = `${c.plz}-${c.strasse.toLowerCase().replace(/[\s\-_]/g, '')}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(c);
      }
    }

    return unique;
  }

  /**
   * Überträgt einen Adress-Kandidaten in die DIN-5008-Formularfelder.
   * @param {AddressCandidate} candidate
   * @param {{ onToast?: ((msg: string, type?: string) => void) | null, onSaveDraft?: (() => void) | null }} [options]
   */
  static applyCandidate(candidate, { onToast = null, onSaveDraft = null } = {}) {
    const empfFirmaEl = document.getElementById('empfaenger-firma');
    const empfNameEl = document.getElementById('empfaenger-namenszeile');
    const empfStrasseEl = document.getElementById('empfaenger-strasse');
    const empfOrtEl = document.getElementById('empfaenger-ort');

    // 1. Ziel-Sperre in AddressIntelligence setzen
    AddressIntelligence.targetLock = { plz: candidate.plz, city: candidate.ort };

    // 2. Felder befüllen und Events triggern
    if (empfFirmaEl) {
      const firmaText = candidate.zusatz ? `${candidate.firma || ''}\n${candidate.zusatz}`.trim() : (candidate.firma || '');
      empfFirmaEl.textContent = firmaText;
      empfFirmaEl.dispatchEvent(new Event('input', { bubbles: true }));
      empfFirmaEl.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (empfNameEl) {
      empfNameEl.textContent = candidate.name || '';
      empfNameEl.dispatchEvent(new Event('input', { bubbles: true }));
      empfNameEl.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (empfStrasseEl) {
      empfStrasseEl.textContent = candidate.strasse;
      empfStrasseEl.dispatchEvent(new Event('input', { bubbles: true }));
      empfStrasseEl.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (empfOrtEl) {
      empfOrtEl.textContent = `${candidate.plz} ${candidate.ort}`;
      empfOrtEl.dispatchEvent(new Event('input', { bubbles: true }));
      empfOrtEl.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // 3. Autocomplete-Dropdowns schließen
    try {
      const plzPopover = /** @type {HTMLElement & { hidePopover?: () => void }} */ (document.getElementById('plz-suggestions-popover'));
      if (plzPopover?.hidePopover) plzPopover.hidePopover();
      const addrPopover = /** @type {HTMLElement & { hidePopover?: () => void }} */ (document.getElementById('anschrift-vorschlaege'));
      if (addrPopover?.hidePopover) addrPopover.hidePopover();
    } catch {
      // Ignoriert
    }

    if (onSaveDraft) {
      onSaveDraft();
    }

    if (onToast) {
      const label = candidate.firma || candidate.name || candidate.strasse;
      onToast(`📋 Adresse übernommen: ${label} (${candidate.ort})`, 'success');
    }
  }

  /**
   * Verdrahtet den Sidebar-Button und das Auswahllisten-Popover.
   * @param {{ onToast?: ((msg: string, type?: string) => void) | null, onSaveDraft?: (() => void) | null }} [options]
   */
  static wireSidebarButton({ onToast = null, onSaveDraft = null } = {}) {
    const btn = document.getElementById('btn-zwischenablage-anschrift');
    const popover = document.getElementById('clipboard-candidates-popover');
    if (!btn) return;

    btn.addEventListener('click', async () => {
      try {
        if (!navigator.clipboard?.readText) {
          if (onToast) onToast('⚠️ Zwischenablage-Zugriff wird von diesem Browser nicht unterstützt.', 'error');
          return;
        }

        const text = await navigator.clipboard.readText();
        if (!text || !text.trim()) {
          if (onToast) onToast('⚠️ Die Zwischenablage ist leer.', 'warning');
          return;
        }

        const candidates = this.parse(text);

        if (candidates.length === 0) {
          if (onToast) onToast('⚠️ Keine gültige Anschrift in der Zwischenablage gefunden.', 'warning');
          return;
        }

        if (candidates.length === 1) {
          this.applyCandidate(candidates[0], { onToast, onSaveDraft });
          return;
        }

        // Mehrere Adressen gefunden: Popover zur Auswahl öffnen
        if (popover) {
          popover.replaceChildren();

          const header = document.createElement('li');
          header.className = 'autocomplete-header';
          header.textContent = `📋 ${candidates.length} Adressen gefunden:`;
          popover.appendChild(header);

          candidates.forEach((cand, idx) => {
            const item = document.createElement('li');
            item.className = 'autocomplete-item';
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');

            const compSpan = document.createElement('strong');
            const mainLabel = cand.firma || cand.name || 'Empfänger';
            compSpan.textContent = `${idx + 1}. ${mainLabel}`;

            const addrSpan = document.createElement('span');
            addrSpan.className = 'autocomplete-sub';
            addrSpan.textContent = ` • ${cand.strasse}, ${cand.plz} ${cand.ort}`;

            item.appendChild(compSpan);
            item.appendChild(addrSpan);

            const selectCandidate = () => {
              this.applyCandidate(cand, { onToast, onSaveDraft });
              try {
                // @ts-ignore
                popover.hidePopover();
              } catch {
                popover.classList.remove('active');
              }
            };

            item.addEventListener('click', selectCandidate);
            item.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectCandidate();
              }
            });

            popover.appendChild(item);
          });

          try {
            // @ts-ignore
            popover.showPopover();
          } catch {
            popover.classList.add('active');
          }
        } else {
          this.applyCandidate(candidates[0], { onToast, onSaveDraft });
        }
      } catch (err) {
        console.warn('[Clipboard] Lesefehler:', err);
        if (onToast) onToast('⚠️ Zugriff auf die Zwischenablage verweigert oder blockiert.', 'error');
      }
    });
  }
}

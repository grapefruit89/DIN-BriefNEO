// @ts-check
// @adr [[ADR-007-Smart-Clipboard-Impressum-Parser]]
// @guide [[din-5008-anschriftfeld]]

import { AddressIntelligence } from './45-address-intelligence.js';

/**
 * @typedef {object} AddressCandidate
 * @property {number} score
 * @property {string} [firma]
 * @property {string} [name]
 * @property {string} [zusatz]
 * @property {string} strasse
 * @property {string} plz
 * @property {string} ort
 * @property {string} [source_type]
 */

/**
 * ClipboardAddressParser: High-precision deterministic parser for German company imprints,
 * private person signatures, and contact cards.
 * Extracts DIN-5008 postal address blocks from messy clipboard text in < 0.1ms.
 */
export class ClipboardAddressParser {
  /**
   * Legal entity & corporate forms regex
   */
  static CORP_REGEX = /\b(gmbh\s*&\s*co\.?\s*kg|gmbh\s*&\s*co\s*kg|gmbh\s*&\s*cokg|gmbh|ag|se|kg|ohg|e\.v\.|ug|gbr|e\.k\.|universität|hochschule|verband|stiftung|behörde|institut|verlag|bundesverband|körperschaft|kanzlei|praxis|apotheke|büro|agentur|studio|klinik|hotel|restaurant)\b/i;

  /**
   * Person honorifics and contact line markers
   */
  static PERSON_PREFIX_REGEX = /^(herr|frau|herrn|dr\.|prof\.|z\.\s*hd\.|zu\s*händen)\b/i;

  /**
   * Prefixes that indicate non-recipient administrative/legal metadata
   */
  static EXCLUDED_PREFIXES = [
    'registergericht', 'registernummer', 'registriergericht', 'registriernummer',
    'amtsgericht', 'ag ', 'hrb', 'hra', 'vr ', 'ust-id', 'ust.-id', 'ustid', 'w-idnr',
    'steuernummer', 'diensteanbieter', 'impressum', 'kontakt', 'tel', 'telefon',
    'fax', 'telefax', 'email', 'e-mail', 'mail:', 'www.', 'http', 'https',
    'vertreten durch', 'geschäftsführung', 'geschäftsführer', 'chefredakteur',
    'chefredaktion', 'verantwortlich', 'sitz der gesellschaft', 'vorsitzender',
    'aufsichtsrat', 'redaktion', 'jugendschutz', 'online-rundfunkangebot',
    'zentrale kontaktstelle', 'eigentumsverhältnisse', 'gesellschafterin',
    'wirtschaftliche eigentümer', 'fragen zu', 'information gemäß', 'verleger:',
    'herausgeber:', 'editor-at-large:', 'newsroom:', 'ressortleitungen:',
    'autoren:', 'reporter:', 'quellenhinweis:', 'druck:', 'abonnentenservice',
    'anzeigenservice', 'pressestelle', 'geschäftsstelle', 'abonnementspreis',
    'erfüllungsort', 'intranet', 'sie sind hier:', 'startseite',
    'vorbehalt nach', 'die nutzung und vervielfältigung', 'anfahrt / lageplan',
    'öffnungszeiten', 'handelsregister', 'bankkonto', 'unsere daten', 'service',
    'pfadnavigation', 'veröffentlicht am', 'aktualisiert am', 'lesedauer:',
    'klicken sie hier', 'mehr erfahren', 'jetzt aktivieren', 'abo testen',
    'konzeption, gestaltung', 'alle zulassen', 'inhaber:', 'postadresse:',
    'postanschrift:', 'hausanschrift:', 'adresse:', 'anschrift:'
  ];

  /**
   * Checks if a string candidate is invalid as a company or person name
   * @param {string} cand
   * @returns {boolean}
   */
  static isInvalidNameCandidate(cand) {
    const candLower = cand.toLowerCase().trim();
    if (cand.length > 75 || cand.length < 2) return true;
    if (this.EXCLUDED_PREFIXES.some(p => candLower.startsWith(p))) return true;
    // Cannot be a PLZ / Ort line
    if (/^\d{5}\s+/.test(cand)) return true;
    // Cannot be a pure street line with ending house number
    if (/\d+[\s\-\/a-zA-Z0-9]*$/.test(cand) && /(str|weg|platz|allee|damm|ring|ufer|spitze|speersort|gasse)/i.test(candLower)) {
      return true;
    }
    const markers = ['gemäß', 'gem.', 'abs.', 'satz', 'aufsicht', 'rechtsaufsicht', 'ausnahme', 'beiträge',
                     'kennzeichnung', 'startseite', 'sie sind hier', 'intranet', 'ist die',
                     'wird verantwortet durch', 'angebot unter', 'urhg', 'gema', 'wahr.', 'nimmt wahr'];
    return markers.some(m => candLower.includes(m));
  }

  /**
   * Parses raw clipboard text and extracts ranked address candidates.
   * Handles company imprints, private person signatures, and mixed contact blocks.
   * @param {string} text
   * @returns {AddressCandidate[]}
   */
  static parse(text) {
    if (!text || typeof text !== 'string') return [];

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    /** @type {AddressCandidate[]} */
    const candidates = [];

    // PASS 1: Inline comma-separated address detection
    // Example: "Axel Springer Deutschland GmbH, WELT, Schützenstraße 15–17, 10117 Berlin"
    // Or: "Dr. Julia Wagner, Goethestraße 14, 79100 Freiburg"
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      const cleanLine = line.replace(/^(Postanschrift|Hausanschrift|Postadresse|Adresse|Anschrift)\s*:\s*/i, '').trim();

      if (cleanLine.includes(',')) {
        const parts = cleanLine.split(',').map(p => p.trim()).filter(Boolean);
        if (parts.length >= 3) {
          const lastPart = parts[parts.length - 1];
          const plzMatch = lastPart.match(/\b(\d{5})\s+([A-ZÄÖÜ][a-zäöüßA-Z\s\-\/\.]+)/);
          if (plzMatch) {
            const plz = plzMatch[1];
            const ort = plzMatch[2].trim();
            if (!ort.endsWith('.') && !/wahr|gemäß|siehe/i.test(ort)) {
              const streetCand = parts[parts.length - 2];
              const hasNum = /\d+/.test(streetCand);
              if (hasNum) {
                const nameCand = parts[0];
                const zusatzCand = parts.length > 3 ? parts.slice(1, -2).join(" ") : "";
                if (!this.isInvalidNameCandidate(nameCand)) {
                  const isCorp = this.CORP_REGEX.test(nameCand);
                  const isPerson = this.PERSON_PREFIX_REGEX.test(nameCand) || (!isCorp && nameCand.split(/\s+/).length <= 4 && !/\d/.test(nameCand));

                  candidates.push({
                    score: 160 - (lineIdx * 0.15),
                    firma: isCorp ? nameCand : "",
                    name: isPerson ? nameCand : "",
                    zusatz: zusatzCand,
                    strasse: streetCand,
                    plz,
                    ort,
                    source_type: 'inline_comma'
                  });
                }
              }
            }
          }
        }
      }
    }

    // PASS 2: Multi-line address block scanning
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const plzMatch = line.match(/\b(\d{5})\s+([A-ZÄÖÜ][a-zäöüßA-Z\s\-\/\.]+)/);
      if (!plzMatch) continue;

      const plz = plzMatch[1];
      let ort = plzMatch[2].trim();
      ort = ort.split(/[,;\(]|\b(Tel|Fax|E-Mail|Telefon)\b/i)[0].trim();

      // Ignore register lines
      if (/^(handelsregister|amtsgericht|registergericht|ust-id)/i.test(line)) continue;

      if (i === 0) continue;

      const prevLine = lines[i - 1].trim();
      if (prevLine.includes('|')) continue;

      const hasNumber = /\d+[\s\-\/a-zA-Z0-9]*$/.test(prevLine);
      const hasStreetKw = /(str|weg|platz|allee|damm|ring|ufer|gasse|zeile|speersort|spitze|biefangstr|bellevue)/i.test(prevLine);

      if (!hasNumber && !hasStreetKw) continue;

      let street = prevLine.replace(/^(Postanschrift|Hausanschrift|Anschrift|Adresse|Postadresse)\s*:\s*/i, '').trim();
      street = street.replace(/,+$/, '').trim();

      let foundComp = '';
      let foundName = '';
      let foundZusatz = '';

      // Scan upwards (up to 7 lines) for company, person name, or building/department
      for (let offset = i - 2; offset >= Math.max(0, i - 8); offset--) {
        const cand = lines[offset].trim();
        if (this.isInvalidNameCandidate(cand)) continue;

        const candClean = cand.replace(/^(anbieterin|anbieter|träger der webseite ist die|ist ein angebot der|der online-auftritt der [a-zäöüß]+ wird verantwortet durch|unsere daten)\s*:\s*/i, '').trim();
        if (!candClean) continue;

        const hasCorp = this.CORP_REGEX.test(candClean);
        const hasPersonPrefix = this.PERSON_PREFIX_REGEX.test(candClean);
        const hasBuilding = /(haus|turm|gebäude|campus|bibliothek|abteilung)/i.test(candClean);

        if (hasPersonPrefix && !foundName) {
          foundName = candClean.replace(/^(z\.\s*hd\.|zu\s*händen)\s*:?\s*/i, '').trim();
        } else if (hasCorp && !foundComp) {
          foundComp = candClean;
        } else if (hasBuilding && !foundZusatz) {
          foundZusatz = candClean;
        } else if (!foundComp && !foundName) {
          const words = candClean.split(/\s+/);
          if (words.length >= 2 && words.length <= 4 && !/\d/.test(candClean)) {
            foundName = candClean;
          } else {
            foundComp = candClean;
          }
        }
      }

      if ((foundComp || foundName) && street && plz && ort) {
        let score = 80;
        if (foundComp && this.CORP_REGEX.test(foundComp)) score += 40;
        if (foundName) score += 30;

        const context = lines.slice(Math.max(0, i - 6), i + 1).join(" ").toLowerCase();
        if (context.includes('postanschrift') || context.includes('postadresse')) score += 25;

        score -= (i * 0.15); // Items near top receive higher priority

        candidates.push({
          score,
          firma: foundComp,
          name: foundName,
          zusatz: foundZusatz,
          strasse: street,
          plz,
          ort,
          source_type: 'multiline'
        });
      }
    }

    // Sort descending by relevance score
    candidates.sort((a, b) => b.score - a.score);

    // Deduplicate candidates with identical PLZ and street
    /** @type {AddressCandidate[]} */
    const unique = [];
    const seen = new Set();
    for (const c of candidates) {
      const key = `${c.plz}-${c.strasse.toLowerCase().replace(/\s+/g, '')}-${(c.name || '').toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(c);
      }
    }

    return unique;
  }

  /**
   * Applies an address candidate into the DIN 5008 DOM fields.
   * Suppresses autocomplete popovers to prevent unwanted dropdown overlays.
   * @param {AddressCandidate} candidate
   * @param {{ onToast?: ((msg: string, type?: string) => void) | null, onSaveDraft?: (() => void) | null }} [options]
   */
  static applyCandidate(candidate, { onToast = null, onSaveDraft = null } = {}) {
    const empfFirmaEl = document.getElementById('empfaenger-firma');
    const empfNameEl = document.getElementById('empfaenger-name');
    const empfStrasseEl = document.getElementById('empfaenger-strasse');
    const empfOrtEl = document.getElementById('empfaenger-ort');

    // 1. Set Target Lock in Address Intelligence to lock city context
    AddressIntelligence.targetLock = { plz: candidate.plz, city: candidate.ort };

    // 2. Populate DIN 5008 fields
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

    // 3. Proactively hide any autocomplete popovers so they don't overlay the letter
    try {
      const plzPopover = document.getElementById('plz-suggestions-popover');
      // @ts-ignore
      if (plzPopover && typeof plzPopover.hidePopover === 'function') {
        // @ts-ignore
        plzPopover.hidePopover();
      }
      const addrPopover = document.getElementById('address-suggestions');
      // @ts-ignore
      if (addrPopover && typeof addrPopover.hidePopover === 'function') {
        // @ts-ignore
        addrPopover.hidePopover();
      }
    } catch (e) {
      // Ignored
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
   * Wires the explicit Sidebar button and interactive candidate popover.
   * @param {{ onToast?: ((msg: string, type?: string) => void) | null, onSaveDraft?: (() => void) | null }} [options]
   */
  static wireSidebarButton({ onToast = null, onSaveDraft = null } = {}) {
    const btn = document.getElementById('btn-clipboard-address');
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
          // Exactly 1 address -> 1-Click instant apply
          this.applyCandidate(candidates[0], { onToast, onSaveDraft });
          return;
        }

        // Multiple addresses detected -> Present clean selection popover (no "Murks"!)
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
              } catch (e) {
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
          } catch (e) {
            popover.classList.add('active');
          }
        } else {
          // Fallback: Apply top-ranked candidate
          this.applyCandidate(candidates[0], { onToast, onSaveDraft });
        }
      } catch (err) {
        console.warn('Clipboard read error:', err);
        if (onToast) onToast('⚠️ Zugriff auf die Zwischenablage verweigert oder blockiert.', 'error');
      }
    });
  }
}

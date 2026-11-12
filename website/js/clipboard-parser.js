// @ts-check
// @adr [[ADR-OFFLINE-ADDRESS-INTELLIGENCE]] {ClipboardAddressParser}
// @adr [[ADR-JS]]
// @guide [[din-5008-css-architektur]]

/**
 * @file clipboard-parser.js — Zerlegt unstrukturierte Zwischenablage-Texte
 * (Impressum, Google-Maps-Copy, CSV) in Anschrift-Kandidaten und bietet die
 * Auswahl-Vorschau in der Seitenleiste. Aus `address.js` ausgelagert
 * (2026-11-08): reine String-/Regex-Logik, unabhaengig von den Adressbestaenden.
 */

import { bindListSelection, feld } from './address.js';
import { AddressData, AddressIntelligence, normalizeText } from './address-data.js';
import { Constants, Events, eventBus, hidePopoverSafe, notify, showPopoverSafe } from './core.js';

import { Field } from './field.js';

/**
 * Berechnet die Levenshtein-Distanz zwischen zwei normalisierten Strings.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    const charA = a[i - 1];
    for (let j = 1; j <= n; j++) {
      const cost = charA === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,       // deletion
        curr[j - 1] + 1,   // insertion
        prev[j - 1] + cost // substitution
      );
    }
    const temp = prev;
    prev = curr;
    curr = temp;
  }
  return prev[n];
}

/* =========================================================================================
 * 4. CLIPBOARD ADDRESS PARSER
 * ========================================================================================= */

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
 * @property {boolean} [verified]
 * @property {boolean} [ortCorrected]
 * @property {boolean} [ortMismatch]
 * @property {string} [canonicalOrt]
 * @property {string} [state]
 * @property {string} [district]
 */

/**
 * ClipboardAddressParser: 95%-KISS Adressparser für deutsche Firmen- und Personenanschriften.
 * Folgt dem Kernmuster: PLZ-Zeile als Anker, Zeile davor als Straße, Zeilen davor als Empfänger.
 * Bietet bei Mehrdeutigkeit ein sauberes Popover zur Nutzer-Auswahl statt überfrachteter Heuristiken.
 */
export class ClipboardAddressParser {
  /** Typische deutsche Rechtsformen und Organisationen (ES2024 /v flag, case-insensitive) */
  static CORP_REGEX = /(?<!\p{L})(?:gmbh\s*&\s*co\.?\s*kg|kgaa|corp(?:oration)?|inc(?:orporated)?|ltd|limited|llc|plc|gmbh|ag|se|kg|ohg|gbr|universit[äa]t|hochschule|verband|stiftung|beh[öo]rde|finanzamt|amtsgericht|landgericht|institut|verlag|kanzlei|rechtsanw[äa]lte|praxis|apotheke|b[üu]ro|agentur|studio|klinik(?:en|um)?|hotel|restaurant|[\p{L}\-]*bank|sparkasse|verein|e\.\s*v\.|e\.\s*k\.|e\.\s*g\.|haftungsbeschr[äa]nkt)(?!\p{L})/iv;

  /** Unternehmergesellschaft (UG) & Genossenschaft (eG) case-sensitive (ohne /i), um Kollisionen mit Geschossen ("ug", "EG") zu verhindern */
  static CORP_UG_REGEX = /(?<!\p{L})(?:UG|eG)(?!\p{L})/v;

  /**
   * Prüft, ob ein Text eine Firmenbezeichnung oder Rechtsform enthält.
   * Prüft sowohl bekannte Rechtsformen als auch den indizierten Firmenbestand via AddressData.
   * @param {string} text
   * @returns {boolean}
   */
  static isCorporate(text) {
    if (!text) return false;
    return (
      ClipboardAddressParser.CORP_REGEX.test(text) ||
      ClipboardAddressParser.CORP_UG_REGEX.test(text) ||
      Boolean(AddressData.findFirma(text))
    );
  }

  /** Anreden und Empfänger-Prefixe (ES2024 /v flag) */
  static PERSON_PREFIX_REGEX = /^(?:herrn?|frau|dr\.?|prof\.?|z\.?\s*hd\.?|zu\s*h[äa]nden)(?!\p{L})/iv;

  /**
   * Straßensuffixe für Komposita (Hauptstraße, Musterweg, Eichenpfad, Schillerplatz, Schlossberg, Campus).
   * Nur nach hinten wortbegrenzt, damit vorangestellte Buchstaben (Haupt-) erlaubt sind.
   */
  static STREET_SUFFIX = /(?:str(?:aße|asse|\.)?|weg|gasse|allee|platz|damm|ring|ufer|zeile|chaussee|pfad|steig|grund|graben|rain|stiege|wall|bruch|promenade|berg|campus)(?!\p{L})/iv;

  /**
   * Eigenständige Straßenwörter (Am Markt, Zum Tor, Im Park, Kirchhof).
   * Beidseitig wortbegrenzt, um Falschtreffer in normalen Wörtern auszuschließen.
   */
  static STREET_WORD = /(?<!\p{L})(?:markt|park|tor|h[öo]fe?|speersort|spitze|bellevue|anger|feld|kamp|garten|berg)(?!\p{L})/iv;

  /** Straßen-Präpositionen (Am, An der, Im, Auf dem, Zum, Zur, etc.) */
  static STREET_PREPOSITION = /^(?:am|an\s+der|an\s+den|im|in\s+der|in\s+den|auf\s+dem|auf\s+der|zum|zur|unter\s+den|hinter\s+dem|bei\s+der|vor\s+dem)\s+/iv;

  /** Echte Hausnummer am Zeilenende (1-3 Ziffern, z. B. " 5", " 12a", " 10-12", " 3 EG", " 5, UG") */
  static HOUSE_NUMBER_END = /(?:^|\s)\d{1,3}\s*[\p{L}]?(?:\s*[\-–\/]\s*\d{1,3}\s*[\p{L}]?)?(?:\s*[,\/]?\s*(?:EG|OG|UG|DG|\d+\.?\s*(?:OG|Stock|Etage|Stockwerk)|HH|VH|WHG|App\.?\s*\d+))?\s*$/iv;

  /**
   * Geschoss- und Gebäudeteil-Zusätze (EG, OG, UG, DG etc.) — verlangt Trennzeichen oder Ziffer davor.
   * Architektonischer Trade-off: Durch das Abtrennen vor isCorporate() wird "Musterstr. 5 UG" nicht als
   * Unternehmergesellschaft fehlklassifiziert. Im Parser ist dies sicher, da isStreetLine() ausschließlich
   * auf Zeilen unmittelbar über dem PLZ-Anker (Zeile i-1 / i-2) angewendet wird.
   */
  static FLOOR_SUFFIX = /(?:[\s,\/]+|(?<=\d))(?:EG|OG|UG|DG|\d+\.?\s*(?:OG|Stock|Etage|Stockwerk)|HH|VH|Seitenflügel|Vorderhaus|Hinterhaus|App\.?\s*\d+|Whg\.?\s*\d+)\s*$/iv;

  /** Zeilen-Marker für nicht-adressrelevante Metadaten (Telefon, Mobil, Web, Bank, Register etc.) */
  static METADATA_LINE_REGEX = /^(?:(?:tel|telefon|mobil|mobilfunk|handy|fon|phone|fax|telefax)(?!\p{L})\s*[:.+\(\d\/]|(?:e-?mail|email)\s*[:.\-@]|www\.|https?:\/\/|(?:amtsgericht|landgericht)\s*[:\s].*\bhr[ab]\b|handelsregister\s*[:\s]|hr[ab]\b\s*[:\s]*\d+|ust-?id(?:nr)?|steuernummer|st\.-?nr|iban\s*:?\s*[a-z]{2}\d{2}|bic\s*:?\s*[a-z0-9]{8,11}(?!\p{L})|bankverbindung(?!\p{L})\s*[:\s]|(?:geschäftsführer|geschäftsführung|vorstand|aufsichtsrat|vorsitzender|vertreten durch)\s*:|ihr zeichen|unsere zeichen|datum:)/iv;

  /** Abschnittsüberschriften, die nicht als Empfängername interpretiert werden dürfen */
  static SECTION_LABEL_REGEX = /^(?:hauptsitz|niederlassung|standort|filiale|zentrale|werk|postadresse|postanschrift|hausanschrift|anschrift|adresse|impressum|kontakt)[:\s]*$/iv;

  /** PLZ + Ortsname Erkennung (ES2024 /v flag mit Unicode-Buchstabenklassen) */
  static PLZ_ORT_REGEX = /(?<!\d)(\d{5})\s+([\p{Lu}\p{Lt}][\p{L}\s\-\/.]+?)(?=\s*(?:[,;\(]|$|\b(?:tel|fax|e-mail)\b))/v;

  /**
   * Prüft, ob eine Textzeile als Straßenzeile oder Postfach in Frage kommt.
   * Schließt Firmen- und Rechtsformzeilen (isCorporate) strikt aus.
   * @param {string} rawLine
   * @returns {boolean}
   */
  static isStreetLine(rawLine) {
    if (!rawLine) return false;

    // Geschossangaben (EG, UG, 1. OG) vor dem Check abtrennen, damit z. B. "3 EG" nicht als e.G. fehlschlägt
    const line = rawLine.trim().replace(ClipboardAddressParser.FLOOR_SUFFIX, '').trim();

    if (ClipboardAddressParser.isCorporate(line)) return false;
    if (/^postfach\s+\d+/iv.test(line)) return true;

    const hasHouseNumber = ClipboardAddressParser.HOUSE_NUMBER_END.test(rawLine);
    const hasStreetKeyword = ClipboardAddressParser.STREET_SUFFIX.test(line) || ClipboardAddressParser.STREET_WORD.test(line);
    const hasPreposition = ClipboardAddressParser.STREET_PREPOSITION.test(line);

    // 1. Mit Hausnummer: Straßensuffix/Wort ODER Straßen-Präposition
    if (hasHouseNumber && (hasStreetKeyword || hasPreposition)) return true;

    // 2. Ohne Hausnummer: Nur eindeutige Straßenkomposita (Hauptstraße, Karl-Marx-Straße, Dr.-Külz-Ring, Hohenzollernring)
    // Verhindert, dass Nachnamen wie "Hans Hering" (endet auf -ring) oder "Petra Wall" als Straße gewertet werden.
    // Bei "-ring" ohne Hausnummer: Erfordert Bindestrich (Dr.-Külz-Ring) oder mindestens 7 Zeichen vor dem Suffix.
    if (!hasHouseNumber) {
      const isUnambiguousStreet = /(?:^|\s)(?:[\p{L}\-.]*(?:stra(?:ß|ss)e|str\.|gasse|allee|chaussee|weg|[\-]ring)|\p{L}{7,}ring)$/iv.test(line);
      return isUnambiguousStreet || (hasPreposition && ClipboardAddressParser.STREET_WORD.test(line));
    }

    return false;
  }

  /**
   * Extrahiert PLZ und Ort aus einer Textzeile und gleicht sie gegen die AddressData-Fassade ab.
   * Verstärker-Prinzip: Unbekannte oder ausländische PLZs (z. B. "75001 Paris") werden nicht verworfen,
   * sondern mit verified: false beibehalten. Bekannte deutsche PLZs werden angereichert,
   * auf Tippfehler korrigiert und auf Mismatches geprüft.
   * @param {string} line
   * @returns {{
   *   plz: string,
   *   ort: string,
   *   rawOrt: string,
   *   verified: boolean,
   *   ortCorrected: boolean,
   *   ortMismatch: boolean,
   *   canonicalOrt?: string,
   *   state?: string,
   *   district?: string
   * } | null}
   */
  static extractPlzOrt(line) {
    if (!line || typeof line !== 'string') return null;
    const match = line.match(ClipboardAddressParser.PLZ_ORT_REGEX);
    if (!match) return null;

    const plz = match[1];
    const rawOrt = match[2].trim().split(/[,;(]|\b(Tel|Fax|E-Mail|Telefon)\b/i)[0].trim();
    if (!rawOrt) return null;

    const resolved = AddressData.lookup(plz);
    if (!resolved) {
      return {
        plz,
        ort: rawOrt,
        rawOrt,
        verified: false,
        ortCorrected: false,
        ortMismatch: false
      };
    }

    const normRaw = normalizeText(rawOrt);
    const normCanonical = normalizeText(resolved.city);

    if (normRaw === normCanonical) {
      const isCaseOrUmlautDiff = rawOrt !== resolved.city;
      return {
        plz,
        ort: resolved.city,
        rawOrt,
        verified: true,
        ortCorrected: isCaseOrUmlautDiff,
        ortMismatch: false,
        canonicalOrt: resolved.city,
        state: resolved.state,
        district: resolved.district
      };
    }

    const dist = levenshtein(normRaw, normCanonical);
    const maxDist = Math.max(1, Math.min(3, Math.floor(normCanonical.length / 3)));

    if (dist <= maxDist) {
      // Tippfehler (z. B. "Bon" -> "Bonn")
      return {
        plz,
        ort: resolved.city,
        rawOrt,
        verified: true,
        ortCorrected: true,
        ortMismatch: false,
        canonicalOrt: resolved.city,
        state: resolved.state,
        district: resolved.district
      };
    }

    // Mismatch (z. B. PLZ 53111 mit Ort Köln)
    return {
      plz,
      ort: rawOrt,
      rawOrt,
      verified: true,
      ortCorrected: false,
      ortMismatch: true,
      canonicalOrt: resolved.city,
      state: resolved.state,
      district: resolved.district
    };
  }

  /**
   * Extrahiert Adress-Kandidaten aus unstrukturiertem Text.
   * @param {string} text
   * @returns {AddressCandidate[]}
   */
  static parse(text) {
    if (!text || typeof text !== 'string') return [];

    let lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    // Stufe 1: Unfolding für einzeilige, kommagetrennte Adressen (z. B. Google Maps / CSV)
    if (lines.length === 1 && lines[0].includes(',')) {
      lines = lines[0].split(',').map(l => l.trim()).filter(Boolean);
    }

    /** @type {AddressCandidate[]} */
    const candidates = [];

    // PASS 1: Mehrzeilige Adressblöcke (PLZ-Zeile als Anker)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const plzOrt = ClipboardAddressParser.extractPlzOrt(line);
      if (!plzOrt) continue;

      const { plz, ort } = plzOrt;
      if (i === 0) continue;

      // Kontextregel: Eine Zeile mit Hausnummer direkt über dem PLZ-Anker ist eine
      // Straße, auch wenn kein Suffix sie auszeichnet ("Technologiepark 1",
      // "Gewerbegebiet Süd" als eingeschobene Zeile dazwischen). Rechtsformen
      // bleiben ausgeschlossen, sonst würde "Park Hotel GmbH" zur Straße.
      /** @param {number} idx @returns {boolean} */
      const alsStrasse = (idx) => {
        const kandidat = lines[idx];
        if (ClipboardAddressParser.isStreetLine(kandidat)) return true;
        return ClipboardAddressParser.HOUSE_NUMBER_END.test(kandidat)
          && !ClipboardAddressParser.isCorporate(kandidat);
      };

      let streetLineIndex = i - 1;
      let prevLine = lines[streetLineIndex].trim();
      let isStreet = alsStrasse(streetLineIndex);

      if (!isStreet && i >= 2) {
        if (alsStrasse(i - 2)) {
          streetLineIndex = i - 2;
          prevLine = lines[i - 2].trim();
          isStreet = true;
        }
      }

      if (!isStreet) continue;

      const street = prevLine.replace(/^(?:postanschrift|hausanschrift|anschrift|adresse|postadresse)\s*:\s*/iv, '').replace(/,+$/, '').trim();

      let candFirma = '';
      let candName = '';
      let candZusatz = '';

      // Maximal 3 Zeilen vor der Straße betrachten
      /** @type {string[]} */
      const preLines = [];
      for (let j = streetLineIndex - 1; j >= Math.max(0, streetLineIndex - 4); j--) {
        const l = lines[j].trim();
        if (l.length > 90 || l.includes('|')) break;
        if (ClipboardAddressParser.METADATA_LINE_REGEX.test(l)) continue;
        if (ClipboardAddressParser.PLZ_ORT_REGEX.test(l) || /^\d{5}\b/.test(l)) break; // Stopp bei vorangehender Adresse
        if (ClipboardAddressParser.SECTION_LABEL_REGEX.test(l)) continue;

        const cleanL = l
          .replace(/^(?:anbieterin|anbieter|unsere daten|kontakt|impressum|herausgeber|geschäftsführung|vertreten durch)\s*:\s*/iv, '')
          .replace(/^(?:geschäftsführer(?:in)?|vorstand|vorsitzende[rn]?)\s+/iv, '')
          .trim();
        if (cleanL && !cleanL.endsWith(':')) preLines.unshift(cleanL);
      }

      if (preLines.length === 1) {
        const single = preLines[0];
        if (ClipboardAddressParser.PERSON_PREFIX_REGEX.test(single)) {
          candName = single;
        } else if (ClipboardAddressParser.isCorporate(single)) {
          candFirma = single;
        } else {
          candName = single;
        }
      } else if (preLines.length === 2) {
        const l0 = preLines[0];
        const l1 = preLines[1];

        const isCO = /^(?:c\s*\/\s*o|bei)\s+/iv.test(l1);

        if (isCO) {
          if (ClipboardAddressParser.isCorporate(l0)) {
            candFirma = l0;
          } else {
            candName = l0;
          }
          candZusatz = l1;
        } else if (ClipboardAddressParser.isCorporate(l0) || ClipboardAddressParser.PERSON_PREFIX_REGEX.test(l1)) {
          candFirma = l0;
          if (ClipboardAddressParser.PERSON_PREFIX_REGEX.test(l1) || !/\d/.test(l1)) {
            candName = l1.replace(/^(?:z\.\s*hd\.|zu\s*händen)\s*:?\s*/iv, '').trim();
          } else {
            candZusatz = l1;
          }
        } else if (ClipboardAddressParser.isCorporate(l1)) {
          candFirma = l1;
          candName = l0;
        } else {
          candFirma = l0;
          candName = l1.replace(/^(?:z\.\s*hd\.|zu\s*händen)\s*:?\s*/iv, '').trim();
        }
      } else if (preLines.length >= 3) {
        candFirma = preLines[preLines.length - 3];
        candZusatz = preLines[preLines.length - 2];
        candName = preLines[preLines.length - 1].replace(/^(?:z\.\s*hd\.|zu\s*händen)\s*:?\s*/iv, '').trim();
      }

      candidates.push({
        firma: candFirma,
        name: candName,
        zusatz: candZusatz,
        strasse: street,
        plz,
        ort,
        verified: plzOrt.verified,
        ortCorrected: plzOrt.ortCorrected,
        ortMismatch: plzOrt.ortMismatch,
        canonicalOrt: plzOrt.canonicalOrt,
        state: plzOrt.state,
        district: plzOrt.district,
        source_type: 'multiline'
      });
    }

    // PASS 2: Einzeilige, kommagetrennte Adressen
    for (const line of lines) {
      if (!line.includes(',')) continue;
      const parts = line.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length < 3) continue;

      const lastPart = parts[parts.length - 1];
      const plzOrt = ClipboardAddressParser.extractPlzOrt(lastPart);
      if (!plzOrt) continue;

      const streetPart = parts[parts.length - 2];
      if (!ClipboardAddressParser.isStreetLine(streetPart)) continue;

      const nameParts = parts.slice(0, parts.length - 2);
      const first = nameParts[0] || '';
      const second = nameParts[1] || '';

      let candFirma = '';
      let candName = '';
      let candZusatz = '';

      // Ein einzelnes Wort ohne Personen-Prefix ist in einer Einzeiler-Adresse
      // fast immer ein Firmenname ("Acme"), kein Vor- oder Nachname.
      const istEinzelwort = first.length > 0 && !/\s/.test(first);
      if (ClipboardAddressParser.isCorporate(first) || istEinzelwort) {
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
        plz: plzOrt.plz,
        ort: plzOrt.ort,
        verified: plzOrt.verified,
        ortCorrected: plzOrt.ortCorrected,
        ortMismatch: plzOrt.ortMismatch,
        canonicalOrt: plzOrt.canonicalOrt,
        state: plzOrt.state,
        district: plzOrt.district,
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
   */
  static applyCandidate(candidate) {
    const empfFirmaEl = feld('empfaenger-firma');
    const empfNameEl = feld('empfaenger-name');
    const empfStrasseEl = feld('empfaenger-strasse');
    const empfOrtEl = feld('empfaenger-ort');

    // 1. Ziel-Sperre in AddressIntelligence setzen
    AddressIntelligence.targetLock = { plz: candidate.plz, city: candidate.ort };

    // 2. Felder befüllen und Events triggern
    if (empfFirmaEl) {
      const firmaText = candidate.zusatz ? `${candidate.firma || ''}\n${candidate.zusatz}`.trim() : (candidate.firma || '');
      Field.setValue(empfFirmaEl, firmaText);
      empfFirmaEl.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (empfNameEl) {
      Field.setValue(empfNameEl, candidate.name || '');
      empfNameEl.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (empfStrasseEl) {
      Field.setValue(empfStrasseEl, candidate.strasse);
      empfStrasseEl.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (empfOrtEl) {
      Field.setValue(empfOrtEl, `${candidate.plz} ${candidate.ort}`);
      empfOrtEl.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // 3. Autocomplete-Dropdowns schließen
    hidePopoverSafe(feld('plz-suggestions-popover'));
    hidePopoverSafe(feld('anschrift-vorschlaege'));

    eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });

    // UX-4: Visuelles Feedback beim Einfügen — Web Animations API statt
    // CSS-Klasse + setTimeout. Die Animation raeumt sich selbst ab.
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (const f of [empfFirmaEl, empfNameEl, empfStrasseEl, empfOrtEl]) {
        f?.animate(
          [{ background: 'light-dark(oklch(0.92 0.08 145), oklch(0.75 0.10 145))' }, { background: 'transparent' }],
          { duration: 500, easing: 'ease-out' }
        );
      }
    }

    const label = candidate.firma || candidate.name || candidate.strasse;
    if (candidate.ortMismatch && candidate.canonicalOrt) {
      notify(`⚠️ Anschrift übernommen: PLZ ${candidate.plz} gehört laut Verzeichnis zu ${candidate.canonicalOrt}.`, 'warning');
    } else {
      const toastMsg = Constants.TOASTS.CLIPBOARD.APPLIED(label, candidate.ort);
      notify(toastMsg, 'success');
    }
  }

  /**
   * Verdrahtet den Sidebar-Button und das Auswahllisten-Popover.
   */
  static wireSidebarButton() {
    const btn = feld('btn-zwischenablage-anschrift');
    const popover = feld('clipboard-candidates-popover');
    if (!btn) return;

    btn.addEventListener('click', async () => {
      try {
        if (!navigator.clipboard?.readText) {
          notify(Constants.TOASTS.CLIPBOARD.UNSUPPORTED, 'error');
          return;
        }

        const text = await navigator.clipboard.readText();
        if (!text?.trim()) {
          notify(Constants.TOASTS.CLIPBOARD.EMPTY, 'warning');
          return;
        }

        const candidates = ClipboardAddressParser.parse(text);

        if (candidates.length === 0) {
          notify(Constants.TOASTS.CLIPBOARD.NO_ADDRESS, 'warning');
          return;
        }

        if (candidates.length === 1) {
          ClipboardAddressParser.applyCandidate(candidates[0]);
          return;
        }

        // Mehrere Adressen gefunden: Popover zur Auswahl öffnen
        if (popover) {
          popover.replaceChildren();

          const header = document.createElement('li');
          header.className = 'autocomplete-header';
          Field.setValue(header, `📋 ${candidates.length} Adressen gefunden:`);
          popover.appendChild(header);

          /** @param {any} cand */
          const selectCandidate = (cand) => {
            ClipboardAddressParser.applyCandidate(cand);
            hidePopoverSafe(popover);
          };

          candidates.forEach((cand, idx) => {
            const item = document.createElement('li');
            item.className = 'autocomplete-item';
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');

            const compSpan = document.createElement('strong');
            const mainLabel = cand.firma || cand.name || 'Empfänger';
            Field.setValue(compSpan, `${idx + 1}. ${mainLabel}`);

            const addrSpan = document.createElement('span');
            addrSpan.className = 'autocomplete-sub';
            Field.setValue(addrSpan, ` • ${cand.strasse}, ${cand.plz} ${cand.ort}`);

            item.appendChild(compSpan);
            item.appendChild(addrSpan);

            if (!cand.verified) {
              const unverifiedBadge = document.createElement('span');
              unverifiedBadge.className = 'unverified-badge';
              Field.setValue(unverifiedBadge, ' (nicht verifiziert)');
              item.appendChild(unverifiedBadge);
            } else if (cand.ortMismatch && cand.canonicalOrt) {
              const mismatchBadge = document.createElement('span');
              mismatchBadge.className = 'mismatch-badge';
              Field.setValue(mismatchBadge, ` ⚠️ PLZ gehört zu ${cand.canonicalOrt}`);
              item.appendChild(mismatchBadge);
            }

            item.dataset.index = String(idx);
            popover.appendChild(item);
          });

          bindListSelection(popover, candidates, selectCandidate);

          showPopoverSafe(popover);
        } else {
          notify(Constants.TOASTS.CLIPBOARD.MULTIPLE(candidates.length), 'warning');
        }
      } catch (err) {
        console.warn('[Clipboard] Lesefehler:', err);
        notify(Constants.TOASTS.CLIPBOARD.PERMISSION_DENIED, 'error');
      }
    });
  }
}

// @ts-check
// @adr [[ADR-JS]]

/**
 * @file webmcp.js — Agenten-Werkzeuge: WebMCP (W3C-Entwurf) und der
 * transportfreie Vertrag `window.dinBriefAgent`.
 *
 * Warum es das gibt: `api.js` kann den Brief schreiben, aber ein Agent muss
 * erst wissen, dass es diese Fähigkeiten gibt. WebMCP lässt die Seite ihre
 * Werkzeuge selbst deklarieren (Name, Beschreibung, JSON-Schema) — der Agent
 * ruft sie auf, statt das DOM zu erraten. Fehlt `document.modelContext`
 * (Chrome ohne Origin-Trial/Flag, Firefox, Safari), bleibt genau eine Wirkung
 * übrig: `window.dinBriefAgent` als derselbe Vertrag, den die CLI-Bridge
 * (`tools/mcp-live.mjs`) über den lokalen Kanal aufruft.
 *
 * Invarianten:
 * 1. Kein Netz, keine Abhängigkeit, kein DOM-Wissen — jede Ausführung läuft
 *    über `window.dinApi` (API_FELDER/API_SCHALTER aus api.js).
 * 2. Feature-Detect statt Polyfill: ohne `modelContext` wird nichts
 *    registriert, nichts geschrieben, nichts nachgeladen.
 * 3. Eine Quelle für beide Transporte: Werkzeugliste und -logik leben hier,
 *    WebMCP und MCP-Server sind nur Hüllen.
 */

/** @typedef {Record<string, unknown>} WerkzeugArgumente */

/**
 * @typedef {{
 *   name: string,
 *   description: string,
 *   inputSchema: Record<string, unknown>,
 *   nurLesen: boolean,
 *   ausfuehren: (argumente: WerkzeugArgumente) => Record<string, unknown> | Promise<Record<string, unknown>>
 * }} Werkzeug
 */

/** @returns {any} */
function briefApi() {
  return /** @type {any} */ (window).dinApi;
}

/** @returns {Record<string, unknown>} */
function ohneApi() {
  return { ok: false, fehler: 'dinApi fehlt — die Seite ist noch nicht fertig geladen.' };
}

/**
 * @param {unknown} wert
 * @returns {wert is Record<string, unknown>}
 */
function istObjekt(wert) {
  return typeof wert === 'object' && wert !== null && !Array.isArray(wert);
}

/**
 * @param {WerkzeugArgumente} argumente
 * @param {string} schluessel
 * @returns {string}
 */
function text(argumente, schluessel) {
  const wert = argumente[schluessel];
  return typeof wert === 'string' ? wert.trim() : '';
}

/**
 * Schreibt ein Feld, meldet Erfolg oder Fehler in die Sammelliste.
 * @param {any} ergebnis
 * @param {string} bereich
 * @param {string[]} gesetzt
 * @param {string[]} fehler
 */
function notiere(ergebnis, bereich, gesetzt, fehler) {
  if (ergebnis?.ok) {
    gesetzt.push(bereich);
    return;
  }
  fehler.push(`${bereich}: ${ergebnis?.fehler ?? 'unbekannter Fehler'}`);
}

/* --------------------------------------------------------------- Ausführen */

/**
 * Der Ein-Klick-Brief: Adressen, Datum, Anrede, Text in einem Aufruf.
 * @param {WerkzeugArgumente} argumente
 * @returns {Record<string, unknown>}
 */
function briefSchreiben(argumente) {
  const api = briefApi();
  if (!api) return ohneApi();

  /** @type {string[]} */
  const gesetzt = [];
  /** @type {string[]} */
  const fehler = [];

  const empfaenger = argumente.empfaenger;
  if (istObjekt(empfaenger)) {
    notiere(api.adresse('empfaenger', empfaenger), 'empfaenger', gesetzt, fehler);
  }

  const absender = argumente.absender;
  if (istObjekt(absender)) {
    notiere(api.adresse('absender', absender), 'absender', gesetzt, fehler);
    /** @type {[string, string][]} */
    const kontakt = [
      ['tel', 'absender-tel'],
      ['mail', 'absender-mail']
    ];
    for (const [schluessel, feld] of kontakt) {
      const wert = absender[schluessel];
      if (typeof wert === 'string' && wert.trim()) {
        notiere(api.setzen(feld, wert.trim()), feld, gesetzt, fehler);
      }
    }
  }

  const datum = text(argumente, 'datum');
  if (datum) {
    const formatiert = api.datum(datum);
    if (formatiert?.ok) gesetzt.push('datum');
    // Schon eine Langform? Dann schreibt api.datum nicht (ok:false) und der
    // Wert geht unverändert ins Feld, statt still zu verschwinden.
    else notiere(api.setzen('datum', datum), 'datum', gesetzt, fehler);
  }

  const anredeName = text(argumente, 'anrede_name');
  if (anredeName) {
    const tonalitaet = text(argumente, 'tonalitaet') || 'formal';
    const anrede = api.anrede(anredeName, text(argumente, 'anrede_firma'), tonalitaet);
    notiere(anrede, 'anrede', gesetzt, fehler);
  }

  /** @type {[string, string][]} */
  const einfacheFelder = [
    ['betreff', 'betreff'],
    ['anlagen', 'anlagen-angabe'],
    ['unterschrift', 'unterschrift'],
    // Explizite Strings gewinnen gegen die abgeleitete Anrede/Grußformel.
    ['anrede', 'anrede'],
    ['grussformel', 'grussformel'],
    ['vermerke', 'vermerke'],
    ['text', 'text']
  ];
  for (const [schluessel, feld] of einfacheFelder) {
    const wert = argumente[schluessel];
    // Text wird nicht getrimmt: Absätze und Leerzeilen sind Inhalt.
    if (typeof wert !== 'string' || !wert.trim()) continue;
    notiere(api.setzen(feld, wert), feld, gesetzt, fehler);
  }

  return {
    ok: fehler.length === 0,
    gesetzt,
    fehler,
    hinweis: 'Der Brief steht im Editor und wird vom Autosave lokal gespeichert.'
  };
}

/* --------------------------------------------------------------- Prüfungen */

/** Stilvertrag je Tonalität: was der Text einhalten muss. */
const STIL_VERTRAG = Object.freeze({
  formal: {
    register: 'Sie-Form, sachlich, keine Kurzformen, keine Floskeln',
    untersagt: ['du', 'dein', 'dich', 'dir', 'euch', 'hallo', 'hi', 'hey']
  },
  polite: {
    register: 'Sie-Form, freundlich und verbindlich, keine Floskeln',
    untersagt: ['du', 'dein', 'dich', 'dir', 'euch', 'hi', 'hey']
  },
  casual: {
    register: 'Du-Form, locker, kurze Sätze',
    untersagt: ['sehr geehrte', 'mit freundlichen grüßen', 'hochachtungsvoll']
  }
});

/**
 * IBAN-Prüfsumme (ISO 7064 MOD 97-10).
 * @param {string} iban
 * @returns {boolean}
 */
function ibanGueltig(iban) {
  const s = String(iban || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (s.length < 15 || s.length > 34) return false;
  const umgestellt = s.slice(4) + s.slice(0, 4);
  let rest = 0;
  for (const zeichen of umgestellt) {
    const wert = zeichen >= 'A' ? String(zeichen.charCodeAt(0) - 55) : zeichen;
    for (const ziffer of wert) rest = (rest * 10 + Number(ziffer)) % 97;
  }
  return rest === 1;
}

/** § 35a-Felder: Werkzeugname → Feld-ID im Brief. */
const FUSS_FELDER = Object.freeze({
  firma: 'fuss-firma',
  sitz: 'fuss-sitz',
  gericht: 'fuss-gericht',
  hrb: 'fuss-hrb',
  vorstand: 'fuss-vorstand',
  gf: 'fuss-gf',
  stnr: 'fuss-stnr',
  ustid: 'fuss-ustid',
  bank: 'fuss-bank',
  iban: 'fuss-iban',
  bic: 'fuss-bic',
  anschrift: 'fuss-anschrift'
});

/**
 * Welche Tonalität passt zur aktuellen Grußformel? Dient der Register-Prüfung,
 * wenn niemand die Tonalität explizit gesetzt hat.
 * @param {string} grussformel
 * @returns {'formal' | 'polite' | 'casual'}
 */
function tonAusGrussformel(grussformel) {
  const text = String(grussformel || '').toLowerCase();
  if (text.includes('beste grüße') || text.includes('liebe grüße') || text.includes('viele grüße')) return 'casual';
  if (text.includes('mit freundlichen grüßen') || text.includes('hochachtungsvoll')) return 'formal';
  return 'polite';
}

/** Bedeutung je Feld: was hineingehört. Der Agent soll nicht raten müssen. */
const FELD_ZWECK = /** @type {Record<string, string>} */ (Object.freeze({
  'empfaenger-firma': 'Firma oder Institution des Empfängers — nur wenn kein Name gesetzt ist',
  'empfaenger-name': 'Person, ggf. mit Titel und Anrede (z. B. „Frau Dr. Meier")',
  'empfaenger-strasse': 'Straße und Hausnummer der Empfängeranschrift',
  'empfaenger-ort': 'PLZ und Ort in einer Zeile, z. B. „53840 Troisdorf"',
  'absender-name': 'Vor- und Nachname des Absenders',
  'absender-strasse': 'Straße und Hausnummer des Absenders',
  'absender-ort': 'PLZ und Ort des Absenders',
  'absender-tel': 'Telefon mit Vorwahl, erscheint in der Fußzeile',
  'absender-mail': 'E-Mail-Adresse, erscheint in der Fußzeile',
  datum: 'Briefdatum in deutscher Langform („23. November 2026")',
  vermerke: 'Postvermerk über der Anschrift, z. B. „Einschreiben" oder „Vertraulich"',
  betreff: 'Betreffzeile ohne das Wort „Betreff"',
  anrede: 'Anredezeile inklusive Komma am Ende',
  text: 'Nur der Fließtext — Anrede und Grußformel gehören in ihre eigenen Felder',
  grussformel: 'Grußformel ohne Komma („Mit freundlichen Grüßen")',
  unterschrift: 'Name unter der Grußformel',
  'anlagen-angabe': 'Anlagenvermerk, z. B. „Anlage 1: Vertrag"',
  'fuss-firma': 'Firmenname im Fuß (Pflicht bei Geschäftsbriefen)',
  'fuss-sitz': 'Sitz der Gesellschaft',
  'fuss-gericht': 'Registergericht',
  'fuss-hrb': 'Handelsregisternummer',
  'fuss-vorstand': 'Vorstand (bei AG)',
  'fuss-gf': 'Geschäftsführung (bei GmbH)',
  'fuss-stnr': 'Steuernummer',
  'fuss-ustid': 'USt-IdNr. nach § 27a UStG',
  'fuss-bank': 'Bankverbindung',
  'fuss-iban': 'IBAN, wird beim Setzen formatiert',
  'fuss-bic': 'BIC, 8 oder 11 Zeichen',
  'fuss-anschrift': 'Anschrift im Fuß, falls sie nicht oben steht'
}));

/** Pflichtangaben für einen versandfertigen Brief. */
const FELD_PFLICHT = /** @type {Record<string, string>} */ (Object.freeze({
  'empfaenger-firma': 'bedingt (oder Name)',
  'empfaenger-name': 'bedingt (oder Firma)',
  'empfaenger-strasse': 'ja',
  'empfaenger-ort': 'ja',
  'absender-name': 'ja',
  'absender-strasse': 'ja',
  'absender-ort': 'ja',
  datum: 'ja',
  betreff: 'ja',
  anrede: 'ja',
  text: 'ja',
  grussformel: 'ja',
  unterschrift: 'ja'
}));

/** Beispielwerte für den Katalog. */
const FELD_BEISPIEL = /** @type {Record<string, string>} */ (Object.freeze({
  'empfaenger-firma': 'Muster GmbH',
  'empfaenger-name': 'Frau Dr. Meier',
  'empfaenger-strasse': 'Musterweg 5',
  'empfaenger-ort': '53840 Troisdorf',
  'absender-name': 'Max Mustermann',
  'absender-strasse': 'Beispielstraße 1',
  'absender-ort': '50667 Köln',
  'absender-tel': '0221 123456',
  'absender-mail': 'max@example.org',
  datum: '23. November 2026',
  vermerke: 'Einschreiben',
  betreff: 'Kündigung des Wartungsvertrags zum 31.12.2026',
  anrede: 'Sehr geehrte Frau Dr. Meier,',
  text: 'hiermit kündige ich den Wartungsvertrag fristgerecht zum 31.12.2026.',
  grussformel: 'Mit freundlichen Grüßen',
  unterschrift: 'Max Mustermann',
  'anlagen-angabe': 'Anlage 1: Vertrag',
  'fuss-iban': 'DE89 3704 0044 0532 0130 00',
  'fuss-bic': 'COBADEFFXXX'
}));

/**
 * Feldkatalog für `brief_hilfe`: Bedeutung plus die echten Grenzen aus dem DOM
 * (maxlength, Mehrzeiligkeit) — damit ein Agent nicht raten muss.
 * @param {string[]} ids
 * @returns {Record<string, unknown>[]}
 */
function feldKatalog(ids) {
  return ids.map((id) => {
    const el = document.getElementById(id);
    /** @type {HTMLInputElement | HTMLTextAreaElement | null} */
    const eingabe = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? el : null;
    /** @type {Record<string, unknown>} */
    const eintrag = {
      id,
      zweck: FELD_ZWECK[id] ?? el?.getAttribute('aria-label') ?? '',
      pflicht: FELD_PFLICHT[id] ?? 'nein',
      beispiel: FELD_BEISPIEL[id] ?? ''
    };
    if (eingabe && eingabe.maxLength > 0) eintrag.max = eingabe.maxLength;
    if (eingabe instanceof HTMLTextAreaElement || el?.hasAttribute('contenteditable')) {
      eintrag.mehrzeilig = true;
    }
    return eintrag;
  });
}

/* ----------------------------------------------------------- Werkzeugliste */

/**
 * Aktuelles Formular (A oder B) aus der Radiogruppe.
 * @returns {'form-a' | 'form-b'}
 */
function leseForm() {
  const gewaehlt = /** @type {HTMLInputElement | null} */ (
    document.querySelector('input[name="layout-form"]:checked')
  );
  return gewaehlt?.value === 'form-a' ? 'form-a' : 'form-b';
}

/**
 * Seiten-Näherung aus dem Bildschirm-Layout — dieselbe Rechnung wie der
 * Mehrseiten-Controller: N Bänder à `--seite + --luecke`. Zählt die Zeilen
 * jedes Textknotens über `Range.getClientRects()` und ordnet sie dem Band zu.
 * Ehrlich benannt: das ist der Bildschirm, nicht das PDF.
 * @returns {Record<string, unknown>}
 */
function seitenInfo() {
  const kern = document.getElementById('kern');
  const probe = document.getElementById('probe');
  if (!kern || !probe) return { ok: false, fehler: 'Briefkern (#kern) fehlt im Dokument' };

  const cs = getComputedStyle(document.documentElement);
  const seiteMm = Number.parseFloat(cs.getPropertyValue('--seite')) || 297;
  const lueckeMm = Number.parseFloat(cs.getPropertyValue('--luecke')) || 8;
  const mm = probe.getBoundingClientRect().height / 1000;
  const band = mm > 0 ? (seiteMm + lueckeMm) * mm : 0;
  const oben = kern.getBoundingClientRect().top;
  /* Seitenzahl selbst rechnen statt `body.dataset.seiten` lesen: der Wert
     kommt vom ResizeObserver und hängt einen Frame nach. Ein Aufruf direkt
     nach brief_schreiben würde sonst die alte Zahl sehen. */
  const hoeheMm = mm > 0 ? kern.getBoundingClientRect().height / mm : 0;
  const anzahl = band > 0 ? Math.max(1, Math.round((hoeheMm + lueckeMm) / (seiteMm + lueckeMm))) : 1;

  /** @type {{ seite: number, mitte: number, knoten?: Text, eigenerText?: string }[]} */
  const zeilen = [];
  const lauf = document.createTreeWalker(kern, NodeFilter.SHOW_TEXT);
  for (let knoten = lauf.nextNode(); knoten; knoten = lauf.nextNode()) {
    const inhalt = (knoten.textContent || '').trim();
    if (!inhalt) continue;
    const bereich = document.createRange();
    bereich.selectNodeContents(/** @type {Node} */ (knoten));
    for (const rect of bereich.getClientRects()) {
      if (rect.height < 1 || rect.width < 1) continue;
      const roh = band > 0 ? Math.floor((rect.top - oben) / band) + 1 : 1;
      zeilen.push({
        seite: Math.max(1, Math.min(anzahl, roh)),
        mitte: rect.top + rect.height / 2,
        knoten: /** @type {Text} */ (knoten)
      });
    }
  }
  /* Einzeilige Felder (Betreff, Anrede, Grußformel, Unterschrift, Datum,
     Fußzeile) sind <input>: ihr Wert steht nicht im DOM-Text, ist aber
     sichtbar. Ohne diesen Durchlauf zählte ein kurzer Brief „2 Zeilen". */
  for (const feld of kern.querySelectorAll('input, textarea')) {
    const wert = String(/** @type {HTMLInputElement} */ (feld).value || '').trim();
    if (!wert) continue;
    const rect = feld.getBoundingClientRect();
    if (rect.height < 1 || rect.width < 1) continue;
    const roh = band > 0 ? Math.floor((rect.top - oben) / band) + 1 : 1;
    zeilen.push({
      seite: Math.max(1, Math.min(anzahl, roh)),
      mitte: rect.top + rect.height / 2,
      eigenerText: wert.replace(/\s+/g, ' ').slice(0, 80)
    });
  }

  /**
   * Zeichen-Offset der Zeile, deren Mitte bei `y` liegt. Binärsuche über die
   * Zeichen-Mittellinien — nötig, weil ein Textknoten über Seitengrenzen läuft
   * und die Zeilen-Rechtecke leicht anders liegen als die Zeichen-Rechtecke.
   * @param {Text} knoten
   * @param {number} y
   * @returns {number}
   */
  function offsetFuerY(knoten, y) {
    const bereich = document.createRange();
    /** @param {number} offset */
    const mitteBei = (offset) => {
      bereich.setStart(knoten, offset);
      bereich.setEnd(knoten, Math.min(offset + 1, knoten.data.length));
      const rect = bereich.getBoundingClientRect();
      return rect.height > 0 ? rect.top + rect.height / 2 : Number.NEGATIVE_INFINITY;
    };
    let lo = 0;
    let hi = knoten.data.length;
    while (lo < hi) {
      const mitte = Math.floor((lo + hi) / 2);
      if (mitteBei(mitte) < y - 0.5) lo = mitte + 1;
      else hi = mitte;
    }
    return lo;
  }

  /**
   * @param {{ mitte: number, knoten?: Text, eigenerText?: string }} zeile
   * @returns {string}
   */
  function zeilenText(zeile) {
    if (zeile.eigenerText !== undefined) return zeile.eigenerText;
    if (!zeile.knoten) return '';
    const offset = offsetFuerY(zeile.knoten, zeile.mitte);
    return zeile.knoten.data.slice(offset, offset + 80).replace(/\s+/g, ' ').trim();
  }

  const proSeite = [];
  for (let i = 1; i <= anzahl; i += 1) {
    proSeite.push({ seite: i, zeilen: 0, beginntMit: '', endetMit: '' });
  }
  for (const zeile of zeilen) {
    const seite = proSeite[zeile.seite - 1];
    if (seite) seite.zeilen += 1;
  }
  for (const seite of proSeite) {
    const eigene = zeilen.filter((zeile) => zeile.seite === seite.seite);
    if (eigene.length === 0) continue;
    const erste = eigene.reduce((a, b) => (b.mitte < a.mitte ? b : a));
    const letzte = eigene.reduce((a, b) => (b.mitte > a.mitte ? b : a));
    seite.beginntMit = zeilenText(erste);
    seite.endetMit = zeilenText(letzte);
  }

  /** @type {string[]} */
  const warnungen = [];
  for (const seite of proSeite) {
    if (seite.seite > 1 && seite.zeilen > 0 && seite.zeilen <= 2) {
      warnungen.push(`Seite ${seite.seite} hat nur ${seite.zeilen} Zeile(n) — Umbruch prüfen.`);
    }
    if (seite.seite === anzahl && seite.zeilen === 0) {
      warnungen.push(`Seite ${anzahl} ist leer.`);
    }
  }

  return {
    ok: true,
    seiten: anzahl,
    form: leseForm(),
    gesamtZeilen: zeilen.length,
    proSeite,
    warnungen,
    hinweis:
      'Bildschirm-Näherung (Bänder aus --seite + --luecke). Der Umbruch im PDF kann abweichen — dafür braucht es die Druckvorschau.'
  };
}

/** @type {Werkzeug[]} */
export const WERKZEUGE = [
  {
    name: 'brief_hilfe',
    description:
      'Zeigt den Feldkatalog (was gehört in welches Feld, Pflicht, Beispiel, maxlength), die Schalter und die Funktionssignaturen. Immer zuerst aufrufen, wenn unklar ist, wohin ein Wert gehört.',
    nurLesen: true,
    ausfuehren: () => {
      const api = briefApi();
      if (!api) return ohneApi();
      const basis = api.hilfe();
      return { ...basis, katalog: feldKatalog(/** @type {string[]} */ (basis.felder ?? [])) };
    },
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }
  },
  {
    name: 'brief_lesen',
    description:
      'Liest alle Feldwerte des aktuellen Briefs (Empfänger, Absender, Datum, Betreff, Anrede, Text, Grußformel, Fußzeile) und den Stand der Schalter.',
    nurLesen: true,
    ausfuehren: () => {
      const api = briefApi();
      return api ? api.lesen() : ohneApi();
    },
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }
  },
  {
    name: 'brief_setzen',
    description:
      'Schreibt genau ein Feld oder einen Schalter. Feld-IDs liefert brief_hilfe; Schalter sind toggle-anlagen, toggle-fuss, toggle-falzmarken und erwarten einen booleschen wert.',
    nurLesen: false,
    ausfuehren: (argumente) => {
      const api = briefApi();
      if (!api) return ohneApi();
      return api.setzen(text(argumente, 'feld'), argumente.wert);
    },
    inputSchema: {
      type: 'object',
      properties: {
        feld: { type: 'string', description: 'Feld-ID, z. B. betreff, text, datum, fuss-iban' },
        wert: {
          type: ['string', 'boolean'],
          description: 'Neuer Wert; boolean nur für Schalter'
        }
      },
      required: ['feld', 'wert'],
      additionalProperties: false
    }
  },
  {
    name: 'brief_adresse_setzen',
    description:
      'Setzt den Empfänger- oder Absenderblock. Leere Angaben werden übersprungen, vorhandene Werte bleiben stehen.',
    nurLesen: false,
    ausfuehren: (argumente) => {
      const api = briefApi();
      if (!api) return ohneApi();
      /** @type {Record<string, string>} */
      const daten = {};
      for (const schluessel of ['firma', 'name', 'strasse', 'ort']) {
        const wert = text(argumente, schluessel);
        if (wert) daten[schluessel] = wert;
      }
      const rolle = text(argumente, 'rolle');
      if (rolle !== 'empfaenger' && rolle !== 'absender') {
        return { ok: false, fehler: 'rolle muss "empfaenger" oder "absender" sein' };
      }
      return api.adresse(rolle, daten);
    },
    inputSchema: {
      type: 'object',
      properties: {
        rolle: { type: 'string', enum: ['empfaenger', 'absender'] },
        firma: { type: 'string' },
        name: { type: 'string', description: 'Vor- und Nachname, ggf. mit Titel' },
        strasse: { type: 'string', description: 'Straße und Hausnummer' },
        ort: { type: 'string', description: 'PLZ und Ort, z. B. 53840 Troisdorf' }
      },
      required: ['rolle'],
      additionalProperties: false
    }
  },
  {
    name: 'brief_anrede_setzen',
    description:
      'Wählt Anrede und Grußformel passend zu Name, Firma und Tonalität (formal, polite, casual) und schreibt beide Felder.',
    nurLesen: false,
    ausfuehren: (argumente) => {
      const api = briefApi();
      if (!api) return ohneApi();
      const tonalitaet = text(argumente, 'tonalitaet') || 'formal';
      return api.anrede(text(argumente, 'name'), text(argumente, 'firma'), tonalitaet);
    },
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name der angeschriebenen Person, z. B. Frau Dr. Meier' },
        firma: { type: 'string' },
        tonalitaet: { type: 'string', enum: ['formal', 'polite', 'casual'] }
      },
      required: ['name'],
      additionalProperties: false
    }
  },
  {
    name: 'brief_datum_setzen',
    description:
      'Schreibt das Briefdatum in deutscher Langform. Akzeptiert ISO (2026-11-23), 23.11.2026 oder bereits 23. November 2026.',
    nurLesen: false,
    ausfuehren: (argumente) => {
      const api = briefApi();
      if (!api) return ohneApi();
      return api.datum(text(argumente, 'datum'));
    },
    inputSchema: {
      type: 'object',
      properties: {
        datum: { type: 'string', description: 'ISO, TT.MM.JJJJ oder deutsche Langform' }
      },
      required: ['datum'],
      additionalProperties: false
    }
  },
  {
    name: 'brief_seiten',
    description:
      'Liefert Seitenzahl, Zeilen pro Seite, womit jede Seite beginnt und endet, plus Warnungen bei fast leeren Seiten (etwa „nur 2 Zeilen auf Seite 2"). Bildschirm-Näherung des Umbruchs, nicht das PDF.',
    nurLesen: true,
    ausfuehren: seitenInfo,
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }
  },
  {
    name: 'brief_layout_setzen',
    description:
      'Schaltet das DIN-5008-Formular um: form-a (hoher Briefkopf, 27 mm) oder form-b (tiefer Briefkopf, 45 mm). Ändert die Seitenzahl — danach brief_seiten lesen.',
    nurLesen: false,
    ausfuehren: (argumente) => {
      const form = text(argumente, 'form');
      if (form !== 'form-a' && form !== 'form-b') {
        return { ok: false, fehler: 'form muss "form-a" oder "form-b" sein' };
      }
      const knopf = /** @type {HTMLInputElement | null} */ (
        document.getElementById(form === 'form-a' ? 'btn-form-a' : 'btn-form-b')
      );
      if (!knopf) return { ok: false, fehler: 'Formular-Schalter fehlt im Dokument' };
      knopf.click();
      return {
        ok: true,
        form: leseForm(),
        hinweis: 'Seitenzahl wird im nächsten Frame neu berechnet — mit brief_seiten abfragen.'
      };
    },
    inputSchema: {
      type: 'object',
      properties: { form: { type: 'string', enum: ['form-a', 'form-b'] } },
      required: ['form'],
      additionalProperties: false
    }
  },
  {
    name: 'brief_tonalitaet_setzen',
    description:
      'Setzt die Tonalität des Briefs (formal, polite, casual): Anrede und Grußformel werden passend gewählt, und der Stilvertrag für den Text kommt zurück. Ohne name wird nur der Vertrag geliefert — gut vor dem Schreiben des Textes.',
    nurLesen: false,
    ausfuehren: async (argumente) => {
      const api = briefApi();
      if (!api) return ohneApi();
      const ton = text(argumente, 'tonalitaet') || 'formal';
      if (!(ton in STIL_VERTRAG)) {
        return { ok: false, fehler: 'tonalitaet muss "formal", "polite" oder "casual" sein' };
      }
      const vertrag = STIL_VERTRAG[/** @type {'formal' | 'polite' | 'casual'} */ (ton)];
      const name = text(argumente, 'name');
      const gesetzt = name ? api.anrede(name, text(argumente, 'firma'), ton) : null;
      const werte = api.lesen().felder ?? {};
      return {
        ok: gesetzt ? gesetzt.ok !== false : true,
        tonalitaet: ton,
        anrede: werte.anrede ?? '',
        grussformel: werte.grussformel ?? '',
        register: vertrag.register,
        untersagt: vertrag.untersagt,
        hinweis: 'Der Text muss in dieser Register-Ebene bleiben — brief_pruefen kontrolliert es.'
      };
    },
    inputSchema: {
      type: 'object',
      properties: {
        tonalitaet: { type: 'string', enum: ['formal', 'polite', 'casual'] },
        name: { type: 'string', description: 'Name der angeschriebenen Person; fehlt er, wird nichts geschrieben' },
        firma: { type: 'string' }
      },
      required: ['tonalitaet'],
      additionalProperties: false
    }
  },
  {
    name: 'brief_fuss_setzen',
    description:
      'Setzt den §-35a-Fuß in einem Aufruf (Firma, Sitz, Gericht, HRB, Vorstand, Geschäftsführung, Steuernummer, USt-IdNr., Bank, IBAN, BIC, Anschrift) und schaltet die Fußzeile ein. Die IBAN wird formatiert.',
    nurLesen: false,
    ausfuehren: async (argumente) => {
      const api = briefApi();
      if (!api) return ohneApi();
      /** @type {string[]} */
      const gesetzt = [];
      /** @type {string[]} */
      const fehler = [];
      for (const [schluessel, feld] of Object.entries(FUSS_FELDER)) {
        const wert = text(argumente, schluessel);
        if (!wert) continue;
        let zuSchreiben = wert;
        if (feld === 'fuss-iban') {
          const { formatIban } = await import('./format.js');
          zuSchreiben = formatIban(wert) || wert;
        }
        notiere(api.setzen(feld, zuSchreiben), feld, gesetzt, fehler);
      }
      if (gesetzt.length === 0) return { ok: false, fehler: 'keine verwertbaren Angaben' };
      // Sicherstellen, dass das Addon „Geschäftsangaben (§ 35a)" aktiv und sichtbar ist
      const elPlugin =
        typeof document === 'undefined' ? null : document.getElementById('toggle-plugin-geschaeftsangaben');
      if (elPlugin instanceof HTMLInputElement && !elPlugin.checked) {
        elPlugin.checked = true;
        elPlugin.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (typeof document !== 'undefined') {
        document.documentElement.dataset.pluginGeschaeft = 'true';
      }
      notiere(api.setzen('toggle-fuss', true), 'toggle-fuss', gesetzt, fehler);
      return { ok: fehler.length === 0, gesetzt, fehler };
    },
    inputSchema: {
      type: 'object',
      properties: {
        firma: { type: 'string' },
        sitz: { type: 'string' },
        gericht: { type: 'string' },
        hrb: { type: 'string' },
        vorstand: { type: 'string' },
        gf: { type: 'string' },
        stnr: { type: 'string' },
        ustid: { type: 'string' },
        bank: { type: 'string' },
        iban: { type: 'string' },
        bic: { type: 'string' },
        anschrift: { type: 'string' }
      },
      additionalProperties: false
    }
  },
  {
    name: 'brief_ort_pruefen',
    description:
      'Prüft eine Postleitzahl gegen das lokale Verzeichnis (10.184 Orte, keine Netzverbindung) und optional, ob der Ort dazu passt.',
    nurLesen: true,
    ausfuehren: async (argumente) => {
      const plz = text(argumente, 'plz');
      if (!/^\d{5}$/.test(plz)) return { ok: false, fehler: 'plz muss fünfstellig sein' };
      const ort = text(argumente, 'ort');
      try {
        const { AddressIntelligence, ortsVorschlaege } = await import('./address.js');
        if (typeof AddressIntelligence?.init === 'function') {
          await AddressIntelligence.init();
        }
        const antwort = ortsVorschlaege(plz, 3, { nurOrte: true });
        const treffer = (antwort.items ?? []).map((eintrag) => ({
          plz: String(eintrag.plz ?? plz),
          ort: String(eintrag.city ?? eintrag.ort ?? eintrag.name ?? '')
        }));
        if (treffer.length === 0) {
          return { ok: false, fehler: `PLZ ${plz} nicht im Verzeichnis (oder Ortsdaten noch nicht geladen)` };
        }
        const passt =
          ort.length > 0
            ? treffer.some((eintrag) => eintrag.ort.toLowerCase().includes(ort.toLowerCase()))
            : undefined;
        return {
          ok: passt !== false,
          plz,
          orte: treffer.map((eintrag) => eintrag.ort),
          passt,
          hinweis: passt === false ? `„${ort}" steht nicht bei PLZ ${plz}.` : ''
        };
      } catch {
        return { ok: false, fehler: 'Ortsverzeichnis nicht verfügbar' };
      }
    },
    inputSchema: {
      type: 'object',
      properties: {
        plz: { type: 'string', description: 'Fünfstellige Postleitzahl' },
        ort: { type: 'string', description: 'Optionaler Ort zum Abgleich' }
      },
      required: ['plz'],
      additionalProperties: false
    }
  },
  {
    name: 'brief_strasse_suchen',
    description:
      'Sucht Straßen über Geoapify (nur wenn ein Key in den Einstellungen hinterlegt ist). Liefert Straße, PLZ, Ort und den formatierten Treffer; schreibt nichts.',
    nurLesen: true,
    ausfuehren: async (argumente) => {
      const suche = text(argumente, 'suche');
      if (suche.length < 3) return { ok: false, fehler: 'suche braucht mindestens 3 Zeichen' };
      const feld = /** @type {HTMLInputElement | null} */ (document.getElementById('input-geoapify-key'));
      const key = String(feld?.value || localStorage.getItem('din_geoapify_key') || '').trim();
      if (!key) return { ok: false, fehler: 'Kein Geoapify-Key hinterlegt (Einstellungen → API-Key).' };
      try {
        const { adressRelevanz, ermittleGeoBias, strassenSuchPfad } = await import('./address.js');
        const bias = await ermittleGeoBias(key).catch(() => null);
        const antwort = await fetch(strassenSuchPfad(suche, key, bias));
        if (!antwort.ok) return { ok: false, fehler: `Geoapify antwortet ${antwort.status}` };
        const daten = await antwort.json();
        const max = Math.min(10, Math.max(1, Number(argumente.max) || 5));
        const treffer = (daten.features ?? [])
          .map((/** @type {any} */ feature) => feature.properties ?? {})
          .sort((/** @type {any} */ a, /** @type {any} */ b) => adressRelevanz(a, suche) - adressRelevanz(b, suche))
          .slice(0, max)
          .map((/** @type {any} */ eigenschaften) => ({
            strasse: [eigenschaften.street, eigenschaften.housenumber].filter(Boolean).join(' '),
            plz: eigenschaften.postcode ?? '',
            ort: eigenschaften.city ?? '',
            treffer: eigenschaften.formatted ?? ''
          }));
        return { ok: true, suche, treffer };
      } catch (problem) {
        return { ok: false, fehler: problem instanceof Error ? problem.message : String(problem) };
      }
    },
    inputSchema: {
      type: 'object',
      properties: {
        suche: { type: 'string', description: 'Straße und Ort, z. B. "Musterweg Troisdorf"' },
        max: { type: 'number', description: 'Trefferzahl 1–10, Vorgabe 5' }
      },
      required: ['suche'],
      additionalProperties: false
    }
  },
  {
    name: 'brief_pruefen',
    description:
      'Prüft den Brief und liefert Befunde statt eines Daumen hoch: Pflichtfelder, Datumsformat, PLZ/Ort, IBAN-Prüfsumme, BIC-Form, Anrede/Grußformel, Tonalität gegen den Text, fast leere Folgeseiten.',
    nurLesen: true,
    ausfuehren: async () => {
      const api = briefApi();
      if (!api) return ohneApi();
      const werte = api.lesen().felder ?? {};
      /** @type {{ stufe: 'fehler' | 'warnung' | 'hinweis', feld: string, text: string }[]} */
      const befunde = [];
      const befund = (/** @type {'fehler'|'warnung'|'hinweis'} */ stufe, /** @type {string} */ feld, /** @type {string} */ text) =>
        befunde.push({ stufe, feld, text });

      if (!String(werte['empfaenger-name'] ?? '').trim() && !String(werte['empfaenger-firma'] ?? '').trim()) {
        befund('fehler', 'empfaenger-name', 'Empfänger fehlt (Name oder Firma).');
      }
      if (!String(werte['empfaenger-ort'] ?? '').trim()) befund('fehler', 'empfaenger-ort', 'PLZ/Ort des Empfängers fehlt.');
      if (!String(werte.betreff ?? '').trim()) befund('fehler', 'betreff', 'Betreff fehlt.');
      if (!String(werte.text ?? '').trim()) befund('fehler', 'text', 'Text fehlt.');
      if (!String(werte.anrede ?? '').trim()) befund('fehler', 'anrede', 'Anrede fehlt.');
      if (!String(werte.grussformel ?? '').trim()) befund('fehler', 'grussformel', 'Grußformel fehlt.');
      if (!String(werte.unterschrift ?? '').trim()) befund('warnung', 'unterschrift', 'Unterschriftzeile fehlt.');

      const datum = String(werte.datum ?? '').trim();
      if (!/^\d{1,2}\. [A-ZÄÖÜ][a-zäöüß]+ \d{4}$/.test(datum)) {
        befund('warnung', 'datum', `Datum „${datum}" ist nicht die deutsche Langform (z. B. 23. November 2026).`);
      }

      const ort = String(werte['empfaenger-ort'] ?? '').trim();
      const plzTreffer = ort.match(/(\d{5})/);
      if (!plzTreffer) {
        befund('warnung', 'empfaenger-ort', `Keine fünfstellige PLZ in „${ort}".`);
      } else {
        const plz = plzTreffer[1];
        const ortName = ort.replace(plz, '').trim();
        try {
          const { AddressIntelligence, ortsVorschlaege } = await import('./address.js');
          if (typeof AddressIntelligence?.init === 'function') {
            await AddressIntelligence.init();
          }
          const vorhanden = (ortsVorschlaege(plz, 3, { nurOrte: true }).items ?? []).map((eintrag) =>
            String(eintrag.city ?? eintrag.ort ?? eintrag.name ?? '')
          );
          if (vorhanden.length === 0) {
            befund('hinweis', 'empfaenger-ort', `PLZ ${plz} steht nicht im lokalen Verzeichnis.`);
          } else if (ortName && !vorhanden.some((name) => name.toLowerCase().includes(ortName.toLowerCase()))) {
            befund('warnung', 'empfaenger-ort', `PLZ ${plz} gehört zu ${vorhanden.join('/')}, nicht zu „${ortName}".`);
          }
        } catch {
          befund('hinweis', 'empfaenger-ort', 'Ortsverzeichnis nicht verfügbar — PLZ ungeprüft.');
        }
      }

      const iban = String(werte['fuss-iban'] ?? '').trim();
      if (iban && !ibanGueltig(iban)) befund('fehler', 'fuss-iban', 'IBAN-Prüfsumme stimmt nicht.');
      const bic = String(werte['fuss-bic'] ?? '').trim().toUpperCase();
      if (bic && !/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic)) {
        befund('fehler', 'fuss-bic', `BIC „${bic}" hat nicht die Form AAAA DE MM (8 oder 11 Zeichen).`);
      }

      const ton = tonAusGrussformel(String(werte.grussformel ?? ''));
      const vertrag = STIL_VERTRAG[ton];
      const textKlein = String(werte.text ?? '').toLowerCase();
      for (const wort of vertrag.untersagt) {
        const trifft = wort.includes(' ')
          ? textKlein.includes(wort)
          : new RegExp(`\\b${wort}\\b`, 'i').test(textKlein);
        if (trifft) {
          befund('warnung', 'text', `Tonalität ist ${ton}, im Text steht aber „${wort}".`);
        }
      }
      if (String(werte.anrede ?? '').trim() && !String(werte.anrede ?? '').trim().endsWith(',')) {
        befund('warnung', 'anrede', 'Anrede sollte mit einem Komma enden.');
      }

      const seiten = seitenInfo();
      for (const warnung of /** @type {string[]} */ (seiten.warnungen ?? [])) {
        befund('warnung', 'seiten', warnung);
      }

      const fehler = befunde.filter((eintrag) => eintrag.stufe === 'fehler').length;
      const warnungen = befunde.filter((eintrag) => eintrag.stufe === 'warnung').length;
      const hinweise = befunde.filter((eintrag) => eintrag.stufe === 'hinweis').length;
      return {
        ok: fehler === 0,
        tonalitaet: ton,
        befunde,
        zusammenfassung: `${fehler} Fehler, ${warnungen} Warnungen, ${hinweise} Hinweise`,
        seiten: seiten.seiten
      };
    },
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }
  },
  {
    name: 'brief_schreiben',
    description:
      'Schreibt einen vollständigen Brief in einem Aufruf: Empfänger, Absender, Datum, Anrede, Betreff, Text, Grußformel, Unterschrift, Anlagen. Der bevorzugte Einstieg für "schreib einen Brief an …".',
    nurLesen: false,
    ausfuehren: briefSchreiben,
    inputSchema: {
      type: 'object',
      properties: {
        empfaenger: {
          type: 'object',
          properties: {
            firma: { type: 'string' },
            name: { type: 'string' },
            strasse: { type: 'string' },
            ort: { type: 'string' }
          },
          additionalProperties: false
        },
        absender: {
          type: 'object',
          properties: {
            firma: { type: 'string' },
            name: { type: 'string' },
            strasse: { type: 'string' },
            ort: { type: 'string' },
            tel: { type: 'string', description: 'Telefon für die Fußzeile' },
            mail: { type: 'string', description: 'E-Mail für die Fußzeile' }
          },
          additionalProperties: false
        },
        datum: { type: 'string', description: 'ISO, TT.MM.JJJJ oder deutsche Langform' },
        anrede_name: { type: 'string', description: 'Name für die automatische Anrede' },
        anrede_firma: { type: 'string', description: 'Firma für die automatische Anrede' },
        tonalitaet: { type: 'string', enum: ['formal', 'polite', 'casual'] },
        betreff: { type: 'string' },
        anrede: { type: 'string', description: 'Fertige Anrede; schlägt anrede_name' },
        text: {
          type: 'string',
          description:
            'Nur der Fließtext. Anrede und Grußformel gehören in anrede/grussformel — sonst stehen sie doppelt im Brief.'
        },
        grussformel: { type: 'string' },
        unterschrift: { type: 'string', description: 'Name unter der Grußformel' },
        anlagen: { type: 'string', description: 'Anlagenvermerk' },
        vermerke: { type: 'string', description: 'Postvermerk, z. B. Einschreiben' }
      },
      additionalProperties: false
    }
  },
  {
    name: 'brief_exportieren',
    description:
      'Gibt den Brief als DIN-Letter-JSON zurück — dieselbe Struktur wie die Datei aus "Speichern (.json)".',
    nurLesen: true,
    ausfuehren: () => {
      const api = briefApi();
      return api ? api.exportieren() : ohneApi();
    },
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }
  }
];

/**
 * Führt ein Werkzeug aus. Wirft nie: ein unbekannter Name und ein Fehler in
 * `dinApi` kommen als `{ ok: false, fehler }` zurück, damit ein Agent aus dem
 * Ergebnis lernen kann. Async, seit Geoapify- und Ortsabfragen dazukamen.
 * @param {string} name
 * @param {WerkzeugArgumente} [argumente]
 * @returns {Promise<Record<string, unknown>>}
 */
export async function ausfuehren(name, argumente = {}) {
  const werkzeug = WERKZEUGE.find((kandidat) => kandidat.name === name);
  if (!werkzeug) {
    return {
      ok: false,
      fehler: `unbekanntes Werkzeug "${name}"`,
      werkzeuge: WERKZEUGE.map((kandidat) => kandidat.name)
    };
  }
  try {
    return await werkzeug.ausfuehren(istObjekt(argumente) ? argumente : {});
  } catch (fehler) {
    return { ok: false, fehler: fehler instanceof Error ? fehler.message : String(fehler) };
  }
}

/**
 * Die öffentliche Werkzeugliste in genau der Form, die ein Agent erwartet:
 * Name, Beschreibung, JSON-Schema und Sicherheitshinweise.
 * @returns {{ name: string, description: string, inputSchema: Record<string, unknown>, annotations: Record<string, boolean> }[]}
 */
export function werkzeugListe() {
  return WERKZEUGE.map((werkzeug) => ({
    name: werkzeug.name,
    description: werkzeug.description,
    inputSchema: werkzeug.inputSchema,
    annotations: {
      readOnlyHint: werkzeug.nurLesen,
      consequentialHint: false,
      untrustedContentHint: false
    }
  }));
}

/* -------------------------------------------------------------- WebMCP-Boot */

/**
 * Stellt `window.dinBriefAgent` bereit und registriert die Werkzeuge bei
 * WebMCP, falls der Browser es anbietet. Ohne `document.modelContext` ist der
 * einzige Effekt das globale Objekt für die CLI-Bridge.
 * @returns {Promise<{ ok: boolean, registriert: number, webmcp: boolean, fehler: string[] }>}
 */
export async function initWebMCP() {
  /** @type {any} */
  const vertrag = {
    version: '1.0',
    werkzeuge: werkzeugListe,
    run: (/** @type {string} */ name, /** @type {WerkzeugArgumente} */ argumente = {}) =>
      ausfuehren(name, argumente),
    hilfe: () => ({ ok: true, werkzeuge: werkzeugListe(), hinweis: 'run(name, argumente) führt aus.' })
  };
  /** @type {any} */ (window).dinBriefAgent = vertrag;

  const context = document.modelContext;
  if (!context || typeof context.registerTool !== 'function') {
    return { ok: true, registriert: 0, webmcp: false, fehler: [] };
  }

  let registriert = 0;
  /** @type {string[]} */
  const fehler = [];
  for (const werkzeug of WERKZEUGE) {
    try {
      await context.registerTool({
        name: werkzeug.name,
        description: werkzeug.description,
        inputSchema: werkzeug.inputSchema,
        annotations: {
          readOnlyHint: werkzeug.nurLesen,
          consequentialHint: false,
          untrustedContentHint: false
        },
        execute: async (/** @type {WerkzeugArgumente} */ argumente) => ausfuehren(werkzeug.name, argumente)
      });
      registriert += 1;
    } catch (problem) {
      fehler.push(`${werkzeug.name}: ${problem instanceof Error ? problem.message : String(problem)}`);
    }
  }
  return { ok: fehler.length === 0, registriert, webmcp: true, fehler };
}

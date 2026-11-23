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
 * (`tools/mcp-dinbrief.mjs`) über CDP aufruft.
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
 *   ausfuehren: (argumente: WerkzeugArgumente) => Record<string, unknown>
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

  /** @type {{ seite: number, mitte: number, knoten: Text }[]} */
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
   * @param {{ mitte: number, knoten: Text }} zeile
   * @returns {string}
   */
  function zeilenText(zeile) {
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
      'Zeigt Feld-IDs, Schalter und Funktionssignaturen des DIN-5008-Briefeditors. Zuerst aufrufen, wenn unklar ist, welche Felder es gibt.',
    nurLesen: true,
    ausfuehren: () => {
      const api = briefApi();
      return api ? api.hilfe() : ohneApi();
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
 * Ergebnis lernen kann.
 * @param {string} name
 * @param {WerkzeugArgumente} [argumente]
 * @returns {Record<string, unknown>}
 */
export function ausfuehren(name, argumente = {}) {
  const werkzeug = WERKZEUGE.find((kandidat) => kandidat.name === name);
  if (!werkzeug) {
    return {
      ok: false,
      fehler: `unbekanntes Werkzeug "${name}"`,
      werkzeuge: WERKZEUGE.map((kandidat) => kandidat.name)
    };
  }
  try {
    return werkzeug.ausfuehren(istObjekt(argumente) ? argumente : {});
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
        execute: (/** @type {WerkzeugArgumente} */ argumente) => ausfuehren(werkzeug.name, argumente)
      });
      registriert += 1;
    } catch (problem) {
      fehler.push(`${werkzeug.name}: ${problem instanceof Error ? problem.message : String(problem)}`);
    }
  }
  return { ok: fehler.length === 0, registriert, webmcp: true, fehler };
}

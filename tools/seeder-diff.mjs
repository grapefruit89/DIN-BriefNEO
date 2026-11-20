#!/usr/bin/env node
/**
 * tools/seeder-diff.mjs — Differenztest Seeder gegen Restore (Batch 05, Aufgabe A).
 *
 * Warum: der Entwurf wird an ZWEI Stellen in die Seite zurueckgespielt —
 * `boot-state.js` (klassisches Skript, vor dem ersten Paint) und
 * `draft-manager.js` (`loadDraft` → `#restoreState`, danach). Beide lesen
 * denselben `localStorage`-Schluessel. Weichen sie ab, sieht der Nutzer einen
 * Sprung: erst der Seeder-Wert, dann der Restore-Wert.
 *
 * Dieses Werkzeug schreibt je Fall einen Entwurf, laedt neu und vergleicht den
 * Feldzustand **im Moment von `data-seeded`** mit dem **bei `data-ready`**.
 * Read-only fuer die App: nur `localStorage` (wird danach geleert).
 *
 * Aufruf:
 *   node tools/seeder-diff.mjs            # Server 8088 + CDP 9222 muessen laufen
 *   node tools/seeder-diff.mjs --json     # Maschinenlesbar
 *
 * Voraussetzung: `din-dev` (Dev-Server 8088, Debug-Browser 9222).
 */
import { writeFileSync } from 'node:fs';

const NUR_JSON = process.argv.includes('--json');
const ORIGIN = 'http://127.0.0.1:8088';

/** Felder, die beide Pfade kennen sollten (Quelle: index.html). */
const FELDER = [
  'empfaenger-firma', 'empfaenger-name', 'empfaenger-strasse', 'empfaenger-ort',
  'absender-name', 'absender-strasse', 'absender-ort', 'absender-tel', 'absender-mail',
  'datum', 'betreff', 'vermerke', 'text', 'anlagen-angabe',
];
const SCHALTER = ['toggle-anlagen', 'toggle-fuss'];

/** Die Faelle, die der Review genannt hat. */
const FAELLE = [
  {
    name: 'leer',
    draft: {},
    warum: 'kein Entwurf: beide Pfade muessen die Vorbelegung zeigen',
  },
  {
    name: 'voll',
    draft: {
      'empfaenger-firma': 'Beispiel GmbH',
      'empfaenger-name': 'Frau Müller',
      'empfaenger-strasse': 'Kettelerstr. 2',
      'empfaenger-ort': '53840 Troisdorf',
      'absender-name': 'Moritz Beispiel',
      'absender-strasse': 'Musterweg 1',
      'absender-ort': '53840 Troisdorf',
      'absender-tel': '+49 2241 123456',
      'absender-mail': 'post@example.org',
      datum: '1. März 2020',
      'datum__dirty': true,
      betreff: 'Prüfung der Kaskade',
      vermerke: 'Unser Zeichen: 4711',
      text: '<p>Sehr geehrte Damen und Herren,</p><p>Text.</p>',
      'anlagen-angabe': 'Anlage 1\nAnlage 2',
      'toggle-anlagen': true,
      'toggle-fuss': true,
    },
    warum: 'Normalfall: alle Felder gesetzt, Datum vom Nutzer',
    erwartet: {
      __datumDirty:
        'die Absicht (datum__dirty) kennt nur der Restore — der Seeder setzt die Markierung nicht, und das ist Absicht: vor dem Paint gibt es noch kein applyLetterDate, das sie braeuchte',
    },
  },
  {
    name: 'ohne-toggle-fuss',
    draft: {
      'empfaenger-name': 'Frau Müller',
      betreff: 'Ohne Fußschalter',
      text: '<p>Kurz.</p>',
    },
    warum: 'Alt-Entwurf ohne `toggle-fuss`: der Restore leitet ihn aus dem Inhalt ab',
  },
  {
    name: 'legacy-liste',
    draft: {
      'anlagen-angabe': '<ul><li>Anlage 1</li><li>Anlage 2</li></ul>',
      text: '<p>Alt.</p>',
    },
    warum: 'Alt-Entwurf mit <li>-HTML in der Anlagen-Angabe (Migration im Restore)',
    erwartet: {
      'anlagen-angabe': 'nur der Restore migriert <li>-HTML nach Text; der Seeder zeigt das Roh-Markup bis zum Paint (Alt-Entwuerfe, einmalig)',
    },
  },
  {
    name: 'datum-leer',
    draft: { datum: '', betreff: 'Datum leer' },
    warum: 'leeres Datum: `applyLetterDate` darf "heute" setzen',
  },
  {
    name: 'vermerk-leerzeichen',
    draft: { vermerke: '  Unser Zeichen: 4711  ', betreff: 'Vermerk mit Rand' },
    warum: 'der Seeder schreibt ungetrimmt, der Restore folgt dem getrimmten Feld',

  },
  {
    name: 'quelle',
    draft: { 'empfaenger-ort': 'Troisdorf', 'empfaenger-ort__quelle': 'manuell' },
    warum: 'Herkunftsmarker: nur der Restore wertet `__quelle` aus',
  },
];

const liste = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const tab = liste.find((t) => t.type === 'page' && (t.url || '').startsWith(ORIGIN));
if (!tab) {
  console.error(`Kein Tab auf ${ORIGIN} — laeuft din-dev?`);
  process.exit(2);
}
const ws = new WebSocket(tab.webSocketDebuggerUrl);
let id = 0;
const offen = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && offen.has(m.id)) { offen.get(m.id)(m); offen.delete(m.id); }
};
const send = (method, params = {}) =>
  new Promise((r) => { const i = ++id; offen.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await new Promise((r) => { ws.onopen = r; });
await send('Page.enable');
await send('Runtime.enable');
await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });

const ev = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.text);
  return r.result?.result?.value;
};

/* Snapshots im Moment der Marker. `setAttribute` ist der zuverlaessige Haken:
 * ein MutationObserver kann den Wert zwischen zwei Mikrotasks verpassen. */
await send('Page.addScriptToEvaluateOnNewDocument', {
  source: `
    (() => {
      const FELDER = ${JSON.stringify(FELDER)};
      const SCHALTER = ${JSON.stringify(SCHALTER)};
      const snap = () => {
        const out = {};
        for (const fid of FELDER) {
          const el = document.getElementById(fid);
          if (!el) continue;
          out[fid] = el.isContentEditable ? el.innerHTML.trim() : (el.value ?? '');
        }
        for (const s of SCHALTER) {
          const el = document.getElementById(s);
          if (el) out[s] = el.checked;
        }
        /* Die Datums-Absicht lebt seit D1 im Zustand (meta.datum.userSet),
           nicht mehr in einem DOM-Attribut; der Datumswert selbst bleibt im
           Snapshot und zeigt die Wirkung. */
        return out;
      };
      window.__snap = { seeded: null, ready: null, attach: null, marks: [] };
      /* Beides abfangen, weil ein dataset-Setter NICHT durch
       * Element.prototype.setAttribute laeuft (natives Setzen), ein
       * MutationObserver aber jede Attributaenderung sieht.
       * Und: beim Document-Start ist documentElement noch null — ohne Warten
       * wirft observe() und der ganze Block stirbt (genau das ist am
       * 2026-11-15 einmal passiert; deshalb steht es hier). */
      const merke = () => {
        const r = document.documentElement;
        if (!r) return;
        window.__snap.marks.push(r.dataset.seeded + '/' + r.dataset.ready);
        if (r.dataset.seeded === 'true' && !window.__snap.seeded) window.__snap.seeded = snap();
        if (r.dataset.ready === 'true' && !window.__snap.ready) window.__snap.ready = snap();
      };
      const start = () => {
        if (!document.documentElement) { setTimeout(start, 0); return; }
        new MutationObserver(merke).observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-seeded', 'data-ready'],
        });
        window.__snap.attach = { readyState: document.readyState, hadSeeded: document.documentElement.dataset.seeded ?? null };
        merke();
      };
      start();
    })();
  `,
});

await send('Page.navigate', { url: `${ORIGIN}/index.html?diff=${Date.now()}` });
for (let i = 0; i < 300; i++) {
  if (await ev(`document.documentElement.dataset.ready === 'true'`).catch(() => false)) break;
  await new Promise((r) => setTimeout(r, 25));
}

const ergebnisse = [];
for (const fall of FAELLE) {
  /* Den Entwurf NICHT vor der Navigation setzen: die alte Seite speichert beim
   * Verlassen (`flushPendingSave`) und ueberschreibt den Fixture. Stattdessen
   * im NEUEN Dokument eintragen, bevor boot-state.js laeuft — dann sieht der
   * Seeder genau den Fixture. */
  const injiziert = await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `try { localStorage.setItem('din_draft_current', ${JSON.stringify(JSON.stringify(fall.draft))}); } catch (e) {}`,
  });
  const token = `${Date.now()}-${fall.name}`;
  await send('Page.navigate', { url: `${ORIGIN}/index.html?diff=${token}` });
  for (let i = 0; i < 400; i++) {
    const bereit = await ev(
      `location.search.includes(${JSON.stringify(token)}) && document.documentElement.dataset.ready === 'true'`,
    ).catch(() => false);
    if (bereit) break;
    await new Promise((r) => setTimeout(r, 20));
  }
  /* Nach dem Ready noch die Marken einsammeln (applyLetterDate laeuft dort). */
  await new Promise((r) => setTimeout(r, 150));
  if (injiziert?.result?.identifier) {
    await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: injiziert.result.identifier });
  }
  const schnapp = JSON.parse((await ev('JSON.stringify(window.__snap)')) ?? '{"seeded":null,"ready":null}');
  if (!schnapp.seeded || !schnapp.ready) {
    /* Ohne beide Proben ist "0 Abweichungen" eine Luege: zwei leere Mengen sind
     * gleich. Genau diese Falle hat am 2026-11-15 einmal ein falsches Gruen
     * erzeugt. */
    ergebnisse.push({
      fall: fall.name,
      warum: fall.warum,
      diff: [{ feld: 'MESSFEHLER', seeded: schnapp.seeded, ready: schnapp.ready, attach: schnapp.attach }],
    });
    if (!NUR_JSON) {
      console.log(`${fall.name.padEnd(20)} MESSFEHLER: Snapshot fehlt (attach=${JSON.stringify(schnapp.attach)})`);
    }
    continue;
  }
  const a = schnapp.seeded;
  const b = schnapp.ready;
  const ids = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
  const diff = [];
  for (const fid of ids) {
    const va = JSON.stringify(a[fid]);
    const vb = JSON.stringify(b[fid]);
    if (va !== vb) diff.push({ feld: fid, seeded: a[fid], ready: b[fid] });
  }
  const erwartet = fall.erwartet ?? {};
  const unerwartet = diff.filter((d) => !(d.feld in erwartet));
  const erwartetGetroffen = diff.filter((d) => d.feld in erwartet);
  ergebnisse.push({
    fall: fall.name,
    warum: fall.warum,
    diff,
    erwartet: Object.keys(erwartet),
    unerwartet: unerwartet.map((d) => d.feld),
  });
  if (!NUR_JSON) {
    const kopf = `${fall.name.padEnd(20)} Abweichungen: ${String(diff.length).padStart(2)}`
      + (unerwartet.length ? `  UNERWARTET: ${unerwartet.map((d) => d.feld).join(', ')}` : '');
    console.log(kopf);
    for (const d of diff) {
      const marke = d.feld in erwartet ? 'erwartet' : 'UNERWARTET';
      console.log(`   [${marke}] ${d.feld}: seeded=${JSON.stringify(d.seeded)} → ready=${JSON.stringify(d.ready)}`);
    }
  }
}

await ev(`localStorage.removeItem('din_draft_current')`);

const gesamt = ergebnisse.reduce((n, e) => n + e.diff.length, 0);
const unerwartet = ergebnisse.reduce((n, e) => n + (e.unerwartet?.length ?? 0), 0);
if (NUR_JSON) {
  console.log(JSON.stringify({ faelle: ergebnisse, gesamt }, null, 1));
} else {
  console.log(`\nSumme abweichende Felder: ${gesamt} in ${ergebnisse.length} Faellen`
    + ` | davon unerwartet: ${unerwartet}`);
  const datei = '/tmp/opencode/seeder-diff.json';
  writeFileSync(datei, JSON.stringify({ faelle: ergebnisse, gesamt }, null, 1), 'utf-8');
  console.log(`Rohdaten: ${datei}`);
}
ws.close();
process.exit(unerwartet === 0 ? 0 : 1);

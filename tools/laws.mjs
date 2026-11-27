#!/usr/bin/env node
/**
 * tools/laws.mjs — Konsolidierte Verfassungs- & Gesetzes-Sonden für DIN-BriefNEO.
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ROOT = path.resolve(__dirname, "..");

/* ==================================================================
   1. Scan (Glob-to-RegExp)
   ================================================================== */
export function globToRegExp(glob) {
  return new RegExp("^" + glob
    .replace(/[.+^${}()|[]\]/g, "\\$&")
    .replace(/\*\*/g, "\u0000")
    .replace(/\*/g, "[^/]*")
    .replace(/\u0000/g, ".*") + "$");
}

export function matchFilePattern(filePath, patterns) {
  const ext = path.extname(filePath).toLowerCase();
  return (patterns || []).some((pattern) => {
    if (pattern === "*" || pattern === "*.*") return true;
    if (pattern.startsWith("*.")) return ext === pattern.slice(1).toLowerCase();
    const normPattern = pattern.replace(/\\/g, "/");
    const normPath = filePath.replace(/\\/g, "/");
    if (normPattern.includes("*")) {
      const rx = globToRegExp(normPattern);
      return rx.test(normPath) || rx.test(normPath.replace(/^.*?(?=website\/)/, ""));
    }
    return normPath.endsWith(normPattern) || normPath.includes(normPattern);
  });
}

/* ==================================================================
   2. IMR-Registry
   ================================================================== */
const imr = (() => {
/**
 * tools/laws/imr.js — IMR-Registry als maschinenlesbare SSOT.
 *
 * Liest docs/norm/IMR-Registry.md (normatives Modell + JSON-Inventar),
 * prueft die Registry-Invarianten und dass der Website-Code + die CSS-Geometrie
 * (Tokens in website/css/base.css) exakt der Registry entsprechen. Kein Dependency, kein Build-Step.
 *
 *   
 *   const { violations } = checkImr('/pfad/zum/repo');
 */



const REGISTRY_REL = 'docs/norm/IMR-Registry.md';

function readRegistry(targetDir) {
  const md = fs.readFileSync(path.join(targetDir, REGISTRY_REL), 'utf-8');
  const tags = new Set((md.match(/<din-[a-z0-9-]+>/g) || []).map(t => t.slice(1, -1)));
  const m = md.match(/<!-- IMR-INVENTORY:START -->\s*```json\s*([\s\S]*?)```\s*<!-- IMR-INVENTORY:END -->/);
  const inventory = m ? JSON.parse(m[1]) : null;
  return { md, tags, inventory };
}

/** Erwartete CSS-Geometrie-Tokens in website/css/base.css (Reihenfolge egal). */
function expectedCssTokens(inventory) {
  const out = {
    '--blatt-breite': inventory.sheet.width,
    '--blatt-hoehe': inventory.sheet.height,
  };
  for (const [id, spec] of Object.entries(inventory.geometry || {})) {
    const base = id.replace(/^din-/, '');
    const y = spec.y || {};
    if ('Y' in y) out[`--geometrie-${base}-y-mm`] = y.Y;
    if ('A' in y) out[`--geometrie-${base}-y-a-mm`] = y.A;
    if ('B' in y) out[`--geometrie-${base}-y-b-mm`] = y.B;
  }
  return out;
}

function walkCode(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkCode(p, out);
    else if (/\.(html|css|js)$/.test(e.name)) out.push(p);
  }
  return out;
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/** Maskiert CSS-Kommentare, ohne Zeilennummern zu verschieben. */
function maskCssComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

/**
 * Maskiert Bloecke, deren Selektor auf `selectorRe` passt, samt Kindbloecken.
 * Fuer den DIN-5008-Bypass-Schutz: `@page` darf rohe Millimeter tragen.
 */
function maskCssBlocks(src, selectorRe) {
  const out = src.split('');
  const stack = [];
  let selectStart = 0;
  let insideMasked = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') {
      const selector = src.slice(selectStart, i);
      const masked = insideMasked || selectorRe.test(selector);
      stack.push(masked);
      insideMasked = masked;
      if (masked) out[i] = ' ';
      selectStart = i + 1;
    } else if (ch === '}') {
      stack.pop();
      insideMasked = stack.length > 0 ? stack[stack.length - 1] : false;
      if (insideMasked) out[i] = ' ';
      selectStart = i + 1;
    } else if (ch === ';') {
      selectStart = i + 1;
    } else if (insideMasked && ch !== '\n') {
      out[i] = ' ';
    }
  }
  return out.join('');
}
function boundaryRe(term) {
  return new RegExp(`(?<![A-Za-z0-9äöüÄÖÜß])${escapeRe(term)}(?![A-Za-z0-9äöüÄÖÜß])`, 'g');
}

/**
 * Kanonischer-Vokabular-Check. Case-sensitive, damit kapitalisierte API-/Brand-
 * Namen (Toast/ToastSystem, FontFace, Paperless) unberuehrt bleiben. Datei-Pfade
 * (.js/.css) und die deklarierten Ausnahmen werden uebersprungen.
 */
function checkVocabulary(targetDir, inventory) {
  const out = [];
  const vocab = inventory.vocabulary;
  if (!vocab) return out;
  const exceptions = vocab.exceptions || [];
  const tokenChar = /[A-Za-z0-9_.\-äöüÄÖÜß]/;
  const seen = new Set();
  const files = walkCode(path.join(targetDir, 'website'))
    .filter(f => !f.includes(`${path.sep}data${path.sep}`));
  for (const file of files) {
    const rel = path.relative(targetDir, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf-8')
      .replace(/\[\[[^\]]*\]\]/g, '')
      .replace(/@(guide|adr)\b[^\n]*/g, '');
    const report = (term, msg) => {
      const key = `${rel}|${term}`;
      if (!seen.has(key)) { seen.add(key); out.push({ file: rel, message: `${msg} (${rel})` }); }
    };
    for (const entry of vocab.forbidden || []) {
      for (const m of content.matchAll(boundaryRe(entry.term))) {
        const i = m.index;
        let a = i, b = i + m[0].length;
        while (a > 0 && tokenChar.test(content[a - 1])) a--;
        while (b < content.length && tokenChar.test(content[b])) b++;
        const token = content.slice(a, b);
        if (/\.(js|css)$/.test(token)) continue;
        if (exceptions.some(e => token.includes(e))) continue;
        report(entry.term, `Verbotener Begriff "${entry.term}" -> kanonisch "${entry.canonical}"`);
      }
    }
    for (const tok of vocab.forbiddenTokens || []) {
      if (content.includes(tok)) report(tok, `Verbotenes Token "${tok}"`);
    }
  }
  return out;
}

/**
 * Case-Gate: HTML/CSS-Identifier muessen kebab-case sein (kein Upper/snake).
 * JS-Identifier (camelCase/PascalCase/UPPER_SNAKE) werden bewusst NICHT geprueft.
 * Dateinamen werden nicht geprueft (bestehende Konvention).
 */
function checkCase(targetDir, inventory) {
  const out = [];
  const cc = inventory.caseContract;
  if (!cc || cc.htmlCss !== 'kebab-case') return out;
  const bad = (n) => /[A-Z_]/.test(n);
  const hex = (n) => /^[0-9a-fA-F]{3,8}$/.test(n);
  const seen = new Set();
  const report = (rel, kind, name) => {
    const key = `${rel}|${kind}|${name}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ file: rel, message: `Case-Verstoss (${kind} -> kebab-case): "${name}"` });
  };
  const htmlRel = 'website/index.html';
  const html = fs.readFileSync(path.join(targetDir, htmlRel), 'utf-8');
  for (const m of html.matchAll(/\bid="([^"]*)"/g)) if (bad(m[1])) report(htmlRel, 'HTML id', m[1]);
  for (const m of html.matchAll(/\bclass="([^"]*)"/g)) for (const c of m[1].split(/\s+/)) if (c && bad(c)) report(htmlRel, 'HTML class', c);
  for (const m of html.matchAll(/\b(data-[\w-]+)\s*=/g)) if (bad(m[1])) report(htmlRel, 'HTML data-Attribut', m[1]);
  for (const file of walkCode(path.join(targetDir, 'website'))) {
    if (!file.endsWith('.css')) continue;
    const rel = path.relative(targetDir, file).replace(/\\/g, '/');
    const css = ' ' + fs.readFileSync(file, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, ' ');
    for (const m of css.matchAll(/@(?:-\w+-)?keyframes\s+([A-Za-z_][\w-]*)/g)) if (bad(m[1])) report(rel, '@keyframes', m[1]);
    for (const m of css.matchAll(/@property\s+(--[\w-]+)/g)) if (bad(m[1])) report(rel, '@property', m[1]);
    for (const m of css.matchAll(/(--[\w-]+)\s*:/g)) if (bad(m[1])) report(rel, 'Custom Property', m[1]);
    for (const m of css.matchAll(/(?<=[\s,>+~()])\.([A-Za-z_][\w-]*)/g)) if (bad(m[1])) report(rel, 'CSS Klasse', m[1]);
    for (const m of css.matchAll(/(?<=[\s,>+~()])#([A-Za-z_][\w-]*)/g)) if (!hex(m[1]) && bad(m[1])) report(rel, 'CSS ID', m[1]);
  }
  // Docs: Frontmatter-id muss kebab-case sein (nur der Frontmatter-Block, nicht Beispiele im Text)
  const walkMd = (dir, o = []) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walkMd(p, o);
      else if (e.name.endsWith('.md')) o.push(p);
    }
    return o;
  };
  for (const file of walkMd(path.join(targetDir, 'docs'))) {
    const rel = path.relative(targetDir, file).replace(/\\/g, '/');
    const fm = fs.readFileSync(file, 'utf-8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) continue;
    const idm = fm[1].match(/^id:\s*(.+?)\s*$/m);
    if (!idm) continue;
    const val = idm[1].replace(/^['"]|['"]$/g, '');
    if (bad(val)) report(rel, 'Doku id', val);
  }
  return out;
}

function checkImr(targetDir) {
  const violations = [];
  const add = (file, message) => violations.push({ file, message });
  let inventory = null;
  try {
    ({ inventory } = readRegistry(targetDir));
  } catch (err) {
    return { violations: [{ file: REGISTRY_REL, message: `Registry nicht lesbar: ${err.message}` }] };
  }
  if (!inventory) {
    add(REGISTRY_REL, 'JSON-Inventar (IMR-INVENTORY) fehlt');
    return { violations, tags: [], inventory };
  }

  // Seit dem One-App-Merge (2026-11-08) gibt es nur noch eine App-Shell;
  // der Mehrseiten-Modus teilt sich dasselbe Markup.
  const htmlFiles = ['website/index.html'];
  const html = htmlFiles.map((f) => fs.readFileSync(path.join(targetDir, f), 'utf-8'));
  const htmlAll = html.join('\n');
  const idsPerFile = html.map((h) => new Set([...h.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1])));

  const zones = new Set(inventory.zones || []);
  const systemAtoms = new Set(inventory.systemAtoms || []);
  const allowedUi = new Set(inventory.allowedUiIdentifiers || []);
  const deprecated = new Set(Object.keys(inventory.deprecatedTags || {}));
  const atoms = new Map(Object.entries(inventory.atoms || {}));
  const documentTag = inventory.document;
  const registered = new Set([documentTag, ...zones, ...systemAtoms, ...atoms.keys(), ...allowedUi]);

  if (atoms.size === 0) add(REGISTRY_REL, 'IMR-0 Inventar enthaelt keine Atome (atoms fehlt oder ist leer)');

  for (const [tag, spec] of atoms) {
    // IMR-1: jedes Atom traegt eine DIN-Abschnittsnummer (oder ist bewusst PROJECT)
    if (!spec.dinSection && spec.source !== 'PROJECT') {
      add(REGISTRY_REL, `IMR-1 ${tag}: dinSection fehlt (oder source: "PROJECT")`);
    }

    // IMR-2: id === tag ohne din-Praefix
    const soll = tag.replace(/^din-/, '');
    if (spec.id && spec.id !== soll) {
      add(REGISTRY_REL, `IMR-2 ${tag}: id "${spec.id}" verletzt id === "${soll}"`);
    }

    // IMR-3: Atom mit id muss in beiden HTML-Dateien existieren
    if (spec.id) {
      for (let i = 0; i < htmlFiles.length; i++) {
        if (!idsPerFile[i].has(spec.id)) add(htmlFiles[i], `IMR-3 ${tag}: kein Element mit id="${spec.id}"`);
      }
    }

    // IMR-4: export-Atom braucht ein Eingabeelement mit dieser id.
    // Die Eingabeform steht im Inventar (`eingabe`): "input" (natives Feld,
    // seit Paket A 2026-11-12) oder Default contenteditable.
    if (spec.export && spec.id) {
      const istInput = spec.eingabe === 'input';
      const re = istInput
        ? new RegExp(`<input\\b[^>]*\\sid="${spec.id}"`)
        : new RegExp(`id="${spec.id}"[^>]*contenteditable|contenteditable[^>]*id="${spec.id}"`);
      if (!re.test(htmlAll)) {
        add(htmlFiles[0], `IMR-4 ${tag}: export true, aber kein ${istInput ? '<input>' : 'contenteditable'} mit id="${spec.id}"`);
      }
    }

    // IMR-8: Traeger einer Atom-ID muss das Atom-Tag selbst sein (kein <div id="atom">)
    if (spec.id) {
      for (let i = 0; i < htmlFiles.length; i++) {
        const m = html[i].match(new RegExp(`<([a-z][a-z0-9-]*)\\b[^>]*\\sid="${escapeRe(spec.id)}"`));
        if (!m) continue; // fehlendes Element meldet IMR-3
        /* Zwei zulaessige Traeger: das Atom-Tag selbst oder — wenn das Inventar
           `eingabe: "input"` sagt — ein natives <input>. */
        const erlaubt = m[1] === tag || (spec.eingabe === 'input' && m[1] === 'input');
        if (!erlaubt) {
          add(htmlFiles[i], `IMR-8 ${tag}: ID "${spec.id}" sitzt auf <${m[1]}> statt auf <${tag}> (Komponenten-Regel, ADR-HTML 4.1)`);
        }
      }
    }

    // IMR-6: Kinder eines Containers existieren im HTML
    for (const kind of spec.children || []) {
      if (!new RegExp(`<${kind}[\\s>]`).test(htmlAll)) add(htmlFiles[0], `IMR-6 ${tag}: Kind <${kind}> fehlt im HTML`);
    }
  }

  // IMR-5: veraltete Tags duerfen im HTML nicht mehr vorkommen
  for (const dep of deprecated) {
    if (new RegExp(`<${dep}[\\s>]`).test(htmlAll)) add(htmlFiles[0], `IMR-5 veralteter Tag im HTML: <${dep}>`);
  }

  // IMR-7: Zonen mit id halten dieselbe Invariante
  for (const zone of zones) {
    for (let i = 0; i < htmlFiles.length; i++) {
      const m = html[i].match(new RegExp(`<${zone}\\b[^>]*\\bid="([^"]+)"`));
      const soll = zone.replace(/^din-/, '');
      if (m && m[1] !== soll) add(htmlFiles[i], `IMR-7 ${zone}: id "${m[1]}" verletzt id === "${soll}"`);
    }
  }

  for (const s of systemAtoms) {
    if (!atoms.has(s)) add(REGISTRY_REL, `System-Atom nicht im Inventar: ${s}`);
  }
  for (const [comp, members] of Object.entries(inventory.compositions || {})) {
    for (const m of members) if (!atoms.has(m)) add(REGISTRY_REL, `Komposition ${comp}: kein Atom ${m}`);
  }
  for (const [comp, members] of Object.entries(inventory.compositions || {})) {
    if (!registered.has(comp) && !atoms.get(comp)) {
      // Kompositions-Kennung ist kein Tag, muss aber als Atom existieren (Ein-Zeilen-Form)
      if (![...members].length) add(REGISTRY_REL, `Komposition ${comp}: leer`);
    }
  }
  for (const id of Object.keys(inventory.geometry || {})) {
    if (!registered.has(id)) add(REGISTRY_REL, `Geometrie fuer unbekannten Bezeichner: ${id}`);
  }
  for (const a of inventory.forbiddenAliases || []) {
    if (registered.has(a)) add(REGISTRY_REL, `Verbotener Alias ist als Tag registriert: ${a}`);
  }

  // 1) Website-Code darf nur registrierte din-* verwenden (veraltete nicht mehr).
  for (const file of walkCode(path.join(targetDir, 'website'))) {
    const rel = path.relative(targetDir, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf-8')
      .replace(/\[\[[^\]]*\]\]/g, '')
      .replace(/@(guide|adr)\b[^\n]*/g, '');
    for (const mm of content.matchAll(/<din-[a-z0-9-]+|\bdin-[a-z0-9-]+/g)) {
      const tag = mm[0].replace(/^</, '');
      if (!registered.has(tag)) add(rel, `Nicht registrierter din-Bezeichner (IMR ist SSOT): ${tag}`);
    }
  }

  // 2) DIN-Geometrie ist SSoT in website/css/base.css ("2a. DIN-5008-GEOMETRIE").
  //    Das <din-blatt> traegt seit 2026-11-20 keine data-*-Geometrie mehr.
  const cssRel = 'website/css/base.css';
  const cssSrc = fs.readFileSync(path.join(targetDir, cssRel), 'utf-8');
  const cssTokens = Object.fromEntries(
    [...cssSrc.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;{}]+);/g)].map((x) => [x[1], x[2].trim()])
  );
  for (const [k, v] of Object.entries(expectedCssTokens(inventory))) {
    if (!(k in cssTokens)) add(cssRel, `Geometrie-Token fehlt (aus Registry): ${k}`);
    else if (Number(cssTokens[k]) !== Number(v)) add(cssRel, `${k}: ${cssTokens[k]} weicht von Registry (${v}) ab`);
  }
  const htmlPath = path.join(targetDir, 'website/index.html');
  const htmlMain = fs.readFileSync(htmlPath, 'utf-8');
  const blatt = htmlMain.match(/<(din-blatt|din-a4)\b[^>]*>/);
  if (!blatt) add('website/index.html', `<${documentTag}> nicht gefunden`);
  else {
    const alteGeometrie = /\sdata-(?:width-mm|height-mm|lochmarke-y|(?:briefkopf|anschriftfeld|infoblock|kern)-y-[ab]|falzmarke-[12]-y-[ab])\s*=/;
    if (alteGeometrie.test(blatt[0])) {
      add('website/index.html', 'data-*-Geometrie am <din-blatt> ist verboten — SSoT sind die Tokens in website/css/base.css');
    }
  }

  // 2b) CSS darf die Geometrie nicht zurueck an HTML-Attribute binden.
  const attrGeometrie = /attr\(\s*data-(?:width-mm|height-mm|lochmarke-y|(?:briefkopf|anschriftfeld|infoblock|kern)-y-[ab]|falzmarke-[12]-y-[ab])/;
  for (const f of ['website/css/sheet-common.css', 'website/css/sheet.css', 'website/css/sheet-multipage.css']) {
    const src = fs.readFileSync(path.join(targetDir, f), 'utf-8');
    if (attrGeometrie.test(src)) add(f, 'attr(data-…)-Geometrie verboten — Tokens aus base.css lesen');
  }

  // 2c) DIN-5008-Bypass-Schutz: Zonen- und Markenkoordinaten duerfen in den
  //     Blatt-Stylesheets nicht roh in Millimetern stehen. SSoT sind die
  //     --geometrie-*-Token aus website/css/base.css. Ausgenommen sind @page
  //     (Papierrand) und die Blattmasse 210mm/297mm (din-blatt).
  const RAW_GEOMETRIE_MM = ['27', '45', '28.9', '45.8', '87', '105', '148.5', '192'];
  const rawMmRe = new RegExp(`(?<![\\w.])(?:${RAW_GEOMETRIE_MM.map(escapeRe).join('|')})mm\\b`, 'g');
  for (const f of ['website/css/sheet-common.css', 'website/css/sheet-multipage.css']) {
    const p = path.join(targetDir, f);
    if (!fs.existsSync(p)) continue;
    const lines = maskCssBlocks(maskCssComments(fs.readFileSync(p, 'utf-8')), /@page\b/).split('\n');
    lines.forEach((line, idx) => {
      const hit = line.match(rawMmRe);
      if (hit) {
        add(f, `DIN-5008-Bypass: roher Millimeterwert "${hit[0]}" fuer Zone/Marke in Zeile ${idx + 1} — var(--geometrie-…) verwenden (SSoT: website/css/base.css)`);
      }
    });
  }

  // 3) Kanonisches Vokabular (IMR vocabulary-Block)
  for (const v of checkVocabulary(targetDir, inventory)) add(v.file, v.message);

  // 4) Case Contract (HTML/CSS kebab-case)
  for (const v of checkCase(targetDir, inventory)) add(v.file, v.message);

  return { violations, tags: [...registered], inventory };
}




return { checkImr, checkVocabulary, checkCase, expectedCssTokens, REGISTRY_REL };
})();
export const { checkImr, checkVocabulary, checkCase, expectedCssTokens, REGISTRY_REL } = imr;

/* ==================================================================
   3. Structural Laws (A42, A57, A58, A24, A59)
   ================================================================== */
const structuralLaws = (() => {
/**
 * tools/laws/structural-laws.js — Strukturprüfungen für Gesetze, die keine einfache Textregex sind.
 *
 * Durchgesetzt werden:
 *   - A42: keine doppelten IDs im Produkt-HTML
 *   - A57: keine binären Radio-Gruppen als Schalter (Ausnahme: Form A/B ist Dokumentenmodus)
 *   - A58: keine Radio-Segmented-Controls für Theme-Wahl (zyklischer Toggle Pflicht)
 *   - A24: keine CSS-Token ohne Definition in :root oder ohne Fallback
 *   - A59: keine Theme-Variablen (--text-primary, --bg-surface etc.) auf dem DIN-A4-Blatt
 *          (sheet.css, sheet-common.css, sheet-multipage.css; #viewport ausgenommen,
 *          weil das der Schreibtisch ist und kein A4-Blatt)
 *   - DIN-Strukturgesetze: zwingende Custom Elements und Kern-Atome in website/index.html,
 *          dazu ein Div-Budget (gesamt und auf <din-blatt>), damit semantisches HTML
 *          nicht durch <div>-Suppe ersetzt wird
 */




/** Maskiert CSS-Kommentare, ohne Zeilennummern zu verschieben. */
function maskCssComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

/**
 * Maskiert alle Bloecke, deren Selektor `#viewport` enthaelt, samt Kindbloecken.
 * A59 gilt nur fuer das A4-Blatt; `#viewport` ist der Schreibtisch (dort sind
 * etwa Scrollbalken-Farben aus dem UI-Theme legitim).
 */
function maskViewportBlocks(src) {
  const out = src.split('');
  const stack = [];
  let selectStart = 0;
  let insideMasked = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') {
      const selector = src.slice(selectStart, i);
      const masked = insideMasked || /#viewport\b/.test(selector);
      stack.push(masked);
      insideMasked = masked;
      if (masked) out[i] = ' ';
      selectStart = i + 1;
    } else if (ch === '}') {
      stack.pop();
      insideMasked = stack.length > 0 ? stack[stack.length - 1] : false;
      if (insideMasked) out[i] = ' ';
      selectStart = i + 1;
    } else if (ch === ';') {
      selectStart = i + 1;
    } else if (insideMasked && ch !== '\n') {
      out[i] = ' ';
    }
  }
  return out.join('');
}

function checkStructuralLaws(repoRoot) {
  const violations = [];
  const htmlFile = path.join(repoRoot, 'website/index.html');
  if (!fs.existsSync(htmlFile)) {
    return [{ file: 'website/index.html', line: 1, message: 'Produkt-HTML fehlt.' }];
  }

  // --- HTML-Struktur: A42, A57, A58 ---
  const htmlText = fs.readFileSync(htmlFile, 'utf8');
  const ids = new Map();
  const radioGroups = new Map();
  const tagRe = /<([a-z][\w-]*)\b[^>]*>/gi;
  let match;

  while ((match = tagRe.exec(htmlText))) {
    const tag = match[0];
    const line = htmlText.slice(0, match.index).split('\n').length;

    // A42: Eindeutige ID
    const id = tag.match(/\bid\s*=\s*["']([^"']+)["']/i)?.[1];
    if (id) {
      if (ids.has(id)) {
        violations.push({ file: 'website/index.html', line, message: `A42: doppelte id "${id}" (zuvor Zeile ${ids.get(id)}).` });
      } else {
        ids.set(id, line);
      }
    }

    // Radio-Erkennung fuer A57 & A58
    if (tag.toLowerCase().startsWith('<input') && /\btype\s*=\s*["']radio["']/i.test(tag)) {
      const name = tag.match(/\bname\s*=\s*["']([^"']+)["']/i)?.[1];
      if (name) {
        if (!radioGroups.has(name)) radioGroups.set(name, []);
        radioGroups.get(name).push({ line, tag });

        // A58: Theme-Wahl als Radio
        if (/(theme|erscheinungsbild|dark-?mode|farbschema)/i.test(name)) {
          violations.push({ file: 'website/index.html', line, message: `A58: Theme-Wahl als Radio-Gruppe "${name}" — zyklischer Toggle (#btn-theme-toggle) ist Pflicht.` });
        }
      }
    }
  }

  // A57: Binäre Radio-Gruppe als Schalter.
  // Ausnahmen sind in A57 (Immutable-Law-Catalog) fachlich begründet und hier
  // absichtlich namentlich genannt — nicht als Regex, damit jede neue Gruppe
  // sichtbar durch diese Liste muss:
  //   layout-form   Dokumentenmodus (Form A/B), blattwirksam, Bestandsschutz
  //   ansicht-modus Ansichtswechsel (Brief | Einstellungen): Wahl des Inhalts,
  //                 keine Einstellung; Zustand steckt im Namen (WCAG 2.5.3)
  const A57_AUSNAHMEN = new Set(['layout-form', 'ansicht-modus']);
  for (const [name, radios] of radioGroups) {
    if (radios.length === 2 && !A57_AUSNAHMEN.has(name)) {
      violations.push({ file: 'website/index.html', line: radios[0].line, message: `A57: binäre Radio-Gruppe "${name}" als Schalter — Checkbox switch verwenden oder fachlich begründete Ausnahme dokumentieren.` });
    }
  }

  // --- DIN-Strukturgesetze: Zwingende Pflicht-Elemente in website/index.html ---
  const PFLICHT_CUSTOM_ELEMENTS = [
    'din-blatt',
    'din-briefkopf',
    'din-anschriftfeld',
    'din-infoblock',
    'din-kern',
    'din-geschaeftsangaben',
    'din-falzmarke-1',
    'din-falzmarke-2',
    'din-lochmarke',
    'din-text',
    'din-seitennummerierung'
  ];
  for (const tag of PFLICHT_CUSTOM_ELEMENTS) {
    const re = new RegExp(`<${tag}\\b`, 'i');
    if (!re.test(htmlText)) {
      violations.push({
        file: 'website/index.html',
        line: 1,
        message: `DIN-Strukturgesetz verletzt: Zwingendes Custom Element <${tag}> fehlt in website/index.html.`
      });
    }
  }

  const PFLICHT_KERN_ATOME = ['betreff', 'anrede', 'datum', 'text', 'grussformel'];
  for (const id of PFLICHT_KERN_ATOME) {
    if (!ids.has(id)) {
      violations.push({
        file: 'website/index.html',
        line: 1,
        message: `DIN-Strukturgesetz verletzt: Zwingendes Kern-Atom id="${id}" fehlt in website/index.html.`
      });
    }
  }

  // --- Div-Budget-Ratsche (Schutz vor Div-Suppe) ---
  const MAX_DIVS_GESAMT = 20;
  const alleDivs = htmlText.match(/<div\b/gi) || [];
  if (alleDivs.length > MAX_DIVS_GESAMT) {
    violations.push({
      file: 'website/index.html',
      line: 1,
      message: `Div-Suppen-Alarm: ${alleDivs.length} <div>-Tags gefunden (Budget-Deckel ist ${MAX_DIVS_GESAMT}). Bitte semantisches HTML oder <seitenleiste-*>-Elemente nutzen.`
    });
  }

  // --- Checkbox-Ratsche: alle Checkboxen muessen haptische Rast-Buttons sein (.sr-only + .btn-latch) ---
  const rawCheckboxMatch = htmlText.match(/<input[^>]*type=["']checkbox["'](?![^>]*class=["'][^"']*\bsr-only\b)[^>]*>/gi);
  if (rawCheckboxMatch) {
    violations.push({
      file: 'website/index.html',
      line: 1,
      message: `Checkbox-Ratsche verletzt: ${rawCheckboxMatch.length} nackte Checkbox(en) gefunden. Alle Schalter müssen als haptische Rast-Buttons (<seitenleiste-ratsche> mit .sr-only und .btn-latch) ausgeführt sein.`
    });
  }

  const blattMatch = htmlText.match(/<din-blatt[\s\S]*?<\/din-blatt>/i);
  if (blattMatch) {
    const blattDivs = blattMatch[0].match(/<div\b/gi) || [];
    const MAX_BLATT_DIVS = 10;
    if (blattDivs.length > MAX_BLATT_DIVS) {
      violations.push({
        file: 'website/index.html',
        line: 1,
        message: `Div-Suppen-Alarm auf DIN-Blatt: ${blattDivs.length} <div>-Tags in <din-blatt> gefunden (Budget-Deckel ist ${MAX_BLATT_DIVS}). Auf dem Briefbogen sind ausschliesslich semantische Tags und <din-*>-Elemente erlaubt.`
      });
    }
  }

  // --- CSS-Struktur: A24 & A59 ---
  const cssDir = path.join(repoRoot, 'website/css');
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir).filter((f) => f.endsWith('.css'));
    const declaredTokens = new Set();

    // 1. Alle in :root deklarierten Token sowie Parameter von @function erfassen
    for (const f of cssFiles) {
      const content = fs.readFileSync(path.join(cssDir, f), 'utf8');
      for (const m of content.matchAll(/(?:--[a-zA-Z0-9_-]+)\s*:/g)) {
        declaredTokens.add(m[0].split(':')[0].trim());
      }
      for (const m of content.matchAll(/@function\s+--[a-zA-Z0-9_-]+\s*\(\s*(--[a-zA-Z0-9_-]+)\s*\)/g)) {
        declaredTokens.add(m[1].trim());
      }
    }

    // 2. A24: Nicht-deklarierte var() ohne Fallback pruefen
    for (const f of cssFiles) {
      const lines = fs.readFileSync(path.join(cssDir, f), 'utf8').split('\n');
      lines.forEach((l, idx) => {
        for (const m of l.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,([^)]+))?\)/g)) {
          const token = m[1];
          const hasFallback = !!m[2];
          if (!declaredTokens.has(token) && !hasFallback) {
            violations.push({ file: `website/css/${f}`, line: idx + 1, message: `A24: CSS-Token "${token}" ohne :root-Definition oder Fallback verwendet.` });
          }
        }
      });
    }

    // 3. A59: Theme-abhängige UI-Variablen auf dem DIN-A4-Blatt pruefen.
    //    Gilt fuer alle Blatt-Stylesheets; #viewport wird maskiert (Schreibtisch,
    //    kein Papier). Kommentare zaehlen nicht als Verwendung.
    const themeVarRe = /var\(\s*--(text-primary|text-muted|text-secondary|bg-surface|bg-viewport|bg-card|bg-seitenleiste|border-color)\b/g;
    for (const name of ['sheet.css', 'sheet-common.css', 'sheet-multipage.css']) {
      const sheetFile = path.join(cssDir, name);
      if (!fs.existsSync(sheetFile)) continue;
      const sheetLines = maskViewportBlocks(maskCssComments(fs.readFileSync(sheetFile, 'utf8'))).split('\n');
      sheetLines.forEach((l, idx) => {
        for (const m of l.matchAll(themeVarRe)) {
          violations.push({ file: `website/css/${name}`, line: idx + 1, message: `A59: Theme-Variable "--${m[1]}" auf dem DIN-A4-Blatt verwendet. Blatt muss papier-eigene Token (--blatt-*) nutzen.` });
        }
      });
    }
    // 4. DIN 5008 § 19.9 & Schreibstabilität: Flatterrand-Pflicht (text-align: left) für #text
    for (const name of ['sheet.css', 'sheet-multipage.css']) {
      const sheetFile = path.join(cssDir, name);
      if (!fs.existsSync(sheetFile)) continue;
      const content = fs.readFileSync(sheetFile, 'utf8');
      const textBlockMatch = content.match(/#text\s*\{[^}]*\}/s);
      if (textBlockMatch && textBlockMatch[0].includes('text-align: justify')) {
        violations.push({
          file: `website/css/${name}`,
          line: 1,
          message: 'DIN-Strukturgesetz verletzt: #text darf niemals text-align: justify (Blocksatz) nutzen. Pflicht ist DIN-5008-Flatterrand (text-align: left).'
        });
      }
    }
  }

  return violations;
}




return { checkStructuralLaws };
})();
export const { checkStructuralLaws } = structuralLaws;

/* ==================================================================
   4. Isolation Gate (A45 / A38)
   ================================================================== */
const isolation = (() => {
/**
 * tools/laws/isolation.js — Hermetik-Gate fuer `website/` (Catalog A45)
 *
 * A45 ("projektfremde Pfade/Kontexte in der App -- hermetische Grenzen") stand seit
 * 2026-06 im Law Catalog, wurde aber von nichts geprueft. Dieses Modul macht daraus
 * eine Invariante: `website/` muss sich OHNE jeden anderen Ordner des Repositories
 * ausliefern und starten lassen -- kopiert man den Ordner allein auf einen Webserver,
 * darf nichts fehlen.
 *
 * Geprueft wird jede Referenz in website/**.{html,css,js}:
 *   1. kein Pfad, der aus `website/` herausfuehrt (`../..`, `/docs/`, `/tools/`)
 *   2. keine absoluten Dateisystempfade (`C:\...`, `/home/...`)
 *   3. keine ladenden Verweise auf fremde Hosts (A38) -- die Allowlist gilt nur
 *      fuer optionale Fach-APIs per fetch(), nie fuer Script/Style/Font/Bild.
 *
 * AUSDRUECKLICH ERLAUBT: `@adr [[Doc]]` / `@guide [[Doc]]` in Kommentaren. Das ist
 * Traceability, kein Ladevorgang -- sie haben null Laufzeitwirkung. Umgekehrt prueft
 * tools/links.js, dass diese Dokumente existieren. Beide Richtungen zusammen:
 * Doku darf verschwinden, ohne dass die App bricht; sie soll es aber nicht unbemerkt.
 *
 * Aufrufvertrag wie tools/links.js und tools/imr.js:
 *   checkIsolation(targetDir) -> { violations: [{file, line, message}], filesChecked }
 */




/** Hosts, die als optionale Fach-API per fetch() erlaubt sind (Catalog A38). */
const API_ALLOWLIST = ['api.geoapify.com', 'photon.komoot.io', 'api.zippopotam.us'];

/** Attribute, die tatsaechlich eine Ressource LADEN (im Gegensatz zu <a href>). */
const LOADING_ATTR = /\b(?:src|srcset|data-src)\s*=\s*["']([^"']+)["']|<link\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi;

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(html|css|js)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

/** Fuehrt ein relativer Pfad aus `website/` heraus? */
function escapesRoot(ref, fileRelDir) {
  if (/^(https?:|data:|mailto:|#|javascript:)/i.test(ref)) return false;
  if (ref.startsWith('/')) return true;                 // absolut = verlaesst den Ordner
  const resolved = path.posix.normalize(path.posix.join(fileRelDir, ref));
  return resolved.startsWith('..');
}

/**
 * @param {string} targetDir
 * @returns {{violations: {file: string, line: number, message: string}[], filesChecked: number}}
 */
function checkIsolation(targetDir) {
  const violations = [];
  const root = path.join(targetDir, 'website');
  if (!fs.existsSync(root)) return { violations, filesChecked: 0 };

  const files = walk(root);

  for (const abs of files) {
    const rel = path.relative(targetDir, abs).replace(/\\/g, '/');
    const relDir = path.posix.dirname(rel.replace(/^website\//, ''));
    const lines = fs.readFileSync(abs, 'utf8').split(/\r?\n/);

    lines.forEach((line, i) => {
      const ln = i + 1;

      // (2) absolute Dateisystempfade
      const fsPath = line.match(/["'](?:[A-Za-z]:\\|\/(?:home|Users|mnt|var)\/)[^"']*["']/);
      if (fsPath) {
        violations.push({ file: rel, line: ln, message: `A45: absoluter Dateisystempfad ${fsPath[0]}` });
      }

      // (1) Pfade, die website/ verlassen -- import/from/url()
      const refRe = /(?:from\s*|import\s*\(\s*|url\(\s*)["']([^"']+)["']/g;
      let m;
      while ((m = refRe.exec(line)) !== null) {
        const ref = m[1];
        if (/^https?:/i.test(ref)) {
          const host = (ref.match(/^https?:\/\/([^/]+)/) || [])[1] || '';
          if (!API_ALLOWLIST.includes(host)) {
            violations.push({ file: rel, line: ln, message: `A38/A45: fremder Host "${host}" nicht in der Allowlist` });
          }
          continue;
        }
        if (escapesRoot(ref, relDir)) {
          violations.push({ file: rel, line: ln, message: `A45: Referenz "${ref}" fuehrt aus website/ heraus` });
        }
      }

      /* (1b) fetch(): A45-Praezisierung 2026-11-22.
       *
       * Ein `fetch('/pfad')` laedt KEINE Datei aus dem Repository. Es fragt den
       * Server, der `website/` ausliefert, nach einem URL-Pfad. Kopiert man den
       * Ordner allein auf einen fremden Webserver, antwortet der Pfad mit 404 —
       * und die App laeuft vollstaendig weiter, weil der Aufruf optional ist.
       * Die Isolation (A45) ist damit nicht beruehrt.
       *
       * Verboten bleiben hier: fremde Hosts (A38-Allowlist), absolute
       * Dateisystempfade (Regel 2 oben) und `../..`, weil das auch als URL aus
       * dem ausgelieferten Ordner herauszeigt. */
      const fetchRe = /\bfetch\(\s*(?:new\s+URL\(\s*)?["']([^"']+)["']/g;
      let f;
      while ((f = fetchRe.exec(line)) !== null) {
        const ref = f[1];
        if (/^https?:/i.test(ref)) {
          const host = (ref.match(/^https?:\/\/([^/]+)/) || [])[1] || '';
          if (!API_ALLOWLIST.includes(host)) {
            violations.push({ file: rel, line: ln, message: `A38: fremder Host "${host}" nicht in der Allowlist` });
          }
          continue;
        }
        if (ref.startsWith('/')) continue; // Same-Origin-URL-Pfad, kein Repo-Pfad
        const resolved = path.posix.normalize(path.posix.join(relDir, ref));
        if (resolved.startsWith('..')) {
          violations.push({ file: rel, line: ln, message: `A45: fetch("${ref}") zeigt aus website/ heraus` });
        }
      }

      // (3) ladende Attribute in HTML
      LOADING_ATTR.lastIndex = 0;
      let a;
      while ((a = LOADING_ATTR.exec(line)) !== null) {
        if (/\brel\s*=\s*["']canonical["']/i.test(line)) continue;
        const ref = a[1] || a[2];
        if (!ref || /^data:/i.test(ref)) continue;
        if (/^https?:/i.test(ref)) {
          const host = (ref.match(/^https?:\/\/([^/]+)/) || [])[1] || '';
          violations.push({ file: rel, line: ln, message: `A38: ladender Verweis auf externen Host "${host}" (Script/Style/Font/Bild duerfen NIE extern sein)` });
          continue;
        }
        if (escapesRoot(ref, relDir)) {
          violations.push({ file: rel, line: ln, message: `A45: geladene Ressource "${ref}" liegt ausserhalb von website/` });
        }
      }
    });
  }

  return { violations, filesChecked: files.length };
}




return { checkIsolation };
})();
export const { checkIsolation } = isolation;

/* ==================================================================
   5. Links Gate
   ================================================================== */
const links = (() => {
/**
 * tools/laws/links.js — Link-Kohärenz-Gate (Regel `links`, severity critical).
 *
 * Prüft in allen Markdown-Dateien:
 *  - inline Wikilinks `[[Ziel]]` (inkl. `|Alias` und `#Anker`)
 *  - Frontmatter-Listen `doc_links`, `depends_on`, `supersedes`
 * gegen die real existierenden Datei-Namen (Basenames) im Repository.
 *
 * Ausgenommen (bewusst, siehe skills/architecture-drift-audit/references/aufraeum-playbook.md):
 *  - Code-Fences (Beispiel-Snippets)
 *  - Inline-Code-Spans (`[[…]]` in Backticks = Beispiel-Syntax)
 *  - Template-Platzhalter (ADR-XXX, ADR-YYY, _Template_Obsidian, ...)
 *  - Chroniken (DECISION-LOG, CHANGELOG) und docs/90-archive/
 *  - generierte Artefakte (Code-Referenzen, Function-Traceability)
 *  - `supersedes` (Lineage: verweist bewusst auf ersetzte/entfernte Alt-Dokumente)
 *
 * @adr [[ADR-OMNITRACEABILITY]]
 */



const IGNORE_DIRS = ['.git', 'node_modules', 'venv', 'cache', '.agents', '.opencode', '.claude', '.trash', 'Papierkorb'];
const STRIP_EXT = /\.(md|json|js|css|html|canvas|ya?ml)$/i;
const PLACEHOLDER = /^(adr-x+$|adr-y+$|_template|\.{3}|…)$/i;
const SCAN_SKIP = [
  'docs/meta/DECISION-LOG.md',
  'docs/meta/DECISION-LOG-2026-H1.md',
  'docs/archive/CHANGELOG.md',
];

const FM_KEYS = ['doc_links', 'code_links', 'depends_on'];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!IGNORE_DIRS.includes(e.name)) walk(path.join(dir, e.name), out);
    } else {
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

function resolves(target, targetDir, stems) {
  /* Frontmatter-Links tragen teils [[Klammern]] (Obsidian-Stil), teils nicht.
   * Ohne dieses Strippen wurden sie je nach Einrueckung stillschweigend
   * uebersprungen — ein Gate, das Links nicht prueft, ist keins. */
  const clean = target.replace(/^\[\[|\]\]$/g, '').replace(STRIP_EXT, '');
  if (target.includes('/')) {
    return (
      fs.existsSync(path.join(targetDir, target)) ||
      fs.existsSync(path.join(targetDir, target + '.md')) ||
      stems.has(path.basename(clean))
    );
  }
  return stems.has(clean);
}

/** code_links sind Dateipfade: relativ zur Repo-Wurzel ODER zum Dokument. */
function resolvesPath(target, targetDir, absFile) {
  const cands = [path.join(targetDir, target), path.join(path.dirname(absFile), target)];
  return cands.some((p) => fs.existsSync(p) || fs.existsSync(p + '.md'));
}

function scanWikilinks(content) {
  const out = [];
  let inFence = false;
  content.split(/\r?\n/).forEach((line, i) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    const clean = line.replace(/`[^`]*`/g, ' ');
    for (const m of clean.matchAll(/\[\[([^\]]+)\]\]/g)) {
      const raw = m[1].split('|')[0].split('#')[0].trim();
      if (raw) out.push({ target: raw, line: i + 1 });
    }
  });
  return out;
}

function scanFrontmatterLinks(content) {
  const out = [];
  const fm = content.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return out;
  let key = null;
  for (const line of fm[1].split(/\r?\n/)) {
    const head = line.match(/^([A-Za-z_]+)\s*:\s*(.*)$/);
    if (head) {
      const k = head[1].toLowerCase();
      key = FM_KEYS.includes(k) ? k : null;
      const inline = head[2].trim();
      if (key && inline && inline !== '[]') {
        for (const it of inline.replace(/^\[|\]$/g, '').split(',')) {
          const t = it.trim().replace(/['"]/g, '');
          if (t) out.push({ target: t, key });
        }
      }
      continue;
    }
    if (line.trim() === '') continue;
    if (!/^\s/.test(line)) {
      key = null;
      continue;
    }
    if (key) {
      const item = line.match(/^\s*-\s+(.+)$/);
      if (item) out.push({ target: item[1].trim().replace(/['"]/g, ''), key });
    }
  }
  return out;
}

function checkLinks(targetDir) {
  const violations = [];
  const allFiles = walk(targetDir);
  const stems = new Set(allFiles.map((f) => path.basename(f).replace(/\.[^.]+$/, '')));

  // --- Code-Referenzen (@adr/@guide [[Doc]]) --------------------------------
  // Ohne das sind die vom Code referenzierten Dokumente nur SCHEINBAR geschuetzt:
  // bis 2026-10-02 fiel ihr Verschwinden lediglich auf, weil zufaellig auch andere
  // Markdown-Dateien auf sie verlinkten. `geoapify-autocomplete` haing an genau EINEM
  // solchen Verweis -- waere der entfallen, haette das Gate die Loeschung geschluckt,
  // obwohl zwei Code-Stellen das Dokument brauchen.
  for (const abs of allFiles) {
    const rel = path.relative(targetDir, abs).replace(/\\/g, '/');
    if (!/^website\/.*\.(js|css|html)$/.test(rel)) continue;
    const content = fs.readFileSync(abs, 'utf8');
    const re = /@(adr|guide)\s+\[\[([^\]]+)\]\]/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      const target = m[2].split('|')[0].split('#')[0].trim();
      if (PLACEHOLDER.test(target)) continue;
      if (!resolves(target, targetDir, stems)) {
        const line = content.slice(0, m.index).split('\n').length;
        violations.push({
          file: rel,
          message: `Code referenziert fehlendes Dokument: @${m[1]} [[${target}]] (Zeile ${line})`
        });
      }
    }
  }

  for (const abs of allFiles) {
    const rel = path.relative(targetDir, abs).replace(/\\/g, '/');
    if (!rel.endsWith('.md')) continue;
    if (rel.includes('archive/') || rel.includes('audit/') || SCAN_SKIP.includes(rel)) continue;

    const content = fs.readFileSync(abs, 'utf8');

    for (const { target, line } of scanWikilinks(content)) {
      if (PLACEHOLDER.test(target)) continue;
      if (!resolves(target, targetDir, stems)) {
        violations.push({ file: rel, message: `Toter Wikilink [[${target}]] (Zeile ${line})` });
      }
    }

    for (const { target, key } of scanFrontmatterLinks(content)) {
      if (PLACEHOLDER.test(target)) continue;
      const ok = key === 'code_links'
        ? resolvesPath(target, targetDir, abs)
        : resolves(target, targetDir, stems);
      if (!ok) {
        violations.push({ file: rel, message: `Toter Frontmatter-${key}: "${target}"` });
      }
    }
  }

  return { violations };
}


return { checkLinks };
})();
export const { checkLinks } = links;

/* ==================================================================
   6. Terminology Gate
   ================================================================== */
const terminology = (() => {
/**
 * tools/laws/terminology.js — Terminologie-Gate ("Ein Sachverhalt, ein Begriff")
 *
 * Prueft, dass in lebenden Dokumenten keine verdraengte Begriffsvariante steht.
 *
 * ENTWURFSPRINZIP: Die Begriffsliste wird NICHT hier gepflegt, sondern aus der
 * Tabelle "Kanonische Begriffe" in docs/20-implementation/glossary.md geparst.
 * Sonst waere dieses Modul selbst die zweite Kopie des Kanons -- genau der Fehler,
 * den die Regel verhindern soll (AGENTS.md 5.1 "Ein Fakt, ein Ort").
 *
 * Aufrufvertrag wie tools/links.js und tools/imr.js:
 *   checkTerminology(targetDir) -> { violations: [{file, line, found, canonical}], canonCount }
 */





const GLOSSARY = 'docs/norm/glossary.md';

/** Dateien, die bewusst ungeprueft bleiben. */
const EXCLUDED = [
  'docs/archive/',               // eingefroren (status: archived)
  'docs/meta/DECISION-LOG.md',   // append-only Chronik, Alteintraege sind Zeitdokumente
  'docs/meta/DECISION-LOG-2026-H1.md', // ausgelagertes Archiv H1 2026
  'docs/norm/din5008.md',        // wortgetreues Normzitat (DIN 5008) -- Quelle, kein Fliesstext von uns
  'research/',                   // Laborarchiv
  '.trash/',                     // Gelöschte/ausgemusterte Altlasten
  'Papierkorb/',
  GLOSSARY,                      // enthaelt die verdraengten Varianten per Definition
  'tools/terminology.js'
];

/**
 * Liest die Kanon-Tabelle aus dem Glossar.
 * Erwartetes Zeilenformat: | **Kanonisch** | Variante, Variante | Beschreibung |
 * @param {string} targetDir
 * @returns {{canonical: string, variants: string[]}[]}
 */
function parseCanon(targetDir) {
  const file = path.join(targetDir, GLOSSARY);
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, 'utf-8').split(/\r?\n/);

  const start = lines.findIndex(l => /^##\s.*Kanonische Begriffe/.test(l));
  if (start === -1) return [];
  // Nur bis zur naechsten H2/H3 lesen -- die "nicht zusammenlegen"-Tabelle
  // darunter ist bewusst KEINE Verbotsliste.
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^###?\s/.test(lines[i])) { end = i; break; }
  }

  const entries = [];
  for (const line of lines.slice(start, end)) {
    const m = line.match(/^\|\s*\*\*(.+?)\*\*.*?\|\s*(.+?)\s*\|/);
    if (!m) continue;
    const canonical = m[1].replace(/\(.*?\)/g, '').trim();
    const variants = m[2]
      .split(',')
      .map(v => v.replace(/\(.*?\)/g, '').replace(/[*`]/g, '').trim())
      .filter(v => v && v !== '—' && !/^siehe/i.test(v));
    if (variants.length) entries.push({ canonical, variants });
  }
  return entries;
}

/**
 * @param {string} targetDir
 * @returns {{violations: {file: string, line: number, found: string, canonical: string}[], canonCount: number}}
 */
function checkTerminology(targetDir) {
  const canon = parseCanon(targetDir);
  const violations = [];
  if (canon.length === 0) return { violations, canonCount: 0 };

  let tracked = [];
  try {
    tracked = execSync('git ls-files "*.md"', { cwd: targetDir, encoding: 'utf-8' })
      .split('\n').map(s => s.trim()).filter(Boolean);
  } catch {
    return { violations, canonCount: canon.length };
  }

  const files = tracked.filter(f => !EXCLUDED.some(ex => f === ex || f.startsWith(ex)));

  for (const rel of files) {
    const abs = path.join(targetDir, rel);
    let lines;
    try {
      lines = fs.readFileSync(abs, 'utf-8').split(/\r?\n/);
    } catch { continue; }

    let inCode = false;
    lines.forEach((line, i) => {
      if (/^\s*```/.test(line)) { inCode = !inCode; return; }
      if (inCode) return;                     // Codebloecke sind keine Prosa
      const prose = line.replace(/`[^`]*`/g, ''); // Inline-Code ausblenden

      for (const { canonical, variants } of canon) {
        for (const variant of variants) {
          const re = new RegExp(`(^|[^\\w-])${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`, 'i');
          if (re.test(prose)) {
            violations.push({ file: rel, line: i + 1, found: variant, canonical });
          }
        }
      }
    });
  }

  return { violations, canonCount: canon.length };
}




return { checkTerminology, parseCanon };
})();
export const { checkTerminology, parseCanon } = terminology;

/* ==================================================================
   7. Law Coverage Meta-Gate
   ================================================================== */
const lawcoverage = (() => {
/**
 * tools/laws/lawcoverage.js — prueft die Pruefer (Meta-Gate ueber den Law Catalog)
 *
 * ANLASS: Dreimal in Folge stellte sich heraus, dass eine Norm des Katalogs von
 * nichts geprueft wurde (@adr-Dokumentenschutz, Terminologie, A45). Die Inventur
 * vom 2026-10-02 fand zusaetzlich drei Defekte einer neuen Klasse: Sonden, die
 * eine Gesetzesnummer BEANSPRUCHEN, die es nicht gibt (A16/A20), Sonden, die ein
 * Gesetz beanspruchen und nichts pruefen (leeres Pattern), und Sonden, die ein
 * Gesetz tatsaechlich durchsetzen, es aber nicht benennen (leeres catalog_ref).
 *
 * Alle drei sind derselbe Fehler: die Verbindung zwischen Norm und Pruefung ist
 * unbelegt. Dieses Modul macht sie belegbar.
 *
 * GEPRUEFT WIRD (harte Verstoesse):
 *   1. Jede `catalog_ref` in tools/antipatterns/*.json zeigt auf eine ID, die es
 *      im Immutable Law Catalog wirklich gibt.
 *   2. Keine Sonde beansprucht ein Gesetz, ohne es zu pruefen: wer `catalog_ref`
 *      setzt und `check: "regex"` fuehrt, braucht ein nicht-leeres `pattern`.
 *   3. Eine Sonde, die ein HARD-BAN-Gesetz prueft, darf nicht als `info`
 *      eingestuft sein — sonst bleibt der Verstoss folgenlos.
 *
 * BEWUSST NUR BERICHTET, NICHT ERZWUNGEN: die Abdeckungsquote. Viele Gesetze sind
 * nicht per Regex pruefbar (A43 "unkontrolliertes Scrolling", A47 "komplexe UI in
 * contenteditable"). Ein Gate, das 100 % Abdeckung fordert, erzwaenge Schein-Sonden
 * — genau das Gegenteil des Ziels. Die Quote steht im Log, damit sie nicht
 * unsichtbar verfaellt.
 *
 * Aufrufvertrag wie tools/isolation.js, tools/links.js, tools/imr.js:
 *   checkLawCoverage(repoRoot) -> { violations: [{file, line, message}], filesChecked, coverage }
 */





const CATALOG = 'docs/norm/Immutable-Law-Catalog.md';
const PROBE_DIR = 'tools/antipatterns';

/**
 * Gesetze, die kein Regex-Pattern durchsetzt, sondern ein eigenes Modul. Diese
 * Liste ist bewusst kurz und handgefuehrt: ein Modul hier einzutragen, ohne dass
 * es die Norm wirklich prueft, waere derselbe Selbstbetrug, den dieses Werkzeug
 * verhindern soll. Jeder Eintrag braucht einen Gegentest im DECISION-LOG.
 */
const TOOL_ENFORCED = {
  A45: 'tools/isolation.js',
  A42: 'tools/structural-laws.js',
  A57: 'tools/structural-laws.js',
  A58: 'tools/structural-laws.js',
  A24: 'tools/structural-laws.js',
  A59: 'tools/structural-laws.js',
};

/**
 * Gesetze, die bewusst **manuell** geprueft werden: kein Regex und kein eigenes
 * Modul kann sie entscheiden. Sie zaehlen als abgedeckt, bleiben aber im
 * Bericht sichtbar (kein stilles Abschalten). Jeder Eintrag braucht einen
 * Grund, der ohne den Code lesbar ist.
 */
const MANUAL_REVIEW = {
  A44: 'generisches div/span fuer ein Registry-Atom: braucht den Abgleich HTML-Tag gegen IMR-Registry, nicht ein Muster',
  A47: 'komplexe UI in contenteditable: Browser loescht Innenstruktur; Beurteilung braucht den Blick auf den Edit-Root',
};

/** Liest alle normativen IDs (erste Tabellenspalte) samt Typ aus dem Katalog. */
function readCatalog(repoRoot) {
  const file = path.join(repoRoot, CATALOG);
  if (!fs.existsSync(file)) return null;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const ids = new Map(); // id -> { type, line }
  lines.forEach((text, i) => {
    const m = text.match(/^\|\s*([A-Z]+\d+)\s*\|\s*([^|]*)\|/);
    if (m) ids.set(m[1], { type: m[2].trim(), line: i + 1 });
  });
  return ids;
}

/** Findet die Zeilennummer einer Sonden-ID in ihrer JSON-Datei (fuer brauchbare Fehlermeldungen). */
function lineOfRule(raw, ruleId) {
  const lines = raw.split(/\r?\n/);
  const idx = lines.findIndex((l) => new RegExp(`"id"\\s*:\\s*"${ruleId}"`).test(l));
  return idx === -1 ? 1 : idx + 1;
}

/** Alle Dateien, die der Antipattern-Scanner ueberhaupt liest (.html/.css/.js). */
function scannableFiles(repoRoot) {
  const out = [];
  const SKIP = new Set(['node_modules', '.git', 'build', 'agent', 'research']);
  (function walk(dir) {
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const e of entries) {
      if (SKIP.has(e.name)) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (['.html', '.css', '.js'].includes(path.extname(e.name).toLowerCase())) {
        out.push(path.relative(repoRoot, full).replace(/\\/g, '/'));
      }
    }
  })(repoRoot);
  return out;
}

function checkLawCoverage(repoRoot) {
  const violations = [];
  const catalog = readCatalog(repoRoot);
  if (!catalog) {
    return { violations: [{ file: CATALOG, line: 1, message: 'Law Catalog nicht gefunden — Abdeckung nicht pruefbar.' }], filesChecked: 0, coverage: null };
  }

  const probeDir = path.join(repoRoot, PROBE_DIR);
  const files = fs.existsSync(probeDir) ? fs.readdirSync(probeDir).filter((f) => f.endsWith('.json')) : [];

  const enforced = new Map(); // Gesetzes-ID -> [Sonden-IDs mit wirksamer Pruefung]
  const targetFiles = scannableFiles(repoRoot);

  for (const fname of files) {
    const rel = `${PROBE_DIR}/${fname}`;
    const raw = fs.readFileSync(path.join(probeDir, fname), 'utf8');
    let doc;
    try {
      doc = JSON.parse(raw);
    } catch (e) {
      violations.push({ file: rel, line: 1, message: `Sondendatei ist kein gueltiges JSON: ${e.message}` });
      continue;
    }

    for (const rule of doc.rules || []) {
      const rid = rule.id || '?';
      const ln = lineOfRule(raw, rid);
      const refs = rule.catalog_ref || [];
      const isRegex = rule.check === 'regex';
      const hasPattern = typeof rule.pattern === 'string' && rule.pattern.length > 0;

      for (const ref of refs) {
        // (1) toter Verweis
        if (!catalog.has(ref)) {
          violations.push({ file: rel, line: ln, message: `Sonde ${rid} beruft sich auf "${ref}" — diese ID gibt es im Law Catalog nicht.` });
          continue;
        }
        // (2) beansprucht, prueft aber nichts
        if (isRegex && !hasPattern) {
          violations.push({ file: rel, line: ln, message: `Sonde ${rid} beansprucht ${ref}, hat aber check:"regex" ohne Pattern — sie prueft nichts.` });
          continue;
        }
        // (3) HARD BAN darf nicht folgenlos sein
        const type = (catalog.get(ref).type || '').toUpperCase();
        if (isRegex && hasPattern && type.includes('HARD BAN') && rule.severity === 'info') {
          violations.push({ file: rel, line: ln, message: `Sonde ${rid} prueft HARD BAN ${ref}, ist aber severity:"info" — der Verstoss bliebe folgenlos.` });
        }
        if (isRegex && hasPattern) {
          if (!enforced.has(ref)) enforced.set(ref, []);
          enforced.get(ref).push(rid);
        }
      }

      // (2b) wirksame Sonde ohne jede Zuordnung: die Durchsetzung ist unsichtbar
      // (4) TOTE SONDE: Dateimuster, das keine einzige reale Datei trifft. Genau so
      // waren P3/P4/P5 jahrelang wirkungslos ("website/js/*.js" wurde literal verglichen).
      if (isRegex && hasPattern && !targetFiles.some((f) => matchFilePattern(f, rule.file_patterns))) {
        violations.push({ file: rel, line: ln, message: `Sonde ${rid} trifft mit file_patterns ${JSON.stringify(rule.file_patterns)} keine einzige Datei — sie ist wirkungslos.` });
      }

      const reason = typeof rule.no_catalog_ref_reason === 'string' ? rule.no_catalog_ref_reason.trim() : '';
      if (isRegex && hasPattern && refs.length === 0 && !reason) {
        violations.push({ file: rel, line: ln, message: `Sonde ${rid} prueft etwas, nennt aber kein catalog_ref — die Durchsetzung ist nicht nachvollziehbar. Entweder das Gesetz eintragen oder "no_catalog_ref_reason" setzen (bewusst norm-freie Sonde).` });
      }
    }
  }

  // Abdeckung nur berichten (siehe Kopfkommentar).
  const laws = [...catalog.keys()].filter((id) => id.startsWith('A'));
  for (const [lawId, tool] of Object.entries(TOOL_ENFORCED)) {
    if (catalog.has(lawId)) {
      if (!enforced.has(lawId)) enforced.set(lawId, []);
      enforced.get(lawId).push(tool);
    }
  }
  for (const [lawId, grund] of Object.entries(MANUAL_REVIEW)) {
    if (catalog.has(lawId) && !enforced.has(lawId)) enforced.set(lawId, [`manuell: ${grund}`]);
  }
  const covered = laws.filter((id) => enforced.has(id));
  const coverage = {
    laws: laws.length,
    covered: covered.length,
    uncovered: laws.filter((id) => !enforced.has(id)),
    byLaw: Object.fromEntries([...enforced].map(([k, v]) => [k, v])),
  };

  return { violations, filesChecked: files.length, coverage };
}




return { checkLawCoverage };
})();
export const { checkLawCoverage } = lawcoverage;

/* ==================================================================
   8. ID Register Gate
   ================================================================== */
const idRegister = (() => {
/**
 * tools/laws/id-register.js — ID-Gate ("Ein Punkt, eine ID")
 *
 * Prueft drei Dinge gegen das Register in docs/30-meta/ID-REGISTER.md:
 *
 *  1. AUFLOESBARKEIT: Jede `B<n>`-Referenz in lebenden Dokumenten muss in
 *     BACKLOG.md (offen), BACKLOG-ARCHIV.md (erledigt) oder in der
 *     Prinzipien-Gruppe B1-B5 des Registers existieren.
 *  2. AUSLAUF: Ausgelaufene Praefixe (S, R, F, T, M) duerfen nicht mehr als
 *     ID zitiert werden — weder im Fliesstext noch in Backticks.
 *  3. REGISTER-DECKUNG: Die im Register genannten Bereiche muessen zur
 *     Wirklichkeit passen (A/H aus dem Law Catalog, P aus project.json,
 *     B aus den beiden Backlog-Dateien). Wer eine Norm hinzufuegt, ohne das
 *     Register zu pflegen, faellt hier auf.
 *
 * ENTWURFSPRINZIP wie tools/terminology.js: Die Listen stehen NICHT im Code,
 * sondern werden aus dem Register geparst. Sonst waere dieses Modul die zweite
 * Kopie des Kanons (AGENTS.md 5.1 "Ein Fakt, ein Ort").
 *
 * Aufrufvertrag:
 *   checkIds(targetDir) -> { violations: [{file, line, found, rule, message}], families }
 */




const REGISTER = 'docs/meta/ID-REGISTER.md';
const BACKLOG = 'docs/meta/BACKLOG.md';
const ARCHIV = 'docs/meta/BACKLOG-ARCHIV.md';
const LAW_CATALOG = 'docs/norm/Immutable-Law-Catalog.md';
const PROJECT_ANTIPATTERNS = 'tools/antipatterns/project.json';

/** Lebende Dokumente: hier wird geprueft. */
const SCAN_DIRS = ['docs', 'batch', 'skills'];
/** Bewusst ungeprueft — Zeitdokumente und Quelle statt Fliesstext. */
const EXCLUDED = [
  'docs/archive/',
  'docs/meta/DECISION-LOG.md',
  'docs/meta/DECISION-LOG-2026-H1.md',
  'docs/meta/ID-REGISTER.md',
  'docs/norm/din5008.md', // wortgetreues Normzitat, enthaelt OCR-Artefakte
  '.trash/',
  'Papierkorb/',
  'research/'
];

function lies(targetDir, rel) {
  const p = path.join(targetDir, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : '';
}

function dateienSammeln(targetDir) {
  const out = [];
  const gehe = (rel) => {
    const abs = path.join(targetDir, rel);
    if (!fs.existsSync(abs)) return;
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
      const r = path.posix.join(rel, e.name);
      if (e.isDirectory()) gehe(r);
      else if (/\.(md)$/.test(e.name)) out.push(r);
    }
  };
  SCAN_DIRS.forEach(gehe);
  return out.filter((f) => !EXCLUDED.some((x) => f.startsWith(x)));
}

/** Bereiche aus der Tabelle "Aktive Nummernkreise" lesen. */
function registerLesen(targetDir) {
  const text = lies(targetDir, REGISTER);
  const familien = new Map();
  let imAbschnitt = false;
  for (const zeile of text.split(/\r?\n/)) {
    if (/^##\s+Aktive Nummernkreise/.test(zeile)) imAbschnitt = true;
    else if (/^##\s/.test(zeile)) imAbschnitt = false;
    if (!imAbschnitt) continue;
    const m = zeile.match(/^\|\s*`([A-Z]{1,3})`\s*\|.*\|\s*([A-Z]{1,3})(\d+)(?:[–-]([A-Z]{1,3})?(\d+))?\s*\|/);
    if (!m) continue;
    const [, prefix, , von, , bis] = m;
    familien.set(prefix, { von: Number(von), bis: Number(bis || von) });
  }
  // Prinzipien-Gruppe B1-B5 (Sonderfall, siehe Register)
  familien.set('B_PRINZIPIEN', { von: 1, bis: 5 });
  return familien;
}

function maxId(text, muster) {
  let max = 0;
  for (const treffer of text.matchAll(muster)) {
    const n = Number(treffer[1]);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return max;
}

/** Praefixe aus der Tabelle "Ausgelaufene Praefixe" lesen. */
function ausgelaufenePraefixe(targetDir) {
  const text = lies(targetDir, REGISTER);
  const out = new Set();
  let imAbschnitt = false;
  for (const zeile of text.split(/\r?\n/)) {
    if (/^##\s+Ausgelaufene Pr/.test(zeile)) imAbschnitt = true;
    else if (/^##\s/.test(zeile)) imAbschnitt = false;
    if (!imAbschnitt) continue;
    const m = zeile.match(/^\|\s*`([A-Z]{1,3})`\s*\|/);
    if (m) out.add(m[1]);
  }
  return out;
}

function backlogIds(targetDir) {
  const ids = new Set();
  for (const t of lies(targetDir, BACKLOG).matchAll(/^### (B\d+) ·/gm)) ids.add(t[1]);
  for (const t of lies(targetDir, ARCHIV).matchAll(/^\|\s*(B\d+)\s*\|/gm)) ids.add(t[1]);
  return ids;
}

/**
 * @param {string} targetDir
 * @returns {{violations: {file: string, line: number, found: string, rule: string, message: string}[], families: number}}
 */
function checkIds(targetDir) {
  const violations = [];
  const familien = registerLesen(targetDir);
  if (familien.size === 0) {
    return {
      violations: [
        { file: REGISTER, line: 1, found: '—', rule: 'register', message: 'ID-Register fehlt oder hat keine Tabelle "Aktive Nummernkreise"' }
      ],
      families: 0
    };
  }

  // --- 3. Register-Deckung gegen die Quellen der Wahrheit ---
  const deckung = [
    ['A', LAW_CATALOG, /\|\s*A(\d{1,3})\s*\|/g],
    ['H', LAW_CATALOG, /\|\s*H(\d{1,3})\s*\|/g],
    ['P', PROJECT_ANTIPATTERNS, /"id":\s*"P(\d{1,3})"/g],
    ['W', 'tools/antipatterns/web.json', /"id":\s*"W(\d{1,3})"/g],
    ['B', BACKLOG, /^### (B\d+) ·/gm]
  ];
  for (const [prefix, quelle, muster] of deckung) {
    const f = familien.get(prefix);
    if (!f) {
      violations.push({ file: REGISTER, line: 1, found: prefix, rule: 'register', message: `Praefix ${prefix} fehlt in der Tabelle "Aktive Nummernkreise"` });
      continue;
    }
    const text = lies(targetDir, quelle);
    if (!text) continue;
    const istMax = prefix === 'B'
      ? Math.max(...[...text.matchAll(muster)].map((m) => Number(m[1].slice(1))))
      : maxId(text, muster);
    if (istMax > f.bis) {
      violations.push({
        file: REGISTER,
        line: 1,
        found: `${prefix}${istMax}`,
        rule: 'register',
        message: `${quelle} enthaelt ${prefix}${istMax}, das Register nennt nur ${prefix}${f.von}-${prefix}${f.bis}. Register nachziehen.`
      });
    }
  }

  // --- 1. + 2. Referenzen in lebenden Dokumenten ---
  const bekannt = backlogIds(targetDir);
  const praemien = familien.get('B_PRINZIPIEN');
  const ausgelaufen = ausgelaufenePraefixe(targetDir);

  for (const rel of dateienSammeln(targetDir)) {
    const zeilen = lies(targetDir, rel).split(/\r?\n/);
    for (let i = 0; i < zeilen.length; i++) {
      const zeile = zeilen[i];

      for (const m of zeile.matchAll(/\bB(\d{1,3})\b/g)) {
        const id = `B${m[1]}`;
        const n = Number(m[1]);
        const istPrinzip = praemien && n >= praemien.von && n <= praemien.bis;
        if (!bekannt.has(id) && !istPrinzip) {
          violations.push({
            file: rel,
            line: i + 1,
            found: id,
            rule: 'aufloesbar',
            message: `${id} ist weder in ${BACKLOG}/${ARCHIV} noch ein Prinzip B1-B5 (siehe ${REGISTER})`
          });
        }
      }

      // Ausgelaufene Praefixe nur in ID-Form (Backticks) — Fliesstext wie
      // "S1" in "Stufe 1" oder "M2" in einem Namen bleibt unangetastet.
      for (const m of zeile.matchAll(/`([SRFTM]\d{1,2})`/g)) {
        if (!ausgelaufen.has(m[1][0])) continue;
        violations.push({
          file: rel,
          line: i + 1,
          found: m[1],
          rule: 'ausgelaufen',
          message: `Das Praefix ${m[1][0]} ist ausgelaufen; Alias-Tabelle in ${REGISTER} nennt die heutige ID`
        });
      }
    }
  }

  return { violations, families: familien.size };
}




return { checkIds };
})();
export const { checkIds } = idRegister;

/* ==================================================================
   9. Orchestrator & CLI
   ================================================================== */
export const SONDE_NAMEN = ["imr", "structure", "isolation", "links", "terms", "coverage", "ids"];

export const SONDEN = {
  imr: (root) => ({ violations: checkImr(root).violations }),
  structure: (root) => ({ violations: checkStructuralLaws(root) }),
  isolation: (root) => checkIsolation(root),
  links: (root) => checkLinks(root),
  terms: (root) => checkTerminology(root),
  coverage: (root) => checkLawCoverage(root),
  ids: (root) => checkIds(root),
};

export function runLaws(names = ["all"], targetDir = ROOT) {
  const auswahl = names.includes("all") ? [...SONDE_NAMEN] : SONDE_NAMEN.filter((n) => names.includes(n));
  const violations = [];
  const coverage = [];

  for (const name of auswahl) {
    try {
      const res = SONDEN[name](targetDir) || {};
      for (const v of res.violations || []) {
        violations.push({
          probe: name,
          file: v.file || "tools/laws.mjs",
          ...(v.line ? { line: v.line } : {}),
          message: v.message || String(v),
        });
      }
      if (res.coverage) coverage.push({ probe: name, ...res.coverage });
    } catch (err) {
      violations.push({ probe: name, file: "tools/laws.mjs", message: "Sonde fehlgeschlagen: " + err.message });
    }
  }

  return { checked: auswahl, violations, ...(coverage.length ? { coverage } : {}) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const namen = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  const anfrage = namen.length ? namen : ["all"];
  const unbekannt = anfrage.filter((n) => n !== "all" && !SONDE_NAMEN.includes(n));
  if (unbekannt.length) {
    console.error("laws: unbekannte Sonde " + JSON.stringify(unbekannt));
    process.exit(2);
  }

  const { checked, violations, coverage } = runLaws(anfrage);
  if (violations.length > 0) {
    console.log("GESETZE: " + violations.length + " Verstoesse (" + checked.join(", ") + "):");
    for (const v of violations) {
      console.log("  [" + v.probe + "] " + v.file + (v.line ? ":" + v.line : "") + ": " + v.message);
    }
    process.exitCode = 1;
  } else {
    console.log("GESETZE OK: " + checked.length + " Sonden, keine Verstoesse (" + checked.join(", ") + ").");
  }
  for (const c of coverage || []) {
    console.log("Abdeckung (" + c.probe + "): " + c.covered + "/" + c.laws + " A-Gesetze maschinell geprueft.");
  }
}

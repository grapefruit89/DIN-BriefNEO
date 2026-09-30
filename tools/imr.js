'use strict';
/**
 * tools/imr.js — IMR-Registry als maschinenlesbare SSOT.
 *
 * Liest docs/10-architecture/IMR-Registry.md (normatives Modell + JSON-Inventar),
 * prueft die Registry-Invarianten und dass der Website-Code + die `data-*`-Geometrie
 * exakt der Registry entsprechen. Kein Dependency, kein Build-Step.
 *
 *   const { checkImr } = require('./tools/imr.js');
 *   const { violations } = checkImr('/pfad/zum/repo');
 */
const fs = require('fs');
const path = require('path');

const REGISTRY_REL = 'docs/10-architecture/IMR-Registry.md';

function readRegistry(targetDir) {
  const md = fs.readFileSync(path.join(targetDir, REGISTRY_REL), 'utf-8');
  const tags = new Set((md.match(/<din-[a-z0-9-]+>/g) || []).map(t => t.slice(1, -1)));
  const m = md.match(/<!-- IMR-INVENTORY:START -->\s*```json\s*([\s\S]*?)```\s*<!-- IMR-INVENTORY:END -->/);
  const inventory = m ? JSON.parse(m[1]) : null;
  return { md, tags, inventory };
}

/** Erwartete `data-*`-Geometrie aus dem Inventar (Reihenfolge egal). */
function expectedDataAttrs(inventory) {
  const out = {
    'data-width-mm': inventory.sheet.width,
    'data-height-mm': inventory.sheet.height,
  };
  for (const [id, spec] of Object.entries(inventory.geometry || {})) {
    const base = id.replace(/^din-/, '');
    const y = spec.y || {};
    if ('Y' in y) out[`data-${base}-y`] = y.Y;
    if ('A' in y) out[`data-${base}-y-a`] = y.A;
    if ('B' in y) out[`data-${base}-y-b`] = y.B;
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

function checkImr(targetDir) {
  const violations = [];
  const add = (file, message) => violations.push({ file, message });
  let tags = new Set(), inventory = null;
  try {
    ({ tags, inventory } = readRegistry(targetDir));
  } catch (err) {
    return { violations: [{ file: REGISTRY_REL, message: `Registry nicht lesbar: ${err.message}` }] };
  }
  if (!inventory) add(REGISTRY_REL, 'JSON-Inventar (IMR-INVENTORY) fehlt');

  if (inventory) {
    const zones = new Set(inventory.zones || []);
    const systemAtoms = new Set(inventory.systemAtoms || []);
    const registered = new Set([inventory.document, ...zones, ...tags]);
    const atoms = [...tags].filter(t => t !== inventory.document && !zones.has(t));

    if (atoms.length !== 45) add(REGISTRY_REL, `Atom-Inventar: erwartet 45, gefunden ${atoms.length}`);
    if (new Set(atoms).size !== atoms.length) add(REGISTRY_REL, 'Atom-Inventar enthaelt Duplikate');
    if (systemAtoms.size !== 3) add(REGISTRY_REL, `System-Atome: erwartet 3, gefunden ${systemAtoms.size}`);
    for (const s of systemAtoms) if (!atoms.includes(s)) add(REGISTRY_REL, `System-Atom nicht im Atom-Inventar: ${s}`);
    const content = atoms.length - systemAtoms.size;
    if (content !== 42) add(REGISTRY_REL, `Inhaltsatome: erwartet 42, gefunden ${content}`);

    for (const a of inventory.forbiddenAliases || []) {
      if (registered.has(a)) add(REGISTRY_REL, `Verbotener Alias ist als Tag registriert: ${a}`);
    }
    for (const [comp, members] of Object.entries(inventory.compositions || {})) {
      for (const m of members) if (!atoms.includes(m)) add(REGISTRY_REL, `Komposition ${comp}: kein Atom ${m}`);
    }
    for (const id of Object.keys(inventory.geometry || {})) {
      if (!registered.has(id)) add(REGISTRY_REL, `Geometrie fuer unbekannten Bezeichner: ${id}`);
    }

    // 1) Website-Code darf nur registrierte din-* verwenden.
    for (const file of walkCode(path.join(targetDir, 'website'))) {
      const rel = path.relative(targetDir, file).replace(/\\/g, '/');
      const content = fs.readFileSync(file, 'utf-8')
        .replace(/\[\[[^\]]*\]\]/g, '')
        .replace(/@(guide|adr)\b[^\n]*/g, '');
      for (const mm of content.matchAll(/\bdin-[a-z0-9-]+/g)) {
        if (!registered.has(mm[0])) add(rel, `Nicht registrierter din-Bezeichner (IMR ist SSOT): ${mm[0]}`);
      }
    }

    // 2) data-* des <din-a4> muss exakt der Registry-Geometrie entsprechen.
    const htmlPath = path.join(targetDir, 'website/index.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const a4 = html.match(/<din-a4\b[^>]*>/);
    if (!a4) add('website/index.html', '<din-a4> nicht gefunden');
    else {
      const present = Object.fromEntries(
        [...a4[0].matchAll(/data-[a-z-]+="([^"]+)"/g)].map(x => [x[0].split('=')[0], x[1]])
      );
      for (const [k, v] of Object.entries(expectedDataAttrs(inventory))) {
        if (!(k in present)) add('website/index.html', `data-Attribut fehlt (aus Registry): ${k}`);
        else if (present[k] !== String(v)) add('website/index.html', `${k}="${present[k]}" weicht von Registry (${v}) ab`);
      }
    }

    // 3) Kanonisches Vokabular (IMR vocabulary-Block)
    for (const v of checkVocabulary(targetDir, inventory)) add(v.file, v.message);
  }

  return { violations, tags: [...tags], inventory };
}

module.exports = { checkImr, checkVocabulary, expectedDataAttrs, REGISTRY_REL };

if (require.main === module) {
  const r = checkImr(path.resolve(__dirname, '..'));
  if (r.violations.length === 0) console.log(`IMR OK: ${r.tags.length} registrierte din-Bezeichner, Inventar konsistent.`);
  else { for (const v of r.violations) console.error(`IMR-FEHLER ${v.file}: ${v.message}`); process.exitCode = 1; }
}

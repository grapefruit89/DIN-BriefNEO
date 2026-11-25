/**
 * tools/structural-laws.js — Strukturprüfungen für Gesetze, die keine einfache Textregex sind.
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

const fs = require('fs');
const path = require('path');

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

module.exports = { checkStructuralLaws };

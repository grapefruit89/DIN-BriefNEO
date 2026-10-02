/**
 * tools/structural-laws.js — Strukturprüfungen für Gesetze, die keine einfache Textregex sind.
 *
 * Durchgesetzt werden:
 *   - A42: keine doppelten IDs im Produkt-HTML
 *   - A57: keine binären Radio-Gruppen als Schalter (Ausnahme: Form A/B ist Dokumentenmodus)
 *   - A58: keine Radio-Segmented-Controls für Theme-Wahl (zyklischer Toggle Pflicht)
 *   - A24: keine CSS-Token ohne Definition in :root oder ohne Fallback
 *   - A59: keine Theme-Variablen (--text-primary, --bg-surface etc.) auf dem DIN-A4-Blatt (sheet.css)
 */

const fs = require('fs');
const path = require('path');

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

  // A57: Binäre Radio-Gruppe als Schalter (Form A/B ist begründeter 2-Wert-Dokumentenmodus)
  for (const [name, radios] of radioGroups) {
    if (radios.length === 2 && name !== 'layout-form') {
      violations.push({ file: 'website/index.html', line: radios[0].line, message: `A57: binäre Radio-Gruppe "${name}" als Schalter — Checkbox switch verwenden oder fachlich begründete Ausnahme dokumentieren.` });
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

    // 3. A59: Theme-abhängige UI-Variablen auf dem DIN-A4-Blatt (sheet.css) pruefen
    const sheetFile = path.join(cssDir, 'sheet.css');
    if (fs.existsSync(sheetFile)) {
      const sheetLines = fs.readFileSync(sheetFile, 'utf8').split('\n');
      const themeVarRe = /var\(\s*--(text-primary|text-muted|text-secondary|bg-surface|bg-viewport|bg-card|bg-seitenleiste|border-color)\b/g;
      sheetLines.forEach((l, idx) => {
        for (const m of l.matchAll(themeVarRe)) {
          violations.push({ file: 'website/css/sheet.css', line: idx + 1, message: `A59: Theme-Variable "--${m[1]}" auf dem DIN-A4-Blatt verwendet. Blatt muss papier-eigene Token (--blatt-*) nutzen.` });
        }
      });
    }
  }

  return violations;
}

module.exports = { checkStructuralLaws };

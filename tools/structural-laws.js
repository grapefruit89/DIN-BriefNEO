/**
 * Strukturprüfungen für Gesetze, die keine Textregex sind.
 * Aktuell: A42 (doppelte IDs) und A57 (Radio-Nachbau eines Boolean-Schalters).
 * Die Ausnahmen sind fachlich benannt, nicht stillschweigend.
 */
const fs = require('fs');
const path = require('path');

function checkStructuralLaws(repoRoot) {
  const file = path.join(repoRoot, 'website/index.html');
  if (!fs.existsSync(file)) return [{ file: 'website/index.html', line: 1, message: 'Produkt-HTML fehlt.' }];
  const text = fs.readFileSync(file, 'utf8');
  const violations = [];
  const ids = new Map();
  const radioGroups = new Map();
  const tagRe = /<([a-z][\w-]*)\b[^>]*>/gi;
  let match;
  while ((match = tagRe.exec(text))) {
    const tag = match[0];
    const line = text.slice(0, match.index).split('\n').length;
    const id = tag.match(/\bid\s*=\s*["']([^"']+)["']/i)?.[1];
    if (id) {
      if (ids.has(id)) {
        violations.push({ file: 'website/index.html', line, message: `A42: doppelte id "${id}" (zuvor Zeile ${ids.get(id)}).` });
      } else ids.set(id, line);
    }
    if (tag.toLowerCase().startsWith('<input') && /\btype\s*=\s*["']radio["']/i.test(tag)) {
      const name = tag.match(/\bname\s*=\s*["']([^"']+)["']/i)?.[1];
      if (name) {
        if (!radioGroups.has(name)) radioGroups.set(name, []);
        radioGroups.get(name).push({ line, tag });
      }
    }
  }
  // Form A/B is a deliberate two-value document mode, not a Boolean switch.
  for (const [name, radios] of radioGroups) {
    if (radios.length === 2 && name !== 'layout-form') {
      violations.push({ file: 'website/index.html', line: radios[0].line, message: `A57: binäre Radio-Gruppe "${name}" als Schalter — Checkbox switch verwenden oder fachlich begründete Ausnahme dokumentieren.` });
    }
  }
  return violations;
}

module.exports = { checkStructuralLaws };

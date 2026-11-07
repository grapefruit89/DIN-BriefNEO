// tools/browser.mjs — Browser-Erkennung für die lokalen Runner.

import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * Sucht das Binärprogramm; absolute Pfade zuerst, damit kein Wrapper-Skript
 * (z. B. ~/.local/bin/helium) den Prozessbaum übernimmt und das Killen verhindert.
 * @returns {string | null}
 */
export function findBrowser() {
  if (process.env.CHROME_BIN && existsSync(process.env.CHROME_BIN)) return process.env.CHROME_BIN;
  const absolut = [
    '/usr/bin/helium',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/opt/google/chrome/chrome'
  ];
  for (const p of absolut) if (existsSync(p)) return p;
  for (const name of ['helium', 'chromium', 'google-chrome']) {
    for (const dir of (process.env.PATH || '').split(path.delimiter)) {
      const p = path.join(dir, name);
      if (existsSync(p)) return p;
    }
  }
  return null;
}

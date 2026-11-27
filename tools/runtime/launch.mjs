// tools/runtime/launch.mjs — der eine Chromium-Start für alle Runner.
//
// Derselbe Ablauf stand vorher in fünf Skripten (test-runner, print-messung,
// mess-print, og-image, debug-session): flüchtiges mkdtemp-Profil, spawn, auf
// DevToolsActivePort warten, SIGKILL + Profil löschen. Hier einmal.
//
// Bibliothek:  const b = await launch({ url: 'about:blank' });
//              b.cdpPort · b.profil · b.child · await b.close()

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { findBrowser } from './browser.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @param {object} [optionen]
 * @param {boolean} [optionen.headless] true = `--headless=new` (Default)
 * @param {number} [optionen.cdpPort] 0 = freier Port über DevToolsActivePort
 * @param {string} [optionen.url] erste Seite (Default about:blank)
 * @param {string[]} [optionen.args] zusätzliche Chromium-Flags
 * @param {string} [optionen.profilPrefix] mkdtemp-Präfix im Temp-Verzeichnis
 * @param {string | null} [optionen.bin] erzwungenes Binary, sonst findBrowser()
 * @param {number} [optionen.timeoutMs] Wartezeit auf den Debug-Port
 * @returns {Promise<{ bin: string, child: import('node:child_process').ChildProcess, profil: string, cdpPort: number, close: () => Promise<void> }>}
 */
export async function launch({
  headless = true,
  cdpPort = 0,
  url = 'about:blank',
  args = [],
  profilPrefix = 'din-runtime-',
  bin = null,
  timeoutMs = 15000
} = {}) {
  const programm = bin || findBrowser();
  if (!programm) {
    throw new Error('Kein Chromium gefunden. Setze CHROME_BIN oder installiere chromium/google-chrome.');
  }

  const profil = mkdtempSync(path.join(os.tmpdir(), profilPrefix));
  const child = spawn(
    programm,
    [
      ...(headless ? ['--headless=new', '--disable-gpu', '--no-sandbox'] : []),
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${profil}`,
      ...args,
      url
    ],
    { stdio: 'ignore' }
  );

  /** Kind hart beenden und das flüchtige Profil löschen. */
  const close = async () => {
    try {
      child.kill('SIGKILL');
    } catch {
      /* schon beendet */
    }
    try {
      rmSync(profil, { recursive: true, force: true });
    } catch {
      /* egal */
    }
  };

  // Chrome schreibt Port und Browser-Pfad erst nach dem Start in die Profildatei.
  const portDatei = path.join(profil, 'DevToolsActivePort');
  const frist = Date.now() + timeoutMs;
  let port = 0;
  while (!port && Date.now() < frist) {
    if (child.exitCode !== null) {
      await close();
      throw new Error(`Browser sofort beendet (Exit ${child.exitCode}).`);
    }
    if (existsSync(portDatei)) {
      port = Number(readFileSync(portDatei, 'utf8').split('\n')[0]) || 0;
    }
    if (!port) await sleep(100);
  }
  if (!port) {
    await close();
    throw new Error('Browser hat keinen Debug-Port geöffnet (DevToolsActivePort fehlt).');
  }

  return { bin: programm, child, profil, cdpPort: port, close };
}

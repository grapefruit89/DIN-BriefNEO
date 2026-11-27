#!/usr/bin/env node
// tools/runtime/runner.mjs — Headless-Runner für test/index.html (B48).
//
// Zero-Dependency: node:http, node:child_process, node:fs, node:path, node:url.
// Startet einen eigenen Server mit `Cache-Control: no-store` (die ?v=-Query in
// test/index.html ist dadurch nicht mehr nötig), öffnet den Browser headless,
// holt `window.__TEST_RESULTS` per CDP ab und meldet das Ergebnis über den
// Exit-Code. Browser-Start und CDP-Protokoll liegen in launch.mjs / cdp.mjs.
//
// Aufruf:
//   node tools/test-runner.mjs                 (Shim; package.json, CI)
//   node tools/runtime/runner.mjs --json
//   node tools/runtime/runner.mjs --filter=Salutation
//   CHROME_BIN=/pfad/zu/chromium node tools/test-runner.mjs
//   node tools/test-runner.mjs --allow-missing-browser   (CI ohne Browser)

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBrowser } from './browser.mjs';
import { startStaticServer } from './static-server.mjs';
import { launch } from './launch.mjs';
import { browserInfo, findeSeite, verbinde } from './cdp.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Führt die Suite aus und gibt den Exit-Code zurück (0 ok, 1 rot).
 * Kein `process.exit` — der Aufrufer entscheidet (Shim, direkter Lauf, Import).
 * @param {string[]} [argv] Argumente ohne `node` und Skriptpfad
 * @returns {Promise<number>}
 */
export async function runTests(argv = process.argv.slice(2)) {
  const START = Date.now();

  /* ---------------------------------------------------------------- Argumente */

  const flag = (name) => argv.includes(name);
  const value = (name, fallback) => {
    const hit = argv.find((a) => a.startsWith(`${name}=`));
    return hit ? hit.slice(name.length + 1) : fallback;
  };

  const alsJson = flag('--json');
  const filter = value('--filter', '');
  const timeoutMs = Number(value('--timeout', '15000'));
  const browserFehltOk = flag('--allow-missing-browser');

  /* ----------------------------------------------------------- Ausgabe-Helfer */

  const tty = Boolean(process.stdout.isTTY);
  const farbe = {
    gruen: (s) => (tty ? `\x1b[32m${s}\x1b[0m` : s),
    rot: (s) => (tty ? `\x1b[31m${s}\x1b[0m` : s),
    grau: (s) => (tty ? `\x1b[90m${s}\x1b[0m` : s),
    fett: (s) => (tty ? `\x1b[1m${s}\x1b[0m` : s)
  };

  /* ------------------------------------------------------------------ Server */

  const statik = await startStaticServer(ROOT);
  const serverPort = statik.port;

  /* ----------------------------------------------------------------- Browser */

  if (!findBrowser()) {
    const meldung = 'Kein Chromium gefunden. Setze CHROME_BIN oder installiere chromium/google-chrome.';
    await statik.close();
    if (browserFehltOk) {
      if (alsJson) process.stdout.write(`${JSON.stringify({ ok: true, skipped: true, grund: meldung })}\n`);
      else console.log(farbe.grau(`SKIP: ${meldung}`));
      return 0;
    }
    console.error(farbe.rot(`FEHLER: ${meldung}`));
    return 1;
  }

  const browser = await launch({ headless: true, url: 'about:blank', profilPrefix: 'din-test-runner-' });
  /** @type {Awaited<ReturnType<typeof verbinde>> | null} */
  let cdpx = null;
  const konsolenfehler = [];

  const aufraeumen = async () => {
    cdpx?.close();
    await browser.close();
    await statik.close();
  };

  try {
    const seite = await findeSeite(browser.cdpPort);
    const browserVersion = (await browserInfo(browser.cdpPort))?.Browser || 'unbekannt';

    cdpx = await verbinde(seite.webSocketDebuggerUrl, {
      onEvent(method, params) {
        if (method === 'Runtime.exceptionThrown') {
          konsolenfehler.push(
            params.exceptionDetails?.exception?.description || params.exceptionDetails?.text || 'Exception'
          );
        }
        if (method === 'Runtime.consoleAPICalled' && params.type === 'error') {
          const text = params.args.map((a) => a.value ?? a.description ?? '').join(' ');
          // Die Suite loggt fehlgeschlagene Tests selbst per console.error — das ist
          // kein Laufzeitfehler und würde die Diagnose doppeln.
          if (!text.startsWith('✗')) konsolenfehler.push(text);
        }
      }
    });
    const { send, evaluate } = cdpx;

    await send('Runtime.enable');
    await send('Network.enable');
    await send('Network.setCacheDisabled', { cacheDisabled: true });
    await send('Page.enable');

    const query = filter ? `?filter=${encodeURIComponent(filter)}` : '';
    await send('Page.navigate', { url: `http://127.0.0.1:${serverPort}/test/index.html${query}` });

    let ergebnis = null;
    const frist = Date.now() + timeoutMs;
    while (Date.now() < frist) {
      await sleep(200);
      const roh = await evaluate('window.__TEST_RESULTS ? JSON.stringify(window.__TEST_RESULTS) : ""');
      if (roh) {
        ergebnis = JSON.parse(roh);
        break;
      }
    }
    if (!ergebnis) throw new Error(`Timeout: keine Testergebnisse nach ${timeoutMs} ms.`);

    const dauer = Date.now() - START;
    const ok = ergebnis.failed === 0;

    if (alsJson) {
      process.stdout.write(
        `${JSON.stringify({ ok, ...ergebnis, konsolenfehler, browser: browserVersion, dauerMs: dauer }, null, 2)}\n`
      );
      await aufraeumen();
      return ok ? 0 : 1;
    }

    console.log(farbe.fett('▶ DIN-BriefNEO Test-Suite'));
    console.log(farbe.grau(`  ${browserVersion} · Port ${serverPort} · ${dauer} ms${filter ? ` · Filter: ${filter}` : ''}`));
    console.log('');
    for (const fehler of ergebnis.failures) console.log(farbe.rot(`  ✗ ${fehler}`));
    if (ergebnis.failures.length) console.log('');
    const zusammenfassung = `${ergebnis.passed} bestanden, ${ergebnis.failed} fehlgeschlagen${ergebnis.skipped ? `, ${ergebnis.skipped} übersprungen` : ''} · ${ergebnis.total} gesamt`;
    console.log(ok ? farbe.gruen(`✓ ${zusammenfassung}`) : farbe.rot(`✗ ${zusammenfassung}`));
    if (konsolenfehler.length) {
      console.log('');
      console.log(farbe.grau(`  Konsolenfehler im Testlauf: ${konsolenfehler.length}`));
      for (const f of konsolenfehler.slice(0, 5)) console.log(farbe.grau(`    ${f.split('\n')[0]}`));
    }
    await aufraeumen();
    return ok ? 0 : 1;
  } catch (fehler) {
    const meldung = fehler instanceof Error ? fehler.message : String(fehler);
    await aufraeumen();
    if (alsJson) process.stdout.write(`${JSON.stringify({ ok: false, error: meldung })}\n`);
    else console.error(farbe.rot(`\n✗ Runner-Fehler: ${meldung}`));
    return 1;
  }
}

const direkt = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (direkt) process.exit(await runTests());

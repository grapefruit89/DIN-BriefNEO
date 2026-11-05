---
id: dead-code-audit-2026-11-05
title: Dead-Code-Audit — 2026-11-05
status: archived
type: reference
created: '2026-11-05'
updated: '2026-11-05'
tags:
- din-briefneo
- meta
- audit
doc_links:
- '[[AGENTS]]'
- '[[Immutable-Law-Catalog]]'
- '[[ADR-JS]]'
- '[[DECISION-LOG]]'
- '[[BACKLOG]]'
code_links:
- 'website/index.html'
- 'website/multipage.html'
- 'website/js/main.js'
- 'website/js/salutation.js'
- 'website/js/boot-theme.js'
- 'website/js/settings.js'
- 'website/js/document.js'
depends_on: []
supersedes: []
---

# Dead-Code-Audit — geprüfte und korrigierte Befundliste

**Datum:** 2026-11-05 · **Umfang:** Befundliste 4.1–4.7 aus dem externen Audit
**Modus:** Jeder Befund wurde gegen den Code geprüft. Drei Befunde waren falsch.
**Ergebnis:** vier Code-Änderungen, drei Doku-Korrekturen, drei Befunde verworfen.

> [!info] Warum diese Datei existiert
> Die ursprüngliche Befundliste hatte keinen Ort im Repo. Damit ihre Korrekturen
> nachvollziehbar bleiben und nicht bei jedem Audit neu diskutiert werden, steht das
> geprüfte Ergebnis hier — nicht die ungeprüfte Rohliste.

## Liste (korrigiert)

| # | Schwere | Befund | Beleg | Status |
| :--- | :--- | :--- | :--- | :--- |
| 4.1 | Niedrig | `#btn-felder-leeren` wird in `main.js` verdrahtet, existiert aber in keiner HTML-Datei. `felderLeeren()` ist unerreichbar. | `main.js:521-548, 555, 563-567`; `index.html` hat nur `#btn-testbrief` (Z. 208) und `#btn-reset` (Z. 273) | entfernt |
| 4.2 | Niedrig | `salutation.js` referenziert `#btn-style-formal/polite/casual`, die es nicht gibt. Gestellt wird der Stil über `#stil-select`. | `salutation.js:260,266,323`; `index.html:102-104` | entfernt |
| 4.3 | **Hoch** | `js/boot-theme.js` wird nicht geladen. Der Inline-Block setzt nur `data-theme`, **nicht `data-style`**. Wer Stil „kompakt" gespeichert hat, sieht die Seite zuerst im Default und dann umspringen — der FOUC-Schutz war halb abgeschaltet. | `boot-theme.js:16-17` vs. `index.html:23-37`, `settings.js:80,147-148`; Rückbau in `bac3c3c` | behoben (beide HTML-Dateien) |
| 4.5 | Niedrig | `addons/webmcp-bridge.js` (202 Zeilen) wird nirgends importiert. | einzige Erwähnungen: `tools/build_db.js`, `docs/STRUCTURE.md` | **liegen gelassen**, in [[STRUCTURE]] als „derzeit nicht eingebunden" markiert |
| 4.7 | Niedrig | `injectFont` prüft Font-Family `'AptosCustom'`, die nirgends definiert wird. **Ursprung: Migrationsschutz** aus `efe5af8` („native Systemschrift-Kaskade (Aptos-First)"). | `settings.js:200,313`; `git log -S AptosCustom` | **nicht angefasst** — erst löschen, wenn die Migration nachweislich abgeschlossen ist |
| 4.8 | **Hoch** | Archivieren der `webmcp-bridge.js` nach `docs/90-archive/` bricht die TypeScript-Prüfung: `docs/90-archive/webmcp-bridge.js(11,34): error TS2307: Cannot find module '../js/core.js'` — relative Importe lösen sich am neuen Ort nicht mehr auf. Folge: `Fitness Score 99.93 %`, Gate rot. | eigener Gate-Lauf 2026-11-05 | **Option A: liegen lassen.** Ein sauberes Archivieren setzt voraus, dass `jsconfig.json` `docs/` ausschließt **oder** `tools/build_db.js` bereinigt ist — beides ein eigener Auftrag |

## Widerlegte Befunde

| # | Behauptung | Gegenbeleg |
| :--- | :--- | :--- |
| 4.4 | `debug-json-panel.js` und `debug-recorder.js` seien Re-Export-Wrapper ohne Eigenwert | Sie sind **Test-API-Oberfläche**: `test/all.js:1790,1791,1945,1982` importieren `initAutocompleteRecorder` und `initJSONDebugPanel` namentlich. Kein Dead Code. |
| 4.6 | `DraftManager.#isRestoring` sei ein totes Flag, weil `#restoreState` nie `saveDraft` aufruft | Das Flag schützt gegen einen **debounced** `saveDraft`, der während eines Restores feuern kann. Gesetzt `document.js:876`, geprüft `:829`, zurückgesetzt `:926`; der Debounce-Kontext steht in `:821-829`. Kein toter Code. |

## Neue Befunde (Doku vs. Code)

| # | Schwere | Befund | Status |
| :--- | :--- | :--- | :--- |
| 6.4 | **Hoch** | `BACKLOG.md:198` und `DECISION-LOG.md:1468` behaupten, die `btn-style-*`-IDs würden „per Template-String gebaut". Falsch: `getElementById(\`btn-style-${style}\`)` **sucht** ein Element, es baut keines. Die Doku hat einen früheren Audit-Eintrag geschützt, der inhaltlich nicht stimmt — und damit jeden Folge-Audit in dieselbe Sackgasse geschickt. | korrigiert (BACKLOG) bzw. neuer Eintrag (DECISION-LOG, append-only) |
| 6.5 | — | **Widerlegt.** `boot-state.js` existiert nicht mehr und ist überall korrekt als eliminiert dokumentiert: [[ADR-JS]]:210 („🚫 ELIMINATED"), `DECISION-LOG:1872` („boot-state.js entfernt, DraftManager als SSoT"). Nur `BACKLOG.md:187` nennt es in einem am 2026-10-02 erledigten Eintrag — Zeitdokument, bleibt stehen. | keine Änderung |
| 6.6 | Niedrig | `tools/isolation.js:45` prüft Referenzen nur gegen `^(https?:\|data:\|mailto:\|#\|javascript:)`. Ein `ws:`-Ziel fällt durch — Werkzeuglücke, kein WebMCP-Problem. | vermerkt, nicht geändert |
| 6.7 | Niedrig | [[ADR-JS]]:77 behauptete, `boot-theme.js` setze `data-layout`. Tatsächlich setzt es `data-style` (`boot-theme.js:17`). | korrigiert |

## Beschlüsse

1. **4.3** ist der einzige Befund mit sichtbarer Wirkung. Der Inline-Block ist durch
   `<script src="js/boot-theme.js?v=live6"></script>` ersetzt — in **beiden** HTML-Dateien,
   weil der Block dort als Kopie lag (Verstoß gegen „ein Fakt, ein Ort", §5.1).
   Der CSP-Hash entfällt; `script-src 'self'` deckt das externe Script ab.
2. **4.2** wird entfernt, nicht repariert: `#stil-select` deckt alle drei Stile ab.
3. **4.5 wird liegengelassen, nicht archiviert.** Ein Verschieben nach `90-archive/` bricht die
   TypeScript-Prüfung (relativer Import `../js/core.js`, Befund 4.8, Gate rot). Die Datei bleibt
   an ihrem Ort und ist in [[STRUCTURE]] als „derzeit nicht eingebunden" markiert. Eine
   Einbindung wäre ohnehin eine Architekturentscheidung (CSP-Erweiterung, A38-Allowlist).
4. **4.4, 4.6, 4.7** bleiben unangetastet. Ein Löschen ohne Vorprüfung würde
   Testabdeckung bzw. Migrationsschutz entfernen.

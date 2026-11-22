---
id: semantic-anchors
title: "SEMANTIC-ANCHORS: Projektbegriffe und ihre etablierten Namen"
type: meta
status: active
created: '2026-11-22'
updated: '2026-11-22'
tags:
  - din-briefneo
  - din-briefneo/meta
  - status/active
  - type/reference
doc_links:
  - HANDOFF
  - DECISION-LOG
  - Immutable-Law-Catalog
code_links:
  - website/js/geo-cache.js
  - website/js/suggestion-list.js
  - website/js/state.js
  - website/js/draft-manager.js
  - website/js/persistence.js
  - website/js/document.js
  - website/js/boot.js
  - website/js/multipage-controller.js
  - tools/build_db.js
  - tools/reconciliation.js
depends_on: []
---

# SEMANTIC-ANCHORS — Projektbegriffe und ihre etablierten Namen

> **Zweck.** Wer eine Stelle anfasst, soll den *etablierten* Begriff dafür kennen —
> nicht einen neuen erfinden. Jede Zeile nennt den Beleg (Datei + Funktion), damit
> die Aussage prüfbar bleibt und nicht zur Behauptung wird.
>
> **Regel.** Neuer Code, neues Konzept? Erst hier nachsehen, ob es einen Namen hat.
> Passt keiner, ist das ein Signal zum Nachfragen — nicht zum Improvisieren.

## 1. Schon richtig benannt (nichts zu tun)

| Begriff im Projekt | Etablierter Name | Beleg |
|---|---|---|
| **Fitness Score** (100 %, „clean") | *Architectural Fitness Function* (Ford/Parsons/Kua) | `tools/build_db.js` |
| **Immutable-Law-Catalog**, Regeln A34/S1/P10, maschinell geprüft | *Executable Architecture Rules* / *Policy-as-Code* (Vorbild ArchUnit) | `docs/norm/Immutable-Law-Catalog.md`, `tools/reconciliation.js` |
| **HARD BAN + moderner Ersatz** (51 Regeln) | *Deprecation Registry* | `tools/reconciliation.js --only-rules` |
| **Wegweiser-Gate** (neues Modul muss dokumentiert sein) | *Traceability Matrix* / *Docs-as-Code* | `tools/repo-map-check.mjs` |
| **Satzspiegel** (25/20/20 mm als Bezug der Listen) | Satzspiegel — Fachbegriff der Typografie, kein Methodenanker | `website/js/suggestion-list.js` `passeAnBlattrand` |
| **KNOWN FAIL** im Korpus | *Accepted Baseline* / *Characterization Test* | `test/corpus/run.js` |

## 2. Anders benannt, gleiches Konzept

| Was im Code steht | Etablierter Name | Warum es dasselbe ist |
|---|---|---|
| `address-data.js`: kein DOM, nur reine Funktionen + Indizes | *Functional Core, Imperative Shell* | Der Kern kennt kein I/O; die Fassade (`address.js`) macht DOM und Netz |
| `state.js`: `setWert` → Patch, `applyPatch`, `journal`, `snapshot`, ein `render()` | *Unidirectional Data Flow* mit *Reducer/Command Log* | Zustand fließt in eine Richtung, Änderungen sind nachvollziehbare Patches |
| `setWert(…, origin: 'user' \| 'auto' \| 'logic')` | *Provenance Tracking* | Jeder Wert trägt seine Herkunft — wie „Eingabe- vs. Formelzelle" |
| `spiegelEntscheidung` mit `unklar/auto/manuell` | *Derived State mit klebrigem Override* | Automatik schreibt, bis der Mensch anfasst — dann gehört ihm das Feld |
| `draft-manager.js`: `#commitHistory`, Undo/Redo, `flushPendingSave` | *Memento Pattern* + *Write-Behind Persistence* | Zustandsschnappschüsse für Undo; Schreiben gebündelt statt pro Tastendruck |
| `#initMultiTabSync` | *Last-Write-Wins* über `storage`-Events | Mehrere Tabs, ein Speicherstand; kein Merge |
| `persistence.js`: `_meta.schema` + Werte-Array, `DOCUMENT_SCHEMA_V5` | *Columnar / Tuple Serialization* | Spaltennamen einmal, Werte als Array — siehe `docs/data/ADR-COLUMNAR-DATA.md` |
| `document.js`: `sanitizeRichText` (Allowlist), `get/setCaretCharacterOffset` | *Allowlist Sanitizing* (OWASP) + *Selection Preservation* | Nur erlaubte Tags überleben, die Cursorposition bleibt |
| `boot.js`: blockierendes Script, `data-booting`, 1800-ms-Netz | *Critical Rendering Path Inlining* + *Watchdog* | Zustand steht vor dem ersten Paint; das Netz gibt die Seite notfalls frei |
| `multipage-controller.js`: Höhe messen → Seitenzahl rechnen | *Measure-and-Reflow Pagination* (Ansatz von Paged.js) | Kein Browser paginiert zuverlässig, also messen und nachrechnen |
| `geo-cache.js`: `n`-Zähler, Verdrängung `n` ↑ dann Alter | *LFU mit LRU-Tie-Break* + *Admission-Policy* + *Negative Cache* | siehe KONZEPT-Block im Modul |
| `suggestion-list.js`: `role=option`, `aria-selected`, Blur schließt | *WAI-ARIA Combobox/Listbox* + *Light Dismiss* | Standard-Bedienmuster, keine Eigenentwicklung |
| `flacheVorschlaege`: Sammelzeile erst auf Klick ausklappen | *Progressive Disclosure* | Grobes zuerst, Details auf Nachfrage |
| 5-stufiger `pre-commit` (Lint → Tests → Korpus → Antipatterns → Fitness) | *Shift-Left*-Prüfkette (Stufe 5 = **Fitness Gate**) | Prüfungen laufen vor dem Commit, nicht erst in der CI |
| `.trash/`-Schutz in `githooks/pre-commit` | *Soft Delete* | Löschen wird zu Verschieben; das Verzeichnis selbst ist unantastbar |

## 3. Namensschärfungen (Vorschlag — **nicht** umbenannt)

Umbenennen kostet Vertraute (Kommentare, Tests, Doku) und bringt nur Klarheit, wenn
der alte Name irreführt. Daher: Kommentar an der Fundstelle, Umbenennung nur auf
Zuruf.

| Aktueller Name | Präziser | Warum | Kosten einer Umbenennung |
|---|---|---|---|
| `targetLock` | `sticky search context` | „Lock" klingt nach Nebenläufigkeit/Sperre; gemeint ist „zuletzt gewählte Stadt als Suchkontext" | ~7 Stellen (`address.js`, `address-data.js`, `draft-manager.js`, README) |
| `Immutable-Law-Catalog` | *Architecture Invariants* / *Constitution* | „Law" kollidiert mit dem echten Regelwerk DIN 5008; gemeint sind Architektur-Invarianten | Dateiname + viele Doku-Verweise — **nicht** empfohlen |
| `flacheVorschlaege` | `progressive disclosure` | Der Name beschreibt die Datenform, nicht den Zweck (Sammelzeilen ausklappen) | 2 Aufrufer + 1 Test — günstig |

## 4. Wo bewusst **kein** Anker sitzt

- **DIN-Fachlichkeit**: `Form A`/`Form B`, `Falzmarke`, `Rücksendezeile`, `Satzspiegel`.
  Das sind Fachbegriffe, keine Methodenanker. Ein englischer Methodenname wäre Kosmetik.
- **`Field`** (Minimal-Abstraktion über native Felder und `contenteditable`) und
  **`GRUPPE_AB_PLZ`** (Datenschwelle) — zu klein für einen etablierten Namen;
  ein Anker würde hier nur Bedeutung vortäuschen.

## 5. So wird es benutzt

1. Vor dem Bauen: Hier nachsehen. Steht das Konzept schon drin, den Begriff im
   Code-Kommentar nennen (Muster: `KONZEPT`-Block in `website/js/geo-cache.js`).
2. Nach dem Bauen: neuen Anker ergänzen — mit Beleg, nicht mit Behauptung.
3. Fehlt ein Anker: **fragen**, nicht erfinden.

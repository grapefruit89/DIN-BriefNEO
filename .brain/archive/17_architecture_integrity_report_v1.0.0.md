---
tags: [aviation-grade, platinum-2026, architecture, chrome-146, incremental]
status: cemented
version: 1.0.0
last_audit: 2026-03-21
id: BRAIN-017
title: Architecture Integrity Report — Vollständiger System-Audit
auditor: Lead Systems Auditor (Aviation Grade)
scope: [08_isomorphic_schema_v2.2.0, 09_resilience_strategy_v4.0.0, 15_chrome145_todo_v1.0.0, 03_technical_blueprint, js/core/constants.js, js/logic/logic.js]
---

# 17 — Architecture Integrity Report v1.0.0

## Audit-Methodik

Jede Behauptung in diesem Report ist gegen die tatsächlichen Quelldateien
geprüft — constants.js, logic.js, die vier Brain-Docs. Keine Spekulation.
Befunde sind prüfbar, Quellenangaben sind präzise.

---

## ZUSAMMENFASSUNG (Executive Summary)

```
KRITISCH  4 Befunde — Sofortige Korrektur nötig
GAP       7 Befunde — Fehlende Spezifikation
OPTIMIERUNG 3 Befunde — Strukturelle Verfeinerung
```

Das System ist in seiner Kernlogik konsistent.
Die kritischen Befunde sind Dokumentations-Widersprüche,
kein Laufzeit-Fehler. Das schwerste Problem ist der verwaiste alte
Schema-File mit falschen JSON-Keys.

---

## BLOCK 1: KRITISCHE BEFUNDE

### K-001 — NAMING-CONFLICT: Alter Schema-File mit falschen JSON-Keys

**Schwere:** KRITISCH — Kann LLM-Sessions und zukünftige Agenten fehlleiten.

**Befund:**
Die Datei `08_isomorphic_schema.md` (die ALTE Version, noch im .brain-Ordner)
enthält in Sektion H folgende JSON-Keys:

```
ALTE DATEI (08_isomorphic_schema.md, Sektion H):
  "sender_line": null
  "special_note": null
  "signature_name": null
```

Die aktuelle Wahrheit in `constants.js` IMR und `08_isomorphic_schema_v2.2.0.md`:
```
AKTUELLE WAHRHEIT:
  "sender": null      (war: sender_line)
  "note": null        (war: special_note)
  "signature": null   (war: signature_name)
```

Ein Agent oder LLM, der die falsche Datei liest, produziert JSON mit
`sender_line`, `note`, `special_note` — Felder die in der Akinator-Engine
nicht existieren. Die Daten würden lautlos ignoriert.

**Quellen:** `08_isomorphic_schema.md` Sektion H (alt) vs. `constants.js` Z. 52–62

**Korrekturaktion:**
`08_isomorphic_schema.md` erhält einen SUPERSEDED-Header:
```
status: SUPERSEDED — Nachfolger: 08_isomorphic_schema_v2.2.0.md
WARNUNG: JSON-Keys in Sektion H sind veraltet (sender_line → sender, etc.)
```

---

### K-002 — INTERNER WIDERSPRUCH: @supports-Guard für Anchor Positioning

**Schwere:** KRITISCH — Zwei zementierte Dokumente sagen das Gegenteil.

**Befund:**

`03_technical_blueprint.md` (Chrome 146+ Tabelle, Zeile Anchor Positioning):
> "CSS Anchor Positioning: Mit @supports-Guard verwenden (Firefox-Status prüfen)"

`15_chrome145_todo_v1.0.0.md` (Block C, Präambel):
> "Kein @supports bei 145+ als Ziel. Direkter Einsatz."

Beide Dateien sind `status: cemented`. Beide widersprechen sich direkt.

**Ursache:** Der Blueprint wurde nach dem Chrome-145-Mandate aus BRAIN-015
nicht aktualisiert. Der Blueprint reflektiert noch den "Multi-Browser"-Ansatz.

**Korrekturaktion:**
`03_technical_blueprint.md` muss in einer neuen Version v1.1.0 den Abschnitt
"Chrome Baseline 146+ — Kritische Einschränkung" ersetzen durch:
"Mandate Chrome 145+: Kein @supports nötig für Anchor Positioning, Invokers,
Sanitizer API. Web Baseline ist für dieses Projekt nicht das Ziel."

---

### K-003 — LAYER-DEKLARATION VERALTET: latex.base fehlt im Blueprint

**Schwere:** KRITISCH — Blueprint-Architektur widerspricht IMR v2.2.0.

**Befund:**

`03_technical_blueprint.md` dokumentiert die Layer-Hierarchie als:
```
@layer din.core, ui.theme, project.overrides;
```

`08_isomorphic_schema_v2.2.0.md` Sektion M (latex.css Audit) legt fest:
```
@layer latex.base, din.core, ui.theme, project.overrides;
```

Die IMR Sektion M wurde zementiert, aber der Blueprint nicht aktualisiert.
Jeder Entwickler der sich an den Blueprint hält, implementiert eine falsche
Layer-Deklaration und bricht damit die latex.base-Isolation.

**Korrekturaktion:**
`03_technical_blueprint.md` v1.1.0 — @layer-Deklaration aktualisieren.
Sektion "Schicht 2: ELEMENTS" anpassen: latex.base als neuen schwächsten Layer.

---

### K-004 — ANTI-016-VERSTOSS: todayISO() nutzt noch new Date()

**Schwere:** KRITISCH — Aktiver Code verstößt gegen zementiertes Anti-Pattern.

**Befund:**

`js/logic/logic.js` Z. 33–37:
```javascript
export function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}
```

`05_anti_pattern_registry.md` [ANTI-016]:
> "Verbot: Nutzung der nativen new Date() Klasse für neue Logik."

`09_resilience_strategy_v4.0.0.md` Teil II:
> "Temporal.Now.plainDateISO() gibt immer YYYY-MM-DD zurück. Unverzichtbar
> für den Calendar-Day-Vergleich im Circuit Breaker."

Der Circuit Breaker BRAUCHT Temporal für seinen `lastStrikeDateISO`-Vergleich.
`todayISO()` liefert die Basis dafür — aber noch mit `new Date()`.
Das ist ein direkter ANTI-016-Verstoß und untergräbt das Resilienz-Modell.

**Korrekturaktion:**
`logic.js` muss todayISO() auf Temporal migrieren (BRAIN-015 BLOCK A, ANTI-016).
Polyfill-Einbindung in `index.html` (einmalig).

---

## BLOCK 2: GAP-BEFUNDE

### G-001 — ANCHOR-GAP: 5 von 11 IMR-Feldern ohne anchor-name

**Befund:**

`08_isomorphic_schema_v2.2.0.md` Sektion L dokumentiert nur 6 Anker:
  din-sender, din-subject, din-greeting, din-body, din-date, din-signature

Fehlend (5 Felder ohne anchor-name):
  din-note        ← Vermerkzone — kein Anker für "Einschreiben"-Tooltip
  din-recipient   ← Empfänger — kein Anker für Adress-Validierung
  din-your-ref    ← Ihr Zeichen — kein Anker für Format-Hinweis
  din-our-ref     ← Unser Zeichen — kein Anker für Format-Hinweis
  din-salutation  ← Anrede — kein Anker für Genus-Hinweis

Das Prinzip "TAG = KEY = KOORDINATE = CSS-ANKER" (4. Dimension) ist
für 45% der IMR-Felder NICHT vollständig umgesetzt.

**Warum das wichtig ist:**
Tooltips für Recipient-Validierung (Pflicht-PLZ etc.) können ohne
Anker nicht kontextuell positioniert werden.

**Aktion:** Sektion L in 08_isomorphic_schema_v2.3.0.md auf alle 11 erweitern.

---

### G-002 — LOCALSTORAGE OVERFLOW / CLEARED: Kein Recovery-Protokoll

**Befund:**

`09_resilience_strategy_v4.0.0.md` definiert localStorage als SSoT für
den Circuit-Breaker-Zustand. Zwei Failure-Szenarien sind NICHT dokumentiert:

**Szenario A — localStorage geleert:**
Browser-Privacy-Einstellungen oder manuelles Löschen setzen alle Circuit-Breaker
auf GREEN. Ein Dienst der 13 von 14 Tagen ausgefallen war startet frisch.
Das ist SICHER (kein Datenverlust) aber UNERWARTET (Hysterese-Gedächtnis weg).
Kein Nutzer-Hinweis. Kein Protokoll.

**Szenario B — QuotaExceededError:**
`state.js` hat: `try { localStorage.setItem(...) } catch { /* silent */ }`
Beim Circuit-Breaker-Update: Wenn die Phase-Änderung (z.B. AMBER → RED)
nicht persistiert wird wegen QuotaError, ist der In-Memory-State (RED)
inkongruent mit dem localStorage-State (AMBER). Beim nächsten App-Start:
System denkt der Dienst ist AMBER, resettet ihn nach einer Probe-Request —
obwohl er RED sein sollte. Das Circuit-Breaker-Gedächtnis ist korrumpiert.

**Aktion:** `09_resilience_strategy_v5.0.0.md` — Recovery-Sektion ergänzen:
- Bei localStorage-cleared: Pflicht-Hinweis im Control-Center
- Bei QuotaExceededError: Kritische Dienste priorisiert speichern,
  nicht-kritische Silent-Drop

---

### G-003 — GHOST-MIRROR MULTI-PAGE: Page-Break nicht spezifiziert

**Befund:**

`08_isomorphic_schema_v2.2.0.md` Sektion K definiert den Print-State:
```
din-body: display:none | din-body-mirror: display:block
```

Nicht dokumentiert:
1. Wie ist `din-body-mirror` positioniert? Es ist eine neue Custom-Tag.
   `din-body` hat `position: absolute` in @layer din.core. Hat `din-body-mirror`
   identische Positionierung? Wenn ja — wo ist das im CSS spezifiziert?
   Wenn nein — die Elemente überlagern sich nicht korrekt.

2. Bei mehrseitigen Briefen (Inhalt > 1 Seite):
   `break-inside: avoid` auf welche Elemente in din-body-mirror?
   p, li, blockquote — alle? Keines? Das ist unspezifiziert.

3. Die `din-body-mirror` führt zu DOPPELTEM DOM:
   Inhalt existiert als Plaintext in `din-body` UND als HTML in `din-body-mirror`.
   Bei Mehrseitigkeit fließen beide — aber nur einer wird gedruckt.
   Das Layouts-Reflow durch den Mirror könnte die DIN-Maße des restlichen
   Inhalts auf Seite 1 verschieben wenn Mirror auf `display: block` wechselt.

**Aktion:** SPEC-029 (Multi-Page) muss Ghost-Mirror-Interaktion spezifizieren.

---

### G-004 — JSON-BACKUP IMPORT: Keine Schema-Validation

**Befund:**

`ui.js _bindActions()` beim Datei-Import:
```javascript
reader.onload = ev => {
  try { this.sm.load(JSON.parse(ev.target.result)); }
  catch { this._toast('Ungültige Datei', 'error'); }
};
```

Kein IMR-Schema-Check. Ein JSON-Backup aus der IMR-v1-Ära
(mit Keys `sender_line`, `special_note`, `signature_name`) wird
geladen, scheinbar erfolgreich — aber die falschen Keys landen im State.
Die Felder bleiben leer. Kein Fehler, keine Meldung.

Dieser Migrations-Gap zwischen IMR v1 → v2 ist nirgends als
Migration-Guide dokumentiert. Alte Backups sind still-inkompatibel.

**Aktion:** Import-Funktion muss IMR-Key-Validation + Legacy-Mapping haben.
Dokumentation: Welche Keys wurden in welcher Version umbenannt?

---

### G-005 — INTERMITTENT SERVICE: Reset-Logik schützt nicht gegen Dauerstörer

**Befund:**

Das Daily-Strike-Modell schützt vor dauerhaft toten Diensten (14 Tage BLACK).
Es schützt NICHT vor Diensten die chronisch instabil aber nie komplett tot sind.

Beispiel-Szenario:
  Tag 1: 5 Fehler → 1 Strike (Punkte: 1)
  Tag 2: Probe gelingt → Auto-Reset (Punkte: 0, Phase: GREEN) ← PROBLEM
  Tag 3: 5 Fehler → 1 Strike (Punkte: 1)
  Tag 4: Probe gelingt → Auto-Reset (Punkte: 0)
  ...ad infinitum

Ein Dienst der täglich ausfällt, aber jeden zweiten Tag für 1 Probe-Request
antwortet, ERREICHT NIE BLACK. Das Hysterese-Modell ist unwirksam für
intermittente Dienste. Der Nutzer bekommt täglich schlechte API-Erfahrung
ohne dass das System eskaliert.

**Aktion:** BRAIN-009 v5: Hysterese-Erweiterung — "Consecutive-Success-Threshold":
Auto-Reset nur wenn X aufeinanderfolgende Erfolge (z.B. X=3) — nicht bei 1.

---

### G-006 — ADR-010 NICHT FORMALISIERT

**Befund:**

`08_isomorphic_schema_v2.2.0.md` Sektion M dokumentiert die latex.css-Entscheidung
als "ADR-010 Entscheidung" — aber es gibt keine Datei `14_adr_010_latex.md`
oder ähnliches. Der ADR-Register in GEMINI.md endet bei ADR-009.

`08_isomorphic_schema_v2.2.0.md` Sektion M trägt in der traceability:
`[ADR-008, ADR-009, ADR-010, ...]` — ADR-010 referenziert aber keine
existierende Quelldatei.

Folge: Ein Agent kann "ADR-010" nicht auflösen. Die Entscheidung ist
de facto dokumentiert (Sektion M), aber nicht als eigenständiger ADR zementiert.

**Aktion:** `16_adr_010_latex_css.md` erstellen mit dem Inhalt aus Sektion M,
GEMINI.md ADR-Register aktualisieren.

---

### G-007 — TEMPORAL TIMEZONE: UTC vs. Lokal nicht spezifiziert

**Befund:**

`09_resilience_strategy_v4.0.0.md` Teil II:
> "Temporal.Now.plainDateISO() gibt immer YYYY-MM-DD zurück. Überall. Deterministisch."

Das ist technisch korrekt — aber es gibt eine Nuance:
`Temporal.Now.plainDateISO()` gibt das Datum in **UTC** zurück, nicht in der
lokalen Zeitzone des Nutzers.

Edge-Case: Nutzer in Tokyo (UTC+9), 08:00 Uhr Lokalzeit.
UTC ist 23:00 des Vortages. `plainDateISO()` gibt den Vortag zurück.
Ein Strike um 08:00 Ortszeit wird als "gestern" geloggt.
Am nächsten Tag (Lokalzeit) stimmt der Vergleich wieder — aber für
diesen Nutzer deckt ein "Kalendertag" nur 15 Stunden Lokalzeit ab.

Für das Daily-Strike-Modell ist das konservativ (gut) aber undokumentiert.
Die korrekte Implementation wäre:
`Temporal.Now.plainDateISO(Temporal.Now.timeZoneId())`
— gibt das Datum in der lokalen Zeitzone zurück.

**Aktion:** Spezifikation in 09 v5 präzisieren: Welche Zeitzone ist die Referenz?
Empfehlung: Lokale Zeitzone via `Temporal.Now.timeZoneId()`.

---

## BLOCK 3: OPTIMIERUNGEN

### O-001 — Sektion L: Alle 11 Anker vollständig dokumentieren

Sektion L in IMR v2.2.0 dokumentiert nur 6 von 11 anchor-names mit
Nutzen-Beschreibung. Die anderen 5 fehlen nicht im Prinzip, nur in der
Dokumentation. Der nächste IMR-Release (v2.3.0) sollte alle 11 vollständig
dokumentieren mit spezifischen Tooltip-Szenarien:

| HTML-Tag       | anchor-name         | Tooltip-Nutzung (Beispiel)              |
|----------------|---------------------|-----------------------------------------|
| din-note       | --din-note          | Maximale Zeichenzahl für Vermerke       |
| din-recipient  | --din-recipient     | "PLZ fehlt"-Validierung                 |
| din-your-ref   | --din-your-ref      | Format-Hinweis "Ihr Zeichen"            |
| din-our-ref    | --din-our-ref       | Format-Hinweis "Unser Zeichen"          |
| din-salutation | --din-salutation    | "Kein Satzzeichen am Ende"-Hint         |

---

### O-002 — BRAIN-015 und Blueprint synchronisieren

Die Chrome-145-Mandate ist in BRAIN-015 klar definiert aber im Blueprint
noch nicht reflektiert. Ein neuer Entwickler liest zuerst den Blueprint
(the constitution), nicht BRAIN-015 (the todo list). Er würde @supports-Guards
implementieren, die nicht nötig sind.

Priorität: `03_technical_blueprint_v1.1.0.md` erstellen — Chrome-145-Mandate
als erste Zeile, @supports-Empfehlungen streichen, latex.base-Layer ergänzen.

---

### O-003 — Alte Schema-Datei als SUPERSEDED markieren

`08_isomorphic_schema.md` (ohne Versions-Suffix) existiert noch und
hat falsche JSON-Keys. Auch wenn die Regel Zero nun neue Dateien
mit Suffix vorschreibt, bleibt die alte Datei ein Risiko.

Sofortige Massnahme (kein neues File nötig):
Ersten 5 Zeilen der alten Datei ersetzen durch SUPERSEDED-Banner
(das ist eine legitime KLASSE-2 append-Operation am Anfang):

```
⚠️ SUPERSEDED — Diese Datei ist veraltet.
Nachfolger: 08_isomorphic_schema_v2.2.0.md
JSON-Keys in Sektion H sind falsch (sender_line → sender etc.)
Nicht für Produktions-Prompts verwenden.
```

---

## BLOCK 4: KONSISTENZ-BESTÄTIGUNG (was KORREKT ist)

Zur Vollständigkeit: Diese Aspekte sind nachweislich konsistent.

### ✓ IMR-Code-Konsistenz

`constants.js` IMR (11 Einträge) stimmt 1:1 mit `08_isomorphic_schema_v2.2.0.md`
Sektionen A–E überein. Alle tag/key-Mappings korrekt. Tag-zu-Key-Formel
`tag.slice(4).replace(/-/g,'_')` ist in Code und Dokumentation identisch.

### ✓ ADR-008 vollständig implementiert

`constants.js`: richText-Flag entfernt (TOMB-L008). ✓
`logic.js`: readDOMasJSON() liest ausschließlich textContent. ✓
Sektion K (Ghost-Mirror): Screen-State-Maschine vollständig beschrieben. ✓
ADR-008 ist in GEMINI.md, constants.js, logic.js und IMR konsistent.

### ✓ ADR-009 konsistent

`14_adr_009_ssot.md`: Vollständige Begründung. ✓
IMR v2.2.0 Sektion I: "ADR-009: Primäre SSoT ist css/din5008-paper.css" ✓
`03_technical_blueprint.md`: "CMA Layer 3 Fallback" korrekt beschrieben. ✓

### ✓ Reset-Widerspruch: KEIN Widerspruch

"Auto-Reset bei Erfolg" (GREEN/AMBER/RED) vs. BLACK (kein Auto-Reset):
Das ist keine Race Condition sondern eine explizite Designentscheidung.
BLACK erfordert manuellen Reset — das ist klar und konsistent dokumentiert.
Kein logisches Loch.

### ✓ Silent Failure: Kein UX-Gap für Standard-APIs

Für alle Tier-1-APIs (IBAN, Feiertage, Bundesbank) gibt es lokale Fallbacks.
Degradation ist transparent — der Nutzer kann weiterarbeiten.
Einzige problematische Ausnahme: Feiertagskalender (G-002-ähnlich, aber
spezifisch für Fristenberechnungen mit veralteter Statik-Tabelle).
Das ist in BRAIN-009 Teil V dokumentiert: "unbegrenzt Cache-TTL" —
was faktisch bedeutet: nie aktualisiert, bis manuell erneuert.

### ✓ latex.base Layer-Isolation ist sicher

Pattern Mining extrakt (hyphens, text-rendering, font-feature-settings)
berührt KEINE Layout-Properties (position, top, left, width, height).
Selbst wenn @layer latex.base NICHT korrekt deklariert wird und die
Regeln globaler wirken — sie verursachen keinen mm-Drift.
K-003 ist ein Blueprint-Konsistenzproblem, kein Laufzeit-Risiko.

---

## BLOCK 5: PRIORISIERTE AKTIONS-MATRIX

```
PRIORITÄT 1 — SOFORT (nächste Session):
  K-001  08_isomorphic_schema.md SUPERSEDED-Header → 5 Zeilen, 2 Minuten
  K-004  logic.js: todayISO() auf Temporal migrieren → SPEC erstellen
  K-002  03_technical_blueprint_v1.1.0.md → Chrome-145-Mandate + latex.base

PRIORITÄT 2 — NÄCHSTE SPEC-RUNDE:
  G-001  IMR v2.3.0 — alle 11 anchor-names in Sektion L
  G-006  16_adr_010_latex_css.md erstellen
  K-003  Blueprint Layer-Deklaration aktualisieren (Teil von K-002)

PRIORITÄT 3 — LANGFRISTIG (eigene SPECs):
  G-002  LocalStorage-Recovery-Protokoll (09 v5)
  G-003  Ghost-Mirror Multi-Page spezifizieren (SPEC-029)
  G-004  JSON-Import Schema-Validation + Legacy-Mapping
  G-005  Hysterese: Consecutive-Success-Threshold (09 v5)
  G-007  Temporal Timezone-Referenz präzisieren (09 v5)

OPTIMIERUNGEN (keine Priorität, bei nächster Berührung):
  O-001  Sektion L vervollständigen (Teil von G-001)
  O-002  Blueprint synchronisieren (Teil von K-002)
  O-003  SUPERSEDED-Banner (Teil von K-001)
```

---

## DEFINITION OF DONE — AUDIT-ERGEBNIS

Das System ist in seiner Kernlogik (IMR, State-Management, ADR-008/009)
konsistent und funktional. Die 4 kritischen Befunde sind allesamt
Dokumentations-Widersprüche, kein Laufzeit-Fehler.

Der schwerste Einzelbefund ist K-001 (alte Schema-Datei mit falschen Keys) —
eine Quelle von Fehlinformation für zukünftige Agenten und LLMs.
Er ist in 5 Minuten behoben.

Der systemic wichtigste Befund ist K-004 (todayISO mit new Date()) —
der einzige Fall wo aktiver Code gegen ein zementiertes Anti-Pattern verstößt.

Nach Abarbeitung von Priorität 1 ist das Fundament versiegelt.

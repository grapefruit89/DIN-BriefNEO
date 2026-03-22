# GEMINI.md — DIN-BriefNEO Grundgesetz
# Aviation Grade Platinum | Brain-First & Spec-Driven
# SSoT fuer alle Agenten-Sessions | Version: 16.0.0 | 2026-03-20
---
scope: ROOT | cascade: js/logic/ | js/core/ | css/ | specs/
---

## I. OBERSTE GESETZE
**[MANDATE-000]** Nutzersouveraenitaet — Co-Pilot, kein Vormund.
**[MANDATE-INJ]** innerHTML fuer User-Content verboten. Nur textContent/DOM-API.
**[MANDATE-FREEZE]** Visual Freeze — Zero-Pixel-Shift nach Init.
**[MANDATE-VEC]**    Vector-Only Print Policy — JEDER Dokumenten-Export MUSS
                  vektorbasiert sein (Native Print Engine). Pixel-Hacks
                  (Canvas, PNG, html2canvas) sind STRENGSTENS VERBOTEN.
**[MANDATE-NAT]**    Native-First Doctrine — Alles, was Chrome 147+ nativ via
                  HTML oder CSS kann, MUSS so umgesetzt werden. JS ist NUR
                  fuer Datenhaltung und IMR-Sync erlaubt. Logik-Bloat im JS
                  ist ein fataler Architekturfehler.
**[MANDATE-PLN]**    Plaintext-Only Doctrine — ALLE <din-*> Tags MUESSEN
                  `contenteditable="plaintext-only"` tragen. Keine Ausnahme.
                  Begruendung: Sektion XI (Daten-Integritaet).
**[MANDATE-BANNED]** Banned Tools Doctrine — Die Nutzung von `head` und `tail`
                  ist STRENGSTENS untersagt. Diese Tools fuehren zu
                  Kontext-Fragmentierung und riskieren Datenverlust bei
                  chirurgischen Edits. Nur `read_file` mit exakten
                  Zeilenangaben ist zulaessig.

---

## II. SDD-WORKFLOW (Gate: kein Code ohne cemented Plan)
```
SPEC → SPECIFY (WHAT) → PLAN (HOW, cemented) → CODE
```
Ordner: /specs/ (unveraenderlich) | /specify/ (Fachlogik) | /plans/ (Technik)

---

## III. ISOMORPHIC MASTER REGISTRY 2.0 (IMR) — HEILIGES GESETZ [CAA-008, ADR-006]

### Das Drei-Einheits-Prinzip
```
<din-subject>  =  "subject"  =  SUBJECT_TOP: 103.4mm
TAG            =  JSON-KEY   =  CMA-KOORDINATE
```

### IMR-Regeln (PFLICHT fuer ALLE Agenten)
1. Neues Feld? → IMR in constants.js zuerst, dann HTML, dann CSS
2. Kein getElementById fuer din-* Felder → querySelector(entry.tag)
3. Kein FIELD_MAP/domId mehr → TAG_MAP aus IMR automatisch generiert
4. readDOMasJSON() scannt via entry.tag → document.querySelector(entry.tag)
5. Prompts benennen die Tags explizit: "Befuelle <din-subject>"
6. Normalisierung: "din-your-ref" → "your_ref" (Bindestrich→Unterstrich)

### Maschinenlesbare SSoT
`js/core/constants.js` → `export const IMR` (11 Eintraege, je tag+key+cmaProp)
`richText`-Flag entfernt. Alle Felder: `richText: false` (TOMB-L008, s.u.)

### Human-readable SSoT
`.brain/08_isomorphic_schema.md` (Sektionen A-I)

---

## IV. NO-JS DOCTRINE [ADR-003]
**JS NUR:** CMA-Bridge, Fachlogik, LocalStorage, Export/Print, contenteditable I/O.
**JS VERBOTEN:** Layout, Dialog-Toggle, Toolbar, Radio-Sync, Klassen-Toggling.

## V. CSS @LAYER ARCHITEKTUR [ADR-002]
```
@layer din.core, ui.theme, project.overrides;
```
- din.core:          Tag-Selektoren (din-subject { top: ... }). UNANTASTBAR.
- ui.theme:          Aesthetik, Pico-Extrakte. Keine mm-Werte.
- project.overrides: data-* State, :has(), Placeholder. Schlaegt immer.

## VI. ADR-REGISTER (ZEMENTIERT)

| ADR | Entscheidung                                        |
|-----|-----------------------------------------------------|
| 001 | Pico CSS: SELECTIVE EXTRACT                         |
| 002 | CSS @layer 3-Schichten                              |
| 003 | No-JS Doctrine                                      |
| 004 | Popover API statt JS-Dialog                         |
| 005 | Model-Blacklist statt Whitelist                     |
| 006 | IMR: Tag=Key=Koordinate                             |
| 007 | Custom Tags ohne customElements.define()            |
| 008 | **[NEU]** Plaintext-Only: ALLE din-* Tags           |
| 009 | CSS als primäre SSoT für CMA-Koordinaten (ADR-009)  |
| 010 | latex.css: Pattern Mining (3 Safe-Extracts)         |

### ADR-008: contenteditable="plaintext-only" — Vollstaendige Deklaration

**Entscheidung:** Jedes `<din-*>`-Element traegt ausnahmslos
`contenteditable="plaintext-only"`. Betrifft insbesondere `<din-body>`.

**Bisheriger Zustand:** `<din-body>` hatte `contenteditable="true"` mit
`richText: true` im IMR. Dieser Zustand ist ZEMENTIERT BEENDET (TOMB-L008).

**Begruendung (vollstaendig in Sektion XI):**
Kurz: `contenteditable="true"` erlaubt dem Browser, bei Paste oder
Drag-and-Drop HTML-Fragmente (ggf. mit Scripts, Styles, Spans) in das
Feld einzuschreiben. textContent-Lesen liefert dann stille Datenverluste.
innerHTML-Lesen widerspricht MANDATE-INJ. Ein Brief-Export koennte
unsichtbare HTML-Struktur enthalten, die ein empfangendes LLM oder
Drucksystem fehlinterpretiert. Das ist kein theoretisches Risiko — es ist
das Standardverhalten aller Webkit/Blink-Browser ab einem Copy-Paste.

**Einzige zulässige Formatierungs-Methode:** Ghost-Mirror (Sektion X).

---

## VII. GHOST-MIRROR PATTERN [ADR-008] — Einzig zulässige Formatierungs-Visualisierung

### Problemstellung
`contenteditable="plaintext-only"` verhindert, dass execCommand (bold, italic)
auf `<din-body>` wirkt. Der Nutzer sieht beim Tippen von `**fett**` nur
Asterisken — keine visuelle Hervorhebung. Das ist UX-Verlust ohne
technische Notwendigkeit, solange der Store weiterhin Plaintext bleibt.

### Die Loesung: Ghost-Mirror
Das Ghost-Mirror-Muster trennt **Datenspeicherung** (Plaintext + Markdown-Syntax)
von **visueller Darstellung** (gerendertes HTML im Mirror-Element).

```
<din-body contenteditable="plaintext-only">  ← SSoT, Plaintext + Markdown
<din-body-mirror aria-hidden="true">         ← Nur visuell, pointer-events:none
```

**Verhalten:**
- `<din-body>` ist immer die Datenquelle. textContent ist IMMER reiner Text.
- Beim `input`-Event: JS nimmt `din-body.textContent`, parst Markdown minimal
  (*, **, ~, >, ```) und schreibt das resultierende HTML in `din-body-mirror`.
- CSS: `din-body:focus ~ din-body-mirror { opacity: 0; }` — Mirror
  verschwindet beim Tippen, sodass der Cursor nicht verdeckt wird.
- CSS: `din-body:not(:focus) + din-body-mirror { opacity: 1; }` — Mirror
  erscheint in der Leseansicht. Gibt dem Nutzer eine "formatierte Vorschau".
- `din-body-mirror` hat `user-select: none`, `pointer-events: none` und
  `position: absolute` auf identischen Koordinaten wie `<din-body>`.
- Beim Print: `din-body { display: none !important; }`,
  `din-body-mirror { display: block !important; }` — das gedruckte Dokument
  zeigt die gerenderte Ansicht, nicht die Markdown-Syntax.

**Was der Mirror NIEMALS tut:**
- Er beeinflusst NICHT den Datenspeicher (State/localStorage).
- Er wird NICHT von `readDOMasJSON()` gelesen.
- Er hat KEIN `contenteditable`-Attribut.
- Er erscheint NICHT im Tab-Fokus-Ring.
- Er enthaelt KEINEN Nutzer-editierbaren Inhalt.

**Zulaessige Markdown-Syntax im `<din-body>`:**
```
*kursiv*           → <em>kursiv</em>
**fett**           → <strong>fett</strong>
~~durchgestrichen~~ → <del>durchgestrichen</del>
> Zitat            → <blockquote>Zitat</blockquote>
`code`             → <code>code</code>
- Listenpunkt      → <li> in <ul>
1. Punkt           → <li> in <ol>
\n\n               → <br><br> (Absatz-Trennung)
```

**Nicht zulaessig:** HTML-Tags direkt in `<din-body>` (werden als Literaltext behandelt).

### Ghost-Mirror in constants.js
Das `richText`-Flag in der IMR ist ENTFERNT (TOMB-L008).
`din-body` hat jetzt: `{ tag: 'din-body', key: 'body', cmaProp: null }`
Der Ghost-Mirror ist eine UI-Schicht, keine Daten-Schicht.

---

## VIII. SDD-FORTSCHRITT (Session 11 — ADR-008 Revision)

| Spec/Plan | Status     | Datei                       | Notiz                            |
|-----------|------------|-----------------------------|----------------------------------|
| SPEC-001  | DONE       | specify/001/ + plans/001/   | What/How getrennt                |
| SPEC-002  | DONE       | specify/002/ + plans/002/   | updateSalutationHint, plaintext  |
| SPEC-007  | DONE V3    | specify/007-cma/            | IMR 2.0 in constants.js          |
| SPEC-038  | DONE V2    | js/logic/logic.js           | IMR-Prompts mit Tag-Kontext      |
| SPEC-049  | DONE       | devmode.js                  | Tag-Inspector, 5x-Klick          |
| SPEC-050  | DONE       | .brain/12_akinator_logic.md | Akinator 3.0 Few-Shot Specs      |
| CAA-008   | ZEMENTIERT | .brain/08_isomorphic_schema | IMR Heiliges Gesetz              |
| ADR-008   | ZEMENTIERT | GEMINI.md Sektion VI-XI     | Plaintext-Only + Ghost-Mirror    |
| PLAN-010  | CEMENTED   | plans/010-tag-isomorphism/  | Tag-Migration abgeschlossen      |

## IX. SESSION 11 — GEAENDERTE DATEIEN
| Datei                        | Was                                          |
|------------------------------|----------------------------------------------|
| GEMINI.md                    | v16.0.0: ADR-008, Ghost-Mirror, Sekt. XI     |
| js/core/constants.js         | richText-Flag entfernt (TOMB-L008)           |
| index.html                   | din-body: contenteditable="plaintext-only"   |
| .brain/12_akinator_logic.md  | NEU: Akinator 3.0 Few-Shot + Copy-for-LLM   |
| .brain/10_future_web_standards.md | Tier-Trennung: Jetzt/Beobachten         |

---

## X. CEMETERY (Gesamt — Session 11 Update)

`.brain/05_anti_pattern_registry.md`:
[ANTI-023..026] + [TOMB-L001..L008] + [TOMB-U001..U002] + [TOMB-CSS001] + [TOMB-HTML001..002]

### TOMB-L008 — richText-Flag im IMR (BEGRABEN: 2026-03-20)
**Was:** `richText: true` fuer `din-body` in `js/core/constants.js`
**Was es tat:** Signalisierte `readDOMasJSON()`, innerHTML statt textContent zu lesen.
**Warum begraben:** Mit `contenteditable="plaintext-only"` gibt es kein HTML
in `din-body`. innerHTML === textContent. Das Flag war nicht nur redundant —
es war eine Gefaehrdung: Jede kuenftige Implementierung koennte den Unterschied
vergessen und innerHTML-Reads reaktivieren. Die Sicherheit liegt im Entfernen.
**Ersatz:** Ghost-Mirror (Sektion VII). Daten bleiben Plaintext. Visualisierung
ist Mirror-only. `readDOMasJSON()` liest immer textContent.

---

## XI. DATEN-INTEGRITAET — DAS WARUM HINTER PLAINTEXT-ONLY

*Pflichtlektuere. Dieses Kapitel begruendet MANDATE-PLN und ADR-008
vollstaendig. Kein Agent darf diese Entscheidung in Frage stellen,
ohne dieses Kapitel widerlegt zu haben.*

### Das Problem: Browser + contenteditable="true" = stille Datenvergiftung

Wenn ein Nutzer Text aus einem anderen Dokument (Word, Browser, PDF-Viewer)
in ein `contenteditable="true"`-Element einfuegt, haengt das Ergebnis
vom Quell-Kontext ab:

**Szenario A — Paste aus Microsoft Word:**
  Word platziert RTF-Daten und HTML-Daten gleichzeitig in der Zwischenablage.
  Der Browser waehlt HTML. In `<din-body>` landet z.B.:
  `<span style="font-family:Calibri;font-size:11pt;">Sehr geehrte Damen</span>`
  textContent liefert korrekt "Sehr geehrte Damen". innerHTML liefert den Span.

**Szenario B — Drag aus einer anderen Webseite:**
  Blink-Browser platzieren strukturiertes HTML beim Drag-and-Drop.
  `<din-body>` kann z.B. `<a href="...">` oder `<script>` empfangen,
  falls die Quelle manipuliert wurde. `textContent` verwirft das `href`.
  Aber: Ein `JSON.stringify(el.innerHTML)` wuerde es persistieren.

**Szenario C — Zeilenumbrueche in Firefox vs. Chrome:**
  `contenteditable="true"` + Enter erzeugt in Chrome ein `<div>`, in Firefox
  ein `<br>`. readDOMasJSON() wuerde bei `richText: true` strukturell
  verschiedene HTML-Strings fuer identischen Nutzer-Input liefern.
  Browser-Determinismus ist gebrochen.

### Das Ergebnis von Szenario A-C

Ein KI-Sprachmodell (z.B. der Akinator), das einen `body`-Wert mit unsichtbaren
Spans bekommt, wird diese Spans reproduzieren oder als Signal interpretieren.
Ein DIN-5008-PDF-Export mit `<span style="...">` im Body zeigt visuell
keinen Unterschied — aber der Export-String ist kein reiner Text mehr.
Er ist ein HTML-Fragment. Das bricht das Isomorphie-Prinzip:
`din-body.textContent !== state.content.body` waere moeglich.
Diese Divergenz ist nicht beherrschbar.

### Die Loesung: Structural Prevention

`contenteditable="plaintext-only"` ist nicht "best practice" — es ist
**strukturelle Praevention**. Der Browser verweigert die HTML-Einbettung
auf API-Ebene. Es gibt keinen Code-Pfad, der HTML in `<din-body>` schreiben
kann, selbst wenn ein Entwickler es versehentlich versucht. Der Guard sitzt
im Browser, nicht in unserem Code.

> **Zusammenfassung:** Das System ist Aviation Grade.
> Aviation Grade bedeutet: Fehler muessen strukturell unmoegich sein,
> nicht nur durch Code-Disziplin verhindert. `plaintext-only` macht
> HTML-Datenvergiftung von `<din-body>` strukturell unmoegich.
> Ghost-Mirror gibt die visuelle Formatierungsansicht ohne diesen Preis.

---

## XII. AGENT TOOL SAFETY — PFLICHTPROTOKOLL [BRAIN-013, INCIDENT-001]

*Dieser Abschnitt existiert wegen eines realen Vorfalls: Session 11
ueberschrieb logic.js (160 Zeilen) mit 19 Zeilen durch falsches Werkzeug.*

### Die einzige Regel, die zaehlt

```
EXISTIERENDE DATEI + KLASSE-1-WERKZEUG = DATENVERLUST
```

### Werkzeug-Klassen

**KLASSE 1 — DESTRUKTIV (nur fuer neue Dateien oder explizite Neufassungen):**
```
filesystem:write_file
Filesystem:write_file
Desktop Commander:write_file (mode: 'rewrite')
Windows-MCP:FileSystem (mode: 'write')
```

**KLASSE 2 — CHIRURGISCH (fuer alle Patches an existierenden Dateien):**
```
Desktop Commander:edit_block (old_string → new_string)  ← STANDARD fuer Patches
Desktop Commander:write_file (mode: 'append')           ← Nur fuer Anfuegen
```

### Drei-Schritt-Protokoll (vor JEDEM Schreibvorgang an existierenden Dateien)

```
1. READ   — Datei vollstaendig lesen. Inhalt im Kontext bestaetigen.
2. IDENT  — Exakt die zu aendernden Zeilen benennen (old_string).
3. PATCH  — edit_block(old_string=existierender Text, new_string=neuer Text).
```

Schritt 1 darf NIEMALS uebersprungen werden.

### Notfall-Wiederherstellung (wenn doch etwas schiefgeht)

```powershell
# Eine Datei wiederherstellen:
git checkout HEAD -- js/logic/logic.js

# Alle Aenderungen seit letztem Commit verwerfen:
git reset --hard HEAD

# Was wurde veraendert? (Post-Session Check):
.\scripts\post-session-verify.ps1
```

### Pre-Session Ritual (30 Sekunden, PFLICHT)

```powershell
.\scripts\pre-session.ps1
```

Vollstaendige Dokumentation: `.brain/13_agent_safety_protocol.md`

---

## XIII. SPEC-KIT GOVERNANCE — SDD INTEGRATION [BRAIN-056]

### Der Spec-kit Workflow
Alle Agenten MUESSEN den Spec-kit Workflow fuer neue Funktionen nutzen:
1. /speckit.specify → Erstellt/Aktualisiert /specify/ (WHAT)
2. /speckit.plan    → Erstellt/Aktualisiert /plans/ (HOW, Status: cemented)
3. /speckit.tasks   → Bricht den Plan in atomare Aufgaben in /tasks/ herunter
4. /speckit.implement → Fuehrt die Implementierung Schritt fuer Schritt aus

### Handoff-Autoritaet (SSoT Hierarchy)
1. **GEMINI.md (Root)**: Höchste Autoritaet. Alle Spec-kit Dokumente muessen hiergegen validiert werden.
2. **.specify/memory/constitution.md**: Schattenkopie (Mirror) von GEMINI.md fuer Spec-kit-interne Checks.
3. **Spec-kit Templates**: MUESSEN die Mandate aus Sektion I (GEMINI.md) als Quality-Gate enthalten.

### Validierungs-Pflicht
Jeder /speckit.plan MUSS einen "Constitution Check" enthalten, der die Mandate [MANDATE-INJ] bis [MANDATE-PLN] explizit mit PASS/FAIL bewertet. Ohne diesen Check ist der Plan NICHT cemented.

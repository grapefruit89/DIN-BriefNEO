<!--
Sync Impact Report:
- Version change: 10.0.0 → 16.0.1
- List of modified principles:
  - Truth (v10) → I. TRUTH: The Brain-First Mandate (v16)
  - Vanilla Purity (v10) → II. VANILLA PURITY: Zero Dependencies & MANDATE-NAT
  - Visual Freeze (v10) → III. VISUAL FREEZE: DIN 5008 Geometry & MANDATE-VEC
- Added sections:
  - MANDATE-INJ (Security)
  - MANDATE-PLN (Plaintext-Only Integrity)
  - IMR: ISOMORPHIC MASTER REGISTRY 2.0
  - NO-JS DOCTRINE [ADR-003]
  - AGENT TOOL SAFETY — PFLICHTPROTOKOLL
- Templates requiring updates (✅ updated):
  - .specify/memory/constitution.md
-->

# v4 Core DIN-BriefNEO Constitution

**Version**: 16.0.1 | **Last Amended**: 2026-03-22 | **Ratified**: 2026-03-19

## I. OBERSTE GESETZE (MANDATES)

### [MANDATE-000] Nutzersouveraenitaet

Co-Pilot, kein Vormund. Der Nutzer behält die endgültige Kontrolle über alle Inhalte und Layout-Entscheidungen.

### [MANDATE-INJ] Security First

innerHTML für User-Content ist STRENGSTENS verboten. Nur textContent oder DOM-API verwenden, um XSS und Injektionen strukturell zu verhindern.

### [MANDATE-FREEZE] Visual Freeze

Zero-Pixel-Shift nach der Initialisierung. Das Layout muss deterministisch und stabil sein. Keine dynamischen Layout-Sprünge durch nachladende Inhalte.

### [MANDATE-VEC] Vector-Only Print Policy

Jeder Dokumenten-Export MUSS vektorbasiert sein (Native Print Engine). Pixel-basierte Hacks (Canvas, PNG, html2canvas) sind verboten, um die Druckqualität der DIN 5008 zu garantieren.

### [MANDATE-NAT] Native-First Doctrine

Alles, was moderne Browser (Chrome 147+) nativ via HTML oder CSS lösen können, MUSS so umgesetzt werden. JS ist auf Datenhaltung und IMR-Sync beschränkt.

### [MANDATE-PLN] Plaintext-Only Doctrine

ALLE <din-\*> Tags müssen `contenteditable="plaintext-only"` tragen. Dies verhindert die "stille Datenvergiftung" durch HTML-Paste und garantiert Datenintegrität.

### [MANDATE-BANNED] Banned Tools Doctrine

Die Nutzung von `head` und `tail` ist STRENGSTENS untersagt. Diese Tools fuehren zu Kontext-Fragmentierung und riskieren Datenverlust bei chirurgischen Edits. Nur `read_file` mit exakten Zeilenangaben ist zulaessig.

---

## II. ISOMORPHIC MASTER REGISTRY 2.0 (IMR) [CAA-008]

Das Drei-Einheits-Prinzip gilt ausnahmslos: `TAG = JSON-KEY = CMA-KOORDINATE`.

- Kein `getElementById` für Inhaltsfelder; stattdessen `querySelector(entry.tag)`.
- Die `TAG_MAP` wird automatisch aus der IMR generiert.
- SSoT (Single Source of Truth) is `js/constants.js`.

---

## III. NO-JS DOCTRINE [ADR-003]

JS ist NUR erlaubt für: CMA-Bridge, Fachlogik, LocalStorage, Export/Print und contenteditable I/O.
JS ist VERBOTEN für: Layout-Berechnungen, Dialog-Toggles (Popover API nutzen!), Toolbar-Visibility oder CSS-Klassen-Toggling (CSS `:has()` nutzen).

---

## IV. AGENT TOOL SAFETY — PFLICHTPROTOKOLL

Um Datenverlust durch KI-Agenten zu verhindern:

1. **READ**: Datei vor dem Schreiben vollständig lesen.
2. **IDENT**: Exakten `old_string` für Patches identifizieren.
3. **PATCH**: Chirurgische Eingriffe mit `replace` oder `edit_block` bevorzugen.
   Destruktives `write_file` ist nur für neue Dateien oder komplette Neufassungen zulässig.

---

## V. GOVERNANCE & SDD-WORKFLOW

### Workflow-Gate

Kein Code darf ohne zementierten Plan (`status: cemented`) erstellt werden.
Reihenfolge: `SPEC → SPECIFY (WHAT) → PLAN (HOW) → CODE`.

### Änderungsverfahren

Änderungen an dieser Konstitution erfordern eine MAJOR-Versionserhöhung.
Anpassungen der Mandate müssen in der `GEMINI.md` im Root gespiegelt werden.

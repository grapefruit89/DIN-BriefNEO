---
tags: [aviation-grade, platinum-2026, logic, blueprint, chrome-147]
status: cemented
version: 1.2.0
last_audit: 2026-03-23
id: BRAIN-020-SPEC
title: Funktions-Spezifikation Chrome 147 — Logic & Resilience
supersedes: 20_specify_chrome147_v1.0.0.md
---

# 20 — Funktions-Spezifikation Chrome 147+ v1.2.0

## I. GHOST-MIRROR (DUAL-LAYER ARCHITECTURE)
Das Ghost-Mirror Pattern trennt Datenerfassung (Souveränität) von visueller Darstellung (Ästhetik).
- **Eingabe-Schicht (`<din-body>`):** 
  - `contenteditable="plaintext-only"` (BANNED: `richText`).
  - `color: transparent; caret-color: black;`. 
  - Hier werden Markdown-Marker (`*`, `_`, `>`) als Plaintext getippt.
- **Spiegel-Schicht (`<din-body-mirror>`):** 
  - Aria-hidden, pointer-events: none. 
  - JS spiegelt `textContent` in Echtzeit und ersetzt Marker durch `<strong>`, `<em>`, `<blockquote>`.
  - **Zero-Width:** Marker erhalten `class="md-marker" { width: 0; display: inline-block; }`.

## II. NATIVE INVOKERS (ZERO-JS INTERACTION)
- Alle `<dialog>` und Popover-Elemente werden OHNE JavaScript-Event-Listener gesteuert.
- **Mandat:** Nutzung des `commandfor` und `command` Attributs.
- Beispiel: `<button commandfor="settings-dialog" command="toggle-popover">`
- Vorteil: Resilienz gegen JS-Runtime Fehler und verringerte Main-Thread Last.

## III. RESILIENZ-MODELL (DAILY STRIKE CIRCUIT BREAKER)
Schutz vor instabilen APIs (Zinsen, PLZ) ohne den Nutzer zu blockieren.
- **Hysterese-Logik:** Maximal 1 Fehler-Strike pro Kalendertag im LocalStorage.
- **Phasen:**
  - `GREEN`: API aktiv.
  - `AMBER` (3 Strikes): Deaktivierung Autocomplete, Rückfall auf Manual-Input.
  - `BLACK` (14 Strikes): Dead-Flag. Funktion verschwindet aus UI (Reaktivierung nur über Cockpit).
- **Heilung:** Ein einziger erfolgreicher Request setzt den Strike-Zähler sofort auf 0 (Temporal API Validation).

## IV. LANDING ZONE (SIGNATURE PROTECTION)
Schutz der Unterschrift vor Überlauf auf die zweite Seite.
- **Mechanik:** CSS Scroll-State Queries prüfen, ob `<din-signature>` die physische Blattkante (CMA-max-y) überschreitet.
- **Reaktion:** Wenn Overflow detektiert wird -> automatischer CSS Page-Break für den gesamten Block.
- **Purity:** Kein JavaScript-Bounding-Box-Berechnen nötig.

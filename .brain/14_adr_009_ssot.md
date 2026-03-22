---
tags: [aviation-grade, platinum-2026, spec-kit, architecture, adr]
status: cemented
version: 1.0.0
last_audit: 2026-03-20
id: ADR-009
title: CSS als primäre SSoT — Lösung des CMA-Bridge-Konflikts
authority: ÜBERSCHREIBT die bisherige implizite Praxis (JS-Bridge als SSoT)
traceability: [ADR-002, BRAIN-013, BRAIN-003-BP, CAA-008, ANTI-024]
---

# ADR-009 — CSS ist die primäre SSoT für CMA-Koordinaten

## Status: CEMENTED (2026-03-20)

---

## 1. Kontext: Der dokumentierte Konflikt

**Befund aus BRAIN-013 (JS-zu-Native Roadmap, Tier-1-A):**

`cma-bridge.js: initCMABridge()` schreibt beim App-Start 14 CSS Custom
Properties via `root.style.setProperty()` in das DOM:

```
--info-block-top: 97.4mm
--subject-top:    103.4mm
--footer-top:     269mm
... (11 weitere)
```

Diese exakt gleichen Werte existieren **bereits** als statischer Fallback
in `css/din5008-paper.css` im `:root`-Block:

```css
:root {
  --info-block-top:  97.4mm;   /* M-009 AVIATION GRADE */
  --subject-top:    103.4mm;   /* M-010 AVIATION GRADE */
  --footer-top:      269mm;    /* M-014 AVIATION GRADE */
  ...
}
```

Das bedeutet: Wenn `initCMABridge()` nicht ausgeführt wird (JS deaktiviert,
Boot-Fehler, etc.), liefert das CSS identische Werte. Die Bridge ist eine
**kontrollierte Dopplung**.

**Das Wartungsproblem:**
Wenn ein CMA-Wert geändert werden muss (z.B. ein Messung-Audit ergibt
eine Korrektur), müssen aktuell **zwei** Stellen gepflegt werden:
1. `js/core/constants.js` (die JS-Konstante)
2. `css/din5008-paper.css` (der CSS-Fallback)

Eine vergessene Aktualisierung in einer der beiden Quellen führt zu
inkonsistentem Verhalten je nach Laufzeitstatus. Das ist ein Zustand,
den Aviation Grade nicht toleriert.

---

## 2. Die Entscheidung

> **CSS `din5008-paper.css` `:root {}` ist die primäre SSoT für alle
> statischen CMA-Koordinaten.**
>
> `cma-bridge.js` dient ausschließlich als **dynamischer Konsument**
> für Werte, die sich zur Laufzeit ändern — konkret: der Form-A/B-Toggle.

---

## 3. Begründung

### 3a. CSS ist der natürlichere Ort für Layout-Konstanten

CSS Custom Properties in `:root` wurden genau für diesen Zweck entworfen:
Design-Tokens, die das gesamte Dokument betreffen. Sie sind synchron lesbar,
vom Browser gecacht und ohne JS-Overhead verfügbar.

JS-Konstanten in `constants.js` wurden für Berechnungslogik entworfen:
Werte, die in Algorithmen eingesetzt werden (`CMA.INFO_BLOCK_TOP * 3.7795`
für px-Konversion). Diese Aufgabe bleibt bei JS.

### 3b. CSS hat den robusteren Fallback-Pfad

Wenn JS nicht läuft (Content Security Policy, Browser-Extension, Fehler):
- CSS-Fallback greift: DIN-5008-Layout korrekt ✓
- JS-Bridge nicht ausgeführt: Kein Schaden, weil CSS bereits korrekt ist ✓

Wenn CSS fehlt (kein realistisches Produktionsszenario):
- Das System ist ohnehin defekt — dieser Fall wird nicht abgesichert.

### 3c. Die Bridge wird zur Thin-Adapter-Schicht

Nach dieser ADR ist `cma-bridge.js` nur noch für zwei Aufgaben zuständig:
1. **Form-Toggle:** `switchForm('A')` schreibt NUR `--address-top` um.
   Alles andere bleibt unberührt.
2. **`data-layout` am Paper setzen:** `paper.dataset.layout = 'form-a'`
   für die CSS `:has([data-layout=...])` Selektoren.

`initCMABridge()` in seiner aktuellen Form (14 setProperty-Aufrufe)
wird zu Dead Code erklärt und markiert.

### 3d. Forward Compatibility

Wenn Typed `attr()` (CSS Values Level 5) GA wird, ist das Layout vollständig
in HTML+CSS beschreibbar — ohne jede JS-Bridge. CSS als SSoT ist die
Vorbedingung für diese Migration. JS als SSoT würde eine zusätzliche
Migrations-Hürde bedeuten.

---

## 4. Auswirkungen & Constraints

### Was sich ÄNDERT

| Was | Vorher | Nachher |
|---|---|---|
| SSoT für statische CMA-Werte | `constants.js` + CSS-Fallback (Dopplung) | Nur `css/din5008-paper.css :root {}` |
| `initCMABridge()` | 14 setProperty-Aufrufe | Dead Code — zu entfernen (SPEC-Kandidat) |
| `switchForm()` | schreibt 1 Property + dataset | bleibt identisch |
| `constants.js CMA`-Objekt | SSoT für Layout | Nur noch für JS-Berechnungen (px-Konversion etc.) |

### Was sich NICHT ändert

- `constants.js` bleibt bestehen — für Berechnungslogik in `cma-bridge.js`, `devmode.js`
- Die CSS Custom Properties bleiben identisch benannt
- `switchForm()` bleibt als einzige dynamische Bridge-Funktion
- Das `@layer`-System bleibt vollständig unverändert

### Constraint: Wann JS-Werte trotzdem gebraucht werden

`constants.js CMA`-Werte bleiben nötig für:
- Pixel-Berechnungen (Porto-Kalkulator, PDF-Metadaten)
- `devmode.js` Inspector (zeigt mm-Werte aus JS-Konstanten)
- Zukünftige Berechnungen, die mm → px benötigen

Diese Nutzung ist nicht "Layout" — sie ist "Fachlogik". Sie ist berechtigt.

---

## 5. Migrations-Anweisung (SPEC-Kandidat)

Die technische Umsetzung dieser ADR ist eine eigene SPEC.
Sie ist NICHT Teil dieses ADRs. Dieser ADR dokumentiert nur die Entscheidung.

**Grobe Schritte (für zukünftige SPEC):**
1. `initCMABridge()` mit `/* [ADR-009] DEAD CODE — to remove */` markieren
2. Verifikation: `#paper` ohne `initCMABridge()`-Aufruf korrekt positioniert?
   (Erwartung: Ja — weil CSS-Fallback identische Werte hat)
3. `initCMABridge()` aus `app.js` entfernen
4. `initCMABridge()` Funktion aus `cma-bridge.js` entfernen
5. `app.js` Import bereinigen (nur noch `switchForm` aus `cma-bridge.js`)

**Test-Bedingung vor Schritt 3:**
```
// In DevMode Browser-Console:
document.documentElement.style.cssText = '';  // Alle inline styles entfernen
// Prüfen: Liegt din-subject noch auf 103.4mm?
// Wenn ja: CSS-Fallback funktioniert → Bridge ist Dead Code
```

---

## 6. Cemetery-Eintrag (vorgemerkt)

**TOMB-B001 — `initCMABridge()` Full-Injection (VORGEMERKT für Entfernung)**
- Was: 14 CSS setProperty-Aufrufe in `cma-bridge.js`
- Warum vorgemerkt: ADR-009 erklärt diese Funktion als Dead Code
- Noch nicht entfernt: Wartet auf SPEC-Umsetzung und Verifikation
- Verbleibend: `switchForm()` + `paper.dataset.layout` setter

**Wenn TOMB-B001 ausgeführt wird:**
Dieser Eintrag wandert in `05_anti_pattern_registry.md`.

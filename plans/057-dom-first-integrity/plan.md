---
id: PLAN-057
spec: SPEC-057
title: Anchor Positioning & Passive Sync Blueprint
status: active
anti-patterns: [ANTI-014, ANTI-021]
adr: ADR-013
---

# Plan: DOM-First Implementation (HOW)

## 1. CSS Anchor Positioning (Chrome 147)
Wir definieren jedes `<din-*>` Feld als potentiellen Anker.

**Blueprint CSS:**
```css
/* Jedes Feld ist ein Anker */
din-sender     { anchor-name: --sender; }
din-recipient  { anchor-name: --recipient; }
din-body       { anchor-name: --body; }

#editor-toolbar {
  position: absolute;
  /* Anker-Logik: Positioniere dich über dem Anker des Elements mit Fokus */
  position-anchor: --active-field; 
  bottom: anchor(top);
  left: anchor(left);
}

/* JS setzt nur den Namen des aktiven Ankers */
:focus-within { --active-field: --this-element-specific-anchor; }
```

## 2. Passiver State-Sync
Wir entfernen den `input` Event-Listener, der in den Speicher schreibt.

**Neuer Zyklus:**
1. Nutzer tippt. (0% JS Aktivität).
2. Nutzer verlässt das Feld (`blur`) ODER drückt `Ctrl+S`.
3. JS ruft `readDOMasJSON()` auf und aktualisiert den State in einem Rutsch.

## 3. Native Labels (Pseudo-Elemente)
Wir lagern statische Texte in das CSS aus.
```css
din-date::before { 
  content: "Datum: "; 
  font-weight: normal;
  color: #888;
}
```

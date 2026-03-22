---
id: PLAN-029
spec: SPEC-029
title: Hybrid Height Print Engine Blueprint
status: active
anti-patterns: [ANTI-003, ANTI-008]
adr: ADR-014
---

# Plan: Hybrid Height Print Engine (HOW)

## 1. CSS-Architektur (Screen vs. Print)

Wir nutzen `@media print`, um die physischen Grenzen des `#paper` aufzubrechen.

### 1.1 Screen Settings (Visual Freeze)
```css
#paper {
  height: var(--page-height); /* 297mm */
  overflow: hidden; /* Aviation Grade: kein Scrollen am Blatt */
}
```

### 1.2 Print Settings (Flow Mode)
```css
@media print {
  #paper {
    height: auto !important;
    min-height: 297mm !important;
    overflow: visible !important;
  }
  
  #textbereich {
    position: relative !important; /* Erlaubt natürliches Wachstum */
    top: auto !important;
    height: auto !important;
  }
}
```

## 2. Typografie & Umbrüche
Wir nutzen moderne CSS-Eigenschaften für die Text-Integrität:
- `break-inside: avoid` für Listen und Blöcke.
- `widows: 3; orphans: 3;` für Absätze.

## 3. Nutzen
Das System verhält sich auf dem Bildschirm wie ein einzelnes Blatt Papier (Immersion), liefert aber beim Druck ein professionelles, mehrseitiges Dokument.

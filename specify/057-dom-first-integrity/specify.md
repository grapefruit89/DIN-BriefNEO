---
id: SPEC-057
title: DOM-First Integrity & Anchor Positioning
tags: [chrome-147, anchor-positioning, zero-js, aviation-grade]
status: active
version: 1.0.0
traceability: [MANDATE-NAT, ANTI-026]
---

# Specify: DOM-First Integrity (WHAT)

## 1. Zielsetzung
JavaScript soll vollständig von der Live-Synchronisation der Benutzereingaben entbunden werden. Das Dokument im Browser-Fenster (DOM) ist die einzige Quelle der Wahrheit während der Bearbeitung.

## 2. Fachliche Anforderungen (WHAT)

### FR-001: Passives State-Management
- Das System DARF NICHT bei jedem Tastendruck Daten in den JavaScript-Speicher spiegeln.
- Die Persistierung (LocalStorage) erfolgt nur noch ereignisbasiert (z.B. bei Fokusverlust oder in Intervallen), indem das DOM direkt gelesen wird.

### FR-002: Kontextsensitive Werkzeuge (Anchor Positioning)
- Die Toolbar für Formatierungen MUSS sich physisch an dem Feld ausrichten, das gerade bearbeitet wird.
- Diese Ausrichtung MUSS flüssig und ohne JavaScript-Berechnungen erfolgen.

### FR-003: Unlöschbare Feld-Identitäten
- Strukturelle Elemente des Briefes (wie das Wort "Datum" im Infoblock) MÜSSEN für den Nutzer unlöschbar sein.
- Diese Elemente dürfen nicht Teil des editierbaren Textes sein.

## 3. Erfolgskriterien
- **SC-001**: Die Performance des Tippens ist identisch mit einer statischen HTML-Seite.
- **SC-002**: Die Toolbar "springt" oder "gleitet" nativ zum fokussierten Feld.
- **SC-003**: Ein "Alles löschen" im Feld darf die Beschriftung (z.B. "Datum") nicht entfernen.

---
title: "ADR-004: Adress-Autocomplete mit Geoapify"
status: accepted
date: 2026-07-02
deciders: [User, AI]
tags: [adr, geoapify, api, autocomplete]
aliases: ["ADR Geoapify", "Adress API"]
related: ["[[ADR-ANTIPATTERN]]", "[[geoapify-autocomplete]]", "[[ADR-API]]"]
---

# Architectural Decision Record (ADR): Adress-Autocomplete mit Geoapify

> [!info] Info-Block (Hintergrund)
> Wir benötigen eine robuste, performante Lösung für das Autovervollständigen von Empfängeradressen im WYSIWYG-Editor. Ein Brainstorming schlug die offizielle Library `@geoapify/geocoder-autocomplete` mit hartcodiertem Proximity-Bias (Bonn) vor. Wir müssen evaluieren, inwieweit diese Vorschläge zu unserer Zero-JS/WYSIWYG-Philosophie passen.

## 1. Kontext & Problemstellung

Die Eingabe von Adressen im `<din-anschriftfeld>` soll den Nutzer bestmöglich unterstützen. Folgende Aspekte stehen im Fokus:
- **Performance:** Minimierung von API-Calls.
- **Relevanz:** Lokale Treffer sollen zuerst erscheinen.
- **Architektur:** Strikte Einhaltung der [[ADR-ANTIPATTERN]] Regeln (keine NPM-Build-Steps, keine DOM-injizierenden Third-Party-Libraries).

<details>
<summary>Historischer Kontext (Klicken zum Ausklappen)</summary>
Ursprünglich wurde Photon (komoot.io) evaluiert, aber wegen mangelhafter Suchergebnisse als Antipattern verworfen. Geoapify liefert exzellente Qualität, erfordert aber einen API-Key.
</details>

## 2. Betrachtete Optionen

| Option | Vorteil | Nachteil |
| :--- | :--- | :--- |
| **Option A** (Offizielle Library `@geoapify/geocoder-autocomplete`) | Schnelle Implementierung, Caching eingebaut | Fügt ca. 30-50 KB Bundle-Size hinzu, verlässt die native Plattform, injiziert **eigene, schwer anpassbare DOM-Elemente** (zerstört 100% WYSIWYG-Anspruch). |
| **Option B** (Custom Fetch + Native CSS Anchor Dropdown) | 100% WYSIWYG, keine Dependencies, native W3C CSS Anchor | Caching muss (falls gewünscht) selbst in einer `Map` verwaltet werden. |

## 3. Die Entscheidung

> [!success] Wir haben uns für **Option B (Custom Fetch + Native CSS Anchor)** entschieden.

### Begründung
- [x] Entspricht der Zero-JS-Philosophie (kein Bundle, kein NPM).
- [x] Integriert sich nahtlos in die native W3C CSS Anchor Positioning Logik des WYSIWYG-Papiers.
- [x] Wir übernehmen **nur die konzeptionellen Optimierungen** aus dem Brainstorming:
  - `limit=5` (statt 6, noch kompakter) für schnelleres Rendering.
  - `debounce=300ms` (sehr nah am Brainstorm-Vorschlag von 280ms) reduziert API-Calls enorm.
  - **Dynamischer Proximity Bias:** Statt einem statischen Fallback (z. B. Bonn), extrahiert unsere Logik dynamisch die PLZ des Absenders über Zippopotam.us und nutzt diese realen `lat`/`lon` Koordinaten für das Geoapify `bias=proximity` Argument. Das ist dem statischen Vorschlag massiv überlegen!

## 4. Architektur-Diagramm

```mermaid
graph TD
    A[Nutzer tippt im Empfängerfeld] -->|Debounce 300ms| B{Länge > 3?}
    B -- Ja --> C[Check Absender-PLZ (Zippopotam)]
    C --> D[Fetch Geoapify API mit dynamischem Bias]
    D --> E[Render native CSS Anchor Popover]
    B -- Nein --> F[Nichts tun]
```

## 5. Feature Checks (Living Documentation)

```javascript feature-check
// f("Geoapify Autocomplete", typeof globalThis.fetch === "function", "Chrome 42", "Produktiv")
// f("CSS Anchor Positioning", CSS.supports("anchor-name: --test"), "Chrome 125", "Produktiv")
```

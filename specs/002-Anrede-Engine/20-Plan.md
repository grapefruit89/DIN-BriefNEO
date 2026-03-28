---
id: SPEC-002-PLAN
title: Technischer Implementierungsplan Anrede
tags: [architecture, logic, js, imr-4.0]
status: cemented
version: 4.0.0
---

# 20 — Plan: Technische Realisierung (IMR 4.0)

## 1. Architektur-Übersicht
Die Anrede-Logik ist strikt in **Fachlogik** (Logic) und **Reaktion** (UI) getrennt.

### Layer A: Pure Business Logic (`js/logic/logic.js`)
- **`parseRecipient(text)`**: Nimmt den String des Empfängers und gibt ein Objekt `{ gender, title, name, firstName }` zurück.
- **`getSalutation(analysis, formality)`**: Mappt die Analyse auf die normative Matrix.

### Layer B: DOM Controller (`js/ui/ui.js`)
- **Event-Hook**: Beobachtet das Atom `<din-empfaenger-name>`.
- **State-Sync**: Schreibt das Ergebnis in `sm.state.content.salutation`.
- **Manual-Flag**: Prüft vor jedem Update `el.dataset.auto !== 'false'`.

## 2. Datenfluss
1. Input in `<din-empfaenger-name>`.
2. `UIController` fängt Event ab.
3. `Logic.parseRecipient` analysiert den Text.
4. `Logic.getSalutation` generiert den Vorschlag.
5. `UIController` aktualisiert das Feld `<din-anrede>`.

## 3. APIs & Werkzeuge
- **Regex**: Zur Extraktion von Präfixen (Herr/Frau).
- **EditContext**: Für performantes Echtzeit-Parsing ohne DOM-Reflows.
- **IMR 4.0 Registry**: Zur Identifikation der Ziel-Tags.

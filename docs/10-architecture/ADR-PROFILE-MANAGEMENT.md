---
id: adr-profile-management
title: 'ADR-PROFILE-MANAGEMENT: Absender-Profile & Bankdaten (Status-Korrektur)'
type: adr
status: active
created: '2026-08-08'
updated: '2026-08-08'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
doc_links:
  - Feature-Matrix
  - ADR-DATA-PERSISTENCE
  - ADR-ANTIPATTERN
code_links:
  - website/js/52-storage.js
  - website/js/44-sender-sync.js
  - website/poc-features.js
error_patterns:
  - profil-management
  - iban
  - bankdaten
  - absender profile
  - profilwechsel
  - privat büro
supersedes: []
depends_on: []
---

# ADR-PROFILE-MANAGEMENT: Absender-Profile & Bankdaten (Status-Korrektur)

## 1. Context & Problem

**Dokumentierter Feature-Status stimmt nicht mit dem Produktivcode überein.**

- `Feature-Matrix.md` führt "Profil-Management" (granulare Speicherung von Kontakt- & Bankdaten, Wechsel zwischen mehreren Profilen z.B. Privat/Büro) als **✅ Aktiv**.
- Eine Code-Prüfung von `website/js/` und `website/index.html` findet dazu nichts: kein IBAN-Feld, kein Profil-Select, kein Save-Button, keine Bankdaten-Persistenz. `52-storage.js` kennt nur `saveDraft`/`loadDraft`/`saveSettings`/`loadSettings` — keinen Profil-Layer.
- Die einzige Fundstelle für IBAN/Bank-Strings im gesamten `website/`-Baum ist `poc-features.js` — ein Sandbox-Skript für Chrome-API-Demos (Prompt API, Gap-Decorations, Text-Fit, Focusgroup), nicht Teil des produktiven Editors.
- **Korrigierte Historie (verifiziert durch Chat-Export-Audit, 2026-08-08):** Profil-Management hat tatsächlich existiert. Mehrere unabhängige Chats belegen: (1) "API-Superpowers für DIN-BriefNEO" (2026-03-20) führt "IBAN-Ghost, Profil-Dialog-Speichern" als Bestandteil des damaligen `ui.js`-Kerns; (2) "Single-file HTML-Anwendung erstellen" (2026-03-31) zeigt ein funktionsfähiges Absender-Modal mit IBAN-Feld + IBAN-Ghost-Text, nennt als offenen Sprint-1-Fix explizit "Profil aus `localStorage[\"din_profile\"]` → `StateManager.state.profile` migrieren"; (3) "Zugriff auf DIN-Brief-Arbeitsordner prüfen" (2026-03-31–08-05) protokolliert den Vorfall direkt: Gemini hat beim Entfernen eines doppelten `modalProfile`-Blocks versehentlich die **gesamte Profil-Management-Logik mitgelöscht** (IBAN-Formatting, Profile-Select, `btnSave`-Handler) — deckt sich exakt mit der claude.ai-Projekt-Memory ("prior Gemini-assisted refactoring session inadvertently deleted profile management logic"). Das Feature wurde seither nie wiederhergestellt und ist im aktuellen flachen `01-52`-Dateischema (nach dem großen Architektur-Umbau) komplett verschwunden — nicht "nie gebaut", sondern "gebaut, kaputtrefactored, nie zurückgeholt".
- Ohne Korrektur führt der falsche "✅ Aktiv"-Status dazu, dass zukünftige Sessions (Claude/Gemini) das Feature für vorhanden halten und z.B. bei Bugfixes oder Audits daran vorbeiplanen.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** (Status korrigieren, Backlog-Item) | Feature-Matrix auf ehrlichen Status setzen, Implementierung als offene Aufgabe in ROADMAP aufnehmen | Dokumentation wieder wahr; keine Fehlplanung mehr | Feature bleibt vorerst fehlend | Keine | **Gewählt** |
| **Option B** (Sofort nachbauen) | Profil-Management jetzt implementieren (IBAN-Feld, Profil-Select, LocalStorage-Layer) | Feature-Matrix wird ohne Abstriche wahr | Umfang unklar (Sicherheitsfragen: IBAN-Anzeige, `innerHTML` vs. `textContent`), keine Spec vorhanden | Scope-Creep ohne vorherige Spec-Phase | Abgelehnt (verfrüht) |
| **Option C** (Feature streichen) | "Profil-Management" komplett aus Feature-Matrix entfernen, als bewusst nicht verfolgt markieren | Kürzeste Doku | Verliert eine ursprünglich gewollte Funktion (mehrere Absender-Profile) ohne Entscheidung darüber | Stille Feature-Aufgabe ohne bewussten Trade-off | Abgelehnt |

## 3. Decision

**Wir haben uns für Option A entschieden: Status korrigieren, Implementierung bleibt offenes Backlog-Item.**

### Begründung

- Die Diskrepanz zwischen Doku und Code ist der eigentliche Schaden — der stille "✅ Aktiv"-Status ist gefährlicher als ein ehrliches "fehlt noch".
- Ob Profil-Management überhaupt gebraucht wird (Solo-Entwickler, primär eigener Gebrauch), ist eine Produktentscheidung, die Mo treffen sollte, bevor Implementierungsaufwand investiert wird — deshalb kein sofortiger Nachbau (Option B).
- Streichen (Option C) würde eine echte Produktentscheidung durch eine Doku-Bereinigung ersetzen — das gehört getrennt entschieden.

## 4. Consequences

### Positive Auswirkungen

- Feature-Matrix ist wieder eine verlässliche Quelle für Session-Onboarding.
- Klare, benannte Lücke statt versteckter Fehlannahme.

### Risiken & Negative Auswirkungen

- Falls Mo tatsächlich mit mehreren Absender-Profilen arbeitet (privat/geschäftlich), fehlt dieser Komfort bis zur Implementierung.

### Langfristige Auswirkungen

- Bei künftiger Implementierung: IBAN-Anzeige/-Eingabe muss `textContent`/`plaintext-only` folgen (kein `innerHTML`, siehe `ADR-ANTIPATTERN`), Speicherung über `52-storage.js`-Layer analog zu `saveSettings`/`loadSettings`, kein neues Persistenz-System (siehe `ADR-DATA-PERSISTENCE` — LocalStorage-only bleibt bindend).

## 5. Implementation & Verification

- `Feature-Matrix.md`, Zeile "Profil-Management": Status von ✅ Aktiv auf tatsächlichen Stand korrigiert (2026-08-08).
- **Entscheidung von Mo (2026-08-08): Option A bestätigt, kein Bau jetzt.** Als sichtbare Referenz für künftige Sessions wurden `TODO(profile-management)`-Marker im Code hinterlegt (kein aktiver Auftrag, nur Platzhalter):
  - `website/js/52-storage.js` — oberhalb `StorageManager` + in `loadSettings()` bei `defaultSettings`
  - `website/js/44-sender-sync.js` — oberhalb `initSenderSync()`
- Kein weiterer Code geändert. Wenn eine künftige Session diese Marker findet, gilt weiterhin: keine Implementierung ohne explizite Freigabe von Mo.

## 6. Related Documents

- [[Feature-Matrix]]
- [[ADR-DATA-PERSISTENCE]]
- [[ADR-ANTIPATTERN]]

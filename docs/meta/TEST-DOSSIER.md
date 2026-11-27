---
id: "test-dossier"
title: "Test-Dossier: was die 430 Fälle abdecken"
status: "active"
type: "reference"
created: "2026-11-15"
updated: "2026-11-15"
tags:
- din-briefneo
- meta
- tests
- dossier
doc_links:
- '[[AGENTS]]'
- '[[AUFGABEN-WEGWEISER]]'
code_links:
- 'test/all.js'
depends_on: []
supersedes: []
---

# Test-Dossier

**Erzeugt von `tools/content.mjs tests` — nicht von Hand bearbeiten.**
`node tools/content.mjs tests --check` bricht ab, wenn dieses Verzeichnis nicht
mehr zu `test/all.js` passt.

**Zahl:** 430 Fälle in 113 Gruppen.
Gezählt per Textsuche über `describe(`/`it(` am Zeilenanfang — auskommentierte
und dynamisch erzeugte Fälle zählen **nicht** mit. Die Einzelfälle stehen im
Lauf (`node tools/runtime.mjs test`); hier steht, **wo** sie liegen und **wie
dick** ein Bereich abgedeckt ist.

| Gruppe | Fälle |
|---|---:|
| PLZ-Autocomplete UI-Cases (Teil 6: Case A, B, C & Doppel-Fill) | 45 |
| Import/Export: DIN-Brief-JSON-Payload (pure Funktionen) | 16 |
| Testbrief: Thema, Besetzung und Szenario | 12 |
| PLZ-Vorschlaege: Ausklappen ab 8, Ortsfarben (2026-11-13) | 10 |
| State: reine Funktionen & Wire-Roundtrip (D1 Stufe 1) | 10 |
| 51-storage: Primitive KISS Funktionen & STORAGE_KEYS | 9 |
| Anrede-Varianten (Auswahl am Feld, 2026-11-22) | 9 |
| formatTelefonnummer (DIN 5008 11.3.2) | 9 |
| SalutationEngine: Anrede-Ableitung (pure Funktion & KISS) | 9 |
| Geo-Cache: Ringspeicher im localStorage (2026-11-22) | 8 |
| Datums-Kalender (date-picker.js) | 7 |
| PLZ-Daten-Integration (Teil 1: echte Datensätze) | 7 |
| Rücksendezeile — Spiegelung mit Initialen | 7 |
| window.dinBriefAgent + WebMCP: Werkzeuge für Agenten (2026-11-23) | 7 |
| Anschriftfeld — DIN-Zone reserviert | 6 |
| applyMicroTypography & formatElementMicroTypography (DIN 5008 § 7.2 & § 8.2 — Plan 10) | 6 |
| FontFeature: Minimalistischer 2-Zustände Font-Button & Kaskade | 6 |
| Betreff — unter Falzmarke 1 (DIN 20.9.2) | 5 |
| Caret in nativen Feldern (Befund B12) | 5 |
| Geschäftsangaben (Addon, § 35a GmbHG) | 5 |
| parseDinLetterPayload — Schema-Reihenfolge | 5 |
| Straßen-Nähe: woher der Bias kommt (2026-11-22) | 5 |
| Strukturvertrag liegt nicht in der Design-Schicht (Befund B15) | 5 |
| window.dinApi: Brief-Schnittstelle für Agenten (2026-11-22) | 5 |
| AddressDomain: Reine PLZ- und Adressauflösung (Phase 3) | 4 |
| Agenten-Kanal ohne Debug-Port (live-bridge.js, 2026-11-23) | 4 |
| Anlagen-Migration | 4 |
| D1 Stufe 4: Undo/Redo als Patch-Stack | 4 |
| D1 Stufe 6: Import ohne Reload | 4 |
| D2: ein Wert-Schreiber, eine Allowlist (ersetzt B69-Selektor-Ratsche) | 4 |
| DraftManager: EventBus Save-Integration (Phase 4) | 4 |
| Druck — Unterrand und Fußzeile | 4 |
| EventBus: Entkoppelte Pub/Sub-Kommunikation (Zero-Dependency) | 4 |
| formatDatum (DIN 5008 § 11.4) | 4 |
| Popover: geschlossene Overlays blockieren keine Klickfläche | 4 |
| Ratsche P38: contenteditable auf offenen Feldern | 4 |
| sanitizeRichText — Kursiv | 4 |
| SettingsManager: Drill-Down Modus-Umschaltung (Seitenleiste) | 4 |
| Textformatierung — Toolbar | 4 |
| Toast-System: EventBus-Anbindung (Phase 2) | 4 |
| toggleInlineFormat — Bold | 4 |
| toggleInlineFormat — Italic | 4 |
| Vorschlagslisten: Hoehe bis 20 mm vor den Blatt-Unterrand (2026-11-22) | 4 |
| Anschriftfelder als <input>: Speichern, Reset, Grenzen | 3 |
| D1 Stufe 3: Zustand und DOM driften nicht auseinander | 3 |
| Datum überlebt den Reload (F5, Batch 05) | 3 |
| DraftManager: Anlagen-Restore (M2 Datenverlust-Fix) | 3 |
| DraftManager: Sanitizing (XSS-Schutz, echte Route localStorage → loadDraft) | 3 |
| Druck: A4-Seite ohne Ueberlauf (Print-CSS-Vertrag) | 3 |
| Einstellungs-Modus ist strukturell geschlossen (Befund B14) | 3 |
| Figurenkatalog & DIN-5008-Anschrift (Schema v2.1 Tuples) | 3 |
| formatGeldbetrag (DIN 5008 § 6.6 / § 11.2) | 3 |
| formatIban (DIN 5008 § 11.3.1) | 3 |
| formatPostfach (DIN 5008 § 11.3.4) | 3 |
| formatUhrzeit (DIN 5008 § 11.5) | 3 |
| ortsVorschlaege: eine Wahrheit fuer Feld und Debug (2026-11-22) | 3 |
| Schalter-Semantik: eine Regel statt drei (B65) | 3 |
| Strassen-Autovervollstaendigung (Geoapify) | 3 |
| Tote Zustaende bleiben weg (Issue #17, 2026-11-14) | 3 |
| Variable Font: eine Datei fuer 400/600/700 | 3 |
| Absatzabstand im Fließtext | 2 |
| Absender-Ort: PLZ-Praefix und Loeschen (2026-11-22) | 2 |
| AddressData: Reine Datenlogik und Entkopplungs-Parität (P1a) | 2 |
| Anschriftfeld — Rücksendeangabe gruppiert | 2 |
| Ansicht ist eine Radiogruppe, kein Checkbox-Trick (Befund B14) | 2 |
| B52 Addon-Plugin-Vertrag (Poka-Yoke) | 2 |
| CSS: Feld-Chrom gilt für contenteditable UND native Felder | 2 |
| D1 Stufe 2: Save-Pfad über toWire ist byte-gleich | 2 |
| D2: Fingerprint verhindert den zweiten Boot-Schreibvorgang | 2 |
| DraftManager: localStorage-Roundtrip | 2 |
| DraftManager: Stabilitäts-Audit & Quota-Fehlerbehandlung (B54) | 2 |
| Druck: Absätze und @page-Regel | 2 |
| Eingabe-Sperre bei voller Feldbreite (A49-Ausnahme) | 2 |
| Init degradiert statt abzubrechen (Invariante 2026-11-22) | 2 |
| Jedes Fokusziel hat eine benannte Gruppe (B75) | 2 |
| Layout Stability / Zero CLS | 2 |
| Ortssuche: Stadt schlaegt Ortsteil (2026-11-22) | 2 |
| Persistence: Import-Speichervorgang & Fehlerschutz vor Reload (B55) | 2 |
| print-messung.mjs --modus bildschirm | 2 |
| resetDraft — Privacy (Briefdaten vs. Präferenzen) | 2 |
| SalutationFeature: Auto-Seed & Undo-Härtung (meta.userSet Synchronisation) | 2 |
| Sichtbarkeit ohne JS-Spiegel (Batch 01, 2026-11-14) | 2 |
| SignatureFeature: 2-Zustände Button & Handle-Bereinigung | 2 |
| test/fixtures/brief-42.json | 2 |
| Testbrief: direkter Snapshot, nur die PLZ-Erkennung ist gesperrt | 2 |
| text-fit ist verboten (P39) | 2 |
| Textfelder sind native <input> (Migration 2026-11-12) | 2 |
| tools/measure.mjs (pdf-Modus) | 2 |
| Unterrand (20/30) | 2 |
| W1 — Kommentare | 2 |
| WYSIWYG — Bildschirm und Druck gleich | 2 |
| Zahlen lesbar machen (Tausendertrennung, 2026-11-22) | 2 |
| #kern — kein toter data-bottom | 1 |
| #restoreState — Kursiv | 1 |
| Anlagen und Fusszeile als Root-Attribute (ADR-KISS-MINIMAL-JS, Weg 2) | 1 |
| B3-Fixes: Ziel-Sperre und veraltete Suchantworten | 1 |
| B4: Undo-Historie nach fremdem Entwurf | 1 |
| Betreff — Abstand zum Infoblock | 1 |
| Datum — letztes Leitwort im Infoblock (DIN 19.5) | 1 |
| Debug-Panel ist standardmaessig aus (2026-11-22) | 1 |
| din-geschaeftsangaben — kein toter data-bottom | 1 |
| DraftManager: Speicherzustand (B53) | 1 |
| DraftManager: Undo/Redo | 1 |
| E1: Herkunft der Rücksendezeile gehört in den Entwurf | 1 |
| Ein/Aus-Schalter bleiben Haken, keine gestreckte Pille (2026-11-13) | 1 |
| Empfaengerzeilen — DIN-Raster 4,23 mm | 1 |
| Import ist atomar (Befund B13) | 1 |
| initSenderSync: Nutzertext überlebt Undo/Restore | 1 |
| Popover-Anker (Ratsche gegen CSS-Kollateralschaden, 2026-11-22) | 1 |
| Rücksendeangabe — Text-Breite | 1 |
| Seitenleiste hat eine Ueberschriften-Hierarchie (Befund B14) | 1 |
| toggleInlineFormat — Edge-Cases | 1 |
| Zero Scrollbars & Subpixel Invariance | 1 |

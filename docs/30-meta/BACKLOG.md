---
id: backlog
title: Backlog — offene Baustellen nach Aufwand und ROI
status: active
type: reference
created: '2026-10-02'
updated: '2026-10-17'
tags:
- din-briefneo
- meta
- planung
- backlog
doc_links:
- '[[AGENTS]]'
- '[[DECISION-LOG]]'
- '[[ROADMAP]]'
- '[[code-audit-website-2026-10-02]]'
- '[[docs-audit-2026-10-02]]'
code_links:
- 'website/js/01-document.js'
- 'website/css/sheet.css'
- 'tools/links.js'
depends_on: []
supersedes: []
---

# Backlog — offene Baustellen

Abgeleitet aus [[code-audit-website-2026-10-02]] und [[docs-audit-2026-10-02]].
Nicht normativ — die **Regeln** stehen in [[AGENTS]] §5, die **Begründungen** im
[[DECISION-LOG]]. Dieses Dokument hält nur, *was noch zu tun ist* und *in welcher Reihenfolge*.

**Aufwand:** S ≤ 1 Sitzung · M = 1–2 Sitzungen · L = Full Mode mit `specs/` + ADR
**ROI:** Nutzen pro Aufwand — ⭐⭐⭐ hoch, ⭐ niedrig

---

## ✅ Bereits erledigt (2026-10-02)

| ID | Was | Commit |
| :--- | :--- | :--- |
| — | Fitness Gate repariert (war auf `main` rot, 99,88 %) | `5c4a4de` |
| — | Doku-Quick-Wins: 154 KB stale JSONs, Archiv-Status, `index.md` | `5c4a4de` |
| P1-1 | Metadata: doppelte Namensableitung → `collectLetterIdentity()` | `a30cdfc` |
| P1-2 | Settings-Race: `SalutationFeature` bekommt Owner injiziert | `a30cdfc` |
| — | Doku-Governance `AGENTS.md` §5 + DECISION-LOG-Schema | `5996411` |
| P1-3 | Postvermerk: drei Listener → ein Owner | `7d52cbe` |
| P2-2 | gzip-Pipeline 3× kopiert → `05-gzip.js` | `7d52cbe` |
| P2-5 | `setTimeout(…,100)` → natives `afterprint` | `7d52cbe` |
| P2-6 | `document.title`: zwei Schreiber → Vorrangregel | `7d52cbe` |
| **B1** | **`file://` als Laufzeitziel gestrichen** ([[ADR-RUNTIME-CONTEXT]]) | s. u. |
| **B2** | **`plz-embedded.js` (164 KB) + alle Protokoll-Guards entfernt** | s. u. |
| **B3** | **`ADR-ANTIPATTERN` aufgelöst → `A51`–`A62`, `H11` im Law Catalog** | s. u. |
| **B4** | **`GEMINI.md`/`CLAUDE.md` auf Wegweiser reduziert, Regeln nach `AGENTS.md`/Catalog** | s. u. |
| **B16** | **Terminologie-Kanon im Glossar + Gate-Durchsetzung (`tools/terminology.js`)** | s. u. |
| **B5** | **Agenten-Tooling nach `30-meta/`; `CHANGELOG` + `OBSIDIAN-SETUP-GUIDE` archiviert** | s. u. |
| **B8** | **Alle 12 Screen-`!important` aufgelöst + CSS-Ursachen bereinigt** | `809eb15` |
| **B17** | **Strukturprüfungen für Gesetze ausgebaut (Abdeckung 21 → 30 von 35)** | `a16899c` |
| **B15** | **DECISION-LOG-Behauptungen geprüft, Append-Only-Nachtrag für KISS + B8 + B17** | s. u. |
| **B7** | **`attr()`-Geometrie: Fallbacks entfernt, MUST-NOT 5 erfüllt** | s. u. |
| **B19** | **Adaptive 3-Zonen-Logik aktiv (Phase 1); Phase 2 geschlossen (KISS)** | s. u. |

---

## 🔴 Priorität 1 — blockiert anderes

*Derzeit leer — B1 ist am 2026-10-02 entschieden und umgesetzt
([[ADR-RUNTIME-CONTEXT]]), B2 damit erledigt. Nichts blockiert mehr.*

---

## 🟠 Priorität 2 — hoher Nutzen, klar abgegrenzt

### B22 · Automatisierter Guard gegen hartcodierte Geometriewerte (`tools/check-geometry.js`) · **M** · ⭐⭐
**Kontext:** Nach der Geometrie-SSoT-Migration (Commit `1a6dba0`) leben alle statischen DIN-5008-Werte als `data-*`-Attribute im HTML.
**Ziel:** Neues Tool `tools/check-geometry.js` als automatisierter Wächter:
- Prüft in `website/css/sheet.css`:
  - Keine numerischen Literale in `--mm-x()`, `--mm-y()`, `--pt()` (außer den 10 definierten Grauzonen-Literalen)
  - Jedes `attr(data-X)` besitzt eine entsprechende HTML-Quelle am zugehörigen Element
  - Keine Fallback-Zahlen in `attr()`
  - Form-A/B-Paare sind vollständig vorhanden
- CLI-Modi: Standard, `--json`, `--help`, `--version`
- Exit-Code: 0 bei PASS, 1 bei FAIL
- Bezug: Geometrie-SSoT-Migration (Commit `1a6dba0`)

---

## 🟡 Priorität 3 — gute Verbesserung, grösserer Eingriff

### B6 · Feldtypen deklarativ per `data-feldtyp` · **L** · ⭐⭐⭐ · ✅ PHASE 1 ERLEDIGT 2026-10-02
**Problem:** Mehrere Module kannten Feld-Sonderfälle über ID-Listen.
**Änderung:** `data-feldtyp` ist jetzt im HTML die Quelle für `rich`, `mehrzeilig`,
`zweizeilig`, `liste` und `systemwert`. Draft-Restore, Boot-Restore und UI-Schutz lesen
diese Eigenschaften statt parallele Feldlisten zu führen. Die gemeinsame Caret-Logik liegt
in `selection-utils.js`.
**Rest:** Ein vollständiger `fields.js`-Iterator ist erst sinnvoll, wenn weitere Feldtypen
hinzukommen; vorerst wäre er zusätzliche Abstraktion ohne weiteren Nutzerwert.

### B7 · `attr()`-Geometrie statt doppelter mm-Werte · **L** · ⭐⭐ · ✅ ERLEDIGT 2026-10-15
Liest die DIN-5008-Koordinaten via `attr(data-* type(<number>))` direkt aus den HTML-Attributen (SSoT aus IMR-Registry). Alle redundanten CSS-Fallback-Zahlen in `sheet.css` und `print.css` wurden entfernt. Damit ist Regel MUST-NOT 5 der IMR-Registry („normative Geometrie nicht in CSS duplizieren") vollständig erfüllt; CSS enthält null Millimeter-Werte.

### B8 · Die 12 Nicht-Print-`!important` auflösen · **M** · ⭐⭐ · ✅ ERLEDIGT 2026-10-02
Alle 12 Screen-`!important` in den Autoren-Styles (`floating.css`, `layout.css`, `sidebar.css`, `signature.css`)
restlos aufgelöst (Commit `809eb15`). Root-Causes bereinigt: verfehlt platzierte Seitenleisten-Labels
nach `sidebar.css`, DIN-Elemente nach `sheet.css`, Postvermerk-Styling in `layout.css` konsolidiert,
`.hidden` und `#btn-ai-rewrite` über Layer-Hierarchie und native Spezifität gelöst.
Nur die 5 normativen `prefers-reduced-motion`-Resets in `reset.css` und die 18 in `print.css` bleiben bestehen.

### B9 · Caret-Utilities zusammenführen + `TreeWalker` · **M** · ⭐⭐ · ✅ ERLEDIGT 2026-10-02
Die gemeinsame native Selection-/Caret-Logik liegt in `website/js/selection-utils.js`.
DraftManager und Offline-Adressintelligenz verwenden jetzt denselben Utility-Pfad;
der manuelle rekursive Node-Walk wurde durch `TreeWalker` ersetzt.

### B25 · Vorkonfigurierte Brief-Vorlagen (JSON-Muster) · **M** · ⭐⭐⭐
**Kontext:** Übernommen aus GitHub-Issue #13. Ein leerer Briefeditor ist für Erstnutzer eine Hürde.
**Ziel:** Vorkonfigurierte Vorlagen / Musterbriefe für typische Alltagsfälle bereitstellen:
- Privatbrief (Standard)
- Kündigung (Vertrag / Wohnung)
- Mahnung / Fristsetzung
- Formloser Antrag (Behörde)
**Umsetzung:** Vorlagen als leichtgewichtige, validierte `.dinletter` JSON-Payloads (Schema v2) vorhalten, die per UI-Auswahl direkt in den Editor geladen werden können.

### B26 · Optionale DIN-5008-Validatoren (Anschrift-Zeilenlimit & IBAN) · **S** · ⭐⭐
**Kontext:** Übernommen aus GitHub-Issue #4.
**Ziel:** Zwei zusätzliche defensive Norm- und Syntaxprüfungen:
1. **6-Zeilen-Limit im Anschriftfeld:** DIN 5008 Kap. 19.4.3 begrenzt den Inhalt des Anschriftfeldes auf maximal 6 Zeilen (Zusatz- und Vermerkzone 3 Zeilen + Anschriftzone 6 Zeilen = 9 Zeilen Gesamtraum). Eine optische Warnung (z. B. via Pseudo-Element oder sanftem Toast), wenn der Text 6 Zeilen übersteigt.
2. **IBAN-Prüfziffer (Modulo-97):** Reine Syntax- und Prüfziffern-Validierung für im Brieftext oder Fußbereich erkannte IBANs nach ISO 7064 (Modulo-97-10) zur Vermeidung von Zahlendrehern.

### B27 · Mehrseitige DIN-5008-Briefe (Karussell, Folgeseiten-Kopf, Überlauf-Erkennung) · **L** · ⭐⭐⭐⭐
**Kontext:** Konsolidiert aus `MULTI_PAGE_ARCHITECTURE_SPEC.md` (zugeordnet zu [[ROADMAP#Priorität 1 — Mehrseitige Briefe]]).
**Ziel:** Saubere Trennung zwischen Erstseite (Kopf/Anschrift/Falzmarken) und Folgeseiten (Folgeseiten-Kopf bei 20 mm). Horizontales Paging-Karussell im Editor mit View Transitions API (Zero-Scroll-Garantie). Explizite Folgeseiten-Generierung statt instabiler DOM-Messschleifen (A49). Nativer Druckumbruch per `page-break-after: always; break-after: page;`.

### B28 · Multi-Provider Geocoding Abstraktionsschicht (Nominatim, Photon, BKG) · **M** · ⭐⭐⭐
**Kontext:** Konsolidiert aus `MULTI_PROVIDER_INTEGRATION_BLUEPRINT.md`.
**Ziel:** Provider-unabhängiges Interface für Straßen- und Adress-Lookups als Fallback oder datensparsame Offline/Selbsthost-Option neben Geoapify (z. B. Nominatim, Komoot Photon, BKG Bund). Konsistente Datenstruktur `{ plz, city, street, state }` ohne Vendor-Lock-in.

---

## 🟢 Priorität 4 — Hygiene

### B10 · `research/` **statuskennzeichnen** (NICHT auslagern) · **M** · ⭐⭐⭐ · ✅ TEIL BEREINIGT 2026-10-17
**Neu gefasst 2026-10-02 nach Inventur** — siehe `[[research-inventar-2026-10-02]]`.
Die alte Fassung („1,1 MB auslagern") war falsch gestellt: 476 KB davon sind die beiden
DIN-5008-Normgeometrie-SVGs, und der Ordner enthält **nicht umgesetzte** UX-Spezifikationen
(→ B18, B19). Ungelesenes Auslagern hätte dieses Wissen vernichtet.
**Aktualisierung 2026-10-17:** Der Ordner `research/roadmap/` (38 Dateien) wurde vollständig bereinigt und konsolidiert: 13 implementierte Features und 7 verworfene Ansätze wurden nach Überführung in Law Catalog / ADR gelöscht, 5 Spezifikationen in BACKLOG (B27–B31) und ROADMAP überführt, 12 Referenzdokumente nach `docs/` und das Diagnose-Tool nach `tools/browser-audit.html` verschoben.

### B11 · `_`-Prefix → `#private` vereinheitlichen · **S** · ⭐ — ✅ ERLEDIGT 2026-10-02
`01`, `41`, `53` mischen `#private`, `_underscore` und public. Rein mechanisch, kein
Verhaltensrisiko.

### B12 · Logging-Konvention · **S** · ⭐ — ✅ ERLEDIGT 2026-10-02
21 `console.*` ohne einheitliches Präfix. Vorschlag `[DIN-BriefNEO/<Modul>]`.
Zusätzlich: die beiden leeren `catch (e) {}` in `boot-theme.js`/`boot-state.js` loggen lassen —
aktuell sind Boot-Fehler inklusive Draft-Verlust unsichtbar.

### B13 · Guard-Kommentare entdoppeln · **S** · ⭐ — ✅ ERLEDIGT 2026-10-02
Fünf „🛡️ ARCHITECTURE GUARD"-Blöcke stehen wortgleich in `index.html` **und** im Modul
(~60 Z. Redundanz). Guard-Text ins Modul, HTML bekommt einen Einzeiler-Verweis
(`AGENTS.md` §5.4).

### B14 · Vier ungenutzte IDs entfernen · **S** · ⭐ — ✅ ERLEDIGT 2026-10-02
`btn-confirm-import`, `btn-confirm-reset`, `seitenleiste-ai-switch-row`,
`zwischenablage-anschrift-wrapper`.
**Nicht anfassen:** `btn-style-formal|polite|casual` — die sehen nur tot aus, werden aber in
`41-salutation-engine.js` per Template-String (`` `btn-style-${…}` ``) gebaut.

### B15 · Log-Behauptungen gegen den Code prüfen · **M** · ⭐⭐ · ✅ ERLEDIGT 2026-10-02
DECISION-LOG gegen den aktuellen Code-Stand abgeglichen. Neuer normativer Append-Only-Eintrag für die 5 KISS-Optimierungen (Event-Delegation, Caret-SSoT, Gzip-Pipeline, `.closest()`-Ancestor, StorageManager-Kapselung), den B8-Vollzug (`!important`-Beseitigung) und den B17-Phase-2-Gate-Ausbau (30/35 Gesetze) eingepflegt. Ältere historische Einträge bleiben gemäß DECISION-LOG-Governance strikt unverändert (Append-only).

### B23 · Fitness Gate: 5 A-Gesetze ohne maschinelle Prüfung (`law_coverage`) · **S** · ⭐
**Problem:** `tools/lawcoverage.js` meldet eine LOW-Warnung: 30/35 A-Gesetze maschinell geprüft, 5 ungeprüft (A43, A44, A47, A60, A62).
**Hintergrund:** Diese 5 Gesetze sind reine Gestaltungs- und UX-Prinzipien, die sich nicht sinnvoll per Regex prüfen lassen.
**Lösung:** Einführung einer `MANUAL_REVIEW_LAWS`-Konstante in `tools/lawcoverage.js`, die diese 5 Gesetze als bewusst manuell geprüft und dokumentiert führt, um die LOW-Warnung im Fitness Gate auf 0 Diagnosen zu senken.

### B24 · Fitness Gate: `tooling-overview.md` überschreitet 400-Zeilen-Limit · **S** · ⭐
**Problem:** `docs/30-meta/tooling-overview.md` hat aktuell 482 Zeilen und löst die `doc-size`-Warnung (> 400 Zeilen) im Fitness Gate aus.
**Lösungsmöglichkeiten:**
- Option A: Aufteilung der Datei (z. B. historische/archivierte Tools nach `tooling-overview-legacy.md` auslagern).
- Option B: Konfiguriertes Limit in `tools/reconciliation.js` für `tooling-overview.md` auf 500 Zeilen anheben (begründet durch den Charakter als zentrale Tooling-SSoT, analog zur bestehenden Ausnahme für `DECISION-LOG.md`).

### B29 · Geoapify Performance Tuning (Pre-Warming, Session-Debounce & LRU-Cache) · **S** · ⭐⭐⭐
**Kontext:** Konsolidiert aus `GEOAPIFY_OPTIMIZATION_CONCEPT.md`.
**Ziel:** Feinabstimmung der Remote-Adressabfrage: Verbindungsvorwärmung (`preconnect`/DNS-Prefetch bei Fokus auf das Straßenfeld), dynamischer Session-Debounce (500 ms) und In-Memory LRU-Cache für wiederholte Tastenanschläge zur Minimierung von API-Calls.

### B30 · Geoapify Region Bias & Multi-Cluster Failover (EU/Global Endpunkte) · **S** · ⭐⭐
**Kontext:** Konsolidiert aus `GEOAPIFY_REGION_BIAS_SPEC.md`.
**Ziel:** Geografischer Such-Bias auf Basis der bereits aufgelösten PLZ/Ort (Bounding Box oder Koordinaten-Bias) und konfigurierbare Ausfallsicherheit (automatischer Failover zwischen EU- und Global-Clustern bei Timeouts/HTTP 5xx).

### B31 · Native Browser-APIs: LocalFonts API (Systemschriften), EyeDropper & showPicker · **S** · ⭐⭐
**Kontext:** Konsolidiert aus `CHROME_METRICS_HIDDEN_GEMS.md` (Chromium Web Features UseCounter Telemetrie).
**Ziel:** Direkte Integration moderner, nativer Browser-APIs:
1. `window.queryLocalFonts()`: Ermöglicht dem Schriftarten-Manager direkten Zugriff auf alle installierten lokalen Systemschriften (Aptos, Calibri, Arial, DIN Next etc.) ohne Datei-Upload und ohne Base64-Speicherbedarf.
2. `EyeDropper` API: Native Bildschirm-Pipette für die Farbauswahl des Briefkopfes (z. B. Abstimmung auf ein eingefügtes Firmenlogo).
3. `input.showPicker()`: Programmatisches Öffnen des nativen OS-Kalenders bei Klick auf Datumsfelder.

---

## Empfohlene Reihenfolge

1. ~~**B1**, **B2**~~ ✅ erledigt 2026-10-02 (`file://` gestrichen)
2. ~~**B3**, **B4**, **B16**~~ ✅ erledigt 2026-10-02 (Kanonisierung: eine Quelle, ein Begriff)
3. ~~**B5**~~ ✅ erledigt 2026-10-02
4. ~~**B12, B13, B14, B11**~~ ✅ erledigt 2026-10-02
5. ~~**B10**~~ ✅ Research klassifiziert 2026-10-02 (`research/STATUS.md`)
6. ~~**B6**~~ ✅ Phase 1 erledigt 2026-10-02 (`data-feldtyp` + Caret-SSoT)
7. ~~**B8**~~ ✅ erledigt 2026-10-02 (`809eb15`), ~~**B15**~~ ✅ erledigt 2026-10-02, ~~**B17**~~ ✅ erledigt 2026-10-02 (`a16899c`)
8. ~~**B7**~~ ✅ erledigt 2026-10-15 (attr()-Fallbacks entfernt, MUST-NOT 5); ~~**B19 Phase 2**~~ ❌ geschlossen (KISS)
9. **B22** (`check-geometry.js` — Guard gegen hardcodierte Geometriewerte)
10. **B23** (`law_coverage` 30/35) + **B24** (`tooling-overview` doc-size)
11. **B25** (Brief-Vorlagen) + **B26** (DIN-Validatoren Anschrift/IBAN)
12. **B27** (Mehrseitige Briefe) + **B28** (Multi-Provider Geocoding) + **B29**–**B31** (Geoapify-Tuning, Bias & Native APIs)

### B17 · Strukturprüfungen für die 14 nicht-regexfähigen Gesetze · **M** · ⭐⭐ · ✅ ERLEDIGT 2026-10-02
Vollständig umgesetzt (Commit `a16899c`):
1. `tools/structural-laws.js` prüft nun **A42** (doppelte IDs), **A57** (binäre Radios als Schalter), **A58** (Theme-Wahl als Radio), **A24** (Token ohne `:root`-Definition) und **A59** (Theme-Variablen auf dem DIN-A4-Blatt).
2. `tools/antipatterns/project.json` ergänzt um Sonden **P18** (A46: `page-break-before: always`), **P19** (A39: Icon-CDNs), **P20** (A21: CSS-Preprozessoren) und **P21** (A22: CSS-in-JS).
3. `tools/lawcoverage.js` verdrahtet die neuen Prüfer in `TOOL_ENFORCED`.
4. Gesetzliche Abdeckung von 21/35 auf **30/35 (85,7 %)** gesteigert. Die 5 verbleibenden Normen (A43, A44, A47, A60, A62) sind reine Gestaltungs-/UX-Grundsätze und werden bewusst nur berichtet.

### B18 · Adress-Dropdown mit der Tastatur bedienbar machen · **M** · ⭐⭐⭐⭐⭐ · ✅ ERLEDIGT 2026-10-02
**Härtester Fund der Research-Inventur und unabhängig von ihr gültig.**
`43-geoapify.js` → `renderSuggestions()` hängt ausschliesslich einen `click`-Listener an
jedes `<li>`. Kein `keydown`, kein `ArrowDown`/`ArrowUp`, kein `Enter`, kein
`role="listbox"`/`role="option"`, kein `aria-activedescendant`. Wer die Maus nicht
benutzt, kann keine Adresse übernehmen. Das wiegt schwerer als jedes offene CSS-Feature.
Umsetzung vor B19, weil B19 darauf aufbaut.

### B19 · Adaptive 3-Zonen-Logik + Zero-Click-Autofill · **L** · ⭐⭐⭐⭐ · ✅ ERLEDIGT (PHASE 1) / GESCHLOSSEN (PHASE 2) 2026-10-02
Quelle: ehemals `research/roadmap/ADAPTIVE_DROPDOWN_THRESHOLD_SPEC.md` und
`ZERO_CLICK_UNIQUE_AUTOCOMPLETE_UX.md` (konsolidiert). Phase 1 ist umgesetzt: > 5 Treffer zeigen
nur einen Eingrenzungshinweis, 2–5 Treffer erscheinen als Liste, genau 1 Treffer wird
nach dem vollständigen lokalen/Remote-Abgleich automatisch übernommen. Die vorherige
willkürliche `slice(0, 6)`-Anzeige ist entfernt. Phase 2 (bidirektionales Orchestrieren „Straße zuerst")
wird dauerhaft geschlossen: Die 1.500 Zeilen Adresslogik tragen bereits erhebliche Komplexität
und dürfen ohne dedizierte Unit-Tests nicht mit weiterem State-Sync-Overhead belastet werden (KISS-Prinzip).

### B20 · `fetch()`-Zeitlimits in `43-geoapify.js` · **S** · ⭐⭐⭐⭐ · ✅ ERLEDIGT 2026-10-02
Alle drei Geoapify-Anfragen haben jetzt ein natives 8-Sekunden-Limit über
`AbortSignal.timeout()`; die laufende Suche kombiniert es mit dem bestehenden
`AbortController` über `AbortSignal.any()`. Der H2-Guard (Key nur bei 401/403 löschen)
bleibt unverändert.

### B21 · Offene CSS-Features bewerten: `@page`-Seitenzahlen, `::highlight()`, `subgrid` · **M** · ⭐⭐ · ✅ BEWERTET 2026-10-02
Die drei Kandidaten ersetzen im aktuellen Ein-Seiten-/absoluten DIN-Layout keinen
bestehenden JavaScript-Pfad sicher. `@page`-Seitenzahlen warten auf die
Mehrseiten-Spec; `::highlight()` hat keinen vorhandenen DOM-Highlight-Renderer;
`subgrid` würde die IMR-Geometrie unnötig riskant umbauen. Keine Produktionsänderung.

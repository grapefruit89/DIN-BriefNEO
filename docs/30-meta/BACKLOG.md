---
id: backlog
title: Backlog — offene Baustellen nach Aufwand und ROI
status: active
type: reference
created: '2026-10-02'
updated: '2026-11-05'
tags:
- din-briefneo
- meta
- planung
- backlog
doc_links:
- '[[AGENTS]]'
- '[[DECISION-LOG]]'
- '[[BACKLOG-ARCHIV]]'
- '[[ROADMAP]]'
code_links:
- 'website/js/01-document.js'
- 'website/css/sheet.css'
- 'tools/links.js'
depends_on: []
supersedes: []
---

# Backlog — offene Aufgaben (To-do)

**Diese Datei ist die To-do-Liste: nur offene Punkte.** Erledigtes wird beim
Abschluss nach [[BACKLOG-ARCHIV]] verschoben, nicht hier abgehakt. Wer hier
etwas sucht, sucht eine Aufgabe — keine Historie. Die Historie der
Entscheidungen steht im [[DECISION-LOG]].

Abgeleitet aus den historischen Audits vom 2026-10-02 (archiviert).
Nicht normativ — die **Regeln** stehen in [[AGENTS]] §5, die **Begründungen** im
[[DECISION-LOG]]. Dieses Dokument hält nur, *was noch zu tun ist*.

**Aufteilung:** eine Tabelle oben als Index, darunter drei Abteilungen —
**Architektur & Technik**, **Neue Features**, **Entscheidungen & Doku**.

**Aufwand:** S ≤ 1 Sitzung · M = 1–2 Sitzungen · L = Full Mode mit `specs/` + ADR · N = nur Entscheidung/Doku
**ROI:** Nutzen pro Aufwand — ⭐⭐⭐ hoch, ⭐ niedrig

---

Die Übersicht wird aus den Einträgen erzeugt: `node tools/backlog-sync.mjs`
(`--check` prüft, ob Tabelle und Einträge auseinanderlaufen).

**Erledigte und abgelehnte Einträge** stehen in [[BACKLOG-ARCHIV]] — mit
denselben IDs, damit Verweise (z. B. `B7`) weiter auflösen.

## Übersicht

29 offene Punkte. Details unterhalb, nach Art gruppiert.

| Nr | Aufgabe | Aufwand | Nutzen |
|---|---|:---:|:---:|
| **B22** | Automatisierter Guard gegen hartcodierte Geometriewerte (`tools/check-geometry.js`) | M | ⭐⭐ |
| **B25** | Vorkonfigurierte Brief-Vorlagen (JSON-Muster) | M | ⭐⭐⭐ |
| **B26** | Optionale DIN-5008-Validatoren (Anschrift-Zeilenlimit & IBAN) | S | ⭐⭐ |
| **B28** | Multi-Provider Geocoding Abstraktionsschicht (Nominatim, Photon, BKG) | M | ⭐⭐⭐ |
| **B29** | Geoapify Performance Tuning (Pre-Warming, Session-Debounce & LRU-Cache) | S | ⭐⭐⭐ |
| **B30** | Geoapify Region Bias & Multi-Cluster Failover (EU/Global Endpunkte) | S | ⭐⭐ |
| **B31** | Native Browser-APIs: LocalFonts API (Systemschriften), EyeDropper & showPicker | S | ⭐⭐ |
| **B32** | Brief-Verlauf und zwei Adressbücher (Addon `verlauf`) | S | ⭐⭐⭐⭐ |
| **B33** | DIN-5008-Telefonnummer-Formatierer (Expliziter Button) | S | ⭐⭐⭐ |
| **B35** | Subpixel-Falz- und Lochmarken (SVG vs. CSS-Border) | S | ⭐⭐⭐ |
| **B36** | Schema-Datei für v3 anlegen oder Verweis endgültig streichen | N | ⭐ |
| **B38** | Chromium klemmt Rahmenbreiten unter 1px auf 1px | N | ⭐ |
| **B40** | Vier vorbestehende Testfehler dokumentieren | M | ⭐⭐ |
| **B49** | Test-Dossier ins Repo | S | ⭐⭐ |
| **B51** | Design-Tokens in `sidebar.css` durchziehen | M | ⭐⭐ |
| **B52** | Plugin-Punkt für `website/addons/` | L | ⭐⭐ |
| **B57** | CSS-Druckränder: `page-margin-safety` in `print.css` evaluieren | S | ⭐⭐ |
| **B58** | Gzip/Minify als Abschluss-Option | S | ⭐ |
| **B59** | Kaskade über `@layer` statt `!important` | M | ⭐⭐ |
| **B64** | `sidebar.css`: Optik und Struktur trennen | L | ⭐⭐ |
| **B76** | PDF-Export als Addon | M | ⭐⭐ |
| **B80** | Export als `.txt` und `.md` | S | ⭐⭐ |
| **B81** | Multi-Tab: das Restrisiko benennen oder abschaffen | S | ⭐ |
| **B82** | Toast: Auto-Dismiss in CSS statt JS-Timer | S | ⭐ |
| **B83** | Signatur: globalen `pointerdown`-Listener durch `:hover`/`:focus-within` ersetzen | S | ⭐⭐ |
| **B84** | `ClipboardAddressParser` bewerten: behalten oder aufteilen | M | ⭐⭐ |
| **B85** | Anschriftfeld-Geometrie: DIN Tab. B.1 oder bewusste Abweichung? | M | ⭐⭐⭐ |
| **B87** | Text- und Adress-Parsing modernisieren (Konzept) | M | ⭐ |
| **B91** | BIC → Bankname als Erweiterung (Addon) | M | ⭐⭐ |
## 🏗️ Architektur & Technik

Schulden, Gates, Messbarkeit. Diese Punkte ändern, **wie** die App gebaut ist.

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

### B29 · Geoapify Performance Tuning (Pre-Warming, Session-Debounce & LRU-Cache) · **S** · ⭐⭐⭐
**Kontext:** Konsolidiert aus `GEOAPIFY_OPTIMIZATION_CONCEPT.md`.
**Ziel:** Feinabstimmung der Remote-Adressabfrage: Verbindungsvorwärmung (`preconnect`/DNS-Prefetch bei Fokus auf das Straßenfeld), dynamischer Session-Debounce (500 ms) und In-Memory LRU-Cache für wiederholte Tastenanschläge zur Minimierung von API-Calls.

### B40 · Vier vorbestehende Testfehler dokumentieren · **M** · ⭐⭐
Gemessen am 2026-11-05 (Commit `aa4a39b`, reproduziert in eigenem Worktree):
**122 Tests bestanden, 4 fehlgeschlagen** — vorbestehend, nicht durch die Persistenz-
oder Dead-Code-Commits verursacht. Stand 2026-11-06 (`c0bbbaf`): **133 Tests, 129
bestanden**, dieselben vier rot.

- „ignoriert Metadaten-Zeilen wie Telefon, Fax und Register" — Adress-Parser
- „entfaltet einzeilige kommagetrennte Adressen (TC-05)" — Adress-Parser
- „toleriert eingeschobene Ortsteile zwischen Straße und PLZ" — Adress-Parser
- „erfüllt alle UI-Refactor Anforderungen (keine per-step Buttons, Confirm bei …)" — UI-Policy

Zu entscheiden: fixen oder als akzeptiert markieren. Betrifft Adress-Parser und
UI-Policy, nicht den Kern. Siehe [[ARCHITECTURE-MAP]] und `befundpruefung-2026-11-05` (archiviert).

### B51 · Design-Tokens in `sidebar.css` durchziehen · **M** · ⭐⭐
`sidebar.css` enthält 260 rohe `px`-Werte, obwohl Tokens (`--mm-*`, `--pt`) existieren.
`sheet.css` nutzt sie bereits; die Seitenleiste nicht.

### B52 · Plugin-Punkt für `website/addons/` · **L** · ⭐⭐
`website/addons/` kennt nur `testbrief` und `webmcp-bridge` — es gibt keinen
Plugin-Punkt, über den ein Addon sich registriert. `testbrief` wird direkt per
`import()` in `main.js` geladen (drei Stellen), `webmcp-bridge.js` ist bewusst
**geparkt und nicht geladen** (Statuskopf in der Datei).

Derselbe Andockpunkt würde drei Dinge tragen, die heute einzeln gelöst sind:
austauschbares Theme-CSS, PDF-Export (siehe DeepSeek-Mitschrift 2026-11-14)
und die WebMCP-Bridge. Bedingung: ein Addon darf den Boot-Pfad nicht belasten,
also Registrierung nach `data-ready` und Code erst beim Aufruf.

### B57 · CSS-Druckränder: `page-margin-safety` in `print.css` evaluieren · **S** · ⭐⭐
- **Quelle:** `docs/90-archive/web-standards-tracking.md`.
- **Problem:** Druckertreiber klemmen DIN-5008-Ränder an unbedruckbaren Bereichen ab.
- **Aufgabe:** Evaluierung des Chrome-150+ Descriptors `@page { page-margin-safety: clamp; }` für Hardware-Rand-Kompensation.

### B58 · Gzip/Minify als Abschluss-Option · **S** · ⭐
Nicht jetzt. Gemessen am 2026-11-14: JS 314 KB roh → 134 KB minifiziert (gzip
~90 → 44 KB), CSS 92 → 61 KB. Gesamt gzip heute 144 KB. Ein Bundler würde
außerdem 15 Requests sparen — auf HTTP/2 irrelevant. Der einzige echte Gewinn
wäre Cache-Busting per Hash. Entscheidung: bleibt offen bis zum Abschluss;
dann als eigenes Experiment messen (LCP/FCP vorher/nachher), nicht als
Voraussetzung für die Architekturarbeit.

### B59 · Kaskade über `@layer` statt `!important` · **M** · ⭐⭐
Ist-Zustand (gemessen 2026-11-14): **153 × `!important`** und **346
ID-Selektor-Vorkommen** in 1.000 Zeilen CSS; allein `sheet-multipage.css`
enthält 100 `!important`. `@layer` (Chrome 99+, nativ) macht die Reihenfolge
explizit und erlaubt, einen großen Teil davon zu streichen. Gehört zu S2 aus dem
Batch-01-Review. Vorher: Reihenfolge der heutigen Kaskade dokumentieren, sonst
verschiebt der Umbau ungewollt Spezifität.

### B64 · `sidebar.css`: Optik und Struktur trennen · **L** · ⭐⭐
1241 Zeilen, **118 ID-Selektor-Vorkommen**, und darin liegen zwei Dinge
gleichzeitig: die Gestaltung der Leiste **und** der Strukturvertrag des
Modus-Wechsels (`:has(#modus-einstellungen:checked)` auf Zonen und Gruppen).
Stand 2026-11-14: 7 Modus-Regeln, davon 6 mit Design-Adressen.
Ziel: der Strukturvertrag (was ist in welchem Modus sichtbar) liegt bei den
Strukturen (`base.css`), die Optik bleibt in `sidebar.css`.
Der `data-nur`-Vorschlag aus Batch 01 wurde abgelehnt — diese Aufgabe ist
**ohne** ihn zu lösen, sonst wird sie nicht angefasst.
Gehört in Review-Batch 04 (Scheibe: `sidebar.css` + `index.html`).

### B80 · Export als `.txt` und `.md` · **S** · ⭐⭐
**Herkunft:** `docs/90-archive/todo-2026-11/14-format-grundbausteine-review.md` (Punkt 15), am 2026-11-14 geprüft: weiterhin offen.
**Problem:** Es gibt genau zwei Ausgabeformen — Druck/PDF und `.json`. Wer den Brief in einem Mailprogramm oder einer Textdatei braucht, muss den Text von Hand markieren.
**Lösung:** Zwei Knöpfe im Ausgabe-Block: `.txt` (reiner Text, `stripHtmlToPlaintext` existiert) und `.md` (Überschriften und Absätze aus dem Rich-Text). Download über `Blob` + `URL.createObjectURL`, kein neuer Zustand. `.docx` bleibt zurückgestellt.

### B81 · Multi-Tab: das Restrisiko benennen oder abschaffen · **S** · ⭐
**Stand 2026-11-15 (Code gelesen, `draft-manager.js`):** Es gibt eine Regel,
keine halbe Lösung:
- Ein `storage`-Event auf `din_draft_current` wird ausgewertet.
- Ist dieser Tab **im Hintergrund** und hat **keine offenen Eingaben**
  (`debounceTimer === null`), übernimmt er den neuen Stand (`loadDraft()`).
- Sonst erscheint der Toast „Der Brief wurde in einem anderen Tab
  aktualisiert." (`Constants.TOASTS.DRAFT.MULTI_TAB`).
- Web Locks wurden **bewusst** verworfen (Single-User-App, Over-Engineering).

**Was wirklich offen ist:** der Fall *beide Tabs tippen*. Tab A hat einen
offenen Debounce, Tab B speichert — der Toast warnt A, aber A's nächster
Speichervorgang überschreibt B. Auf einem Bildschirm ist das selten (nur ein
Tab hat den Fokus), mit zwei Fenstern auf zwei Monitoren aber möglich.

**Entscheidung nötig, nicht Code:** Restrisiko dokumentieren und akzeptieren
(Toast ist die Warnung) **oder** eine Versionsnummer im Entwurf einführen und
beim Speichern vergleichen (dann: Konflikt statt Überschreiben). Empfehlung:
akzeptieren — der Schaden ist ein verlorener Absatz, die Reparatur wäre ein
zweiter Zustand in jeder Speicherung.

### B82 · Toast: Auto-Dismiss in CSS statt JS-Timer · **S** · ⭐
**Herkunft:** `docs/90-archive/todo-2026-11/15-overengineering-review.md` (Punkt 24).
**Problem:** `core.js` führt einen `setTimeout` und räumt ihn im `toggle`-Handler auf. Das kann CSS heute selbst: `animation` mit `animation-fill-mode` und `animationend` bzw. `@starting-style` — kein Timer, kein Aufräumpfad.
**Nutzen:** Eine Zustandsmaschine weniger, die man bei Gelegenheit vergisst. Nur beim nächsten Anfassen von `core.js`.

### B83 · Signatur: globalen `pointerdown`-Listener durch `:hover`/`:focus-within` ersetzen · **S** · ⭐⭐
**Herkunft:** `docs/90-archive/todo-2026-11/17-js-vs-css-rest.md` (Punkt 29), geprüft: `pointerdown` steht noch in `signature.js`.
**Problem:** Ein `document`-Listener auf jeder Zeigerbewegung nur dafür, die Signatur-Box ein- und auszublenden.
**Lösung:** CSS `:hover`/`:focus-within` auf dem Signatur-Bereich. Vorher messen, dass die Bbox im PDF unverändert bleibt (Geometrie!).

### B84 · `ClipboardAddressParser` bewerten: behalten oder aufteilen · **M** · ⭐⭐
**Herkunft:** `docs/90-archive/todo-2026-11/done/18-overengineering-mass.md` (Punkt 35), geprüft: Modul lebt, 615 Zeilen.
**Problem:** Das Modul ist die größte Einzeldatei nach `address.js` und trägt Parsing, Normalisierung und UI-Anbindung. Ob das eine Verantwortung ist, wurde nie entschieden.
**Lösung:** Eine Messung (wie viele Pfade, wie viele Tests) und dann eine Entscheidung: behalten mit Begründung oder in Parser + Anbindung teilen.

## ✨ Neue Features

Produktideen. Sie ändern, **was** die App kann — nicht, wie sie gebaut ist.
Reihenfolge ist Absicht: erst die Struktur, dann die Features.

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

**Priorität: ZZZ — zuletzt.** Bewusst geparkt: reine Komfort-Validierung
(Zeilenlimit-Anzeige, IBAN-Modulo-97), kein Schaden belegt. Wird nicht
angefasst, solange irgendetwas anderes offen ist.

**Ergänzung 2026-11-15 (GitHub #21):** Der Vorschlag dort trennt drei Dinge sauber, und nur die zwei kleinen gehören hierher:
- **Formatieren** ist reine Algorithmik und existiert (`formatIban` in `format.js`) — nichts zu tun.
- **IBAN prüfen** ist Modulo-97 über BigInt, ein paar Zeilen — das ist der Kern dieses Eintrags.
- **BIC formal prüfen** ist ein Regex (`^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$`), 0 Byte Daten — passt dazu, gleicher Aufwand.
- **Bankname zu BIC** ist ein eigenes Vorhaben und steht als B91 im Abschnitt „Neue Features" — eine Datenquelle ist ein Pflegeversprechen, keine Zeile Code.

### B28 · Multi-Provider Geocoding Abstraktionsschicht (Nominatim, Photon, BKG) · **M** · ⭐⭐⭐
**Kontext:** Konsolidiert aus `MULTI_PROVIDER_INTEGRATION_BLUEPRINT.md`.
**Ziel:** Provider-unabhängiges Interface für Straßen- und Adress-Lookups als Fallback oder datensparsame Offline/Selbsthost-Option neben Geoapify (z. B. Nominatim, Komoot Photon, BKG Bund). Konsistente Datenstruktur `{ plz, city, street, state }` ohne Vendor-Lock-in.

---

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

### B33 · DIN-5008-Telefonnummer-Formatierer (Expliziter Button) · **S** · ⭐⭐⭐
**Kontext:** DIN 5008 Kap. 20.6 (funktionsbezogene Gliederung von Telefonnummern).
**Ziel:** Rechtskonforme, standardisierte Formatierung deutscher und internationaler Rufnummern:
- **Normformat:** Landesvorwahl mit `+` (z. B. `+49`), Trennung von Ortsnetz/Mobilfunk und Rufnummer durch Leerzeichen, Durchwahl mit Bindestrich ohne Leerzeichen (`+49 2241 12345-67`).
- **KISS-Bedienung:** Kein fehleranfälliges `oninput`- oder `onblur`-Auto-Formatting (verhindert Cursor-Jumping und Falschkorrekturen bei Sonderrufnummern).
- **UI:** Expliziter Aktions-Button `#btn-format-tel` direkt am Telefonnummern-Eingabefeld.
- **Defensives Parsing:** Kann eine Nummer nicht eindeutig zerlegt werden, bleibt der Originaltext unberührt und es wird ein dezenter Warnhinweis ausgegeben.

### B35 · Subpixel-Falz- und Lochmarken (SVG vs. CSS-Border) · **S** · ⭐⭐⭐
**Kontext:** DIN 5008 Kap. 20.3 (Falzmarken Form A/B und Lochmarke).
**Ziel:** Höchste Präzision beim Drucken und PDF-Rendern:
- **Problem:** CSS-Border (`border-top: 1px solid`) leidet bei 96/300 DPI unter Rundungsfehlern und treiberabhängigen Skalierungsunschärfen (Hairline-Problem).
- **Lösung:** Vektorbasierte `<svg>`-Marken mit `stroke-width="0.25mm"` und `vector-effect="non-scaling-stroke"`.
- **IMR-Invariante:** Koordinaten (`data-falz-1-y`, `data-falz-2-y`, `data-loch-y`) verbleiben als deklarative `data-*`-Attribute am HTML-Wurzelelement (SSoT).
- **Print-Sicherheit:** Sicherstellen, dass `print.css` die SVG-Marken nicht versehentlich unterdrückt.

---

### B87 · Text- und Adress-Parsing modernisieren (Konzept) · **M** · ⭐
**Herkunft:** `docs/90-archive/todo-2026-11/09-text-parsing-modernization-plan.md`, geprüft: kein `Intl.Segmenter` und kein `RegExp`-`v`-Flag im Code.
**Inhalt:** Dreistufige Pipeline für die Zwischenablage (Segmentierung via `Intl.Segmenter`, Muster via `RegExp` mit `v`-Flag, deterministische Adress-Zuordnung) statt der heutigen Kette aus `split`/Regex.
**Warum ⭐:** Kein belegter Schaden, reine Modernisierung. Erst anfassen, wenn `clipboard-parser.js` ohnehin geändert wird (siehe B84).

## 🧩 Addons

Eigene Erweiterungen nach dem Muster `website/addons/`: per `import()` beim
Klick geladen, **nie** im Boot-Pfad. Ein Addon darf den Kern nicht voraussetzen
und muss ohne es laufen (0 Byte, wenn niemand es öffnet).

### B32 · Brief-Verlauf und zwei Adressbücher (Addon `verlauf`) · **S** · ⭐⭐⭐⭐
**Kontext:** Re-integriert aus archivierten Entwurfsmustern. Verhindert Datenverlust bei versehentlichem Leeren oder Überschreiben des Entwurfs.
**Ziel:** Automatisches oder semi-automatisches Archivieren von Briefständen:
- **Datenhaltung:** Eigener LocalStorage-Key `din_history` mit maximal 10 Einträgen (FIFO-Ringspeicher).
- **Trigger:** Gespeichert wird automatisch beim Drucken/PDF-Export sowie über einen expliziten UI-Button („In Verlauf sichern“).
- **Metadaten pro Eintrag:** `{ id, timestamp, empfaengerName, betreff, schema_version: 2, data }`.
- **UI:** Schlankes `<details>`-Element in der Seitenleiste („Verlauf (letzte 10)“) mit Datum, Empfänger und Betreff.
- **Sicherheit & Integrität:** Beim Wiederherstellen (`restoreState`) wird die bestehende Allowlist-Bereinigung (`sanitizeRichText`) zwingend durchlaufen. Bei ungespeicherten Änderungen am aktuellen Entwurf erfolgt eine Sicherheitsabfrage.

**Vorarbeit liegt bereit, ist aber NICHT geladen (2026-11-15):**
`website/addons/verlauf/` — `verlauf.js` (Datenschicht, 15 Exporte, kein DOM) und
`README.md` (Konzept, Datenmodell, Aktivierung, Quota-Rechnung, offene
Entscheidungen). Kein `<script>`, kein `import` in `main.js` — 0 Byte, solange
niemand es lädt.

**Drei Teile, eine Ablage:**
- **Verlauf**: 10 Briefe, gespeichert als **Export-Payload**; Wiederherstellen
  über `parseDinLetterPayload` → `applyImportedData` (der geprüfte Import-Pfad,
  kein zweiter Restore-Weg).
- **Absender-Adressbuch**: Name, Straße, Ort, Telefon, Mail.
- **Empfänger-Adressbuch**: Firma, Name, Straße, Ort.

**Warum eigene Schlüssel:** `din_local_addresses` ist die *abgeleitete*
Such-Historie, und `draft-manager.js` löscht sie beim Zurücksetzen (Privacy,
Zeile 476–482). Ein vom Nutzer getipptes Adressbuch darf dabei nicht
verschwinden — also `din_addressbook_sender` / `din_addressbook_recipient`.

**Funktionsprobe (Browser, 2026-11-15):** dynamisch importiert auf
`127.0.0.1:8088` — 12 Speicherungen → 10 Einträge (neuester „Brief 12",
ältester „Brief 3"), Doppel-Speicherung → gleiche id mit neuem Zeitstempel,
600-KB-Brief → `ok:false` und Verlauf unverändert, `historyToImport` →
`ok:true` mit Feldern und Layout, Adressbuch-Duplikat (Groß-/Kleinschreibung)
→ 1 Eintrag, Löschen unbekannter id → `false`. Die `localStorage`-Schlüssel
wurden danach zurückgesetzt.

**Offen bis zur Aktivierung:** wann gespeichert wird (Empfehlung: nur bei
Druck/Export, sonst zehn Fassungen desselben Briefes), ob „Zurücksetzen" den
Verlauf mitlöscht, und ob der Empfänger automatisch ins Buch wandert (Empfehlung:
nur auf Klick). Die UI fehlt bewusst — dieses Addon ist die Datenschicht.

### B76 · PDF-Export als Addon · **M** · ⭐⭐
Der DeepSeek-Mitschnitt (2026-11-14) schlägt `window.print()` plus Metadaten
vor, alternativ `pdf-lib` per CDN. Entscheidung: eigener Addon-Pfad unter
`website/addons/`, geladen per `import()` beim Klick, **nicht** im Boot-Pfad
(Muster: `testbrief.js`). Voraussetzung ist der Plugin-Punkt aus B52.

### B91 · BIC → Bankname als Erweiterung (Addon) · **M** · ⭐⭐
**Herkunft:** GitHub #21. Material für eine Erweiterung, nicht für den Kern.

**Was es wäre:** Wer eine IBAN eintippt, sieht den Banknamen — und wer eine BIC
tippt, bekommt sie auf gültige Form geprüft.

| Teil | Aufwand | Daten |
|---|---|---|
| BIC **formal** prüfen (`^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$`) | Minuten | 0 Byte |
| BLZ → BIC + Bankname (Deutschland) | Tage | Bundesbank-CSV ~0,3 MB → extrahierte JSON **80–120 KB** |
| Internationale Banknamen (`lobax/banknames`, pro Land) | Tage | pro Land ähnlich; nur was unterstützt wird |

**Die eigentliche Entscheidung ist nicht der Code, sondern die Daten:** eine
mitgelieferte Tabelle ist ein Pflegeversprechen (Bankfusionen, neue BLZ). Sie
muss entweder versioniert mit Quelle und Datum im Repo liegen (dann ist sie
Teil des Produkts) oder gar nicht. Ein externer Dienst scheidet aus —
Offline-First und Zero-Dependency sind Gesetz (A1, A37).

**Bedingung:** nur lazy laden (beim Fokussieren des BIC-Felds), nicht beim
Start; sonst kostet die Idee 80–120 KB auf dem kritischen Pfad, die 99 % der
Briefe nie brauchen.

## 📚 Entscheidungen & Doku

Offene Entscheidungen und Dokumentationslücken. Brauchen eine Antwort, keinen Code.

### B36 · Schema-Datei für v3 anlegen oder Verweis endgültig streichen · **N** · ⭐
Die `$schema`-Zeile in `website/llms.txt` ist seit `186664c` entfernt (kein
404 mehr). Offen ist nur die Entscheidung:

| Option | Kosten | Nutzen |
|---|---|---|
| `website/schema/v3/din-letter.json` anlegen | ~100 Zeilen JSON-Schema, muss bei jeder Feldänderung mitgepflegt werden | fremde Werkzeuge können Dateien validieren |
| Verweis dauerhaft streichen | 0 | – |

**Empfehlung: streichen.** Es gibt keinen Konsumenten (kein Build, kein
externer Parser), und `parseDinLetterPayload` ist die Wahrheit — ein zweites
Schema daneben driftet garantiert. Wenn jemand fremdes die Dateien validieren
will, ist das der Moment, es anzulegen, nicht vorher.

### B38 · Chromium klemmt Rahmenbreiten unter 1px auf 1px · **N** · ⭐
Gemessen in Chromium 156 auf einer leeren `data:`-Seite ohne App-CSS: `0.25pt`,
`0.5pt`, `0.8pt` und `1pt` liefern alle `1px`, erst `2px` liefert `2px` — auch bei
DPR 2 unverändert. Die Falzmarken sind auf dem Bildschirm daher **nicht** dünner als
vorher; im Druck/PDF wirkt `0.5pt` (0,176 mm statt 0,282 mm). Die Änderung in
`7e59132` ist die Angleichung an `print.css`/`print-multipage.css` (dort war 0.5pt
schon immer gesetzt) — kein neuer Effekt, sondern Konsistenz.
**Kein Fix über CSS-Rahmenbreiten möglich** (Chromium-Verhalten: Rahmen werden auf
ganze Gerätepixel gerundet). Der einzige Weg zu echter Subpixel-Stärke ist der
SVG-Ansatz aus **B35** (`stroke-width` in mm, `vector-effect="non-scaling-stroke"`).
Bis dahin nur dokumentieren, damit niemand erwartet, dass 0.5pt auf dem Schirm
sichtbar dünner ist.

### B49 · Test-Dossier ins Repo · **S** · ⭐⭐
Die Testlandschafts-Analyse liegt nur im Chat. `befundpruefung-2026-11-05.md` (archiviert); ohne Ablage wird dieselbe Analyse doppelt gemacht.

### B85 · Anschriftfeld-Geometrie: DIN Tab. B.1 oder bewusste Abweichung? · **M** · ⭐⭐⭐
**Herkunft:** `docs/90-archive/todo-2026-11/README.md` (Punkt 49), unverändert offen.
**Problem:** Die Rücksendezeile steht 5,7–6,8 mm und die Empfängeranschrift 12,1 mm zu hoch (gemessen 2026-11-11). `data-anschriftfeld-y` trifft die DIN-Rücksendezeile auf 0,1–0,2 mm, wird aber als Beginn der Adresszone gelesen; `#vermerke` reserviert die 17,7-mm-Zone nicht (`display: none`). Optionen A/B/C stehen in `docs/10-architecture/IMR-Registry.md` §2a.
**Warum offen:** Jede normkonforme Variante verschiebt alle PDF-Referenzen und braucht eine neue Referenzmessung. Das ist eine Nutzerentscheidung, keine Codefrage.

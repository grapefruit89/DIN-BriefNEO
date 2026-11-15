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

32 offene Punkte. Details unterhalb, nach Art gruppiert.

| Nr | Aufgabe | Aufwand | Nutzen |
|---|---|:---:|:---:|
| **B22** | Automatisierter Guard gegen hartcodierte Geometriewerte (`tools/check-geometry.js`) | M | ⭐⭐ |
| **B25** | Vorkonfigurierte Brief-Vorlagen (JSON-Muster) | M | ⭐⭐⭐ |
| **B26** | Optionale DIN-5008-Validatoren (Anschrift-Zeilenlimit & IBAN) | S | ⭐⭐ |
| **B28** | Multi-Provider Geocoding Abstraktionsschicht (Nominatim, Photon, BKG) | M | ⭐⭐⭐ |
| **B29** | Geoapify Performance Tuning (Pre-Warming, Session-Debounce & LRU-Cache) | S | ⭐⭐⭐ |
| **B30** | Geoapify Region Bias & Multi-Cluster Failover (EU/Global Endpunkte) | S | ⭐⭐ |
| **B31** | Native Browser-APIs: LocalFonts API (Systemschriften), EyeDropper & showPicker | S | ⭐⭐ |
| **B32** | History / Brief-Verlauf (Archiv der letzten 10 Briefe) | S | ⭐⭐⭐⭐ |
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
| **B81** | Multi-Tab-Sync: entscheiden statt halb | S | ⭐⭐ |
| **B82** | Toast: Auto-Dismiss in CSS statt JS-Timer | S | ⭐ |
| **B83** | Signatur: globalen `pointerdown`-Listener durch `:hover`/`:focus-within` ersetzen | S | ⭐⭐ |
| **B84** | `ClipboardAddressParser` bewerten: behalten oder aufteilen | M | ⭐⭐ |
| **B85** | Anschriftfeld-Geometrie: DIN Tab. B.1 oder bewusste Abweichung? | M | ⭐⭐⭐ |
| **B86** | Tote Einstellung `copyfit` entfernen oder implementieren | S | ⭐⭐ |
| **B87** | Text- und Adress-Parsing modernisieren (Konzept) | M | ⭐ |
| **B88** | Kaskade: 35 spiegelnde `!important` auflösen | M | ⭐⭐⭐ |
| **B89** | Chrome-157–160-Behauptungen prüfen, bevor sie ins Design gehen | S | ⭐⭐ |
| **B90** | `data-generated` ist tot, `--rand-u` könnte CSS lesen | S | ⭐ |
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

### B81 · Multi-Tab-Sync: entscheiden statt halb · **S** · ⭐⭐
**Herkunft:** `docs/90-archive/todo-2026-11/15-overengineering-review.md` (Punkt 20), geprüft: `draft-manager.js` hört auf `storage`, aber nur lesend.
**Problem:** Zwei Tabs auf demselben Brief überschreiben sich. Der Listener existiert, die Regel fehlt: Wer gewinnt bei gleichzeitigen Änderungen? Heute gewinnt der letzte Schreibvorgang, ohne Warnung.
**Lösung:** Entweder vollständig (Version im Entwurf, Konflikt-Hinweis per Toast, Übernahme nur auf Klick) oder ganz entfernen. Beides ist ehrlicher als der halbe Zustand.

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

### B88 · Kaskade: 35 spiegelnde `!important` auflösen · **M** · ⭐⭐⭐
**Herkunft:** GitHub #20 — das externe Review zu Batch 03 hat die 96 Deklarationen in `sheet-multipage.css` sortiert. Die Zahlen sind nachgeprüft (Faktenblatt mit Kommentar- und `@page`-Korrektur, `ce445dc`).

**Aufteilung der 96 (71 im Druck):**

| Gruppe | n | Bedeutung |
|---|---:|---|
| (a1) echter Kampf gegen eine Screen-Regel mit **anderem** Wert | 9 | muss bleiben, bis der Gegner umgebaut ist |
| (a2) **Spiegel**: Druck-Regel wiederholt denselben Wert, den die Screen-Regel schon setzt | **35** | änderbar nichts — die Datei hat kein `@media screen`, die Screen-Regeln gelten im Druck mit. Kandidaten zum Löschen |
| (b) `!important` nur gegen ein anderes `!important` | 8 | Wettrüstungs-Rest |
| (c) gegen Inline-Style oder `@page` | 0 belegbar | – |
| nicht beurteilbar (Gegner in anderer Datei) | 17 | braucht base/sidebar/common im selben Blick |

**Stichprobe (a2) bestätigt:** `#betreff` Screen Z. 286–290 (`display: block`, `font-size: 12pt`, `font-weight: 700`, `line-height: 1.4`) und Druck Z. 567–572 — dieselben vier Werte, dort mit `!important`. Gleiches Muster bei `#text` (583–590 gegen 314–326) und `#grussformel` (605–610 gegen 330–337).

**Drei Einzelfälle:**
- Z. 473/474 (`@page :first { content: none !important }`) sind vermutlich überflüssig: `@page :first` ist spezifischer als `@page`, und `@top-left` hat in Z. 447–464 gar kein `content`. Gegenprobe: entfernen, PDF Seite 1 prüfen.
- Z. 122 (`margin: 0 auto !important`) hat in der Datei nur Z. 109 als Gegner (0,1,0 gegen 0,2,1) — dort unnötig.
- Z. 276 (`#spacer { display: block !important }`) hat keinen Gegner; ein `<div>` ist ohnehin `block`.

**Achtung, Korrektur am Review:** die fünf `container-type: normal !important` (Z. 88, 99, 508, 516, 533) sind **nicht** tot. Sie schalten `container-type: size` aus `base.css:291` ab, und `cqw`/`cqh` werden in `base.css:234/237` (`@function --mm-x/--mm-y`) tatsächlich benutzt. Das Review schlug Löschen vor, „wenn kein `@container` trifft" — das Kriterium greift zu kurz.

**Messung:** 12 PDFs (Form A/B × 1/2/3 Seiten × Anlagen an/aus), `pdftotext -bbox`, Toleranz 0,5 px; Pixelgegenprobe per `pdftoppm -r 300` + `compare`.

### B90 · `data-generated` ist tot, `--rand-u` könnte CSS lesen · **S** · ⭐
**Herkunft:** GitHub #17 — eine „JS→CSS"-Analyse. **Sieben der acht Punkte sind erledigt** und standen trotzdem als offen im Issue; nur diese zwei bleiben:

| Punkt aus #17 | Stand heute |
|---|---|
| `data-anlagen`/`data-fuss` | erledigt (Batch 01, `:has()`) |
| `data-gesetzt` | erledigt (B62, `:has(option:checked…`) |
| `data-visible` | erledigt (`:not(:placeholder-shown)`) |
| `data-layout` | erledigt (B63, eine Spur) |
| `data-generated` | **tot**: kein Schreiber, kein Leser — nur noch Kommentare in `sheet-common.css:672` und in der stillgelegten `sheet.css` |
| Font-Presets | `font-feature.js` setzt `--active-font-family` — eine `:has()`-Variante wäre möglich, aber ohne Messwert keinen Umbau wert |
| `--rand-u` | 2 Schreiber (`boot.js:68`, `settings.js:113`), CSS liest es nur im Druck (`#kern` padding). `:has(#btn-rand-u-30:checked)` wäre möglich — **aber** es ist Druckgeometrie, also nur mit PDF-Gegenprobe |

**Lösung:** Die zwei toten Kommentare entfernen (Zeilenangabe oben) und `--rand-u` nur anfassen, wenn ohnehin ein PDF-Diff ansteht. Der Rest des Issues ist geschlossen.

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
- **Bankname zu BIC** bräuchte eine Bundesbank-JSON (~80–120 KB, lazy geladen). Das ist ein eigener Eintrag, wenn es je gewünscht wird — eine Datenquelle ist ein Versprechen auf Pflege, keine Zeile Code.

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

### B32 · History / Brief-Verlauf (Archiv der letzten 10 Briefe) · **S** · ⭐⭐⭐⭐
**Kontext:** Re-integriert aus archivierten Entwurfsmustern. Verhindert Datenverlust bei versehentlichem Leeren oder Überschreiben des Entwurfs.
**Ziel:** Automatisches oder semi-automatisches Archivieren von Briefständen:
- **Datenhaltung:** Eigener LocalStorage-Key `din_history` mit maximal 10 Einträgen (FIFO-Ringspeicher).
- **Trigger:** Gespeichert wird automatisch beim Drucken/PDF-Export sowie über einen expliziten UI-Button („In Verlauf sichern“).
- **Metadaten pro Eintrag:** `{ id, timestamp, empfaengerName, betreff, schema_version: 2, data }`.
- **UI:** Schlankes `<details>`-Element in der Seitenleiste („Verlauf (letzte 10)“) mit Datum, Empfänger und Betreff.
- **Sicherheit & Integrität:** Beim Wiederherstellen (`restoreState`) wird die bestehende Allowlist-Bereinigung (`sanitizeRichText`) zwingend durchlaufen. Bei ungespeicherten Änderungen am aktuellen Entwurf erfolgt eine Sicherheitsabfrage.

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

### B76 · PDF-Export als Addon · **M** · ⭐⭐
Der DeepSeek-Mitschnitt (2026-11-14) schlägt `window.print()` plus Metadaten
vor, alternativ `pdf-lib` per CDN. Entscheidung: eigener Addon-Pfad unter
`website/addons/`, geladen per `import()` beim Klick, **nicht** im Boot-Pfad
(Muster: `testbrief.js`). Voraussetzung ist der Plugin-Punkt aus B52.

### B86 · Tote Einstellung `copyfit` entfernen oder implementieren · **S** · ⭐⭐
**Befund 2026-11-14:** `copyfit` steht in `DEFAULT_SETTINGS`, im Persistenz-Schema (`persistence.js:497`, `:606`) und in `website/llms.txt` — **niemand liest den Wert**. Es gibt keinen Code, der bei `copyfit: true` irgendetwas täte. Das Konzept liegt in `docs/90-archive/todo-2026-11/07-addon-copyfitting-plan.md`.
**Lösung:** Entweder implementieren (Kompaktsatz nach DIN-5008-Toleranz) oder Feld samt Schema-Zweig und `llms.txt`-Satz entfernen. Ein Schalter, der nichts schaltet, ist die schlechteste Variante.

### B87 · Text- und Adress-Parsing modernisieren (Konzept) · **M** · ⭐
**Herkunft:** `docs/90-archive/todo-2026-11/09-text-parsing-modernization-plan.md`, geprüft: kein `Intl.Segmenter` und kein `RegExp`-`v`-Flag im Code.
**Inhalt:** Dreistufige Pipeline für die Zwischenablage (Segmentierung via `Intl.Segmenter`, Muster via `RegExp` mit `v`-Flag, deterministische Adress-Zuordnung) statt der heutigen Kette aus `split`/Regex.
**Warum ⭐:** Kein belegter Schaden, reine Modernisierung. Erst anfassen, wenn `clipboard-parser.js` ohnehin geändert wird (siehe B84).

## 📚 Entscheidungen & Doku

Offene Entscheidungen und Dokumentationslücken. Brauchen eine Antwort, keinen Code.

### B36 · Schema-Datei für v3 anlegen oder Verweis endgültig streichen · **N** · ⭐
Die `$schema`-Zeile in `llms.txt` ist seit `186664c` entfernt (kein 404 mehr).
Offen ist die Entscheidung: eine `website/schema/v3/din-letter.json` anlegen (dann
Verweis wieder aufnehmen) oder das Schema dauerhaft nicht ausliefern.
Kein akuter Bug — nur eine Entscheidung, die irgendwann fallen muss.

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

### B89 · Chrome-157–160-Behauptungen prüfen, bevor sie ins Design gehen · **S** · ⭐⭐
**Herkunft:** GitHub #22 — eine Liste neuer Web-Plattform-Features für Chrome 157 bis 160.

**Warum das auf den Tisch muss:** Der Testlauf meldet heute **Chrome 156** (`test-runner`). Behauptungen über 157–160 betreffen also **noch nicht veröffentlichte** Versionen. Bei diesem Projekt gab es das schon einmal: von zwölf Behauptungen hielten fünf nicht (`docs/90-archive/upstream-befund-2026-11-10.md`). Ein Design, das auf einer erfundenen API aufsetzt, kostet einen Tag.

**Was zu tun ist:** Jede Zeile einzeln gegen die Primärquelle (`chromestatus.com/api/v0/features`, BCD, `web-features`) prüfen und mit „belegt / erfunden / noch nicht ausgeliefert" markieren. Danach bleibt erfahrungsgemäß wenig übrig — realistisch zwei bis drei Sätze für die Feature-Liste, kein Umbau.

**Relevanz-Vorfilter:** Für dieses Projekt sind nur drei Zeilen überhaupt interessant — `Sanitizer`-Erweiterung (könnte `sanitizeRichText` vereinfachen), `text-decoration-inset` (Typografie), `::highlight(*)` (Live-Validierung). Der Rest ist Mobilfunk, Canvas oder Install-Prompt.


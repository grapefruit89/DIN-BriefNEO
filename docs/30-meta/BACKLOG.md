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
| **B32** | History / Brief-Verlauf (Archiv der letzten 10 Briefe) | S | ⭐⭐⭐⭐ |
| **B33** | DIN-5008-Telefonnummer-Formatierer (Expliziter Button) | S | ⭐⭐⭐ |
| **B34** | DIN-5008-Folgeseiten-Nummerierung (`<din-seitenangabe>`) | S | ⭐⭐⭐⭐ |
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
| **B62** | `data-gesetzt` migrieren | S | ⭐⭐ |
| **B63** | `data-layout`: zwei Spuren auf eine | M | ⭐ |
| **B64** | `sidebar.css`: Optik und Struktur trennen | L | ⭐⭐ |
| **B74** | Seitenleiste: 93 px Überlauf und doppelte Statuszeile | S | ⭐⭐ |
| **B75** | Seitenleiste: Fokusziele ohne Zone und der Name „Daten" | S | ⭐ |
| **B76** | PDF-Export als Addon | M | ⭐⭐ |
| **B77** | `fakten.md` aus Scheibe 01 behauptet „maschinell erzeugt", wird aber nicht erzeugt | S | ⭐⭐ |
| **B78** | `tools/paint-probe.mjs` überschreibt seine eigene Beweislage | S | ⭐⭐ |
| **B79** | `doc-size`-Gate meldet einmalig 406 Zeilen für eine 405-Zeilen-Datei | S | ⭐ |
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

### B62 · `data-gesetzt` migrieren · **S** · ⭐⭐
Letzter einfacher Zustands-Spiegel. Stand 2026-11-14: **2 Writer**
(`boot-state.js:72` pre-paint, `main.js:30` bei jeder Änderung) und **1
CSS-Leser** (`.seitenleiste-select[data-gesetzt="true"]`, `sidebar.css:696`).
Ziel: `.seitenleiste-select:has(option:checked:not([value=""]))`.
Zeilenstand 2026-11-14 nachgeprüft: `boot-state.js:72`, `main.js:30`,
CSS-Leser `sidebar.css:696`.
Vorsicht: In Batch 01 stand der Verdacht, dass die Optik nach dem Paint
aufblendete — damals war es die `background`-Transition, nicht der Zustand.
Vor dem Umbau 30 kalte Reloads (Protokoll wie B61), danach dieselbe Messung.

### B63 · `data-layout`: zwei Spuren auf eine · **M** · ⭐
Stand 2026-11-14 (nachgeprüft): Attribut an drei Stellen (`boot.js:42`,
`settings.js:90` und `:215`), und `sidebar.css:182` führt eine zweite
`--active-idx`-Spur nur für `data-layout`, obwohl die `:checked`-Regeln
darüber dasselbe leisten. Ziel: eine Spur. Achtung: `sheet-common.css` und
`sheet-multipage.css` lesen `[data-layout]` für die Blattgeometrie — die
Migration berührt DIN-Maße und braucht deshalb einen eigenen Messnachweis.

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

### B74 · Seitenleiste: 93 px Überlauf und doppelte Statuszeile · **S** · ⭐⭐
Im Brief-Modus scrollt die Leiste 93 px (1100/1007), der Fuß mit
„Zurücksetzen" liegt unter der Kante. Kandidaten: Flex-Gap 12 → 8 (−28 px),
`#zone-aktionen` sticky, Regler in die Kopfzeile. Dazu: die Statuszeile zeigt
2 von 4 Werten (Form, Falzmarken), die im Brief-Modus direkt darunter als
Regler stehen — entweder Statuszeile kürzen oder Regler verschieben.

### B75 · Seitenleiste: Fokusziele ohne Zone und der Name „Daten" · **S** · ⭐
6 von 21 Fokuszielen liegen außerhalb jeder Zone (Modus, GitHub, Theme,
Drucken, Speichern, „ändern"). Die Zone „Daten" enthält den Testbrief, aber
nicht das Speichern — der Name deckt den Inhalt nicht. Beides ist eine
Ordnungsfrage, keine Optik; gehört in Review-Batch 04.

### B77 · `fakten.md` aus Scheibe 01 behauptet „maschinell erzeugt", wird aber nicht erzeugt · **S** · ⭐⭐
**Problem:** `batch/01-architektur-vertrag/fakten.md` trägt im Kopf „maschinell erzeugt, 2026-11-14" — es gibt aber kein Skript dafür. Die Zahlen sind bereits falsch: JS-Module **20** (tatsächlich 18), Zeilen HTML **457** (460), Tests **332** (340), Antipattern-Regeln **50** (51). `tools/batch-facts.mjs` deckt nur Scheibe 02 ab.
**Lösung:** Entweder den Generator auf Scheibe 01 erweitern (Zahlen aus `git ls-files` + `wc -l` + Testlauf) oder den Kopf ehrlich machen und das Blatt als Momentaufnahme markieren. Ersteres passt zur Regel „Messwerte generieren, nicht tippen" (B73).
### B78 · `tools/paint-probe.mjs` überschreibt seine eigene Beweislage · **S** · ⭐⭐
**Problem:** Der Dateiname enthält nur das Datum (`paint-probe-2026-11-14.json`), nicht die Läufe. Ein Kontrolllauf mit `--runs 5` hat am 2026-11-14 eine 90-Läufe-Reihe ersetzt; sie musste neu gefahren werden (die Zahlen wichen ab: `seeded` 6× CPU 15/30 vs. 11/30).
**Lösung:** Läufe und Profil in den Dateinamen (`paint-probe-2026-11-14-r30-all.json`) oder ein `--out` verlangen. Zusätzlich: beim Überschreiben einer Datei mit mehr Läufen warnen.
### B79 · `doc-size`-Gate meldet einmalig 406 Zeilen für eine 405-Zeilen-Datei · **S** · ⭐
**Status: ungeklärt, nicht reproduziert.** Am 2026-11-14 meldete `node tools/build_db.js -q` eine LOW-Warnung für `docs/30-meta/PERFEKTER-PROMPT.md` mit 406 Zeilen, `wc -l` sagt 405 und drei unmittelbar folgende Läufe waren sauber (Fitness 100,0 %). Die Datei war in diesem Lauf nicht geändert.
**Zu klären:** zählt der Zähler in `tools/reconciliation.js` anders (z. B. `split('\n')` inkl. letzter Leerzeile) oder wurde ein paralleler Schreibvorgang gesehen? Ohne Reproduktion keine Änderung — aber auch kein stilles Vergessen.

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

### B34 · DIN-5008-Folgeseiten-Nummerierung (`<din-seitenangabe>`) · **S** · ⭐⭐⭐⭐
**Kontext:** Gekoppelt an [[ROADMAP#Priorität 1 — Mehrseitige Briefe]] und [[BACKLOG#B27]]. DIN 5008 Kap. 20.17 schreibt für mehrseitige Briefe eine fortlaufende Seitennummerierung vor.
**Ziel:** Standardisierte Paginierung auf Folgeseiten:
- **Komponente:** Semantisches Element `<din-seitenangabe>` im Folgeseitenkopf (`<din-folgeseitenkopf>`).
- **Position & Layout:** Oberkante exakt 20 mm von der oberen Blattkante, wahlweise rechtsbündig oder zentriert.
- **Normtext:** „Seite X von Y“ oder „Seite X“.
- **Reaktivität:** Automatische Zählung von `X` und `Y` gekoppelt an die tatsächliche Anzahl der `<din-a4>`-Seiten-Container.

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

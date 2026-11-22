---
id: backlog
title: Backlog — offene Baustellen nach Aufwand und ROI
status: active
type: reference
created: '2026-10-02'
updated: '2026-11-22'
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

18 offene Punkte. Details unterhalb, nach Art gruppiert.

| Nr | Aufgabe | Aufwand | Nutzen |
|---|---|:---:|:---:|
| **B25** | Vorkonfigurierte Brief-Vorlagen (JSON-Muster) | M | ⭐⭐⭐ |
| **B26** | Optionale DIN-5008-Validatoren (Anschrift-Zeilenlimit & IBAN) | S | ⭐⭐ |
| **B31** | Native Browser-APIs: LocalFonts API (Systemschriften), EyeDropper & showPicker | S | ⭐⭐ |
| **B32** | Brief-Verlauf und zwei Adressbücher (Addon `verlauf`) | S | ⭐⭐⭐⭐ |
| **B33** | DIN-5008-Telefonnummer-Formatierer (Expliziter Button) | S | ⭐⭐⭐ |
| **B38** | Chromium klemmt Rahmenbreiten unter 1px auf 1px | N | ⭐ |
| **B40** | Vier vorbestehende Testfehler dokumentieren | M | ⭐⭐ |
| **B58** | Gzip/Minify als Abschluss-Option | S | ⭐ |
| **B59** | Kaskade über `@layer` statt `!important` | M | ⭐ |
| **B76** | PDF-Export als Addon | M | ⭐⭐ |
| **B80** | Export als `.txt` und `.md` | S | ⭐⭐ |
| **B81** | Multi-Tab: das Restrisiko benennen oder abschaffen | S | ⭐ |
| **B85** | Anschriftfeld-Geometrie: DIN Tab. B.1 oder bewusste Abweichung? | M | ⭐⭐⭐ |
| **B91** | BIC → Bankname als Erweiterung (Addon) | M | ⭐⭐ |
| **B93** | `targetLock` wird viermal geleert — Redundanz **nicht** bewiesen | S | ⭐ |
| **B94** | Batch 06 auswerten: Layer-Kaskade | S | ⭐⭐ |
| **B95** | Batch 07 auswerten: PDF-Export (Bibliothek oder Browser?) | S | ⭐⭐ |
| **B96** | Phase-5-Lücke schließen: `boot-state.js` als Modul | S | ⭐⭐ |
## 🏗️ Architektur & Technik

Schulden, Gates, Messbarkeit. Diese Punkte ändern, **wie** die App gebaut ist.

### B96 · Phase-5-Lücke schließen: `boot-state.js` als Modul · **S** · ⭐⭐
**Befund (2026-11-22, `tools/seeder-diff.mjs`, 7 Fälle):** genau eine
Abweichung zwischen Boot-Schreiber und Restore —
`legacy-liste`: `anlagen-angabe` steht im Moment des Reveals roh als
`<ul><li>Anlage 1</li><li>Anlage 2</li></ul>` da und springt danach auf
`Anlage 1\nAnlage 2`. Ursache: `writeField` (draft-model.js) migriert altes
`<li>`-HTML für `anlagen-angabe` per `stripHtmlToPlaintext`, der klassische
Boot-Pfad schreibt den Wert unverändert. Sichtbar wird es nur mit gedrosselter
CPU (Reveal → `ready` ca. 40–60 ms, mit 20× Drosselung ca. 800 ms).

**Entscheidung: Variante B.** `boot-state.js` wird ein ES-Modul und benutzt
denselben Schreibpfad wie der Restore — kein Duplikat der Regel.
- Import: `writeField` aus `draft-model.js`; der lokale Feld-Selektor bleibt,
  bis `EDITABLE_FIELD_SELECTOR` ebenfalls importiert wird.
- `<script type="module" src="js/boot-state.js?v=bs3">` **vor** `main.js`
  einhängen (Modul-Reihenfolge = Dokumentreihenfolge), sonst gewinnt
  `initApp` und gibt die Maske vor den Werten frei.
- Nicht Teil dieses Punkts: der Fingerprint-Sonderfall (`ohneMarkup`) bleibt
  vorerst — mit identischem Schreibpfad entsteht kein zweiter Wert, der
  Restore schreibt halt noch einmal dasselbe.

**Abnahme:** `seeder-diff` 0/7 · `paint-probe` TTC unverändert < 2 s ·
`npm test` grün · Sichtprüfung mit 20× CPU-Drosselung (kein Roh-`<ul>`) ·
Statuszeile weiterhin korrekt vor dem Reveal.

**Nicht gewählt: Variante C** (`boot-values.js` als alleiniger Schreiber inkl.
Reveal und immer publiziertem Fingerprint). Das löst die Ursache statt des
Symptoms, ist aber ein Umbau des Boot-Pfads (2–3 h). Bleibt offen, wenn B
nicht reicht.

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

### B58 · Gzip/Minify als Abschluss-Option · **S** · ⭐
Nicht jetzt. Gemessen am 2026-11-14: JS 314 KB roh → 134 KB minifiziert (gzip
~90 → 44 KB), CSS 92 → 61 KB. Gesamt gzip heute 144 KB. Ein Bundler würde
außerdem 15 Requests sparen — auf HTTP/2 irrelevant. Der einzige echte Gewinn
wäre Cache-Busting per Hash. Entscheidung: bleibt offen bis zum Abschluss;
dann als eigenes Experiment messen (LCP/FCP vorher/nachher), nicht als
Voraussetzung für die Architekturarbeit.

### B59 · Kaskade über `@layer` statt `!important` · **M** · ⭐
**Status (2026-11-20):** Dauerhaft eingefroren / Keine Umsetzung (Architektur-Entscheidung nach `ADR-KISS-MINIMAL-JS`).

Die verbleibenden 90 `!important` sind kein „Hinterhof-Hack“, sondern eine bewusste, absolut robuste **Medien-Firewall** zwischen interaktivem Bildschirm (Flexbox, Mehrspalten-Karussell, Zoom) und A4-Druck (feste DIN-5008-Geometrie).
- **Warum kein `@layer`:** CSS Cascade L5 kehrt `!important` in Schichten um (frühe Layer schlagen spätere Layer). Zusammen mit der Scoping-Nähe von `@scope` (Grund für den 2,8-Millionen-Pixel-Crash in Test 2) und dynamischen `@page`-Margin-Boxen (`multipage-controller.js`) birgt ein Umbau extreme Regressionsrisiken bei exakt **0 Pixel Mehrwert** für den Nutzer (reines Overengineering).
- **Bestand:** 35 echte Duplikate wurden in B88 bereits eliminiert. Die verbleibenden 90 sind unvermeidbare Barrieren (Print-Isolation, FOUC-Schutz, `prefers-reduced-motion`, `[hidden]`, `#spacer`).
- **Details:** [[B59-LAYER-PLAN]].

### B93 · `targetLock` wird viermal geleert — Redundanz **nicht** bewiesen · **S** · ⭐
**Herkunft:** Batch 05 (`fakten.md` §2, gemessen 2026-11-15). **Zurückgestuft**
nach dem Batch-05-Review: die erste Fassung dieses Punktes behauptete, die zwei
`main.js`-Zeilen seien redundant. Das war aus der **Reihenfolge** geschlossen,
nicht gemessen.

`AddressIntelligence.targetLock` wird an **vier** Stellen auf `null` gesetzt:

| Stelle | Kontext |
|---|---|
| `website/js/draft-manager.js:274` | `#restoreState()`, **vor** den Feldschreibungen |
| `website/js/draft-manager.js:470` | `resetDraft()`, **nach** dem Leeren der Felder |
| `website/js/main.js:128` | nach `draftManager.loadDraft()` |
| `website/js/main.js:215` | nach `draftManager.resetDraft()` |

**Warum „redundant" nicht belegt ist:** `resetDraft()` published
`DOCUMENT_CHANGED` **erst nach** dem `null` (`:489 ff.`) — ein Listener kann den
Lock danach wieder setzen, dann ist `main.js:215` die einzige Aufräumstelle.
`loadDraft()` kann `false` liefern (`:247`, kein Entwurf), dann läuft
`#restoreState` gar nicht. Ob `Field.setValue` Events auslöst, die den Lock
setzen, ist ebenfalls offen (`field.js`/`address.js` nicht betrachtet).

**Aufgabe (erst messen, dann entscheiden):** Setter-Falle per CDP —
`Object.defineProperty` auf `AddressIntelligence.targetLock` mit Stack-Log,
vier Szenarien: (1) kein Entwurf, (2) Entwurf, (3) Undo, (4) Reset. Erst wenn
in allen vier Fällen keine der beiden `main.js`-Zeilen etwas bewirkt, werden
sie entfernt.

**Bis dahin:** nicht anfassen. Zwei Zeilen sparen keinen Nutzen, der ein
Risiko rechtfertigt.

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

**Nachtrag 2026-11-22 (Nutzer-Test mit zwei Fenstern):** Der Toast erscheint
wie beschrieben, Datenverlust wurde nicht beobachtet. Der Nutzer will den
Konfliktfall aber nicht „dokumentiert akzeptieren", sondern den zweiten Tab
**sperren**. Zwei getrennte Briefe pro Fenster (eigene Draft-IDs, Auswahl,
Verlauf) sind ausdrücklich **nicht** gewollt — das wäre B32.

Damit ist die Entscheidung gefallen (sperren statt akzeptieren), nur die
Umsetzung fehlt:
- `navigator.locks.request('din-briefneo-draft', { mode: 'exclusive' })` als
  Ein-Instanz-Sperre — kein Polling, kein Heartbeat; der Browser räumt beim
  Tab-Schließen selbst auf.
- Zweiter Tab: Overlay statt Arbeitsfläche („läuft schon in einem anderen
  Tab"), plus „übernehmen" über einen `BroadcastChannel`-Handshake: der
  haltende Tab gibt frei und zeigt dasselbe Overlay.
- Abgrenzung: Dev-Server (`127.0.0.1:8088`) und Produktions-Domain sind
  verschiedene Origins und sperren sich nicht gegenseitig; betroffen sind nur
  zwei Tabs derselben Adresse.
Aufwand bleibt **S**. Abnahme: zwei Fenster derselben Origin — zweiter Tab
gesperrt, Entwurf im ersten unverändert, nach Schließen des ersten übernimmt
der zweite.

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

**Stand 2026-11-15:** die **Formprüfung** ist gebaut und liegt als Addon
`website/addons/geschaeftsangaben/` (Schalter „Geschäftsangaben (§ 35a)" in den
Einstellungen, Standard aus): `pruefeIban` (Mod-97), `formatiereIban`,
`pruefeBic` (ISO 9362) und `fehlendeAngaben` (§ 35a). Getestet in
`test/all.js` („Geschäftsangaben (Addon)").

**Offen bleibt genau der Punkt, der diesen Backlog-Eintrag ausmacht:** die
**Daten** für BLZ → BIC/Bankname (Bundesbank-CSV, extrahiert 80–120 KB) und die
Entscheidung, ob ein solches Pflegeversprechen ins Produkt gehört. Solange sie
fehlt, prüft das Addon die Form, nicht die Existenz der Bank.## 📚 Entscheidungen & Doku

Offene Entscheidungen und Dokumentationslücken. Brauchen eine Antwort, keinen Code.

### B38 · Chromium klemmt Rahmenbreiten unter 1px auf 1px · **N** · ⭐
Gemessen in Chromium 156 auf einer leeren `data:`-Seite ohne App-CSS: `0.25pt`,
`0.5pt`, `0.8pt` und `1pt` liefern alle `1px`, erst `2px` liefert `2px` — auch bei
DPR 2 unverändert. Die Falzmarken sind auf dem Bildschirm daher **nicht** dünner als
vorher; im Druck/PDF wirkt `0.5pt` (0,176 mm statt 0,282 mm). Die Änderung in
`7e59132` ist die Angleichung an `print.css`/`print-multipage.css` (dort war 0.5pt
schon immer gesetzt) — kein neuer Effekt, sondern Konsistenz.
**Kein Fix über CSS-Rahmenbreiten möglich** (Chromium-Verhalten: Rahmen werden auf
ganze Gerätepixel gerundet). Der einzige Weg zu echter Subpixel-Stärke wäre der
archivierte SVG-Ansatz (ehem. B35, `stroke-width` in mm, `vector-effect="non-scaling-stroke"`).
Bis dahin nur dokumentieren, damit niemand erwartet, dass 0.5pt auf dem Schirm
sichtbar dünner ist.

### B94 · Batch 06 auswerten: Layer-Kaskade · **S** · ⭐⭐
**Herkunft:** `batch/06-layer-kaskade/` (gebaut 2026-11-15, 48 KiB, `merge.txt` versandfertig).
**Frage der Scheibe:** In welcher Reihenfolge müssen die `@layer` liegen, damit die
Druck-`!important` in `sheet-multipage.css` fallen können — und was hält sie heute?
**Warum offen:** Der Review ist nie angefordert worden (kein Issue nach #20). Ohne die
Antwort beginnt B59 auf Vermutungen; die Vorprobe hat gezeigt, dass ein Etappen-Umbau
genau hier scheitert (`#kern`, 2.871.046 Pixel Unterschied, siehe [[B59-LAYER-PLAN]]).
**Nächster Schritt:** `merge.txt` verschicken, Antwort als Issue auswerten, Befunde in
[[BACKLOG]] und [[DECISION-LOG]] einsortieren.

### B95 · Batch 07 auswerten: PDF-Export (Bibliothek oder Browser?) · **S** · ⭐⭐
**Herkunft:** `batch/07-pdf-addon/` (gebaut 2026-11-15, 43 KiB, `merge.txt` versandfertig).
**Frage der Scheibe:** Reicht der native Druckpfad (`window.print`, `@page`) für den
PDF-Export, oder braucht es eine Bibliothek — und was kostet jede Variante an Blattgröße
und Kontrolle über Seitenumbrüche?
**Warum offen:** Review nie angefordert; ohne Antwort bleibt B76 (PDF-Export als Addon)
eine Entscheidung ohne Grundlage.
**Nächster Schritt:** wie B94.

### B85 · Anschriftfeld-Geometrie: DIN Tab. B.1 oder bewusste Abweichung? · **M** · ⭐⭐⭐
**Herkunft:** `docs/90-archive/todo-2026-11/README.md` (Punkt 49), unverändert offen.
**Problem:** Die Rücksendezeile steht 5,7–6,8 mm und die Empfängeranschrift 12,1 mm zu hoch (gemessen 2026-11-11). `data-anschriftfeld-y` trifft die DIN-Rücksendezeile auf 0,1–0,2 mm, wird aber als Beginn der Adresszone gelesen; `#vermerke` reserviert die 17,7-mm-Zone nicht (`display: none`). Optionen A/B/C stehen in `docs/10-architecture/IMR-Registry.md` §2a.
**Warum offen:** Jede normkonforme Variante verschiebt alle PDF-Referenzen und braucht eine neue Referenzmessung. Das ist eine Nutzerentscheidung, keine Codefrage.

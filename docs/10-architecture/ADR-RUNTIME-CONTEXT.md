---
id: adr-runtime-context
title: 'ADR-RUNTIME-CONTEXT: Lokaler Webserver als einziger Laufzeitkontext'
type: reference
status: active
created: '2026-10-02'
updated: '2026-10-02'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/reference
doc_links:
  - Immutable-Law-Catalog
  - longevity-guidelines
  - constitution
  - ADR-DATA-PERSISTENCE
  - ADR-OFFLINE-ADDRESS-INTELLIGENCE
  - DECISION-LOG
error_patterns:
  - file protocol
  - file://
  - laufzeitkontext
  - opaque origin
  - lokaler webserver
  - offline ohne server
supersedes: []
depends_on: []
code_links:
  - 'website/index.html'
  - 'website/js/05-gzip.js'
  - 'website/js/45-address-intelligence.js'
  - 'start.bat'
---

# ADR-RUNTIME-CONTEXT: Lokaler Webserver als einziger Laufzeitkontext

## 1. Context & Problem

Das Projekt führte `file://`-Lauffähigkeit („Doppelklick auf die HTML, kein Server") jahrelang
als Grundversprechen. Diese Voraussetzung ist seit der Umstellung auf ES-Modules und eine CSP
ohne `unsafe-inline` **faktisch nicht mehr erfüllbar**: Modul-Skripte werden CORS-geprüft
geladen, `file://` liefert die Origin `null`, der Browser blockiert. Die App startet unter
`file://` nicht einmal.

Die Doku wurde nur teilweise nachgezogen. `README.md`, `AGENTS.md` und `SECURITY.md` sagen
korrekt „nur über lokalen Webserver"; gleichzeitig versprach `docs/index.md` „alle Kernfunktionen
ohne Webserver", [[longevity-guidelines]] führte „Säule 2: Offline / `file://`", und `CLAUDE.md`
widersprach sich innerhalb von elf Zeilen selbst. Schwerwiegender: Der
[[Immutable-Law-Catalog]] begründet **sechs** Verbote (S1, A22, A34, A35, A36, A37) mit
`file://`-Tauglichkeit — einer Voraussetzung, die es nicht mehr gibt. Damit standen
Normen mit toter Begründung im Gesetzbuch, die jederzeit aus dem *falschen* Grund hätten
gekippt werden können.

## 2. Considered Options

**Option A — `file://` als Laufzeitziel streichen.**
Der lokale Webserver (`start.bat` → `tools/dev_server.ps1`, Port 8088) wird zum einzigen
unterstützten Kontext. Tote Fallback-Pfade und das 164 KB grosse Base64-Embed entfallen.
Verbote bleiben, bekommen aber tragfähige Begründungen.

**Option B — `file://` zurückgewinnen (Single-File-HTML).**
Alle Module, Styles und Daten in eine Datei inlinen (gemessen ca. 381 KB). Erfordert
klassische oder inline Skripte, `unsafe-inline` in der CSP und — weil die Modulstruktur
erhalten bleiben soll — einen **Build-Schritt**. Kollidiert mit `H7`, `H8` und dem
Build-Tool-Verbot.

**Option C — Status quo.**
Doku und Normen weiter widersprüchlich lassen.

## 3. Decision

**Wir haben uns für Option A entschieden.**

### Begründung

1. **Die Voraussetzung ist objektiv weg.** ESM + CSP schliessen `file://` aus. Ein Versprechen
   zu führen, das die eigene Architektur bricht, ist schlechter als es zurückzunehmen.
2. **`file://` ist für dieses Produkt sicherheitstechnisch *schlechter*, nicht bequemer.**
   Chromium ignoriert bei `localStorage`-Zugriffen den Pfad der `file://`-URL (langjähriger
   offener Bug): **Alle** lokal geöffneten HTML-Dateien teilen sich einen Namespace. Absenderdaten,
   Empfänger, Brieftext und die Base64-Unterschrift wären von jeder beliebigen lokal geöffneten
   HTML-Datei les- und überschreibbar — etwa einem als HTML getarnten Mail-Anhang. Unter
   `http://localhost:8088` existiert eine echte Origin und das Problem nicht. Das Privacy-Versprechen
   des Projekts wird durch den Server **gestützt**, nicht geschwächt.
3. **Option B löst ein Problem, das niemand hat, und schafft drei neue** (Build-Schritt,
   `unsafe-inline`, Verlust der Modulstruktur). Eine Single-File-Distribution bleibt als
   *Artefakt*-Idee zulässig — aber als Release-Schritt aus einer modularen Quelle, nicht als
   Laufzeitgarantie. Siehe „Offene Punkte".
4. **„Offline" bleibt vollständig erhalten.** Offline heisst in diesem Projekt *netzunabhängig*:
   kein CDN, keine Fremd-Fonts, kein Tracking, kein Backend. Das ist unberührt. Gestrichen wird
   nur *serverlos*. Diese Unterscheidung war die Wurzel der gesamten Verwirrung.

## 4. Consequences

### Positive Auswirkungen

- Sechs Normen bekommen tragfähige Begründungen statt einer toten Voraussetzung.
- `website/data/plz-embedded.js` (164 KB) und die unerreichbaren Fallback-Zweige entfallen —
  der grösste tote Posten im Produktpfad.
- Ein einziger, testbarer Laufzeitkontext: Was im Dev-Server läuft, läuft beim Nutzer.
- Die Doku ist zum ersten Mal widerspruchsfrei.

### Risiken & Negative Auswirkungen

- **Der Nutzer braucht zwingend `start.bat`** (oder einen beliebigen statischen Server).
  Mitigation: `start.bat` existiert, startet den Server und öffnet den Browser automatisch;
  README beschreibt den Weg bereits als Standard.
- Die Hürde „kein Doppelklick auf die HTML" bleibt bestehen. Das ist der bewusst gezahlte Preis.

### Langfristige Auswirkungen

- Sichere Kontexte (HTTPS/localhost) stehen damit grundsätzlich offen. Die Verbote A34–A37
  (IndexedDB, OPFS, File System Access, Service Worker) bleiben trotzdem bestehen — **neu
  begründet** mit Einfachheit, Zero-Dependency und synchronem Zugriff, nicht mehr mit `file://`.
  Eine spätere Lockerung ist jetzt eine saubere Abwägung statt eines Dogmas.

## 5. Implementation & Verification

**Umgesetzt (2026-10-02):**

- [[Immutable-Law-Catalog]]: S1, A22, A34, A35, A36, A37 neu begründet; `file://` als Argument
  entfernt. Die Verbote selbst bleiben unverändert in Kraft.
- [[longevity-guidelines]]: „Säule 2: Offline / `file://`" → „Säule 2: Netzunabhängigkeit";
  localStorage-Begründung ohne `file://`.
- [[constitution]], [[ADR-DATA-PERSISTENCE]], [[ADR-JS]], [[ADR-ANTIPATTERN]],
  [[ADR-OFFLINE-ADDRESS-INTELLIGENCE]], [[glossary]], [[Feature-Matrix]], [[index]]:
  `file://`-Zusagen auf „netzunabhängig, lokaler Webserver" korrigiert.
- Code: `website/data/plz-embedded.js` gelöscht; Fallback-Zweige in
  `45-address-intelligence.js` entfernt; `file:`-Guard in `05-gzip.js` entfernt;
  Kommentare in `51-storage.js` berichtigt.

**Einhaltung:** Fitness Gate (`tools/reconciliation.js`, Link- und Taxonomie-Checks) sowie
`tsc --noEmit`. Neue `file://`-Zusagen fallen beim Review gegen diese ADR auf.

**Offene Punkte:**

- **Single-File-Distribution** als optionales Release-Artefakt (`tools/build_single_file.js`,
  ca. 381 KB) ist **nicht** Teil dieser Entscheidung und bleibt offen. Falls verfolgt, gilt:
  modulare Quelle bleibt führend, das Artefakt wird erzeugt — und es wäre wegen des
  `localStorage`-Namespace-Problems ausdrücklich **kein** empfohlener Betriebsmodus für echte
  Briefdaten.
- Historische Einträge in [[DECISION-LOG]] und `docs/90-archive/` bleiben unangetastet
  (Append-only).

## 6. Related Documents

- [[Immutable-Law-Catalog]]
- [[longevity-guidelines]]
- [[constitution]]
- [[ADR-DATA-PERSISTENCE]]
- [[ADR-OFFLINE-ADDRESS-INTELLIGENCE]]
- [[DECISION-LOG]]

---
id: adr-binary-assets
title: 'ADR-BINARY-ASSETS: Binär-Assets in IndexedDB (A34-Präzisierung, S3 gestrichen)'
type: adr
status: active
created: '2026-11-06'
updated: '2026-11-06'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
  - tech/storage
doc_links:
  - Immutable-Law-Catalog
  - ADR-DATA-PERSISTENCE
  - ADR-RUNTIME-CONTEXT
  - ADR-ANTIPATTERN
code_links:
  - website/js/binary-storage.js
  - website/js/settings.js
error_patterns:
  - binary assets
  - indexeddb
  - base64
  - signaturbild speichern
  - eigene schrift speichern
supersedes: []
depends_on: []
---

# ADR-BINARY-ASSETS: Binär-Assets in IndexedDB

## 1. Context & Problem

Signaturbild und eigene Schrift liegen heute als Base64-Data-URL in `localStorage`
(`din_signature_asset`, `din_custom_font`). Base64 bläht Binärdaten um ~33 % auf, ist im
`localStorage`-Quota teuer und macht den Speicherinhalt unlesbar. `localStorage` kann
ausschließlich Strings speichern — für Binärdaten gibt es dort keine Alternative zu Base64.

Zugleich verbietet [[Immutable-Law-Catalog]] **A34** IndexedDB „als Produktspeicher in dieser
App" und **S1** jeden anderen Produktspeicher als `localStorage`. **S3** erklärt Base64 für
optionale lokale WOFF2-Schriften sogar zu PREFERRED. Damit ist der Ist-Zustand gesetzlich
vorgeschrieben, obwohl er technisch der schlechtere Weg ist.

Die Entscheidung ist nötig, weil „Base64 raus" ohne Gesetzesänderung nicht erfüllbar ist:
Jeder Ausweichweg für Binärdaten (IndexedDB A34, OPFS A35, File System Access A36) steht
unter HARD BAN.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Bewertung |
| :--- | :--- | :--- | :--- | :--- |
| **A — Status quo** | Base64 in `localStorage` (S3 bleibt) | synchron, kein FOUC, kein Umbau | +33 % Volumen, unlesbarer Speicher, Quota-Druck; S3 bevorzugt dauerhaft das schlechtere Format | abgelehnt |
| **B — A34 präzisieren, Binär-Assets nach IndexedDB** | Strukturierte Daten weiter `localStorage` (synchron), Blobs in IndexedDB | Binär ohne Base64-Overhead, Speicher lesbar, keine FOUC bei strukturierten Daten | zwei Speicherorte; Boot-Restore der Assets ist async → FOUC bei Custom-Schrift | **gewählt** |
| **C — OPFS / File System Access** | Binär in OPFS oder über FSA | ebenfalls binär | A35/A36 bleiben HARD BAN; FSA verlangt Nutzergeste je Autosave | abgelehnt |

## 3. Decision

**Option B.** A34 wird **präzisiert, nicht aufgehoben**:

1. **A34 — IndexedDB bleibt HARD BAN für strukturierte Produktdaten** (Draft, Settings, Keys,
   Adressen, Schema-Version). Für **Binär-Assets** (Signaturbild, Schriftdatei als `Blob`) ist
   IndexedDB ausdrücklich **erlaubt**. Einziger zulässiger Ort dafür ist
   `website/js/binary-storage.js`; die Antipattern-Regel `P10` prüft das per Exemption.
2. **S1 — unverändert für strukturierte Produktdaten** (`localStorage`, synchron). Ergänzt um
   den Satz, dass Binär-Assets keine Produktdaten im Sinne von S1 sind.
3. **S3 — gestrichen.** Base64 ist für nichts mehr PREFERRED. Schriften und Signaturbild
   werden als `Blob` gespeichert.

### Begründung

- **Die A34-Begründung bleibt gültig, wo sie hingehört.** „Asynchron → Boot-Restore bräuchte
  await" trifft strukturierte Produktdaten: Draft und Einstellungen bestimmen den ersten
  Frame. Sie treffen ein Signaturbild nicht, das ohnehin erst nach dem DOM-Aufbau sichtbar wird.
- **Der FOUC ist begrenzt und akzeptiert.** Nur die Custom-Schrift springt nach ~50–100 ms von
  der Systemschrift um. Theme, Layout und Briefinhalt bleiben synchron und damit FOUC-frei.
- **Kein ZIP, kein Base64 im Export.** Das JSON-Schema v3 bleibt unverändert und enthält
  weiterhin nur `signature.transform` (Position), nicht das Bild und nicht die Schrift.
- **Datenverlust ist gewollt.** Die alten Schlüssel `din_custom_font` und
  `din_signature_asset` werden beim ersten Start gelöscht, nicht migriert. Signatur und Schrift
  sind lokale Arbeitsmittel: Auf demselben Rechner bleiben sie erhalten, auf einem anderen
  fehlen sie.

## 4. Consequences

### Positive Auswirkungen

- Binärdaten liegen ohne Base64-Overhead; der `localStorage` enthält nur noch lesbare Strings.
- Der Export kann strukturell kein Bild und keine Schrift mehr mitschleppen.

### Risiken & Negative Auswirkungen

- **Zwei Speicherorte.** Wer „alles löschen" will, muss beide kennen (UI-Reset deckt beide ab).
- **Async-Restore.** Signaturbild und Schrift erscheinen verzögert; ein Fehler in IndexedDB
  (privater Modus, deaktivierte Speicher-API) führt zu stillem Verlust — `saveBlob` warnt dann
  auf der Konsole und die UI meldet den Fehlschlag.
- **Kein Portabilitätsgewinn.** Die Assets bleiben lokal; ein Brief, der auf einem anderen
  Rechner geöffnet wird, hat keine Unterschrift. Das ist gewollt und wird nicht durch einen
  Container gelöst.

## 5. Implementation & Verification

- `website/js/binary-storage.js`: `saveBlob` / `loadBlob` / `deleteBlob` auf
  `din-briefneo-assets` (Version 1, Object Store `assets`, Key = String, Wert = `Blob`).
- `settings.js`: Signatur und Schrift werden als `Blob` gespeichert, per
  `URL.createObjectURL()` angezeigt und beim Zurücksetzen freigegeben.
- `boot-theme.js`: nur noch Theme (`data-theme`, `data-style`), synchron. Die Font-Injektion
  wandert nach `settings.js` und läuft nach dem Paint (FOUC ~50–100 ms, akzeptiert).
- **Maschinelle Prüfung:** `tools/antipatterns/project.json` Regel `P10` bleibt bestehen und
  ist ausschließlich für `website/js/binary-storage.js` exempt. `test/all.js` prüft, dass das
  Signatur-Asset **nicht** in `localStorage` landet.
- Einzige erlaubte Restvorkommen der alten Schlüssel: die Löschzeilen in `main.js`.

## 6. Related Documents

- [[Immutable-Law-Catalog]] — A34, S1, S3 (geändert am 2026-11-06)
- [[ADR-DATA-PERSISTENCE]] — Schema v3 und LocalStorage-Migration
- [[ADR-RUNTIME-CONTEXT]] — warum kein `file://`, Verbote A34–A37
- [[ADR-ANTIPATTERN]] — Abschnittszuordnung der Verbote

# Quellen & Lerngeschichte

Dieses Dokument ersetzt die eingebetteten Git-Repos im `archiv/`-Ordner.
Die Originalordner sind lokal vorhanden, werden aber nicht ins Repository eingecheckt.

---

## Externe Referenzen (`archiv/external-references/`)

### `din-5008-css`
- **Herkunft:** Externe CSS-Bibliothek für DIN-5008-konformes Layout
- **Archiviert:** Juni 2026
- **Was wir gelernt haben:** Wie andere das DIN-5008-Layout in reinem CSS angehen — vor allem Abstände und Zonen. Unser Ansatz ist deutlich präziser und nutzt moderne CSS-Features (`@layer`, `@scope`, `field-sizing`) statt älterer Hacks.
- **Was wir übernommen haben:** Konzept der festen mm-Abstände als CSS-Custom-Properties — bei uns konsequent als `@property`-Typen mit `<length>`-Syntax umgesetzt.

### `din-5008-css-forked-for-later` *(old-project-snapshots)*
- **Herkunft:** Fork der obigen Bibliothek für frühe Experimente (Anfang 2026)
- **Archiviert:** Juni 2026
- **Was wir gelernt haben:** Was passiert wenn man externe Abhängigkeiten forkt statt selbst zu bauen — Drift, Wartungsaufwand, Versionskonflikte. Hat die Zero-Dependency-Entscheidung bestätigt.

### `din5008-generator`
- **Herkunft:** Externes Projekt zur dokumentenbasierten DIN-5008-Generierung
- **Archiviert:** Juni 2026
- **Was wir gelernt haben:** Generatoransätze (HTML-Template + Daten → Dokument) funktionieren nicht gut für interaktive Live-Editoren. Bestätigt unseren WYSIWYG-im-Browser-Ansatz mit Custom Elements.

### `letter`
- **Herkunft:** Einfaches HTML/JS Brief-UI aus der frühen Explorationsphase
- **Archiviert:** Juni 2026
- **Was wir gelernt haben:** Primitive `<textarea>`-basierte Letter-UIs verlieren sofort DIN-Geometrie-Kontrolle. Hat `contenteditable="plaintext-only"` + Custom Elements als richtigen Weg bestätigt.

### `GerLaTeXLetter`
- **Herkunft:** LaTeX-basiertes Briefvorlagen-System für deutsche Geschäftsbriefe
- **Archiviert:** Juni 2026
- **Was wir gelernt haben:** LaTeX beherrscht DIN 5008 präzise (mm-genaue Satzspiegelkontrolle), ist aber kein Webformat. Hat unsere Überzeugung gestärkt, dass pixelgenaues Layout im Browser möglich ist — ohne LaTeX oder PDF-Umwege.
- **Was wir übernommen haben:** Die Denkweise, Layout-Zonen als absolute mm-Koordinaten zu definieren statt als relative Abstände.

---

## Eigene Projektsnapshots (`archiv/old-project-snapshots/`)

### `DIN-BriefNEO` (V4.8, Stand ~April 2026)
- **Was es war:** Die komplette alte Codebasis vor dem großen Refactoring — mit 11 JS-Modulen (`address.js`, `salutation.js`, `qr-engine.js`, `archive.js`, etc.) und 6 CSS-Dateien
- **Warum ersetzt:** Zu viele Zuständigkeiten pro Datei, keine klare Longevity-Strategie, noch kein Fitness-Score-System, EditContext API noch nicht konsequent eingesetzt
- **Was wir übernommen haben:**
  - Grundprinzip der 19 Custom Elements (IMR-Modell)
  - Salutation-Engine-Logik als Referenz für die neue `main.js`
  - QR-Code-Integration (Konzept beibehalten, Code neu geschrieben)
  - Die DIN-5008-Referenz-SVGs (`assets/reference-DIN_5008_Form_A.svg` / `Form_B.svg`)
- **Was wir bewusst weggelassen haben:**
  - `archive.js` (LocalStorage-Archiv) — zu komplex, nicht im aktuellen Scope
  - `qrcode.js` (externe Bibliothek) — verstößt gegen Zero-Dependency-Pakt
  - Alle `.brain/` und `.gemini/` Agent-Konfigurationen — durch neues `.specify/` + `AGENTS.md` ersetzt

- Das CSS-Wuchsverhalten (Top-Down, fixe Höhe, Auto-Abschneiden via `overflow-state`)

### 1.2 Architecture Compliance Matrix (`docs\core\Architecture-Compliance-Matrix.md`)
**Was es tut:** Setzt die unumstößlichen technischen Leitplanken ("Baseline Chrome 147+") fest. Es dokumentiert, dass dieses Projekt explizit als "Pure & Flat Architecture" konzipiert ist:
- **Zero-JS UI:** State-Management, Animationen (3D-Carousel), Dark/Light Modes (`light-dark()`) und Layouts (`@container`) werden *ausschließlich* über nativste CSS-Funktionen realisiert (`:has()`, `@layer`, `@property`).
- JS wird nur für reine Logik (Datenverarbeitung) verwendet, nicht für UI-Frameworks oder Shadow-DOM.

### 1.3 Salutation Engine & Logic (`docs\core\Salutation-Engine.md`)
**Was es tut:** Beschreibt die strikte Entkopplung von der Business-Logik (Engine) und der UI.
- Das Modul `salutation.js` ist intelligent genug, aus Anschriftfeldern automatisch das Geschlecht oder die korrekte Anrede herauszuparsing ("Greedy Regex Matching" bei "Prof. Dr.").
- Es erklärt den Datenfluss (Proxy-Objekte als State, OPFS für Local-Storage-Persistenz, Temporal-API für Datumsberechnungen).

### 1.4 Feature Matrix & Roadmap (`docs\Meta\Feature-Matrix.md`)
**Was es tut:** Zeigt den Entwicklungsstand. Es dokumentiert abgeschlossene Features (Form A/B Switch, Adress-Autocomplete) und zukünftige Meilensteine (IndexedDB Archiv, Serienbrief per CSV, Automatische Fristenrechner nach BGB). Sehr wertvoll für zukünftiges Sprint-Planning!

---

## 2. Abgeleitete Anti-Patterns (Daraus gelernt!)

Im Ordner `din-5008-brief-generator/` befand sich ein alter Versuch mit Vite, TypeScript, Tailwind und Firebase. Die `DECISIONS.md` darin zeigte, dass bereits von React wegmigriert wurde, aber der Stack war immer noch zu schwer ("Overhead").

Um zukünftige KIs (inklusive mir) davor zu bewahren, diesen Pfad erneut zu betreten, haben wir folgende **strikte Anti-Patterns** in die Workspace-Regeln (`.agents`/`AGENTS.md`) übernommen:
- ❌ **Kein Node.js/NPM/Vite im Frontend:** Das Frontend läuft komplett build-free im Browser (`index.html` via Live-Server).
- ❌ **Kein Tailwind CSS:** Zerstört die Übersicht im Print-Layout. Stattdessen nutzen wir extrem stark strukturierte, native CSS-Dateien mit Variablen.
- ❌ **Keine Heavy-UI-Frameworks / Shadow-DOM:** Verkompliziert den PDF-Druck maßgeblich.

---

## 3. Durchgeführte Aufräumarbeiten

Wie gewünscht, wurden folgende Aufräumaktionen konsequent umgesetzt:
- `archiv\old-project-snapshots` → Zu `archiv\legacy-snapshots.zip` komprimiert und danach gelöscht.
- `din-5008-brief-generator` → Zu `archiv\din-5008-generator-vite-abandoned.zip` komprimiert und danach gelöscht.
- Alte `.specify/templates` → Waren obsolete Agenten-Templates und wurden im `legacy-snapshots.zip` sicher mit-archiviert.
- Veraltete und schädliche `.git` Unterordner, `node_modules` und `package-lock.json` Dateien außerhalb des Workspaces wurden ersatzlos gelöscht.

Der Workspace ist jetzt absolut pur, performant und sicher vor LLM-Kontext-Halluzinationen.

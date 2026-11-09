# Mitwirken an DIN-BriefNEO (Contributing Guide)

Vielen Dank für dein Interesse, zu DIN-BriefNEO beizutragen! Dieses Projekt unterscheidet sich grundlegend von typischen Web-Applikationen: Wir bauen auf **Wartungsfreiheit auf Lebenszeit**, **100 % native W3C-Standards** und **Zero-Dependencies**.

Bitte lies diese Leitlinien sorgfältig, bevor du Änderungen einreichst.

---

## 🏛️ Die unverrückbaren Projekt-Invarianten

Jeder Beitrag muss die folgenden architektonischen Gesetze strikt einhalten:

### 1. Zero-Dependency & Zero-Build
- **Keine Frameworks:** Weder React, Vue, Svelte noch Angular.
- **Keine Bundler oder Compiler:** Kein Vite, Webpack, Rollup, Parcel, Babel oder TypeScript-Compiler.
- **Keine Laufzeit-Abhängigkeiten:** Keine npm-Pakete in `website/`, keine externen CDNs, keine Google-Fonts.
- Der Code, den du schreibst, wird direkt und unverändert vom Browser ausgeführt.

### 2. Baseline: Chromium 150+ (Chrome only)
- Die alleinige Zielplattform ist modernes **Chromium ab Version 150**.
- **Strikter Verbot von Cross-Browser-Fallbacks:** Keine Polyfills, keine Hacks für veraltete Browser, keine Fallbacks für Safari oder Firefox. Wir nutzen modernste standardisierte APIs (z. B. `Temporal`, Popover API, `:has()`, `@starting-style`, `field-sizing: content`).

### 3. Die Entscheidungs-Leiter (Economy of Code)
> 👉 **`JavaScript = Krücke`** — es ist das letzte Mittel, niemals das erste.

1. **Kann HTML es nativ?** (Constraint Validation `pattern`/`minlength`, Popover API, `commandfor`, `contenteditable="plaintext-only"`).
2. **Kann CSS es deklarativ?** (`:has()`, `@starting-style`, `@container`, `@page`, OKLCH, logische Properties wie `margin-block`).
3. **Erst wenn CSS nachweislich scheitert:** Minimales, funktionales **JavaScript**.

### 4. Hard Bans (Sofortiger PR-Abbruch)
- ❌ **`new Date()` oder `Date.now()`:** Nutze ausschließlich die standardisierte `Temporal`-API (z. B. `Temporal.Now.plainDateISO()`).
- ❌ **`innerHTML`, `outerHTML`, `setHTMLUnsafe()`:** Strikte XSS-Prävention. Nutze `textContent`, `append()` oder DOM-Erstellung.
- ❌ **Base64 im `localStorage`:** Lokale Entwürfe bleiben reiner Text; Binär-Assets (Fonts, Unterschriften) gehören isoliert in die clientseitige `IndexedDB` (`binary-storage.js`).

---

## 🛠️ Lokaler Entwicklungs-Workflow

### 1. Repository klonen & Git-Hooks schärfen
```bash
git clone https://github.com/grapefruit89/DIN-BriefNEO.git
cd DIN-BriefNEO

# Einmalig: Lokale Git-Hooks aktivieren
git config core.hooksPath githooks
```

### 2. App lokal starten
Da native ES-Module den Browser-CORS-Regeln unterliegen, starte einen lokalen Webserver:
```bash
bash tools/dev_server.sh
# oder
python3 -m http.server 8088 --directory website/
```

### 3. Qualitäts-Gates lokal ausführen
Bevor du einen Commit oder Pull Request erstellst, müssen alle vier Gates zu **100 % grün** sein:

```bash
# 1. Biome Linter & Code-Formatierung
npm run check

# 2. Headless Chrome Test-Suite (174 Tests)
npm test

# 3. Antipattern-Prüfung gegen die 36 Immutable Laws
npm run check:antipatterns

# 4. Evolutionäres Fitness Gate (muss 100.0 % clean erreichen)
node tools/build_db.js -q
```

---

## 📝 Pull Request Workflow

1. Erstelle einen aussagekräftigen Branch: `feature/mein-feature` oder `fix/mein-bugfix`.
2. Halte Änderungen chirurgisch klein und fokussiert (Karpathy-Prinzip).
3. Verwende **Conventional Commits**:
   - `feat:` Neue normgerechte Funktionen
   - `fix:` Bugfixes und Fehlerbehebungen
   - `docs:` Dokumentation und Spezifikationen
   - `chore:` Wartung, CI-Anpassungen, Tooling
4. Öffne einen Pull Request gegen `main`. Fülle die [Pull-Request-Vorlage](.github/PULL_REQUEST_TEMPLATE.md) gewissenhaft aus.

---

## 🔒 Sicherheit & Schwachstellen

Sicherheitsrelevante Schwachstellen bitte **niemals als öffentliches Issue melden**, sondern vertraulich über GitHubs [Private Vulnerability Reporting](https://github.com/grapefruit89/DIN-BriefNEO/security/advisories/new) einreichen (siehe [`SECURITY.md`](SECURITY.md)).

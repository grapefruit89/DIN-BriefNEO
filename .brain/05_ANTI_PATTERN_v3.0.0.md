# ANTI-PATTERN: THE CEMETERY OF LEGACY ARCHITECTURE (v3.0.0)
# Status: CEMENTED | Doctrine: Chrome 147+ Baseline | Stand: März 2026

## 1. DATA CORRUPTION (Persistence Anti-Patterns)
- **TOMB-P001:** Nutzung von `localStorage` für große Datenmengen. (Grund: Synchroner I/O blockiert den Main Thread).
- **TOMB-P002:** Nutzung von Cloud-Synchronisation (Firebase/Supabase) für den Draft-State. (Grund: Verstoß gegen Local-First).
- **TOMB-P003:** Nutzung von `JSON.stringify()` im Main Thread während der Eingabe. (Grund: UI-Jank).

## 2. DOM POLLUTION (Layout Anti-Patterns)
- **TOMB-L001:** Nutzung von `innerHTML` für Nutzer-Inhalte. (Grund: XSS-Risiko).
- **TOMB-L002:** Nutzung von `contenteditable="true"`. (Grund: HTML-Datenvergiftung).
- **TOMB-L003:** Nutzung von `execCommand`. (Grund: Veraltet/Inkonsistent).
- **TOMB-L004:** Nutzung von CSS Frameworks (Tailwind/Bootstrap). (Grund: Unnötiger Bloat).

## 3. LOGIC CONTAMINATION (Code Anti-Patterns)
- **TOMB-C001:** Nutzung des `Date` Objekts. (Grund: Mutabilität/Fehlerhaftigkeit. Ersetzt durch `Temporal`).
- **TOMB-C002:** Nutzung von Python-Backend-Frameworks (fs-transaction). (Grund: Client-Side-Only Mandat).
- **TOMB-C003:** Nutzung von Third-Party Bibliotheken (jspdf/moment.js). (Grund: Native Browser-APIs bevorzugt).
- **TOMB-L008:** Nutzung von `setTimeout` oder `setInterval` für Debouncing/Autosave. (Grund: Main-Thread Blockade; ersetzt durch Native Idle Detection API).

## 4. OBSOLETE TOOLS (Banned Tools)
- **TOMB-T001:** Nutzung von `head` und `tail` im Terminal. (Grund: Kontext-Fragmentierung).
- **TOMB-T002:** Nutzung von `cat <<EOF` in PowerShell. (Grund: Syntax-Inkompatibilität).

## 5. BUILD BLOAT (Preprocessor Anti-Patterns)
- **TOMB-V009:** Nutzung von CSS Präprozessoren (SASS, SCSS, LESS, Stylus). (Grund: Verstoß gegen Zero-Build-Step Doktrin; native Chrome 147+ Features wie Nesting, Custom Properties und Math machen sie obsolet).
- **TOMB-M002:** Nutzung von SASS Mixins. (Grund: Code-Duplizierung und Build-Abhängigkeit; ersetzt durch native Custom Properties und atomare Komposition).
- **TOMB-V010:** JS-Scroll-Listener für Overflow-Feedback. (Grund: Ersetzt durch `@container scroll-state()` Queries in CSS).

---
**GEZ. LEAD SYSTEMS ARCHITECT**
"Bury the legacy, embrace the native."
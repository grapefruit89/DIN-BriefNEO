# Architektur-Entscheidungen (DECISIONS.md)

## 1. Wechsel von React auf Vanilla JS & Web Components
**Datum:** 2026-06-23
**Grund:** Reduzierung von Overhead, native Performance und bessere Kontrolle über das Druck-/PDF-Layout (DOM-Struktur).
**Entscheidung:**
- Verzicht auf React-Framework.
- Nutzung nativer Web Components (`HTMLElement` mit Shadow DOM) zur Kapselung von UI-Logik (`<address-autocomplete>`, `<date-swiper>`, `<din-paper>`, `<din-field>`).
- Globaler State-Manager (`store/state.ts`) als "Single Source of Truth", der via CustomEvents mit den Web Components kommuniziert.

## 2. Layout & Responsivität
**Grund:** Der Editor muss zwingend "No-Scroll" sein und sich dynamisch an den Viewport anpassen (DIN A4 Seitenverhältnis beibehalten).
**Entscheidung:**
- `body` erhält `overflow-hidden flex h-screen`.
- Die `<din-paper>` Komponente nutzt ResizeObserver (bzw. Window Resize Listener), um einen `transform: scale()` Wert für die `.sheet` Klasse zu berechnen. Damit passt das A4-Blatt immer vollständig auf den Bildschirm, ohne das Scrollbalken entstehen (außer im manuellen Zoom-Modus, der noch aussteht).

## 3. Theming & Styling
**Grund:** Einheitliches Design in der gesamten App, Unterstützung für semantische Farben.
**Entscheidung:**
- Nutzung von Tailwind CSS (`@import "tailwindcss";` in `index.css`) für Layouting und Utilities in den Hauptstrukturen (`index.html`).
- Für Web Components: Scoped CSS innerhalb der Shadow DOMs (`<style>`-Tags) für vollständige Kapselung der Komponenten-Styles.

## 4. Icons
**Entscheidung:**
- Verwendung von `lucide` Icons (Vanilla JS Importer `createIcons()`) im Haupt-DOM (`index.html`). Dies hält die Bundle-Größe klein und bietet konsistente SVGs.

## 5. Event-Basiertes State-Management & Debouncing
**Datum:** 2026-06-23
**Grund:** Effiziente Updates der Felder ohne Polling.
**Entscheidung:**
- Simpler `setState` und `getState` Store (`store/state.ts`) ohne externe Library.
- Die `<din-field>` Komponente (Web Component) reagiert auf `input`-Events, welche mit einem 400ms Debounce (`utils/debounce.ts`) in den Store geschrieben werden.
- Abonnenten wie `<din-paper>` werden über `subscribe()` benachrichtigt und können sich punktuell updaten, ohne den Cursor-Fokus der `<din-field>` Eingabefelder zu stören.

## 6. Persistenz und JSON-Export
**Datum:** 2026-06-24
**Grund:** Datenverlust bei Page Reload vermeiden und Portabilität der Briefdaten gewährleisten.
**Entscheidung:**
- **Persistenz (Local-First)**: Bei jedem (debouncten) State-Update wird das gesamte State-Objekt im `localStorage` unter `din-letter-data` persistiert. Beim App-Start lädt `loadInitialData()` in der `main.ts` diese Daten, um den Zustand wiederherzustellen.
- **JSON-Export**: Implementierung einer leichten und strukturierten Export-Funktion als Hauptformat, da JSON strukturiert ist, Metadaten gut abbildet und zukunftssicher ist (später leicht importierbar). Der Export-Button liegt als natives HTML+JS Snippet vor und löst den Download eines generierten Blob-Objektes aus.

## 7. Minimalistisches UI & Entwicklermodus (Developer Mode)
**Datum:** 2026-06-24
**Grund:** Das Benutzer-Interface soll für den Normalbetrieb extrem aufgeräumt und sauber bleiben. Komplexe Funktionen und Power-User-Tools sollen nicht im Weg stehen.
**Entscheidung:**
- Verstecken von Power-Features (wie JSON-Export) im normalen Layout.
- Ein geheimer **Entwicklermodus**, der durch **5 schnelle Klicks auf die Versionsnummer** (oben links im Header) aktiviert oder deaktiviert wird.
- Speichern des Status in `localStorage` (`din-dev-mode`) und setzen eines Attributes am Body-Element (`data-dev-mode="true"`). Entsprechende CSS-Regeln zeigen dann die versteckten Buttons an.

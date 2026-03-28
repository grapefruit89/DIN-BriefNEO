# 006 — Visuelle Validierung & Asset-Strategie (Task 6)

## 1. ÜBERSICHT
Diese Roadmap definiert die Strategie zur Sicherstellung der grafischen und physikalischen Integrität des DIN-Briefs. Ziel ist eine "Zero-Pixel-Drift" Garantie.

## 2. TO-DO LISTE

### A. Ghost-Overlay Funktion (Innovation)
- [ ] **Integration:** Einbindung der Referenz-SVGs (`assets/reference/`) als optionalen Layer über dem Editor.
- [ ] **UI:** Toggle-Button in der Sidebar zur Aktivierung des Overlays.
- [ ] **Nutzen:** Direkter visueller Abgleich zwischen Live-DOM und DIN-Spezifikation (Form A/B).

### B. Lokale Font-Autonomie (MANDATE-SOU)
- [ ] **Sourcing:** Beschaffung der WOFF2-Dateien für die Kern-Schriftarten (z.B. Inter, JetBrains Mono).
- [ ] **Storage:** Ablage in `assets/fonts/`.
- [ ] **Implementation:** Umstellung der `@font-face` Regeln in `app-ui.css` auf lokale Pfade.
- [ ] **Ziel:** 100% identisches Rendering unabhängig von System-Fonts.

### C. Automatisierte Visuelle Regression
- [ ] **Tooling:** Einrichtung einer Puppeteer-Testumgebung.
- [ ] **Workflow:** Automatisierte Screenshots des gerenderten Briefs bei jeder Architektur-Änderung.
- [ ] **Storage:** Nutzung von `assets/screenshots/` für Master-Referenzbilder.
- [ ] **Validation:** Bitweiser Vergleich zur Erkennung von Abweichungen > 0,001mm.

## 3. STATUS
- **Priorität:** HOCH
- **Fortschritt:** 0% (Geplant)

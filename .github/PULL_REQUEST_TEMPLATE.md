## Zusammenfassung der Änderungen
Eine präzise Beschreibung der durchgeführten Änderungen und deren Motivation.

---

## 🏛️ Konformitäts-Checkliste (DIN-BriefNEO Invarianten)

Vor dem Einreichen des Pull Requests bitte alle Punkte prüfen und abhaken:

### Architektur & Plattform
- [ ] **Zero-Dependency:** Keine neuen npm-Laufzeitpakete, keine externen CDNs, keine externen Fonts.
- [ ] **Chromium 150+ Baseline:** Reines modernes Chromium; keine Polyfills oder Legacy-Fallbacks für ältere Browser.
- [ ] **Economy of Code:** HTML vor CSS vor minimalem JavaScript (`JavaScript = Krücke`).
- [ ] **Temporal-API:** Keine Verwendung von `new Date()` oder `Date.now()`.
- [ ] **XSS-Schutz:** Keine Verwendung von `innerHTML`, `outerHTML` oder `setHTMLUnsafe()`.
- [ ] **Zero-Base64:** Keine serialisierten Base64-Blobs im `localStorage`; Binärdaten liegen in `IndexedDB`.

### Qualität & Verifikation
- [ ] **Linter:** `npm run check` läuft fehler- und warnungsfrei durch.
- [ ] **Test-Suite:** `npm test` besteht vollständig (174/174 Tests).
- [ ] **Antipattern-Gate:** `npm run check:antipatterns` meldet 0 Verstöße gegen die 36 Gesetze.
- [ ] **Evolutionary Fitness Gate:** `node tools/build_db.js -q` erreicht **100.0 % (clean)**.

---

## Verknüpfte Issues
Schließt Issue: #...

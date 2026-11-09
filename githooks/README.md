# githooks

Versionierte Git-Hooks für DIN-BriefNEO zur lokalen Qualitätssicherung und automatischen Index-Pflege im sichtbaren Stammverzeichnis.

---

## 1. Aktivierung (einmalig pro Clone)

Um die Hooks für das lokale Repository scharf zu schalten:

```bash
git config core.hooksPath githooks
```

---

## 2. Der `pre-commit` Hook (5-Stufen-Gatekeeper)

Führt vor jedem lokalen Commit eine fünfstufige Validierung aus (Silent-on-Success, bricht bei Fehlern ab):

1. **Stufe 1 — Biome Linter & Format-Check:** `npm run check` (Validiert Quellcode auf 0 Fehler)
2. **Stufe 2 — Unit-Tests via Headless Chrome:** `npm test` (183 Tests via CDP)
3. **Stufe 3 — Adress-Korpus-Gate:** `node test/corpus/run.js` (80 Korpus-Fälle, Regression-Gate)
4. **Stufe 4 — Antipattern-Suite:** `npm run check:antipatterns` (Alle 36 Architektur-Regeln)
5. **Stufe 5 — Evolutionary Fitness & SSoT-Sync:** `node tools/build_db.js -q` (Muss 100.0 % Score erreichen)

Bricht der Commit bei einem Fehler, einem fehlschlagenden Test oder einem Score < 100.0 % sofort mit Exit-Code `!= 0` ab.

---

## 3. Notfall-Bypass

Sollte in einer Notfall-Situation (z. B. Hotfix oder experimenteller Zwischenstand) der Pre-Commit-Check übersprungen werden müssen:

```bash
git commit --no-verify -m "deine nachricht"
```

> **Hinweis:** Das Remote-CI-Gate (`.github/workflows/fitness.yml`) prüft bei jedem Push und PR dieselben Bedingungen und blockiert unvollständige Stände serverseitig.

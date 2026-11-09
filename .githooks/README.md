# .githooks

Versionierte Git-Hooks für DIN-BriefNEO zur lokalen Qualitätssicherung und automatischen Index-Pflege.

---

## 1. Aktivierung (einmalig pro Clone)

Um die Hooks für das lokale Repository scharf zu schalten:

```bash
git config core.hooksPath .githooks
```

---

## 2. Die Hooks im Detail

### A. `pre-commit` (Gatekeeper)
Führt vor jedem lokalen Commit eine dreistufige Validierung aus:
1. **Biome Linter & Style-Check:** `npm run check --silent`
2. **Headless Test-Suite:** `npm test --silent` (180 Tests in Chrome)
3. **Fitness Gate:** `node tools/build_db.js -q` (muss 100.0 % Score erreichen)

Bricht der Commit bei einem Fehler, einem fehlschlagenden Test oder einem Score < 100.0 % sofort mit Exit-Code `!= 0` ab.

### B. `post-merge` & `post-checkout`
Schlanke No-Op Hooks mit Exit-Code 0. Reserviert für zukünftige Workspace-Synchronisationen.

---

## 3. Notfall-Bypass

Sollte in einer Notfall-Situation (z. B. Hotfix oder experimenteller Zwischenstand) der Pre-Commit-Check übersprungen werden müssen:

```bash
git commit --no-verify -m "deine nachricht"
```

> **Hinweis:** Das Remote-CI-Gate (`.github/workflows/fitness.yml`) prüft bei jedem Push und PR dieselben Bedingungen und blockiert unvollständige Stände serverseitig.

# .githooks

Versionierte Git-Hooks (statt der nicht-versionierten `.git/hooks/`).

## Aktivierung (einmalig pro Clone)

```bash
git config core.hooksPath .githooks
```

## Was der `pre-commit` macht

Führt `node tools/build_db.js` aus: **Fitness Gate (muss 100 % sein)** +
**Retrieval-Index** (`agent/cache/docs_search.db`). Bricht den Commit bei
Verstoß ab (`critical`-Logs oder Score < 100 %).

## Backstop

Derselbe Lauf läuft zusätzlich in CI: `.github/workflows/fitness.yml`
(auf `push`/`pull_request`) — auch ohne lokalen Hook.

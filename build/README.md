# `build/`

Reiner Cache-Ordner für automatisch generierte Artefakte. Nichts hier wird von
Hand gepflegt — alles entsteht beim Ausführen von `scripts/start.ps1` neu.

## Inhalt

- **`LLM_CONTEXT.md`** — gebündelter Kontext für LLMs, erzeugt von `tools/create_context.js`
  aus README.md, AGENTS.md und `docs/00-foundation/`.
- **`import.sql`** — wird während des Builds erzeugt, Inhalt hängt vom jeweils letzten
  Lauf ab.

## Wichtig

- **Komplett gitignored** (bis auf diese README) — nichts hier ist Teil des
  versionierten Repos, nichts geht beim Löschen verloren, was nicht ohnehin
  neu generiert wird.
- **Jederzeit gefahrlos leerbar.** Beim nächsten `scripts/start.ps1`-Lauf wird
  alles neu erzeugt.
- **`DIN-Brief_docs.db`** — SQLite-Wissensbasis (FTS5), generiert von `tools/build_db.py`.
  Lag lange faelschlich im Repo-Root, seit 2026-08-28 korrekt hier.

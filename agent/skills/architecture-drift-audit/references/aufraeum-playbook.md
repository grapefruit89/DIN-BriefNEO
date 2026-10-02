# Referenz: Aufräum-Playbook (Docs- & Repo-Hygiene)

Zweck: wiederholbarer Pass gegen gewachsene Doku — entdoppeln, verlinken,
vereinheitlichen, Ballast raus. Ergänzt `SKILL.md` (Soll/Ist-Drift) um die
konkrete Putz-Sequenz. Abgeleitet aus den Aufräum-Sessions 2026-09 (IMR-Vokabular,
Case-Contract, Baseline-Sweep, Doppelpflege-Entfernung, Traceability-Anker).

## Ablauf (immer in dieser Reihenfolge)

1. **Scannen** — mechanisch, je Befund eine **Fundstelle** (Datei:Zeile).
2. **Klassifizieren** — Prüfklassen §1; Ausnahmen §3 aussortieren.
3. **Fixen** — eine Klasse pro Commit-Gruppe, nie vermischen.
4. **Beweisen** — Scan erneut (0 ungewollte Treffer), Gate 100 %, `node tools/imr.js`.
5. **Protokollieren** — `node tools/log_session.js`, Append in
   `docs/30-meta/DECISION-LOG.md`, Commit + Diff-Check, Push.

## 1. Prüfklassen

| # | Klasse | Frage | Fix |
|---|--------|-------|-----|
| 1 | **Rolle** | Eine Datei = eine Rolle? Doppelte Pflege (manuell vs. generiert, Guide vs. ADR)? | konsolidieren oder löschen |
| 2 | **Tote Verweise** | inline `[[…]]`, Frontmatter `doc_links`/`code_links`, `@adr`/`@guide`, relative MD-Links | auf existierendes Ziel umbiegen; sonst Ziel anlegen/entfernen |
| 3 | **Generierte Artefakte** | wird die Datei erzeugt? | nie tracken (`.gitignore`) + als „generiert, nicht versioniert" markieren |
| 4 | **Vokabular (IMR)** | nur kanonische Begriffe; Englisch/Synonyme? | umbenennen (`tools/imr.js` erzwingt) |
| 5 | **Case-Contract** | HTML/CSS kebab; JS camel/Pascal/UPPER_SNAKE; Docs-`id` kebab | umbenennen |
| 6 | **Baseline-Version** | genau eine (Foundation); nennt dieses Doc eine **zweite** Zahl? | auf `[[longevity-guidelines]]` referenzieren; **Feature-Ship-Version ≠ Baseline** |
| 7 | **Stale Pfade** | stimmt der genannte Dateipfad? | gegen `git ls-files` / `ls` prüfen |
| 8 | **Archiv/Rolle** | veraltet/überholt? | nach `docs/90-archive/` |

Klasse 2 wird seit 2026-09 automatisch erzwungen: `tools/links.js` (Gate-Regel `links`, severity **critical**) prüft inline `[[…]]` und Frontmatter `doc_links`/`depends_on` gegen existierende Basenames. Manuell bleibt nur das Umbiegen/Aufräumen. Ausnahmen (Code-Fences/-Spans, Template-Platzhalter, Chronik, `90-archive`, `supersedes`-Lineage) definiert `tools/links.js`.

## 2. Scan-Vorlagen

```bash
# Tote Links (Treffer dann gegen Basenames aus `git ls-files` prüfen)
rg -o '\[\[[^]|#]+' docs/<dir> | sort -u
# Baseline-Nennungen
rg -n 'Chrome [0-9]+' docs/<dir>
# Stale Pfade
rg -n '[^/]js/[0-9]' docs/<dir>
# Generiert & versehentlich getrackt? (muss leer sein)
git ls-files docs/10-architecture/Function-Traceability.md docs/10-architecture/Code-Referenzen.md
# Dangling Code-Annotationen
rg -o '@(adr|guide) \[\[[^]]+\]\]' website/ | sort -u
```

## 3. Ausnahmen (NICHT „fixen")

- **Code-Fences** (Beispiel-Snippets, z. B. `[[ADR-0002-technology-stack#…]]` in einem ```markdown-Block).
- **Template-Platzhalter** (`ADR-XXX`, `ADR-YYY`).
- **Anhänge** (`[[schema-v6.json]]` — Nicht-MD-Datei, existiert).
- **Frontmatter-Beispielwerte**.
- **Chroniken** (`docs/30-meta/DECISION-LOG.md`, `docs/90-archive/CHANGELOG.md`, `docs/90-archive/*`) — nie rückwärts „reparieren".

## 4. Definition of Done

0 ungewollte tote Links (Scan), Gate 100 %, `imr.js` OK, Protokoll +
DECISION-LOG geschrieben, gepusht.

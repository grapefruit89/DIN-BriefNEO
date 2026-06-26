---
title: Migrations-Roadmap DIN-Brief Neo zu Vanilla llm_boilerplate
status: active
tags: [migration, boilerplate, antipatterns, generalisierbarkeit, tools]
---

# Migrations-Roadmap: DIN-Brief Neo → Vanilla llm_boilerplate

**Ziel:** Struktur so gestalten, dass nicht-projektspezifische Teile (vor allem Regeln, Tools, generische Dokumentation) später sauber und mit minimalem Aufwand in die generische `llm_boilerplate` übernommen werden können.

## Empfohlene Ziel-Struktur (bereits teilweise umgesetzt)

```
aktueller_arbeitsordner/
├── website/                    # Reine Anwendung – stark projektspezifisch, nicht extrahieren
│   ├── js/
│   ├── css/
│   └── index.html
│
├── tools/                      # ★ Kern für Extraktion
│   ├── antipatterns/           # Layered Rules – der wichtigste Teil für Generalisierbarkeit
│   │   ├── base.json           # Universell (Date API etc.)
│   │   ├── web.json            # HTML/CSS/JS – fast überall nutzbar
│   │   ├── nix.json            # (falls relevant) Linux/NixOS
│   │   └── project.json        # Nur DIN-Brief-spezifisch (Exemptions, eigene Regeln)
│   │
│   ├── reconciliation.js       # Generisch
│   ├── build_db.js             # Generisch
│   ├── log_session.js          # Generisch
│   ├── inject_yaml.js          # Generisch
│   └── ...
│
└── boilerplate.config.json     # Steuert active layers etc. – generisch nutzbar
```

## Migrations-Schritte (priorisiert)

### Phase 1: Layered Antipatterns (Hoch – Kern der Wiederverwendbarkeit)
1. `tools/antipatterns/` Verzeichnis anlegen (erledigt).
2. Aktuelle `antipatterns.json` in Schichten aufteilen:
   - `base.json`: universelle Regeln (z.B. Temporal/Date API).
   - `web.json`: allgemeine Web-Regeln (execCommand, XHR, innerHTML, Farben, externe Verbindungen).
   - `project.json`: DIN-spezifische Regeln + Exemptions (z.B. innerHTML im main.js).
3. `boilerplate.config.json` anlegen (mit `activeAntipatterns: ["base", "web", "project"]`).
4. `reconciliation.js` anpassen, damit es die Layer lädt und merged (erledigt – nutzt Map by ID, später layers können project.json überschreiben).
5. Alte `antipatterns.json` als Backup behalten oder entfernen, sobald stabil.

### Phase 2: Tools generisch machen
- Sicherstellen, dass `reconciliation.js`, `build_db.js`, `log_session.js`, `inject_yaml.js` keine harten DIN-spezifischen Annahmen enthalten (außer über Config).
- `log_session.js` und `reconciliation.js` ggf. aus `llm_boilerplate/tools/` nachziehen/angleichen, wenn Unterschiede bestehen.
- CUSTOM_CHECKS / FEATURE_CHECKS wo möglich in die JSON-Regeln oder Config auslagern.

### Phase 3: Dokumentation & Vertrag
- `AGENTS.md` finalisieren (bereits weitgehend generisch).
- Generische Teile aus `constitution.md`, `MASTER-DO-DONT-DEPRECATED.md`, Guides in die Boilerplate übernehmen (oder als Vorlage verwenden).
- Projektspezifische ADRs und website/ bleiben im Projekt.

### Phase 4: Aufräumen & Extraktion
- `project.json` als "Mülleimer" für alles DIN-spezifische pflegen.
- Test: Nach Änderungen immer Pre/Post-Build + 100% Fitness + Log.
- Wenn stabil: Die generischen Teile (`tools/antipatterns/{base,web}.json`, Tools, Config, Teile von AGENTS) in die `llm_boilerplate` kopieren/übernehmen.

## Aktueller Status (2026-06-12)

- `tools/antipatterns/{base,web,project}.json` angelegt und befüllt.
- `boilerplate.config.json` angelegt.
- `reconciliation.js` auf layered Loading umgestellt (Merge per ID, Project überschreibt).
- Fitness nach Anpassung wieder 100% (Exemption korrekt über Override).
- Entscheidung im DECISION-LOG dokumentiert.
- Nächste Schritte: ggf. weitere Tools angleichen, alte flat file aufräumen, Dokumentation prüfen.

## Prinzipien (aus AGENTS.md)

- Generalisierbarkeit bei **jeder** Lösung prüfen und vorschlagen.
- `project.json` für DIN-spezifisches.
- Alles andere so generisch wie möglich halten.

Diese Roadmap stellt sicher, dass die Extraktion später mechanisch und mit wenig manuellem Aufwand möglich ist.

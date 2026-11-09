# Statusinventar der Research-Dokumente

**Stand:** 2026-10-02  
**Zweck:** Dieses Verzeichnis klassifiziert die Markdown-Dokumente unter `research/`.
Research bleibt Quellen- und Arbeitsmaterial; verbindliche Produktentscheidungen liegen
in ADRs, offene Umsetzung im [[../docs/30-meta/BACKLOG|Backlog]].

## Statusvokabular

| Status | Bedeutung |
|---|---|
| **umgesetzt** | Die wesentliche Idee ist im aktuellen Produktcode angekommen |
| **offen** | Die Idee ist weiterhin relevant und noch nicht vollständig umgesetzt |
| **verfallen** | Die ursprüngliche Annahme oder der Nutzen gilt nicht mehr |
| **quelle** | Messung, Rohdatenbericht oder externe Provenienz; kein Produktauftrag |
| **index** | Einstieg oder Forschungsverwaltung |

## Umgesetzt oder als aktuelle Provenienz behalten

| Dokument | Status | Zielort des aktuellen Wissens |
|---|---|---|
| `roadmap/ANREDE_ENGINE_AND_GENDER_SPEC.md` | umgesetzt | `docs/20-implementation/Salutation-Engine.md` |
| `roadmap/ANREDE_UND_GRUSSFORMEL_PAERCHEN_SPEC.md` | umgesetzt | `docs/20-implementation/Salutation-Engine.md` |
| `roadmap/BROTLI_AND_BIDIRECTIONAL_PLZ_SPEC.md` | umgesetzt | `docs/10-architecture/ADR-OFFLINE-ADDRESS-INTELLIGENCE.md` |
| `roadmap/DYNAMIC_BIAS_AND_TARGET_LOCKING.md` | umgesetzt | `docs/10-architecture/ADR-OFFLINE-ADDRESS-INTELLIGENCE.md` |
| `roadmap/GITHUB_ACTIONS_DATA_UPDATE_SPEC.md` | umgesetzt | `.github/workflows/update_plz_pipeline.yml` |
| `roadmap/GROSSEMFAENGER_POST_UND_RECHTS_SPEC.md` | umgesetzt | `docs/10-architecture/ADR-OFFLINE-ADDRESS-INTELLIGENCE.md` |
| `roadmap/KISS_SALUTATION_AND_EDITABLE_OVERRIDE_SPEC.md` | umgesetzt | `docs/20-implementation/Salutation-Engine.md` |
| `roadmap/PLZ_MAINTENANCE_AND_UPDATE_LIFECYCLE.md` | umgesetzt | `.github/workflows/` und Research-Pipeline |
| `roadmap/PROGRESSIVE_PLZ_PREFIX_FILTERING.md` | umgesetzt | `website/js/45-address-intelligence.js` |
| `roadmap/SMART_CLIPBOARD_IMPRESSUM_PARSER.md` | umgesetzt | `website/js/46-clipboard-address-parser.js` |
| `roadmap/ZERO_SCROLL_DIN_ARCHITECTURE.md` | umgesetzt | `docs/20-implementation/no-scroll-techniques.md` |
| `roadmap/CSS_MODERN_REPLACEMENTS.md` | umgesetzt | `docs/10-architecture/ADR-CSS.md` |

## Offen und für den Backlog relevant

| Dokument | Status | Aktueller Anker |
|---|---|---|
| `roadmap/ADAPTIVE_DROPDOWN_THRESHOLD_SPEC.md` | offen | B19 / `website/js/43-geoapify.js` |
| `roadmap/SMART_FORM_BIDIRECTIONAL_ORCHESTRATION.md` | offen | nach B19 neu bewerten |
| `roadmap/AI_ADDON_INTEGRATION_GUIDE.md` | offen | optionales Addon |
| `roadmap/EXPERIMENTAL_AI_ADDON_SPEC.md` | offen | optionales Addon |
| `roadmap/GEOAPIFY_OPTIMIZATION_CONCEPT.md` | offen | optionale Tier-2-Suche |
| `roadmap/MULTI_PROVIDER_INTEGRATION_BLUEPRINT.md` | offen | erst bei echtem Providerbedarf |
| `roadmap/LEAN_PLZ_LOOKUP_CONCEPT.md` | offen | gegen aktuelle Offline-Engine prüfen |
| `roadmap/REMAINING_JAVASCRIPT_CORE.md` | offen | Kandidatenanalyse, kein Auftrag |
| `roadmap/CHROME_METRICS_HIDDEN_GEMS.md` | offen | Research, keine automatische Produktanforderung |
| `roadmap/CSS_SNIPPETS_REFERENCE_2026.md` | offen | gemischte Matrix; B21 bewertet |

## Quellen, Messungen und historische Recherche

| Dokumente | Status |
|---|---|
| `mcp_research.md` | quelle |
| `research_changelog.md` | quelle |
| `research_results/*.md` | quelle |
| `roadmap/BROWSER_AUDIT_EVALUATION.md` | quelle |
| `roadmap/CHROME_2025_ANALYSIS.md` | quelle |
| `roadmap/LLM_MODERN_WEB_PLAYBOOK_2026.md` | quelle |
| `roadmap/MODERNIZATION_ROADMAP_2026.md` | quelle |
| `roadmap/FUNCTION_MIGRATION_MATRIX.md` | quelle |
| `roadmap/GEOAPIFY_REGION_BIAS_SPEC.md` | quelle |
| `roadmap/GROSSEMFAENGER_AND_COMPANY_LOOKUP_CONCEPT.md` | quelle |
| `roadmap/OPENPLZ_VS_ZIPPOPOTAM_ANALYSIS.md` | quelle |

## Verfallen oder nur noch als historische Begründung aufbewahren

| Dokument / Aussage | Status | Grund |
|---|---|---|
| `text-box-trim`-Teil in der CSS-Research | verfallen | ursprünglicher Hack-Abbau ist im aktuellen Layout nicht mehr der behauptete Umfang |
| `font-display`-Teil in der CSS-Research | verfallen | Fonts werden über die FontFace-API geladen |
| Prozentversprechen wie „61 % JS-Eliminierung“ | verfallen | historische Prognose, keine aktuelle Messgröße |

## Pflege-Regel

Neue Research-Dateien bekommen hier zuerst einen Status. Wird eine Idee verbindlich,
wandert ihre aktuelle Aussage in ein passendes ADR, einen Implementation-Guide oder
die Foundation. Research selbst bleibt als Quelle erhalten und wird nicht zur zweiten
Normquelle.

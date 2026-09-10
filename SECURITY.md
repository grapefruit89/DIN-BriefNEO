# Sicherheitsrichtlinie (Security Policy)

## Unterstützte Versionen

| Version | Unterstützung |
| --- | --- |
| `main` (aktuell) | ✅ |

DIN-BriefNEO ist eine reine **Client-Anwendung** ohne Backend. Es gibt keine Server-Infrastruktur und keine Versionierung mit LTS-Zweigen — Sicherheitsfixes erfolgen ausschließlich auf `main`.

## Datenschutz-Modell

- **Alle Briefdaten** (Entwürfe, Profile, Einstellungen) verbleiben ausschließlich im `localStorage` des Browsers. Es gibt kein Backend, keine Cloud und kein Tracking.
- **Netzwerkzugriffe:** Die App lädt keine externen Ressourcen (keine CDNs, keine Fonts). Einzige freiwillige Ausnahme: die Adress-Autovervollständigung (Geoapify/Photon) — sie ist standardmäßig inaktiv und sendet nur Daten, wenn der Nutzer einen API-Key hinterlegt und eine Adresssuche auslöst.
- **GitHub Pages Deployment:** Die veröffentlichte App wird beim Deployment von der Commithistorie gestempelt (Build-Datum). Es werden keine Nutzerdaten an GitHub gesendet.

## Sicherheitslücke melden

Bitte **keine** Sicherheitslücken als öffentliches Issue melden. Nutze stattdessen [GitHub Private Vulnerability Reporting](https://github.com/grapefruit89/DIN-BriefNEO/security/advisories) (Tab „Security" → „Report a vulnerability").

Erwarte bitte keine feste Reaktionszeit — dies ist ein Ein-Personen-Projekt. Melde im Zweifel zusätzlich per GitHub-Issue (ohne Details), damit eine Benachrichtigung garantiert ankommt.

## Scope: Was gemeldet werden sollte

- XSS-Vektoren über Briefinhalte (Sanitizing-Pfad im DraftManager) — dieser Pfad ist der kritischste und ist durch Tests abgedeckt (`test/`).
- Umgehung der MCP-Allowlist (`agent/mcp/dinbrief-mcp/`) oder der Plan-Bindung von `repository.execute`.
- Unsichere Handhabung von localStorage-Daten (z. B. Prototype Pollution über Draft-JSON).

## Out of Scope

- Sicherheitsprobleme des Browsers selbst (Chrome 150+ ist dokumentierte Baseline).
- `file://`-Aufrufe: Die App **lädt bewusst nicht** über `file://` (CORS-Regeln verlangen einen lokalen Webserver, siehe README). Meldungen zu ``file://``-Einschränkungen sind keine Sicherheitslücken.

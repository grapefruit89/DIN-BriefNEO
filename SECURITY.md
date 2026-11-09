# Sicherheitsrichtlinie (Security Policy)

## Unterstützte Versionen

| Version | Unterstützung |
| --- | --- |
| `main` (aktuell) | ✅ |

DIN-BriefNEO ist eine reine **Client-Anwendung** ohne Backend. Es gibt keine Server-Infrastruktur und keine Versionierung mit LTS-Zweigen — Sicherheitsfixes erfolgen ausschließlich auf `main`.

## Datenschutz- & Speicher-Modell

- **Speicher-Trennung (Zero-Base64-Invariante):**
  - **Text-Entwürfe & Einstellungen:** Verbleiben lokal im `localStorage` des Browsers (`din_draft`, `din_settings`). Es gibt kein Backend, keine Cloud und kein Tracking.
  - **Binäre Assets:** Eigene Schriftarten (`.woff2`) und Signaturbilder werden strikt als binäre Blobs in der clientseitigen `IndexedDB` (`binary-storage.js`) isoliert. Im `localStorage` werden niemals Base64-Daten abgelegt.
- **Austausch- und Exportformat (Schema v4):**
  - Als Dokumentenaustauschformat wird ausschließlich die **Schema-v4-Tuple-Architektur** (`_meta.schema` + `fields`-Wertearray mit 35 Indizes) unterstützt.
  - Altschemata (v1, v2, v3) und beliebige Key-Value-Objekte werden defensiv abgewiesen, um Prototype-Pollution- und Injektionsrisiken auszuschließen.
- **Netzwerkzugriffe & Hermetik:**
  - Die App lädt im Regelbetrieb keine externen Ressourcen (keine CDNs, keine externen Webfonts, kein Tracking, Zero-npm-Runtime).
  - Einzige freiwillige Ausnahme: Die Adress-Autovervollständigung via Geoapify. Sie ist standardmäßig inaktiv und sendet ausschließlich dann Daten, wenn der Nutzer manuell einen API-Key hinterlegt und eine Adresssuche im Formular auslöst.
- **GitHub Pages Deployment:**
  - Die veröffentlichte Web-App wird beim Deployment über GitHub Actions statisch bereitgestellt. Es werden keinerlei Nutzer- oder Telemetriedaten an GitHub gesendet.

## Sicherheitslücke melden

Bitte **keine** Sicherheitslücken als öffentliches Issue melden. Nutze stattdessen [GitHub Private Vulnerability Reporting](https://github.com/grapefruit89/DIN-BriefNEO/security/advisories) (Tab „Security" → „Report a vulnerability").

Erwarte bitte keine feste Reaktionszeit — dies ist ein Ein-Personen-Projekt. Melde im Zweifel zusätzlich per GitHub-Issue (ohne Details), damit eine Benachrichtigung garantiert ankommt.

## Scope: Was gemeldet werden sollte

- XSS-Vektoren über Briefinhalte (Sanitizing-Pfad im DraftManager / Plaintext-Konvertierung) — dieser Pfad ist der kritischste und ist durch Tests abgedeckt (`test/`).
- Umgehung der MCP-Allowlist (`agent/mcp/dinbrief-mcp/`) oder der Plan-Bindung von `repository.execute`.
- Unsichere Handhabung von Speicher-Payloads (z. B. Injection über Schema-v4-Importe).

## Out of Scope

- Sicherheitsprobleme des Browsers selbst (Chrome 150+ ist dokumentierte Baseline).
- `file://`-Aufrufe: Die App **lädt bewusst nicht** über `file://` (CORS-Regeln verlangen einen lokalen Webserver, siehe README). Meldungen zu `file://`-Einschränkungen sind keine Sicherheitslücken.

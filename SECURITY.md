# Sicherheitsrichtlinie (Security Policy)

## Unterstützte Versionen

| Version | Status |
| :--- | :--- |
| `main` (aktiver Entwicklungszweig) | ✅ Unterstützt |
| Ältere Commits / Releases | ❌ Nicht unterstützt |

DIN-BriefNEO ist eine reine, zustandslose Client-Webanwendung (Vanilla W3C). Es existiert keine Server-Infrastruktur, keine Benutzerverwaltung und keine LTS-Release-Zyklen. Sicherheitsrelevante Fixes werden ausschließlich auf dem `main`-Branch bereitgestellt und unmittelbar über GitHub Pages deployed.

---

## Technisches Sicherheits- & Datenschutzmodell

### 1. Speicherarchitektur (Zero-Base64-Invariante)
- **Textdaten & Einstellungen:** Werden ausschließlich im Browser-eigenen `localStorage` unter dem Namespace `din_*` persistiert (`din_draft`, `din_settings`). Es findet keine Übertragung an Server, Cloud-Dienste oder Telemetrie-Endpunkte statt.
- **Binäre Assets:** Eigene Schriftarten (`.woff2`) und Signatur-Grafiken verbleiben strikt als binäre Blobs in der clientseitigen `IndexedDB` (`binary-storage.js`). Das Einbetten oder Serialisieren von Binärdaten als Base64 im `localStorage` oder im JavaScript-Quellcode ist architektonisch verboten (Catalog Law A64).

### 2. Validierung & Datenintegrität (Schema v4 Tuple-Architektur)
- Für den Import und Export von Dokumenten gilt ausschließlich die Schema-v4-Tuple-Spezifikation (`_meta.schema: 4` mit einem 35-elementigen Positions-Array).
- Das Einlesen von Legacy-Schemata (v1–v3) sowie unstrukturierten Key-Value-JSON-Objekten wird defensiv verweigert, um Risiken durch Prototype Pollution und unerwartete DOM-Zustände auszuschließen.

### 3. Isolation & Netzwerk-Hermetik
- **Zero-Dependency-Prinzip:** Die Anwendung bindet zur Laufzeit weder Frameworks, noch Bundler oder externe npm-Module ein.
- **Keine externen CDNs:** Sämtliche Schriften, Stylesheets und Skripte werden lokal aus dem eigenen Repository ausgeliefert.
- **Optionale Geokodierung:** Die Adress-Autovervollständigung via Geoapify ist standardmäßig vollständig inaktiv. Netzwerkanfragen erfolgen ausschließlich dann, wenn der Nutzer explizit einen eigenen API-Key hinterlegt und aktiv eine Adressrecherche anstößt.
- **Strikte CSP:** Die Content-Security-Policy blockiert Inline-Scripts ohne Hash, verbietet `object-src` sowie Frames und limitiert `connect-src` auf `'self'` und die autorisierte Geoapify-API.

---

## Sicherheitslücke melden

Sicherheitsrelevante Schwachstellen dürfen **nicht** über öffentliche GitHub-Issues gemeldet werden.

1. **Primärer Meldeweg:** Nutze das **[GitHub Private Vulnerability Reporting](https://github.com/grapefruit89/DIN-BriefNEO/security/advisories/new)** im Tab *Security* → *Report a vulnerability*.
2. **Details:** Beschreibe das Fehlerbild, die betroffenen Komponenten, die Chromium-Version und füge ein reproduzierbares Minimal-Beispiel (PoC) bei.

*Hinweis:* DIN-BriefNEO ist ein unabhängiges Open-Source-Projekt. Sicherheitsmeldungen werden sorgfältig geprüft, feste Reaktions- und Lösungsfristen (SLAs) können jedoch nicht garantiert werden.

---

## Scope-Abgrenzung

### Im Scope (Relevante Schwachstellen)
- **DOM-basierte XSS-Vektoren:** Umgehung der Sanitizing- und Bereinigungslogik in `website/js/` (insbesondere im Rich-Text-Editor, beim Clipboard-Paste oder beim Import fremder Entwürfe).
- **Speicher- und Parsing-Schwachstellen:** Injektionen oder Pufferüberläufe bei der Verarbeitung von Schema-v4-Dateien oder Binär-Blobs in der `IndexedDB`.
- **Content-Security-Policy-Bypasses:** Fehlerhafte Direktiven in `website/index.html`, die unautorisierte Script-Ausführungen oder Data-Exfiltration ermöglichen.

### Out of Scope (Nicht relevant)
- **Browser-Sicherheitslücken:** Fehler in der zugrundeliegenden Browser-Engine selbst (Projekt-Baseline: **Chromium 150+**).
- **Einschränkungen unter `file://`:** Die App erfordert CORS- und ES-Module-Unterstützung und ist explizit für den Betrieb über HTTP/HTTPS (statische Server oder GitHub Pages) ausgelegt. Fehlermeldungen, die rein auf dem lokalen Öffnen per Doppelklick (`file://`) beruhen, stellen keinen Sicherheitsfehler dar.
- **Physischer Gerätezugriff:** Manipulationen der lokalen Browserdaten (`localStorage` / `IndexedDB`) durch Dritte mit direktem Zugriff auf das Endgerät des Nutzers.

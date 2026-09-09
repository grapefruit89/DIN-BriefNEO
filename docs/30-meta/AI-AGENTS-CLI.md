---
id: ai-agents-cli
title: 'Sichtpruefung: Chrome DevTools MCP an die laufende App'
type: guide
status: active
created: '2026-09-04'
updated: '2026-09-10'
tags:
  - din-briefneo
  - din-briefneo/meta
  - status/active
  - type/guide
  - tech/chrome
doc_links:
  - repository.yaml
  - tooling-overview
code_links:
  - tools/start.ps1
error_patterns:
  - browser agent
  - devtools mcp
  - sichtpruefung
  - chrome devtools
supersedes: []
depends_on: []
---

# AI-AGENTS-CLI

Stand: 2026-09-04  
Zweck: Coding-Agent an einen echten Chrome haengen und die App sehen, nicht nur den Diff.  
Kein Scaffold. Kein Framework. Kein zweites Gesetzbuch.

Quellen:

- [Chrome DevTools for agents](https://developer.chrome.com/docs/devtools/agents)
- [Get started](https://developer.chrome.com/docs/devtools/agents/get-started)

---

## 1. App laeuft lokal oder auf Pages

Nutzer: `start.bat` (Repo-Root, Port 8088).  
Agenten-Check: `tools/start.ps1` (Fitness Gate); Linux ohne pwsh: `node tools/build_db.js`.  
Live: https://grapefruit89.github.io/DIN-BriefNEO/

Kein `file://` fuer den Agenten-Lauf. CORS und Module brauchen den Server.

---

## 2. Chrome DevTools MCP

Gemini CLI:

```bash
gemini extensions install --auto-update https://github.com/ChromeDevTools/chrome-devtools-mcp
```

Nur MCP:

```bash
gemini mcp add chrome-devtools npx chrome-devtools-mcp@latest
```

Live-Session (Chrome ≥144):

1. `chrome://inspect/#remote-debugging` → Allow
2. MCP mit `--autoConnect` starten
3. Prompt, zum Beispiel:

```text
Oeffne https://grapefruit89.github.io/DIN-BriefNEO/
Pruefe: A4 bleibt bei 100% Zoom vollstaendig im Viewport.
Sidebar scrollt intern, schneidet den Brief nicht ab.
Hilfslinien-Schalter und Anrede-Radios reagieren.
Postvermerk: Auswahl in der Sidebar erscheint im Brief.
Datum ist Langform des heutigen Tages (Temporal).
```

Lokal analog `http://127.0.0.1:8088/`.

**Sicherheit:** Der Agent sieht und klickt wie du. Keine dauerhaft offene Session an einen unbeaufsichtigten Agent haengen.

---

## 3. Systemprompt (kurz)

Nicht in die Foundation kopieren. In die Agent-Instructions:

```text
DIN-BriefNEO: Vanilla HTML/CSS/JS, Zero-Build, Chrome 148+.
HTML = Dokumentstruktur und DIN-Fakten.
CSS = Darstellung.
JS = nur Dynamik, Persistenz, erlaubte Fach-APIs.
Kein Framework, kein customElements.define, kein new Date().
Keine parallelen DIN-Konstanten in CSS/JS.
website/ ist das Produkt. Fitness Gate vor Commit.
```

---

## 4. Was der Agent nicht darf

- Projekt neu scaffolden oder Build-Tools/Frontend-Frameworks anschleppen (Catalog A45)
- Foundation oder IMR anfassen, wenn der Auftrag website/ ist
- Geometriewerte erfinden
- `style=""` oder `style.display` als Dauerloesung

---

## 5. Checkliste vor dem Prompt

- [ ] App ueber Server oder Pages offen, nicht file://
- [ ] Remote Debugging erlaubt
- [ ] Prompt nennt konkrete UI (A4, Sidebar, Anrede, Postvermerk)
- [ ] Kein Commit aus dem Agent-Lauf ohne Fitness Gate

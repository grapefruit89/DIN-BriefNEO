# mcp_research.md

Stand: 2026-09-04  
Status: Roadmap, kein laufender Dienst  
Ort: Repository-Root  
Kein Gesetz. Aendert Catalog, IMR und website/ nicht.

Zielbild in einem Satz:

> Dem Agenten sagen: „Kann JS-Funktion XYZ durch HTML, CSS oder eine native API ersetzt werden?“ — und eine belegte Antwort bekommen, ohne von Hand Chrome-Blogs und MDN zu durchforsten. Anwenden erst nach denselben Leitplanken wie jede andere Aenderung.

---

## 1. Was das Problem wirklich ist

Nicht: „MCP soll das Internet lesen.“  
Sondern: Recherche ist heute Kopf-Arbeit. Der Agent kennt den Catalog oft nicht, kennt BCD nicht, und erfindet Ersatz-JS.

Drei getrennte Jobs, die nicht in einem Server vermischt werden duerfen:

```text
A  Projekt-Recht     darf ich das HIER?
B  Plattform-Fakt    existiert die API, ab welcher Chrome-Version?
C  Sichtpruefung     tut der Ersatz im echten Fenster das Richtige?
```

| Job | Heute | Nicht tun |
|---|---|---|
| A | Catalog, ADR-ANTIPATTERN, `tools/antipatterns/*.json`, `agent/mcp/dinbrief-mcp` | Chrome-Blog ins Gesetz schreiben |
| B | von Hand MDN / chromestatus / BCD | Live-API als zweite Baseline |
| C | `AI-AGENTS-CLI.md` + DevTools-MCP | Feature einbauen, weil der Blog es erwaehnt |

Dieser Text beschreibt nur **B plus die Klammer um A→B→C**.

---

## 2. Der gewuenschte Dialog

```text
Mensch:  Kann 47-date-format.js ohne new Date() bleiben,
         und kann irgendwelches JS durch CSS :has() weg?

Agent:   1. law     — Catalog / Antipattern (A)
         2. platform — BCD + chromestatus, Chrome >= 148? (B)
         3. economy — HTML vor CSS vor bestehendem JS vor neuem JS
         4. vorschlag — Diff-Skizze, kein Commit
         5. Mensch gibt frei
         6. DevTools-MCP prueft Viewport / Interaktion (C)
         7. Fitness Gate
```

Ohne Schritt 1 und 5 kein Code. Schritt 2 allein ist nie Freigabe.

Beispielantworten, die der Agent liefern soll:

```text
new Date()     → BAN (Catalog Temporal). Ersatz: Temporal.zonedDateTimeISO.
                 BCD: Temporal in Chrome 148+ relevant. Kein Date-Polyfill.

style.display  → BAN. Ersatz: versteckte Checkbox + :has() / [hidden].
                 @layer und :has() sind Baseline genug fuer 148+.

customElements.define
               → BAN. din-* bleiben undefinierte Tags. Kein CE-Upgrade.
```

---

## 3. Quellen — anzapfen, nicht einverleiben

Maschinenlesbar und fuer Schritt B geeignet:

| Quelle | URL / Artefakt | Wofuer |
|---|---|---|
| MDN Browser Compat Data | [mdn/browser-compat-data](https://github.com/mdn/browser-compat-data), z. B. `css.at-rules.layer` | Version, Flag, Teilfeature |
| BCD-Bundle | `https://unpkg.com/@mdn/browser-compat-data/data.json` | Offline-Cache moeglich |
| Chrome Status | `https://chromestatus.com/api/v0/features`, `/api/v0/channels` | Milestone, shipped, Intent |
| webstatus.dev | `https://api.webstatus.dev/v1/features` | Baseline quer ueber Browser |
| Chrome-Blog RSS | `https://developer.chrome.com/blog/feed.xml` | Hinweis auf DevTools/MCP, kein Gesetz |
| Version History | versionhistory.googleapis.com | welche Stable gerade live ist |

Nur lesen, nicht abonnieren in die Foundation:

- [New in DevTools 150](https://developer.chrome.com/blog/new-in-devtools-150)
- [chromestatus Roadmap](https://chromestatus.com/roadmap)
- [MDN `@layer`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@layer)

DevTools-150 ist Changelog (u. a. At-Rules in DevTools, Agents-MCP).  
Roadmap ist Feature-Radar.  
`@layer` ist Doku; die Zahl steht in BCD, nicht in der HTML-Seite.

---

## 4. Architektur, falls gebaut wird

Nicht ein Gott-MCP.

```text
dinbrief-mcp          READ/WRITE auf DIESES Repo
  inspect / validate / execute
  spaeter READ: law, tree, map, may

research (optional)   READ auf Plattform-Daten
  query BCD / chromestatus
  immer mit Quelle + Datum + Chrome-Version
  Cache unter build/ oder agent/cache/ (gitignore)

DevTools-MCP          fremder Prozess, echter Chrome
  siehe AI-AGENTS-CLI.md
```

`research` darf **nichts** an Catalog oder website/ schreiben.  
Ausgabe ist ein Research-Record:

```text
feature:        CSS :has()
question:       Sidebar-State ohne JS?
already_in_app: ja, segmented controls
chrome_min:     weit unter 148
baseline:       widely available
catalog:        erlaubt, bevorzugt gegen classList-Toggles
verdict:        kein neues JS; vorhandenen :has()-Pfad nutzen
sources:        BCD css.selectors.has + ADR-CSS
```

---

## 5. Roadmap

### Phase 0 — jetzt, ohne Code

Diesen Dialog als Prompt nutzen. Agent sucht mit vorhandenem web-research-Skill. Mensch bleibt Tuersteher.

### Phase 1 — Projekt-Recht abfragbar

`dinbrief-mcp` READ-only erweitern:

- `law` — Catalog-IDs + `tools/antipatterns/{base,web,project}.json`
- `may <snippet>` — BAN / Preferred / Fallback + Fundstelle
- `map <datei>` — welche ADR gilt (HTML / CSS / JS / Persistenz / Antipattern)

Kein Live-Netz. Das verhindert zuerst die verbotenen Patterns.

### Phase 2 — Plattform-Lookup on demand

Ein Befehl `compat <feature>`:

1. BCD-Cache (pinning auf ein Release, nicht jedes Mal unpkg-latest)
2. optional chromestatus, wenn BCD unklar
3. Vergleich gegen Longevity **148+** (keine neue Zahl erfinden)
4. Record wie in §4, Ablage z. B. `research/` oder Session-Log — nicht Foundation

### Phase 3 — Vorschlag, nicht Patch

Agent liefert ALT/NEU/WARUM/RISIKO. Commit erst nach Freigabe + Fitness Gate + bei UI DevTools-Check.

### Phase 4 — bewusst nicht

- RSS → automatischer Catalog-Patch
- „Chrome 154 kann X, also bauen wir X“
- Baseline im MCP hoeher setzen als Longevity
- Canary-/Flag-only-APIs in website/
- zweiten Antipattern-Katalog im MCP

---

## 6. Sicherheitsfilter vor jedem Ersatz

Ein Plattform-Treffer wird nur Vorschlag, wenn alle gelten:

1. In Chrome **148+ stable** ohne Origin-Trial-Pflicht (BCD oder chromestatus `shipped`).
2. Kein Widerspruch zu HARD BAN (Date, CE-define, CDN-Assets, inline style als Dauerzustand, …).
3. Economy-Leiter: HTML oder CSS schlaegt neues JS.
4. Offline-Kern bleibt offline. Fach-APIs bleiben A38-Ausnahme, keine neuen Hosts.
5. Keine parallele DIN-Geometrie.
6. Ein Satz im ADR oder Session-Log, nicht heimlich.

Flag, Trial, nur Canary → ablehnen oder „Beobachten“, nicht einbauen.

---

## 7. Bedenken

- **Drift:** Live-chromestatus als Wahrheit macht Longevity 148+ weich.
- **Halluzination:** Agent „weiss“ Temporal, baut trotzdem `Date`. Deshalb Phase 1 vor Phase 2.
- **Scope-Creep:** Jeder DevTools-Release sieht aus wie ein Feature-Auftrag. Ist Debugging, kein Produkt.
- **Netz zur Build-Zeit:** website/ bleibt zero-build. Research-Cache gehoert nicht ins Pages-Bundle.
- **Doppelte Gesetze:** MCP zitiert Catalog, schreibt ihn nicht um.
- **Zu grosse Pille:** Ein Server, der Repo + Chrome + MDN + Blog mischt, wird unwartbar. Drei Prozesse lassen.

---

## 8. Was schon reicht, bevor jemand Code schreibt

Prompt an den Coding-Agenten:

```text
Frage: Kann <JS-Stelle> durch HTML/CSS/native API weg?

1. Catalog + ADR-ANTIPATTERN + tools/antipatterns lesen.
2. BCD / chromestatus: Chrome 148+ shipped?
3. Economy: HTML > CSS > vorhandenes JS > neues JS.
4. Nur Vorschlag. Kein Commit.
5. UI? DevTools-MCP laut AI-AGENTS-CLI.md.
6. Fitness Gate.
```

Das ist die Pille. Der MCP macht sie spaeter tippbarer, nicht wahrer.

---

## 9. Verweise

- `AI-AGENTS-CLI.md` — Agent sieht die App
- `agent/mcp/dinbrief-mcp/` — Agent sieht Repo-Recht und Gate
- `agent/skills/web-research/SKILL.md` — Quellenpyramide
- `agent/skills/implement-with-economy/SKILL.md` — HTML/CSS/JS-Leiter
- `docs/00-foundation/longevity-guidelines.md` — einzige Baseline 148+
- `docs/00-foundation/Immutable-Law-Catalog.md`
- `docs/10-architecture/ADR-ANTIPATTERN.md`

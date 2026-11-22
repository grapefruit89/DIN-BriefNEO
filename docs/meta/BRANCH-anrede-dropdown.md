---
id: branch-anrede-dropdown
title: "BRANCH-STATUS: experiment/anrede-dropdown — Vorschlagslisten, Anrede, Blattgeometrie, Geo-Cache"
type: meta
status: active
created: '2026-11-22'
updated: '2026-11-22'
tags:
  - din-briefneo
  - din-briefneo/meta
  - status/active
  - type/branch-handoff
doc_links:
  - HANDOFF
  - DECISION-LOG
  - ADR-CSS
code_links:
  - website/js/suggestion-list.js
  - website/js/geo-cache.js
  - website/js/address.js
  - website/js/address-data.js
  - website/js/salutation.js
  - website/css/sidebar.css
  - website/css/sheet-multipage.css
depends_on: []
---

# BRANCH-STATUS: `experiment/anrede-dropdown`

> **Für den nächsten Agenten.** Dieses Dokument ersetzt das Suchen: es nennt
> Branch, alle berührten Stellen mit Funktionsnamen, die Invarianten und die
> Befehle, mit denen du jeden Punkt in unter einer Minute nachprüfst.

## 0. Lage (Stand 2026-11-22)

| Punkt | Wert |
|---|---|
| Branch | `experiment/anrede-dropdown` (= `origin/…`, nichts unpushed) |
| Basis | `main` = **`052ac5b`** (`fix(adresse): Dropdown schliesst bei Tab/Blur`) — **main ist unberührt** |
| Umfang | 20 Commits, 14 Dateien, +1453/−298 Zeilen |
| Letzter Commit | `14d26b4` (leere Geoapify-Trefferliste wird gemerkt) |
| Dev-Server / CDP | `:8088` (`./tools/start.sh`) · DevTools `:9222` |
| Arbeitsbaum | nur `DeepSeek_DIN-BriefNEO-Review_20261111-2213.md` unversioniert (bewusst) |

```bash
git log --oneline main..HEAD      # 20 Commits
git diff --stat main...HEAD       # 14 Dateien
```

**Regel:** alles auf diesem Branch. Kein Merge nach `main`, kein direkter
`main`-Commit, kein Rebase ohne Rückfrage.

---

## 1. Was hier gebaut wurde (5 Stränge)

### A. Ein Bedien-Gerüst für Vorschlagslisten (neu)

| Datei | Stelle | Inhalt |
|---|---|---|
| `website/js/suggestion-list.js` | `initVorschlagsliste()` | Klick/Input/Blur/keydown, Pfeile, Enter, Escape, Debounce, `statisch`, `groesse`, `hole`, `beiWahl` |
| `website/js/address.js` | `renderUniversalSuggestions()` | **einziger** Renderer für Ortslisten; Optionen `nurOrte`, `beiWahl` |
| `website/js/address.js` | `zeichneAbsender()` | 30-Zeilen-Wrapper auf den Renderer (vorher 90 Zeilen Kopie) |
| `website/js/salutation.js` | `SalutationEngine#initVarianten()` | `statisch: true` — Anrede-Liste flackert nicht beim Tippen |

### B. Anrede-Varianten und Farben

| Datei | Stelle | Inhalt |
|---|---|---|
| `website/js/salutation.js` | `salutationVarianten()` | 2/1/2 Formen (formal/politisch-„höflich"/locker), ohne Namen 4 allgemeine |
| `website/js/salutation.js` | `ton` im Rückgabewert | Farbgruppe = Tonalität |
| `website/css/sidebar.css` | `#anrede-vorschlaege li[data-gruppe]` | formal blau `255°` → höflich violett `320°` → locker rot `25°`, 18 % Fläche |

### C. Ortsliste gruppiert (Berlin-Chaos)

| Datei | Stelle | Inhalt |
|---|---|---|
| `website/js/address-data.js` | `lookupCityPlzs()` | Stadtteile als Block (Reihenfolge = kleinste PLZ), PLZ **ohne** Stadtteil ans Ende; `"Großempfänger"` zählt als „ohne" |

### D. Blatt (DIN A4) ist das Bezugssystem, nicht das Fenster

| Datei | Stelle | Inhalt |
|---|---|---|
| `website/js/suggestion-list.js` | `satzspiegelHoehe()`, `klemmeAnSatzspiegel()`, `BLATTRAND_PX = 76` | Höhe bis 20 mm vor Unterkante **der ersten Seite** (`#kern` bei Mehrseiten = Multicol über alle Seiten → darum `top + width × 297/210`) |
| `website/css/sidebar.css` | `#plz-suggestions-popover`, `#anrede-vorschlaege`, `#strasse-vorschlaege` | `max-width: 165 mm` (210 − 25 − 20), Fallback-Höhe 165 mm |
| `website/css/sidebar.css` | `body:has(#absender-ort:focus) …`, `#strasse-vorschlaege`, `body:has(#empfaenger-strasse:focus) …` | Infoblock-Felder rechtsbündig (`right: anchor(right)`), Empfänger-Straße linksbündig |
| `website/css/sheet-multipage.css` | `:root:has(#btn-rand-u-30:checked)` | `--rand-u: 30mm` rein per CSS |
| `website/js/settings.js` | `applySettings()` | setzt keinen Inline-Wert mehr, gibt `boot.js` per `removeProperty()` ab |

### E. Geoapify: eine Straßensuche für beide Felder + Ringspeicher

| Datei | Stelle | Inhalt |
|---|---|---|
| `website/js/address.js` | `strassenSuchPfad()`, `STRASSEN_BIAS` | `type=street`, `limit=8`, `filter=countrycode:de` (gemessen 1751 ms → 536 ms) |
| `website/js/address.js` | `holeStrassen()`, `initStrasse()` | ein Abruf für `absender-strasse` **und** `empfaenger-strasse`; AbortController; 180 ms Debounce; leere Ergebnisse werden abgelegt |
| `website/js/address.js` | `cacheHole()`, `cacheSetze()`, `mapHole/mapSetze` | Session-Map + Ring; Straßentreffer als `[street, hausnr, plz, ort, land]` (9,8 KB → 0,4 KB) |
| `website/js/geo-cache.js` | **neu** — `geoCacheHole/Setze/Zaehle/Nutzung/Groesse/Leeren/Hash/Flush` | Ring 1 MB, FNV-1a, Index `{h,b,l,t,n}`, LFU-Verdrängung |
| `website/index.html` | `#strasse-vorschlaege` | ein Popover für beide Felder |

---

## 2. Invarianten (nicht brechen — jede ist ein gemessener Fix)

1. **Öffnen per `click`, nicht `focus`.** Ein Klick löst `focus` aus und gilt für
   `popover=auto` als „außerhalb" → Liste blitzte auf und schloss wieder.
2. **`statisch: true` nur für die Anrede.** Bei datengetriebenen Listen (Straße)
   muss beim Tippen neu gebaut werden, sonst bleiben die Treffer des ersten
   Buchstabens stehen (gemessen: 0 Abrufe nach „Haupt" + „strasse").
3. **`replaceChildren` nur, wenn sich der Inhalt wirklich ändert** — sonst
   schrumpft das Popover auf Höhe 0 (das war das „Flackern").
4. **Hover ist kein Zustand:** `blur`/Tab schließt; keine Vorauswahl ohne Interaktion.
5. **Nichts verlässt das Blatt:** Breite ≤ 165 mm, Unterkante ≤ 20 mm über Blattkante,
   Infoblock-Listen wachsen nach innen. Fenster ist **kein** Bezug.
6. **Zähler nur bei Übernahme** (`beiWahl`, `selectSuggestion`), nie beim Suchen.
7. **Kein IndexedDB für strukturierte Daten** (A34) → Ring liegt im `localStorage` (S1).
8. **Kein `Date.now()`** im Produktcode (A48) → Reihenfolge-Zähler.
9. **Kein `<link rel="preconnect">` im HTML** (A38) → nur per JS (`waermeVerbindungVor`).
10. **`Infinity` verboten** → `Number.POSITIVE_INFINITY`.

---

## 2b. Review-Unterlage (Stand nach 37 Commits)

`docs/meta/REVIEW-anrede-dropdown.md` ist die vollständige Liste aller
angefassten Stellen: Datei → Funktion → Änderung → **Risiko** → Prüfung,
dazu die heißen Stellen, Klickketten und Sollwerte im Browser.

Im Code markieren `@review 2026-11-22`-Kommentare die Stellen, an denen ein
späterer Eingriff leicht etwas kaputt macht:

```bash
grep -rn "@review 2026-11-22" website/ | cut -d: -f1 | sort | uniq -c
```

## 3. Verifikation (jeder Punkt in < 1 min)

```bash
npm run check                      # Biome, 35 Dateien
npm test                           # 410/410
node test/corpus/run.js            # 76 ok, 0 fail, 4 known
npm run check:antipatterns         # 51 Regeln, 0 Verstöße
node tools/build_db.js -q          # Fitness 100.0 % (clean)
```

Im Browser (CDP `:9222`, Seite `http://127.0.0.1:8088/index.html`):

```js
// Ring: Belegung, Zähler
const c = await import('/js/geo-cache.js');
c.geoCacheGroesse();                       // {eintraege, bytes, maxBytes:1048576, gewaehlt}
c.geoCacheNutzung('strasse:hauptstr');     // 0 = nie übernommen

// Geometrie: alles im Blatt?
const b = document.querySelector('din-blatt').getBoundingClientRect();
const mm = 210 / b.width;                  // Popover-Rechteck prüfen
```

Sollwerte: Empfänger-Liste 25…190 mm · Absender-Liste 110,6…190 mm ·
Unterkante 274,7 mm · `maxWidth` 165 mm.

---

## 4. Offen / bewusst nicht gebaut

| Punkt | Status |
|---|---|
| Merge nach `main` | **offen** — Entscheidung liegt beim User |
| Präfix-Trick (Treffer von „Haupt" sofort zeigen, während „Hauptstr" lädt) | nicht gebaut (~15 Zeilen) |
| Anrede „höflich" hat nur **eine** Form | im Deutschen kaum echte Varianten |
| Sidebar-Listen (Anschrift-Suche, Zwischenablage) | bewusst weiter am Fenster, nicht am Blatt (sie liegen nicht darauf) |
| Datenfehler `60651`/`60652` (Bundesland NW, Ort Frankfurt) | bekannte Altlast |
| Ortsteil-Lücke: 303 von 10.184 PLZ | Backlog-Kandidat |

## 5. Wo die Begründungen stehen

- `docs/meta/DECISION-LOG.md` — 5 Einträge vom 2026-11-22 (Blattbezug, `--rand-u` per CSS, Ring/LFU, Negative-Cache, Renderer-Zusammenlegung)
- `docs/css/ADR-CSS.md` — Regel „Höhe der Vorschlagslisten" + Anchor-Positionierung
- `docs/meta/AUFGABEN-WEGWEISER.md` — `suggestion-list.js`, `geo-cache.js` sind eingetragen

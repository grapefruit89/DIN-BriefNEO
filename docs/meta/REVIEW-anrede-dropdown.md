---
id: review-anrede-dropdown
title: "REVIEW: experiment/anrede-dropdown — alle angefassten Stellen, Risiken, Prüfungen"
type: meta
status: active
created: '2026-11-22'
updated: '2026-11-22'
tags:
  - din-briefneo
  - din-briefneo/meta
  - status/active
  - type/review
doc_links:
  - BRANCH-anrede-dropdown
  - DECISION-LOG
  - ADR-CSS
code_links:
  - website/js/suggestion-list.js
  - website/js/geo-cache.js
  - website/js/debug-panel.js
  - website/js/address.js
  - website/js/salutation.js
  - website/css/sidebar.css
depends_on: []
---

# REVIEW — `experiment/anrede-dropdown`

> **Zweck.** Jede angefasste Stelle, ihr Risiko und der Nachweis, mit dem man sie
> prüft. Für den nächsten Agenten (oder ein Review): erst die heißen Stellen,
> dann die Tabellen. Zeilennummern sind Stand `e214286` und driften — die
> **Funktionsnamen** sind stabil.

**Lage:** Branch `experiment/anrede-dropdown`, Basis `main` = `052ac5b`,
**37 Commits**, 29 Dateien, +2712/−387. `main` ist unberührt.

```bash
git log --oneline main..HEAD | wc -l     # 37
git diff --stat main...HEAD | tail -1    # 29 Dateien
```

**Gate (alles muss grün sein):**

```bash
npm run check                   # Biome, 36 Dateien
npm test                        # 416/416
node test/corpus/run.js         # 76 ok, 0 fail, 4 known
npm run check:antipatterns      # 56 Regeln, 0 blockierend
node tools/build_db.js -q       # Fitness 100.0 % (clean)
```

---

## 0. Die fünf heißesten Stellen (zuerst prüfen)

| # | Stelle | Warum heiß | Prüfung |
|---|---|---|---|
| 1 | `website/js/address.js` → `holeMitFailover`, `cacheHole`, `cacheSetze` | Netz, Cache und Straßensuche in einer Datei umgebaut (−199/+495 Zeilen) | „Bonn" in beide Straßenfelder tippen; Auswahl setzt Straße **und** PLZ/Ort |
| 2 | `website/js/geo-cache.js` → `verdraenge`, `geoCacheZaehle` | LFU-Verdrängung; falsch = heißer Eintrag fliegt | Test „LFU: gewählter Begriff überlebt" + `geoCacheGroesse()` |
| 3 | `website/js/suggestion-list.js` → `initVorschlagsliste` | Bedien-Gerüst für **alle** Listen (Klick, Tasten, Blur, Untrusted-Guard) | Anrede, Straße, Gruß: öffnen, Pfeile, Enter, Escape, Tab |
| 4 | `website/css/sidebar.css` → `:is(...)`-Sammelselektoren | Neue Popover **müssen** dort eingetragen werden, sonst sitzen sie zentriert im Fenster | `#gruss-vorschlaege` öffnen: 25…190 mm, nicht 114…279 mm |
| 5 | `website/js/salutation.js` → `salutationVarianten`, `#initGruesse` | 5–6 Varianten je Empfänger, 3×3 Grüße, klebriger Override | Klickkette (unten, Abschnitt 2) |

---

## 1. JavaScript — Datei für Datei

### `website/js/suggestion-list.js` (neu, 294 Zeilen)

| Stelle | Änderung | Risiko | Prüfung |
|---|---|---|---|
| `satzspiegelHoehe` / `klemmeAnSatzspiegel` | Höhe bis 20 mm vor Blatt-Unterkante; `anchor()` ist in `max-height` nicht erlaubt (gemessen) | mittel | Liste mit 39 Einträgen: Unterkante ≈ 274,7 mm |
| `initVorschlagsliste` | ein Gerüst für Anrede, Straße, Gruß; `statisch`, `gruesse`, `hole`, `beiWahl`, `verzoegerung` | hoch | jede Liste per Tastatur bedienbar |
| `beiEingabe` | öffnet nur bei `InputEvent` **mit** `inputType` (Testbrief blitzte sonst) | mittel | Testbrief-Klick → 0 `toggle open` |

### `website/js/geo-cache.js` (neu, 297 Zeilen)

| Stelle | Änderung | Risiko | Prüfung |
|---|---|---|---|
| `geoCacheSetze` / `geoCacheHole` | Ring 1 MB im `localStorage` (S1), FNV-1a, Kollisionsschutz über Schlüssellänge | hoch | `geoCacheGroesse()` im Debug-Panel |
| `verdraenge` | LFU: `n` aufsteigend, dann Alter | hoch | Test „LFU: gewählter Begriff überlebt" |
| `geoCacheZaehle` | zählt **nur** die Übernahme ins Feld (Admission) | mittel | suchen ohne Auswahl → `geoCacheNutzung()` bleibt 0 |
| `geoCacheFlush` | Index verzögert (400 ms) + `pagehide` | niedrig | Reload → Treffer bleiben |

### `website/js/address.js` (495/387 Zeilen umgebaut)

| Stelle | Änderung | Risiko | Prüfung |
|---|---|---|---|
| `renderUniversalSuggestions` | **einziger** Ortslisten-Renderer (Empfänger + Absender), Optionen `nurOrte`/`beiWahl` | hoch | beide Ortfelder: gleiche Optik, Absender ohne Firmen |
| `zeichneAbsender` | 30-Zeilen-Wrapper, vorher 90 Zeilen Kopie | mittel | Absender-Liste rechtsbündig 110,6…190 mm |
| `holeStrassen`, `initStrasse` | ein Abruf für beide Straßenfelder; `type=street`, `limit=8`, AbortController, 180 ms | hoch | Tippen „Hauptstr" → 4 Treffer, Auswahl setzt Straße + PLZ/Ort |
| `strassenSuchPfad` | reine Funktion (testbar), `STRASSEN_BIAS` Bonn | niedrig | Test „fragt nur Straßen in Deutschland" |
| `cacheHole` / `cacheSetze` | zwei Ebenen: Session-Map + Ring; Straßentreffer als Zeilen (9,8 KB → 0,4 KB) | hoch | 2. Suche desselben Begriffs: 0 Abrufe |
| `spiegelEntscheidung` | unverändert, aber Kommentar „derived state mit klebrigem Override" | niedrig | Rücksendezeile bei Handedit bleibt stehen |
| Eingabe-Guards (`empfOrtEl`, `empfFirmaEl`, `absOrtEl`) | `inputType`-Guard gegen synthetische Events | mittel | Testbrief → keine Liste; Tastatur → Liste |

### `website/js/salutation.js` (212 Zeilen)

| Stelle | Änderung | Risiko | Prüfung |
|---|---|---|---|
| `salutationVarianten(name, firma, stunde)` | 5 Varianten mit Person, 5 mit Firma (Team-Formen), 3–4 ohne alles; Dedupe ohne Satzzeichen | hoch | Klickliste unten |
| `tageszeitGruss(stunde)` | reine Funktion, 5–10 Morgen / 11–17 Tag / 18–4 Abend | niedrig | Test „Morgen 5-10, Tag 11-17, Abend 18-4" |
| `#initGruesse` | Grußfeld als Dropdown, 3 Formen der aktuellen Tonalität | mittel | Klick ins Grußfeld → 3 Einträge in Gruppenfarbe |
| `#uebernehme` | setzt Stil → Gruß zieht nach; `userSet` bleibt | mittel | Klickkette unten |
| `ALLE_GRUESSE` | `#seedAuto` erkennt alle neun Grüße als „automatisch" | niedrig | Reload behält „Viele Grüße" als automatisch |

### Weitere JS-Dateien

| Datei / Stelle | Änderung | Risiko |
|---|---|---|
| `address-data.js` → `lookupCityPlzs` | Stadtteile als Block, PLZ ohne Stadtteil nach unten (`NULLS LAST`) | mittel — 11 Städte betroffen |
| `format.js` → `aktuelleStunde` | zoneiert via `Temporal` (A50), eine Stelle für die Uhr | niedrig |
| `settings.js` → `applySettings` | setzt `--rand-u` nicht mehr inline, gibt den Boot-Wert frei | mittel (Unterrand-Schalter) |
| `boot.js` | Kommentar: bleibt Pre-Paint-Snapshot | niedrig |
| `main.js` → `initApp` | `?debug` → dynamischer Import; Druckzähler in `beforeprint` | niedrig |
| `debug-panel.js` (neu, 169 Zeilen) | Selbstauskunft, liest nur vorhandene APIs | niedrig |

---

## 2. Klickketten zum Nachstellen (Browser, `:8088`)

**Anrede + Gruß**

```
Empfänger „Frau Lara Croft" eintragen
→ Anrede-Feld KLICKEN
   6 Varianten: Sehr geehrte / Sehr verehrte / Guten Tag / [Guten Morgen|Abend] / Hallo / Liebe Frau Croft
→ „Sehr geehrte Frau Croft," wählen   → Gruß wird „Mit freundlichen Grüßen"
→ „Liebe Frau Croft," wählen          → Gruß wird „Beste Grüße"
→ Grußfeld klicken, „Herzliche Grüße" wählen
→ Anrede auf formell                  → Gruß bleibt „Herzliche Grüße"  (klebrig)
```

**Nur Firma**

```
Empfänger-Name leeren, Firma „Croft Holdings GmbH"
→ Anrede-Feld klicken: Sehr geehrte Damen und Herren, / Sehr geehrtes Team der Croft Holdings GmbH, /
  Guten Tag, / Guten Tag zusammen, / Hallo zusammen,
```

**Orte + Straßen**

```
Ort „Berlin" → 179 Zeilen, 17 Stadtteil-Blöcke, danach 114 ohne Stadtteil
Ort „Bonn"   → 39 Zeilen, beginnt mit „53111 Bonn · Zentrum"
Straße „Hauptstr" → 4 Treffer; Auswahl setzt Straße + „53229 Bonn"
```

**Geometrie (jede Liste im Blatt)**

```
Empfänger-Liste  25 … 190 mm
Absender-Liste  110,6 … 190 mm
Gruß-Liste       25 … 190 mm, Unterkante ≈ 192 mm
Unterkante aller langen Listen: 274,7 mm (= 297 − 20 − 2,3)
```

**Testbrief (darf nichts aufblitzen)**

```
Knopf „Testbrief" → 0 toggle-open auf allen vier Popovern
```

---

## 3. CSS — was wo

| Datei | Stelle | Änderung |
|---|---|---|
| `sidebar.css` | `:is(#anschrift-vorschlaege, #plz-suggestions-popover, #strasse-vorschlaege, #anrede-vorschlaege, #gruss-vorschlaege)` | **Pflichtliste**: Position, Glas-Look, Zeilen-Regeln. Neue Popover hier eintragen, sonst UA-Defaults |
| `sidebar.css` | `#anrede-vorschlaege`, `#gruss-vorschlaege` | 165 mm Breite, Gruppenfarben (`--ton-*`), Hover mit Ton-Rahmen |
| `sidebar.css` | `body:has(#absender-ort:focus) #plz-suggestions-popover`, `#strasse-vorschlaege` | rechtsbündig (110,6…190 mm), wächst nach innen |
| `sidebar.css` | `body:has(#empfaenger-strasse:focus) #strasse-vorschlaege` | linksbündig fürs Anschriftfeld |
| `sidebar.css` | `.key-zeile` | „Geoapify API-Key: hier erstellen" in einer Zeile |
| `base.css` | Block „2c. FARB-ROLLEN & LISTENPALETTE" | 40 Rollen-Tokens + 21 `--ort-ton-*`; **kein** roher Farbwert mehr in Regeln |
| `sheet-multipage.css` | `:root:has(#btn-rand-u-30:checked)` | Unterrand 30 mm rein per CSS |

---

## 4. Regeln & Daten (Gates)

| Datei | Änderung |
|---|---|
| `docs/norm/Immutable-Law-Catalog.md` | **A65** (eval/Function/String-Timer/insertAdjacentHTML/document.write), **A66** (Fremdbibliotheken), **A67** (CommonJS/Bundler), **A68** (alert/confirm/prompt); A48 um `.getTime()` |
| `tools/antipatterns/web.json` | Regeln W8–W11 (Version 1.2.0) |
| `tools/antipatterns/base.json` | B2-Pattern um `.getTime()` |
| `docs/meta/ID-REGISTER.md` | A1–A68, W2–W11 |
| `test/all.js` | +376 Zeilen: Stadtteil-Gruppierung, 3×3-Grüße, Tageszeit, DIN-Zeichensetzung, Team-Formen, Geo-Cache (Hash, Verdrängung, Negative-Cache) |

---

## 5. Bewusst **nicht** angefasst

- **PLZ-Datenpipeline** (`tools/build_plz_data.mjs`): unverändert, `--neu`-Semantik intakt.
- **Ortsdaten** (`website/data/orte.json.gz`): unverändert (10.184 PLZ).
- **Druck-Geometrie** außer den Farb-Tokens und `--rand-u`.
- **Mehrseiten-Umbruch** (`multipage-controller.js`): unverändert.
- **Sidebar-Listen** (Anschrift-Suche, Zwischenablage): bleiben am Fenster, nicht am Blatt (liegen nicht auf dem Papier).

## 6. Offene Entscheidungen (nicht im Code)

| Punkt | Stand |
|---|---|
| Merge nach `main` | offen — Entscheidung des Users |
| Präfix-Trick (Treffer von „Haupt" sofort, während „Hauptstr" lädt) | nicht gebaut (~15 Zeilen) |
| Grußformeln je Tonalität auch *zwischen* den Gruppen anbieten? | bewusst nein: 3×3 bleibt |
| `targetLock` kapseln (sticky search context) | Kandidat aus dem Review |
| Logging mit Modul-Präfix (36 stille `catch`) | Kandidat aus dem Review |

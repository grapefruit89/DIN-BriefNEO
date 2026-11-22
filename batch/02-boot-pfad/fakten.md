# Fakten zum Boot-Pfad

**Erzeugt von `tools/batch-facts.mjs` — nicht von Hand bearbeiten.**
`node tools/batch-facts.mjs --check` bricht ab, wenn dieses Blatt nicht mehr
zum Quelltext passt. Alle Zeilennummern sind aus den Dateien gelesen.

## 1. Ladereihenfolge

| Zeile in `index.html` | Typ | Quelle |
|---|---|---|
| 36 | klassisch | `js/boot.js?v=boot2` |
| 37 | Modul (deferred) | `js/main.js?v=live6` |
| 471 | klassisch | `js/boot-state.js?v=bs2` |

Klassische Skripte blockieren den Parser; Module laufen nach dem Parse.

Gezählt werden **Aufrufstellen**, nicht Ausführungen: der Helfer `lies()` in
`boot-state.js` hat eine Aufrufstelle und läuft zweimal (`din_settings`,
`din_draft_current`). Genau diese Verwechslung machte das handgetippte Blatt
falsch („2× JSON.parse", tatsächlich 3). Mit `boot-values.js` importiert der
Wert-Writer; die Zahl der Aufrufstellen bleibt davon unberuehrt.

## 2. Schreibzugriffe in `boot.js`

108 Zeilen · 10 Schreibzugriffe · 2× `JSON.parse` (Aufrufstellen)

| Zeile | Art | Ziel | Quelle |
|---:|---|---|---|
| 24 | setAttribute | `data-booting` | `root.setAttribute('data-booting', 'true');` |
| 60 | setAttribute | `data-theme` | `root.setAttribute('data-theme', theme);` |
| 61 | setAttribute | `data-layout` | `root.setAttribute('data-layout', layout);` |
| 62 | setAttribute | `data-marks` | `root.setAttribute('data-marks', istAn(settings.marks) ? 'true' : 'false');` |
| 63 | setAttribute | `data-plugin-testbrief` | `root.setAttribute('data-plugin-testbrief', istAn(settings.pluginTestbrief) ? 'true' : 'fal` |
| 67 | setAttribute | `data-plugin-geschaeftsangaben` | `root.setAttribute('data-plugin-geschaeftsangaben', pluginGeschaeftAktiv ? 'true' : 'false'` |
| 72 | setAttribute | `data-plugin-multipage` | `root.setAttribute('data-plugin-multipage', 'true');` |
| 90 | setAttribute | `data-anlagen` | `root.setAttribute('data-anlagen', hatAnlagen ? 'true' : 'false');` |
| 91 | setAttribute | `data-fuss` | `root.setAttribute('data-fuss', hatFuss ? 'true' : 'false');` |
| 97 | style.setProperty | `--rand-u` | `root.style.setProperty('--rand-u', `${randU}mm`);` |

## 2. Schreibzugriffe in `boot-state.js`

194 Zeilen · 15 Schreibzugriffe · 1× `JSON.parse` (Aufrufstelle)

| Zeile | Art | Ziel | Quelle |
|---:|---|---|---|
| 35 | mark | `seeder-start` | `if (typeof performance !== 'undefined' && performance.mark) performance.mark('seeder-start` |
| 61 | checked | `—` | `if (radio) radio.checked = true;` |
| 65 | checked | `—` | `if (marks) marks.checked = istAn(settings.marks);` |
| 75 | value | `—` | `stil.value = String(settings.formality);` |
| 79 | value | `—` | `schrift.value = String(settings.previewFont);` |
| 82 | checked | `—` | `if (randU) randU.checked = settings.randU === 30;` |
| 84 | checked | `—` | `if (testbrief) testbrief.checked = istAn(settings.pluginTestbrief);` |
| 86 | checked | `—` | `if (geschaeft) geschaeft.checked = settings.pluginGeschaeftsangaben === true;` |
| 99 | value | `—` | `feld.value = vermerk;` |
| 104 | value | `—` | `if (auswahl && [...auswahl.options].some((o) => o.value === vermerk)) auswahl.value = verm` |
| 112 | checked | `—` | `if (box) box.checked = draft[id] === true \|\| draft[id] === 'true';` |
| 143 | value | `—` | `el.value = el.id === 'vermerke' ? wert.trim() : wert;` |
| 148 | replaceChildren | `—` | `el.replaceChildren(...geparst.body.childNodes);` |
| 160 | value | `—` | `datum.value = Temporal.Now.zonedDateTimeISO('Europe/Berlin')` |
| 185 | mark | `applied` | `if (typeof performance !== 'undefined' && performance.mark) performance.mark('applied');` |

## 2. Schreibzugriffe in `main.js`

317 Zeilen · 3 Schreibzugriffe · 0× `JSON.parse` (Aufrufstellen)

| Zeile | Art | Ziel | Quelle |
|---:|---|---|---|
| 33 | value | `—` | `if (sel && sel.value !== val) sel.value = val;` |
| 57 | setAttribute | `role` | `box.setAttribute('role', 'alert');` |
| 208 | mark | `ready` | `if (typeof performance !== 'undefined' && performance.mark) performance.mark('ready');` |

## 3. Lifecycle-Marker im CSS

Seit D2 gibt es genau EINEN Marker: `data-booting`. `boot.js` setzt ihn vor
dem ersten Frame, der Wert-Writer entfernt ihn (oder das 1800-ms-Netz). Die
frueheren Zwei-Marker-Modelle (Zustand + Freigabe) sind ersetzt.

| Marker | Treffer in CSS |
|---|---:|
| `data-booting` | 12 |

| Datei | Zeile | Regel |
|---|---:|---|
| `base.css` | 49 | `:root[data-booting="true"] #app-shell {` |
| `base.css` | 53 | `:root[data-booting="true"] *,` |
| `base.css` | 54 | `:root[data-booting="true"] *::before,` |
| `base.css` | 55 | `:root[data-booting="true"] *::after {` |
| `sheet-common.css` | 66 | `:root:not([data-booting="true"]) #rucksendeangabe,` |
| `sheet-common.css` | 67 | `:root:not([data-booting="true"]) #anschriftfeld,` |
| `sheet-common.css` | 68 | `:root:not([data-booting="true"]) #infoblock,` |
| `sheet-common.css` | 69 | `:root:not([data-booting="true"]) #kern,` |
| `sheet-common.css` | 70 | `:root:not([data-booting="true"]) din-falzmarke-1,` |
| `sheet-common.css` | 71 | `:root:not([data-booting="true"]) din-falzmarke-2 {` |
| `sheet-common.css` | 75 | `:root:not([data-booting="true"]) #spacer {` |
| `sidebar.css` | 741 | `base.css alle Uebergaenge bis zum Boot-Ende (`data-booting`), und der` |

## 4. Messung: wann ist die Seite sichtbar (TTC)?

Quelle: `paint-probe-2026-11-20-r5-all.json` (erzeugt von
`tools/paint-probe.mjs`, CDP, Cache aus, voller Entwurf).

| Profil | Läufe | `applied` vor Paint | TTC Median | TTC max | sichtbar < 2 s | Paint (Median) |
|---|---:|---:|---:|---:|---:|---:|
| local | 5 | 5/5 | 49 | 56 | 5/5 | 60 |
| cpu6 | 5 | 5/5 | 74 | 112 | 5/5 | 120 |
| slow | 5 | 0/5 | 1222 | 1230 | 5/5 | 968 |

Lesart: TTC ist die Zeit bis `applied` (Maske weg). Werte stehen per
Konstruktion VOR dem Reveal; ein Wert nach dem Paint ist kein FOUC mehr,
sondern ein Fehler im Wert-Writer.

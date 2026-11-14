# Fakten zum Boot-Pfad

**Erzeugt von `tools/batch-facts.mjs` — nicht von Hand bearbeiten.**
`node tools/batch-facts.mjs --check` bricht ab, wenn dieses Blatt nicht mehr
zum Quelltext passt. Alle Zeilennummern sind aus den Dateien gelesen.

## 1. Ladereihenfolge

| Zeile in `index.html` | Typ | Quelle |
|---|---|---|
| 36 | klassisch | `js/boot.js?v=boot2` |
| 37 | Modul (deferred) | `js/main.js?v=live6` |
| 458 | klassisch | `js/boot-state.js?v=bs2` |

Klassische Skripte blockieren den Parser; Module laufen nach dem Parse.

Gezählt werden **Aufrufstellen**, nicht Ausführungen: der Helfer `lies()` in
`boot-state.js` hat eine Aufrufstelle und läuft zweimal (`din_settings`,
`din_draft_current`). Genau diese Verwechslung machte das handgetippte Blatt
falsch („2× JSON.parse", tatsächlich 3).

## 2. Schreibzugriffe in `boot.js`

87 Zeilen · 7 Schreibzugriffe · 1× `JSON.parse` (Aufrufstelle)

| Zeile | Art | Ziel | Quelle |
|---:|---|---|---|
| 47 | setAttribute | `data-theme` | `root.setAttribute('data-theme', theme);` |
| 48 | setAttribute | `data-layout` | `root.setAttribute('data-layout', layout);` |
| 49 | setAttribute | `data-marks` | `root.setAttribute('data-marks', istAn(settings.marks) ? 'true' : 'false');` |
| 50 | setAttribute | `data-plugin-testbrief` | `root.setAttribute('data-plugin-testbrief', istAn(settings.pluginTestbrief) ? 'true' : 'fal` |
| 55 | setAttribute | `data-plugin-multipage` | `root.setAttribute('data-plugin-multipage', 'true');` |
| 68 | style.setProperty | `--rand-u` | `root.style.setProperty('--rand-u', `${randU}mm`);` |
| 80 | dataset | `ready` | `if (!root.dataset.ready) root.dataset.ready = 'true';` |

## 2. Schreibzugriffe in `boot-state.js`

186 Zeilen · 16 Schreibzugriffe · 1× `JSON.parse` (Aufrufstelle)

| Zeile | Art | Ziel | Quelle |
|---:|---|---|---|
| 35 | mark | `seeder-start` | `if (typeof performance !== 'undefined' && performance.mark) performance.mark('seeder-start` |
| 61 | checked | `—` | `if (radio) radio.checked = true;` |
| 65 | checked | `—` | `if (marks) marks.checked = istAn(settings.marks);` |
| 75 | value | `—` | `stil.value = String(settings.formality);` |
| 79 | value | `—` | `schrift.value = String(settings.previewFont);` |
| 82 | checked | `—` | `if (randU) randU.checked = settings.randU === 30;` |
| 84 | checked | `—` | `if (testbrief) testbrief.checked = istAn(settings.pluginTestbrief);` |
| 92 | setAttribute | `data-gesetzt` | `liste.setAttribute('data-gesetzt', wahl.value !== '' ? 'true' : 'false');` |
| 100 | value | `—` | `feld.value = vermerk;` |
| 105 | value | `—` | `if (auswahl && [...auswahl.options].some((o) => o.value === vermerk)) auswahl.value = verm` |
| 113 | checked | `—` | `if (box) box.checked = draft[id] === true \|\| draft[id] === 'true';` |
| 140 | value | `—` | `el.value = wert;` |
| 145 | replaceChildren | `—` | `el.replaceChildren(...geparst.body.childNodes);` |
| 157 | value | `—` | `datum.value = Temporal.Now.zonedDateTimeISO('Europe/Berlin')` |
| 177 | mark | `seeded` | `if (typeof performance !== 'undefined' && performance.mark) performance.mark('seeded');` |
| 178 | setAttribute | `data-seeded` | `document.documentElement.setAttribute('data-seeded', 'true');` |

## 2. Schreibzugriffe in `main.js`

366 Zeilen · 6 Schreibzugriffe · 0× `JSON.parse` (Aufrufstellen)

| Zeile | Art | Ziel | Quelle |
|---:|---|---|---|
| 30 | setAttribute | `data-gesetzt` | `if (sel.getAttribute('data-gesetzt') !== wert) sel.setAttribute('data-gesetzt', wert);` |
| 45 | value | `—` | `if (sel && sel.value !== val) sel.value = val;` |
| 69 | setAttribute | `role` | `box.setAttribute('role', 'alert');` |
| 188 | mark | `ready` | `if (typeof performance !== 'undefined' && performance.mark) performance.mark('ready');` |
| 189 | dataset | `ready` | `document.documentElement.dataset.ready = 'true';` |
| 266 | value | `—` | `anlagenEl.value = 'Anlage 1';` |

## 3. Marker im CSS

`data-seeded` und `data-ready` sind keine Dubletten: `seeded` heisst „Zustand
steht", `data-ready` heisst „Booten fertig oder aufgegeben (2-s-Timer in
`boot.js`)". Die Messung in §4 zeigt, wie weit die beiden auseinanderliegen.

| Marker | Treffer in CSS |
|---|---|
| `data-seeded` | 18 |
| `data-ready` | 15 |

### `data-seeded`

| Datei | Zeile | Regel |
|---|---:|---|
| `base.css` | 46 | `:root:not([data-seeded="true"]):not([data-ready="true"]) *,` |
| `base.css` | 47 | `:root:not([data-seeded="true"]):not([data-ready="true"]) *::before,` |
| `base.css` | 48 | `:root:not([data-seeded="true"]):not([data-ready="true"]) *::after {` |
| `sheet-common.css` | 66 | `:root[data-seeded="true"] #rucksendeangabe,` |
| `sheet-common.css` | 67 | `:root[data-seeded="true"] #anschriftfeld,` |
| `sheet-common.css` | 68 | `:root[data-seeded="true"] #infoblock,` |
| `sheet-common.css` | 69 | `:root[data-seeded="true"] #kern,` |
| `sheet-common.css` | 70 | `:root[data-seeded="true"] din-falzmarke-1,` |
| `sheet-common.css` | 71 | `:root[data-seeded="true"] din-falzmarke-2 {` |
| `sheet-common.css` | 75 | `:root[data-seeded="true"] #spacer {` |
| `sheet-common.css` | 652 | `Anker ist `data-seeded`, nicht `data-ready` (B70, gemessen 2026-11-14):` |
| `sheet-common.css` | 655 | `im langsamen Netz in 30 von 30 (bis 1,9 s spaeter). `data-seeded` ist der` |
| `sheet-common.css` | 661 | `:root:not([data-seeded="true"]):not([data-ready="true"]) & [data-placeholder]:empty::before,` |
| `sheet-common.css` | 662 | `:root:not([data-seeded="true"]):not([data-ready="true"]) & [contenteditable][data-placeholder]:empty` |
| `sheet-common.css` | 666 | `:root:not([data-seeded="true"]):not([data-ready="true"]) & textarea[data-feldtyp]::placeholder,` |
| `sheet-common.css` | 667 | `:root:not([data-seeded="true"]):not([data-ready="true"]) & input[data-atom]::placeholder {` |
| `sidebar.css` | 616 | `:root:not([data-seeded="true"]):not([data-ready="true"]) #seitenleiste-postvermerk-select,` |
| `sidebar.css` | 617 | `:root:not([data-seeded="true"]):not([data-ready="true"]) #seitenleiste input[switch] {` |

### `data-ready`

| Datei | Zeile | Regel |
|---|---:|---|
| `base.css` | 46 | `:root:not([data-seeded="true"]):not([data-ready="true"]) *,` |
| `base.css` | 47 | `:root:not([data-seeded="true"]):not([data-ready="true"]) *::before,` |
| `base.css` | 48 | `:root:not([data-seeded="true"]):not([data-ready="true"]) *::after {` |
| `sheet-common.css` | 652 | `Anker ist `data-seeded`, nicht `data-ready` (B70, gemessen 2026-11-14):` |
| `sheet-common.css` | 653 | ``data-ready` kommt erst am Ende von initApp und lag in 21 von 30 lokalen` |
| `sheet-common.css` | 658 | ``data-ready` bleibt als Netz: faellt der Seeder aus, setzt boot.js es nach` |
| `sheet-common.css` | 661 | `:root:not([data-seeded="true"]):not([data-ready="true"]) & [data-placeholder]:empty::before,` |
| `sheet-common.css` | 662 | `:root:not([data-seeded="true"]):not([data-ready="true"]) & [contenteditable][data-placeholder]:empty` |
| `sheet-common.css` | 666 | `:root:not([data-seeded="true"]):not([data-ready="true"]) & textarea[data-feldtyp]::placeholder,` |
| `sheet-common.css` | 667 | `:root:not([data-seeded="true"]):not([data-ready="true"]) & input[data-atom]::placeholder {` |
| `sidebar.css` | 608 | `data-ready fest (boot.js setzt es am Ende von initApp, Sicherheitsnetz nach` |
| `sidebar.css` | 613 | `data-ready haengen: das kommt erst am Ende von initApp und liesse die Regler` |
| `sidebar.css` | 614 | `nach dem ersten Paint nachploppen. data-ready bleibt als Sicherheitsnetz,` |
| `sidebar.css` | 616 | `:root:not([data-seeded="true"]):not([data-ready="true"]) #seitenleiste-postvermerk-select,` |
| `sidebar.css` | 617 | `:root:not([data-seeded="true"]):not([data-ready="true"]) #seitenleiste input[switch] {` |

## 4. Messung: steht der Zustand vor dem ersten Paint?

Quelle: `paint-probe-2026-11-14.json` (erzeugt von
`tools/paint-probe.mjs`, CDP, Cache aus, voller Entwurf).

| Profil | Läufe | `seeded` vor Paint | `ready` vor Paint | Paint | Paint (Median) | `ready` (Median) |
|---|---:|---:|---:|---:|---:|---:|
| local | 30 | 30/30 | 14/30 | 44–100 | 64 | 65 |
| cpu6 | 30 | 11/30 | 0/30 | 108–196 | 124 | 197 |
| slow | 30 | 1/30 | 0/30 | 900–1212 | 944 | 2875 |

Lesart: `seeded` steht in allen Profilen frueher als `ready`. Im Profil `slow`
liegen **beide** nach dem Paint — der Body-End-Seeder ist dann von der
Netzlieferung abhaengig, nicht von der Parse-Reihenfolge.

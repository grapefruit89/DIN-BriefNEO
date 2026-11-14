# Fakten zum Boot-Pfad (2026-11-14)

Gemessen und gelesen, nicht geschlossen. Quellen sind die zwei angehängten
Dateien; Zahlen aus Messläufen sind als solche gekennzeichnet.

## 1. Ladereihenfolge

| Wann | Was | Zeile in `index.html` |
|---|---|---|
| `<head>`, blockierend | `<script src="js/boot.js?v=boot2">` (klassisch, kein Modul) | 36 |
| Ende `<body>` | `<script src="js/boot-state.js?v=bs2">` (klassisch) | 458 |

Beide sind **klassische** Skripte, keine Module. `boot.js` blockiert den Parser
und läuft vor dem Body; `boot-state.js` läuft nach dem Parsen, aber vor
`DOMContentLoaded`.

## 2. Was `boot.js` schreibt (79 Zeilen, `try/catch` um alles)

| Ziel | Wert | Zeile |
|---|---|---|
| `data-theme` | `auto` \| `light` \| `dark` (Whitelist) | 41 |
| `data-layout` | `form-a` \| `form-b` (Whitelist) | 42 |
| `data-marks` | `true` \| `false` | 43 |
| `data-plugin-testbrief` | `true` \| `false` | 44 |
| `data-plugin-multipage` | fest `true` (Modus stillgelegt) | 49 |
| `--rand-u` (style) | `20mm` \| `30mm` (Whitelist) | 61 |
| `data-ready` | Notfall-Timer nach 2000 ms, nur wenn nicht schon gesetzt | 72–74 |

Quelle ist `localStorage['din_settings']`, **ein** `JSON.parse` (Z. 30).

## 3. Was `boot-state.js` schreibt (143 Zeilen, IIFE)

| Ziel | Wert | Zeile |
|---|---|---|
| `#btn-form-a` / `#btn-form-b` | `checked` aus Settings | 41 |
| `#toggle-falzmarken` | `checked` aus Settings | 45 |
| `#btn-rand-u-30` | `checked` aus Settings | 62 |
| `#plugin-testbrief` | `checked` aus Settings | 64 |
| `.seitenleiste-select` | `data-gesetzt` aus dem Wert | 72 |
| `#toggle-anlagen`, `#toggle-fuss` | `checked` aus dem Entwurf | 93 |
| `data-seeded` | `true` am Ende | 139 |

Quelle sind `din_settings` **und** `din_draft_current` (zweiter `JSON.parse`).
Es werden bewusst **keine** `input`-Events gefeuert (Kommentar Z. 15–17).

## 4. Die CSS-Wächter, die an den Markern hängen

| Marker | Regeln | Zweck |
|---|---|---|
| `data-seeded` | `base.css` 3 Regeln (alles unsichtbar), `sheet-common.css` 8 Selektoren (Blattzonen), `sidebar.css` 2 Selektoren (Postvermerk-Auswahl, alle `input[switch]`) | nichts zeigen, bevor der gespeicherte Zustand steht |
| `data-ready` | `base.css` (dieselben 3 Regeln als Oder-Zweig), `sheet-common.css` 3 Regeln (Platzhalter), `sidebar.css` (Oder-Zweig) | Sicherheitsnetz, falls der Seeder ausfällt |

## 5. Messung: was steht beim ersten Paint? (12 kalte Reloads, Cache aus)

Erhoben am `Page.lifecycleEvent: firstPaint`, Abfrage direkt danach.

| Kennzahl | Ergebnis |
|---|---|
| `data-seeded` bereits `true` | **12 / 12** |
| `data-ready` bereits `true` | **12 / 12** |
| Regler sichtbar (Wächter schon offen) | **12 / 12** |
| Zeit bis `firstPaint` | 57–77 ms |

Auffällig: `data-ready` wird laut Code erst am Ende von `initApp` gesetzt (oder
nach 2 s als Notfall). In allen 12 Läufen war es **vor** dem ersten Paint
gesetzt — `initApp` lief also vollständig vor dem Paint. Der 2-Sekunden-Timer
kam nie zum Zug. Ob das eine Eigenschaft dieses Rechners (warm, lokal, ohne
Netz) ist oder allgemein gilt, ist **ungeprüft**.

## 6. Offene Fragen, die aus dem vorigen Batch übrig sind

- `sheet.css` ist nicht eingebunden (kein `<link>`, kein `@import`) — bestätigt.
- `webmcp-bridge.js` ist geparkt und absichtlich nicht geladen (Statuskopf in
  der Datei).
- `aria-pressed` wird dynamisch von `document.js` (Z. 397–399) geschrieben; die
  statischen `false`-Werte im HTML sind der Startzustand.

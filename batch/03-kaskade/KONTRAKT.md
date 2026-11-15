# Verträge zu 03-kaskade

Die Scheibe ist nach Thema geschnitten, die Kaskade hängt aber an der
Ladereihenfolge und an den Dateien davor. Alles, was von außen wirkt, steht
hier mit Rolle und Zahl — ohne den Quelltext der fremden Dateien. Beurteile,
ob die Scheibe die Naht richtig benutzt, nicht wie die fremden Dateien intern
aussehen.

Quelle: `index.html` (Ladereihenfolge) und die CSS-Kennzahlen aus
`fakten.md` §2.

## Ladereihenfolge (aus `index.html`, Zeilen 32–35)

| Reihenfolge | Datei | Zeilen | `!important` | davon print | ID-Selektoren |
|---:|---|---:|---:|---:|---:|
| 1 | `website/css/base.css` | 359 | 24 | 17 | 4 |
| 2 | `website/css/sidebar.css` | 1270 | 3 | 0 | 111 |
| 3 | `website/css/sheet-common.css` | 723 | 1 | 0 | 123 |
| 4 | `website/css/sheet-multipage.css` | 605 | 63 | 38 | 56 |

`website/css/sheet.css` wird **nicht** geladen (stillgelegt, Statuskopf in der
Datei). Sie taucht im Faktenblatt nur auf, damit die Zählung vollständig ist.

## Rollen der Dateien, die nicht im Anhang sind

| Datei | Rolle (Dateikopf) |
|---|---|
| `base.css` | Reset, Design-Tokens als Custom Properties (67), `@function`-Helfer (7), Theme über `[data-theme]`, FOUC-Sperre für Übergänge bis `data-seeded` |
| `sidebar.css` | Bedienoberfläche; Strukturvertrag des Modus-Wechsels (`:has(#modus-einstellungen:checked)`) und Optik in einer Datei |
| `sheet-common.css` | Blattgeometrie, die für beide Modi gilt; liest `[data-layout]` und `@scope (din-blatt)` |
| `index.html` | Ladereihenfolge, `<link>`-Zeilen, Skip-Link, Struktur des Blatts |

## Was diese Scheibe von außen braucht

| Was | Woher | Wirkung |
|---|---|---|
| Token-Werte (`--rand-u`, `--briefkopf-y`, `--kern-y`, …) | `base.css` | `sheet-multipage.css` rechnet damit; ohne sie sind die `calc()`-Werte nicht prüfbar |
| Druckkontext (`@page`, `page-margin-safety`) | `sheet-multipage.css` selbst | Randboxen (`@top-right` mit `counter(page)`) liegen außerhalb der Kaskade |
| Modus-Umschaltung | `sidebar.css` + `index.html` | entscheidet, welche Regeln überhaupt im Fluß sind |

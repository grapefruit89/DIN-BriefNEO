---
tags: [aviation-grade, platinum-2026, architecture, gap-healing, chrome-146]
status: cemented
version: 2.3.0
last_audit: 2026-03-21
id: CAA-008
title: Isomorphic Master Registry — Central Architectural Authority
supersedes: 08_isomorphic_schema_v2.2.0.md
authority: SUPREME über SPEC-007, index.html, logic.js, devmode.js
traceability: [BRAIN-017, BRAIN-015, ANTI-016, INCIDENT-002]
heals: [G-001 Anchor Gap alle 11 Felder, G-003 Ghost-Mirror Multi-Page, G-004 Import Validation]
baseline: Chrome 146+ — Sanitizer API, Anchor Positioning, Invoker Commands
---

# Isomorphic Master Registry (IMR) v2.3
## "Ein Feld — ein Key — ein Tag — eine Wahrheit — ein Anker"

Die Vier-Einheits-Invariante (vollständig ab v2.3):

  TAG = JSON-KEY = CMA-KOORDINATE = CSS-ANKER

Alle 11 Pflichtfelder besitzen ab dieser Version einen eigenen `anchor-name`.
Abweichungen in Code oder CSS sind Bugs.

---

## SEKTIONEN A–J: Unverändert gegenüber v2.2.0

Alle Sektionen A (Absender) bis J (data-cma-* Zukunftsspeicher) sind
identisch zu `08_isomorphic_schema_v2.2.0.md`. Sie werden hier nicht
wiederholt um Redundanz zu vermeiden. Der Nachfolger dieser Datei
(v2.4.0+) wird die vollständige Tabelle integrieren.

Referenz für Sektionen A–J: `08_isomorphic_schema_v2.2.0.md`

---

## SEKTION K: Ghost-Mirror — Zero-Width-Marker Pattern (v2.3 — Multi-Page Fix)

*G-003: Multi-Page Print und Positioning vollständig spezifiziert.*

### Was der Ghost-Mirror ist

```
din-body contenteditable="plaintext-only"   ← SSoT, immer Plaintext
din-body-mirror aria-hidden="true"          ← Nur Visualisierung, kein contenteditable
```

### Positionierung von din-body-mirror

**Das Problem (G-003 Befund):**
`din-body` hat `position: absolute` in `@layer din.core` — es ist aus dem
normalen Dokumentfluss heraus. `din-body-mirror` muss identisch positioniert
sein, sonst überlagern sich die Elemente nicht korrekt beim State-Wechsel.

**Spezifikation:**
`din-body-mirror` liegt im `#textbereich`-Container und folgt demselben
`position: relative` + `width: 100%`-Muster wie die anderen Textbereich-Elemente.
Beide Elemente teilen exakt dieselbe Layout-Box:

```
#textbereich {
  position: absolute;
  left: var(--margin-left);    ← 25mm
  right: var(--margin-right);  ← 20mm
  top: var(--salutation-top);  ← ~113mm
}

din-body         { position: relative; width: 100%; min-height: 60mm; }
din-body-mirror  { position: relative; width: 100%; }
```

`din-body-mirror` ersetzt `din-body` im Print-Layout durch CSS-Display-Wechsel.
Beide belegen exakt denselben Raum. Kein Layout-Reflow im Paper.

### Multi-Page Print: break-inside und Seitenumbruch-Regeln

**G-003 Befund:** Nicht spezifiziert war, welche Elemente in `din-body-mirror`
Seitenumbrüche vermeiden müssen.

**Spezifikation für `@media print`:**

Elemente die NIEMALS aufgebrochen werden dürfen (break-inside: avoid):
- `blockquote` — Zitatblöcke bleiben zusammen
- `ul`, `ol` — Listen-Container (nicht zwingend jedes li)
- `table` — Tabellen (wenn Markdown-Tabellen implementiert)

Elemente die BEVORZUGT nicht aufgebrochen werden (break-inside: avoid-column):
- `li` — einzelne Listeneinträge wenn möglich
- `strong`, `em` in eigenem Block — Hervorhebungs-Paragraphen

Elemente die FREI aufgebrochen werden dürfen:
- Normale `p`-Absätze — Standard-Brieftext
- `br`-Zeilenumbrüche — immer erlaubt

**Vollständige Print-Regeln für din-body-mirror:**

```
@media print {
  din-body              { display: none !important; }
  din-body-mirror       { display: block !important; }
  .md-marker            { display: none !important; }

  din-body-mirror blockquote,
  din-body-mirror ul,
  din-body-mirror ol,
  din-body-mirror table { break-inside: avoid; }

  din-body-mirror li    { break-inside: avoid-column; }
}
```

### Warum din-body-mirror kein Layout-Reflow verursacht

**G-003 Befund:** Befürchtung, dass der Mirror den Briefinhalt verschiebt.

**Auflösung:** Im Screen-Mode ist der Mirror per `opacity: 0` unsichtbar ABER
er belegt keinen additiven Raum, weil beide Elemente (`din-body` und
`din-body-mirror`) im selben Container-Flow liegen und einer jeweils
`opacity: 0` hat (kein `display: none` im Screen-Mode).

Im Print-Mode wechselt `din-body` auf `display: none` — der Mirror übernimmt
exakt die gleiche Fläche. Kein Reflow. Kein Positionswechsel.

**Kritische Invariante:**
`din-body` und `din-body-mirror` dürfen NIEMALS gleichzeitig sichtbar sein.
Die Screen-State-Maschine garantiert dies über `opacity`-Transitions.

### Screen-State-Maschine (unverändert)

```
State 1 (Fokus):  din-body sichtbar | mirror opacity:0
State 2 (Blur):   din-body opacity:0 | mirror opacity:1
State 3 (Print):  din-body display:none | mirror display:block
```

---

## SEKTION L v2.3: IMR 4. Dimension — Alle 11 CSS-Anker (G-001 vollständig)

*v2.2 hatte 6 von 11 Ankern. v2.3 vervollständigt auf alle 11.*

Das Prinzip für jeden Anker:
```
din-[tag] { anchor-name: --din-[key]; }
.hint { position-anchor: --din-[key]; left: anchor(right); top: anchor(top); }
```

### Vollständige Anker-Tabelle (alle 11 IMR-Pflichtfelder)

| HTML-Tag       | anchor-name      | Tooltip-Trigger                  | Tooltip-Inhalt                          |
|----------------|------------------|----------------------------------|-----------------------------------------|
| din-sender     | --din-sender     | Feld nicht leer, Format-Check    | "Format: Name · Str. · PLZ Ort"         |
| din-note       | --din-note       | Feld fokussiert                  | "Vermerkzone: max. 3 Zeilen (DIN 5008)" |
| din-recipient  | --din-recipient  | Feld nicht leer, PLZ fehlt       | "PLZ und Ort erforderlich"              |
| din-date       | --din-date       | Feld fokussiert                  | "Format: TT.MM.JJJJ oder ISO"           |
| din-your-ref   | --din-your-ref   | Feld fokussiert                  | "Ihr Zeichen (vom Empfänger)"           |
| din-our-ref    | --din-our-ref    | Feld fokussiert                  | "Unser Zeichen (intern)"                |
| din-subject    | --din-subject    | Inhalt > 80 Zeichen              | "Betreff zu lang — max. 1 Zeile"        |
| din-salutation | --din-salutation | data-gender = 'n' + Feld leer    | "Anrede: Empfänger wählen für Genus"    |
| din-body       | --din-body       | Feld fokussiert                  | Markdown-Cheatsheet Popover             |
| din-greeting   | --din-greeting   | Endet mit ',' oder '.'           | "Kein Satzzeichen am Ende (DIN 5008)"   |
| din-signature  | --din-signature  | Feld leer nach Inhalt in body    | "Unterschrift nicht vergessen"          |

### Positionierungs-Pattern (einheitlich für alle Tooltips)

Alle Tooltips positionieren sich rechts neben dem Feld, top-bündig:
```
.din-hint {
  position: absolute;
  position-anchor: --din-[key];
  left: anchor(right);
  top: anchor(top);
  margin-left: 4mm;
}
```

Für Felder am rechten Rand (`din-date`, `din-your-ref` im schmalen Container):
```
.din-hint[data-flip] {
  left: auto;
  right: anchor(left);
  margin-left: 0;
  margin-right: 4mm;
}
```

**Wichtige Constraints für Anchor-Tooltips:**

1. Alle Tooltips sind `[popover]`-Elemente — sie öffnen und schließen sich
   via Invoker Commands (Chrome 133+) oder CSS `:has()`-Logik. Kein JS nötig.

2. `din-body-mirror` ist KEIN Anker-Kandidat — es hat kein contenteditable
   und soll unsichtbar bleiben. Der Anker `--din-body` liegt auf `din-body`.

3. Anker-Namen folgen strikt dem IMR-Key-Schema:
   `--din-[key]` wobei `key = tag.slice(4).replace(/-/g, '_')`
   Ausnahme: `your_ref` → `--din-your-ref` (Unterstriche bleiben als Bindestriche
   im CSS-Variablen-Namen: `--din-your-ref` nicht `--din-your_ref`)

---

## SEKTION M: JSON Import Validation & Legacy Key Mapping (G-004)

*v2.3 spezifiziert die Validierungs- und Migrations-Logik für JSON-Backups.*

### Das Problem (G-004 Befund)

Der JSON-Import in `ui.js` prüft nur ob das JSON valide ist, nicht ob die
Keys dem aktuellen IMR entsprechen. Ein Backup aus der IMR-v1-Ära mit
veralteten Keys (`sender_line`, `special_note`, `signature_name`) wird
geladen ohne Fehler — die Felder bleiben einfach leer.

### Drei Validierungs-Stufen beim JSON-Import

**Stufe 1 — JSON-Integrität:**
`JSON.parse()` schlägt fehl → Ablehnung mit Toast "Ungültiges JSON-Format".

**Stufe 2 — IMR-Schema-Validation:**
Prüfe jeden Key im importierten JSON gegen die aktuellen IMR-Keys.
- Alle 11 IMR-Pflichtfelder sind bekannt (aus `constants.js IMR`)
- Unbekannte Keys → Legacy-Mapping-Versuch (Stufe 3)
- Bekannte Keys → direkt übernehmen

**Stufe 3 — Legacy Key Mapping:**
Wenn unbekannte Keys gefunden werden, prüfe gegen die Legacy-Mapping-Tabelle:

| Veralteter Key (IMR v1)  | Aktueller Key (IMR v2+) | IMR-Version |
|--------------------------|-------------------------|-------------|
| `sender_line`            | `sender`                | v1 → v2     |
| `special_note`           | `note`                  | v1 → v2     |
| `signature_name`         | `signature`             | v1 → v2     |
| `body_text`              | `body`                  | v1 → v2     |
| `subject_line`           | `subject`               | v1 → v2     |
| `greeting_text`          | `greeting`              | v1 → v2     |

**Verhalten bei Legacy-Keys:**
- Mapping gefunden → Wert wird unter neuem Key übernommen
- Toast (passiv, nicht blockierend): "Veraltetes Backup-Format erkannt —
  Felder wurden automatisch migriert."
- Mapping nicht gefunden (völlig unbekannter Key) → ignorieren, kein Fehler

### Validierungs-Ergebnis-Toast-Matrix

| Situation | Toast | Import-Verhalten |
|---|---|---|
| Alles OK | keiner | Vollständig |
| Legacy-Keys migriert | passiv: "Format migriert" | Vollständig |
| 1–3 Keys unbekannt | passiv: "X Felder ignoriert" | Partiell |
| Alle Keys unbekannt | error: "Backup nicht kompatibel" | Abgelehnt |
| JSON kaputt | error: "Ungültiges JSON" | Abgelehnt |

### IMR-Version im Backup-JSON

Zukünftige Backups sollen die IMR-Version tragen:

```json
{
  "_meta": {
    "imr_version": "2.3",
    "exported_at": "2026-03-21T10:00:00Z",
    "app_version": "1.0.0"
  },
  "sender": "Max Mustermann ...",
  ...
}
```

`_meta` ist optional und kein IMR-Pflichtfeld. Der Import ignoriert es
(kein `din-_meta`-Tag). Sein Vorhandensein aktiviert versionsspezifische
Migrationspfade in der Validierungs-Logik.

---

## SEKTION N: Vier-Einheits-Invariante (vollständig ab v2.3)

```
  TAG = JSON-KEY = CMA-KOORDINATE = CSS-ANKER

  Beispiel din-subject:
    HTML-Tag:        <din-subject contenteditable="plaintext-only"
                       data-cma-top="103.4mm">
    JSON-Key:        "subject"
    CMA-Variable:    --subject-top: 103.4mm
    CSS-Anker:       anchor-name: --din-subject
    Tooltip:         .subject-hint { position-anchor: --din-subject; }
```

**Mapping-Regel für alle vier Dimensionen:**

| Dimension | Ableitungsregel | Beispiel |
|---|---|---|
| HTML-Tag | Kanonisch im IMR-Array | `din-subject` |
| JSON-Key | `tag.slice(4).replace(/-/g,'_')` | `subject` |
| CSS-Variable | `--` + key.replace(/_/g,'-') + `-top` | `--subject-top` |
| CSS-Anker | `--din-` + tag.slice(4) | `--din-subject` |

Diese vier Dimensionen sind deterministisch ineinander überführbar.
Kein Magic String, kein manuelles Mapping nötig.

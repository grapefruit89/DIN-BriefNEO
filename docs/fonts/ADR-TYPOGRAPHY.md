---
id: adr-typography
title: 'ADR-TYPOGRAPHY: DIN 5008 Font-Subsetting & Typografie-Architektur'
type: adr
status: active
created: '2026-11-08'
updated: '2026-11-27'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
  - tech/typography
  - tech/fonts
doc_links:
  - Immutable-Law-Catalog
  - ADR-CSS
  - ADR-BINARY-ASSETS
  - ADR-HTML
code_links:
  - website/css/base.css
  - website/js/settings.js
error_patterns:
  - font subsetting
  - webfont payload
  - din 5008 typografie
  - woff2
  - tabellenziffern
  - tnum
supersedes: []
depends_on: []
---

# ADR-TYPOGRAPHY: DIN 5008 Font-Subsetting & Typografie-Architektur

## 1. Context & Zielsetzung

### 1.1 Problemstellung & Datenvolumen
Schriftarten im Rohformat (TTF/OTF) decken weltweite Schriftsysteme ab (Kyrillisch, Griechisch, Devanagari, CJK, phonetische Zeichen, historische Glyphen). Vier vollständige Schnitte (z. B. Inter Regular/Bold, Aptos, Michelangelus) beanspruchen **1,11 MB Speicherplatz**.

Gemäß [[Immutable-Law-Catalog]] gelten strenge Rahmenbedingungen:
- **T1 / T2 / A41 (HARD BAN):** Keine externen Google Fonts oder Font-CDNs. Auslieferung 100 % lokal, DSGVO-konform und offline-fähig.
- **T3 (PREFERRED):** System-Font-Stacks als primärer Standard, optionale lokale WOFF2-Dateien.
- **A45 (HARD BAN):** Alle ausgelieferten Assets müssen relativ innerhalb von `website/` liegen.

Ein unreflektiertes Laden von 1,1 MB Rohschriften widerspricht dem Zero-Bloat- und KISS-Prinzip. Zugleich erfordert ein normgerechter Schriftwechsel nach **DIN 5008:2020-03 (Anhang H & F)** sowie der **Tastaturbelegung E1 (DIN 2137-1:2018-12)** die lückenlose Verfügbarkeit aller deutschen und europäischen Geschäftsbrief-Sonderzeichen.

### 1.2 Zielsetzung & Lösung
Durch gezieltes **DIN-5008-Subsetting** mit Brotli-Kompression (`.woff2`) wird aus der variablen Inter (856,0 KB) **eine einzige Datei mit 34 556 B** (≈ 33,7 KiB), die alle drei Gewichte trägt (−96,1 %). Die Optical-Size-Achse (`opsz`) wird dabei auf 18pt eingefroren, die Gewichtsachse (`wght`, 100..900) bleibt variabel.

### 1.3 Reproduzierbarkeit
Die Pipeline ist vollständig automatisiert und deterministisch im Repository verankert:
- **Werkzeug:** `fonts/subset_fonts.py` — **lokal, nicht im Repo** (`fonts/` ist komplett gitignored, Lizenz)
- **Engine:** `fontTools.varLib.instancer.instantiateVariableFont` (opsz = 18) + Python-Modul `fontTools.subset` (`sys.executable, "-m", "fontTools.subset"` mit `brotli`)
- **Quell-Verzeichnis:** `fonts/*.[to]tf` (variable Quelle: `fonts/Inter-Variable.ttf`)
- **Ziel-Verzeichnis:** `website/fonts/inter-variable.woff2`

---

## 2. Enthaltene Zeichenbereiche (DIN-5008-Allowlist)

Das Subsetting isoliert exakt jene Glyphen, die für amtliche, behördliche und geschäftliche Korrespondenz nach DIN 5008:2020-03 gefordert sind:

| Unicode-Bereich | Bezeichnung & Umfang | Fachlicher Einsatzzweck nach DIN 5008 |
| :--- | :--- | :--- |
| `U+0020-007E` | **Basic Latin**<br>`A–Z`, `a–z`, `0–9`, Standard-Satzzeichen (`.`, `,`, `:`, `;`, `!`, `?`), Klammern `()`, `[]`, `{}` | Grundtext, Zahlen, Standard-Interpunktion, E-Mail- und Webadressen. |
| `U+00A0-00FF` | **Latin-1 Supplement**<br>Umlaute `Ä`, `ä`, `Ö`, `ö`, `Ü`, `ü`, `ß`<br>Symbole: `§` (U+00A7), `©` (U+00A9), `®` (U+00AE), `°` (U+00B0)<br>Währungen: `$` (U+0024), `£` (U+00A3), `¥` (U+00A5)<br>Westeuropa: `é`, `è`, `à`, `ç`, `ñ`, `ø`, `å`, `æ`, `œ` | Rechts- und Vertragstexte (§), Schutzrechte (®, ©), Temperatur/Winkel (°). Westeuropäische Sonderzeichen sind zwingend für Auslandsanschriften gem. **DIN 5008 § 20.7.3** (z. B. Frankreich, Spanien, Skandinavien). `U+00A0` geschütztes Leerzeichen. |
| `U+0152-0153` | **Lateinische Ligaturen**<br>`Œ` (U+0152), `œ` (U+0153) | Französische Eigennamen und Adressbestandteile. |
| `U+1E9E` | **Großes Eszett**<br>`ẞ` (U+1E9E) | Amtliche deutsche Rechtschreibung bei durchgehender Großschreibung (Versalschrift im Betreff gem. DIN 5008 § 8.3). |
| `U+2010-2027` | **Typografische Striche & Quotes**<br>`-` (U+2010), `‑` (U+2011 geschützt)<br>`–` (U+2013 Halbgeviert/Bis-Strich), `—` (U+2014 Geviert)<br>„ “ (U+201E / U+201C), ‚ ‘ (U+201A / U+2018)<br>`•` (U+2022 Bullet), `…` (U+2026 Auslassungspunkte) | DIN 5008 Anhang F: Echte typografische Anführungszeichen (unten 99 / oben 66), Gedanken- und Streckenstriche, geschützte Bindestriche für Kopplungen, Bullet-Points für die Absenderzeile im Anschriftfeld (§ 20.2). |
| `U+202F-2044` | **Sonderabstände, Primes & Brüche**<br>` ` (U+202F Schmal-Leerzeichen / NNBSP)<br>`›` `‹` (U+203A / U+2039 einfache Guillemets)<br>`′` (U+2032 Prime), `″` (U+2033 Doppelprime)<br>`⁄` (U+2044 Bruchstrich), `‰` (U+2030 Promille) | **DIN 5008 Anhang F.3:** Schmal-Leerzeichen für Abkürzungen (*z. B.*, *d. h.*, *u. a.*) und 3er-Zifferngruppen; Maßeinheiten für Zoll, Minuten, Sekunden; typografischer Bruchstrich. |
| `U+20AC` | **Euro-Währungssymbol** (`€`) | Kaufmännische Betragsangaben, Rechnungen, Angebote. |
| `U+2116` | **Nummernzeichen** (`№`) | Aktenzeichen, Bestell- und Rechnungsnummern. |
| `U+2212, U+2248, U+2264-2265` | **Mathematische Operatoren**<br>`−` (U+2212 echtes Minus), `≈` (U+2248 Ungefähr)<br>`≤` (U+2264), `≥` (U+2265), `±` (U+00B1), `×` (U+00D7), `·` (U+00B7) | Kaufmännische Rundungen, Salden und Gegenüberstellungen. Verhindert die typografisch falsche Nutzung des ASCII-Bindestrichs als Minus. |
| `U+2300` | **Durchmesserzeichen** (`⌀`) | Technische Maßangaben und Spezifikationen. |
| `U+2713-2718` | **Prüf- und Kontrollzeichen**<br>`✓` (U+2713), `✔` (U+2714), `✗` (U+2717), `✘` (U+2718) | Checklisten, Erledigungsvermerke und Statusübersichten in Anhängen. |
| `U+27E8-27E9` | **Mathematische Winkelklammern** (`⟨`, `⟩`) | Fachliche Kennzeichnungen, Zitate und Metadaten. |

### 2.1 Erforderliche OpenType-Layout-Features (`--layout-features`)
Das Subsetting bewahrt zwingend folgende OpenType-Tabellen:
- **`kern` (Kerning):** Buchstabenausgleich für harmonische Wortbilder (z. B. `AV`, `Te`, `Vo`).
- **`liga` / `calt` (Ligaturen & kontextuelle Alternativen):** Standard-Ligaturen (z. B. `fi`, `fl`).
- **`tnum` (Tabellenziffern / Tabular Numbers):** Ziffern gleicher Dicke. Unverzichtbar für die exakte vertikale Ausrichtung von Betragsspalten, IBANs, Bankverbindungen und Datumszeilen. In CSS aktiv über `font-variant-numeric: tabular-nums;`.

---

## 3. Was bewusst verworfen wird (Blocklist / Reduktion)

Zur Erzielung der 93 %igen Reduktion werden folgende nicht für DIN-Briefe benötigte Datenblöcke abgeschnitten:

1. **Nicht-lateinische Schriftsysteme:**
   - Kyrillisch (Russisch, Ukrainisch, Bulgarisch etc.)
   - Griechisch (Modern/Altgriechisch)
   - Arabisch, Hebräisch, Devanagari, Thailändisch
   - CJK (Chinesische Hanzi, Japanische Kanji/Kana, Koreanische Hangul)
2. **Exotische Latin-Erweiterungen:**
   - IPA (International Phonetic Alphabet)
   - Historische oder archaische Runen und Mediävistik-Glyphen
3. **Akademische Hochschul-Mathematik:**
   - Integrale (`∫`), Summenzeichen (`∑`), Wurzeln (`√`), Mengenlehre (`∈`, `⊂`), unendliche Matrizen-Operatoren.
4. **Farb-Emojis & Schmuckglyphen:**
   - Emojis (`😀`, `🚀`, etc.) und Bildsymbole. Diese werden bei Bedarf automatisch und farbig vom nativen Betriebssystem-Font gerendert.

---

## 4. Technischer Fallback-Mechanismus (Sicherheitsnetz)

Das Subsetting führt **zu keinem Zeitpunkt zu Textverlust oder Darstellungsfehlern**. 

### 4.1 Die 3-stufige Font-Kaskade
Fügt der Nutzer Text mit Zeichen außerhalb der DIN-Allowlist ein (z. B. ein japanisches Zitat, ein kyrillisches Firmenlogo oder ein Emoji), greift die native Browser-Engine:

```
┌────────────────────────────────────────────────────────┐
│               SCHRIFTARTEN-KASKADE IM DOM               │
├────────────────────────────────────────────────────────┤
│  1. Hauptschrift (aktives WOFF2-Subset)                │
│     -> Prüft Glyphe (deckt 100 % DIN 5008 ab)          │
│     -> Zeichen vorhanden? Rendern in gewählter Schrift │
├────────────────────────────────────────────────────────┤
│  2. System-Stack (CSS-Fallback via --font-system-stack)│
│     -> Greift bei fehlender Glyphe auf System-Font     │
│        (Arial, Segoe UI, San Francisco)                │
├────────────────────────────────────────────────────────┤
│  3. OS Glyph-Fallback (System-Rasterizer / Skia)       │
│     -> Systemweite Schrift (z. B. Noto Sans CJK,       │
│        Apple Color Emoji, Segoe UI Emoji)              │
│     -> Garantiert lesbare Darstellung ohne 'Tofu' ()  │
└────────────────────────────────────────────────────────┘
```

### 4.2 Bewahrung der typografischen Stabilität
- **Kein Layout-Crash:** Fehlende Zeichen erben Schriftgröße, Zeilenhöhe (`line-height: 1.35`) und `font-size-adjust: 0.52` vom Elternelement `<din-blatt>`.
- **Visuelle Transparenz:** Zeichen innerhalb der DIN-Norm wirken 100 % einheitlich; exotische Sonderzeichen bleiben lesbar, fallen aber dezent in die Systemschrift zurück.

---

## 5. Implementierung & CSS-Integration

### 5.1 CSS `@font-face`-Deklarationen (`website/css/base.css`)

Im Repo liegt genau **eine** Datei: **Inter 18pt als Variable Font**
(opsz in der Pipeline auf 18pt eingefroren, `wght` 100..900). Liberation Sans
ist am 2026-11-27 restlos entfernt worden (Dateien, Lizenz, `@font-face`,
Preset, Auswahl); die statischen Inter-Schnitte folgten am selben Tag.

```css
@font-face {
  font-family: "Test-Inter";
  src: url("../fonts/inter-variable.woff2") format("woff2-variations"),
       url("../fonts/inter-variable.woff2") format("woff2");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

/* Die drei aktiven Gewichte: 400 Fließtext, 600 Fett, 700 Betreff. */
b,
strong,
.font-bold {
  font-weight: 600;
}

:root {
  /* Bedienoberflaeche: Systemschrift. "Liberation Sans" ist hier die
     OS-eigene Schrift (z. B. /usr/share/fonts), NICHT mitgeliefert. */
  --font-system-stack: "Liberation Sans", Arial, "Helvetica Neue", Helvetica, sans-serif;
  /* Brief: die variable Inter, danach nur Systemschriften. */
  --font-brief-stack: "Test-Inter", system-ui, -apple-system, sans-serif;
  --active-font-family: var(--font-brief-stack);
}

din-blatt {
  font-family: var(--active-font-family, var(--font-brief-stack));
  font-weight: 400;
  font-size-adjust: 0.535;
  font-variant-numeric: tabular-nums;
}
```

**Warum Inter 18pt Standard ist:** Die „1" hat in Liberation Sans einen
Fußbalken unter dem Stamm (Arial und Inter setzen den Stamm auf die
Grundlinie), und Liberation Sans bietet upstream keine Zwischengewichte.
Inter löst beides ohne Eingriff in eine fremde Schrift. Der Preis: Inter ist zu
Arial **nicht** metrisch identisch — der Brief bricht also anders um als ein
Arial-Brief, obwohl DIN 5008 Kap. 20.7.1 Arial und Helvetica ausdrücklich
nennt. Die vier neuen Akzent-/Guillemet-Zeichen (`U+00B4`, `U+00AB`, `U+00BB`,
`U+00E0`, `U+00E7`, `U+00E8`, `U+00E9`) decken deutsche QWERTZ-Eingaben und
Namen wie „Renée" oder „François" direkt aus dem Subset ab.

**Nicht im Repo, nur lokal:** Aptos (Microsoft) und Michelangelus (kommerziell)
sowie eigene Testschriften liegen ausschliesslich in `<repo>/fonts/`
(gitignoriert). Der Dev-Server listet sie unter `/__fonts` aus, die App laedt
sie per `FontFace`-API; auf GitHub Pages fehlen sie — statt eine 404 zu laden.

### 5.2 Settings-Steuerung (`website/js/font-feature.js`)
Der `FontFeature`-Layer verwaltet die Schriftartenauswahl zentral:
- `FONT_PRESETS` enthält nur noch `default: ''`; Inter ist fester Standard und
  wird über `--font-brief-stack` gesetzt.
- `settings.previewFont` speichert weiterhin `'default'` bzw. `'lokal:<Datei>'`
  für hochgeladene bzw. lokale Schriften. Ein altes `'inter'`/`'liberation'`
  fällt beim Start sauber auf `default` zurück.
- Schaltet `--active-font-family` deklarativ am `:root`-Element um.
- Bleibt 100 % kompatibel mit dem IndexedDB-Binär-Upload benutzerdefinierter Schriften (`#btn-schrift-aktion`, siehe [[ADR-BINARY-ASSETS]]).

## Zeichensatz der Web-Schriften: QWERTZ + DIN 5008 (2026-11-27)

**Entscheidung des Nutzers:** „Deutscher QWERTZ- und DIN-5008-Zeichensatz" —
Deutschland, Österreich, Schweiz, plus die Zeichen, die deutsche Tastaturen
und französische Eigennamen tatsächlich erzeugen.

DIN 5008 schreibt **keinen** Zeichenvorrat vor. Kapitel 5 („Zeichensatz und
Datenaustausch") sagt nur: „Die Zeichen aus dem Zeichenvorrat von
Anwendungsprogrammen dürfen verwendet werden" und empfiehlt ISO/IEC 10646
(Unicode). Verlangt werden konkret: geschütztes Leerzeichen (7.2), bedingter
Trennstrich (6.1), Anführungszeichen (8.3–8.5), § (9.1), & (9.2).

### Soll-Vorrat (187 Codepoints)

| Bereich | Zeichen |
|---|---|
| ASCII | a–z, A–Z, 0–9, alle Satzzeichen |
| — | Ä Ö Ü ä ö ü |
| — | ß und ẞ (großes Eszett) |
| — | geschütztes Leerzeichen (DIN 7.2) |
| — | bedingter Trennstrich |
| — | „ “ ” ‚ ‘ ’ (DIN 8.3–8.5) |
| — | § (DIN 9.1) |
| — | © ® ° ± × ² ³ µ ¼ ½ ¾ (Währung, Maß, Rechnen) |
| — | Akut `´`, Guillemets `« »`, `à ç è é` (QWERTZ/Namen) |
| — | Striche, Bullets, Mittelpunkt, Ellipse, Schmal-Leerzeichen |
| — | € № ™ |
| — | − ≈ ≤ ≥ ⌀ |
| — | ✓ ✗ ⟨ ⟩ |

### Bewusst NICHT enthalten

Kyrillisch, Griechisch, CJK, Arabisch, Hebräisch, Emoji, `U+0100–017F`
(polnisch/tschechisch/türkisch) und weitere Latin-Extended-Akzente. Was fehlt,
rendert in der Systemschrift. Bewusste Entscheidung: ein DIN-Brief an
deutschsprachige Empfänger.

### Größen (Ist, 2026-11-27)

| Datei | Quelle | vorher | jetzt (QWERTZ + DIN) |
|---|---|---|---|
| `inter-variable.woff2` | Inter-Variable.ttf (opsz 18, wght 100–900) | 856,0 KB | **34 556 B** (33,7 KiB) |

Die eine Datei bleibt unter dem Budget von **38 KiB** (38 912 B). Sie trägt
gleichzeitig 400 (Fließtext), 600 (`b`/`strong`/`.font-bold`) und 700
(`#betreff`); statische Schnitte werden nicht mehr ausgeliefert.

Das Build-Script (`fonts/subset_fonts.py`) ist **nicht versioniert** (`fonts/`
ist komplett gitignored). Die Liste oben ist deshalb die Quelle der Wahrheit im
Repo.

Das Build-Script (`fonts/subset_fonts.py`) ist **nicht versioniert** (`fonts/`
ist komplett gitignored). Die Liste oben ist deshalb die Quelle der Wahrheit im
Repo.

### Lizenz

Inter steht unter **SIL Open Font License 1.1**. Die Lizenzdatei liegt als
`website/fonts/LICENSE-Inter.txt` neben den Schriften. Die
Liberation-Lizenzdatei ist mit der Schrift am 2026-11-27 entfallen.

Aptos (Microsoft) und Michelangelus (kommerziell) dürfen nicht weitergegeben
werden — sie bleiben in `<repo>/fonts/` und erreichen die veröffentlichte Seite
nie.

### Lokale Testschriften (`<repo>/fonts/`)

Was dort liegt, erscheint in der Auswahl — ohne Code-Änderung:

1. Datei nach `Nobara-PC: /home/moritz/repos/DIN-BriefNEO/fonts/` legen
   (`.woff2`, `.ttf` oder `.otf`).
2. Seite neu laden.
3. Die Gruppe „Nur lokal (fonts/)" zeigt die Schrift, die Datei wird per
   `FontFace`-API geladen.

Der Dev-Server liefert die Liste unter `/__fonts` (`tools/static-server.mjs`).
Inter-Quelldateien werden dort ausgeblendet, weil sie bereits als Subset
ausgeliefert werden.

**Pfeiltasten:** Bei geschlossener Auswahl ändern sich die eingebauten
Pfeiltasten von Chrome nicht mehr (`appearance: base-select`); `font-feature.js`
fängt sie selbst ab und zieht den Brief live mit. Gespeichert wird erst nach
dem Stehenbleiben (120 ms Entprellung), damit Durchblättern nicht jede Stufe in
`localStorage` schreibt.

---

## Brief-Standard: Inter 18pt, Liberation Sans restlos entfernt (2026-11-27)

**Entscheidung des Nutzers:** „Auf Inter umstellen" und danach „Liberation Sans
restlos entfernen". Inter 18pt ist der einzige Brief-Standard, seit demselben
Tag als **Variable Font** (eine Datei, `wght` 100–900); es gibt keine zweite
wählbare Familie mehr.

### Warum

1. **Die „1" hat in Liberation Sans einen Fußbalken.** Gemessen an der Kontur
   aus `Nobara-PC: /home/moritz/repos/DIN-BriefNEO/fonts/LiberationSans-Regular.ttf`:
   eine einzige Kontur, Punkte `(156,0) (156,153) (515,153) (515,1237) (197,1010)
   (197,1180) (530,1409) (696,1409) (696,153) (1039,153) (1039,0)` — der Stamm
   steht auf einem Balken `x=156..1039`, `y=0..153`, nicht auf der Grundlinie.
   Arial zeichnet die 1 ohne Fuß. Inter ebenfalls: Kontur
   `(640,1490) (640,0) (456,0) (456,1312) (448,1312) (85,1049) (85,1249) (420,1490)`
   — Stamm auf `y=0`, kein Balken.
2. **Liberation Sans hat keine Zwischengewichte.** Upstream existieren nur
   Regular/Bold/Italic/BoldItalic; 2.1.5 (2021-09-30) ist die letzte Version
   überhaupt. Inter liefert 100–900.
3. **Zwei Familien bedeuteten zwei Pflegepfade.** Mit dem Wegfall von
   Liberation entfallen vier Dateien, eine Lizenzdatei, drei CSS-Blöcke, zwei
   Presets und die zweite Stufe der Font-Kette.

### Was dafür geändert wurde

| Datei | Änderung |
| :--- | :--- |
| `Nobara-PC: /home/moritz/repos/DIN-BriefNEO/website/css/base.css` | Ein `@font-face` für `inter-variable.woff2` (`font-weight: 100 900`); `--font-brief-stack: "Test-Inter", system-ui, -apple-system, sans-serif` |
| `Nobara-PC: /home/moritz/repos/DIN-BriefNEO/website/js/font-feature.js` | `FONT_PRESETS` enthält nur `default: ''`; Liberation-Preset gelöscht, kein `inter`-Sonder-Key mehr |
| `Nobara-PC: /home/moritz/repos/DIN-BriefNEO/website/index.html` | Auswahl enthält nur noch „Inter 18pt Variable (DIN-Subset)" |
| `Nobara-PC: /home/moritz/repos/DIN-BriefNEO/website/fonts/` | `liberation-sans-regular.woff2`, `liberation-sans-bold.woff2`, `LICENSE-Liberation.txt` gelöscht |
| `Nobara-PC: /home/moritz/repos/DIN-BriefNEO/fonts/subset_fonts.py` | `BAUT` baut nur noch Inter; `UNICODES` um Akut, Guillemets und `à ç è é` erweitert (187 Soll-Codepoints) |
| `Nobara-PC: /home/moritz/repos/DIN-BriefNEO/test/index.html`, `test/all.js` | Fixture und Preset-Test auf „nur Inter" umgestellt |

### Unverändert

Bau-Pipeline (`fonts/subset_fonts.py`), **eine** variable Datei
(`wght` 100–900; aktiv 400/600/700), `font-size-adjust: 0.535` auf `din-blatt`.
`font-variant-numeric: tabular-nums` wirkt in Inter über die mitsubsetzte
`tnum`-Funktion (im Subset vorhanden: GSUB `calt`, `tnum`).

### Ist-Abdeckung

Von 187 Soll-Codepoints sind **179** im Inter-Subset vorhanden. Es fehlen acht
Zeichen, die die Quelle nicht hat: `U+00AD` (bedingter Trennstrich), `U+2300`
(⌀), `U+2714-2716`, `U+2718` und `U+27E8-27E9`. Diese rendert die
Systemschrift. Vollständige Datei-Abdeckung und Messwerte:
`Nobara-PC: /home/moritz/repos/DIN-BriefNEO/website/fonts/README.md`.

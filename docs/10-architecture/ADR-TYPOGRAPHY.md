---
id: adr-typography
title: 'ADR-TYPOGRAPHY: DIN 5008 Font-Subsetting & Typografie-Architektur'
type: adr
status: active
created: '2026-11-08'
updated: '2026-11-08'
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
  - tools/subset_fonts.py
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
Durch gezieltes **DIN-5008-Subsetting** mit Brotli-Kompression (`.woff2`) wird das Datenvolumen von 1.110 KB auf **~75 KB für alle vier Schriften zusammen** reduziert (−93,2 % Ersparnis), ohne dass ein einziges normativ relevantes Zeichen verloren geht.

### 1.3 Reproduzierbarkeit
Die Pipeline ist vollständig automatisiert und deterministisch im Repository verankert:
- **Werkzeug:** `tools/subset_fonts.py`
- **Engine:** Python-Modul `fontTools.subset` (`sys.executable, "-m", "fontTools.subset"` mit `brotli`)
- **Quell-Verzeichnis:** `Fonts/*.[to]tf`
- **Ziel-Verzeichnis:** `website/fonts/*.woff2`

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
│        (Liberation Sans, Segoe UI, San Francisco)      │
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

```css
@font-face {
  font-family: "Test-Inter";
  src: url("../fonts/inter_18pt-regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Test-Inter";
  src: url("../fonts/inter_18pt-bold.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Test-Aptos";
  src: url("../fonts/aptos.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Test-Michelangelus";
  src: url("../fonts/michelangelus-regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

din-blatt {
  font-family: var(--active-font-family, var(--font-system-stack));
  font-size-adjust: 0.52;
  font-variant-numeric: tabular-nums;
}
```

### 5.2 Settings-Steuerung (`website/js/settings.js`)
Der `SettingsManager` verwaltet die Schriftartenauswahl zentral und typisiert:
- `settings.previewFont`: `'default' | 'inter' | 'aptos' | 'michelangelus'`
- Schaltet `--active-font-family` deklarativ am `:root`-Element um.
- Bleibt 100 % kompatibel mit dem IndexedDB-Binär-Upload benutzerdefinierter Schriften (`#btn-schrift-aktion`, siehe [[ADR-BINARY-ASSETS]]).

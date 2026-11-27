---
status: active
type: reference
tags: [din-briefneo, fonts, typografie, subsetting, din-5008]
summary: "Zeichenvorrat und Ist-Abdeckung der ausgelieferten WOFF2-Dateien. Verbindlich: nur was ein DIN-5008-Brief und eine deutsche QWERTZ-Tastatur brauchen."
---

# website/fonts — Zeichenvorrat, Abdeckung, Grenzen

Diese Datei beantwortet **eine** Frage: *Welche Zeichen dürfen in der
mitgelieferten Brieftypografie stecken, und welche stecken tatsächlich drin?*
Grundsatz (Nutzerentscheidung 2026-11-27): **so viel wie nötig, so wenig wie möglich.**
Alles Kyrillische, Griechische, CJK, Arabische, Hebräische, Emoji und Latin-Extended hat in
einem Brief nichts zu suchen und wird **nicht** eingebettet.

**Standard und einzige Datei des Briefs:** `inter-variable.woff2` — Inter 18pt als
Variable Font (opsz auf 18pt eingefroren, `wght` 100..900), die alle drei Gewichte
400, 600 und 700 trägt (seit 2026-11-27). Liberation Sans und die zwei statischen
Inter-Schnitte sind entfallen — keine Datei, keine Lizenz, kein `@font-face`,
kein Preset, keine Option in der Auswahl.

Verwandte Dokumente:
- `Nobara-PC: /home/moritz/repos/DIN-BriefNEO/docs/fonts/ADR-TYPOGRAPHY.md` — Architekturentscheidung
- `Nobara-PC: /home/moritz/repos/DIN-BriefNEO/fonts/subset_fonts.py` — Bau-Pipeline (**Quelle der Wahrheit** für den Soll-Zeichensatz)
- `Nobara-PC: /home/moritz/repos/DIN-BriefNEO/website/css/base.css` — `@font-face`-Bindung und `--font-brief-stack`

---

## 1. Was DIN 5008 tatsächlich vorschreibt — und was nicht

**Wichtig zur Ehrlichkeit:** DIN 5008:2020-03 legt **keinen Zeichensatz** im Sinne einer
Codepage fest. Die Norm regelt, *welche Zeichen an welcher Stelle* einer Korrespondenz
zulässig sind, und verlangt für den Zeichenvorrat insgesamt ISO/IEC 10646 (Unicode) — also
keine herstellerspezifische 8-Bit-Codepage. (Projektstand, übernommen aus
`Nobara-PC: /home/moritz/repos/DIN-BriefNEO/docs/fonts/ADR-TYPOGRAPHY.md:29`; der Normtext
ist kostenpflichtig und wurde nicht gegen den Originaltext geprüft → *ungeprüft*.)

Normativ belegt sind dagegen die **einzelnen Zeichen**, die an konkreten Stellen gefordert
werden (Fundstellen wie im ADR geführt):

| Normstelle | Zeichen | Codepoints |
| :--- | :--- | :--- |
| § 8.3–8.5 | Deutsche Anführungszeichen unten/oben, einfache Variante | `U+201E` `U+201C` `U+201A` `U+2018` |
| § 6.1 | Bedingter Trennstrich, geschützter Bindestrich | `U+00AD` `U+2011` |
| § 7.2 | Geschütztes Leerzeichen (Währungs-/Maßkopplung) | `U+00A0` |
| § 9.1 | Paragraphenzeichen | `U+00A7` |
| § 20.2 | Absenderzeile, Anschriftfeld (Trenn-/Aufzählungszeichen) | `U+00B7` `U+2022` |
| Kap. 20.7.1 | Schriftart: Arial und Helvetica ausdrücklich genannt | — (Arial-Metrik) |

Der in `subset_fonts.py` hinterlegte Vorrat ist damit **kein** Zitat der Norm, sondern die
projektseitige Ableitung „was ein DIN-Brief schreiben kann". Diese Ableitung ist der
verbindliche Soll-Zustand dieses Repos und umfasst **187 Codepoints**.

---

## 2. Soll-Zeichensatz (187 Codepoints, QWERTZ + DIN 5008)

Identisch zu `UNICODES` in `Nobara-PC: /home/moritz/repos/DIN-BriefNEO/fonts/subset_fonts.py`.

| Block | Codepoints | Anzahl |
| :--- | :--- | ---: |
| ASCII (Buchstaben, Ziffern, Satzzeichen) | `U+0020-007E` | 95 |
| DACH-Umlaute + ß | `U+00C4,U+00D6,U+00DC,U+00DF,U+00E4,U+00F6,U+00FC` | 7 |
| Großes Eszett | `U+1E9E` | 1 |
| QWERTZ-Akzente & Guillemets (neu 2026-11-27) | `U+00B4,U+00AB,U+00BB,U+00E0,U+00E7,U+00E8,U+00E9` | 7 |
| Normzeichen (NBSP, §, ©, ®, Soft-Hyphen, Grad, ², ³, µ, Mittelpunkt, ¼, ½, ¾, ×) | `U+00A0,U+00A7,U+00A9,U+00AD,U+00AE,U+00B0-00B3,U+00B5,U+00B7,U+00BC-00BE,U+00D7` | 15 |
| Striche, Quotes, Bullets, Ellipse | `U+2010-2027` | 24 |
| Schmal-Leerzeichen bis Bruchstrich | `U+202F-2044` | 22 |
| Euro, Numero, Trademark | `U+20AC,U+2116,U+2122` | 3 |
| Mathe (Minus, ≈, ≤, ≥) | `U+2212,U+2248,U+2264-2265` | 4 |
| Durchmesser, Haken/Kreuz, Winkelklammern | `U+2300,U+2713-2718,U+27E8-27E9` | 9 |
| **Summe** | | **187** |

### 2.1 Die QWERTZ-/DIN-Ergänzung im Klartext

| Codepoint | Zeichen | Warum drin |
| :--- | :--- | :--- |
| `U+00B4` | `´` Akut | Dead-Key auf deutscher QWERTZ-Tastatur |
| `U+00AB` `U+00BB` | `«` `»` | Guillemets in Schweizer und französischer Korrespondenz |
| `U+00E0` | `à` | z. B. „à la", Namen |
| `U+00E7` | `ç` | z. B. „François", „Garçon" |
| `U+00E8` | `è` | z. B. „Renée", „café crème" |
| `U+00E9` | `é` | z. B. „Renée", „Café" |

Die frühere Regel „keine französischen Akzente" ist damit bewusst aufgehoben:
die vier Akzentbuchstaben gehören zum Zeichenvorrat, den deutsche Tastaturen
und deutschsprachige Namen tatsächlich erzeugen. Weitere Latin-Extended-
Akzente (`ê á â ñ`, `U+0100–017F`) bleiben draußen.

### 2.2 Bewusst ausgeschlossen

| Bereich | Warum nicht |
| :--- | :--- |
| Kyrillisch (`U+0400-04FF`), Griechisch (`U+0370-03FF`) | kommt in deutschsprachiger Korrespondenz nicht vor |
| CJK (`U+2E80-9FFF`, `U+AC00-D7AF`, `U+F900-FAFF`) | dito; würde die Datei um ein Vielfaches vergrößern |
| Arabisch, Hebräisch, Devanagari, Thai | dito |
| Latein-Extended-A/B (`U+0100-024F`), weitere Akzente | polnische/tschechische/türkische Zeichen und nicht benötigte Romanistik |
| Währungen außer Euro (`U+00A2-00A5`, `U+20A0-20BF`) | ein DIN-Brief rechnet in Euro |
| Emoji & Piktogramme (`U+1F300-1FAFF`) | farbige Emojis sprengen jede Textschrift |
| Musik, Mathe-Erweitert, Pfeile, Box-Drawing | kein Anwendungsfall |
| `U+FEFF` (BOM), `U+200B` (Zero-Width-Space) | Steuerzeichen, keine Glyphen |

**Regel:** Fehlt ein Zeichen, das ein Nutzer eintippt, fällt der Browser auf die Systemschrift
zurück. Das ist erlaubt und sichtbar (anderer Font), aber **kein Grund, den Zeichenvorrat
aufzublähen.** Wer ein neues Zeichen braucht, ergänzt es in
`Nobara-PC: /home/moritz/repos/DIN-BriefNEO/fonts/subset_fonts.py` und baut neu.

---

## 3. Ist-Stand der ausgelieferten Datei (gemessen 2026-11-27)

| Datei | Bytes | KiB | Codepoints im cmap | Glyphen | Quelle | Quelle hat |
| :--- | ---: | ---: | ---: | ---: | :--- | ---: |
| `inter-variable.woff2` | 34.556 | 33,7 | 179 | 299 | `Inter-Variable.ttf` (opsz 18, wght 100–900) | 2.849 |

Budget: **eine Datei unter 38 KiB** (38.912 B) — gehalten mit 4,3 KiB Reserve.
Reduktion gegenüber der Rohschrift (856,0 KB): **~96 %** der Codepoints entfernt.
Es ist **kein** Latein-Extended, **kein** Kyrillisch, **kein** Griechisch,
**kein** CJK in der Datei — der cmap-Dump reicht von `U+0020` bis `U+2717`;
alle höheren Ebenen (`U+0370+`, `U+0400+`, `U+2000+ CJK`, `U+1F300+`) sind nicht
vorhanden. Die Datei enthält **null** Codepoints außerhalb des Soll-Vorrats —
die Pipeline schneidet ausschließlich, sie schleust nichts ein.

Die Gewichtsachse ist nach dem Build die einzige verbliebene Achse
(`wght` 100/400/900). `opsz` ist durch
`instantiateVariableFont(..., {"opsz": 18})` eingefroren, nicht abgeschnitten:
die Metrik entspricht damit exakt dem früheren statischen 18pt-Schnitt.

### 3.1 Lücken: Zeichen, die der Soll-Vorrat verlangt, aber Inter nicht hat

Diese Zeichen **existieren in der Quelldatei nicht**. Sie werden beim Subsetting nicht
entfernt, sie waren nie da — im Brief rendert dafür die Systemschrift.

| Codepoint | Zeichen | Inter 18pt |
| :--- | :--- | :---: |
| `U+00AD` | Bedingter Trennstrich (unsichtbar) | ❌ **fehlt** |
| `U+2300` | Durchmesserzeichen `⌀` | ❌ **fehlt** |
| `U+2714`, `U+2715`, `U+2716`, `U+2718` | Schwere Haken/Kreuze `✔ ✕ ✖ ✘` | ❌ **fehlt** |
| `U+27E8-27E9` | Spitze Klammern `⟨ ⟩` | ❌ **fehlt** |

Vorhanden sind dagegen `U+2713` (`✓`) und `U+2717` (`✗`) sowie der geschützte
Bindestrich `U+2011`. Von **187** Soll-Codepoints sind damit **179** gesetzt;
die acht fehlenden erscheinen in der Systemschrift (`system-ui` /
`-apple-system` / `sans-serif`).

---

## 4. Warum keine fertigen Web-Subsets (google-webfonts-helper)

Geprüft am 2026-11-27 gegen `https://gwfh.mranftl.com/api/fonts/inter?subsets=latin` (Inter v20):

```
Google-"latin"-Subset, Inter v20 regular (statisch):
  Datei: 23.664 Bytes (23,1 KB)      ← unsere Variable: 34.556 Bytes (33,7 KB)
  Codepoints: 230                    ← unsere Datei: 179
  für DIN unnötig: 96                ← z. B. U+00C0-00C3 (À Á Â Ã), U+00E0-00FB,
                                        U+0131, U+0152-0153 (Œ œ), U+0300-0309 (Combining),
                                        U+2002, U+2009, U+200B, U+2191/U+2193 (↑ ↓), U+FEFF
  Soll-Lücke: 8                      ← U+00AD, ⌀, ✔ ✕ ✖ ✘, ⟨⟩
  Gewichte: 1 (regular)              ← unsere Datei: 100..900
```

**Ergebnis: gwfh ist die schlechtere Quelle.** Es liefert Googles *vordefinierte* Subsets
(`latin`, `latin-ext`, `cyrillic`, `greek`, `vietnamese`), nicht den DIN-Vorrat. Ein Tausch
würde 96 Zeichen einbetten, die in einem Brief nichts verloren haben (genau gegen die Regel
aus § 2.2), trotzdem Zeichen verlieren, die wir brauchen, und für 600/700 weitere Dateien
nötig machen. gwfh darf als Bezugsquelle für Rohschriften dienen, **nicht** als Subsetter.

Zusatzhinweis: gwfh liefert „Inter" (v20). Im Repo liegt „Inter **18pt**" —
eine eigene Optical-Size-Familie mit anderen Metriken. Ein Tausch wäre also auch ein
Metrikwechsel, kein bloßer Update.

---

## 5. Neu bauen & prüfen

```bash
python3 /home/moritz/repos/DIN-BriefNEO/fonts/subset_fonts.py
```

Voraussetzung: die Rohschrift liegt in `Nobara-PC: /home/moritz/repos/DIN-BriefNEO/fonts/`
(gitignoriert) — `Inter-Variable.ttf` mit den Achsen `opsz` 14..32 und `wght` 100..900.
Fehlt sie, meldet das Skript `FEHLT` und bricht mit Exit 1 ab. Das Skript friert
`opsz` auf 18 ein, subsettet den Zeichenvorrat und schreibt genau eine Datei.

Abdeckung der Datei prüfen (Einzeiler, ohne Skript):

```bash
python3 -c "from fontTools.ttLib import TTFont as T; import sys; f=T(sys.argv[1]); c=sorted(f.getBestCmap()); print(len(c),'Codepoints:', 'U+%04X'%c[0], '...', 'U+%04X'%c[-1])" \
  /home/moritz/repos/DIN-BriefNEO/website/fonts/inter-variable.woff2
```

Erwartet: `179 Codepoints: U+0020 ... U+2717`.

---

## 6. Offene Punkte

1. **`⌀` (`U+2300`) fehlt in Inter.** Betrifft technische Briefe mit
   Durchmesserangaben. Es bleibt bei Systemschrift-Fallback — entweder Glyphe ergänzen oder
   akzeptieren.
2. **`⟨`/`⟩` (`U+27E8-27E9`) und `✔ ✕ ✖ ✘` (`U+2714-2716`, `U+2718`) fehlen.** Systemschrift-Fallback.
3. **`U+00AD` (bedingter Trennstrich) fehlt in Inter.** Der geschützte Bindestrich `U+2011`
   ist vorhanden; der unsichtbare weiche Trennstrich kommt aus der Systemschrift.
4. **„1:1 wie Arial" ist falsch formuliert.** Inter ist zu Arial **nicht** metrisch identisch.
   DIN 5008 Kap. 20.7.1 nennt Arial und Helvetica ausdrücklich; der Brief bricht mit Inter
   also anders um. Das ist der bewusste Preis für die 1 ohne Fußbalken und für die
   Gewichtsoption.
5. **Eine Datei, drei Gewichte.** Inter liefert 100–900; die Pipeline baut nur
   `inter-variable.woff2` (400/600/700). Weitere Schnitte entstehen erst, wenn sie in
   `fonts/subset_fonts.py` in `BAUT` eingetragen sind — für den Brief ist das nicht nötig.

---

## 7. Lizenz

| Familie | Lizenz | Datei |
| :--- | :--- | :--- |
| Inter | SIL OFL 1.1 (© The Inter Project Authors) | `Nobara-PC: /home/moritz/repos/DIN-BriefNEO/website/fonts/LICENSE-Inter.txt` |

Liberation Sans ist am 2026-11-27 mit seiner Lizenzdatei entfallen. Aptos
(Microsoft) und Michelangelus (kommerziell) sind nie ausgeliefert worden und
bleiben ausschließlich lokal in `Nobara-PC: /home/moritz/repos/DIN-BriefNEO/fonts/`.

# 08 — Testbrief-Erzählung: Anlass × Besetzung × Lore-Anker (Plan & Konzeption)

> **Status:** Konzept / nicht begonnen  
> **Kontext:** Der heutige Testbrief zieht Absender und Empfänger zufällig aus dem Figurenpool und setzt sie in eine von vier festen Textvorlagen. Das erzeugt korrekte, aber beliebige Briefe: Die Figuren sind austauschbar, der Anlass ist immer derselbe Ton (Kündigung, Auskunftsersuchen, Lagebericht).  
> **Ziel:** Ein Brief, in dem eine Figur **in ihrer eigenen Welt** bleibt und mit einer **völlig anderen** Figur oder Institution in Kontakt tritt — Reklamation, Anfrage, Beschwerde. Der Kontrast zwischen kanonischer Figur und alltäglichem Vorgang ist der Witz, nicht der zitierte Kanon.

---

## 1. Die Idee in einem Satz

**Kanon trifft Alltag trifft falschen Ansprechpartner.** Harry Potter reklamiert einen defekten Zauberstab — beim Pink Panther. Die Figur bleibt kanonisch, der Vorgang ist alltäglich, der Empfänger ist bewusst unpassend.

Drei voneinander unabhängige Komponenten ergeben den Brief:

| Komponente | Quelle | Beispiel |
| :--- | :--- | :--- |
| **Absender** | Figuren-JSON | Harry Potter |
| **Anlass** | Szenario-Datenbank (**neu**) | Reklamation wegen Gewährleistung |
| **Empfänger** | Figuren-JSON, unabhängig gewählt | Pink Panther |

## 2. Drei Ebenen, strikt getrennt

- **Ebene A — kanonische Fakten.** Nur aus der Figuren-JSON. Diese Ebene erfindet nichts.
- **Ebene B — Briefanlass.** Eine erfundene Alltagshandlung (Reklamation, Bestellung, Mahnung, Termin, Auskunft, Dank). Ausdrücklich **kein** Kanon.
- **Ebene C — Verknüpfung.** Ein belegter Gegenstand, eine belegte Fähigkeit oder Eigenheit der Figur wird mit dem Anlass verbunden. Der Humor entsteht aus der Kombination, nicht aus erfundenen Fakten.

**Die harte Grenze** (bereits für den Generator vereinbart und hier unverändert gültig): Ein Satz darf eine unbelegte Tatsache nicht als gegeben behaupten. Harry darf einen defekten Zauberstab reklamieren, ohne dass der Defekt je Teil der Harry-Potter-Geschichte war — weil der Anlass als Szenario gekennzeichnet ist, nicht als Biografie.

## 3. Was die Figuren-JSON dafür wirklich hergibt

Der Brainstorm setzt voraus, dass „Beruf, Firma, Team, Gegenstände" vorhanden sind. Gemessen am Bestand (325 Figuren, Stand 2026-10-26) stimmt das nur teilweise:

| Feld | gefüllt | Tauglich als Ebene-A-Anker |
| :--- | :--- | :--- |
| `alias` | 304 / 325 | **ja** — häufigster Anker |
| `firma` | 273 / 325 | **eingeschränkt** — teils Berufs-Blob, Filterung nötig |
| `hooks` | **31 / 325** | **ja, aber selten** — einzige Quelle für Gegenstände |
| `beruf`, `team`, `geschlecht` | 0 / 325 | **nein — Felder existieren nicht** |
| `strasse`, `ort` | 325 | ja, für den Anschriftenblock |

Daraus folgt die wichtigste Anpassung: **Ein Anlass, der zwingend einen Gegenstand braucht, ist nur für Figuren mit `hooks` baubar** — also für 31 von 325. Alle anderen Anlässe müssen ohne Gegenstand auskommen (Auskunft, Termin, Dank) oder auf `alias`/`firma` aufsetzen.

## 4. Datenbestände bleiben getrennt

- Die Figuren-JSON (`/home/moritz/repos/DIN-BriefNEO/website/data/charaktere_konsolidiert.json`) wird **nicht** erweitert. Sie beschreibt Figuren, nicht Handlungen.
- Die Anlässe bekommen eine **eigene** Datei, z. B. `/home/moritz/repos/DIN-BriefNEO/website/data/briefanlaesse.json`. Sie beschreibt, was in einem fiktiven Brief passiert.
- Damit bleibt die Figuren-JSON weiterhin einzige Wahrheitsquelle für Charakterfakten, und die Anlass-Datei ist reine Dramaturgie. Kein Anlass darf Figurenwissen enthalten.

> [!warning] Beziehungen sind nicht ableitbar
> Dass Batman und Superman zum selben Franchise gehören, beweist keine Handlung zwischen ihnen. Verwandtschaft, Rivalität oder Auftraggeber-Verhältnis stehen **nicht** in der JSON und werden auch nicht hineininterpretiert.

## 5. Anlass-Katalog

Stufe 1 beginnt mit **drei** Anlässen, nicht mit allen acht — jeder Anlass braucht geprüfte Satzbausteine, und die kosten mehr Arbeit als die Auswahl.

| Anlass | Benötigte Zutaten | Ohne `hooks` möglich | Startpaket |
| :--- | :--- | :--- | :--- |
| Auskunftsanfrage | Thema, Empfänger | ja (`alias`, `firma`) | **Stufe 1** |
| Terminvereinbarung | Grund, Empfänger | ja | **Stufe 1** |
| Reklamation | Gegenstand, Defekt | nein — braucht `hooks` | **Stufe 1** |
| Beschwerde | Problem, Verursacher | ja | Stufe 2 |
| Bestellung | Gegenstand | nein | Stufe 2 |
| Bitte um Hilfe | Problem, Helfer | ja | Stufe 2 |
| Missverständnis | zwei Beteiligte | ja | Stufe 2 |
| Schadensersatz | Schaden, Verursacher | nein | Stufe 2 |
| Dankesschreiben | Anlass | ja | Stufe 2 |
| Mahnung | Forderung | ja | Stufe 2 |

Jeder Anlass definiert vier Slots: **Betreff**, **Einleitung**, **Sachverhalt**, **Schluss**. Ein Slot, dessen Zutat fehlt, entfällt — nicht der Brief.

## 6. Besetzung und Rollen

Der Generator wählt heute schon Absender und Empfänger getrennt und würfelt 0–3 Drittfiguren. Neu ist nur, dass diese Drittfiguren **Rollen** bekommen, die der Anlass vorgibt:

| Rolle | Pflicht? | Beispiel |
| :--- | :--- | :--- |
| Absender | ja | Harry Potter |
| Empfänger | ja | Pink Panther |
| Verursacher | nur bei Beschwerde/Schadensersatz | Spider-Man hat den Zauberstab beschädigt |
| Helfer | nur bei Bitte um Hilfe | Hulk liefert das Gegenmittel |
| Gegenstand | nur bei Reklamation/Bestellung/Ersatz | Zauberstab, Gadget, Kamera |

**Regel für die Auswahl:** Eine Kombination wird nur zugelassen, wenn alle Pflichtrollen besetzt sind. Fehlt eine Zutat, wird neu gewürfelt — niemals mit Platzhaltertext aufgefüllt.

Zwei Ausbaustufen der Besetzung:

1. **Zufall mit Filter** (Stufe 1): Absender und Empfänger aus verschiedenen Franchises, damit der Kontrast entsteht.
2. **Kuratiert überraschend** (Stufe 2): Liste bewusst komischer Paarungen, aus denen gewürfelt wird.

## 7. Satzbausteine und Sprachregeln

Die Bausteine folgen den Regeln des bestehenden Generators:

- Betreff als Nachtrag mit Doppelpunkt (`Reklamation: Zauberstab`), damit kein Kasusfehler entsteht.
- Anrede aus dem bürgerlichen Namen, neutraler Rückfall statt geratenem Geschlecht.
- Anschrift nach der Adressleiter: belegte Straße, sonst Gebäudename, sonst leer.
- Keine erfundenen Hausnummern, Postleitzahlen oder Straßen.
- Das Szenario darf ausgestalten („innert der Gewährleistungsfrist"), aber keine Biografie behaupten.

## 8. Guardrails gegen Schrott

1. **Ein Anlass ist kein Fakt.** Er wird im Code als Szenario geführt, nie in die Figuren-JSON geschrieben.
2. **Zutat fehlt → Slot entfällt.** Kein Füllsatz, der die Lücke rhetorisch überdeckt.
3. **Nur belegte Gegenstände.** Ein Gegenstand stammt aus `hooks`, `alias` oder `firma` — nicht aus dem Franchise-Namen. „Weil Harry Potter, also Zauberstab" ist eine Ableitung, kein Beleg.
4. **Keine Fachbegriffe erfinden.** Wo die JSON schweigt, bleibt der Text allgemein.
5. **Grammatik vor Witz.** Ein Satz, der nach Übersetzung klingt, ist ein Fehler, kein Stil.

## 9. Stufenplan

- **Stufe 1 — regelbasiert, ohne KI.** Drei Anlässe, feste Slots, Zufall mit Filter. Ergebnis: nachvollziehbare Briefe, deren Zutaten alle belegt sind.
- **Stufe 2 — mehrstufige Szenarien.** Mehrere Ereignisse, Verursacher und Helfer, kuratierte Paarungen. Deutlich mehr Rollen und Textvarianten.
- **Stufe 3 — optional KI.** Nur für freie Übergänge und überraschende Geschichten, **niemals** als Quelle kanonischer Fakten. Zurückgestellt; die Entscheidung gegen Built-in AI steht bereits (siehe [[DECISION-LOG]], Eintrag 2026-10-25), ein Modell käme nur per eigenem Schlüssel.

## 10. Was aus dem Brainstorm nicht übernommen wird

- **„Die kanonischen Fakten hast du bereits in der JSON"** — für `beruf`, `team`, `geschlecht` und Gegenstände stimmt das nicht (§3).
- **Acht Anlässe zum Start** — drei reichen, um das Prinzip zu prüfen.
- **Die Beispieltexte wörtlich** — sie enthalten Behauptungen („mein Zauberstab hat versagt"), die als Szenario markiert sein müssen, sonst wandern sie als Fakten in die Daten.
- **Die Idee, Humor über freie Textvarianten zu erzeugen** — der Kontrast entsteht aus der Besetzung, nicht aus immer neuen Formulierungen.

## 11. Offene Entscheidungen

- [ ] Beginnt Stufe 1 mit drei Anlässen (§5) oder nur mit der Reklamation als Machbarkeitsprobe?
- [ ] Sollen Absender und Empfänger **immer** aus verschiedenen Franchises kommen, oder ist die gleiche Welt auch erlaubt?
- [ ] Wird der Empfänger frei gewürfelt oder aus einer kuratierten Liste komischer Ansprechpartner gezogen?
- [ ] Bekommt die Anlass-Datei ein eigenes Schema mit Pflicht-/Optional-Slots (empfohlen), oder beginnen die Anlässe als Konstanten im JavaScript?

---

**Nächster Schritt:** Entscheidung zu §11, dann Spec für die Anlass-Datei und ein Prototyp mit drei Anlässen auf dem vorhandenen Generator.

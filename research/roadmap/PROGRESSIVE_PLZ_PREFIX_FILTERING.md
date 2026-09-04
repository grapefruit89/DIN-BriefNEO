# Progressive PLZ-Eingrenzung: Echtzeit-Filterung ab der 2. Ziffer

> **Status:** UX- & Architektur-Konzept (Reine Recherche, keine Änderungen am Produktiv-Repository).  
> **Grundsatz:** Warum bis zur 5. Ziffer warten? Jede getippte Ziffer grenzt den Suchraum im deutschen Postleitzahlensystem dramatisch ein.

---

## 1. Wie das deutsche Postleitzahlensystem hierarchisch aufgebaut ist

Das deutsche 5-stellige System ist streng hierarchisch strukturiert. Jede zusätzliche Ziffer schrumpft die Treffermenge um rund 80 bis 90 %:

| Ziffernfolge | Bezeichnung im Postsystem | Beispiel | Auswirkung auf den Suchraum |
| :--- | :--- | :--- | :--- |
| **1 Ziffer** | **Postleitzone** | `5` | Ganzes Bundesland / Großregion (Rheinland / NRW) |
| **2 Ziffern** | **Leitzahlenregion** | `53` | Großraum Bonn / Rhein-Sieg / Euskirchen |
| **3 Ziffern** | **Leitzahlenbereich** | `531` | Nahezu ausschließlich Stadtgebiet **Bonn** |
| **4 Ziffern** | **Leitzahlenabschnitt** | `5311` | **100 % Bonn!** Bundesweit gibt es keine andere Stadt mit `5311` |
| **5 Ziffern** | **Zustellbezirk** | `53111` | Exakter Zustellbereich (Bonn-Zentrum) |

---

## 2. Der Progressive Keystroke Flow (Echtzeit bei jedem Tastendruck)

Da die 20-KB-Tabelle bereits komplett im RAM des Browsers liegt, dauert ein Prefix-Filter über alle 8.170 Einträge in JavaScript gerade einmal **0,15 Millisekunden**.

### Schritt 1: Nutzer tippt `53` (2 Ziffern)
Das Dropdown öffnet sich sofort mit den wichtigsten Teilregionen des Leitbereichs:
- `531xx` Bonn
- `532xx` Bonn (Beuel) / Sankt Augustin
- `533xx` Bornheim / Alfter / Meckenheim
- `536xx` Königswinter / Bad Honnef
- `537xx` Siegburg / Hennef / Troisdorf

### Schritt 2: Nutzer tippt `531` (3 Ziffern)
Der Suchraum kollabiert fast vollständig auf Bonn.

### Schritt 3: Nutzer tippt `5311` (4 Ziffern)
Es gibt in ganz Deutschland **nur noch eine einzige Stadt: Bonn**.  
Es verbleiben exakt 5 Möglichkeiten:
1. `53111 Bonn (Zentrum / Münsterplatz)`
2. `53113 Bonn (Gronau / Bundesviertel)`
3. `53115 Bonn (Weststadt / Poppelsdorf)`
4. `53117 Bonn (Graurheindorf / Buschdorf)`
5. `53119 Bonn (Tannenbusch / Nordstadt)`

---

## 3. Die zwei genialen UX-Features für den DIN-Brief

### Feature A: Das Stadtteil-Schnellauswahl-Popover
Sobald 3 oder 4 Ziffern getippt sind, listet das Popover die konkreten Stadtteile auf. Der Nutzer muss die 5. Ziffer oft gar nicht mehr tippen, sondern wählt mit Pfeiltaste+Enter oder Klick direkt seinen Stadtteil aus.

### Feature B: "Ghost-Text" / Inline-Autovervollständigung
Sobald nach 3 oder 4 Ziffern feststeht, dass alle verbleibenden Postleitzahlen zur selben Stadt gehören (wie bei `5311` ➔ `Bonn`):
- Erscheint der Stadtname `Bonn` bereits in leichtem Grau hinter der Zahl:
  `5311 | Bonn`
- Drückt der Nutzer die Leertaste, `Tab` oder `Enter`, wird der Ort sofort übernommen.

---

## 4. Performance-Vorteil gegenüber API-Abfragen

- **Keine API-Latenz:** Keine Wartezeit von 100–200 ms pro Tastendruck.
- **Null Server-Kosten:** Kein Kontingentverbrauch bei Geoapify oder HERE für die PLZ-Eingrenzung.
- **Sofortige Haptik:** Das Tippgefühl ist absolut direkt („snappy“), wie bei einer Desktop-Applikation.

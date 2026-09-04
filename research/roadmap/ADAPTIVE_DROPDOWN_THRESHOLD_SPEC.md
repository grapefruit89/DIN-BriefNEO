# Schwellenwert-Logik für Adressvorschläge: „Erst ab <= 5 Treffern“ vs. „Immer die ersten 5“

> **Status:** Verbindliche UX- und Algorithmus-Spezifikation für DIN-Brief Neo.  
> **Kernfrage des Anwenders:**  
> *„Sollten wir Vorschläge erst anzeigen, sobald weniger als 6 Adressen übrig sind? Oder lieber immer die 'ersten 5', was immer auch die ersten 5 sind?“*

---

## 1. Die Analyse: Warum „Immer die ersten 5“ ein UX-Fehler ist

Der Anwender hat das Kernproblem intuitiv entlarvt:  
**„Was immer auch die ersten 5 sind?“**

Wenn der Nutzer bundesweit nach `Droste-Hülshoff-Straße 9` sucht, gibt es über 50 Treffer in Deutschland. Zeigt das System stur die „ersten 5“ an:
1. **Völlig willkürliche Auswahl:**  
   Die API liefert meistens die 5 größten Metropolen oder alphabetisch sortierte Städte:
   `1. München | 2. Hamburg | 3. Köln | 4. Dresden | 5. Oberhausen`
2. **Heiden ist nicht in den Top 5:**  
   Sucht der Nutzer Heiden (46359), hilft ihm die Top-5-Liste überhaupt nicht. Er sieht 5 fremde Großstädte, die ihn optisch ablenken.
3. **Flackerndes UI-Rauschen:**  
   Mit jedem Tastendruck springen die 5 vorgeschlagenen Städte wild hin und her. Das erzeugt visuelle Unruhe und stört den Schreibfluss.
4. **Täuschung über Vollständigkeit:**  
   Der Nutzer denkt fälschlicherweise, seine Stadt existiere nicht, weil sie nicht unter den 5 angezeigten Einträgen steht.

---

## 2. Die Lösung: Die adaptive 3-Zonen-Schwellenwert-Logik

Statt den Bildschirm mit willkürlichen Zufallstreffern zu fluten, unterteilt DIN-Brief Neo die Treffermenge in **drei glasklare Reaktionszonen**:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Treffermenge > 5 (Zone 1: Zu viel Rauschen)                            │
│ ➔ KEIN Dropdown! Nur dezenter Status: "50 Treffer – bitte PLZ tippen"  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Nutzer tippt PLZ-Ziffern ein
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Treffermenge 2 bis 5 (Zone 2: Perfekter Fokus)                          │
│ ➔ Sofortige Anzeige der kompakten 2-5 Optionen                          │
│ ➔ Mit einem einzigen Blick erfassbar (Millers Law: 5 ± 2)               │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Eine weitere Ziffer
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Treffermenge = 1 (Zone 3: Eindeutigkeit)                                │
│ ➔ ZERO-CLICK AUTOFILL! Sofortige automatische Einsetzung                │
│ ➔ Weder Klick noch Enter noch Handstand erforderlich                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Die 3 Zonen im Live-Beispiel durchgespielt

Beispiel: Der Nutzer sucht `Droste-Hülshoff-Straße 9, 46359 Heiden`.

### Phase 1: Der Nutzer hat nur `Droste-Hülshoff-Straße 9` getippt
- **Treffer in Deutschland:** 50 Orte.
- **Zone 1 aktiv (> 5 Treffer):**
  - Es klappt **kein** riesiges, verwirrendes Dropdown mit München, Hamburg oder Dresden auf.
  - Das Eingabefeld bleibt ruhig.
  - Ein dezenter grauer Hinweis unter dem Feld sagt schlicht:  
    *„50 Orte in Deutschland gefunden – bitte PLZ eingrenzen…“*

### Phase 2: Der Nutzer tippt im PLZ-Feld `4`
- **Treffer:** 21 Orte (immer noch Zone 1).
- Hinweis aktualisiert sich lautlos: *„21 Orte in PLZ-Bereich 4…“*

### Phase 3: Der Nutzer tippt `6` (Eingabe: `46`)
- **Treffer:** **Genau 2 Orte** (`46119 Oberhausen` und `46359 Heiden`).
- **Zone 2 springt an (Treffer <= 5):**
  - **Jetzt** öffnet sich blitzschnell eine winzige, 2-zeilige Auswahlliste:
    - `[1] Droste-Hülshoff-Straße 9, 46119 Oberhausen`
    - `[2] Droste-Hülshoff-Straße 9, 46359 Heiden`
  - Der Nutzer sieht beide Optionen auf einen Blick, ohne die Hand von der Tastatur zu nehmen!
  - `Pfeil-Unten` oder die Ziffer `2` würde Heiden sofort wählen.

### Phase 4: Der Nutzer tippt `3` (Eingabe: `463`)
- **Treffer:** **Genau 1 Ort bundesweit!**
- **Zone 3 springt an (Eindeutigkeit = 1):**
  - Das Dropdown schließt sich sofort.
  - Die Ziffern `59` und der Ortsname `Heiden` werden **vollautomatisch eingesetzt**.
  - Der Nutzer musste weder die Maus berühren noch Enter drücken noch den Kopf anstrengen!

---

## 4. Die Ausnahme: Der lokale Heimat-Bonus (Bonn-Bias)

Gibt es eine Ausnahme von der Regel, dass bei > 5 Treffern kein Dropdown erscheint?
**Ja, genau eine einzige:**
- Wenn eine der gefundenen Adressen im **lokalen Heimat-Radius** des Absenders liegt (z. B. Bonn / Rhein-Sieg-Kreis im Umkreis von 35 km).
- In diesem Fall darf **dieser eine lokale Treffer** als einzelner, hervorgehobener Favorit mit dem Tag *(Lokal)* angezeigt werden:  
  `⭐ Droste-Hülshoff-Straße 9, 53721 Siegburg (Region Bonn)`
- Liegt die gesuchte Adresse nicht in der Heimatregion (wie Heiden), greift sofort die saubere Schwellenwert-Logik aus Kapitel 2.

---

## 5. Fazit für die Implementierung

1. **Keine willkürlichen Top-5-Listen mehr:** Zeige niemals 5 zufällige Großstädte, wenn 50 Städte möglich sind.
2. **Schwellenwert <= 5 ist die magische Grenze:**  
   Erst wenn die Treffermenge handhabbar ist (2 bis 5), wird die Auswahlliste eingeblendet.
3. **Bei 1 Treffer sofort einsetzen:** Eindeutigkeit löst immer sofortigen Zero-Click Autofill aus.

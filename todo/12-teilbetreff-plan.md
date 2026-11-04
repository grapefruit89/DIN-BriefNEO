---
status: draft
type: concept
tags: [din5008, briefneo, plan, teilbetreff, zwischenueberschrift, textgliederung]
summary: "Plan für die Unterstützung von normgerechten Teilbetreffen (§ 20.9.3) als strukturierende Zwischenüberschriften in längeren Briefen."
---

# Teilbetreff (§ 20.9.3) — Zwischenüberschriften nach DIN 5008

**Normativer Bezug:** DIN 5008:2020-03, Abschnitt 20.9.3 („Teilbetreff“) & Anwendungsbeispiel E.3  
**Aufwand:** XS–S (~45 Minuten)  
**ROI:** ⭐⭐⭐ (Besonders wertvoll für mehrseitige Geschäftsbriefe, Gutachten, Stellungnahmen)

---

## 1. Problemstellung & Normvorgabe

DIN 5008 Abschnitt 20.9.3 regelt stichwortartige Inhaltsangaben zu einzelnen Briefabschnitten:

> *„Der Teilbetreff beginnt an der Fluchtlinie, schließt mit einem Punkt und wird durch Fettschrift und/oder Farbe hervorgehoben. Der Text wird unmittelbar angefügt.“*

Im Unterschied zum Hauptbetreff (der für den gesamten Brief gilt, über der Anrede steht und **keinen** Schlusspunkt hat):
- Steht der Teilbetreff **mitten im Brieftext** nach der Anrede.
- Schließt er **zwingend mit einem Punkt** ab (`.`).
- Geht der Text **unmittelbar** in derselben Zeile weiter oder schließt direkt als Absatz an.

### Norm-Beispiel (aus DIN 5008 Anhang E.3):
> **Lieferverzögerung bei Auftrag Nr. 4589.** Die von Ihnen bestellten Komponenten verzögern sich aufgrund von Lieferengpässen unseres Vorlieferanten bis voraussichtlich Ende nächster Woche.

---

## 2. Technische Umsetzung in DIN-BriefNEO

### Option A: Automatisches Snippet / Toolbar-Aktion
In der Format-Leiste oder per Shortcut (`Strg + Umschalt + T`):
- Fügt an der aktuellen Cursor-Position im Textfeld ein:
  ```html
  <p><strong class="din-teilbetreff">Neuer Teilbetreff.</strong> Hier folgt der erläuternde Text...</p>
  ```

### Option B: Markdown / Smart-Typing-Erkennung
Wenn der Nutzer am Zeilenanfang im Textfeld Folgendes tippt:
`## 1. Sachverhalt` + `Enter` oder `**1. Sachverhalt.**`
Wird es automatisch in einen DIN-konformen Teilbetreff formatiert:
- Fettschrift aktiv
- Automatischer Punkt am Ende, falls vergessen
- Ein Leerzeichen vor dem Folgetext

### CSS-Styling (`sheet.css` & `sheet-multipage.css`):
```css
/* DIN 5008 Teilbetreff im Fließtext */
.din-teilbetreff,
#text strong:first-child {
  font-weight: 700;
  color: var(--blatt-text);
}
```

---

## 3. Akzeptanzkriterien
- [ ] Teilbetreff schließt verlässlich mit einem Punkt ab.
- [ ] Bricht sauber im mehrseitigen Fließtext um (`break-after: avoid;` verhindert verwaiste Zwischenüberschriften am Seitenende).
- [ ] Funktioniert ohne externe Dependencies oder komplexe Rich-Text-Frameworks.

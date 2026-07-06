---
id: din-5008-precise-layout-lessons
title: "DIN 5008 Layout Principles (Lessons Learned from LaTeX)"
type: guide
status: active
tags: [obsidian, core, documentation, rules, layout]
created: "2026-07-06"
updated: "2026-07-06"
doc_links: []
code_links: []
---

# DIN 5008 Layout Principles (Lessons Learned from LaTeX)

In der frühen Explorationsphase von DIN-Brief NEO haben wir das LaTeX-Paket `GerLaTeXLetter` tiefgehend analysiert. Während LaTeX für eine reine Web-Applikation (Vanilla JS, offline-first) ungeeignet ist, lieferte es entscheidende konzeptionelle Erkenntnisse ("Lessons Learned"), die direkt in unsere CSS-Architektur eingeflossen sind.

## 1. Absolute Koordinaten statt relativer Abstände
**Die LaTeX-Philosophie:** Ein LaTeX-Brief definiert das Layout nicht über relative Margins (z. B. "mach den Abstand nach oben etwas größer"), sondern über absolute Koordinaten auf einem A4-Gitter (z. B. `\setplength{toaddrvpos}{45mm}`).

**Unsere Übernahme ins Web:** 
Wir haben das Box-Model-Denken (Margins, Paddings, relative Prozentwerte) für das Seitenlayout verworfen. Stattdessen nutzen wir in `layout.css`:
- **CSS Custom Properties (Typed)**: `--pos-y-address: 45mm;`
- **Absolute Positionierung**: Alle semantischen Zonen (`<din-address-zone>`, `<din-infoblock>`) werden absolut innerhalb der `<din-page>` positioniert.
- Dadurch garantieren wir pixel- und millimetergenaue PDF-Ausgaben, die exakt in ein DIN-Fensterkuvert passen.

## 2. Strikte Trennung von Form A und Form B
**Die LaTeX-Philosophie:** LaTeX-Klassen bieten harte Schalter für Form A (hoher Briefkopf) und Form B (niedriger Briefkopf), wodurch sich das gesamte Y-Koordinatensystem verschiebt.

**Unsere Übernahme ins Web:**
Wir spiegeln diese Binärlogik über CSS-Variablen-Scopes. Ein simpler Toggle auf dem Root-Element (`<html data-form="A">`) überschreibt die Y-Koordinaten der Variablen. Kein JavaScript muss die Zonen berechnen; das CSS-Grid adaptiert sich nahtlos.

## 3. Falz- und Lochmarken (Fold & Punch Marks)
**Die LaTeX-Philosophie:** Millimetergenaue Linien am linken Blattrand, um das Lochen und Falten für Kuverts zu erleichtern.

**Unsere Übernahme ins Web:**
Wir zeichnen diese Marken rein mit CSS (`::before` und `::after` Pseudo-Elementen) an fixen Y-Koordinaten (z.B. 87mm, 105mm, 148.5mm, 192mm, 210mm). Diese Marken sind im `print`-Stylesheet deaktivierbar, falls der Nutzer Blanko-Briefpapier verwendet.

## 4. Semantische Datenstruktur
**Die LaTeX-Philosophie:** Trennung von Daten (`\setkomavar{fromname}{Max Mustermann}`) und Repräsentation (dem finalen Layout).

**Unsere Übernahme ins Web:**
- Wir verwenden semantische Custom Elements (`<din-sender>`, `<din-recipient>`).
- Wir trennen visuelle Struktur (CSS) strikt von den Inhalten. 

---

**Fazit:** LaTeX hat uns gelehrt, dass man für Briefe nicht in *Fließtext-Dokumenten*, sondern in *technischen Zeichnungen* denken muss. DIN-Brief NEO ist im Kern keine Textverarbeitung, sondern eine technische Zeichnung (Gitter) auf einem A4-Canvas, implementiert mit modernsten Web-Standards.

---
id: adr-kiss-minimal-js
title: "ADR-KISS-MINIMAL-JS: 80/20-Prinzip, pragmatische FOUC-Toleranz und Minimal-JavaScript"
type: adr
status: active
created: '2026-11-20'
updated: '2026-11-20'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
  - kiss
  - yagni
summary: "Dokumentation und Spezifikation für ADR-KISS-MINIMAL-JS: 80/20-Prinzip, pragmatische FOUC-Toleranz und Minimal-JavaScript."
doc_links:
  - constitution
  - Immutable-Law-Catalog
  - ADR-JS
  - ADR-HTML
code_links:
  - website/js/boot.js
  - website/js/boot-state.js
  - website/js/main.js
  - website/css/sidebar.css
depends_on:
---
# ADR-KISS-MINIMAL-JS: 80/20-Prinzip, pragmatische FOUC-Toleranz und Minimal-JavaScript

## Status

**Angenommen** (2026-11-20). Verbindliche Architektur-Richtlinie für das gesamte DIN-BriefNEO-Projekt `[KISS]` `[SSOT]`.

---

## 1. Kontext & Problemstellung

Im Streben nach perfekter, unterbrechungsfreier Darstellung (Zero-FOUC) gerät eine Offline-First-Webanwendung regelmäßig in das fundamentale Web-Trilemma:

$$\text{JavaScript eliminieren} \;\longleftrightarrow\; \text{FOUC verhindern} \;\longleftrightarrow\; \text{Schlankes CSS/HTML}$$

1. **HTML auf Platte ist statisch:** Standardmäßig sind Checkboxen unmarkiert oder Form B gesetzt.
2. **CSS ist speicherblind:** CSS kann gespeicherte Nutzerdaten (`localStorage`) nicht direkt lesen, sondern sieht nur das DOM.
3. **Das FOUC-Paradoxon:**  
   Versucht man, UI-Zustände rein deklarativ über native Checkboxen und CSS `:has(:checked)` zu steuern, rendert der Browser im ersten Frame die starren HTML-Defaults. Stellt JavaScript danach den Speicherstand wieder her, zuckt die Oberfläche (**FOUC**).
4. **Die Überengineering-Falle:**  
   Um auch noch das letzte Millisekunden-Zucken unter künstlicher CPU-Drosselung (6× CPU-Throttle, 150 ms Latenz) zu eliminieren, wurden schrittweise immer mehr JavaScript-Schichten aufgetürmt: Render-blockierende Head-Skripte (`boot.js`), Seeder am Body-Ende (`boot-state.js`, 188 Zeilen), CSS-Masken (`visibility: hidden`) und mehrfache Schreiber in ESM-Modulen.

---

## 2. Das Gesetz des abnehmenden Ertrags (Law of Diminishing Returns) `[KISS]` `[YAGNI]`

Der Aufwand zur vollständigen FOUC-Beseitigung verhält sich asymptotisch und folgt dem Gesetz des abnehmenden Ertrags:

$$\begin{aligned}
\mathbf{85\,\%\;\text{Ergebnis}} &\implies \mathbf{1\times}\;\text{JavaScript (einfach, robust, langlebig)} \\
\mathbf{95\,\%\;\text{Ergebnis}} &\implies \mathbf{3\times}\;\text{JavaScript (Sync-Helfer, Hilfsklassen)} \\
\mathbf{99\,\%\;\text{Ergebnis}} &\implies \mathbf{10\times}\;\text{JavaScript (Seeder, MutationObserver, Masken, Rennbedingungen)}
\end{aligned}$$

Wenn wir für die letzten 5 bis 10 % Perfektionismus plötzlich das Zehnfache an Code, Fehlerquellen und Synchronisationsschichten mitschleppen müssen, **ist der Preis unverhältnismäßig hoch**.

> 🧭 **Leitprinzip `[Occam's Razor]` `[KISS]`:**  
> **Im Zweifel gewinnt immer die schlankere, JavaScript-ärmere Lösung.**  
> Ausnahmen gibt es nur dann, wenn ein Feature für den Nutzer so unverzichtbar ist (wie z. B. die Address Intelligence oder das DIN-5008-Zeilenlimit), dass der Code-Aufwand einen echten Gegenwert liefert.

---

## 3. Betrachtete Optionen

| Option | Ansatz | Vorteile | Nachteile | Bewertung |
| :--- | :--- | :--- | :--- | :--- |
| **A: Maximaler FOUC-Schutz um jeden Preis** | Jeder Regler, jedes Feld und jeder Schalter wird vor dem Paint per JS gespiegelt und maskiert. | 100 % zuckungsfrei auch bei 6× CPU-Drosselung. | JS-Explosion, Seeder-Türme, doppelte Schreiber, fragile Timing-Rennbedingungen. | ❌ **Abgelehnt (Overengineering `[YAGNI]`)** |
| **B: Radikales No-JS ohne FOUC-Schutz** | Rein statisches HTML/CSS; JS lädt spät und unblockiert; keine Vorab-Attribute. | Minimales JavaScript. | Massiver FOUC: Weißer Blitz bei Nacht (Dark Mode) und A4-Blattsprung (Form A vs. B). | ❌ **Abgelehnt (Mangelhafte UX)** |
| **C: 80/20 KISS-Prinzip (Pragmatische FOUC-Toleranz)** | JS nur dort, wo FOUC echte Schmerzen verursacht (Theme & Blattgeometrie). Peripherie-FOUC wird akzeptiert. | Schlankes JS, null DOM-Spiegelungs-Overhead, maximale Stabilität, 95 % FOUC eliminiert. | Checkboxen in der Seitenleiste können nach 30 ms auf *aktiv* umspringen. | ✅ **Gewählt (Kanonischer Standard `[KISS]`)** |

---

## 4. Die Entscheidung

**Wir entscheiden uns projektweit für Option C: Konsequentes 80/20-KISS-Prinzip mit pragmatischer FOUC-Toleranz `[KISS]` `[Second-Order Thinking]`.**

### Verbindliche Kernregeln:

#### Regel 1: Primat des minimalen JavaScripts (Vanilla-First `[Unix Philosophy]`)
JavaScript darf **ausschließlich** für Aufgaben eingesetzt werden, die sich mit modernem HTML5 und CSS3 nachweislich **nicht** lösen lassen (Berechnungen, Dateisystem-Export/Import, Textsanitisierung, Druckvorstufe). Zustände, die nativ im DOM leben können (z. B. Checkboxen, native Dialoge, Popovers), werden nicht in künstlichen JS-Zuständen dupliziert.

#### Regel 2: Die 80/20-FOUC-Toleranzgrenze `[Occam's Razor]`
* **Streng geschützt vor dem First Paint (Die kritischen 20 %):**
  * **Theme (Dark / Light):** Der grelle weiße Bildschirmblitz im Nachtmodus ist inakzeptabel.
  * **Blatt-Geometrie (Form A / Form B):** Ein vertikales Springen des gesamten A4-Briefbogens ist inakzeptabel.
  * *Mechanismus:* Wird kompakt und synchron im `<head>` via `boot.js` auf `<html>` gesetzt (`data-theme`, `data-layout`).
* **Pragmatisch toleriert nach dem Paint (Die vernachlässigbaren 80 % `[YAGNI]`):**
  * Checkboxen, Schalter, Sliders und Dropdowns in der Seitenleiste (`#seitenleiste`).
  * Wenn ein Schalter (z. B. Anlagen, Fußzeile, Falzmarken) 20–50 ms nach dem Kaltstart sichtbar auf seinen gespeicherten Haken umspringt, **ist das normales, akzeptiertes Web-Verhalten** (analog zu GitHub, Gmail etc.).
  * Es werden **keine** zusätzlichen JS-Seeder, Event-Schleifen oder Attribut-Spiegel eingeführt, nur um diesen Peripherie-Sprung zu kaschieren.

#### Regel 3: Verbot von JS-Reparaturtürmen (Anti-Pattern-Bann `[Poka-Yoke]`)
Es ist verboten, bestehendes natives Verhalten (wie `:has(:checked)`) durch zusätzliche JS-Schreiber (`setAttribute('data-...')`) zu ummanteln, wenn der einzige Zweck darin besteht, einen theoretischen Micro-FOUC auf gedrosselten Mobilgeräten zu beseitigen `[Second-Order Thinking]`.

---

## 5. Konsequenzen & Leitlinien für Entwickler & KI-Agenten

### Positive Auswirkungen
1. **Kein Code-Aufblähen:** Verhindert das Hinzufügen weiterer hunderter Zeilen Synchronisationscode bei jedem neuen Feature `[KISS]`.
2. **Klares Stopp-Signal für Refactorings:** Wenn eine Diskussion entsteht, ob ein Schalter vor oder nach dem Paint gesetzt werden muss, beendet diese ADR die Debatte zugunsten von Einfachheit.
3. **Echtes KISS:** Die Codebasis bleibt für Menschen und KI-Modelle transparent, wartbar und deterministisch.

### Negative / Akzeptierte Auswirkungen
* Auf extrem langsamen Geräten oder unter künstlicher CPU-Drosselung (6× Slowdown) kann ein Seitenleisten-Schalter kurz sichtbar umspringen. Dieser kosmetische Randfall wird bewusst in Kauf genommen.

---

## 6. Verwandte Dokumente & Semantische Anker

* **Katalog-Referenzen:** `[KISS]`, `[YAGNI]`, `[Occam's Razor]`, `[Second-Order Thinking]`, `[Unix Philosophy]`, `[Poka-Yoke]`, `[SSOT]`
* [[constitution]] — Verfassungsprinzipien: Longevity, Zero-Framework, KISS
* [[Immutable-Law-Catalog]] — Gesetze A1 (Zero-Build), A22 (Kein CSS-in-JS), A60 (Natives Verhalten vor JS-Zustand)
* [[ADR-JS]] — JavaScript-Architektur und Modulgrenzen
* [[ADR-HTML]] — Semantische HTML-Struktur und Native Controls

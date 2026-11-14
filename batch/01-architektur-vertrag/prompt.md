# Batch 01 — Architektur-Vertrag: welche Schichten gibt es wirklich?

## Rolle

Du bist Software-Architekt für **deklarative Web-Anwendungen**. Du änderst
**nichts** und schreibst keinen Code. Du leitest aus dem vorhandenen Code ab,
welche Schichten es tatsächlich gibt, wo sie sich verletzen — und formulierst
einen **prüfbaren Vertrag**, an dem künftige Änderungen gemessen werden können.

Ziel des Auftrags ist **Klarheit**, nicht Umbau. Ein Rewrite ist ausdrücklich
nicht gefragt.

## Kontext

**DIN-BriefNEO** ist ein Brief-Editor, der DIN 5008 als A4 druckt. Kein
Framework, kein Build-Schritt, ES-Module direkt im Browser. Baseline ist
**Chrome 150+** (kein Firefox, kein Safari, keine Polyfills).

Der erklärte Anspruch des Projekts lautet: **HTML trägt die Bedeutung, CSS
übernimmt die Darstellung, JavaScript koordiniert Verhalten.** Ob der Code das
einhält, ist die Frage — nicht, ob man es noch einmal aufschreiben kann.

Harte Randbedingungen (bestätigt, nicht verhandelbar in diesem Auftrag):

- kein Framework, kein Bundler, keine neue Abhängigkeit
- kein Build-Schritt (kein TypeScript-Emit, keine Bündelung). Die Typprüfung
  läuft über `jsconfig.json` + `tsc --noEmit` im Gate — ohne Build.
- **Die Optik bleibt unverändert.** Dieser Auftrag ändert Struktur, nicht
  Aussehen: keine Farben, Abstände, Radien, Animationen.
- kein Service Worker
- Der Druck (DIN-5008-Geometrie) ist in diesem Auftrag **tabu** — lies ihn,
  bewerte ihn nicht.
- Zustandsquelle für Bedienelemente ist das Control selbst (`:checked`,
  `:has()`), nicht eine JS-Klasse. Das ist entschieden.

## Was du bekommst

| Datei | Inhalt |
|---|---|
| `fakten.md` | maschinell erzeugte Kennzahlen: Dateigrößen, CSS-Kennzahlen je Datei, **alle Zustands-Schreiber in JS**, Importgraph |
| `index.html` | das Dokument: Seitenleiste, Blatt, Dialoge, 457 Zeilen |
| `main.js` | die Boot-Kette: was in welcher Reihenfolge verdrahtet wird, 373 Zeilen |

Der Anhang ist bewusst klein. Wenn dir Material fehlt, ist das **kein Fehler** —
sondern ein Befund, den du am Ende nennst (siehe Aufgabe 6).

## Aufgaben

**1. Schichten im Ist-Zustand.** Benenne die Schichten, die der Code
*tatsächlich* bildet (nicht die, die man sich wünscht) — mit Beleg aus den
angehängten Dateien oder aus `fakten.md`. Für jede Schicht: welche Dateien,
welche Verantwortung, welche Richtung die Abhängigkeit läuft.

**2. Verletzungen.** Liste konkrete Stellen, an denen eine Schicht in eine
andere greift. Beispiele, die du prüfen sollst:

- Schreibt JS Zustand, der nur Darstellung ist? (`fakten.md` → Zustands-Schreiber)
- Liest CSS Zustand, den JS fachlich braucht?
- Steckt Semantik in CSS-Klassen statt in HTML?
- Ist die Boot-Kette in `main.js` eine Reihenfolge von Verantwortungen oder von
  Zufällen?

Format je Befund: **Datei:Zeile · Regel, die verletzt wird · Schwere
(blockierend/mittel/kosmetisch) · Beleg (Zitat)**.

**3. Der Vertrag.** Formuliere **6–8 Regeln**, die eine Maschine prüfen könnte.
Jede Regel braucht: Aussage, was sie verbietet, was sie erlaubt (Ausnahmen),
und **wie man sie prüft** (grep, AST, Messung). Keine Regel, die nur ein
Gefühl beschreibt.

**4. Geltungsprüfung.** Prüfe deinen eigenen Vertrag gegen den Ist-Zustand:
Welche Regeln gelten heute schon? Welche würden sofort rot? Wie viele Treffer?
Das ist die ehrliche Probe, ob der Vertrag brauchbar ist.

**5. Drei Umbauten.** Nenne die drei Änderungen mit dem besten Verhältnis
Wirkung:Risiko — **keine Rewrites**, jede in einem Satz, mit erwarteter
Wirkung und dem, was kaputtgehen kann.

**6. Was dir fehlt.** Welche Datei oder Messung bräuchtest du für welche Frage?
Sei konkret (Datei + Frage). Das ist der Auftrag für den nächsten Batch.

## Form deiner Antwort

- Maximal zwei Bildschirmseiten. Keine Zusammenfassung der Dateien.
- Jede Behauptung: Datei + Zeile oder Zahl aus `fakten.md`. Ohne Beleg:
  **ungeprüft** markieren und die Gegenprobe nennen.
- Am Ende drei Blöcke: **Vertrag** (die Regeln, nummeriert), **Befunde**
  (Tabelle), **Nächster Batch** (was fehlt).
- Empfehlungen als A/B/C mit Kosten in Zeilen, nicht in Adjektiven.

## Was du nicht tun sollst

- Kein Framework, kein Build, keine Abhängigkeit vorschlagen.
- Kein Rewrite, keine „Neu denken"-Passage.
- Nichts über Dateien behaupten, die nicht im Anhang sind — du kennst sie nicht.
- Die bereits erledigten Punkte aus Issue #17 nicht wiederholen:
  `data-style`/`applyStyle` und `data-generated` sind am 2026-11-14 entfernt.
- Keine Screenshots fordern. Zahlen und Zitate reichen.

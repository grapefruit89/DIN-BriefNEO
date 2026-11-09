---
status: draft
type: concept
tags: [din5008, briefneo, plan, copyfitting, kompaktsatz, typografie]
summary: "Spezifikationsplan für normkonformes Zero-JS-Kompaktsatz-Copyfitting nach DIN 5008 Toleranzbereichen (Schriftgröße, Zeilenabstand, Absatzabstand, Unterschrift)."
---

# Zero-JS Kompaktsatz nach DIN 5008 – Spezifikationsplan

**Ziel:** Typografische Raumersparnis (4 bis 8 Zeilen) zur Vermeidung einer zweiten Seite bei knapp überlaufenden Briefen – vollständig **Zero-JS**, rein deklarativ über CSS `:has()` und unter striktem Erhalt der 25-mm-Fluchtlinie nach DIN 5008:2020-03.

---

## 1. Problemstellung & Verfassungskontext

Frühere Versuche eines dynamischen „Micro-Copyfittings“ (siehe [`rejected/07-micro-copyfitting-plan.md`](rejected/07-micro-copyfitting-plan.md)) scheiterten an zwei Kernproblemen:
1. **Experimentelles CSS `text-fit` / JS-basiertes Stauchen beim Tippen:** Führte in Chromium bei `contenteditable` zu unkontrollierten Font-Kollapsen (Schrift schrumpfte während der aktiven Eingabe auf 30% der Zeilenhöhe).
2. **Kollision mit Gesetz A49 & A60:** Imperative JS-Berechnungen (`getBoundingClientRect`, Layout-Polling, Klick-Trigger) verletzen das Verfassungsgebot der performanten, deklarativen UI.

**Architektur-Prämisse für diesen Plan:**
- **Zero-JS:** Keine MutationObserver, keine Pixel-Berechnungen, kein DOM-Layout-Polling zur Laufzeit (**Law A49**).
- **Rein deklarativer Schalter:** Zustand lebt ausschließlich im nativen Switch der Seitenleiste (**Law A60**).
- **Fluchtlinienerhalt:** Der linke Rand bleibt fest bei **25 mm**. Ein Versatz des Fließtexts nach links um 5 mm wird verworfen, da er die visuelle Fluchtlinie bricht und einen störenden Treppenversatz zum Adressfeld erzeugt.

---

## 2. Die typografischen Hebel der DIN 5008 (Soll-Toleranzen)

Die DIN 5008:2020-03 lässt bei vertikalen Abständen und Schriftgraden gezielte Spielräume, die ohne Normverletzung erhebliche Zeilengewinne ermöglichen:

| Parameter | DIN 5008 Standard | Kompaktsatz-Toleranz | Platzgewinn (DIN A4) | Normbezug |
|---|---|---|---|---|
| **Schriftgröße** | 11–12 pt (empfohlen) | **10 pt** | ~2–3 Umbruchzeilen horizontal | DIN 5008 Abschn. 8.1 (10 pt als Untergrenze zulässig) |
| **Zeilenabstand** | `1.40` bis `1.50` (einzeilig) | **`1.30`** | ~4–5 Zeilen vertikal | DIN 5008 Abschn. 8.2 (Schutz vor Ober-/Unterlängenkollision) |
| **Absatzabstand** | `1.0lh` (volle Leerzeile, ~4,2 mm) | **`0.65lh`** (~2,8 mm) | ~1–2 Zeilen pro 3 Absätze | DIN 5008 Abschn. 20 (optische Trennung gewahrt) |
| **Unterschrift-Abstand** | 2–3 Leerzeilen | **1 Leerzeile (`1.0lh`)** | ~4–8 mm vertikal | DIN 5008 Abschn. 20.10 (Minimum: 1 Leerzeile für Namenszug) |
| **Briefform-Tipp** | Form B (Text ab 100,5 mm) | **Form A (Text ab 80,5 mm)** | **+20 mm Vertikalraum** (~5 volle Zeilen) | DIN 5008 Abschn. 5.1 vs. 5.2 (100% normkonform) |

---

## 3. Technische Umsetzung (Zero-JS)

### 3.1 Nativer Schalter in der Seitenleiste (`website/index.html`)

In `website/index.html` wird in der Gruppe „Layout & Norm" ein nativer HTML-Switch platziert:

```html
<label for="toggle-kompaktsatz" class="seitenleiste-label">Kompaktsatz (DIN-Toleranz)</label>
<input type="checkbox" switch id="toggle-kompaktsatz">
```

### 3.2 Deklaratives CSS (`website/css/sheet-common.css`)

In `website/css/sheet-common.css` steuert der Zustand des Schalters die Typografie-Tokens des Briefbogens:

```css
/* ==========================================================================
   DIN-5008 Kompaktsatz: Typografische Soll-Toleranzen zur Einsparung von 4–8 Zeilen
   ========================================================================== */
:root:has(#toggle-kompaktsatz:checked) din-blatt {
  --line-height-body: 1.30;
  --para-spacing: 0.65lh;
  --unterschrift-abstand: 1lh;
}

:root:has(#toggle-kompaktsatz:checked) #text {
  font-size: 10pt;
  line-height: var(--line-height-body);
}

:root:has(#toggle-kompaktsatz:checked) #text p {
  margin-block-end: var(--para-spacing);
}

:root:has(#toggle-kompaktsatz:checked) #unterschrift {
  margin-block-start: var(--unterschrift-abstand);
}
```

### 3.3 UI-Hinweis auf Form A

Wenn der Brief selbst im Kompaktsatz noch überläuft (`[data-ueberlauf]`), empfiehlt ein kleiner, rein deklarativer Tooltip oder Hinweistext in der Seitenleiste den Wechsel auf **Form A** (+20 mm zusätzlicher Satzspiegel):

```css
:root:has(#toggle-kompaktsatz:checked):has([data-ueberlauf]) .hinweis-form-a {
  display: block;
}
```

---

## 4. Akzeptanzkriterien

1. **Kein Layout-Kollaps:** Das Tippen im Editor führt bei aktiviertem Kompaktsatz zu keinerlei Cursor-Sprüngen oder Schrumpfungseffekten.
2. **Fluchtlinie exakt 25 mm:** Der Fließtext bricht bündig an derselben Fluchtlinie wie Betreff und Anschriftfeld um.
3. **Persistenz:** Der Zustand von `#toggle-kompaktsatz` wird wie alle anderen Schalter automatisch in `din_settings` über den bestehenden Settings-Controller serialisiert.
4. **Zero-JS:** Keine zusätzlichen Event-Listener oder imperativen Skripte erforderlich.

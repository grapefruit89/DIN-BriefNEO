# 07 — Micro-Copyfitting & 1-Seiten-Kompaktsatz (Plan & Konzeption)

> **Status:** Zurückgestellt / Konzeptphase  
> **Kontext:** Der ursprüngliche Switch `#toggle-copyfit` („Kompaktsatz (1 Seite)“) und experimentelles CSS `text-fit` wurden am 2026-10-24 vollständig aus dem Produktivcode entfernt, da sie unkontrollierte Schrumpfungen auf bis zu 30% der Zeilenhöhe im aktiven Schreibzustand verursachten und das Layout zerstörten.  
> **Ziel:** Saubere, deterministische Konzeption für den Fall, dass ein Brieftext kontrolliert auf genau eine Seite eingepasst werden soll — ohne Font-Kollaps während der Bearbeitung.

---

## 1. Retrospektive & Fehleranalyse (Warum der alte Ansatz scheiterte)

### Das Problem
- **CSS `text-fit: shrink`:** Ein experimentelles CSS-Feature (CSS Text 5). In Chromium führte die Kombination aus `contenteditable`, dynamischer Texteingabe und Container-Stauchung dazu, dass Zeilen und Boxen beim direkten Hineintippen oder bei Fokus-Ereignissen auf 30% ihrer nominellen Höhe kollabierten und Text unleserlich mikroskopisch verkleinert wurde.
- **Pauschale Container-Stauchung:** Globale Selektoren wirkten unvorhersehbar auf das Anschriftfeld, den Infoblock und den Fließtext gleichzeitig.
- **Interaktiver Störfaktor:** Stauchung zur Laufzeit während des Tippens irritiert den Nutzer massiv, da der Cursor springt und Schriften flackern.

---

## 2. Grundsätze für eine zukünftige saubere Implementierung

1. **Kein automatisches Live-Schrumpfen beim Tippen:**
   - Während der Bearbeitung bleibt die Schriftgröße aller Felder zu 100% starr auf dem DIN-5008-Standard (10pt bzw. 10.5pt, Einzeiler 1.4 Zeilenhöhe).
2. **Mehrseiten-Unterstützung geht vor Schrift-Quetschung:**
   - Ein Brief, der den Satzspiegel sprengt, soll normgerecht auf Seite 2 umbrechen ([`01-mehrseiten-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/01-mehrseiten-plan.md)), anstatt unleserlich zusammengepresst zu werden.
3. **Diskrete typografische Stufen statt stufenlosem `text-fit`:**
   - Wenn ein Kompaktsatz aktiv angefordert wird, dürfen nur typografisch definierte, standardkonforme Parameter dezent variieren:
     - Zeilenabstand: `1.4` → `1.32`
     - Absatzabstand (`margin-block-end` von `<p>`): `1.0em` → `0.75em`
     - Abstand vor Grußformel / Unterschrift: dezent reduzieren (z. B. 2 statt 3 Leerzeilen).
   - Die Grundschriftgröße des Fließtextes darf niemals unter 9.5pt fallen.
4. **Diskreter Button / Aktions-Trigger statt Live-Switch:**
   - Statt eines persistenten Schalters, der CSS-Regeln permanent verbiegt, könnte ein Button „Auf 1 Seite einpassen“ einmalig prüfen:
     - Passt der Text mit 3% Stauchung auf eine Seite? Wenn ja, dezenten Kompaktsatz anwenden.
     - Reicht das nicht aus? Klare Meldung an den Nutzer: „Text ist zu lang für eine Seite. Bitte Text kürzen oder zweiten Bogen drucken.“

---

## 3. Offene Fragen & Kriterien vor Re-Implementierung

- [ ] Ist Kompaktsatz überhaupt noch nötig, sobald [`01-mehrseiten-plan.md`](file:///home/moritz/repos/DIN-BriefNEO/todo/01-mehrseiten-plan.md) implementiert ist? (Ein sauberer zweiter Bogen ist nach DIN 5008 typografisch sauberer als gequetschter Satz).
- [ ] Wenn ja: Reine Schalter-Logik über eine geprüfte CSS-Klasse `.layout-compact` auf `<din-blatt>`, die strikt nur auf `#text` wirkt und niemals Einzeiler oder Adressfelder berührt.

# Batch 04 — Seitenleiste: Struktur und Optik trennen (SKIZZE)

> Noch nicht ausformuliert. Nur die Punkte, die nicht verloren gehen dürfen.
> Ein Punkt, der schon beantwortet ist, steht hier **nicht** mehr als Aufgabe —
> sonst meldet der Reviewer Erledigtes erneut (siehe `batch/README.md`).

## Frage

`sidebar.css` hat 1.282 Zeilen und **111 ID-Selektor-Vorkommen**. Darin liegen
zwei Dinge gleichzeitig: die Gestaltung **und** der Strukturvertrag des
Modus-Wechsels. Was gehört wohin, und was bricht, wenn ein Design die Datei
ersetzt?

## Geplante Dateien

- `website/css/sidebar.css`
- `website/index.html`
- `batch/04-seitenleiste-struktur/fakten.md` (generiert, siehe B73)

## Was zu messen ist

- [ ] Die 7 Modus-Regeln: welche tragen Struktur (Sichtbarkeit, Fokusfolge),
  welche nur Optik? (Aus Batch 01: 6 von 7 hängen an Design-Adressen)
- [ ] Mutationstest: `styleSheets[…].disabled = true` — welche Zonen und
  Fokusziele verschwinden, welche nicht? Das ist die Gegenprobe zur Trennung:
  was ein fremdes Design **nicht** kaputt machen darf, gehört in `base.css`.
- [ ] Zonen-Namen gegen Inhalt prüfen (B75 hat den Namen „Daten" gemeldet und
  die Zuordnung belegt) — hier: welche Namen bleiben falsch, nachdem B75 die
  Fokusziele gezählt hat?

## Notizen

- Der `data-nur`-Strukturvertrag aus Batch 01 ist **abgelehnt**. Diese Aufgabe
  ist ohne ihn zu lösen — sonst bleibt sie liegen.
- Optik bleibt unverändert; das ist ein Struktur-Auftrag.
- Ergebnis darf sein: „die Trennung ist nicht ohne Umbau der Moduslogik
  möglich" — dann ist das der Befund, kein Fehlschlag.
- **Überschneidung mit B59:** die Bildschirm-`!important` in
  `sheet-multipage.css` halten `data-seiten="2"` zusammen (gemessen in B92).
  Wer die Kaskade umbaut, muss die Modus-Regeln dieser Datei mit im Blick
  haben — aber das ist B59, nicht diese Scheibe.

# Batch 04 — Seitenleiste: Struktur und Optik trennen (SKIZZE)

> Noch nicht ausformuliert. Nur die Punkte, die nicht verloren gehen dürfen.

## Frage

`sidebar.css` hat 1241 Zeilen und **118 ID-Selektor-Vorkommen**. Darin liegen
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
- [ ] Fokusziele je Modus zählen (Brief 21, Einstellungen 11) und die 6 ohne
  Zone benennen (B75)
- [ ] Zonen-Namen gegen Inhalt prüfen: „Daten" enthält Testbrief, aber nicht
  Speichern (B75)
- [ ] Überlauf bei 1007 px (heute 93 px) und was ihn erzeugt (B74)
- [ ] Was passiert, wenn ein fremdes Design die Datei ersetzt? Mutationstest:
  `styleSheets[...].disabled = true` und Zonen/Fokus zählen

## Notizen

- Der `data-nur`-Strukturvertrag aus Batch 01 ist **abgelehnt**. Diese Aufgabe
  ist ohne ihn zu lösen — sonst bleibt sie liegen.
- Optik bleibt unverändert; das ist ein Struktur-Auftrag.
- Ergebnis darf sein: „die Trennung ist nicht ohne Umbau der Moduslogik
  möglich" — dann ist das der Befund, kein Fehlschlag.

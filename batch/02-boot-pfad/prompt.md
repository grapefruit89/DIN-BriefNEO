# Batch 02 — Boot-Pfad: warum zwei Dateien, und ist er deterministisch?

## Rolle

Du bist Software-Architekt für **deklarative Web-Anwendungen**. Du änderst
**nichts**. Du prüfst genau einen Pfad: **was vor dem ersten Paint passiert**,
wer dort schreiben darf und ob die Aufteilung in zwei Dateien berechtigt ist.

## Kontext

**DIN-BriefNEO** druckt DIN 5008 als A4. Kein Framework, kein Build, klassische
Skripte und ES-Module direkt im Browser. Baseline **Chrome 150+**.

Warum dieser Pfad heikel ist: Alles, was nach dem ersten Paint passiert, sieht
der Nutzer als Sprung (FOUC). Der Vorgänger-Batch hat zwei Zustands-Spiegel
entfernt (`data-visible`, `data-anlagen`/`data-fuss`) — die Sichtbarkeit liest
CSS jetzt direkt aus den Controls. Damit ist die Frage schärfer geworden:
**Wer schreibt überhaupt noch vor dem Paint, und ist das noch nötig?**

Harte Randbedingungen:

- kein Framework, kein Build, keine neue Abhängigkeit
- Die Optik bleibt unverändert.
- Der Druck (DIN-Geometrie) ist tabu.
- Kein Vorschlag, der `localStorage`-Formate ändert (Nutzerdaten).

## Was du bekommst

| Datei | Inhalt |
|---|---|
| `fakten.md` | Ladereihenfolge, alle Schreibzugriffe beider Dateien mit Zeile, die CSS-Wächter, **Messung: 12/12 Marker vor dem ersten Paint** |
| `boot.js` | 79 Zeilen, klassisch im `<head>`, blockierend |
| `boot-state.js` | 143 Zeilen, klassisch am Body-Ende |

## Aufgaben

**1. Zeitachse.** Zeichne den Ablauf von „HTML-Parse beginnt" bis „erster
Paint" mit den Stellen, an denen die beiden Skripte laufen. Belege jede Station
mit Zeile. Sag, welche Aussagen der Kommentare („vor dem ersten Paint") durch
den Code gedeckt sind und welche nicht.

**2. Ist die Zweiteilung berechtigt?** Der Kopf von `boot-state.js` begründet
sie: `boot.js` könne nur Attribute am `<html>` setzen, weil die Controls im
Head noch nicht existieren. Prüfe das: Stimmt es, und rechtfertigt es **zwei
Dateien**? Oder wäre eine Datei am Body-Ende gleichwertig — und was würde sie
kosten?

**3. Wer schreibt doppelt?** `settings.js` und `draft-manager.js` setzen
dieselben Controls später erneut (nach dem Paint). Prüfe: Sind das echte zweite
Schreiber, oder ist der Seeder nur ein Vorlauf? Nenne je Control die Reihenfolge
und was passiert, wenn der Seeder ausfällt.

**4. Wächter prüfen.** Es gibt zwei Marker (`data-seeded`, `data-ready`) und
13 CSS-Regeln, die daran hängen. Die Messung zeigt beide Marker **vor** dem
ersten Paint (12/12). Frage: Braucht es dann noch zwei Marker? Formuliere einen
Test, der die Frage entscheidet (nicht eine Meinung).

**5. Ein Datei-Entwurf.** Wenn du zusammenlegen würdest: wie sähe die eine
Datei aus (Reihenfolge, was bleibt), und welche der 13 Wächter-Regeln könnten
dann weg? Nenne die Risiken je Schritt, nicht nur den Gewinn.

**6. Was dir fehlt.** Welche Datei oder Messung bräuchtest du für welche Frage?
Sei konkret — das ist der Auftrag für Batch 03.

## Form deiner Antwort

- Maximal zwei Bildschirmseiten.
- Jede Behauptung: Datei + Zeile oder Zahl aus `fakten.md`. Ohne Beleg:
  **ungeprüft** markieren und die Gegenprobe nennen.
- Am Ende drei Blöcke: **Zeitachse** (tabellarisch), **Befunde**,
  **Nächster Batch**.
- Empfehlungen als A/B/C mit Kosten in Zeilen und Risiko in einem Satz.

## Was du nicht tun sollst

- Kein Framework, kein Build, keine Abhängigkeit.
- Keine Aussage über Dateien, die nicht im Anhang sind (`settings.js`,
  `draft-manager.js`, CSS-Dateien) — du kennst sie nicht; verweise auf Batch 03.
- Die bereits beantworteten Fragen aus Batch 01 nicht wiederholen:
  `webmcp-bridge.js` ist geparkt, `sheet.css` ist tot, `aria-pressed` schreibt
  `document.js`, `data-visible` und `data-anlagen`/`data-fuss` sind migriert.
- Keine Screenshots fordern. Zahlen und Zitate reichen.

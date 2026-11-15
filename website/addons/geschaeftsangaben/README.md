# Addon: Geschäftsangaben (§ 35a GmbHG) und Bankdaten

**Status:** aktiv über den Schalter **„Geschäftsangaben (§ 35a)"** in den
Einstellungen. Standard: **aus**.

Aus heißt wirklich aus:

- die Zeile **„Fußzeile (§ 35a GmbHG)"** in der Seitenleiste wird **nicht
  angezeigt** (CSS liest `data-plugin-geschaeftsangaben` am `<html>`),
- der Fußblock im Brief bleibt leer,
- `geschaeftsangaben.js` wird **nicht** geladen (dynamischer `import()` erst
  beim Einschalten).

## Warum ein Addon und nicht der Kern

Der Kern schreibt, druckt und speichert einen Brief ohne diese Prüfungen. Wer
keine GmbH ist — Privatbrief, Verein, Freiberufler — braucht weder Registergericht
noch HRB-Nummer. Ein Kern, der nach § 35a fragt, wäre für die Mehrheit der
Briefe falsch.

## Was drin ist

| Funktion | Art | Prüfung |
|---|---|---|
| `pruefeIban` | rein | ISO 13616: Ländercode, Länge 15–34, Mod-97-Prüfsumme |
| `formatiereIban` | rein | Vierergruppen für die Anzeige |
| `pruefeBic` | rein | ISO 9362: 6 Buchstaben + 2 Zeichen (+ 3 optional) |
| `fehlendeAngaben` | rein | § 35a: Firma, Sitz, Registergericht, Registernummer, Vertretungsberechtigte |
| `aktiviere` | DOM | verdrahtet die Prüfungen mit den Fußzeilenfeldern, loggt das Ergebnis |

Alle reinen Funktionen laufen ohne DOM und sind einzeln getestet
(`test/all.js`, „Geschäftsangaben (Addon)").

## Was hier **nicht** drin ist — und warum

**BIC aus der IBAN ableiten** und **Banknamen anzeigen** brauchen eine Tabelle
BLZ → BIC/Name (Bundesbank-CSV, extrahiert 80–120 KB). Das ist keine
Code-Frage, sondern eine Datenentscheidung: eine mitgelieferte Tabelle ist ein
Pflegeversprechen (Bankfusionen, neue Bankleitzahlen). Sie liegt als **B91** im
Backlog, nicht hier. Solange sie fehlt, prüft das Addon die **Form**, nicht die
Existenz einer Bank.

Kein Netzwerk, kein externer Dienst: Offline-First und Zero-Dependency sind
Gesetz (A1, A37).

## Aktivieren

1. Einstellungen → Erweiterungen → **Geschäftsangaben (§ 35a)** einschalten.
2. Die Zeile „Fußzeile (§ 35a GmbHG)" erscheint im Brief-Modus.
3. Fußzeile einschalten, Felder füllen; beim Einschalten des Addons prüft
   `aktiviere()` IBAN, BIC und die Pflichtangaben und schreibt das Ergebnis in
   die Konsole (`[Geschäftsangaben] Prüfung: …`).

## Zurücknehmen

Schalter aus. Die Zeile verschwindet, das Feld bleibt gespeichert (kein
Datenverlust), der Fußblock wird nicht gedruckt.

## Grenzen

- **Keine Pflicht-Durchsetzung.** Das Addon prüft und meldet, es blockiert
  nichts. Ein Brief ohne Registergericht ist zulässig, wenn der Absender keine
  GmbH ist.
- **Keine Datenpflege.** Ohne B91 keine Banknamen.

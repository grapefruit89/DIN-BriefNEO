---
tags: [aviation-grade, platinum-2026, architecture, chrome-146, incremental]
status: cemented
version: 4.0.0
last_audit: 2026-03-21
id: BRAIN-009
title: API-Resilienz & Offline-Souveränität
supersedes: 09_resilience_strategy.md (v3.0.0)
authority: Gilt für alle Tier-1 und Tier-2 API-Integrationen
traceability: [SPEC-038, CAA-008, ADR-008, ANTI-016, BRAIN-015]
---

# 09 — Resilience Strategy v4.0.0

## Kernphilosophie: Das Papier schreibt immer

DIN-BriefNEO ist primär ein Tier-0-System. APIs sind Verstärker, keine
Voraussetzungen. Die Fähigkeit, einen Brief zu schreiben, darf niemals
von der Verfügbarkeit eines Drittservers abhängen.

---

## Teil I: Das Daily-Strike-Hysterese-Modell (14-Punkte-Regel)

### Grundprinzip: Maximal 1 Fehlerpunkt pro Kalendertag

Ein Dienst, der an einem Montag 47 Mal nicht antwortet, erhält genau
einen Punkt. Am Dienstag höchstens einen weiteren.
Erst nach 14 Kalendertagen mit je mindestens einem Fehler: BLACK.

Warum Daily Strikes statt kumulativer Fehler:
Netzwerk-Blackouts sind episodisch. Ein Montagsausfall soll nicht denselben
Eskalationspfad nehmen wie 2 Wochen Dauerausfall.

### Die vier Phasen

```
Punkte   Phase    Verhalten
─────────────────────────────────────────────────────────────
  0      GREEN    Normalbetrieb. Alle API-Anfragen laufen.
 1–4     GREEN    Erhöhte Beobachtung. Anfragen laufen.
 5–9     AMBER    Suspended. Nur Probe-Anfrage 1x/Stunde.
10–13    RED      Kritisch. Kein Auto-Request. Nur on Demand.
  14     BLACK    Dead-Flag. Stop bis manueller Nutzer-Reset.
─────────────────────────────────────────────────────────────
```

PHASE GREEN (0–4): Normalbetrieb. Fehler → Daily-Strike-Prüfung:
  Hat der aktuelle Kalendertag bereits einen Strike? Nein → +1 Punkt.

PHASE AMBER (5–9): Suspendiert. 1x/Stunde Probe-Request.
  Erfolg → Auto-Reset (Punkte → 0, Phase → GREEN).
  Fehler → kein weiterer Strike in dieser Stunde.

PHASE RED (10–13): Keine Auto-Requests. Nur auf Nutzer-Aktion.
  Auto-Reset bei Erfolg weiterhin möglich.

PHASE BLACK (14): Dead-Flag. deadFlagTs im LocalStorage gesetzt.
  Keine Requests mehr. Nur explizite Nutzer-Aktion hebt BLACK auf.

### Auto-Reset: Sofortige Nullstellung

Ein einziger erfolgreicher API-Response → Punkte auf 0, Phase → GREEN.
Gilt für GREEN, AMBER, RED.
Gilt NICHT für BLACK (Dead-Flag) — dort ist manueller Reset Pflicht.

Warum sofortiger Reset statt gradueller Erholung:
Ein erfolgreicher Response ist der Beweis, dass der Dienst funktioniert.
Halbherziges Vertrauen ist kein Schutz — Simplizität ist Robustheit.

---

## Teil II: Temporal API für Calendar-Day-Validierung

Das Daily-Strike-Modell benötigt eine deterministische Antwort auf:
"Hat dieser Dienst heute bereits einen Fehlerpunkt erhalten?"

Validierungslogik (abstrakt):
1. Lies lastStrikeDateISO aus LocalStorage (Format: YYYY-MM-DD)
2. Vergleiche mit Temporal.Now.plainDateISO().toString()
3. Identisch → kein neuer Punkt
4. Verschieden → failPoints += 1, lastStrikeDateISO = heute

Warum Temporal und nicht new Date().toLocaleDateString():
toLocaleDateString() ist locale-abhängig. "3/20/2026" (US) ≠ "2026-03-20" (ISO).
Ein String-Vergleich würde false negatives produzieren → jeder Tag wäre
fälschlicherweise ein neuer Kalendertag → Hysterese-Modell ausgehebelt.

Temporal.Now.plainDateISO() gibt immer YYYY-MM-DD zurück. Überall. Deterministisch.
Das ist die einzige Stelle wo Temporal für Resilienz-Logik unverzichtbar ist.

### LocalStorage-Schema (v2)

Pro Dienst unter Schlüssel neo_cb_[dienst-id]:
```
{
  phase:              "GREEN" | "AMBER" | "RED" | "BLACK",
  failPoints:         0–14 (Daily-Strike-Zähler),
  lastStrikeDateISO:  "YYYY-MM-DD" | null,
  lastSuccessTs:      ISO-8601-Timestamp | null,
  deadFlagTs:         ISO-8601-Timestamp | null,
  probeLastTs:        ISO-8601-Timestamp | null,
  cachedValue:        letzter erfolgreicher Wert | null
}
```

Warum lastStrikeDateISO als YYYY-MM-DD und nicht als Timestamp:
Ein voller Timestamp erfordert Zeitzone-Handling für Kalender-Tag-Vergleich.
YYYY-MM-DD ist O(1) String-Vergleich. Kein Daylight-Saving, kein Overflow.

---

## Teil III: Silent Failure — Schweigen als Design

Wenn ein API-Aufruf scheitert: Das System schweigt.
Keine Fehlermeldung im Briefbereich. Kein blockierender Dialog.
Kein Toast der den Schreibfluss unterbricht.

Einzige Konsequenz: lautlose Aktivierung des Tier-0-Fallbacks.
Das Feld bleibt leer oder zeigt den gecachten Wert.

Warum: [MANDATE-000] Nutzersouveränität. Der Editor ist ein Fokus-Werkzeug.
Nicht-initiierte Unterbrechungen verletzen das Paper-First-Design.

Wo die Stille endet: Phasen-Indikator im Control-Center (passiv, nie modal).
Farbpunkte: Grün = GREEN, Gelb = AMBER/RED, Rot = BLACK.
Sichtbar wenn der Nutzer will. Nicht aufdringlich.

---

## Teil IV: Akinator-Heuristik-Guard — KI-Halluzinations-Schutz

### Fehlerklassen beim LLM-Import

Klasse 1 — Halluzination: KI erfindet Daten die im Input nicht stehen.
Klasse 2 — Kategorienfehler: Daten landen im falschen IMR-Feld.
Klasse 3 — Format-Verletzung: Markdown-Syntax in Plaintext-Feldern.

### Der Guard: 3 Stufen nach LLM-Response, vor DOM-Write

STUFE 1 — Strukturelle Vollständigkeit:
  Enthält das JSON alle 11 IMR-Pflichtfelder?
  Nein → Ablehnung des gesamten Imports.
  Toast: "KI-Antwort unvollständig — bitte erneut senden."
  Warum: LLMs kürzen bei langen Outputs manchmal das Ende ab.
  Ein partielles JSON darf nie ins DOM.

STUFE 2 — Feld-spezifische Plausibilität:

| Feld        | Heuristik                        | Ablehnung wenn              |
|-------------|----------------------------------|-----------------------------|
| date        | DE/ISO/Long-Datums-Pattern       | Kein Datums-Pattern         |
| sender      | Enthält · oder ist Kurzform      | Länger als 85 Zeichen       |
| recipient   | Enthält \\n oder PLZ-Pattern     | Einzeiler ohne PLZ          |
| author_zip  | 5-stellige Zahl                  | Nicht 5 Ziffern             |
| author_email| Enthält @                        | Kein @                      |
| author_iban | Beginnt mit 2 Großbuchst+Ziffern | Nicht IBAN-like             |
| greeting    | Kein Satzzeichen am Ende         | Endet mit , oder .          |
| subject     | Kein ** oder * am Rand           | Enthält Markdown-Syntax     |

Bei Fehler: Partieller Import. Valide Felder ins DOM. Invalide bleiben leer.
Toast: "X Felder konnten nicht übernommen werden — bitte manuell prüfen."

STUFE 3 — Markdown in Plaintext-Feld:
  Betroffene Felder: alle außer body.
  Erkennungsmuster: enthält das Feld ** | * | ~~ | > | ` | [ | ] ?
  Reaktion: WARNUNG (keine Ablehnung) — Asterisken können Inhalt sein.
  Toast: "Betreff enthält Formatierungs-Zeichen — bitte prüfen."

### Guard-Grundprinzip

Der Guard ist ein Vertrauensfilter, kein Korrektursystem.
Er ändert NIEMALS den Inhalt eines KI-Feldes — er akzeptiert oder verwirft.
[MANDATE-000]: Nutzersouveränität über Automatismus.

---

## Teil V: Fallback-Hierarchie pro Dienst

| Dienst                   | Tier | Fallback                           | Cache-TTL  |
|--------------------------|------|------------------------------------|------------|
| Adress-Autocomplete      | 2    | Freie Texteingabe                  | kein Cache |
| Basiszinssatz (Bundesbank)| 1   | Letzter LocalStorage-Wert          | 180 Tage   |
| Feiertagskalender        | 1    | Eingebettete Statik-Tabelle Tier-0 | unbegrenzt |
| Grammatikprüfung         | 2    | Dienst still deaktiviert           | kein Cache |
| IBAN-Servervalidierung   | 1    | Lokale Modulo-97-Prüfung (Tier-0)  | kein Cache |
| Wechselkurse (EZB)       | 1    | Letzter LocalStorage-Wert          | 24 Stunden |
| Handelsregister          | 2    | Leeres Feld, manuelle Eingabe      | kein Cache |

---

## Teil VI: Offline-Souveränitäts-Pyramide

```
  TIER 3: Monetäre Dienste → BLACK nach 1 Strike
  ─────────────────────────────────────────────────
  TIER 2: Free-Key-Dienste → Daily-Strike (14 Punkte)
  ─────────────────────────────────────────────────
  TIER 1: Stabile öffentliche APIs → Daily-Strike + Cache
  ─────────────────────────────────────────────────
  TIER 0: Eingebettete Logik (IBAN, DIN-Maße, Anrede-Matrix)
          NIEMALS ausfallbar — 100% Offline
```

Invariante: Jede Tier-Ebene muss vollständig funktionieren,
wenn alle höheren Ebenen nicht verfügbar sind. Tier-0 ist das System.

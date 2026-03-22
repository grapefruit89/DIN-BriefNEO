---
tags: [aviation-grade, platinum-2026, spec-kit, architecture, resilience]
status: cemented
version: 3.0.0
last_audit: 2026-03-20
id: BRAIN-009
title: API-Resilienz & Offline-Souveränität
authority: Gilt für alle Tier-1 und Tier-2 API-Integrationen (SPEC-038)
traceability: [DIN-SYS-INTEL, SPEC-038, CAA-008, ADR-008, ANTI-016]
---

# 09 — Resilience Strategy: API-Sicherungen & Offline-Souveränität

## Kernphilosophie: Das Papier schreibt immer

DIN-BriefNEO ist primär ein **Tier-0-System**. APIs sind Verstärker,
keine Voraussetzungen. Die Fähigkeit, einen Brief zu schreiben, darf
niemals von der Verfügbarkeit eines Drittservers abhängen.

---

## Teil I: Das Daily-Strike-Hysterese-Modell (v2 — 14-Punkte-Regel)

### Grundprinzip: Ein Punkt pro Kalendertag

Das bisherige Modell ("3 Fehler in Folge → AMBER") hatte einen
konstruktiven Fehler: Ein Dienst mit instabilem Netz konnte 100 Fehler
pro Stunde produzieren, ohne dass das System effektiv eskalierte.

Das **Daily-Strike-Modell** behebt das:

> **Maximal 1 Fehlerpunkt pro Kalendertag** — unabhängig davon,
> wie viele API-Anfragen in diesem Kalendertag fehlgeschlagen sind.

Ein Dienst, der an einem Montag 47 Mal nicht antwortet, erhält genau
**einen Punkt**. Am Dienstag höchstens einen weiteren. Erst nach
14 Kalendertagen mit je mindestens einem Fehler wird **BLACK** erreicht.

**Warum Daily Strikes statt kumulative Fehler:**
Netzwerk-Blackouts sind episodisch, nicht kontinuierlich. Ein Dienst,
der am Montagmorgen für 2 Stunden down ist, soll nicht denselben
Eskalationspfad nehmen wie ein Dienst, der seit 2 Wochen dauerhaft
nicht erreichbar ist. Die Tagesgrenze schützt vor False-Positives
bei temporären Ausfällen.

### Die vier Phasen: GREEN → AMBER → RED → BLACK

```
Punkte   Phase    Verhalten
──────────────────────────────────────────────────────────────
  0      GREEN    Normalbetrieb. API-Anfragen werden gestellt.
 1–4     GREEN    Erhöhte Beobachtung. Anfragen laufen weiter.
 5–9     AMBER    Suspended. Nur Probe-Anfragen (1x pro Stunde).
10–13    RED      Kritisch. Keine Auto-Anfragen. Nur auf Nutzerwunsch.
  14     BLACK    Dead-Flag. Permanenter Stopp bis Nutzer-Reset.
──────────────────────────────────────────────────────────────
```

**PHASE GREEN (0–4 Punkte):**
Normalbetrieb. Alle API-Anfragen werden gestellt. Jeder Fehler
wird als Kandidat für einen Daily Strike geprüft (hat der aktuelle
Kalendertag bereits einen Strike für diesen Dienst? → wenn nein: +1 Punkt).

**PHASE AMBER (5–9 Punkte):**
Der Dienst ist suspendiert. Keine automatischen Anfragen mehr.
Einmal pro Stunde wird eine einzelne Probe-Anfrage gesendet.
Gelingt sie: sofortiger Auto-Reset (Punkte → 0, Phase → GREEN).
Schlägt sie fehl: Kein weiterer Daily Strike in dieser Stunde
(Timer läuft, keine Eskalation durch Probe-Fehler).

**PHASE RED (10–13 Punkte):**
Kritischer Bereich. Keinerlei automatische Anfragen. Der Dienst
erscheint im Control-Center mit rotem Indikator.
Probe-Anfragen nur auf explizite Nutzer-Interaktion ("Dienst testen").
Auto-Reset bei Erfolg weiterhin möglich.

**PHASE BLACK (14 Punkte):**
Dead-Flag. `deadFlagTs` wird im LocalStorage gesetzt.
Keine Anfragen mehr — weder automatisch noch durch Probe.
Nur eine explizite Nutzer-Aktion ("Dienst reaktivieren / Key zurücksetzen")
hebt den BLACK-Zustand auf.

**WARUM die 14-Punkte-Grenze:**
14 Kalendertage mit täglichem Ausfall sind kein temporärer Blackout mehr.
Das ist ein abgeschalteter Dienst. Das System muss das anerkennen, statt
täglich sinnlos Anfragen zu stellen, die Latenz produzieren.

### Auto-Reset: Sofortige Nullstellung bei Erfolg

**Regel:** Ein einziger erfolgreicher API-Response setzt den Fehlerpunktestand
sofort auf 0 zurück und wechselt die Phase auf GREEN.

**Gilt für:** GREEN, AMBER, RED.
**Gilt NICHT für:** BLACK (Dead-Flag). Dort ist manueller Reset Pflicht.

**Warum sofortiger Reset statt gradueller Erholung:**
Graduelle Erholung ("3 Erfolge in Folge senken den Zähler um 1") erzeugt
Komplexität ohne Mehrwert. Ein erfolgreicher API-Response ist der Beweis,
dass der Dienst wieder funktioniert. Halbherziges Vertrauen ist kein Schutz.

### Temporal API: Zeitstempel-Validierung für Calendar-Day-Grenzen

Das Daily-Strike-Modell benötigt eine zuverlässige Antwort auf:
*"Hat dieser Dienst heute bereits einen Fehlerpunkt erhalten?"*

Die Validierungslogik (abstrakt, kein Code):

1. **Beim Fehler-Event:** Lies `lastStrikeDateISO` aus dem LocalStorage
   (Format: `YYYY-MM-DD`, z.B. `"2026-03-20"`).
2. **Vergleich mit heute:** `Temporal.Now.plainDateISO().toString()`
   liefert das aktuelle Datum als `YYYY-MM-DD` — zeitzonenfrei,
   unveränderlich, deterministisch.
3. **Wenn identisch:** Kein neuer Punkt. Der Tag hat bereits seinen Strike.
4. **Wenn verschieden:** `failPoints += 1`, `lastStrikeDateISO = heute`.

**Warum Temporal und nicht `new Date().toLocaleDateString()`:**
`toLocaleDateString()` ist locale-abhängig und gibt in verschiedenen
Systemen verschiedene Formate zurück. Ein String-Vergleich von
`"3/20/2026"` (US) mit `"2026-03-20"` (ISO) würde false negatives
produzieren — und jeder Tag würde fälschlicherweise als neuer Kalendertag
gelten. Das würde das Hysterese-Modell vollständig aushebeln.
`Temporal.Now.plainDateISO()` gibt immer `YYYY-MM-DD` zurück, überall.

**Temporal als Sicherheitsinvariant:**
Das Calendar-Day-Modell ist nur dann zuverlässig, wenn der Tag-String
deterministisch und systemunabhängig ist. Das ist die einzige Stelle,
an der `Temporal` für die Resilienz-Logik unverzichtbar ist.


### Erweitertes LocalStorage-Schema (v2)

Pro Dienst wird ein JSON-Objekt unter `neo_cb_[dienst-id]` gespeichert.
**Neu in v2:** `failPoints`, `lastStrikeDateISO`, Phasen-Schwellwerte.

```
{
  phase:              "GREEN" | "AMBER" | "RED" | "BLACK",
  failPoints:         Integer (0–14, Daily-Strike-Zähler),
  lastStrikeDateISO:  "YYYY-MM-DD" | null  (letzter Tag mit Strike),
  lastSuccessTs:      ISO-8601-Timestamp | null,
  deadFlagTs:         ISO-8601-Timestamp | null  (nur BLACK),
  probeLastTs:        ISO-8601-Timestamp | null  (AMBER Probe-Cooldown),
  cachedValue:        letzter erfolgreicher API-Wert | null
}
```

**Warum `lastStrikeDateISO` als `YYYY-MM-DD` und nicht als Timestamp:**
Ein voller ISO-Timestamp (`2026-03-20T14:33:00Z`) würde einen Zeitzone-
vergleich erfordern, um zu bestimmen, ob zwei Timestamps "am selben
Kalendertag" liegen. Ein reiner `YYYY-MM-DD`-String ist ein O(1) String-
Vergleich. Kein Zeitzone-Handling, kein Overflow, kein Daylight-Saving.

---

## Teil II: Das "Silent Failure" Prinzip — Schweigen als Design

Wenn ein API-Aufruf scheitert — Timeout, HTTP-Fehler, ungültiges JSON —
**schweigt das System**. Keine Fehlermeldung im Briefbereich, kein
blockierender Dialog, kein roter Toast, der den Schreibfluss unterbricht.

Die einzige sichtbare Konsequenz ist die **lautlose Aktivierung des
Tier-0-Fallbacks**. Das Feld bleibt leer oder zeigt den gecachten Wert.

**WARUM das das Richtige ist:**
[MANDATE-000] (Nutzersouveränität): Der Kern-Editor ist ein Fokus-Werkzeug.
Jede nicht-initiierte Unterbrechung verletzt die Paper-First-Philosophie.

**Wo die Stille endet:**
Genau ein Ort: der **Phasen-Indikator im Control-Center** (passiv, nie modal).
Farbpunkte neben jedem Dienst: Grün = GREEN, Gelb = AMBER/RED, Rot = BLACK.
Der Nutzer sieht es, wenn er will. Er muss es nicht.

---

## Teil III: Fallback-Hierarchie pro Dienst

| Dienst | Tier | Fallback-Verhalten | Cache-TTL |
|---|---|---|---|
| Adress-Autocomplete (GeoApify) | 2 | Freie Texteingabe | kein Cache |
| Basiszinssatz (Bundesbank) | 1 | Letzter LocalStorage-Wert | 180 Tage |
| Feiertagskalender (nager.at) | 1 | Eingebettete Statik-Tabelle (Tier-0) | unbegrenzt |
| Grammatikprüfung (LanguageTool) | 2 | Dienst still deaktiviert | kein Cache |
| IBAN-Servervalidierung (VIES) | 1 | Lokale Modulo-97-Prüfung (Tier-0) | kein Cache |
| Wechselkurse (EZB) | 1 | Letzter LocalStorage-Wert | 24 Stunden |
| Handelsregister (offeneregister) | 2 | Leeres Feld, manuelle Eingabe | kein Cache |

---

## Teil IV: Die Offline-Souveränitäts-Pyramide

```
          ┌─────────────────────────────────────────┐
          │  TIER 3: Monetäre Dienste               │
          │  → Circuit-Breaker: BLACK nach 1 Strike │
          ├─────────────────────────────────────────┤
          │  TIER 2: Free-Key-Dienste               │
          │  → Daily-Strike-Modell (14 Punkte)      │
          │  → LocalStorage als SSoT               │
          ├─────────────────────────────────────────┤
          │  TIER 1: Stabile öffentliche APIs       │
          │  → Daily-Strike-Modell (14 Punkte)      │
          │  → LocalStorage-Cache (TTL variabel)    │
          │  → Statische Fallback-Tabellen          │
          ├─────────────────────────────────────────┤
          │  TIER 0: Eingebettete Logik             │
          │  (IBAN-Modulo, DIN-Masse, Anrede-Matrix)│
          │  → NIEMALS ausfallbar                  │
          └─────────────────────────────────────────┘
```

**Invariante:** Jede Tier-Ebene muss vollständig funktionieren,
wenn alle höheren Ebenen nicht verfügbar sind. Tier-0 ist das System.

---

## Teil V: Akinator-Heuristik-Guard — KI-Halluzinations-Schutz

*Neue Sektion. Hinzugefügt: 2026-03-20. Betrifft: Smart-Paste + LLM-Import.*

### Das Problem: Strukturierte Extraktion aus unstrukturierten Quellen

Der Akinator extrahiert Brieffelder aus chaotischen Eingaben (Impressum,
WhatsApp-Text, Copy-Paste aus Webseiten). Dabei können drei Fehlerklassen auftreten:

**Fehlerklasse 1 — Halluzination:** Die KI "erfindet" Daten, die im Input
nicht vorhanden sind. Beispiel: Input enthält keine Telefonnummer,
aber die KI füllt `author_phone` mit einer plausibel klingenden Nummer.

**Fehlerklasse 2 — Kategorienfehler:** Die KI weist Daten dem falschen
IMR-Feld zu. Beispiel: Die Postleitzahl des Empfängers landet in `our_ref`.

**Fehlerklasse 3 — Format-Verletzung:** Die KI gibt Markdown-Syntax in
Feldern zurück, die nur Plaintext erlauben (z.B. `**Firma GmbH**` in `sender`).

### Der Heuristik-Guard: Drei Prüf-Stufen

Der Guard wird **nach** dem LLM-Response und **vor** dem DOM-Write ausgeführt.
Er ist kein KI-System — er ist deterministische Validierungslogik (Tier-0).

---

**STUFE 1: Strukturelle Vollständigkeit**

Prüft: Enthält das KI-JSON alle 11 IMR-Pflichtfelder?

Akzeptiert: Felder mit `null` — explizit leer ist valide.
Ablehnt: Fehlende Keys (ein fehlender Key deutet auf truncated Output hin).

**Warum:** LLMs kürzen bei langen Outputs manchmal das Ende ab. Ein
unvollständiges JSON sollte nie teilweise ins DOM geschrieben werden.

---

**STUFE 2: Feld-spezifische Plausibilitäts-Heuristiken**

Für jedes IMR-Feld existiert eine minimale Plausibilitätsprüfung:

| Feld | Heuristik | Ablehnung wenn |
|---|---|---|
| `date` | DE-Datum, ISO oder Long-Format erkennbar | Enthält keinen Datums-Pattern |
| `sender` | Enthält `·` (Trennzeichen) oder ist Kurzform | Länger als 85 Zeichen |
| `recipient` | Enthält `\n` (mehrzeilig) oder Postleitzahl | Einzeiler ohne PLZ-Pattern |
| `author_zip` | 5-stellige Zahl | Nicht 5 Ziffern |
| `author_email` | `@`-Zeichen vorhanden | Kein `@` |
| `author_iban` | Beginnt mit 2 Großbuchstaben + Ziffern | Nicht IBAN-like |
| `greeting` | Kein Satzzeichen am Ende | Endet mit `,` oder `.` |
| `subject` | Kein `**`, kein `*` am Anfang/Ende | Enthält Markdown-Syntax |

**Wichtig:** Diese Heuristiken sind KEIN Validator im strengen Sinne.
Sie prüfen nicht, ob der Inhalt korrekt ist — sie prüfen, ob er
**plausibel für das Feld** ist. Ein `date`-Feld mit dem Wert `"Hallo"` ist
strukturell falsch, auch wenn kein Parsing-Fehler auftritt.

---

**STUFE 3: Markdown-in-Plaintext-Erkennung (Anti-Halluzination)**

Prüft: Enthält ein Nicht-Body-Feld Markdown-Syntax?

Betroffene Felder: `sender`, `note`, `subject`, `salutation`,
`greeting`, `signature`, `your_ref`, `our_ref`, `date`.

Erkennungsmuster (einfache String-Checks, kein Regex-Overhead):
```
Enthält das Feld: ** | * | ~~ | > | ` | [ | ] ?
→ Wenn ja UND Feld ist NICHT "body": → WARNUNG (keine Ablehnung)
```

**Warum Warnung statt Ablehnung:**
Ein Betreff wie `"Re: Ihr Angebot *Nr. 123*"` enthält Asterisken, die
keine Markdown-Absicht signalisieren. Die Stufe 3 ist ein Hinweis-System,
kein Block-System. Der Nutzer entscheidet.

---

### Guard-Verhalten: Was passiert bei Fehlern?

**Stufe 1 (fehlende Keys):** Ablehnung des gesamten JSON-Imports.
Toast: "KI-Antwort unvollständig — bitte erneut senden."

**Stufe 2 (Plausibilitätsfehler):** Partieller Import.
Valide Felder werden ins DOM geschrieben. Invalide Felder bleiben leer.
Toast: "3 Felder konnten nicht übernommen werden — bitte manuell prüfen."
Im Devmode: Welche Felder abgelehnt wurden und warum.

**Stufe 3 (Markdown in Plaintext-Feld):** Import erfolgt, Marker sichtbar.
Toast: "Betreff enthält Formatierungs-Zeichen — bitte prüfen."
Der Nutzer sieht die Asterisken und kann sie entfernen.

### Das Grundprinzip des Guards

> Der Guard ist ein **Vertrauensfilter**, kein Korrektursystem.
> Er ändert niemals den Inhalt eines KI-Feldes — er akzeptiert oder
> verwirft. [MANDATE-000] gilt: Nutzersouveränität über Automatismus.
>
> Eine KI, die `author_zip: "12345 Berlin"` zurückgibt (PLZ und Stadt
> zusammen im falschen Feld), wird vom Guard abgelehnt. Der Nutzer
> tippt die PLZ selbst. Das ist kein Verlust — das ist Datenintegrität.

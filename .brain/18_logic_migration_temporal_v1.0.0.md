---
tags: [aviation-grade, platinum-2026, architecture, gap-healing, chrome-146]
status: cemented
version: 1.0.0
last_audit: 2026-03-21
id: BRAIN-018
title: Logic Migration Spec — Temporal API & TOMB-L001
traceability: [BRAIN-017, BRAIN-015, ANTI-016, INCIDENT-002]
heals: [K-004 new Date() ANTI-016 Verstoß, G-007 UTC vs. Local Timezone]
---

# 18 — Logic Migration: Temporal API für js/logic/logic.js

## Kontext

BRAIN-017 K-004 identifizierte: `todayISO()` in `js/logic/logic.js` nutzt
`new Date()` — ein aktiver Verstoß gegen ANTI-016 (Verbot der nativen Date-Klasse
für neue Logik). Gleichzeitig identifizierte G-007 ein Timezone-Problem in der
Temporal-Nutzung der Resilience-Strategie.

Diese Datei versiegelt die korrekte Spezifikation für beide Punkte.

---

## TOMB-L001: new Date() — Formelle Beerdigung

**Was:** Alle Aufrufe von `new Date()` und `Date.now()` in der Datei
`js/logic/logic.js` — insbesondere `todayISO()`.

**Warum begraben:**

1. **Mutabilität:** Ein `Date`-Objekt ist mutable. `d.setMonth(0)` verändert
   dasselbe Objekt — kein Fehler, kein Signal. Temporal-Objekte sind immutable.
   `Temporal.PlainDate.from('2026-03-21').add({months: 1})` gibt ein NEUES
   Objekt zurück, das Original bleibt unverändert.

2. **Locale-Abhängigkeit:** `toLocaleDateString()` gibt systemabhängige Formate
   zurück. Auf deutschen Systemen `"21.03.2026"`, auf US-Systemen `"3/21/2026"`.
   Ein String-Vergleich mit einem ISO-gespeicherten Wert aus dem LocalStorage
   würde in 30% aller Systeme silently falsch vergleichen.

3. **Timezone-Ambiguität:** `new Date()` kennt keine "Kalender-Tag"-Semantik.
   `new Date().toISOString()` gibt UTC zurück. Der Nutzer in Tokyo der um
   08:00 Ortszeit (= 23:00 UTC Vortag) einen Brief schreibt bekommt das
   gestrige Datum — der Hysterese-Counter zählt falsch.

4. **ANTI-016 Verstoß:** Dokumentiert in `05_anti_pattern_registry.md`.
   Jede neue Logik darf `new Date()` nicht verwenden.

**Status:** TOMB-L001 — Begraben ab 2026-03-21.
**Gilt für:** `todayISO()`, alle `new Date()` Konstruktoren in logic.js.
**Ausnahme:** Bestehendes `parseDate()` darf `new Date(string)` noch nutzen
als temporäre Brücke — aber nur für das Parsen von Nutzereingaben.
`parseDate()` ist Tier-0 Fachlogik, kein Zeitstempel-Generator.

---

## Spezifikation: todayISO() mit Temporal

### Vertrag (Contract)

- **Eingabe:** keine
- **Ausgabe:** String im Format `YYYY-MM-DD` — unveränderlich, deterministisch
- **Zeitzone:** Lokale Zeitzone des Nutzers (NICHT UTC)
- **Kompatibilität:** Rückgabewert ist direkt als LocalStorage-Key nutzbar

### Das Timezone-Problem (G-007) — "Midnight Bug"

`Temporal.Now.plainDateISO()` ohne Argument gibt das Datum **in UTC** zurück.

Konsequenz für das Daily-Strike-Modell:
```
Nutzer in Tokyo (UTC+9) — Montagmorgen 08:00 Lokalzeit
UTC: Sonntag 23:00
plainDateISO() gibt zurück: "2026-03-22" (Sonntag in UTC)
LocalStorage erwartet: "2026-03-23" (Montag in Lokalzeit)
→ Der Strike-Counter glaubt, es ist noch Sonntag.
→ Der Montags-Strike zählt fälschlich als zweiter Sonntags-Strike.
```

Das ist der Midnight Bug: 9 Stunden pro Tag in Tokyo sind "falsch".
Für Deutschland (UTC+1/+2) betrifft es 1–2 Stunden um Mitternacht.
Selten, aber deterministisch falsch wenn es passiert.

### Die Korrekte Spezifikation

Die lokale Zeitzone muss explizit übergeben werden:

```
Temporal.Now.plainDateISO(Temporal.Now.timeZoneId())
```

**Was das macht:**
1. `Temporal.Now.timeZoneId()` ermittelt die Systemzeitzone des Browsers
   (z.B. `"Europe/Berlin"`, `"Asia/Tokyo"`, `"America/New_York"`)
2. `Temporal.Now.plainDateISO(timeZoneId)` gibt das aktuelle Datum
   in dieser Zeitzone zurück — als reinen Kalendertag ohne Zeit
3. Ergebnis: `"2026-03-21"` — immer der lokale Kalendertag des Nutzers

**Rückgabeformat:** `YYYY-MM-DD` — identisch zur bisherigen Implementierung.
Keine Breaking Changes am LocalStorage-Schema. Kein Migrations-Aufwand.

### Scope der Migration

**Betrifft direkt:**
- `todayISO()` in `js/logic/logic.js` — primäre Baustelle
- Circuit-Breaker-Logik in `js/resilience/circuitBreaker.js` (sobald
  implementiert) — muss `todayISO()` konsumieren, NICHT selbst `new Date()` rufen

**Betrifft NICHT:**
- `parseDate(input)` — darf weiterhin `new Date(string)` für Input-Parsing nutzen
  (Tier-3 Fallback, nicht für Zeitstempel-Generierung)
- ISO-Timestamps für `lastSuccessTs`, `deadFlagTs`, `probeLastTs` im
  LocalStorage-Schema — diese nutzen `Temporal.Now.instant().toString()` (UTC ISO-8601)

### Temporal Polyfill — Einbindungs-Anforderung

Temporal ist in Chrome 145+ nativ verfügbar (Chrome 127+ mit Flag, stable ab ~130).
Bei unserem Ziel-Browser Chrome 145+ ist kein Polyfill nötig.

**Konditionale Logik:** Falls ein Polyfill benötigt wird (z.B. für Testing-Umgebungen):
`@js-temporal/polyfill` — einmalig in `index.html` via `importmap` oder
direkt in `app.js` vor dem ersten `Temporal`-Aufruf.

---

## LocalStorage-Kompatibilität: Kein Breaking Change

Das bestehende Schema speichert `lastStrikeDateISO` als `YYYY-MM-DD`.
Die neue `todayISO()` gibt weiterhin `YYYY-MM-DD` zurück.
Ein O(1) String-Vergleich (`lastStrikeDateISO === todayISO()`) bleibt korrekt.

Einzige Verhaltensänderung: Für Nutzer mit UTC-abweichender Zeitzone werden
die Strike-Grenzen jetzt korrekt an Mitternacht Ortszeit gesetzt, nicht Mitternacht UTC.

---

## Migrations-Checkliste

1. `js/logic/logic.js`: `todayISO()` auf Temporal migrieren
2. `js/core/constants.js` oder `js/app.js`: Temporal verfügbar prüfen
3. `05_anti_pattern_registry.md`: TOMB-L001 als Cemetery-Eintrag ergänzen
4. `GEMINI.md`: ANTI-016 um Temporal-Pflicht-Vermerk erweitern
5. Tests: `todayISO()` in verschiedenen Timezonen verifizieren
   (Berlin UTC+1/+2, Tokyo UTC+9, New York UTC-5/-4)

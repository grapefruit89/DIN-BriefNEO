---
tags: [aviation-grade, platinum-2026, architecture, final-cleanup, chrome-146]
status: cemented
version: 6.0.0
last_audit: 2026-03-21
id: BRAIN-009
title: API-Resilienz & Offline-Souveränität — Final Consolidation
supersedes: 09_resilience_strategy_v5.0.0.md
authority: Gilt für alle Tier-1 und Tier-2 API-Integrationen
traceability: [BRAIN-017, BRAIN-015, ANTI-016, INCIDENT-002, MANDATE-NO-LEGACY]
heals: [G-005 CST formal, G-002 QuotaError Hierarchie explizit, G-007 Timezone final]
delta: Keine inhaltlichen Änderungen gegenüber v5. Formalisierung, Klarheit, Traceability.
---

# 09 — Resilience Strategy v6.0.0 — Final Consolidation

## Kernphilosophie: Das Papier schreibt immer

DIN-BriefNEO ist primär ein Tier-0-System. APIs sind Verstärker, keine
Voraussetzungen. Die Fähigkeit, einen Brief zu schreiben, darf niemals
von der Verfügbarkeit eines Drittservers abhängen.

---

## Teil I: Das Daily-Strike-Hysterese-Modell (14-Punkte-Regel)

### Grundprinzip

Maximal 1 Fehlerpunkt pro Kalendertag. 47 Fehler an einem Tag = 1 Punkt.
Erst nach 14 Tagen mit je ≥1 Fehler: BLACK.

```
Punkte   Phase    Verhalten
──────────────────────────────────────────────────────────────
  0      GREEN    Normalbetrieb. Alle Anfragen laufen.
 1–4     GREEN    Erhöhte Beobachtung. Anfragen laufen.
 5–9     AMBER    Suspended. 1x Probe/Stunde.
10–13    RED      Kritisch. Kein Auto-Request.
  14     BLACK    Dead-Flag. Manueller Reset Pflicht.
──────────────────────────────────────────────────────────────
```

---

## Teil II: Consecutive Success Threshold — G-005 (FORMAL)

### Definition

Auto-Reset zu GREEN erfordert **3 aufeinanderfolgende erfolgreiche
API-Responses** (Consecutive Success Threshold, CST = 3).

### CST-Logik (deterministisch spezifiziert)

```
EVENT: API-Response erhalten

WENN Response = ERFOLG:
  consecutiveSuccesses = consecutiveSuccesses + 1
  WENN consecutiveSuccesses >= 3 UND phase != BLACK:
    failPoints          = 0
    phase               = GREEN
    consecutiveSuccesses = 0
    lastSuccessTs       = Temporal.Now.instant().toString()

WENN Response = FEHLER:
  consecutiveSuccesses = 0                    ← Zähler hart zurücksetzen
  WENN lastStrikeDateISO != todayISO():        ← Daily-Strike-Prüfung
    failPoints          = failPoints + 1
    lastStrikeDateISO   = todayISO()
  phase = evaluatePhase(failPoints)
```

### Warum CST = 3 (versiegelt)

| Wert | Problem |
|------|---------|
| 1 (v4) | Ein Probe-Erfolg reicht — intermittente Dienste pendeln ewig |
| 3 (v6) | = 3 AMBER-Probe-Intervalle = ~3 Stunden stabile Erreichbarkeit |
| 5+     | Zu konservativ — stabile Dienste bleiben unnötig in AMBER |

**BLACK-Ausnahme:** CST kann BLACK nie aufheben. BLACK = ausschließlich manueller Reset.

---

## Teil III: Temporal API — G-007 (FINAL, KEINE AMBIGUITÄT)

### Mandate

> Alle Kalender-Tag-Vergleiche im Circuit-Breaker-System MÜSSEN
> `Temporal.Now.plainDateISO(Temporal.Now.timeZoneId())` verwenden.
> `Temporal.Now.plainDateISO()` ohne Argument ist VERBOTEN (UTC-Fehler).
> `new Date()` ist VERBOTEN (TOMB-L001, ANTI-016).

### Aufruf-Vertrag für todayISO()

- Eingabe: keine
- Ausgabe: `YYYY-MM-DD` String in der lokalen Zeitzone des Nutzers
- Deterministisch: Gleicher Kalendertag → gleicher String, unabhängig von Uhrzeit
- Kein Breaking Change: Format identisch zu v4/v5

### Zeitstempel-Hierarchie (welche API für welchen Zweck)

| Zweck | API | Format |
|-------|-----|--------|
| Kalender-Tag-Vergleich (Strike-Prüfung) | `Temporal.Now.plainDateISO(timeZoneId)` | `YYYY-MM-DD` |
| Absolute Zeitpunkte (lastSuccessTs, deadFlagTs) | `Temporal.Now.instant().toString()` | ISO-8601 UTC |
| User-Input-Parsing (parseDate()) | `new Date(string)` noch erlaubt — nur Parsing | n/a |

Vollständige Begründung: 18_logic_migration_temporal_v1.0.0.md.

---

## Teil IV: LocalStorage-Schema v3 (final)

Pro Dienst unter `neo_cb_[dienst-id]`:

```
{
  phase:                "GREEN" | "AMBER" | "RED" | "BLACK",
  failPoints:           Integer 0–14,
  consecutiveSuccesses: Integer 0–3,
  lastStrikeDateISO:    "YYYY-MM-DD" | null,
  lastSuccessTs:        ISO-8601 | null,
  deadFlagTs:           ISO-8601 | null,
  probeLastTs:          ISO-8601 | null,
  cachedValue:          String | null
}
```

Fehlende Felder beim Lesen → Default 0 oder null. Kein Fehler.

---

## Teil V: QuotaExceededError — G-002 (Prioritäts-Hierarchie EXPLIZIT)

Wenn `localStorage.setItem()` einen `QuotaExceededError` wirft:

### Discard-Reihenfolge (was zuerst geopfert wird)

```
BEHALTEN (niemals verwerfen):
  1. CB-Phase          neo_cb_*.phase
  2. Strike-Counter    neo_cb_*.failPoints

BEHALTEN (wenn möglich):
  3. Last-Success-Day  neo_cb_*.lastStrikeDateISO
  4. CST-Counter       neo_cb_*.consecutiveSuccesses
  5. Timestamps        neo_cb_*.lastSuccessTs, deadFlagTs, probeLastTs

VERWERFEN ZUERST (erste Opfer-Kategorie):
  6. Cached-Values     neo_cb_*.cachedValue     ← als erstes löschen
  7. Draft-Autosave    neo_draft_autosave        ← als zweites löschen
```

### Recovery-Ablauf bei QuotaError

```
Schritt 1: Versuche normales setItem()
           → Erfolg: fertig
           → QuotaError: weiter mit Schritt 2

Schritt 2: Lösche alle neo_cb_*.cachedValue Einträge
           Lösche neo_draft_autosave
           Versuche setItem() erneut
           → Erfolg: fertig, Control-Center Hinweis passiv anzeigen
           → QuotaError: weiter mit Schritt 3

Schritt 3: In-Memory-State korrekt halten, nicht persistieren
           Control-Center Warnung: "Speicherplatz erschöpft —
           Zustand wird nach Neustart zurückgesetzt."
           Kein App-Crash. Kein blockierender Dialog.
```

**Invariante:** CB-Phase und failPoints werden niemals geopfert.
Der Circuit-Breaker-Status ist das Gedächtnis des Systems.
Ein gecachter API-Wert ist erneuerbar. Ein BLACK-Status der verloren
geht öffnet einen BLACK-würdigen Dienst zu Unrecht wieder.

### LocalStorage-Clear Recovery (Szenario A)

Erkennung via Sentinel-Key `neo_app_ever_started`:
- Fehlt: Erster Start → GREEN für alle Dienste, normal
- Vorhanden + keine CB-Keys: Storage geleert → GREEN für alle, passiver Hinweis

Ein gelearter BLACK-Dienst startet als GREEN. Das ist korrekt:
Der Nutzer hat implizit einen Reset-Wunsch geäußert.

### Korruptes JSON (Szenario C)

`JSON.parse()` schlägt fehl → betroffenen Dienst auf GREEN,
kein Fehler an Nutzer, kein App-Crash.

---

## Teil VI: Silent Failure — Schweigen als Design

Das System schweigt bei API-Fehlern im Briefbereich.
Einzige Sichtbarkeit: Phasen-Indikator im Control-Center (passiv, nie modal).
[MANDATE-000]: Nutzersouveränität über Automatismus.

---

## Teil VII: Fallback-Hierarchie

| Dienst                  | Tier | Fallback                           | Cache-TTL  |
|-------------------------|------|------------------------------------|------------|
| Adress-Autocomplete     | 2    | Freie Texteingabe                  | kein Cache |
| Basiszinssatz           | 1    | Letzter LocalStorage-Wert          | 180 Tage   |
| Feiertagskalender       | 1    | Eingebettete Statik-Tabelle Tier-0 | unbegrenzt |
| Grammatikprüfung        | 2    | Dienst still deaktiviert           | kein Cache |
| IBAN-Servervalidierung  | 1    | Lokale Modulo-97-Prüfung (Tier-0)  | kein Cache |
| Wechselkurse (EZB)      | 1    | Letzter LocalStorage-Wert          | 24 Stunden |
| Handelsregister         | 2    | Leeres Feld, manuelle Eingabe      | kein Cache |

---

## Teil VIII: Offline-Souveränitäts-Pyramide

```
  TIER 3: Monetäre Dienste → BLACK nach 1 Strike
  ──────────────────────────────────────────────
  TIER 2: Free-Key-Dienste → Daily-Strike + CST(3)
  ──────────────────────────────────────────────
  TIER 1: Öffentliche APIs → Daily-Strike + Cache + CST(3)
  ──────────────────────────────────────────────
  TIER 0: Eingebettete Logik — NIEMALS ausfallbar
```

---

## Änderungs-Delta v5 → v6

Keine inhaltlichen Änderungen. Formalisierungen:

| Bereich | v5.0.0 | v6.0.0 |
|---|---|---|
| CST-Logik | Prosa-Beschreibung | Deterministisches Pseudocode-Spec |
| QuotaError-Prio | Prosa-Liste | Explizite Discard-Reihenfolge 1–7 |
| Temporal-Mandate | "Korrekte Spezifikation" | VERBOTEN/ERLAUBT-Klassifizierung |
| Zeitstempel-Hierarchie | implizit | Explizite 3-Zeilen-Tabelle |
| Tags | gap-healing | final-cleanup |

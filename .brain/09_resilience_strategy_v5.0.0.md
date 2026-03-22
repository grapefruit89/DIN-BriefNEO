---
tags: [aviation-grade, platinum-2026, architecture, gap-healing, chrome-146]
status: cemented
version: 5.0.0
last_audit: 2026-03-21
id: BRAIN-009
title: API-Resilienz & Offline-Souveränität
supersedes: 09_resilience_strategy_v4.0.0.md
authority: Gilt für alle Tier-1 und Tier-2 API-Integrationen
traceability: [BRAIN-017, BRAIN-015, ANTI-016, INCIDENT-002]
heals: [G-002 LocalStorage Recovery, G-005 Intermittent Flapping, G-007 Timezone via BRAIN-018]
---

# 09 — Resilience Strategy v5.0.0

## Kernphilosophie: Das Papier schreibt immer (unverändert)

DIN-BriefNEO ist primär ein Tier-0-System. APIs sind Verstärker, keine
Voraussetzungen. Die Fähigkeit, einen Brief zu schreiben, darf niemals
von der Verfügbarkeit eines Drittservers abhängen.

---

## Teil I: Das Daily-Strike-Hysterese-Modell v2 (14-Punkte-Regel)

### Grundprinzip (unverändert)

Ein Dienst erhält maximal 1 Fehlerpunkt pro Kalendertag.
Erst nach 14 Tagen mit je mindestens einem Fehler: BLACK.

```
Punkte   Phase    Verhalten
──────────────────────────────────────────────────────────────
  0      GREEN    Normalbetrieb. Alle API-Anfragen laufen.
 1–4     GREEN    Erhöhte Beobachtung. Anfragen laufen.
 5–9     AMBER    Suspended. Nur Probe-Anfrage 1x/Stunde.
10–13    RED      Kritisch. Kein Auto-Request. Nur on Demand.
  14     BLACK    Dead-Flag. Stop bis manueller Nutzer-Reset.
──────────────────────────────────────────────────────────────
```

### NEU in v5: Consecutive Success Threshold (G-005)

**Problem das v4 hatte:**
Ein Dienst der täglich ausfällt, aber jeden zweiten Tag für 1 Probe-Request
antwortet, erreicht nie BLACK. Ein einziger erfolgreicher Response setzte
den Zähler auf 0 zurück — der Dienst pendelt auf ewig zwischen 1 Punkt
und 0 Punkten. Das Hysterese-Modell war für intermittente Dienste wirkungslos.

**Die Lösung: Consecutive Success Threshold (CST)**

Auto-Reset zu GREEN erfordert jetzt **3 aufeinanderfolgende erfolgreiche
API-Responses**, nicht mehr 1.

Neues Feld im LocalStorage-Schema: `consecutiveSuccesses: 0–3`

Logik:
```
Bei Erfolg:
  consecutiveSuccesses += 1
  Wenn consecutiveSuccesses >= 3 UND Phase != BLACK:
    → Auto-Reset: failPoints = 0, Phase = GREEN, consecutiveSuccesses = 0

Bei Fehler:
  consecutiveSuccesses = 0  (Zähler zurücksetzen)
  Daily-Strike-Prüfung wie bisher
```

**Warum 3, nicht mehr und nicht weniger:**
- 1 (alter Stand): Zu leicht zu erreichen. 1 erfolgreicher Probe-Request reicht.
- 3: Entspricht 3 aufeinanderfolgenden Probe-Intervallen (3 Stunden in AMBER).
  Ein Dienst der 3 Stunden stabil läuft, verdient das Vertrauen zurück.
- 5+: Zu konservativ. Wenn ein Dienst nach langer Downtime wieder stabil läuft,
  soll er nicht unnötig lang in AMBER verweilen.

**BLACK bleibt ausgenommen:**
`consecutiveSuccesses` kann BLACK nie aufheben. Der manuelle Reset-Pfad
bleibt der einzige Weg aus BLACK.

---

## Teil II: Temporal API für Calendar-Day-Validierung (G-007 Fix)

Das Daily-Strike-Modell nutzt `todayISO()` aus `js/logic/logic.js`.

**Korrekte Spezifikation (BRAIN-018):**
```
Temporal.Now.plainDateISO(Temporal.Now.timeZoneId())
```

Gibt den aktuellen Kalendertag in der **lokalen Zeitzone des Nutzers** zurück.
Format: `YYYY-MM-DD`. Direkter O(1) Vergleich mit `lastStrikeDateISO`.

Timezone-Rationale: Siehe BRAIN-018 — "Midnight Bug" vollständig spezifiziert.

---

## Teil III: LocalStorage-Schema v3 (G-002 + G-005)

Pro Dienst unter Schlüssel `neo_cb_[dienst-id]`:

```
{
  phase:                "GREEN" | "AMBER" | "RED" | "BLACK",
  failPoints:           0–14 (Daily-Strike-Zähler),
  consecutiveSuccesses: 0–3  (NEU in v5 — für CST),
  lastStrikeDateISO:    "YYYY-MM-DD" | null,
  lastSuccessTs:        ISO-8601 | null,
  deadFlagTs:           ISO-8601 | null (nur BLACK),
  probeLastTs:          ISO-8601 | null (AMBER Probe-Cooldown),
  cachedValue:          letzter erfolgreicher Wert | null
}
```

**Breaking Change gegenüber v4:**
`consecutiveSuccesses` ist ein neues Feld. Beim Lesen fehlender alter Einträge:
Default-Wert ist `0` — kein Fehler, kein Reset nötig.

---

## Teil IV: LocalStorage Recovery Protocol (G-002)

### Szenario A: LocalStorage wurde geleert

**Erkennung:** Beim App-Start liest der Circuit-Breaker-Init-Code alle
`neo_cb_*`-Keys. Wenn keiner vorhanden ist, aber `data-cb-initialized`
nicht gesetzt ist, wurde der Storage entweder nie initialisiert (erster Start)
oder er wurde geleert.

Unterscheidung erster Start vs. geleert:
- Ein separater Sentinel-Key `neo_app_ever_started: "true"` wird beim
  allerersten App-Start gesetzt.
- Wenn `neo_app_ever_started` fehlt: Erster Start. Normal.
- Wenn `neo_app_ever_started` gesetzt, aber `neo_cb_*` Keys fehlen:
  Storage wurde geleert.

**Recovery-Verhalten:**
- Alle Circuit-Breaker starten in Phase GREEN mit failPoints = 0.
- Das ist **sicher** — kein Datenverlust, kein Sicherheitsproblem.
- Das ist **erwünscht** — frischer Start, Dienste bekommen eine neue Chance.
- Der Phasen-Indikator im Control-Center zeigt einmalig einen passiven
  Hinweis: "API-Zustandsspeicher wurde zurückgesetzt."
- Kein blockierender Dialog. Kein Toast im Briefbereich. Silent Recovery.

**Konsequenz für BLACK-Dienste:**
Ein Dienst der BLACK war, startet nach Storage-Clear als GREEN. Das ist
eine bewusste Entscheidung: Der Nutzer hat aktiv (oder der Browser hat
automatisch) den Storage geleert. Das ist ein impliziter Reset-Wunsch.

### Szenario B: QuotaExceededError beim Schreiben

**Erkennung:** `localStorage.setItem()` wirft `QuotaExceededError`.

**Priorisierungs-Hierarchie beim Speichern:**

Priorität 1 — KRITISCH (wird immer gespeichert, älteste andere Daten werden
verdrängt wenn nötig):
  neo_cb_[dienst-id].phase    ← Der aktuelle Phase-Status
  neo_cb_[dienst-id].failPoints ← Der Strike-Zähler

Priorität 2 — WICHTIG:
  neo_cb_[dienst-id].consecutiveSuccesses
  neo_cb_[dienst-id].lastStrikeDateISO
  neo_cb_[dienst-id].deadFlagTs

Priorität 3 — CACHE (kann verloren gehen ohne Schaden):
  neo_cb_[dienst-id].cachedValue  ← Letzter API-Wert
  neo_draft_autosave              ← Brief-Autosave

**Recovery-Logik bei QuotaError:**
1. Versuche, Priorität-1-Daten zu schreiben.
2. Wenn immer noch QuotaError: Lösche alle Priorität-3-Einträge
   (`neo_cb_*.cachedValue`, `neo_draft_autosave`).
3. Versuche erneut Priorität-1.
4. Wenn noch immer QuotaError: In-Memory-State bleibt korrekt,
   aber warnt im Control-Center: "Speicherplatz erschöpft — Zustand wird
   nicht persistiert. Nach Neustart werden API-Zustände zurückgesetzt."

**Warum cachedValue als erste Opfer-Kategorie:**
Ein gecachter API-Wert (z.B. der letzte bekannte Basiszinssatz) kann
beim nächsten erfolgreichen Request erneuert werden. Der Circuit-Breaker-
State kann das nicht — er ist das Gedächtnis des Systems.

### Szenario C: Korrupter JSON-Wert im LocalStorage

Wenn `JSON.parse(localStorage.getItem('neo_cb_geoapify'))` fehlschlägt:

Recovery: Wert als fehlend behandeln. Den betroffenen Dienst auf GREEN
zurücksetzen. Keine Fehlermeldung an den Nutzer. Kein App-Crash.
Grund: Ein korrupter String im LocalStorage deutet auf ein
Browser-Problem hin, nicht auf einen Logik-Fehler.

---

## Teil V: Silent Failure — Schweigen als Design (unverändert)

Das System schweigt bei API-Fehlern. Der Phasen-Indikator im Control-Center
ist die einzige passive Sichtbarkeit. Kein Modal, kein Toast im Briefbereich.
[MANDATE-000]: Nutzersouveränität über Automatismus.

---

## Teil VI: Akinator-Heuristik-Guard (unverändert aus v4.0.0)

Drei Stufen: Strukturelle Vollständigkeit → Feld-Plausibilität → Markdown-Check.
Der Guard ist ein Vertrauensfilter, kein Korrektursystem.
Vollständige Spezifikation: 09_resilience_strategy_v4.0.0.md Teil IV.

---

## Teil VII: Fallback-Hierarchie (unverändert aus v4.0.0)

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

## Teil VIII: Offline-Souveränitäts-Pyramide (unverändert)

```
  TIER 3: Monetäre Dienste → BLACK nach 1 Strike
  ─────────────────────────────────────────────────
  TIER 2: Free-Key-Dienste → Daily-Strike (14 Punkte) + CST
  ─────────────────────────────────────────────────
  TIER 1: Stabile öffentliche APIs → Daily-Strike + Cache + CST
  ─────────────────────────────────────────────────
  TIER 0: Eingebettete Logik (IBAN, DIN-Maße, Anrede-Matrix)
          NIEMALS ausfallbar — 100% Offline
```

Invariante: Jede Tier-Ebene funktioniert vollständig wenn alle höheren
Ebenen nicht verfügbar sind. Tier-0 ist das System.

---

## Änderungs-Delta gegenüber v4.0.0

| Bereich | v4.0.0 | v5.0.0 |
|---|---|---|
| Auto-Reset | 1 Erfolg → GREEN | 3 aufeinanderfolgende Erfolge → GREEN |
| Schema | 7 Felder | 8 Felder (+consecutiveSuccesses) |
| Temporal | plainDateISO() ohne TZ | plainDateISO(timeZoneId()) — G-007 Fix |
| Storage Clear | nicht spezifiziert | Recovery Protocol + Sentinel-Key |
| QuotaError | nicht spezifiziert | Prioritäts-Hierarchie + Fallback |
| Korrupter JSON | nicht spezifiziert | Graceful Reset + kein App-Crash |

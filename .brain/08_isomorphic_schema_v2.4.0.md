---
tags: [aviation-grade, platinum-2026, architecture, final-cleanup, chrome-146]
status: cemented
version: 2.4.0
last_audit: 2026-03-21
id: CAA-008
title: Isomorphic Master Registry — Central Architectural Authority
supersedes: 08_isomorphic_schema_v2.3.0.md
authority: SUPREME über SPEC-007, index.html, logic.js, devmode.js
traceability: [BRAIN-017, BRAIN-015, ANTI-016, INCIDENT-002, MANDATE-NO-LEGACY]
heals: [G-004 Strict Schema Gate ersetzt Legacy-Mapping aus v2.3.0]
delta: Sektion M komplett ersetzt — kein Legacy-Mapping, kein Migrations-Versuch
---

# Isomorphic Master Registry (IMR) v2.4
## "Ein Feld — ein Key — ein Tag — eine Wahrheit — ein Anker"

## Änderungs-Delta gegenüber v2.3.0

**Einzige Änderung:** Sektion M ist komplett ersetzt.
v2.3.0 Sektion M enthielt eine "Legacy Key Mapping"-Tabelle und eine
"Stufe 3 — Legacy-Mapping-Versuch". Beides ist gestrichen.

**Begründung:** Es gibt keine Legacy-Backups. Das System existiert seit
IMR v2.2+ und hat zu keinem Zeitpunkt v1-Keys (`sender_line` etc.) in
Produktions-Backups geschrieben. Eine Migrations-Tabelle zu pflegen für
ein Format das nie existiert hat ist Dead Weight und schafft falsche
Erwartungen über die Import-Toleranz des Systems.

**Alle anderen Sektionen (A–L, N) sind identisch zu v2.3.0:**
- Sektionen A–J: Referenz → 08_isomorphic_schema_v2.2.0.md
- Sektion K (Ghost-Mirror Multi-Page): Referenz → 08_isomorphic_schema_v2.3.0.md
- Sektion L (Alle 11 Anker): Referenz → 08_isomorphic_schema_v2.3.0.md
- Sektion N (Vier-Einheits-Invariante): Referenz → 08_isomorphic_schema_v2.3.0.md

---

## SEKTION M v2.4: JSON Import — Strict Schema Gate (G-004 Final)

### Mandate: Kein Legacy, kein Migrations-Versuch

> DIN-BriefNEO importiert ausschließlich JSON-Dateien die dem aktuellen
> IMR-Schema entsprechen. Unbekannte Keys werden nicht gemappt, nicht
> toleriert, nicht ignoriert — sie lösen sofortige Ablehnung aus.
>
> Es gibt keine Legacy-Backups. Es gibt keine v1-Keys. Es gibt kein
> Migrations-Szenario. Wer ein altes Backup hat, hat kein DIN-BriefNEO-Backup.

### Das Strict Schema Gate: Zwei Stufen

**Stufe 1 — JSON-Integrität:**
`JSON.parse()` schlägt fehl → sofortige Ablehnung.
Fehlermeldung: "Import fehlgeschlagen: Ungültiges JSON-Format."

**Stufe 2 — Strict Key Validation:**
Nach erfolgreichem Parse wird das Objekt gegen die kanonischen IMR-Keys
aus `constants.js IMR` geprüft.

Erlaubte Keys (vollständige Whitelist):
```
sender, note, recipient, date, your_ref, our_ref, subject,
salutation, body, greeting, signature,
author_company, author_name, author_street, author_zip,
author_city, author_phone, author_email, author_iban
```

Optionale Sonder-Keys (werden ignoriert, kein Fehler):
```
_meta  ← reserviert für Backup-Metadaten (imr_version, exported_at)
```

**Jeder andere Key → sofortige Ablehnung des gesamten Imports.**
Fehlermeldung: "Import fehlgeschlagen: Unbekannte Schema-Felder erkannt.
Bitte ein aktuelles DIN-BriefNEO-Backup verwenden."

Kein partieller Import. Kein "best effort". Kein Silent-Drop.
Entweder das JSON ist 100% schema-konform, oder es wird abgelehnt.

### Warum Strict statt Tolerant

**Toleranter Import ist gefährlicher als Ablehnung:**
Wenn ein fremdes JSON mit Keys wie `empfaenger`, `text`, `betreff` importiert
wird und das System diese lautlos ignoriert, ist das Ergebnis ein leerer Brief
ohne Fehlermeldung. Der Nutzer denkt der Import hat funktioniert.

**Strict Ablehnung gibt sofortiges, klares Feedback:**
"Unbekannte Schema-Felder" ist eine Information. "Brief ist leer" ist keine.

**MANDATE-000 gilt:**
Nutzersouveränität erfordert, dass das System ehrlich kommuniziert.
Ein Import der nichts importiert ist keine Nutzersouveränität — das ist
stilles Versagen.

### Import-Ergebnis-Matrix

| Situation                        | Fehlermeldung                                    | Import     |
|----------------------------------|--------------------------------------------------|------------|
| Alle Keys valide                 | keiner                                           | Vollständig|
| _meta vorhanden, Rest valide     | keiner                                           | Vollständig|
| Unbekannter Key vorhanden        | "Unbekannte Schema-Felder erkannt"               | Abgelehnt  |
| JSON parse-Fehler                | "Ungültiges JSON-Format"                         | Abgelehnt  |
| Leeres JSON-Objekt `{}`          | keiner — alle Felder bleiben leer                | Vollständig|
| Null-Werte für valide Keys       | keiner — explizit null ist valide                | Vollständig|

### _meta: Das optionale Backup-Envelope

Valide Backups können (und sollen) ein `_meta`-Objekt tragen:

```json
{
  "_meta": {
    "imr_version": "2.4",
    "exported_at": "2026-03-21T10:00:00Z",
    "app": "DIN-BriefNEO"
  },
  "sender": "...",
  "note": null
}
```

`_meta` ist der einzige erlaubte Nicht-IMR-Key.
Er wird beim Import ignoriert (kein `din-_meta`-Tag im DOM).
Sein Vorhandensein aktiviert KEINE Migrations-Logik — auch nicht in Zukunft.
Wenn ein zukünftiger Export `imr_version: "1.0"` enthält, gilt trotzdem
das Strict Schema Gate. Die Version im `_meta` ist Dokumentation, kein Steuerungs-Signal.

### Cemetery: Legacy-Mapping-Tabelle (TOMB-M001)

Die in v2.3.0 dokumentierte Mapping-Tabelle ist hiermit formell begraben:

```
TOMB-M001 — Legacy Key Mapping Tabelle (v2.3.0 Sektion M)
  sender_line    → sender
  special_note   → note
  signature_name → signature
  ...

Begraben: 2026-03-21
Grund: Diese Keys wurden nie in Produktions-Backups verwendet.
       Die Tabelle schuf falsche Erwartungen über System-Toleranz.
       Das Strict Schema Gate ersetzt jede Toleranz-Logik.
Status: TOMB-M001 — darf nicht wiederbelebt werden.
```

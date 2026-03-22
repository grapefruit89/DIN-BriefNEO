---
tags: [aviation-grade, platinum-2026, architecture, chrome-146, incremental]
status: cemented
version: 2.0.0
last_audit: 2026-03-21
id: BRAIN-013
title: Agent Safety Protocol — Datenverlust-Prävention
supersedes: 13_agent_safety_protocol.md (v1.0.0)
authority: SUPREME über alle Werkzeug-Entscheidungen
traceability: [MANDATE-INJ, MANDATE-FREEZE, INCIDENT-001, INCIDENT-002]
---

# 13 — Agent Safety Protocol v2.0: Datenverlust ist strukturell verhinderbar

## INCIDENT-Chronologie

INCIDENT-001 | Session 11 | 2026-03-20
  logic.js (160+ Zeilen Fachlogik) mit filesystem:write_file auf 19 Zeilen überschrieben.
  Ursache: Falsches Werkzeug für chirurgischen Patch.
  Wiederherstellung: vollständig aus Kontext-Puffer.
  Permanenter Verlust: keiner — weil .git vorhanden.

INCIDENT-002 | Session 12 | 2026-03-20
  08_isomorphic_schema.md (287 Zeilen, IMR SSoT) mit Desktop Commander:write_file
  (mode: rewrite) auf 12 Zeilen (nur YAML-Header) überschrieben.
  Ursache: YAML-Header-Patch mit destruktivem Werkzeug ohne Vollinhalt.
  Wiederherstellung: vollständig aus Kontext-Puffer.
  Permanenter Verlust: keiner — weil Inhalt im Kontext und .git vorhanden.

LEHRE BEIDE INCIDENTS: Kein Verlust weil Git vorhanden war.
Ohne Git wäre in beiden Fällen Fachlogik bzw. die IMR-SSoT dauerhaft verloren.

---

## SEKTION A: Werkzeug-Taxonomie

KLASSE 1 — DESTRUKTIV (vollständige Überschreibung):
  filesystem:write_file
  Filesystem:write_file
  Desktop Commander:write_file (mode: 'rewrite')
  Windows-MCP:FileSystem (mode: 'write')

KLASSE 2 — CHIRURGISCH (gezielter Patch):
  Desktop Commander:edit_block (old_string / new_string)
  str_replace (old_str / new_str)
  Desktop Commander:write_file (mode: 'append')

KLASSE 1 ist für NEUE Dateien oder vollständige Neufassungen.
Bei existierenden Dateien: KLASSE 1 = KRITISCHES RISIKO.

---

## SEKTION B: Entscheidungsregel (PFLICHT vor jedem Schreibvorgang)

  IST DIE DATEI NEU (existiert noch nicht)?
    → KLASSE 1 erlaubt.

  EXISTIERT DIE DATEI BEREITS?
    → REGEL ZERO (Sektion G) prüfen: NEUE Datei mit Version-Suffix erstellen.
    → KLASSE 1 auf bestehende Dateien: VERBOTEN.
    → KLASSE 2 (append/edit_block): nur wenn explizit kein neuer Versionsstand.

Die Drei-Schritt-Regel für Patches:
  1. READ — Datei vollständig lesen. Inhalt im Kontext bestätigen.
  2. IDENTIFY — Genau die Zeilen benennen die sich ändern sollen.
  3. PATCH — edit_block mit old_string = exakter existierender Text.

Schritt 1 übersprungen = keine Berechtigung für Schritt 3.

---

## SEKTION C: Git als letztes Sicherheitsnetz

Pre-Session Ritual (PFLICHT, 30 Sekunden):
  git add -A
  git commit -m "chore: pre-session checkpoint [DATUM]"

Post-Session Check (EMPFEHLUNG):
  git diff --stat HEAD
  Alarm-Signal: js/logic/logic.js | 148 deletions(-) — STOPP
  Normal:       js/logic/logic.js | 3 insertions(+), 2 deletions(-) — OK

---

## SEKTION D: Automatischer Pre-Session Checkpoint

Datei: scripts/pre-session.ps1

  $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
  $status = git status --porcelain
  if ($status) {
    git add -A
    git commit -m "chore: pre-session checkpoint [$timestamp]"
    Write-Host "Checkpoint: $timestamp" -ForegroundColor Green
  } else {
    Write-Host "Clean Working Tree." -ForegroundColor Green
  }

---

## SEKTION E: Warnsignale — Wann ein Agent STOPPEN muss

1. Er will KLASSE 1 auf eine existierende Datei anwenden
   ohne den vollständigen neuen Inhalt im Kontext zu haben.

2. Die Operation betrifft mehr als 20% des existierenden Inhalts
   ohne explizite Neufassungs-Anweisung.

3. Er will eine kritische Datei ändern ohne sie zuerst gelesen zu haben.

4. edit_block schlägt fehl (old_string nicht gefunden) —
   NICHT auf KLASSE 1 ausweichen, sondern READ wiederholen.

Meldung an Nutzer:
"Ich lese [Dateiname] vollständig bevor ich schreibe, um sicherzugehen
dass kein Inhalt verloren geht."

---

## SEKTION F: Kritische Datei-Liste

| Datei                           | Grund                              |
|---------------------------------|------------------------------------|
| js/core/constants.js            | IMR SSoT — INCIDENT-001 Schwester  |
| js/logic/logic.js               | Gesamte Fachlogik — INCIDENT-001   |
| GEMINI.md                       | Verfassung — alle ADRs             |
| index.html                      | DOM-Struktur — alle Tag-Selektoren |
| .brain/08_isomorphic_schema.md  | IMR Human-SSoT — INCIDENT-002      |
| css/din5008-paper.css           | CMA-Koordinaten — Aviation Grade   |

---

## SEKTION G: REGEL ZERO — Die Versions-Datei-Regel (INCIDENT-002)

### Der neue absolute Standard

EXISTIERT DIE DATEI?
  → IMMER eine NEUE Datei mit Versions-Suffix erstellen.
  → Format: [dateiname]_v[version].md
  → Beispiel: 08_isomorphic_schema_v2.2.0.md
  → NIEMALS auf existierende Dateinamen schreiben (rewrite oder append).

AUSNAHMEN: KEINE.

### Warum neue Dateien strukturell sicherer sind als Overwrite/Append

Append-Problem:
  Auch append-Mode kann versehentlich durch ein späteres rewrite auf denselben
  Dateinamen rückgängig gemacht werden. Der Dateiname ist das Angriffsvektors.

Overwrite-Problem:
  Direkt dokumentiert durch INCIDENT-001 und INCIDENT-002.
  Ein Werkzeug mit mode:'rewrite' löscht ALLES was vorher da war.
  Wenn der vollständige Inhalt nicht im Kontext ist: permanenter Verlust.

Neue-Datei-Lösung:
  Eine neue Datei mit neuem Namen ist STRUKTURELL nicht überschreibbar,
  solange der Dateiname unbekannt ist. Das ist der sicherste Pfad.
  Es gibt keinen Code-Pfad der versehentlich 08_isomorphic_schema_v2.2.0.md
  überschreibt, wenn der Agent nicht explizit diesen Namen nennt.

### Analogien zu etablierten Systemen

  ADRs (Architecture Decision Records):
    ADR-009 wird nie editiert — ADR-010 kommt neu.
    Historische Entscheidungen bleiben lesbar.

  RFC-Prozess:
    RFC-0042 wird nicht verändert — RFC-0043 dokumentiert die Weiterentwicklung.

  Git Commits:
    Commits werden nicht editiert — neue Commits kommen obendrauf.

DIN-BriefNEO adoptiert dieses Prinzip für ALLE .brain-Dokumente.
Das Archiv ist unveränderlich. Die aktuellste Version ist immer die höchste Versionsnummer.

### Wie die aktuelle Version gefunden wird

  ls -la .brain/ | grep "08_isomorphic" | sort -V
  → Höchste Versionsnummer = aktuelle Version.

Obsidian: Tags [id: CAA-008] in allen Versionen identisch.
Der Tag-Link zeigt auf alle Versionen, sorted by last_audit.
Die aktuelle ist immer die neueste.

### Implementation jetzt

Der Agent führt IMMER diese mentale Prüfung durch:
  1. Welche Datei soll geändert werden?
  2. Existiert diese Datei bereits?
  3. JA → Neue Datei mit version +0.1.0 oder +1.0.0 erstellen.
  4. NEIN → Neue Datei erstellen (KLASSE 1 erlaubt).

Das ist die einzige Entscheidungsregel. Keine Ausnahmen.

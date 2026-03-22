---
id: BRAIN-013
title: Agent Safety Protocol — Datenverlust-Prävention
version: 1.0.0
created: 2026-03-20
status: MANDATORY — PFLICHTLEKTUERE fuer alle Agenten-Sessions
authority: SUPREME ueber alle Werkzeug-Entscheidungen
traceability: [MANDATE-INJ, MANDATE-FREEZE, INCIDENT-001]
---

# 13 — Agent Safety Protocol: Datenverlust ist strukturell verhinderbar

## INCIDENT-001: Der Ausloeser dieser Datei

Session 11, 2026-03-20:
`logic.js` (160+ Zeilen, vollstaendige Fachlogik) wurde durch
`filesystem:write_file` mit 19 Zeilen ueberschrieben.
Ursache: Falsches Werkzeug fuer eine chirurgische Patch-Operation.
Erkennung: Innerhalb derselben Session (manueller Check).
Wiederherstellung: Vollstaendig, aus Kontext-Puffer.
Permanenter Verlust: Keiner — weil `.git` vorhanden war.

**LEHRE: Der einzige Grund, warum kein permanenter Schaden entstand,
war Git. Ohne Git waere logic.js dauerhaft verloren gewesen.**

---

## SEKTION A: Die Wurzel des Problems — Werkzeug-Taxonomie

Es gibt genau zwei Klassen von Schreib-Werkzeugen. Ein Agent MUSS wissen,
welche Klasse er gerade benutzt, bevor er sie einsetzt.

### KLASSE 1 — DESTRUKTIV (vollstaendige Ueberschreibung)

```
filesystem:write_file        ← GESAMTE Datei wird ersetzt
Filesystem:write_file        ← GESAMTE Datei wird ersetzt
Desktop Commander:write_file (mode: 'rewrite')  ← GESAMTE Datei wird ersetzt
Windows-MCP:FileSystem (mode: 'write')          ← GESAMTE Datei wird ersetzt
```

**Diese Werkzeuge sind fuer NEUE Dateien oder vollstaendige Neufassungen.**
Bei existierenden Dateien mit Inhalt ist ihr Einsatz ein KRITISCHES RISIKO.

### KLASSE 2 — CHIRURGISCH (gezielter Patch)

```
Desktop Commander:edit_block (old_string / new_string)  ← NUR der Patch
str_replace (old_str / new_str)                         ← NUR der Patch
Desktop Commander:write_file (mode: 'append')           ← Nur Anfuegen
```

**Diese Werkzeuge sind fuer Patches an existierenden Dateien.**
Sie koennen keinen Inhalt ausserhalb des Patches zerstoeren.

---

## SEKTION B: Die Entscheidungsregel (PFLICHT vor JEDEM Schreibvorgang)

```
IST DIE DATEI NEU (existiert noch nicht)?
  → KLASSE 1 ist erlaubt.

EXISTIERT DIE DATEI BEREITS?
  → KLASSE 1 ist VERBOTEN.
  → KLASSE 2 (edit_block / append) ist PFLICHT.
  → AUSNAHME: Vollstaendige, gewollte Neufassung einer Datei.
              Dann: Datei ZUERST lesen, DANN KLASSE 1 mit VOLLEM Inhalt.
```

### Die Drei-Schritt-Regel fuer Patches (MANDATORY)

Vor JEDEM Schreibvorgang an einer existierenden Datei:

1. **READ** — Datei vollstaendig lesen. Inhalt im Kontext bestaetigen.
2. **IDENTIFY** — Genau die Zeile(n) benennen, die sich aendern sollen.
3. **PATCH** — edit_block mit old_string = exakt der existierende Text,
               new_string = der gewuenschte neue Text.

Ein Agent, der Schritt 1 (READ) ueberspringt, hat keine Berechtigung,
Schritt 3 (PATCH) auszufuehren. Das ist keine Empfehlung — es ist Protokoll.

---

## SEKTION C: Git als letztes Sicherheitsnetz

Das Projekt hat `.git`. Das bedeutet: **Kein Schreibvorgang ist permanent**,
solange kein `git commit` danach stattgefunden hat.

### Das Pre-Session Ritual (PFLICHT — 30 Sekunden)

Vor JEDER Agenten-Session, in der Code oder Docs veraendert werden:

```powershell
# Im Projektverzeichnis:
git add -A
git commit -m "chore: pre-session checkpoint [$(Get-Date -Format 'yyyy-MM-dd HH:mm')]"
```

**Was das leistet:**
- Alle bisherigen Aenderungen sind committed.
- Nach einem Datenverlust: `git diff HEAD` zeigt sofort, was fehlt.
- Wiederherstellung: `git checkout HEAD -- js/logic/logic.js`
- Nuclear Option: `git reset --hard HEAD` setzt alles zurueck.

### Das Post-Session Ritual (EMPFEHLUNG — 30 Sekunden)

Nach jeder Agenten-Session:

```powershell
git diff --stat HEAD
# Zeigt: welche Dateien wurden geaendert? Wie viele Zeilen?
```

Ein Datei-Verlust wie INCIDENT-001 waere sofort sichtbar gewesen:
```
js/logic/logic.js | 148 deletions(-)   ← ALARM-SIGNAL
```

Ein normaler Patch sieht so aus:
```
js/logic/logic.js | 3 insertions(+), 2 deletions(-)   ← NORMAL
```

---

## SEKTION D: Automatischer Pre-Session Checkpoint (PowerShell-Skript)

Datei: `scripts/pre-session.ps1`

Dieses Skript MUSS vor jeder Agenten-Session ausgefuehrt werden.
Es committed automatisch den aktuellen Stand mit Zeitstempel.

```powershell
# scripts/pre-session.ps1
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$status = git status --porcelain
if ($status) {
    git add -A
    git commit -m "chore: pre-session checkpoint [$timestamp]"
    Write-Host "✅ Checkpoint erstellt: $timestamp" -ForegroundColor Green
} else {
    Write-Host "✅ Kein offener Stand — Clean Working Tree." -ForegroundColor Green
}
Write-Host "🛡️ Git-Schutz aktiv. Session kann beginnen." -ForegroundColor Cyan
```

---

## SEKTION E: Warnsignale — Wann ein Agent STOPPEN muss

Ein Agent MUSS die Operation unterbrechen und den Nutzer fragen, wenn:

1. Er eine existierende Datei mit KLASSE-1-Werkzeug schreiben will,
   ohne den vollstaendigen neuen Inhalt im Kontext zu haben.

2. Die geplante Schreiboperation mehr als 20% des existierenden
   Dateiinhalts betrifft — ohne explizite Anweisung zur Neufassung.

3. Er eine kritische Datei (GEMINI.md, constants.js, logic.js, app.js)
   veraendern will, ohne sie zuerst gelesen zu haben.

4. Der edit_block-Patch fehlschlaegt (old_string nicht gefunden) —
   NICHT auf KLASSE-1 ausweichen, sondern READ wiederholen.

**Die Meldung an den Nutzer in diesen Faellen:**
"⚠️ Ich bin dabei, [Dateiname] zu veraendern. Ich lese sie zuerst vollstaendig,
um sicherzugehen, dass kein Inhalt verloren geht. Bitte warte kurz."

---

## SEKTION F: Kritische Datei-Liste (Extra-Schutz)

Diese Dateien haben erhoehten Schutz. Vor jeder Aenderung: READ + CONFIRM.

| Datei | Grund |
|---|---|
| `js/core/constants.js` | IMR SSoT — Verlust bricht gesamte Tag-Infrastruktur |
| `js/logic/logic.js` | Gesamte Fachlogik — INCIDENT-001 Quelle |
| `GEMINI.md` | Verfassung — Verlust loescht alle ADRs |
| `index.html` | DOM-Struktur — Verlust bricht alle Tag-Selektoren |
| `.brain/08_isomorphic_schema.md` | IMR Human-SSoT |
| `css/din5008-paper.css` | CMA-Koordinaten — Aviation Grade |

**Faustregel:** Wenn eine Datei einen CMA-Wert, einen IMR-Eintrag oder
einen ADR enthaelt, ist sie kritisch.

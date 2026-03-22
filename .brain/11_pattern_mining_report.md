---
id: BRAIN-011
title: Pattern Mining Report — Logik-Extraktion aus Frameworks
version: 1.0.0
created: 2026-03-20
status: REFERENCE — Kein Code, nur abstrahierte Muster
traceability: [ADR-003, CAA-008, PLAN-010, SPEC-020]
---

# 11 — Pattern Mining Report: Lexical & TipTap für Vanilla JS

## Einleitung: Warum Frameworks studieren, die wir nicht nutzen?

Die Frameworks Lexical (Facebook) und TipTap (ProseMirror-basiert) haben
jahrelange Engineering-Arbeit in das Problem des WYSIWYG-Editings investiert.
Ihre Lösungen sind durch Millionen von Nutzern validiert. Das bedeutet nicht,
dass wir sie einbinden — aber es bedeutet, dass ihre **abstrakten Lösungsmuster**
für uns wertvoll sind.

Dieser Bericht extrahiert das WARUM und WAS dieser Systeme, nicht das WIE.
Das WIE für DIN-BriefNEO bleibt immer: Vanilla JS, minimal, beherrschbar.

---

## MUSTER 1: Das Doppelpuffer-Prinzip (aus Lexical)

### Was Lexical macht

Lexical beschreibt seinen Mechanismus als "Double Buffering": Es gibt immer
genau zwei Zustände — den **eingefrorenen aktuellen Zustand** (was der Nutzer
sieht) und den **laufenden Arbeitszustand** (was gerade verändert wird).

Eine Änderung modifiziert niemals direkt den sichtbaren Zustand. Sie modifiziert
den Arbeitszustand. Erst wenn die Änderung vollständig und konsistent ist,
wird der Arbeitszustand atomar zum neuen aktuellen Zustand — und der DOM
wird genau einmal aktualisiert. Lexical nennt das den "Reconciliation Commit".

### Was das für uns bedeutet

Unser `StateManager` mit seiner `_raw`-Kopie und der Proxy-Schicht folgt
bereits diesem Prinzip intuitiv: `_raw` ist der Arbeitszustand,
`state` (der Proxy) ist die reaktive Sicht darauf. Der "Commit" geschieht
implizit bei jedem Proxy-Set.

**Die Lücke:** Wir haben keinen expliziten "Reconciliation"-Schritt, der
sicherstellt, dass DOM-Updates immer nach dem Schreiben in den State kommen,
nie dazwischen. Das `_safeSet()`-Guard (Cursor-Safety) adressiert das
teilweise, ist aber keine vollständige Doppelpuffer-Garantie.

**Das Muster, das wir ableiten:**
> Jede State-Mutation durchläuft zwei Phasen: Schreib-Phase (nur State, kein DOM)
> und Render-Phase (nur DOM, kein State). Beide Phasen werden nie vermischt.
> `requestAnimationFrame` ist die natürliche Grenze zwischen ihnen.

---

## MUSTER 2: Dirty Tracking — Selektives DOM-Update (aus Lexical)

### Was Lexical macht

Lexical verfolgt nicht "welche Felder sich geändert haben" — es verfolgt
"welche Felder als dirty markiert wurden". Der Unterschied ist subtil aber
entscheidend: Dirty-Tracking ist **explizit**, nicht implizit durch Vergleich.

Ein Node ist entweder "Intentionally Dirty" (explizit mutiert) oder
"Unintentionally Dirty" (sein Vorfahre wurde mutiert). Der Reconciler
läuft nur auf dem dirtiest Teilbaum — nicht auf dem gesamten Dokument.

### Was das für uns bedeutet

In DIN-BriefNEO ist der "Dirty"-Zustand implizit: Wenn `sm.state.content.subject`
sich ändert, wissen wir, dass `<din-subject>` aktualisiert werden muss.
Wir müssen nicht alle 11 IMR-Felder durchgehen.

**Das Muster, das wir ableiten:**
> Jedes IMR-Feld kennt seinen State-Key. Ein State-Change-Event trägt den Key.
> Nur das Element mit diesem Key wird aktualisiert — kein Full-Sync,
> kein DOM-Scanning. Der `_onContentChange(path, value)`-Handler in ui.js
> ist bereits eine Annäherung an dieses Muster.

**Der blinde Fleck:** Bei Undo/Redo machen wir heute immer `_syncAllToDOM()` —
einen vollständigen Sync aller 11 Felder. Das ist semantisch korrekt
(wir wissen nicht, welche Felder der Undo-Schritt betroffen hat), aber
performativ teurer als nötig. Ein Snapshot-Diff wie in Lexical würde
nur die tatsächlich geänderten Felder aktualisieren.

---

## MUSTER 3: State-Reconciliation als "was IST, nicht was WAR"

### Was TipTap / ProseMirror macht

ProseMirror (die Basis von TipTap) beschreibt seinen State als
"value type" — ein unveränderliches Objekt, das den vollständigen Zustand
des Dokuments zu einem Zeitpunkt repräsentiert. Eine "Transaction" erzeugt
aus dem alten State einen neuen State — sie **transformiert**, sie **ersetzt**
nicht.

Das bedeutet: Der aktuelle State ist nie "der alte State, der schrittweise
modifiziert wurde". Er ist ein frisches Objekt, das aus einer Transformation
entstand. Das macht Vergleiche trivial: `alt === neu` ist eine O(1)-Operation.

### Was das für uns bedeutet

Unsere `StateManager.serialize()` / `StateManager.load()` -Architektur
ist bereits eine Form dieses Musters: Jeder Zustand ist ein serialisierbares
Plain-Object. Undo/Redo ist ein Stack von solchen Objekten.

**Das Muster, das wir ableiten — "State als Wahrheit, DOM als Spiegel":**

> Der State IST das Dokument. Der DOM ist eine Projektion davon.
> Die einzige erlaubte Informationsquelle für einen Export oder eine
> Validierung ist der State — niemals der DOM-Inhalt direkt.

**Kritische Konsequenz für die IMR:**
`readDOMasJSON()` liest heute den DOM direkt (via `el.textContent`).
Das ist pragmatisch korrekt, weil DOM und State synchron sind.
Aber: Wenn ein Feld durch CSS transformiert wird (z.B. Datum-Formatierung),
könnte die DOM-Ansicht vom State-Wert abweichen. Der State ist immer die
kanonische Quelle. `readDOMasJSON()` sollte langfristig als
`readStateAsJSON()` aus dem StateManager lesen.

---

## MUSTER 4: Selection Preservation — Das härteste Problem

### Was alle Frameworks gemeinsam haben

Das härteste Problem bei jedem `contenteditable`-Editor ist die
**Cursor-/Selection-Preservation**: Wenn der DOM-Inhalt während einer
Nutzereingabe programmatisch verändert wird (z.B. durch eine reaktive
State-Aktualisierung), verliert der Browser die Cursor-Position.

Lexical, TipTap und ProseMirror lösen das alle gleich: Vor jedem
programmatischen DOM-Update wird die Selektion gespeichert, das Update
wird ausgeführt, und die Selektion wird wiederhergestellt.

### Was das für uns bedeutet

Unser `_safeSet()`-Guard ("schreib nie in ein fokussiertes Element") löst
das Problem anders: **Wir schreiben gar nicht in ein fokussiertes Element.**
Das ist ein einfacheres Modell — mit dem Nachteil, dass reactive Updates
das fokussierte Feld nicht aktualisieren können.

**Das Muster, das wir ableiten:**
> Für DIN 5008-Felder (Plaintext, kurz, ein Feld = ein Konzept) ist
> "Skip wenn fokussiert" die korrekte Strategie. Sie ist stabiler als
> Selection-Restoration, weil sie keine Browser-API-Aufrufe benötigt,
> die inkonsistent zwischen Browsern implementiert sind.
> Nur für `<din-body>` (langer Rich-Text) könnte Selection-Restoration
> in Zukunft relevant werden.

---

## MUSTER 5: Das "Normalization Pass" — Zustand nach jedem Edit bereinigen

### Was ProseMirror macht

ProseMirror führt nach jedem State-Update einen "Normalization Pass" aus:
Eine deterministische Transformation, die sicherstellt, dass der neue State
alle Invarianten des Dokument-Schemas erfüllt. Beispiel: Zwei leere
Paragraphen hintereinander werden zu einem zusammengefasst.

### Was das für uns bedeutet — Der DIN-5008-Normalization Pass

DIN 5008 definiert ähnliche Invarianten für Brieffelder:
- `<din-greeting>` darf kein abschließendes Komma oder Satzzeichen haben
- `<din-subject>` darf nicht mehr als eine Zeile sein
- `<din-sender>` ist immer einzeilig

Unser `_bindGreetingGuard()` ist ein primitiver Normalization Pass für ein
einzelnes Feld. Das Muster verallgemeinert:

> Jedes `<din-*>`-Feld hat eine Liste von Invarianten. Nach jeder Eingabe
> wird ein field-spezifischer Validator ausgeführt, der den Zustand prüft
> und ggf. `aria-invalid` setzt. Der Validator **korrigiert niemals**
> automatisch — er **markiert** nur. Korrektur ist immer Nutzersache
> ([MANDATE-000]: Nutzersouveränität).

---

## Zusammenfassung: Was wir von Frameworks gelernt haben

| Framework-Muster | Unser äquivalentes Muster | Unsere Abweichung / Verbesserung |
|---|---|---|
| Double Buffering | `StateManager._raw` + Proxy | Kein expliziter Reconcile-Step |
| Dirty Tracking | `_onContentChange(path)` | Undo/Redo macht noch Full-Sync |
| State als Value Type | `serialize()` / `load()` | `readDOMasJSON()` liest DOM statt State |
| Selection Preservation | `_safeSet()` Skip-Guard | Einfacher, aber kein Feld-Update bei Fokus |
| Normalization Pass | `_bindGreetingGuard()` | Nur für greeting; IMR-weiter Validator fehlt |

**Die Kernaussage:**
Frameworks lösen diese Probleme mit viel Code, weil sie generisch sind.
DIN-BriefNEO löst sie mit weniger Code, weil es **spezifisch** ist:
11 Felder, eindeutiger Inhalt, klar definierte Invarianten.
Spezifität ist kein Nachteil. Sie ist der Grund, warum wir kein Framework brauchen.

---

## MUSTER 6: Lexical History — Undo/Redo ohne Memory Leaks

*Neu hinzugefügt: 2026-03-20 | Context7-Quelle: facebook/lexical*

### Wie Lexical History implementiert ist

Aus der Context7-Analyse geht hervor, dass Lexical History nicht ein
einfacher Array-Stack ist. Es hat drei architektonisch bedeutsame Eigenschaften:

**Eigenschaft 1 — Der Delay-Parameter**
`registerHistory(editor, historyState, delay)` nimmt einen `delay`-Wert
in Millisekunden. Dieser Delay steuert, wie lange das System wartet,
bevor es einen neuen History-Eintrag erstellt. Schnell aufeinanderfolgende
Eingaben werden zu einem einzigen Eintrag **gemergt**, nicht einzeln gestapelt.

**Das ist keine Performance-Optimierung — es ist eine UX-Entscheidung:**
Wenn ein Nutzer "Hallo" tippt (5 Tastenanschläge in 300ms), will er
beim Drücken von Ctrl+Z nicht fünfmal einzeln rückgängig machen.
Er will "Hallo" als Einheit entfernen.

**Eigenschaft 2 — Update Tags für History-Kontrolle**
Lexical kennt Update-Tags wie `HISTORY_MERGE_TAG` (merge mit vorherigem Eintrag)
und `HISTORY_PUSH_TAG` (erzwinge neuen Eintrag). Operationen wie
"Paste" oder "automatische Anrede-Ableitung" können explizit markiert werden,
sodass sie einen eigenen History-Eintrag erzeugen — oder sich dem
vorherigen anschließen.

Das ermöglicht eine **semantische History** statt einer mechanischen:
Die History-Einträge entsprechen menschlichen Aktionseinheiten, nicht
einzelnen Zeichen-Mutationen.

**Eigenschaft 3 — `unregister`-Callback gegen Memory Leaks**
`registerHistory()` gibt eine Cleanup-Funktion zurück. Wenn der Editor
abgebaut wird (Component-Unmount in React), wird diese Funktion aufgerufen.
Sie entfernt alle Event-Listener, die die History-Verwaltung aufgebaut hat.

Ohne dieses Muster würden Listener auf einem nicht mehr existierenden
Editor hängen — ein klassischer Memory Leak. Lexical löst das durch das
Prinzip: **Jede Registrierung hat eine zugehörige Deregistrierung.**

### Was das für unser Vanilla-System bedeutet

Unser `StateManager` hat eine ähnliche History-Architektur:
- `_history[]` — der Stack
- `MAX_HISTORY = 60` — Größenbegrenzung (kein unbegrenztes Wachstum)
- `_pushHistory()` mit Deduplizierung (identischer State → kein neuer Eintrag)

**Die Lücken, die Lexicals Muster aufzeigt:**

**Lücke A — Fehlender Delay/Merge-Mechanismus:**
Unser aktueller `debouncedHistory (800ms)` macht das Richtige für die
meisten Fälle. Was fehlt, ist die semantische Unterscheidung:
Ein Paste-Event sollte immer einen eigenen Eintrag erzeugen (entspricht
`HISTORY_PUSH_TAG`). Eine automatisch abgeleitete Anrede sollte mit dem
vorherigen Eintrag gemergt werden (entspricht `HISTORY_MERGE_TAG`).

**Lücke B — Kein expliziter Cleanup:**
`StateManager._listeners` ist ein Set, das über die Laufzeit wächst.
Wenn Komponenten `subscribe()` aufrufen, ohne jemals `unsubscribe()`
aufzurufen, akkumulieren Listener. Für eine Single-Page-App mit einer
langen Session ist das ein schleichendes Memory-Problem.

**Das Muster, das wir ableiten — "Jede Registrierung hat eine Deregistrierung":**
> Jede `subscribe(fn)`-Registrierung im StateManager gibt eine Unsubscribe-Funktion
> zurück. Der Aufrufer ist verantwortlich, diese bei Abbau aufzurufen.
> Wenn der Aufrufer eine UI-Komponente ist, geschieht das bei Destruction.
> Wenn der Aufrufer ein Event-Listener ist, geschieht das via AbortController.

**Das Muster für semantische History-Einträge:**
> Jede Schreib-Operation am State trägt eine "Merge-Intention":
> - `MERGE`: Merge mit dem letzten Eintrag (Tastatur-Eingabe, Auto-Ableitung)
> - `PUSH`: Neuer Eintrag erzwingen (Paste, Import, Profil-Übernahme)
> - `SKIP`: Kein History-Eintrag (reine UI-State-Änderungen wie Guides-Toggle)

---

## Aktualisierte Gesamtbilanz

| Framework-Muster | Unser äquivalentes Muster | Offene Lücke |
|---|---|---|
| Double Buffering | `StateManager._raw` + Proxy | Kein expliziter Reconcile-Step |
| Dirty Tracking | `_onContentChange(path)` | Undo/Redo macht noch Full-Sync |
| State als Value Type | `serialize()` / `load()` | `readDOMasJSON()` liest DOM statt State |
| Selection Preservation | `_safeSet()` Skip-Guard | Kein Update in fokussierten Feldern |
| Normalization Pass | `_bindGreetingGuard()` | Nur für `<din-greeting>`; IMR-weit fehlt |
| History Delay/Merge | `debouncedHistory (800ms)` | Keine semantische Merge/Push-Unterscheidung |
| History Cleanup | — | Kein `unsubscribe`-Rückgabewert bei `subscribe()` |

Die Lücken sind bekannt. Sie sind keine Fehler — sie sind Optimierungskandidaten
für spätere Versionen. Wichtig ist, dass das System heute korrekt funktioniert,
und morgen einfach verbessert werden kann, ohne neu gebaut zu werden.
Das ist Aviation Grade: Nicht perfekt bei Auslieferung — aber kontrolliert
und erweiterbar.

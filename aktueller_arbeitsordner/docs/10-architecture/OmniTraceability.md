---
id: doc-omnitraceability
title: OmniTraceability Systemarchitektur
type: concept
status: active
doc_links:
  - "[[Function-Traceability]]"
  - "[[core/constitution]]"
code_links:
  - "tools/build_db.js"
tags:
  - architecture
  - concept
---

# OmniTraceability Systemarchitektur

Das OmniTraceability-System garantiert, dass Quellcode und Dokumentation niemals asynchron laufen. Es schlägt die Brücke zwischen dem Quellcode (`website/`) und der Dokumentation (`docs/`), sodass jede logische Entität immer zweifelsfrei auf ihre architektonischen Entscheidungen (ADRs) und Implementierungs-Richtlinien (Guides) zurückgeführt werden kann.

## 🔄 Langfristige Wartungsanleitung (How-To)

Dieses System ist auf 3-5 Jahre Wartbarkeit ausgelegt. Im Gegensatz zu freitextlichen Wikis wird dieses System aktiv am Quellcode verankert. So gehst du in der Praxis damit um:

### Szenario A: Ein neues Feature wird entwickelt
1. **Entscheidung fällen:** Erstelle ein neues ADR aus dem `docs/10-architecture/ADR/Support/ADR-TEMPLATE.md`. Fülle die `decision_options` im Frontmatter aus und wähle die beste Option (`chosen_option`).
2. **Code schreiben:** Erstelle die neue Code-Datei, z.B. `website/js/feature.js`.
3. **Traceability herstellen:** Setze in Zeile 1 der Code-Datei den Header-Kommentar: 
   ```javascript
   /* @adr [[ADR-NEUES-FEATURE]] */
   ```
4. **Build:** Führe `start.ps1` aus. Das Feature erscheint automatisch im Build-Prozess und in der Matrix.

### Szenario B: Eine Architektur wird verworfen (Refactoring)
1. **Code löschen:** Lösche oder überschreibe den nicht mehr benötigten Code in `website/`.
2. **ADR archivieren:** Öffne das zugehörige ADR und ändere das Frontmatter auf `status: deprecated`.
3. **Kontext bewahren:** Füge im ADR unter "Consequences" einen kurzen Satz hinzu, warum das Konzept verworfen wurde. Das Wissen bleibt somit als Lektion erhalten.

### Szenario C: Ein globaler CSS-Bug wird behoben
1. **Kein neues ADR nötig:** Wenn es sich nur um die Korrektur einer bestehenden Logik handelt, ohne eine architektonische Entscheidung zu fällen, schreibe den Code einfach. Die Verknüpfung bleibt bestehen.
2. **Matrix manuell annotieren:** Falls die Datei eine spezielle Ausnahme darstellt (z.B. ein externes Polyfill), trage es unter "Manuelle Notizen" in der [[Function-Traceability]] ein.

## 🗄️ Relationales Architekturmodell (SQLite)

Das System ist nicht nur für Menschen (Obsidian), sondern explizit für eine spätere SQLite-Datenbank konzipiert.
Das Frontmatter aller `docs/` Dateien sowie die Header-Kommentare der `website/` Dateien bilden ein klares SQL-Schema ab:

1. **`tbl_concepts`**: Wird aus dem YAML Frontmatter extrahiert (`id`, `title`, `type`, `status`).
2. **`tbl_code_entities`**: Wird aus den Dateien im Ordner `website/` extrahiert.
3. **`tbl_concept_links`**: Die Mapping-Tabelle. Wird aus den Arrays `doc_links` und `code_links` sowie aus den `@adr` und `@guide` Code-Tags generiert.

Dadurch kann das Wissen später mit SQL-Abfragen durchsucht werden, z.B.:
```sql
SELECT title FROM tbl_concepts WHERE type = 'adr' AND status = 'active';
```

## 🛡️ Verbindliche Regeln (AGENTS.md)

Kein Feature darf den `main`-Branch erreichen, wenn seine Traceability-Kette gebrochen ist. Dies wird durch das automatisierte Fitness-Gate beim Ausführen von `start.ps1` verifiziert. Wenn eine Datei keine Verknüpfung aufweist, blockiert das Skript den Release-Prozess.

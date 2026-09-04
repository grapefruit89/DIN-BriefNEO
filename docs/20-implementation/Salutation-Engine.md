---
id: salutation-engine
title: 'Salutation & Logic Engine — 80/20 B2B-Standard (SPEC-002)'
type: reference
status: active
created: '2026-07-03'
updated: '2026-09-04'
tags:
  - din-briefneo
  - din-briefneo/implementation
  - status/active
  - type/reference
doc_links:
  - ADR-JS
  - ADR-HTML
  - spec
  - glossary
code_links:
  - website/js/41-salutation-engine.js
  - website/js/41-salutation-engine.smart.js
error_patterns:
  - salutation engine
  - anrede
  - grussformel
  - gender detection
  - formality switch
  - b2b paerchen
  - adelspartikel
  - dirty flag
  - auto reset
supersedes: []
depends_on: []
---

# Salutation & Logic Engine — 80/20 B2B-Standard (SPEC-002)

> [!NOTE] Implementierungsstatus & Architektur-Update (2026-09-04)
> Die Anrede- und Grußformel-Logik basiert auf dem **radikalen 80/20 B2B-Prinzip**.
> Aktiver Code: `website/js/41-salutation-engine.js` (wird durch `website/js/41-salutation-engine.smart.js` mit Vornamendatenbank und Adelspartikel-Unterstützung abgelöst).
>
> **Kern-Regel:** Klare Standard-Pärchen ohne Titel-Akrobatik. Alles Weitere übersteuert der Nutzer bei Bedarf direkt per ContentEditable auf dem Briefbogen (`data-dirty="true"`).

---

## 🏛️ Historie: Wie es früher gemacht wurde vs. Heute

Um Fehlentscheidungen und wiederkehrende Diskussionen zu vermeiden, dokumentiert diese Übersicht den Entwicklungsweg der Anrede-Engine:

| Aspekt | Früherer Stand (Legacy) | Neuer 80/20 B2B-Standard | Warum geändert? (Begründung) |
| :--- | :--- | :--- | :--- |
| **Geschlechtserkennung** | Nur wenn Nutzer explizit `"Herr "` / `"Frau "` voranstellte oder unsichtbare Radio-Buttons klickte. | **Zero-Click:** 2,55 KB Offline-Datenbank mit 450+ deutschen Vornamen (`MALE_NAMES` / `FEMALE_NAMES`). | Bei Eingabe wie „Thomas Müller“ scheiterte die alte Engine und fiel auf „Damen und Herren“ zurück. |
| **Der „Herr “-Tippbug** | Bei beginnender Eingabe (`"herr "`) erzeugte der Splitter fehlerhaften Kauderwelsch (`"Hallo herr,"`). | **In-Flight Guard:** Wartet bei reinem Präfix ab und liefert sauberen Zwischenzustand (`"Sehr geehrter Herr,"`). | Verhindert peinliche oder verwirrende Text-Glitches während des Schreibens. |
| **Titel (Dr., Prof.)** | Greedy Regex versuchte Titel krampfhaft in die Anrede einzubauen (`"Frau Prof. Dr. Schmidt"`). | **Standard ohne Titel:** Titel werden im Standard gestrippt. Manuelle Zusätze trägt der Nutzer direkt per Hand ein. | Reduziert Code-Komplexität drastisch; Titel-Regeln sind im B2B-Alltag hochgradig individuell. |
| **Adelspartikel** | Schnitt nur das letzte Wort ab: `"von Bismarck"` verlor das `"von"` (`"Herr Bismarck"`). | **Partikel-Erhalt:** Erkennt `von`, `zu`, `van`, `de`, `von und zu` und hängt sie an den Nachnamen an. | Entspricht der korrekten deutschen Höflichkeits- und Namenskonvention (`"Herr von Bismarck"`). |
| **Pärchen Höflich** | Grußformel war `"Herzliche Grüße"`. | Grußformel ist **`"Freundliche Grüße"`**. | „Herzliche Grüße“ wirkt im geschäftlichen Alltag oft zu privat/vertraulich; „Freundliche Grüße“ ist professioneller B2B-Standard. |
| **ContentEditable Dirty-Flag** | Einmal editiert, blieb das Feld dauerhaft gesperrt – selbst wenn der Nutzer den Text komplett löschte. | **Auto-Reset:** Wird das Feld komplett geleert, erlischt das Dirty-Flag und die Automatik regeneriert sofort neu. | Beseitigt Frust, wenn der Nutzer sich umentscheidet und wieder die Automatik wünscht. |

---

## 🎩 Die 3 verbindlichen B2B-Pärchen

Die Engine deckt über 90 % der Geschäftskorrespondenz mit drei abgestimmten, harmonischen Pärchen ab:

### 1. Förmlich (`formal`) — Der B2B- & Behörden-Klassiker
- **Einsatz:** Erstkontakt, formelle Anfragen, Rechnungen, Behördenpost.
- **Anrede Frau:** `Sehr geehrte Frau [Nachname],` *(z. B. `Sehr geehrte Frau Schmidt,`)*
- **Anrede Herr:** `Sehr geehrter Herr [Nachname],` *(z. B. `Sehr geehrter Herr Müller,` / `Sehr geehrter Herr von Bismarck,`)*
- **Fallback (Firma ohne Ansprechpartner):** `Sehr geehrte Damen und Herren,`
- **Grußformel:** **`Mit freundlichen Grüßen`**

### 2. Höflich (`polite`) — Zeitgemäßer B2B-Standard
- **Einsatz:** Bestehende Geschäftskontakte, laufende Projekte, Kundenbetreuung.
- **Anrede Frau:** `Guten Tag Frau [Nachname],` *(z. B. `Guten Tag Frau Schmidt,`)*
- **Anrede Herr:** `Guten Tag Herr [Nachname],` *(z. B. `Guten Tag Herr Müller,`)*
- **Fallback (Firma / unvollständig):** `Guten Tag,`
- **Grußformel:** **`Freundliche Grüße`**

### 3. Locker (`casual`) — Kollegial & Direkt
- **Einsatz:** Teammitglieder, bekannte Dienstleister, Startup- und Agenturumfeld.
- **Anrede mit Vorname:** `Hallo [Vorname],` *(z. B. `Hallo Thomas,`)*
- **Anrede nur Nachname:** `Hallo [Nachname],`
- **Fallback:** `Hallo,`
- **Grußformel:** **`Beste Grüße`**

---

## 📐 DIN-5008-Zeichensetzung & Validierung

Die Engine überwacht die normgerechte Zeichensetzung automatisch bei Verlassen (`blur`) manuell editierter Felder:

1. **Anrede:**
   - **Muss mit Komma enden:** `Sehr geehrte Frau Schmidt,`
   - **Regel:** Der nachfolgende Fließtext startet mit 1 Leerzeile Abstand und beginnt **kleingeschrieben** (Ausnahme: Substantive oder Höflichkeitsanrede *Sie/Ihr*).
   - **Validierung:** Fehlt das Komma, meldet das System eine dezent warnende Toast-Notification (`Constants.TOASTS.SALUTATION_PUNCTUATION`).

2. **Grußformel:**
   - **STRENG KEIN SATZZEICHEN:** Weder Komma noch Punkt nach der Grußformel (`Mit freundlichen Grüßen` — kein Komma!).
   - **Regel:** Nach der Grußformel folgen 3 Leerzeilen für die handschriftliche Unterschrift, gefolgt vom maschinenschriftlichen Namen.
   - **Validierung:** Setzt der Nutzer versehentlich ein Komma oder einen Punkt, schlägt die Toast-Warnung an (`Constants.TOASTS.CLOSING_PUNCTUATION`).

---

## 🔒 ContentEditable-Schutz & Auto-Reset

- **Manueller Schutz (`data-dirty="true"`):**
  Sobald der Nutzer ein automatisch erzeugtes Feld (`#anrede` oder `#grussformel`) manuell editiert, wird `dataset.dirty = "true"` gesetzt und das Attribut `data-generated="true"` gelöscht. Fortan überschreiben Namens- oder Einstellungsänderungen diesen Text nicht mehr.
- **Automatischer Reset:**
  Löscht der Nutzer den Inhalt des Feldes vollständig (z. B. mit Strg+A, Backspace), erkennt die Engine das leere Feld, entfernt das Dirty-Flag und generiert sofort wieder die passende Standardformel.
- **Ghost-Markierung:**
  Automatisch generierte, noch unberührte Vorschläge tragen `data-generated="true"`. Dies wird auf dem Bildschirm dezent gekennzeichnet (`--paper-ghost`), im Ausdruck (`print.css`) jedoch automatisch als normaler Text neutralisiert.

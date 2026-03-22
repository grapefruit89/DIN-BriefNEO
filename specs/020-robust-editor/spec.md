---
id: SPEC-020
title: Injection-Proof Editor & Robust Input Controls
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
---
# Feature Specification: Injection-Proof Editor & Robust Input Controls


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-GUARD]`
- **Source Pattern**: `[PAT-GF-02]` (Sanitizer) & `[PAT-AS-02]` (Spacing Defense).
- **Principle Check**: **IV. VANILLA PURITY**: Strict usage of Range-API. **VIII. CLEANLINESS**: No HTML-garbage in the DOM.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 100 
- **Fulfillment Target**: 100% (Strict)
- **Rationale**: Ein Editor ohne Schutzschilde ist für professionelle Anwender unbrauchbar.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sicherer Paste (P1)
Als Anwender möchte ich Adressen aus E-Mails oder anderen Webseiten reinkopieren können, ohne dass fremde Styles (Farben, Schriftarten) oder Code meinen Brief zerstören.

**Independent Test**: Fett formatierten, blauen Text von einer Webseite kopieren und in das Namensfeld einfügen -> Prüfung: Der Text muss in NEO als reiner, unformatierter Text erscheinen.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Global Paste Sanitizer**: Das System MUST alle `paste`-Events abfangen und den Inhalt via Selection/Range-API in unformatierten Plain Text umwandeln.
- **FR-002: .oneline Guard**: Felder mit der Klasse `.oneline` MUST den Tastendruck von `Enter` sowie das Einfügen von Zeilenumbrüchen aktiv blockieren.
- **FR-003: Spacing Defense**: Das System MUST via CSS (`br + br { display: none; }`) verhindern, dass leere Zeilen das Layout künstlich aufblähen.
- **FR-004: XSS Shield**: Die Verwendung von `innerHTML` ist STRENG VERBOTEN. Alle Daten-Injektionen erfolgen via `textContent` oder `innerText`.

## Success Criteria *(mandatory)*

- **SC-001**: **Clean DOM**: Nach einem Paste-Vorgang dürfen keine `<span>`, `<div>` oder `style`-Attribute im Editier-Feld zurückbleiben.
- **SC-002**: **No Escape**: Es ist unmöglich, durch Tastenkombinationen das Layout einer `.oneline` Zone nach unten zu verschieben.


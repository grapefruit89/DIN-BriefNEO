---
id: SPEC-036
title: Text Snippet Manager
tags: [specification, din-5008, platin]
status: cemented
weight: 80
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Text Snippet Manager


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-SNIPPET]`
- **Principle Check**: **IV. VANILLA PURITY**: Logic via simple Arrays/Objects. **V. USER SOVEREIGNTY**: Snippets are suggestions, not forced.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 80 
- **Fulfillment Target**: 100% (Usability)
- **Rationale**: Massive Zeitersparnis durch Vermeidung von repetitiven Tipparbeiten in Standard-Zonen.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Semantic Content Pool**: Das System MUST vordefinierte Listen für folgende Zonen enthalten:
    - **Vermerkzone**: Einschreiben, Einschreiben Einwurf, Einschreiben Eigenhändig, Persönlich / Vertraulich, Nicht nachsenden!, Warensendung, Büchersendung.
    - **Betreff**: Kündigung meines Vertrages (Nr. [Nummer]), Bewerbung als [Position], Anforderung von Unterlagen, Widerspruch gegen Ihren Bescheid vom [Datum], Zahlungserinnerung / 1. Mahnung, Antrag auf [Leistung].
    - **Anlagen**: Lebenslauf, Zeugnisse, Kopie des Vertrages, Nachweise in der Anlage, Ärztliches Attest.
- **FR-002: UI Trigger (The Plus Button)**: 
    - Die Vermerkzone MUST am Ende der Zeile ein dezentes "Plus"-Icon ( + ) anzeigen.
    - Bei Klick MUST ein schnelles Auswahlmenü (Dropdown oder Mini-Modal) mit den Optionen erscheinen.
- **FR-003: Zone Exclusion**: 
    - Anrede und Grußformel sind explizit EXKLUDIERT, da diese von der **Salutation Engine (SPEC-002)** intelligent berechnet werden.
- **FR-004: Smart Insertion**: Beim Wählen eines Snippets MUST der Text an der aktuellen Cursor-Position eingefügt werden (oder das Feld ersetzen, falls leer).

## Success Criteria *(mandatory)*

- **SC-001**: **Click-to-Text Speed**: Das Einfügen eines Snippets (vom Klick auf Plus bis zum Text im Feld) erfolgt in < 100ms.
- **SC-002**: **No Manual Search**: Der Nutzer muss niemals extern nach DIN-konformen Vermerken suchen; alle gängigen Optionen sind integriert.

`n`n---`n`n# ?? Popover API Upgrade (Markup-First)`n`n- **FR-005: Native Popover Integration**: Das Snippet-Auswahlmenü MUST das native HTML-Attribut `popover` nutzen.`n- **JS Elimination**: Jegliche JavaScript-Logik für das Einblenden, Ausblenden oder Zentrieren des Menüs ist ERSATZLOS GESTRICHEN. Der Browser übernimmt das Rendering im Top-Layer.`n- **Light Dismiss**: Das Menü MUST die native "Light-Dismiss" Funktionalität nutzen (automatisches Schließen bei Klick außerhalb).`n- **Rationale**: Höchste Stabilität und 0% Konflikt mit dem DIN-Layout (keine Z-Index Kämpfe mehr).
`n- **FR-006: Invoker API**: Das Öffnen des Popovers MUST via `command="toggle-popover"` und `commandfor="[id]"` am Plus-Button erfolgen (Zero-JS Toggle).


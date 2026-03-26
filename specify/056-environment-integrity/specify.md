---
id: SPEC-056
title: Zero-JS Environment Integrity & Bare Metal UI
tags: [chrome-147, chrome-148, zero-js, spec-kit]
status: cemented
version: 4.0.0
traceability: [MANDATE-NAT, MANDATE-VEC, ADR-011]
---

# Specify: Zero-JS Environment Integrity (WHAT)

## 1. Problemstellung
Klassische Web-Apps nutzen JavaScript, um UI-Zustände (z.B. Layout-Wechsel) zu verwalten. Dies führt zu Redundanz, Latenz und "Pixel-Shock". Ziel ist die vollständige Delegation der UI-Logik an die Browser-Engine.

## 2. Fachliche Anforderungen (WHAT)

### FR-001: Autonomes State-Management
- Das DOM MUSS der einzige Zustandshalter (SSoT) für UI-Optionen sein.
- Die Auswahl eines Layouts oder das Einblenden von Hilfsmitteln MUSS rein über native HTML-Formular-Elemente (Radio/Checkbox) erfolgen.

### FR-002: Implizite Visuelle Rückmeldung
- Der Browser MUSS Zustandsänderungen eigenständig animieren. 
- Es DARF KEINE explizite JavaScript-Anweisung für Animationen oder Übergänge nötig sein.

### FR-003: Isolierte Daten-Integrität (Data-IO)
- JavaScript darf NUR für die Verarbeitung von Briefinhalten (IMR) genutzt werden.
- Export, Import und Zurücksetzen sind funktionale Aktionen, die vom UI-Zustand entkoppelt sein müssen.

## 3. Erfolgskriterien
- **SC-001**: 100% Funktionalität der UI-Steuerung bei deaktiviertem JavaScript (sofern die Engine CSS-Variablen auflöst).
- **SC-002**: Null Pixel-Shift beim Layout-Wechsel durch native Engine-Interpolation.

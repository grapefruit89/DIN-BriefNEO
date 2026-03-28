---
id: SPEC-002-ANF
title: Anrede-Engine Fachanforderungen
tags: [anrede, fachlogik, din-5008]
status: active
version: 4.0.0 (IMR-Ready)
---

# 10 — Anforderung: Salutation Engine & Gender Parsing

## 1. Domain-Spec
Automatisierte DIN 5008 Anrede-Generierung basierend auf Empfänger-Input (Pattern-Matching).

## 2. Functional Requirements (FR)

### FR-001: Pattern-Scan
Execution: Regex-Scan auf `<din-empfaenger-name>` nach Präfixen:
- `Herr` / `Herrn` → logic: gender_m
- `Frau` → logic: gender_f
- `Familie` / `Eheleute` → logic: gender_fam
- null-match → logic: gender_neutral

### FR-002: Title Extraction
Scan: Extraktion von akademischen Grad-Tokens (`Dr.`, `Prof.`, etc.) für Injektion in Salutation-String.

### FR-003: Name Isolation
Logic: Isolation des Familiennamens (Suffix-Match nach Titeln).

### FR-004: Manual Override (Circuit Breaker)
State: Bei manual edit auf `<din-anrede>` → set `data-auto="false"`. Blockiert automatische Updates.

### FR-005: Förmlichkeitsstufen
Unterstützung von `formal`, `polite` und `casual`.

### FR-008: Punktuation Guard (DIN 5008)
- **Kein Komma** am Ende der Grußformel (SSoT DIN-Standard).
- **Kein Punkt** am Ende der Grußformel.

## 3. Anrede-Matrix (Normativ)

| Stufe | Gender m | Gender f | Gender n |
|:---|:---|:---|:---|
| **formal** | Sehr geehrter Herr [Name] | Sehr geehrte Frau [Name] | Sehr geehrte Damen und Herren |
| **polite** | Guten Tag, Herr [Name] | Guten Tag, Frau [Name] | Guten Tag |
| **casual** | Hallo [Vorname] | Hallo [Vorname] | Hallo zusammen |

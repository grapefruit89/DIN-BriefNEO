---
tags: [aviation-grade, platinum-2026, architecture, physical-constants, hardware-reference]
status: cemented
version: 1.0.0
last_audit: 2026-03-23
id: BRAIN-004-PHY
title: Physical Constants v1.0 — Die Hardware-Referenz
supersedes: none
---

# 04 — Physical Constants v1.0.0 (The Hardware Reference)

Dieses Dokument ist die **Hardware-Referenz** des DIN-BriefNEO. Es enthält ausschließlich nackte Zahlen, Regex-Muster und Millimeter-Werte. Jede Variable in CSS oder JS, die physikalische Berechnungen anstellt, muss sich aus dieser Quelle speisen.

## I. TYPOGRAFIE & GEOMETRIE (Aus `latex.pdf` / KOMA-Script)
- **Base Font-Size:** `14pt` (Skaliert von Standard 12pt für optimale Lesbarkeit)
- **Paragraph Spacing (`parskip`):** `0.5em` (half-line spacing, kein horizontaler Indent)
- **Signature Line Width:** `5cm`
- **Signature Line Thickness:** `0.5pt`
- **Signature Vertical Space:** `5\baselineskip` (ca. `5em` Abstand zwischen Grußformel und Name für die physische Unterschrift)

## II. DIN 5008 CMA KOORDINATEN (Aus Legacy & IMR)
Alle vertikalen Y-Achsen-Werte in Millimeter (Top-Down vom physischen Blattrand):
- `CMA_SENDER_TOP`: `27.0mm`
- `CMA_NOTE_TOP`: `40.0mm`
- `CMA_RECIPIENT_TOP`: `45.0mm`
- `CMA_YOUR_REF_TOP`: `32.0mm`
- `CMA_OUR_REF_TOP`: `37.0mm`
- `CMA_SUBJECT_TOP`: `103.4mm`
- `CMA_SALUTATION_TOP`: `116.2mm`
- `CMA_BODY_TOP`: `125.0mm`
- `CMA_PAGE_OVERFLOW_TRIGGER`: `280.0mm` (Auslöser für Seite 2)

## III. NATIVE HTML5 CONSTRAINTS & REGEX (Aus Wolf, HTML5 & CSS3)
Browser-native Validierungs-Muster für das `pattern`-Attribut:
- **PLZ (Deutschland):** `pattern="[0-9]{5}"` (`maxlength="5"`)
- **Telefon:** `pattern="[\d\s\+\-\(\)]{7,20}"`
- **Datum (Deutsch):** `pattern="\d{2}\.\d{2}\.\d{4}"`
- **Native Types:** `type="email"`, `type="tel"`, `type="date"` (löst Zero-JS Picker aus)

## IV. TIMINGS & PERFORMANCE (Resilienz & Ghost-Mirror)
- **API Circuit Breaker Timeout:** `500ms` (Abbruch der PLZ/Zins-API bei Nicht-Antwort)
- **Frame-Time Limit (Ghost-Mirror Sync):** `< 16.6ms` (Sicherstellung von stabilen 60fps bei Text-Eingabe)
- **LocalStorage Quota Limit:** `~5MB` (Hard-Limit der Browser-Engines; Trigger für G-002 Overflow Protocol)

## V. ACCESSIBILITY (Aus Peter Müller, Barrierefreie...)
- **Skip-to-Content ID:** `#top` (Das Anker-Ziel auf dem `<main>` oder `#paper` Wrapper)
- **Visually Hidden Class:** CSS-Regel für den Skip-Link (0x0 Pixel Dimension, aber fokussierbar für Tastatur-Nutzer)
- **Aria-Live Region:** `aria-live="polite"` (Für Statusmeldungen des Akinators/Circuit Breakers ohne den Fokus zu stehlen)

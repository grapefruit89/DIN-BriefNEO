---
id: SPEC-056-PLAN
title: Environment Integrity Technical Plan
status: cemented
version: 4.0.0
---

# 20 — Plan: Technische Realisierung (Environment)

## 1. Architektur-Konzept
Vollständige Kapselung der UI-Logik in der CSS-Schicht (Declarative Logic).

### Layer 1: Global State Matrix (CSS Root)
- Definition aller Geometrie-Variablen als `@property`.
- Typisierung: `syntax: '<length>'` | `inherits: true`.
- **Rationale:** Ermöglicht flüssige CSS-Transitions zwischen Millimeter-Werten.

### Layer 2: Selection Logic (`:has()` Engine)
- Nutzung von `body:has(#layout-a:checked)` zur dynamischen Umschaltung der `--din-addr-top` Werte.
- Keine `document.body.classList.toggle` Aufrufe in JS.

### Layer 3: PWA & Service Worker
- Offline-First Strategie via `sw.js`.
- Caching aller CSS/JS/HTML Atome für sofortige Verfügbarkeit.
- Manifest-Compliance für "Bare-Metal" Standalone-Experience.

## 2. APIs & Standards
- **CSS Values & Units Level 4:** Relative Einheiten und `@property`.
- **CSS Selectors Level 4:** `:has()` für State-Detection.
- **Service Worker API:** Persistence & Offline-Integrity.

## 3. Security Lockdown
- **MANDATE-NAT:** Verbot von UI-Bibliotheken oder Frameworks.
- **MANDATE-VEC:** Fokus auf Browser-native Rendering-Purity.

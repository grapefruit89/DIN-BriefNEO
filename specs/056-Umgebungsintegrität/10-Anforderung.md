---
id: SPEC-056-ANF
title: Environment Integrity Domain-Spec
status: active
version: 4.0.0
---

# 10 — Anforderung: Zero-JS Environment Integrity

## 1. Domain-Spec
Delegation der UI-Zustandshoheit an die native Browser-Engine (Blink/V8). Elimination von JS-induzierten Latenzen und "Pixel-Shocks". Bare-Metal UI Steuerung via CSS-Logic.

## 2. Functional Requirements (FR)

### FR-001: Autonomous UI State
- **SSoT:** Das DOM (Form-State) ist der primäre Zustandshalter.
- **Execution:** UI-Toggles (Layout, Guides, Theme) erfolgen exklusiv über native Radio/Checkbox-Inputs.
- **Zero-Logic:** Keine JS-Event-Listener für visuelle State-Transitions zulässig.

### FR-002: Implicit Visual Feedback
- **Interpolation:** Browser-native Transitionen für alle Geometrie-Änderungen (z.B. Form A/B Switch).
- **Engine-Direct:** Direkte Kopplung von `:checked` Zuständen an CSS-Variablen via `:has()` Selektor.

### FR-003: PWA & Aviation Lockdown
- **Availability:** Kern-UI MUSS bei deaktiviertem JS (Offline/Fallback) navigierbar bleiben.
- **Data Isolation:** JS-Ressourcen sind strikt auf IMR-Sync und Dateisystem-IO (OPFS) beschränkt.

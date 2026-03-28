---
id: SPEC-056-ANF
title: Environment Integrity Domain-Spec
status: active
version: 4.0.0
---

# 10 â€” Anforderung: Zero-JS Environment Integrity

## 1. Domain-Spec
Delegation der UI-Zustandshoheit an die native Browser-Engine (Blink/V8). Elimination von JS-induzierten Latenzen und "Pixel-Shocks". Bare-Metal UI Steuerung via CSS-Logic.

## 2. Functional Requirements (FR)

### FR-001: Autonomous UI State
- **Single Source of Truth:** Das DOM (Form-State) ist der primÃ¤re Zustandshalter.
- **Execution:** UI-Toggles (Layout, Guides, Theme) erfolgen exklusiv Ã¼ber native Radio/Checkbox-Inputs.
- **Zero-Logic:** Keine JS-Event-Listener fÃ¼r visuelle State-Transitions zulÃ¤ssig.

### FR-002: Implicit Visual Feedback
- **Interpolation:** Browser-native Transitionen fÃ¼r alle Geometrie-Ã„nderungen (z.B. Form A/B Switch).
- **Engine-Direct:** Direkte Kopplung von `:checked` ZustÃ¤nden an CSS-Variablen via `:has()` Selektor.

### FR-003: PWA & Aviation Lockdown
- **Availability:** Kern-UI MUSS bei deaktiviertem JS (Offline/Fallback) navigierbar bleiben.
- **Data Isolation:** JS-Ressourcen sind strikt auf IMR-Sync und Dateisystem-IO (OPFS) beschrÃ¤nkt.


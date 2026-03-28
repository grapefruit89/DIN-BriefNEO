---
id: SPEC-060-PLAN
title: UI Performance Technical Plan
status: cemented
version: 4.0.0
---

# 20 — Plan: Technische Realisierung (Polish)

## 1. Architektur-Layer

### Layer 1: Anti-FOUC Logic (`index.html`)
- **Execution:** Einbetten eines minimalen Inline-Scripts im `<head>`, das den `neo_layout` State aus dem `LocalStorage` liest und direkt auf das `<html>` Tag schreibt.
- **Benefit:** Die CSS-Variablen sind gesetzt, bevor das Stylesheet das Papier rendert.

### Layer 2: Toast Engine (`js/ui/ui.js`)
- **Mechanism:** Dynamische Erstellung von Elementen im `#toast-container`.
- **Animation:** Nutzung von CSS `@starting-style` für performante Einblend-Animationen ohne JS-Timer.

### Layer 3: Status Layer
- **Component:** `.status-bar` in der Sidebar.
- **Sync:** Reactive Updates via `StateManager` Subscriptions.

## 2. APIs & Standards
- **LocalStorage API:** Layout-Persistenz.
- **CSS Transitions:** Fluid Feedback.
- **Backdrop-Filter:** Modernes Glas-Design.

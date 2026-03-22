---
id: PLAN-056
spec: SPEC-056
title: Ultimate Zero-JS & Bare Metal Implementation
status: cemented
anti-patterns: [ANTI-016, ANTI-023, ANTI-025, ANTI-026]
adr: [ADR-008, ADR-011]
---

# Plan: Ultimate Zero-JS Implementation (HOW)

## 1. Architektur-Entscheidungen
- **Relational Selection**: Einsatz von `:has()` zur Erkennung von Radio-States (`:checked`).
- **CSS Logic Primes**: Einsatz von `if()` zur bedingten Zuweisung von CMA-Variablen im CSS.
- **Implicit Transitions**: Einsatz von `view-transition-trigger: checked` zur Automatisierung von Morphing-Effekten.

## 2. Technische Bausteine

### 2.1 CSS State Logic
```css
#app-shell:has(#radio-a:checked) { --layout: form-a; }
#paper { top: if(style(--layout: form-a): 27mm; else: 45mm); }
```

### 2.2 Data-IO Isolation (UIController)
- JavaScript bindet sich NUR an `[data-action]` via Event Delegation.
- Jeglicher Code, der UI-Attribute (wie `dataset.layout`) setzt, wird durch native HTML-Interaktion ersetzt.

## 3. Purge-Strategie (The Great Purge)
- Entfernung aller `onchange` Handler in `index.html`.
- Löschung von `_applyLayout()` und ähnlichen JS-Synchronisatoren.

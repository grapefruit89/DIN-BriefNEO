---
id: SPEC-058-ANF
title: Native Sanitizer Domain-Spec
status: active
version: 4.0.0
---

# 10 — Anforderung: Native Sanitizer API Integration

## 1. Domain-Spec
Strukturelle Absicherung des Dokuments gegen Cross-Site Scripting (XSS) und Datenvergiftung. Delegation der Bereinigung schädlicher HTML-Fragmente an die native Browser-Engine (Chrome 147+).

## 2. Functional Requirements (FR)

### FR-001: Injection Prevention (MANDATE-INJ)
- **Constraint:** Globales Verbot von `innerHTML` Zuweisungen für nutzergenerierte Inhalte.
- **Enforcement:** Jede Injektion von HTML (z.B. aus dem Markdown-Parser) MUSS durch ein Sicherheits-Gate laufen.

### FR-002: Engine-Level Sanitization
- **Method:** Nutzung der nativen `Sanitizer API` (`element.setHTML`).
- **Rationale:** Höchste Performance und Sicherheit durch C++ Implementierung im Browser-Kern.

### FR-003: Strict Whitelist Management
- **Allowed Elements:** `['strong', 'em', 'del', 'code', 'blockquote', 'ul', 'ol', 'li', 'br', 'span']`.
- **Blocked Elements:** `script`, `iframe`, `object`, `style`, sowie alle Event-Attribute (`onclick` etc.).
- **Attributes:** Nur spezifische Daten-Attribute (`data-placeholder`) sind erlaubt.

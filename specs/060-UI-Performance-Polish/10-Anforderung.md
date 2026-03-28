---
id: SPEC-060-ANF
title: UI Performance & Polish Domain-Spec
status: active
version: 4.0.0
---

# 10 — Anforderung: UI Performance & Polish

## 1. Domain-Spec
Elimination von visuellem Rauschen beim Start (ANTI-FOUC) und Etablierung eines hochwertigen, diskreten Nutzer-Feedbacks (Toasts). Sicherstellung einer flüssigen "Premium"-Experience.

## 2. Functional Requirements (FR)

### FR-001: Instant Layout Restoration (ANTI-FOUC)
- **Execution:** Die gewählte DIN-Variante (Form A/B) MUSS bereits vor dem First Paint geladen sein.
- **Rationale:** Verhinderung von "Layout Jumps" beim Seitenaufruf.

### FR-002: Premium Toast Feedback
- **UI:** Benachrichtigungen MÜSSEN flüssig ein- und ausgeblendet werden (Fade/Slide).
- **Context:** Farbliches Feedback (Erfolg, Warnung, Error) via OKLCH Palette.

### FR-003: Stealth Status Bar
- **UX:** Systemstatus-Infos (IMR-Sync, OPFS-State) MÜSSEN dezent am unteren Rand integriert sein.
- **Design:** Nutzung von Backdrop-Blur und minimaler Opazität.

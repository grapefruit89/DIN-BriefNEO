---
id: adr-toast-system
title: 'ADR-TOAST: Toast-System Architektur & Registry'
type: adr
status: active
created: '2026-07-03'
updated: '2026-08-07'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
  - tech/ui
  - tech/css
doc_links:
  - ADR-FEATURE
  - ADR-CSS
code_links:
  - website/js/toast.js
error_patterns:
  - toast
  - popover
  - notification
  - benachrichtigung
  - spam
  - toast registry
supersedes:
  - adr-toast-architecture
  - imr-toast-registry
depends_on: []
---

# ADR-TOAST: Toast-System Architektur & Registry

## 1. Context & Problem

**Robustes Benachrichtigungssystem ohne Framework-Abhängigkeiten.**

- Die Anwendung benötigte ein stabiles, visuell ansprechendes und zugängliches (a11y) Toast-System.

- Frühere Implementierungen basierten auf `display: none`-Toggles, manuellen Event-Listenern und einfachen JS-Timeouts — anfällig für "Notification Spam" bei schnellen Benutzeraktionen (z.B. wiederholtes Klicken auf Speichern).

- Anforderung: 100% nativ, performant, Vanilla JS/CSS, keine externe Abhängigkeit.

## 2. Decision

**Wir haben uns für eine "Next Level"-Architektur auf Basis moderner W3C-Standards entschieden.**

### Begründung

1. **Native Popover API (`popover="manual"`):** Der Toast wird in den nativen Top-Layer des Browsers gehoben — kein `z-index`-Krieg.

2. **CSS `@starting-style` & Discrete Transitions:** JS-basierte Animations-Listener entfallen. Enter/Exit-Animationen laufen vollständig nativ über `allow-discrete`-Transitions auf der `display`-Property.

3. **Deduplizierungs-Queue (Spam-Schutz):** Gleichartige Nachrichten werden nicht gestapelt, sondern als Badge (`×2`, `×3`) mit `@keyframes shake` visualisiert.

4. **Actionable & Sticky Toasts:** Die API erlaubt `action`-Objekte (z.B. "Rückgängig"-Button) und `sticky`-Modus für Progress-Indikatoren ohne Auto-Expire.

5. **W3C Accessibility (ARIA):** Toast-Container ist strikt mit `role="alert"`, `aria-live="assertive"` und `aria-atomic="true"` markiert — Screen Reader kündigen Benachrichtigungen sofort an.

6. **Swipe-to-Dismiss:** Über `PointerEvents` kann der Toast horizontal weggwischt werden — analoges Verhalten zu nativen Mobile-OS-Benachrichtigungen.

## 3. Consequences

**Positiv:** Keine externen Abhängigkeiten. Maximale Performance durch Hardware-Beschleunigung. Best-in-class UX und Accessibility. `toast.js` ist vollständig von `main.js` entkoppelt.

**Negativ/Risiko:** Setzt moderne Browser-Features voraus (Popover API, `@starting-style`). Browser älter als Ende 2023 rendern Enter/Exit-Animationen nicht — die Logik degradiert aber sicher.

## 4. Implementation & Verification

- CSS Anchor Positioning und `@starting-style` sind in `layout.css` aktiv.
- JavaScript steuert ausschließlich `show/hidePopover()` — keine Positions- oder Animationsberechnungen.
- Laufzeit: `2000ms + 30ms × Zeichenanzahl`, max. `5000ms`.
- Fitness Gate (`start.ps1`) verifiziert Traceability automatisch.

---

## Teil 2: Toast Registry — Single Source of Truth

Alle registrierten System-Benachrichtigungen mit exakten Wording-Strings und Level-Zuordnung.

> [!NOTE]
> Icons (Emojis) sind harter Bestandteil des Strings und werden im JavaScript (`showToast`) mitübergeben.

### Toast-Level & Styling

Alle Toasts verwenden native CSS-Transitions (`@starting-style`) und definieren ihre Farbakzente über die Semantik-Klasse `.type-{level}`.

| Level | CSS Klasse | Accent Color | Einsatzgebiet |
| :--- | :--- | :--- | :--- |
| **Info** | `.type-info` | `var(--c-primary)` | Neutrale System-Hinweise (Standard). |
| **Success** | `.type-success` | `var(--c-success)` | Erfolgreiche Aktionen (Speichern, Key validiert). |
| **Warning** | `.type-warning` | `var(--c-warning)` | Nicht-kritische Fehler (z.B. API Limit erreicht). |
| **Error** | `.type-error` | `var(--c-danger)` | Kritische Systemfehler (API Key ungültig). |

---

### 💾 Storage & Persistence

- **Draft gesichert:** `💾 Entwurf automatisch gespeichert` (Level: `info`)
- **Manuell gesichert:** `💾 Entwurf gespeichert` (Level: `success`)
- **Reset:** `🗑️ Alle Eingaben gelöscht` (Level: `warning`)

### 🔑 Geoapify & Address API

- **Key gültig:** `🔑 Geoapify Key gültig!` (Level: `success`)
- **Key ungültig:** `❌ Geoapify Key ungültig` (Level: `error`)
- **Key Error:** `❌ Fehler bei der Key-Validierung` (Level: `error`)
- **API Offline/Limit:** `❌ Geoapify API-Key ist ungültig oder abgelaufen! Bitte neu eintragen.` (Level: `error`)
- **Adresse übernommen:** `Adresse übernommen & gespeichert` (Level: `success`)

### 🔤 Font Manager

- **Upload erfolgreich:** `Font erfolgreich geladen` (Level: `success`)
- **Upload Fehler:** `Fehler beim Lesen der Schriftart` (Level: `error`)

### ⚙️ Healthcheck / Diagnostics

- **Plausibility Error:** Dynamisch generiert mit dem betroffenen DOM-Element, z.B. `[Architektur-Warnung] Element #xyz fehlt!` (Level: `warning`)

---
id: adr-toast-system
title: 'ADR-TOAST: Toast-System Architektur & Registry'
type: adr
status: active
created: '2026-07-03'
updated: '2026-10-11'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
  - tech/ui
  - tech/css
doc_links:
  - ADR-HTML
  - ADR-CSS
  - ADR-EVENT-DRIVEN-ARCHITECTURE
code_links:
  - website/js/core.js
error_patterns:
  - toast
  - popover
  - notification
  - benachrichtigung
  - spam
  - toast registry
  - notification.requested
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
- Die ursprüngliche Benachrichtigungskommunikation über direkte Callback-Übergaben (`onToast`) koppelte aufrufende Module an die konkrete Toast-Implementierung.
- Die aktuelle Architektur verwendet stattdessen den nativen EventBus in `website/js/core.js` und das Topic `dinbrief:notification.requested`.
- Das Toast-System ist Subscriber dieses Vertrags. Fachmodule müssen weder die Toast-DOM-Struktur noch die konkrete Anzeigeimplementierung importieren. Die Entkopplung betrifft die Kommunikation; sie verändert nicht die fachliche Bedeutung der Meldungen oder die Verantwortung des Toast-Systems für deren Darstellung.
- Anforderung: 100% nativ, performant, Vanilla JS/CSS, keine externe Abhängigkeit.

## 2. Decision

**Wir haben uns für eine "Next Level"-Architektur auf Basis moderner W3C-Standards entschieden.**

### Begründung

1. **Native Popover API (`popover="manual"`):** Der Toast wird in den nativen Top-Layer des Browsers gehoben — kein `z-index`-Krieg.

2. **CSS `@starting-style` & Discrete Transitions:** JS-basierte Animations-Listener entfallen. Enter/Exit-Animationen laufen vollständig nativ über `allow-discrete`-Transitions auf der `display`-Property.

3. **Deduplizierungs-Queue (Spam-Schutz):** Gleichartige Nachrichten werden nicht gestapelt, sondern verlängern den aktiven Timer ohne unruhigen Neuaufbau.

4. **W3C Accessibility (ARIA):** Toast-Container ist strikt mit `role="alert"`, `aria-live="assertive"` und `aria-atomic="true"` markiert — Screen Reader kündigen Benachrichtigungen sofort an.

5. **Native Schließmechanismen (Catalog A56):** Manuelle Pointer-Drag-Schleifen für Swipe-to-Dismiss sind durch Law Catalog A56 verboten. Das Schließen erfolgt rein deklarativ über den Close-Button und den nativen W3C `CloseWatcher` (Esc-Taste & Android-Back-Geste) sowie automatische Timer.

### Kommunikationsvertrag

Das Toast-System konsumiert `dinbrief:notification.requested`. Publisher übergeben die Meldung als Event-Payload mit dem vereinbarten Nachrichtentext und Meldungslevel (`type`: `'info' | 'success' | 'warning' | 'error'`).

Der EventBus ist für den Transport zuständig. Das Toast-System bleibt für Validierung, Deduplizierung, Lebenszyklus, Anzeige und Barrierefreiheit verantwortlich.

Die Toast-Implementierung kennt die aufrufenden Fachmodule nicht. Änderungen am Toast-Layout dürfen deshalb keinen Umbau der Publisher erfordern, solange der Eventvertrag unverändert bleibt.

Der vollständige Kommunikationsvertrag ist in [[ADR-EVENT-DRIVEN-ARCHITECTURE]] beschrieben.

## 3. Consequences

**Positiv:** Keine externen Abhängigkeiten. Maximale Performance durch Hardware-Beschleunigung. Best-in-class UX und Accessibility. `core.js` entkoppelt Benachrichtigungen vollständig von Fachmodulen und `main.js`-Callbacks.

**Grenzen & Risiken:** Setzt moderne Browser-Features voraus (Popover API, `@starting-style`, `CloseWatcher`). Die Initialisierung und DOM-Verdrahtung verbleibt als Aufgabe des Composition Roots (`main.js`). Der EventBus garantiert keine Zustellungsergebnisse; ungültige Payloads werden defensiv ignoriert.

## 4. Implementation & Verification

- `website/js/core.js` liefert das Pub/Sub-Fundament und das Toast-System (abonniert `Events.NOTIFICATION_REQUESTED`).
- CSS Anchor Positioning und `@starting-style` sind in `layout.css` aktiv.
- JavaScript steuert ausschließlich `show/hidePopover()` — keine manuellen Drag-Schleifen oder Positionsmessungen (Catalog A56).
- Laufzeit: `2000ms + 30ms × Zeichenanzahl`, max. `5000ms`.
- Alle alten `onToast`-Callbacks wurden restlos entfernt.
- Verifikation über automatische Unit-Tests in `test/all.js` und das Fitness Gate (`node tools/build_db.js`).

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

## Umsetzung (Wie)

Das **Wie** steckt im Code, nicht in einem separaten Guide: `website/js/core.js` (`showToast`, `initToastSystem`) + `website/css/sidebar.css` (Top-Layer/Popover). Dieser ADR begründet das **Warum**.

---
title: IMR Toast Registry
description: Zentrale Single Source of Truth für alle System-Popups (Toasts)
version: 1.0.0
status: active
type: registry
tags: [din-briefneo/registry, tech/ui, components/toast]
aliases: ["Toast Registry", "System Toasts"]
---

# IMR Toast Registry

Dieses Dokument ist die **Single Source of Truth** für alle System-Benachrichtigungen (Toasts), die über das native Popover-System in der Anwendung ausgegeben werden.

Das Toast-System (`js/toast.js`) nutzt eine dynamische Laufzeit (`2000ms + 30ms pro Zeichen`, maximal `5000ms`) und verfügt über eine Deduplizierungs-Warteschlange ("Spam-Schutz") sowie Hover-to-Pause Mechaniken.

## Toast Level & Styling

Alle Toasts verwenden native CSS-Transitions (`@starting-style`) und definieren ihre Farb-Akzente über die Semantik-Klasse `.type-{level}`.

| Level | CSS Klasse | Accent Color | Einsatzgebiet |
| :--- | :--- | :--- | :--- |
| **Info** | `.type-info` | `var(--c-primary)` | Neutrale System-Hinweise (Standard). |
| **Success** | `.type-success` | `var(--c-success)` | Erfolgreiche Aktionen (Speichern, Key validiert). |
| **Warning** | `.type-warning` | `var(--c-warning)` | Nicht-kritische Fehler (z.B. API Limit erreicht). |
| **Error** | `.type-error` | `var(--c-danger)` | Kritische Systemfehler (API Key ungültig). |

---

## Registrierte System-Toasts

Hier werden die exakten Wording-Strings definiert, die vom System getriggert werden.

> [!NOTE]
> Die Icons (Emojis) sind harter Bestandteil des Strings und werden im JavaScript (`showToast`) mit übergeben.

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
- **Plausibility Error:** Wird dynamisch mit dem betroffenen DOM-Element generiert, z.B. `[Architektur-Warnung] Element #xyz fehlt!` (Level: `warning`)

---

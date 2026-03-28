---
id: SPEC-061-PLAN
title: PVP Technical Architecture
status: cemented
version: 4.0.0
---

# 20 — Plan: Technische Realisierung (Pipeline)

## 1. Architektur-Komponenten

### Layer 1: Extraction Tooling (`scripts/get-catalog.mjs`)
- Scannt `js/core/constants.js`.
- Exportiert IMR-Objekt als JSON in `.brain/imr_catalog.json`.
- Agent-Input für präzise Element-Referenzierung.

### Layer 2: Pre/Post-Session Hooks (`tools/`)
- **`pre-session.ps1`:** Backup des aktuellen State, Check der Prerequisites.
- **`post-session-verify.ps1`:** Regex-basierter Scan auf Mandats-Verletzungen (`innerHTML`, verbotene Einheiten wie `px` in Geometrie).

### Layer 3: Git-Integration
- **Shrink-Guard:** Pre-commit Hook verhindert Commits, wenn Dateien um >20% schrumpfen ohne explizite Freigabe.

## 2. Automatisierung
- Integration in den Spec-Kit Workflow via `.specify/scripts/`.
- Jede KI-Operation triggert am Ende eine automatische Validierung der PVP.

## 3. APIs & Werkzeuge
- **Node.js:** Für Schema-Extraktion.
- **PowerShell 7:** Für System-Hooks und Datei-Analysen.
- **Git Hooks:** Zur physischen Durchsetzung der Regeln.

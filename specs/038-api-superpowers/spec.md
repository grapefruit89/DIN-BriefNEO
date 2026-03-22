---
id: SPEC-038
title: Aviation-Grade Intelligence Suite (Superpowers)
tags: [specification, din-5008, platin]
status: cemented
weight: 95
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Aviation-Grade Intelligence Suite (Superpowers)

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-INTEL]`
- **Tier-Mandate**: Strikte Einhaltung des korrigierten Vier-Stufen-Modells (Tier 0-3).
- **Philosophy**: Tier 0 ist das Fundament. Tier 1-3 sind optionale Verstärker.

---

## ? Tier 0: Hardcoded Logic (Vanilla Fallback)
- **FR-001: Local Salutation Sets**: Integration der 3 Anredeformen (Normal, Höflich, Förmlich) direkt im Code.
- **FR-002: Porto-Kalkulator**: Blattzahl -> Gewicht -> Porto (DP-Tabelle 2025). 100% Offline.
- **FR-003: Einschreiben-Empfehlung**: Lokale Stichwortanalyse ohne Cloud-Anbindung.
- **FR-004: Bank-Postfach-Database**: Statische JSON-DB für Adressen von Instituten.
- **FR-005: Fristenrechner**: Lokale Berechnung der Zustellfiktion (§ 122 BGB).

## ?? Tier 1: Public Wisdom (No-Key APIs)
- **FR-006: Basiszinssatz-Rechner**: Bundesbank-Schnittstelle (§ 247 BGB).
- **FR-007: Wochentags-Wächter**: Public API Check auf Feiertage/Wochenenden.
- **FR-008: Währungsumrechnung**: EZB-Referenzkurse via JSON-Feed.
- **FR-009: Justiz-Finder**: Öffentliche REST-Verzeichnisse für Gerichte & Ämter.
- **FR-010: Synonym-Radar**: OpenThesaurus API (Key-frei).

## ?? Tier 2: Free-Key Superpowers (User-Key APIs)
- **FR-011: Address Autocomplete**: Integration von GeoApify oder Google Places (Free Tier Keys).
- **FR-012: Grammar/Style Guard**: LanguageTool API (Kostenlose Stufe).
- **FR-013: Corporate Registry**: Handelsregister-Autofill via offeneregister.de.
- **FR-014: Gender-Validation**: Professionelle Prüfung via Gender-API.com.

## ?? Tier 3: Monetary Services (Pay-per-Action)
- **FR-015: Digital Postage (Internetmarke)**: Kostenpflichtiger Kauf via Deutsche Post REST API.
- **FR-016: Monetary Safety**: MUST strikten Sicherheitsschalter (Dead Man Switch) nutzen.

---

## ??? Implementation Rules
1. **Tier-Separation**: Features MUST technisch so getrennt sein, dass Tier 0 immer funktioniert.
2. **Key Privacy**: Alle Keys (Tier 2) und Login-Daten (Tier 3) MUST im `localStorage` verbleiben.
3. **User Sovereignty**: Jede API-Abfrage MUST dezent sein. Der Nutzer hat das letzte Wort.

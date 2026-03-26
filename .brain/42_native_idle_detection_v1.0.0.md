# 42 — Native Idle Detection v1.0.0

## I. BEFUND
Die Native Idle Detection API (Chrome 94+) erkennt Inaktivität direkt auf Betriebssystemebene.

## II. ARCHITEKTONISCHE BEDEUTUNG
- **Ersatz für Debouncing**: JS-basierte Timer (`setTimeout`, `setInterval`) zur Erkennung von "Schreibpausen" für Autosaves belasten den Main-Thread und sind verboten (TOMB-L008).
- **Ressourceneffizienz**: Der OPFS Background-Sync wird exakt dann ausgelöst, wenn das OS Hardware-Leerlauf meldet.
- **Verlässlichkeit**: OS-Hooks (Maus, Tastatur) sind präziser als isolierte DOM-Events.

## III. STATUS
- **Gültig ab**: Chrome Baseline 147
- **Doktrin**: OS-Level Idle OPFS Sync

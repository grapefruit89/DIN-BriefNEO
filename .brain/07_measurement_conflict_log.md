# ?? Measurement Conflict Log (Validation Pool)

Diese Datei dient der Erfassung und Klärung von widersprüchlichen Maßangaben aus verschiedenen Quellen. Sobald ein Wert uneindeutig ist, wird er hier gelistet und gegen die "Aviation Grade" Referenz geprüft.

## ?? Aktuelle Konflikte & Validierungen

### 1. [PARAM-SUBJECT-TOP] Position der Betreffzeile
- **Quelle A (MehrCurry)**: 103.4 mm
- **Quelle B (hennerthepenner)**: 103.5 mm (umgerechnet aus Tabellen-Offset)
- **Quelle C (rucub100)**: 98 mm (Relativ-Positionierung)
- **Status**: ? **VALIDIERT**
- **Zementierter Wert**: **103.4 mm** (MehrCurry-Präzision)

### 2. [PARAM-INFOBLOCK-LEFT] Horizontaler Beginn des Infoblocks
- **Quelle A (MehrCurry)**: 125 mm
- **Quelle B (metaminded)**: 125 mm
- **Quelle C (Standard DL)**: 120 mm (Puffer-Variante)
- **Status**: ? **VALIDIERT**
- **Zementierter Wert**: **125 mm**

### 3. [PARAM-FOOTER-TOP] Beginn der Fußzeile
- **Quelle A (MehrCurry)**: 269 mm
- **Quelle B (wincentbalin)**: 270 mm
- **Status**: ?? **UNGEKLÄRT**
- **Vorläufiger Wert**: 269 mm (Präzision geht vor)

## ??? Der Validierungs-Algorithmus
1. **Identifikation**: Sobald eine neue Quelle ein abweichendes Maß nennt, wird ein Eintrag erstellt.
2. **Abgleich**: Vergleich mit der offiziellen DIN 5008:2020 Neufassung.
3. **Zementierung**: Der Sieger-Wert wird in die `CMA` (SPEC-007) übernommen.
4. **Archivierung**: Der alte Wert wird als "Abgelehnt" markiert.

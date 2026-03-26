---
id: SPEC-061
title: Platinum Validation Pipeline (PVP)
tags: [Validation, Security, Integrity, SDD, Aviation-Grade]
status: cemented
version: 1.0.0
traceability: [MANDATE-INJ, MANDATE-NAT, MANDATE-PLN, MANDATE-FREEZE]
source: DIN-BriefNEO Constitution v16.0.1
depends-on: [SPEC-007, SPEC-051]
required-by: []
---

# SPEC-061: Platinum Validation Pipeline (PVP)

## 1. Zielsetzung
Die Platinum Validation Pipeline (PVP) ist das "Aviation Grade" Sicherheitsnetz des Projekts. Sie stellt sicher, dass kein Agent (KI oder Mensch) die obersten Mandate des Projekts unbemerkt verletzt. Sie automatisiert die Einhaltung der Architektur-Integrität und eliminiert Agenten-Halluzinationen durch SSoT-basierte Kataloge.

## 2. Kern-Komponenten

### 2.1 IMR Component Catalog (Agent Guidance)
- **Anforderung**: Ein Tool muss existieren, das die `Isomorphic Master Registry (IMR)` aus der SSoT (`js/core/constants.js`) in ein maschinenlesbares JSON-Format extrahiert.
- **Zweck**: Agenten nutzen diesen Katalog, um exakte Tag-Namen (z.B. `din-date`) statt Halluzinationen (z.B. `din-datum`) zu verwenden.
- **Datenfelder**: Tag, JSON-Key, CMA-Koordinate (sofern vorhanden).

### 2.2 Automated Mandate Enforcement (Aviation Check)
Die Pipeline muss nach jeder Änderung folgende Prüfungen automatisiert durchführen:

#### A. Security Check (MANDATE-INJ)
- **Regel**: `innerHTML` Zuweisungen sind verboten.
- **Toleranz**: 0 Verstöße erlaubt in `js/core/` und `js/ui/`.
- **Ausnahme**: Nur in spezifisch markierten Render-Engines (z.B. Ghost-Mirror Renderer), sofern dort eine Sanitization stattfindet.

#### B. Native Check (MANDATE-NAT)
- **Regel**: Keine externen NPM-Imports oder CDN-Links, die nicht explizit in der Architektur freigegeben sind.
- **Zweck**: Erhalt der Abhängigkeitsfreiheit und Browser-Nativität.

#### C. Integrity Check (MANDATE-PLN)
- **Regel**: Alle `<din-*>` Elemente im HTML müssen das Attribut `contenteditable="plaintext-only"` tragen.
- **Ausnahme**: Keine. Selbst der Body nutzt `plaintext-only` (Visualisierung via Mirror).

#### D. Visual Freeze Check (MANDATE-FREEZE)
- **Regel**: Änderungen an CSS-Layer `din.core` sind kritisch zu prüfen.
- **Zweck**: Verhindern von Pixel-Shift in der DIN-Geometrie.

## 3. Akzeptanz-Kriterien
- [ ] Ein Aufruf von `scripts/get-catalog.mjs` liefert das aktuelle IMR-Schema als JSON.
- [ ] `scripts/post-session-verify.ps1` meldet Fehler, wenn `innerHTML` im Code gefunden wird.
- [ ] `scripts/post-session-verify.ps1` meldet Fehler, wenn ein `<din-*>` Tag ohne `plaintext-only` Attribut existiert.
- [ ] Die Pipeline ist in den Spec-kit Workflow (Phase: Implement/Verify) integriert.

## 4. Erfolgskriterien
- **Halluzinations-Rate**: 0% bei IMR-Tags.
- **Security-Regression**: 100% Erkennung von `innerHTML`-Injektionen.
- **Konformität**: 100% Abdeckung der Mandate in automatisierten Checks.

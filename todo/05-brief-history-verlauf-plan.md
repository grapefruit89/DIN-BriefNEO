---
status: draft
type: concept
tags: [din5008, briefneo, plan, history, verlauf]
summary: "Plan zur Speicherung und Wiederherstellung der letzten 10 Briefentwürfe (din_history)."
---

# Brief-Verlauf & Historie (`din_history`) – Plan für DIN-BriefNEO

**Quelle:** Analyse alter Versionen (`neu.html`, `neu 2.html`) & Backlog `B32`  
**Stufe:** JS — Lokale Browser-Persistenz über `localStorage`  
**Aufwand:** S–M  
**ROI:** ⭐⭐⭐⭐ (Verhindert versehentlichen Datenverlust bei Reset/Neuladen, hoher Nutzwert)

---

## 1. Was passiert
Zusätzlich zum jeweils aktuellen Einzeldraft (`din_draft`) wird eine History der letzten **10 Briefe** geführt.
Nutzer können über die Seitenleiste frühere Versionen einsehen und mit einem Klick in den Editor zurückholen.

---

## 2. Wie es funktioniert
1. **Trigger:**
   - Automatisch bei Klick auf „Drucken“ / PDF-Export.
   - Optional: expliziter Button „In Verlauf sichern“ in der Seitenleiste.
2. **Datenhaltung:**
   - Eigener LocalStorage-Schlüssel `din_history`.
   - Array mit maximal 10 Objekten (FIFO-Ringspeicher: neuester Brief per `unshift`, Kappen per `slice(0, 10)`).
3. **Datenstruktur pro Eintrag:**
   ```json
   {
     "id": "brief-1729687200000",
     "timestamp": "2026-10-23T14:30:00.000Z",
     "empfaengerName": "Musterfirma GmbH",
     "betreff": "Kündigung des Vertrags...",
     "schema_version": 2,
     "data": { ... }
   }
   ```
4. **Wiederherstellung & Sicherheit:**
   - Klick auf einen Eintrag lädt den Zustand via `restoreState(entry.data)`.
   - Zwingende Einhaltung der Allowlist-Filterung (`sanitizeRichText`) zum Schutz vor XSS/Injection.
   - Warnabfrage (`confirm` oder modale Nachfrage), wenn der aktuell editierte Entwurf ungespeicherte Änderungen enthält.

---

## 3. UI-Integration in der Seitenleiste
- Schlankes natives `<details>`-Element in `website/index.html`:
  ```html
  <details id="details-verlauf" class="seitenleiste-details">
    <summary>Verlauf (letzte 10)</summary>
    <ul id="history-list" role="list">
      <!-- Dynamisch befüllt -->
    </ul>
  </details>
  ```
- Einträge zeigen formatiertes Datum, Empfänger und Betreffzeile.

---
id: adr-event-driven-architecture
title: 'ADR-EVENT-DRIVEN-ARCHITECTURE: Ereignisgesteuerte Client-Architektur'
type: adr
status: proposed
created: '2026-10-11'
updated: '2026-10-11'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/proposed
  - type/adr
  - tech/javascript
  - tech/event-driven
doc_links:
  - ADR-JS
  - ADR-TOAST-SYSTEM
  - ADR-DATA-PERSISTENCE
  - ADR-OMNITRACEABILITY
  - constitution
  - Immutable-Law-Catalog
  - longevity-guidelines
  - spec
code_links:
  - website/js/00-event-bus.js
  - website/js/01-document.js
  - website/js/32-toast.js
  - website/js/main.js
error_patterns:
  - event bus
  - pub/sub
  - custom event
  - callback coupling
  - notification.requested
  - document.save.requested
  - event-driven architecture
supersedes: []
depends_on: []
---

# ADR-EVENT-DRIVEN-ARCHITECTURE: Ereignisgesteuerte Client-Architektur

## 1. Status und Geltungsbereich

**Status:** Proposed – Annahme durch die Projektverantwortlichen erforderlich.

Diese ADR dokumentiert die modulübergreifende Kommunikationsarchitektur von DIN-BriefNEO. Sie beschreibt die lose gekoppelte Interaktion zwischen unabhängigen Modulen und Services, nicht die fachliche DIN-5008-Semantik des Briefmodells.

Die Foundation bleibt unverändert und normativ. Insbesondere gelten die Regeln zu nativen Web-APIs, Zero Runtime-Dependencies, synchronem localStorage-Boot-Restore und der festgelegten Browser-Baseline.

## 2. Kontext und Problemstellung

DIN-BriefNEO entwickelt sich schrittweise vom gekoppelten JavaScript-Monolithen zu einer modularen Client-Architektur. Der Umbau erfolgt nach dem Strangler-Fig-Pattern: Bestehende Funktionalität wird schrittweise hinter klarere Schnittstellen gestellt, ohne einen riskanten Rewrite from Scratch auszulösen.

Die historische Kopplung über Callback-Parameter wie `onToast` und `onSaveDraft` führte zu architekturellen Nachteilen:

- Aufrufer mussten konkrete Callback-Funktionen kennen und durch tief verschachtelte Initialisierungsketten weiterreichen.
- Module wurden über ihre Aufrufstruktur statt über ihre fachlichen Verantwortlichkeiten gekoppelt.
- Die Änderung oder Entfernung eines Callbacks erzwang Kaskaden-Änderungen über mehrere Dateien hinweg.
- Tests mussten häufig die gesamte Aufrufkette oder Mock-Verdrahtungen berücksichtigen.
- Ein neues Modul musste bestehende Callbacks kennen, bevor es Systemfunktionen nutzen konnte.

Mit dem nativen EventBus in `website/js/00-event-bus.js` wurden das Benachrichtigungssystem (`dinbrief:notification.requested`) und das Speicher- und Entwurfs-Lifecycle-System (`dinbrief:document.save.requested`, `dinbrief:document.saved`, `dinbrief:document.changed`) bereits auf Publish/Subscribe umgestellt.

Diese ADR legt die verbindlichen Architekturverträge, Regeln und zukünftigen Topics fest.

## 3. Entscheidung

DIN-BriefNEO verwendet einen leichtgewichtigen, nativen EventBus auf Grundlage von `EventTarget` und `CustomEvent`.

Der EventBus:

1. verwendet ausschließlich native W3C-Browser-APIs (`EventTarget`, `CustomEvent`);
2. erzwingt für alle fachlichen Anwendungsthemen das Namenspräfix `dinbrief:`;
3. trennt Publisher und Subscriber vollständig voneinander (lose Kopplung);
4. transportiert typisierte Datenstrukturen über `CustomEvent.detail`;
5. besitzt keine fachliche Kenntnis von Briefen, Adressen, Toasts oder Einstellungen;
6. führt keine Persistenz, DOM-Manipulation oder Geschäftslogik aus;
7. wird als geteilte Singleton-Instanz `eventBus` am Composition Root (`main.js`) bereitgestellt und kann für isolierte Tests über `createEventBus()` instanziiert werden.

Es werden keinerlei Frameworks, Drittanbieter-Bibliotheken oder Build-Schritte eingeführt (Zero Runtime-Dependencies).

### 3.1 Kommunikationsregeln

- **Publish/Subscribe:** Module veröffentlichen Ereignisse, ohne konkrete Subscriber zu kennen oder aufzurufen.
- **Ein Ereignis – ein Vertrag:** Jeder Topic-Name besitzt eine dokumentierte Bedeutung und eine definierte Payload.
- **Ein Verantwortlicher pro Zustand:** Ereignisse dürfen keine konkurrierenden Schreibpfade für denselben kanonischen Zustand etablieren (Single-Writer-Prinzip).
- **Keine impliziten Rückgabewerte:** Ein Publisher wartet nicht auf Rückgabewerte von Event-Handlern.
- **Keine versteckten Synchronitätsannahmen:** Fachliche Ergebnisse, die sofort benötigt werden, werden über reine synchrone Funktionen ermittelt. Ein Event ist kein Ersatz für einen Funktionsrückgabewert.
- **Keine Event-Schleifen:** Subscriber dürfen nicht unkontrolliert dasselbe Ereignis erneut veröffentlichen (Zirkelschlussverbot).
- **Explizite Fehlerbehandlung:** Fehler werden durch definierte Ereignisse (`document.save.failed`) oder lokale Exceptions signalisiert; Event-Handler dürfen Fehler nicht verschlucken.
- **Keine sensiblen Payloads:** API-Schlüssel oder unverarbeitete sensible Nutzereingaben werden nicht über allgemeine Broadcasts verbreitet.
- **Lifecycle & Bereinigung:** Subscriber können über die zurückgegebene `unsubscribe`-Funktion oder deklarativ über `AbortSignal` sauber entfernt werden.

### 3.2 Abgrenzung zu direkten Funktionsaufrufen

Der EventBus ist die bevorzugte Schnittstelle für modulübergreifende Benachrichtigungen und asynchrone Statusänderungen.

Er ersetzt ausdrücklich nicht:

- reine Domain-Funktionen (wie `resolvePostcode` oder `resolveCity` in `44-address-domain.js`);
- synchrone Validierungen oder Normalisierungen;
- interne Aufrufe innerhalb desselben Moduls;
- den synchronen Boot-Restore aus `localStorage`;
- explizite Storage-Schnittstellen (`saveJSON`, `loadJSON` in `51-storage.js`).

## 4. Systemverträge und Topic-Katalog

### 4.1 Implementierte Verträge (Phasen 1–4)

#### `dinbrief:notification.requested`

- **Zweck:** Ein Modul fordert eine Nutzer-Rückmeldung an, ohne das Toast-System direkt zu importieren.
- **Publisher:** Fachmodule (`43-geoapify.js`, `45-address-intelligence.js`, `46-clipboard-address-parser.js`, `41-salutation-engine.js`, `52-import-export.js`, `02-settings-manager.js`).
- **Subscriber:** `32-toast.js` (`initToastSystem`).
- **Payload-Vertrag:**
  ```javascript
  {
    message: string,      // Anzuzeigender Meldungstext inkl. Emoji
    type?: 'info' | 'success' | 'warning' | 'error' // Meldungslevel (Standard: 'info')
  }
  ```

#### `dinbrief:document.save.requested`

- **Zweck:** Ein Modul oder DOM-Listener fordert die Persistierung des aktuellen Briefentwurfs an.
- **Publisher:** `main.js` (Eingabe-Events, Select-Change), `43-geoapify.js`, `45-address-intelligence.js`, `46-clipboard-address-parser.js`, `41-salutation-engine.js`, `52-import-export.js`.
- **Subscriber:** `01-document.js` (`DraftManager`).
- **Payload-Vertrag:**
  ```javascript
  {
    debounce?: boolean    // true = entprellt via scheduleAutoSave(); false/undefined = synchron via saveDraft()
  }
  ```

#### `dinbrief:document.saved`

- **Zweck:** Bestätigt erfolgreiche Persistierung im `localStorage`.
- **Publisher:** `01-document.js` (`DraftManager.saveDraft`).
- **Subscriber:** UI-Statusindikatoren, Logging, künftige History-Observer.
- **Payload-Vertrag:**
  ```javascript
  {
    draft: Record<string, string> // Serialisierter Entwurfs-Snapshot
  }
  ```

#### `dinbrief:document.save.failed`

- **Zweck:** Signalisiert einen Speicherfehler (z. B. Storage-Quota überschritten).
- **Publisher:** `01-document.js` (`DraftManager.saveDraft`).
- **Subscriber:** UI-Statusindikator (`#save-status`), Screenreader via `ariaNotify`.
- **Payload-Vertrag:**
  ```javascript
  {
    draft: Record<string, string>
  }
  ```

#### `dinbrief:document.changed`

- **Zweck:** Signalisiert inhaltliche Änderungen durch Undo/Redo oder Entwurfs-Reset.
- **Publisher:** `01-document.js` (`#applyHistoryState`, `resetDraft`).
- **Subscriber:** Autocomplete-Reset, Metadaten-Service, abhängige Widgets.
- **Payload-Vertrag:**
  ```javascript
  {
    draft: Record<string, string>
  }
  ```

---

## 5. Geplante Topics für Phase 5 und Folgestufen

Die nachstehenden Topics bilden die Architektur-Roadmap für die Harmonisierung von Dokumentzustand und Subsystemen:

| Topic | Payload-Kern | Verantwortlicher Subscriber | Status |
| :--- | :--- | :--- | :--- |
| `dinbrief:document.field.changed` | `{ field: string, value: string, source?: string }` | Document State Service | Geplant (Phase 5) |
| `dinbrief:document.replaced` | `{ draft: Record<string, string> }` | View-Adapter / Blatt-Felder | Geplant (Phase 5) |
| `dinbrief:document.reset.requested` | `{ reason?: string }` | DraftManager | Geplant (Phase 5) |
| `dinbrief:settings.changed` | `{ setting: string, value: unknown }` | SettingsManager | Geplant |
| `dinbrief:address.lookup.requested` | `{ query: string, target: string }` | Address Intelligence | Geplant |
| `dinbrief:address.lookup.completed` | `{ results: Array<unknown> }` | Address View Popover | Geplant |
| `dinbrief:address.lookup.failed` | `{ error: string }` | Toast / Notification | Geplant |
| `dinbrief:salutation.refresh.requested` | `{ name: string, formality: string }` | Salutation Engine | Geplant |
| `dinbrief:salutation.suggestion.ready` | `{ salutation: string, closing: string }` | Salutation View | Geplant |
| `dinbrief:signature.changed` | `{ hasSignature: boolean }` | Signature View / Export | Geplant |
| `dinbrief:document.export.requested` | `{ format: 'json' }` | Import/Export Service | Geplant |
| `dinbrief:document.import.requested` | `{ payload: unknown }` | Import/Export Service | Geplant |

---

## 6. EventBus-API und Lifecycle

Die öffentliche Schnittstelle in `website/js/00-event-bus.js` umfasst:

```javascript
// Singleton-Instanz
export const eventBus = createEventBus();

// Factory für isolierte Testinstanzen
export function createEventBus(target = new EventTarget()) {
  return {
    publish(topic, payload = {}) { ... },
    subscribe(topic, handler, options = {}) { ... } // gibt unsubscribe-Funktion zurück
  };
}
```

- **Prefix-Validierung:** Aufrufe mit Topics, die nicht mit `dinbrief:` beginnen, werfen einen `TypeError`.
- **Deregistrierung:** `subscribe()` gibt eine parameterlose Unsubscribe-Funktion zurück.
- **AbortSignal:** `subscribe(topic, handler, { signal })` unterstützt native `AbortSignal`-Bereinigung.

---

## 7. Zuständigkeiten der Architektur

| Schicht | Verantwortung |
| :--- | :--- |
| **Composition Root (`main.js`)** | Initialisierung des EventBus und Verdrahtung der Module |
| **EventBus (`00-event-bus.js`)** | Neutraler Transport typisierter Events ohne Geschäftslogik |
| **State Layer (`01-document.js`, `51-storage.js`)** | Lokale Persistenz, Caret-Tracking, History-Stacks |
| **Domain Functions (`44-address-domain.js`)** | Reine zustandslose Berechnungen ohne DOM oder I/O |
| **UI Components (`32-toast.js`, Popovers)** | Darstellung, Barrierefreiheit und Top-Layer-Lifecycle |
| **Feature Controllers (`41`, `42`, `43`, `46`, `52`)** | Koordination spezifischer Domänen (Anrede, Adresse, Signatur) |

---

## 8. Konsequenzen

### Positiv
- Vollständige Entkopplung von Fachmodulen und UI-Komponenten (Zero Direct Imports zwischen Features).
- Wesentlich einfachere Unit-Tests durch Injektion isolierter `createEventBus()`-Instanzen.
- Klare Nachvollziehbarkeit aller Datenflüsse über dokumentierte Topics.
- Konsequent Vanilla JS: keine externen Abhängigkeiten, minimale Bundle-Größe.

### Risiken & Mitigation
- **Zyklische Events:** Strenges Single-Writer-Prinzip; Subscriber dürfen denselben Zustand nicht reflexiv erneut publizieren.
- **Payload-Diskrepanzen:** Alle Payloads werden mit JSDoc und `@ts-check` typisiert und über `test/all.js` getestet.
- **Event-Verlust:** Kritische Leseoperationen (wie Adressauflösung) bleiben synchrone Domain-Funktionen; Events dienen der Benachrichtigung und Entkopplung.

---

## 9. Verifikation & Traceability

- Unit-Tests für EventBus und Topic-Verträge in `test/all.js`.
- Fitness Gate Prüfung via `node tools/build_db.js` (Evolutionary Fitness 100%).
- Traceability-Verknüpfungen zu `00-event-bus.js`, `01-document.js`, `32-toast.js` und `main.js`.

---
id: architektur-review-2026-10-11
title: 'DIN-BriefNEO: Architektur-Review und Refactoring-Blaupause'
type: review
status: archived
created: '2026-10-11'
updated: '2026-10-11'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/archived
  - type/review
doc_links: []
code_links: []
depends_on: []
---

# DIN-BriefNEO: Architektur-Review und Refactoring-Blaupause

Meine zentrale Empfehlung: **Baue DIN-BriefNEO nicht zu einer Sammlung künstlicher In-Browser-Microservices um, sondern zu einer modularen, event-getriebenen Client-Architektur mit explizitem Zustandsmodell.**

Das ist ein wichtiger Unterschied. Dein Projekt ist eine lokale Browser-Anwendung ohne Backend. Es braucht weder Service-Worker-Zwang noch RPC-Abstraktionen oder eine eigene Microservice-Infrastruktur. Native ES-Module, `CustomEvent`, ein zentraler EventBus und klar definierte Zuständigkeiten reichen aus.

Ich habe die bereitgestellte Codebasis anhand ihrer Dateistruktur, des HTML-Dokuments sowie der verfügbaren Ausschnitte aus `main.js`, `01-draft-manager.js`, `32-toast.js`, `41-salutation-engine.js`, `43-geoapify.js` und `45-address-intelligence.js` analysiert. Wo die vollständige Implementierung in den Ausschnitten nicht sichtbar ist, kennzeichne ich Architekturvorschläge als Soll-Zustand und nicht als bereits verifizierte Codeeigenschaften.

## 1. Architekturdiagnose: Wo das eigentliche Problem liegt

<box border radius="lg" padding={4} gap={3}>
  <row align=start gap={3}>
    <box background="surface-secondary" radius="md" size="42px" align=center justify=center>
      <icon name="network" size="xl"/>
    </box>
    <box flex="1" gap={1}>
      **1. `main.js` ist gleichzeitig Bootstrapper und Integrationsschicht.**

      Die Datei initialisiert unter anderem DraftManager, SettingsManager, Toast-System, Adressdienste, Import/Export, Anrede und Unterschrift. Sie reicht dabei beispielsweise `onToast`, `onSaveDraft` und einen gemeinsam genutzten Settings-Kontext durch. Dadurch kennt die Integrationsschicht viele interne Details der Features.
    </box>
  </row>
  <divider color="subtle"/>
  <row align=start gap={3}>
    <box background="surface-secondary" radius="md" size="42px" align=center justify=center>
      <icon name="file-text" size="xl"/>
    </box>
    <box flex="1" gap={1}>
      **2. Das DOM ist gleichzeitig Eingabeoberfläche und faktische Datenquelle.**

      Der Brieftext liegt in `contenteditable`-Elementen wie `#betreff`, `#anrede` und `#text`. Andere Module setzen `textContent`, lösen künstliche `input`-Events aus oder lesen den DOM-Zustand direkt aus. Ein eigenständiges, vollständiges Dokumentmodell ist in den gezeigten Ausschnitten nicht erkennbar.
    </box>
  </row>
  <divider color="subtle"/>
  <row align=start gap={3}>
    <box background="surface-secondary" radius="md" size="42px" align=center justify=center>
      <icon name="layers" size="xl"/>
    </box>
    <box flex="1" gap={1}>
      **3. Fachlogik, Browser-I/O und Darstellung sind nicht durchgehend getrennt.**

      `SalutationEngine.derive()` ist bereits eine gute reine Funktion. Dagegen kombiniert `AddressIntelligence` laut verfügbarem Code Datenzugriff, PLZ-Auflösung, Caret-Steuerung, DOM-Events und Popover-Rendering. Das erschwert isolierte Tests und Wiederverwendung.
    </box>
  </row>
  <divider color="subtle"/>
  <row align=start gap={3}>
    <box background="surface-secondary" radius="md" size="42px" align=center justify=center>
      <icon name="database" size="xl"/>
    </box>
    <box flex="1" gap={1}>
      **4. Dokument, Einstellungen und Persistenz sind noch nicht ausreichend entkoppelt.**

      Der DraftManager und der SettingsManager arbeiten mit DOM-Elementen beziehungsweise gespeicherten Daten. Die Anrede-Funktion greift ebenfalls direkt auf Storage und Toast-Funktionen zu. Dadurch werden fachliche Änderungen unnötig mit Persistenz und UI gekoppelt.
    </box>
  </row>
</box>

### Was ich ausdrücklich nicht ändern würde

- Keine Frameworks, keine Build-Pipeline, kein npm-Runtime-Zwang.
- Keine React-artige Virtual-DOM-Schicht über das bestehende DIN-Blatt.
- Keine JavaScript-Layout-Engine, wo CSS bereits die Darstellung beherrscht.
- Keine künstliche Aufteilung in zahlreiche kleine Dateien nur um der Modularität willen.
- Keine vollständige Neuentwicklung des Brief-Editors.

Dein natives HTML/CSS-Konzept kann erhalten bleiben. Die entscheidende Veränderung ist, **wer den Zustand besitzt und wer ihn verändern darf**.

## 2. Das Zielmodell: Vier klar getrennte Schichten

<box border radius="xl" padding={3} gap={2} align=center>
  <box background="surface" border radius="lg" padding={3} width="100%" align=center gap={1}>
    <title size="md">Presentation / DOM-Adapter</title>
    <text color="secondary" size="sm" textAlign="center">HTML, contenteditable, Sidebar, Popover, Dialoge</text>
    <text size="sm" textAlign="center">Liest Eingaben · rendert Zustandsänderungen</text>
  </box>
  <icon name="arrow-down-up" size="lg" color="secondary"/>
  <box background="rgba(59,130,246,0.09)" border={{s keine DOM-Referenzen.
2. Events transportieren serialisierbare Daten, keine Callbacks, Funktionen oder Service-Instanzen.
3. Schreibzugriffe auf den Dokumentzustand laufen über einen klaren Besitzer.
4. Der EventBus kennt keine Fachlogik; er verteilt nur Nachrichten.

## 3. Konkrete Ziel-Dateistruktur

Ich würde die alten Zahlenpräfixe durch fachliche Verzeichnisse ersetzen. Die Gruppierung folgt dabei der Verantwortung, nicht der bisherigen Entstehungsreihenfolge.

```text
website/
├── index.html
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── layout.css
│   ├── sidebar.css
│   ├── sheet.css
│   ├── signature.css
│   ├── floating.css
│   └── print.css
├── data/
│   ├── de_grosskunden_plz.json.gz
│   └── de_vornamen_gender.json.gz
└── js/
    ├── bootstrap.js
    │
    ├── core/
    │   ├── event-bus.js
    │   ├── event-types.js
    │   ├── app-state.js
    │   └── event-contracts.js
    │
    ├── domain/
    │   ├── document/
    │   │   ├── document-schema.js
    │   │   ├── document-defaults.js
    │   │   ├── document-validation.js
    │   │   └── document-normalization.js
    │   ├── address/
    │   │   ├── postcode-lookup.js
    │   │   ├── address-parser.js
    │   │   └── address-ranking.js
    │   ├── salutation/
    │   │   └── salutation-rules.js
    │   └── date/
    │       └── date-format.js
    │
    ├── services/
    │   ├── document-service.js
    │   ├── settings-service.js
    │   ├── address-service.js
    │   ├── salutation-service.js
    │   ├── signature-service.js
    │   ├── import-export-service.js
    │   ├── notification-service.js
    │   └── metadata-service.js
    │
    ├── adapters/
    │   ├── dom/
    │   │   ├── document-editor.js
    │   │   ├── sidebar-controller.js
    │   │   ├── address-view.js
    │   │   ├── toast-view.js
    │   │   ├── signature-view.js
    │   │   └── dialog-view.js
    │   ├── storage/
    │   │   ├── local-storage.js
    │   │   └── document-repository.js
    │   ├── files/
    │   │   └── json-file-adapter.js
    │   ├── network/
    │   │   └── geoapify-cjs` |
| `05-gzip.js` | `adapters/compression/gzip-loader.js` |
| `32-toast.js` | `services/notification-service.js` + `adapters/dom/toast-view.js` |
| `41-salutation-engine.js` | `domain/salutation/salutation-rules.js` + `services/salutation-service.js` |
| `42-signature.js` | `services/signature-service.js` + `adapters/dom/signature`services/address-service.js` + `adapters/dom/address-view.js` |
| `46-clipboard-address-parser.js` | `features/clipboard-address.js` + Parser-Logik in `domain/address/` |
| `47-date-format.js` | `domain/date/date-format.js` |
| `51-storage.js` | `adapters/storage/local-storage.js` |
| `52-import-export.js` | `services/import-export-service.js` + `adapters/files/json-file-adapter.js` |
| `53-metadata.js` | `services/metadata-service.js` |
| `selection-utils.js` | `shared/selection-utils.js` |
| `boot-theme.js` | `features/theme-boot.js` |

Das ist ein **Zielbild, kein Auftrag, alle Dateien sofort aufzuteilen**. Insbesondere `app-state.js` sollte nicht zu einem universellen Objekt mit beliebigen Zuständen anwachsen. Es definiert lediglich das zentrale Zustandsmodell und seine Übergänge.

Ebenso müssen nicht alle kleinen Funktionen eine eigene Datei erhalten. Die Trennung von reiner Fachlogik und Browser-I/O ist wichtiger als eine möglichst große Zahl von Modulen.

## 4. Das Zustandsmodell: Der wichtigste Umbau

Der zentrale Architekturwechsel sollte vor dem EventBus-Ausbau erfolgen: ein explizites Dokumentmodell.

### 4.1 Dokumentzustand und App-Einstellungen

Ein möglicher Dokumentzustand sieht so aus:

```js
const documentState = {
  schemaVersion: 1,
  documentId: crypto.randomUUID(),

  layout: {
    form: "form-b",
    showGuides: true,
    postmark: "Einschreiben"
  },

  sender: {
    name: "",
    street: "",
    city: "",
    phone: "",
    email: "",
    returnAddress: ""
  },

  recipient: {
    company: "",
    name: "",
    street: "",
    city: ""
  },

  letter: {
    date: "",
    subject: "",
    salutation: "",
    body: "",
    closing: "",
    signatureName: "",
    enclosures: []
  },

  signature: {
    image: null,
    position: { x: 0, y: 0 },
    scale: 1,
    rotation: 0
  }
};
```

Dieses Schema ist ein Vorschlag und muss mit dem bestehenden JSON-Exportformat abgeglichen werden, bevor es eingeführt wird. Insbesondere der HTML-Inhalt von `#text`, die Formatierung, Anla muss aber eindekonsistent sein.

### 4.2 Wer besitzt den Zustand?

Der `DocumentService` ist der einzige autorisierte Schreiber des kanonischen Dokumentzustands. Der `SettingsService` besitzt die globalen Einstellungen.

Das bedeutet nicht, dass der DOM-Editor keine lokalen Eingaben halten darf. Ein `contenteditable`-Element muss während des Tippens seinen Inhalt selbst verwalten können. Es ist aber nicht länger die einzige dauerhafte Quelle, aus der jeder andere Dienst ungefragt seinen Zustand rekonstruiert.

Der Datenfluss lautet:

<box border radius="lg" padding={3} gap={2} align=center>
  <box background="surface-secondary" radius="md" padding={3} width="100%" align=center>
    **Benutzer tippt im Brief**
    <text size="sm" color="secondary">DOM-Eingabeadapter</text>
  </box>
  <icon name="arrow-"dinbrief:";

export function createEventBus(target = new EventTarget()) {
  return Object.freeze({
    publish(topic, payload = {}) {
      if (!topic.startsWith(EVENT_PREFIX)) {
        throw new TypeError(`Invalid event topic: ${topic}`);
      }

      target.dispatchEvent(
        new CustomEvent(topic, {
          detail: payload
        })
      );
    },

    subscribe(topic, handler, options = {}) {
      if (!topic.startsWith(EVENT_PREFIX)) {
        throw new TypeError(`Invalid event topic: ${topic}`);
      }

      const listener = event => handler(event.detail);

      target.addEventListener(topic, listener, {
        signal: options.signal
      });

      return () => {
        target.removeEventListener(topic, listener);
      };
    }
  });
}
```

Verwendung:

```js
const bus = createEventBus();

const unsubscribe = bus.subscribe(
  "dinbrief:notification.requested",
  ({ message, type }) => {
    console.log(type, message);
  }
);

bus.publish("dinbrief:notification.requested", {
  message: "Brief importiert",
  type: "info"
});

unsubscribe();
```

Der EventBus ist absichtlich nicht global über `window` verfügbar. Der Bootstrapper erzeugt genau eine Instanz und reicht sie bei der Initialisierung an die Services weiter. Das ist keine fachliche Kopplung, sondern die Bereitstellung einer Infrastruktur-Abhängigkeit.

**Wichtig:** `EventTarget` garantiert keine Typprüfung der Payloads. Diese muss über zentrale Event-Konstanten, JSDoc-Typen und Validierungsfunktionen erfolgen. Der EventBus oben ist daher die Transportebene, noch nicht die vollständige Schnittstellenspezifikation.

Für Browser, die deiner festgelegten Chromium-Mindestversion entsprechen, ist diese Implementierung ausreichend. `AbortSignal` ermöglicht es, Listener beim Abbau eines Features gesammelt zu entfernen.

### 5.2 Zentrale Event-Namen

`core/event-types.js`:

```js
export const Events = Object.freeze({
  APP_READY: "dinbrief:app.ready",

  DOCUMENT_CHANGED: "dinbrief:document.changed",
  DOCUMENT_FIELD_CHANGED: "dinbrief:document.field.changed",
  DOCUMENT_REPLACED: "dinbrief:document.replaced",
  DOCUMENT_RESET_REQUESTED: "dinbrief:document.reset.requested",
  DOCUMENT_RESET: "dinbrief:document.reset",
  DOCUMENT_SAVED: "dinbrief:document.saved",
  DOCUMENT_SAVE_FAILED: "dinbrief:document.save.failed",
  DOCUMENT_EXPORT_REQUESTED: "dinbrief:document.export.requested",
  DOCUMENT_IMPORT_REQUESTED: "dinbrief:document.import.requested",

  SETTINGS_CHANGED: "dinbrief:settings.changed",

  ADDRESS_SEARCH_REQUESTED: "dinbrief:address.search.requested",
  ADDRESS_SUGGESTIONS_UPDATED: "dinbrief:address.suggestions.updated",
  ADDRESS_SELECTED: "dinbrief:address.selected",
  ADDRESS_LOOKUP_FAILED: "dinbrief:address.lookup.failed",

  SALUTATION_REFRESH_REQUESTED:
    "dinbrief:salutation.refresh.requested",
  SALUTATION_SUGGESTION_READY:
    "dinbrief:salutation.suggestion.ready",

  SIGNATURE_CHANGED: "dinbrief:signature.changed",

  NOTIFICATION_REQUESTED: "dinbrief:notification.requested",

  UI_THEME_CHANGED: "dinbrief:ui.theme.changed",
  UI_PRINT_REQUESTED: "dinbrief:ui.print.requested"
});
```

Die Konstanten verhindern Tippfehler bei den Namen, ersetzen aber keine Payload-Verträge.

## 6. Event-Katalog: Wer sendet was und wer hört darauf?

Ich würde die Events in vier Gruppen aufteilen: Dokument, Einstellungen, Fachfunktionen unent | Payload | Publisher → Subscriber |
|---|---|---|
| `document.field.changed` | `{ field, value, source }` | Editor → DocumentService |
| `document.changed` | `{ revision, changedFields, source }` | DocumentService → Autosave, Metadaten |
| `document.replaced` | `{ document, source }` | ImportService → DocumentService |
| `document.reset.requested` | `{}` | UI → DocumentService |
| `document.reset` | `{ revision }` | DocumentService → Editor, Views |
| `document.saved` | `{ revision, savested` | `{ format }` | UI → ExportService |
| `document.import.requested` | `{}` | UI → ImportService |

`document.changed` ist ein fachliches Ereignis nach erfolgreicher Zustandsänderung. Es sollte nicht bei jeder beliebigen DOM-Manipulation ausgelöst werden.

### 6.2 Einstellungen und Darstellung

| Event | Payload | Publisher → Subscriber |
|---|---|---|
| `settings.changed` | `{ key, value }` | SettingsService → Settings-Views |
| `ui.theme.changed` | `{ theme }` | SettingsService → Theme-Adapter |
| `ui.print.requested` | `{}` | UI → Print-/Metadata-Service |

Für `settings.changed` sind nur freigegebene Einstellungsschlüssel zulässig. Der API-Key sollte nicht in allgemeinen Logs oder Debug-Ausgaben landen.

### 6.3 Adress- und Anredeereignisse

| Event | Payload | Publisher → Subscriber |
|---|---|---|
| `address.search.requuggestions }` | AddrntService |
| `address.lookup.failed` | `{ requestId, code }` | AddressService → NotificationService |
| `salutation.refresh.requesteden aktuelleren Dokumentzustand verän
Technische Fehlerdetails  Zustandsänderung.
- Automatisch generierte Inhalte benötigen eine Herkunftskennung.
- Ein Service darf keine Events publizieren, die er anschließend unbegrenzt selbst erneut verarbeitet.

Ein einfacher Schutz ist, bei jedem Schreibvorgang den bisherigen Wert mit dem neuen Wert zu vergleichen und unveränderte Werte nicht erneut zu publizieren.

---

## 7. Refactoring-Blaupause I: Toast-System entkoppeln

Der bestehende Toast-Code ist bereits relativ gut gekapselt: Er verwaltet sein DOM, den Popover, einen Timer und optional `CloseWatcher`. Das Problem liegt vor allem darin, dass andere Module `showToast()` direkt importieren oder als Callback erhalten.

### Vorher

Aus dem gelieferten Code:

```js
// main.js
initAddressServices({
  onToast: showToast,
  onSaveDraft: () => draftManager.saveDraft()
});
```

Und im Feature:

```js
// 43-geoapify.js
if (onToast) {
  onToast("Adresssuche fehlgeschlagen", "error");
}
```

Das Feature muss die konkrete Toast-Funktion kennen. Die Signatur ist zudem über mehrere Dateien verteilt.

### Nachher: Publisher

```js
// services/a;

export function createNotificationService(bus, toastView) {
  bus.subscribe(
    Events.NOTIFICATION_REQUESTED,
    ({ message, type = "info" }) => {
      if (typ   "Die Adresssuche hat zu lange gedauert.",
        INVALID_ADDRESS:
          "Die Adresse konnte nicht aufgelöst werden."
      };

      const message =
        messages[code] ??
        "Die Adresssuche ist fehlgeschlagen.";

      toastView.show(message, "error");
    }
  );
}
```

### Nachher: ToastView

```js
// adapters/dom/toast-vitändigkeiten; dein bestehender Timer, die CloseWatcher-Logik, die Wiederholung identischer Nachrichten und die Zugänglichkeitsanforderungen müssen beim tatsächlichen Umzug erhalten bleiben.

**Ergebnis:** AddressService kennt weder Toast-HTML noch den NotificationService. Er meldet ein fachliches Ereignis. Der NotificationService entscheidet über die Darstel
  const empfOrtEl =
    document.getElementById("empfaenger-ort");

  if (!empfOrtEl) return;

  empfOrtEl.addEventListener("input", () => {
    const rawText =
      (empfOrtEl.textContent || "").trim();

    const match = rawText.match(/^(\d{5})$/);

    if (match) {
      const result = this.lookupPlz(match[1]);

      if (result) {
        empfOrtEl.textContent =
          `${result.plz} ${result.city}`;

        this.#moveCaretToEnd(empfOrtEl);
      }
    }
  });
}
```

Die Lookup-Logik ist an sich wertvoll. Das Problem ist, dass ihre Verwendung gleichzeitig eine Änderung am DOM voraussetzt.

### 8.2 Nachher: Pure Domain Function

```js
// domain/address/postcode-lookup.js

export function resolvePostcode(
  postcode,
  plzToCity
) {
  const normalized = String(postcode ?? "").trim();

  if (!/^\d{5}$/.test(normalized)) {
    return null;
  }

  const city = plzToCity.get(normalized);

  if (!city) return null;

  return {
    postcode: normalized,
    city
  };
}
```

Diese Funktion benötigt weder `document` noch `localStorage`, `CustomEvent` oder `fetch`.

Sie kann separats
import { Events } from "../core/event-types.st(value)) {
      bus.publish(Events.ADDRESS_SEARCH_REQUESTED, {
        query: value,
        requestId: crypto.randomUUID()
      });
    }
  });

  bus.subscribe(
    Events.ADDRESS_SUGGESTIONS_UPDATED,
    ({ suggestions }) => {
      if (suggestions.length !== 1) return;

      const { postcode, city } = suggestions[0];

      field.textContent = `${postcode} ${city}`;
    }
  );
}
```

Das Beispiel ist eine strukturelle Skizze, noch keine vollständige Ersatzimplementierung: Für den produktiven Code musst du insbesondere die Unterscheidung zwischen Eingabe und automatischer Ergänzung, die Cursorposition, Mehrfachtreffer und das Verwerfen veralteter Antworten beibehalten.

**Ein wichtiger Detailpunkt:** Das Zurückschreiben in ein `contenteditable`-Feld löst nicht automatisch ein `input`-Event aus. Du solltest die bisherige künstliche Event-Kaskade nicht unbesehen übernehmen. Stattdessen aktualisiert der DocumentService den Zustand explizit und die View setzt das DOM entsprechend. So vermeidest du ungewollte doppelte Speicherung und rekursive Listener.

---

## 9. Refactoring-Blaupause III: DocumentService statt DOM als Datenbank

Der dritte Umbau ist der wichtigste für die langfristige Wartbarkeit.

### Vorher

Im vorhandenen DraftManager sind unter anderem DOM-Restore, Storage-Zugriff, Autosave, Save-Status und die Aktualisierung des Dokumenttitels miteinander verbunden. Außerdem wird beim Wiederherstellen der Historie ein Callback ausgeführt.

Sinngemäß:

```js
// 01-draft-manager.js
#applyHistoryState(stateObj) {
  if (!stateObj) return;

  const draft = JSON.parse(stateObj.draftStr);
  this.#restoreState(draft);

  saveJSON(STORAGE_KEYS.draft, draft);

  if (this.onSaveCallback) {
    this.onSaveCallback();
  }
}
```

### Nachher: Zustandsbesitz und Persistenz

```js
// services/document-service.js

export function createDocumentService(
  bus,
  repository,
  initialDocument
) {
  let documentState = structuredClone(initialDocument);
  let revision = 0;

  bus.subscribe(
    "dinbrief:document.field.changed",
    ({ field, value }) => {
      if (!isAllowedField(field)) return;

      const previous = getField(documentState, field);

      if (Object.is(previous, value)) return;

      documentState = setField(
        documentState,
        field,
        value
      );

      revision += 1;

      bus.publish("dinbrief:document.changed", {
        revision,
        changedFields: [field],
        source: "editor"
      });

      void persist(revision);
    }
  );

  async function persist(currentRevision) {
    try {
      const snapshot = structuredClone(documentState);

      await repository.save(snapshot);

      bus.publish("dinbrief:document.saved", {
        revision: currentRevision,
        savedAt: new Date().toISOString()
      });
    } catch {
      bus.publish("dinbrief:document.save.failed", {
        revision: currentRevision,
        code: "STORAGE_UNAVAILABLE"
      });
    }
  }

  return {
    getSnapshot() {
      return structuredClone(documentState);
    }
  };
}
```

Auch dieses Beispiel ist ein Entwurf, nicht direkt einsetzbarer Ersatzcode. `isAllowedField()`, `getField()` und `setField()` müssen sichere, schema-basierte Implementierungen sein; ein beliebiger Pfad darf nicht ungeprüft in das Dokument geschrieben werden.

Außerdem braucht die produktive Version eine saubere Strategie für konkurrierende Schreibvorgänge. Bei asynchroner Persistenz darf ein älterer Speichervorgang einen neueren Zustand nicht versehentlich überschreiben. Die einfachste robuste Variante ist eine serialisierte Save-Queue oder eine Repository-Implementierung, die nur den neuesten gewünschten Snapshot persistiert.

### Warum nicht bei jeder Taste den gesamten Brief speichern?

Ein vollständiger Snapshot bei jeder Eingabe ist zwar einfach, verursacht aber unnötige Kopien und Storage-Zugriffe. Ich würde:

1. Feldänderungen synchron in den In-Memory-State übernehmen.
2. `document.changed` publizieren.
3. Autosave über eine entprellte Queue ausführen.
4. Beim Export einen konsistenten Snapshot erzeugen.
5. Bei Import und Reset einen atomaren Zustandswechsel durchführen.

Dabei darf die UI nicht so tun, als sei der Brief bereits gespeichert, solange die Persistenz nicht erfolgreich abgeschlossen wurde.

## 10. Schritt-für-Schritt-Migrationsplan

Meine Empfehlung ist eine Migration in sieben Phasen. Jede Phase muss für sich funktionsfähig bleiben. Kein Big-Bang-Refactoring und kein gleichzeitiges Umbenennen aller Dateien.

<box border radius="xl" padding={3} gap={3}>
  <row align=start gap={3}>
    <box background="surface-secondary" radius="md" size="40px" align=center justify=center>
      <title size="lg">1</title>
    </box>
    <box flex="1" gap={1}>
      **Bestandsaufnahme und Verhaltensbaseline**

      <badge color="info">Noch keine Architekturänderung</badge>

      - Bestehenden JSON-Export und -Import sichern.
      - Autosave, Reset, Undo/Redo, Form A/B und Hilfslinien testen.
      - Adresssuche offline und online testen.
      - Anrede, Signaturbild, Schrift-Upload und Druck prüfen.
      - Bestehende Storage-Keys und Migrationsregeln dokumentieren.

      **Abnahmekriterium:** Alle Kernabläufe sind reproduzierbar dokumentiert. Mindestens ein alter Export lässt sich unverändert importieren.
    </box>
  </row>m:** Fachfunktionen lassen sich ohne DOM und ohne Browser-Storage testen.
    </box>
  </row>
  <divider color="subtle"/>
  <row align=start gap={3}>
    <box background="surface-secondary" radius="md" size="40px" align=center justify=center>
      <title size="lg">4</title>
    </box>
    <box flex="1" gap={1}>
      **AddressIntelligence aufteilen**

      - Zuerst den PLZ-Lookup auslagern.
      - Danach Popover-Rendering und Caret-Steuerung abtrennen.
      - Danach lokale Adresssuche und Geoapify integrieren.
      - Den bestehenden `targetLock` und die Suchreihenfolge beibehalten.

      **Abnahmekriterium:** Adresssuche, Autocomplete, Tastaturnavigation und Cursorposition funktionieren wie zuvor.
    </box>
  </row>
  <divider color="subtle"/>
  <row align=start gap={3}>
    <box background="surface-secondary" radius="md" size="40px" align=center justify=center>
      <title size="lg">5</title>
    </box>
    <box flex="1" gap={1}>
      **Dokumentzustand einführen**

      - Zunächst ein kanonisches Dokumentmodell erstellen.
      - DOM-Eingaben als Änderungsereignisse erfassen.
      - DocumentService als einzigen autorisierten Schreiber einführen.
      - Bestehende Speicherung zunächst über den bisherigen Repository-/Storage-Code weiterführen.
      - Import, Reset und History kontrolliert auf den neuen Zustand umstellen.

      **Abnahmekriterium:** Der Dokument-Snapshot entspricht den angezeigten Briefdaten und der bestehende Export bleibt kompatibel.
    </box>
  </row>
  <divider color="subtle"/>
  <row align=start gap={3}>
    <box background="surface-secondary" radius="md" size="40px" align=center justify=center>
      <title size="lg">6</title>
    </box>
    <box flex="1" gap={1}>
      **Settings, Anrede und Signatur entkoppeln**

      - Einstellungen aus dem Dokumentzustand herauslösen.
      - `SalutationService` über Änderungsereignisse triggern.
      - Automatisch generierte Texte gegen manuelle Eingaben absichern.
      - Signaturdaten und Transformationszustand klar definieren.
      - Callbacks und direkte Feature-Imports schrittweise entfernen.

      **Abnahmekriterium:** Keine Fachfunktion benötigt mehr einen direkten Callback zu einem anderen Service.
    </box>
  </row>
  <divider color=
      **Dateien umbenennen und Architektur absichern**

      - Präfixe erst nach erfolgreicher fachlicher Migration entfernen.
      - Importpfade aktualisieren.
      - Veraltete Callback-APIs löschen.
      - Event-Verträge und Modulgrenzen prüfen.
      - Einen vollständigen Smoke-Test durchführen.

      **Abnahmekriterium:** Kein toter Altcode, keine ungewollten Zyklen und keine Funktionsregression.
    </box>
  </row>
</box>

### Was du in jeder Phase testen solltest

| Bereich | Konkreter Regressionstest |
|---|---|
| Dokument | Texteingabe, Mehrzeiligkeit, Formatierungen, Anlagen |
| Persistenz | Reload, Autosave, Storage-Fehler, konkurrierende Speichervorgänge |
| Import/Export | Alte JSON-Datei importieren, erneut exportieren, Inhalte vergleichen |
| Layout | Form A/B, Falzmarken, Druck-PDF, A4-Geometrie |
| Adresse | PLZ direkt, Ortspräfix, lokale Treffer, Geoapify, Abbruch veralteter Suche |
| Anrede | Herr/Frau-Präfix, neutrale Anrede, manuelle Änderung |
| Signatur | Bild laden, verschieben, skalieren, drehen, löschen |
| Sicherheit | HTML-Injektion, ungültiges JSON, API-Key-Leaks, CSP |
| Bedienbarkeit | Tastatur, Fokus, Screenreader, Popover-Schließen |

## 11. `bootstrap.js`: Die neue Integrationsschicht

Die Initialisierung sollte künftig ungefähr so aussehen:

```js
// bootstrap.js

import { createEventBus } from "./core/event-bus.js";
import { createToastView } from
  "./adapters/dom/toast-view.js";
import { createNotificationService } from
  "./services/notification-service.js";
import { createDocumentService } from
  "./services/document-service.js";
import { createSettingsService } from
  "./services/settings-service.js";
import { createAddressService } from
  "./services/address-service.js";

async function bootstrap() {
  const bus = createEventBus();

  const toastView = createToastView();

  createNotificationService(bus, toastView);

  const settingsService =
    createSettingsService(bus);

  const documentService =
    createDocumentService(bus, /* Repository, Initialzustand */);

  const addressService =
    createAddressService(bus, /* Adressdaten */);

  // Views werden hier einmalig an den EventBus angebunden.
  // Erst danach den App-Start als abgeschlossen melden.
  bus.publish("dinbrief:app.ready", {
    schemaVersion: 1
  });
}

document.addEventListener(
  "DOMContentLoaded",
  () => {
    void bootstrap().catch(error => {
      console.error("[Bootstrap] Initialization failed", error);
    });
  },
  { once: true }
);
```

Die ausgelassenen Konstruktorargumente sind bewusst Platzhalter: Die produktive Fassung muss deine vorhandene Storage-Migration, Dateninitialisierung, UIProtections, MetadataService, Import/Export und Signatur initialisieren. Das Beispiel ist keine direkt ausführbare Komplettdatei.

Der Bootstrapper darf die Service-Instanzen besitzen. Das verletzt deine Entkopplungsregel nicht, denn die Regel betrifft die **gegenseitige fachliche Abhängigkeit** der Services, nicht deren zentrale Komposition.

Außerdem sollte `app.ready` erst dann publiziert werden, wenn die für den Start erforderlichen Services tatsächlich initialisiert sind. Asynchrone Daten wie PLZ-Maps können ein separates `address.data.ready`-Ereignis erhalten.

## 12. Drei Architekturentscheidungen, die du vor dem Umbau festlegen solltest

### A. Ist der EventBus wirklich die einzige Kommunikationsschnittstelle?

Du möchtest, dass Services weder gegenseitig importiert werden noch Callbacks erhalten. Das ist machbar. Es gibt aber einen Zielkonflikt: Ein System, in dem wirklich jede Kommunikation ausschließlich über Events läuft, ist schwerer zu verfolgen und zu debuggen als ein System, das Events nur für fachliche Kommunikation nutzt.

Meine Empfehlung für DIN-BriefNEO:

- **Events:** fachliche Änderungsaufträge, Zustandsänderungen und Benachrichtigungen.
- **Direkte Rückgaben:** synchrone Abfragen und reine Funktionen.
- **Repository-Schnittstellen:** Persistenz und Dateizugriff.
- **Keine direkten Service-Imports:** zwischen fachlichen Services.
- **Keine Callbacks zwischen Features:** alle fachlichen Nachrichten laufen über den Bus.

Der Bootstrapper und die Infrastrukturadapter sind die einzigen Stellen, an denen Implementierungen konkret zusammengesetzt werden.

Ein Beispiel: `SalutationService` kann einen Anrede-Vorschlag als Event veröffentlichen. Die reine Funktion `derive()` muss deshalb nicht selbst über den EventBus kommunizieren.

### B. Was passiert mit Undo/Redo?

Dein bestehender DraftManager hat bereits eine History-Logik, die neben dem Dokumentzustand auch die Cursorposition berücksichtigt. Diese Funktion darf nicht bei der Einführung des neuen Zustandsmodells verloren gehen.

Ich würde History als eigene Verantwortlichkeit modellieren:

```text
DocumentService
    ├── aktueller Dokumentzustand
    ├── Revisionen
    └── autorisierte Zustandsänderungen

HistoryService
    ├── Undo
    ├── Redo
    └── gespeicherte Zustands-Snapshots
```

Die History sollte keine beliebigen DOM-Elemente als primären Zustand speichern. Für die Cursorposition kann sie ergänzende UI-Metadaten aufbewahren. Das Dokument selbst bleibt davon unabhängig.

Ein Undo löst beispielsweise `document.history.undo.requested` aus. Der DocumentService übernimmt den ausgewählten vorherigen Zustand und publiziert anschließend `document.changed`.

### C. Wie gehst du mit LocalStorage und Datenschutz um?

Die Trennung zwischen Dokumentzustand und App-Einstellungen ist sinnvoll, aber eine getrennte Datei oder ein anderer Storage-Key ist noch keine Sicherheitsgrenze.

Insbesondere:

- Ein Geoapify-Key in LocalStorage ist für JavaScript derselben Origin grundsätzlich zugänglich.
- Ein gespeicherter Brief enthält möglicherweise sensible personenbezogene Daten.
- Ein EventBus innerhalb der Anwendung bietet keine Isolierung gegenüber anderem JavaScript derselben Origin.
- Importierte JSON-Daten müssen validiert und normalisiert werden, bevor sie den aktiven Dokumentzustand ersetzen.
- CSP, sichere DOM-Ausgabe und die Vermeidung unnötiger Netzwerkzugriffe bleiben eigenständige Schutzmaßnahmen.

Die Event-Payloads sollten deshalb nur die Daten enthalten, die der jeweilige Empfänger tatsächlich benötigt.

## 13. Architekturregeln als dauerhaftes Projektgesetz

Ich würde diese Regeln in einem kurzen Architekturentscheid, etwa `docs/architecture/event-driven-client.md`, festhalten.

<box border radius="lg" padding={3} gap={3}>
  <row align=start gap={2}>
    <icon name="check-circle" color="success" size="lg"/>
    <box flex="1" gap={1}>
      **Regel 1 – Zero Runtime Dependencies**

      Nur native Browser-APIs und ES-Module. Keine Frameworks, keine Build-Pflicht und keine zusätzliche Runtime.
    </box>
  </row>
  <row align=start gap={2}>
    <icon name="check-circle" color="success" size="lg"/>
    <box flex="1" gap={1}>
      **Regel 2 – Fachliche Services sind voneinander unabhängig**

      Kein direkter Service-Import und keine weitergereichten Callbacks zwischen Services. Der Bootstrapper darf sie kompositorisch kennen.
    </box>
  </row>
  <row align=start gap={2}>
    <icon name="check-circle" color="success" size="lg"/>
    <box flex="1" gap={1}>
      **Regel 3 – Single Writer pro Zustandsbereich**

      DocumentService besitzt den Dokumentzustand; SettingsService besitzt die App-Einstellungen. Andere Module fordern Änderungen an, statt diese Zustände direkt zu mutieren.
    </box>
  </row>
  <row align=start gap={2}>
    <icon name="check-circle" color="success" size="lg"/>
    <box flex="1" gap={1}>
      **Regel 4 – Pure Functions bleiben frei von I/O**

      Domain-Code kennt weder `document` noch `localStorage`, `fetch` oder den EventBus.
    </box>
  </row>
  <row align=start gap={2}>
    <icon name="check-circle" color="success" size="lg"/>
    <box flex="1" gap={1}>
      **Regel 5 – Events haben verbindliche Verträge**

      Jeder Event-Name, seine Payload, sein Publisher, seine Subscriber und sein Fehlerverhalten sind dokumentiert.
    </box>
  </row>
  <row align=start gap={2}>
    <icon name="check-circle" color="success" size="lg"/>
    <box flex="1" gap={1}>
      **Regel 6 – Keine stillen Datenverluste**

      Bestehende Briefdaten, Importformate, Formatierungen, History und DIN-Druckverhalten müssen durch Regressionstests abgesichert sein.
    </box>
  </row>
</box>

## 14. Mein abschließendes Urteil

Dein Projekt braucht keine größere technische Infrastruktur. Es braucht eine präzisere Trennung zwischen Zustand, Fachlogik, Browser-I/O und Darstellung.

Die sinnvollste Reihenfolge ist:

1. EventBus einführen und die Notification-Schnittstelle entkoppeln.
2. Reine Adress- und Anredefunktionen extrahieren.
3. AddressIntelligence in Domain-Logik, Service und DOM-Adapter zerlegen.
4. Dokumentzustand und Einstellungen explizit modellieren.
5. Den DocumentService als einzigen autorisierten Schreiber etablieren.
6. Import/Export, History, Signatur und Persistenz kontrolliert integrieren.
7. Alte Callback-APIs und Dateipräfixe erst ganz am Schluss entfernen.

**Meine wichtigste Warnung:** Beginne nicht mit dem Verschieben und Umbenennen von Dateien. Wenn du zuerst die Dateistruktur änderst, verschiebst du die Kopplung lediglich an andere Orte. Definiere zuerst Zustandsbesitz und Event-Verträge. Danach wird die Dateistruktur fast von selbst klar.

Und noch ein wichtiger Punkt: Ein reines Event-System ohne direkte Service-Abhängigkeiten ist ein legitimes Ziel für DIN-BriefNEO. Es ist aber nicht automatisch die einfachste oder beste Lösung für jeden internen Aufruf. Halte den EventBus deshalb klein und die Verträge streng. Das Ergebnis sollte eine überschaubare, nachvollziehbare Browser-Architektur sein – kein selbstgebautes Framework.
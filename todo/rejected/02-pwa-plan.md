---
status: rejected
type: concept
tags: [din5008, briefneo, plan, pwa]
summary: "Plan zur PWA-Fähigkeit des DIN-BriefNEO-Generators unter der Baseline Chrome 150+."
---

# PWA-Plan für DIN-BriefNEO – Baseline Chrome 150+

Fokus strikt auf **Web-App (PWA)**, **keine Browser-Erweiterung**, und **Baseline Chrome 150+**. Keine Fallbacks für Safari, Firefox oder ältere Chrome-Versionen nötig — alle modernen APIs stehen uneingeschränkt zur Verfügung.

## Was unter Chrome 150+ zur Verfügung steht

| Fähigkeit | Status unter Chrome 150+ | Nutzen für DIN-BriefNEO |
|---|---|---|
| **Web App Manifest** (alle Felder) | ✅ Vollständig | Installierbarkeit, eigenes Fenster, Icons |
| **Service Worker** | ✅ Vollständig | Offline-Betrieb, Caching |
| **Static Routing API** (`event.addRoutes()`) | ✅ Seit Chrome 123 | Deklaratives Routing ohne JS-Thread-Start |
| **Installierbarkeit ohne fetch-Handler** | ✅ Seit Chrome 112 | Manifest + Icons genügen |
| **`launch_handler: focus-existing`** | ✅ Seit Chrome 110 | Single-Instance-Schutz |
| **`file_handlers`** | ✅ Seit Chrome 102 (Desktop) | Doppelklick auf `.dinbrief.json` |
| **`navigator.storage.persist()`** | ✅ Seit Chrome 55 | Schutz vor Eviction |
| **`DecompressionStream`** | ✅ Bereits im Einsatz | `.json.gz`-Datenbanken |
| **View Transitions** | ✅ Seit Chrome 111 | Bereits im Code genutzt |
| **Popover API** | ✅ Seit Chrome 114 | Bereits im Code genutzt |
| **`text-fit`, `attr() type()`, `@function`** | ✅ Chrome 150+ | Bereits im Blatt-CSS genutzt |

**Keine Fallbacks nötig.** Der Plan konzentriert sich auf den Chrome-150+-Pfad.

---

## Der fertige Plan

### Phase 1: Manifest & Icons

**1.1 `website/manifest.webmanifest` anlegen**
```json
{
  "name": "DIN-BriefNEO",
  "short_name": "BriefNEO",
  "description": "Normgerechter Brief-Editor nach DIN 5008",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "launch_handler": { "client_mode": "focus-existing" },
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" },
    { "src": "icons/icon.svg", "sizes": "any", "type": "image/svg+xml" }
  ],
  "file_handlers": [
    {
      "action": "/",
      "accept": { "application/json": [".dinbrief.json"] }
    }
  ]
}
```

**1.2 Icons erzeugen (Zero-Dependency)**
- `website/icons/icon.svg` handschreiben (DIN-Briefbogen-Motiv, bzw. aus `/home/moritz/repos/DIN-BriefNEO/envelope.svg` ableiten)
- Lokal mit `rsvg-convert` oder ImageMagick generieren: `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`

**1.3 `index.html` ergänzen**
```html
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#2563eb">
```

---

### Phase 2: Service Worker (`website/sw.js`)

**2.1 Precache-Liste (`APP_SHELL`)**
- `index.html`
- 4 CSS-Dateien (`base.css`, `sidebar.css`, `sheet.css`, `print.css`)
- 8 JS-Dateien (`main.js`, `core.js`, `document.js`, `persistence.js`, `address.js`, `settings.js`, `salutation.js`, `boot-theme.js`)
- **Beide** `.json.gz`-Dateien: `data/de_plz_ort.json.gz` **und** `data/de_grosskunden_plz.json.gz`
- `manifest.webmanifest`

**2.2 Static Routing API (Chrome 123+, hier 150+)**
```js
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(APP_SHELL)));
  event.addRoutes([
    { condition: { urlPattern: new URLPattern({ hostname: 'api.geoapify.com' }) }, source: 'network' },
    { condition: { urlPattern: new URLPattern({ pathname: '/*.{css,js}' }) }, source: { type: 'cache', cacheName: CACHE_NAME } },
    { condition: { urlPattern: new URLPattern({ pathname: '/data/*' }) }, source: 'network' }
  ]);
  self.skipWaiting();
});
```
- Geoapify: direkt ans Netz (kein Caching von API-Keys)
- App-Shell: direkt aus dem Cache
- Daten: Network-First mit Cache-Fallback (im `fetch`-Handler für den Fall, dass die Route nicht greift)

**2.3 Cache-Versionierung automatisieren**
- `tools/build_db.js` schreibt den aktuellen Git-Commit-Hash in `CACHE_NAME` von `sw.js`
- Kein manuelles Hochzählen, kein Vergessen

**2.4 Registrierung in `main.js`**
```js
if ('serviceWorker' in navigator && !location.hostname.match(/^(localhost|127\.0\.0\.1)$/)) {
  navigator.serviceWorker.register('/sw.js');
}
```
- Auf `localhost` **nicht** registrieren → Live-Reload bleibt reibungslos
- Optional `?pwa=1` als Opt-in für lokale Tests

---

### Phase 3: Installierbarkeit & Persistenz

**3.1 Persistenz in `persistence.js`**
```js
if (navigator.storage?.persist) {
  navigator.storage.persist().catch(() => {});
}
```
- Schützt Entwurf und PLZ-Datenbanken vor Eviction
- Unter Chrome 150+ auf Android und Desktop verfügbar

**3.2 Kein Install-Prompt-Banner**
- Chrome zeigt das Install-Icon in der Adressleiste von selbst
- Kein `beforeinstallprompt`-Popup – würde den Nutzer beim Schreiben stören

---

### Phase 4: Datei-Handler (optional, Desktop-Chromium)

**4.1 `launchQueue`-Consumer in `persistence.js`**
```js
if ('launchQueue' in window) {
  window.launchQueue.setConsumer(async (launchParams) => {
    if (!launchParams.files?.length) return;
    const file = await launchParams.files[0].getFile();
    const text = await file.text();
    const result = parseDinLetterPayload(text);
    if (!result.ok) {
      eventBus.publish(Events.NOTIFICATION_REQUESTED, {
        message: `Diese Datei ist kein DIN-BriefNEO-Brief: ${result.reason}`,
        type: 'error'
      });
      return;
    }
    // Bestehende Import-Logik nutzen (ohne Upload-Dialog)
  });
}
```

**4.2 Datei-Endung: `.dinbrief.json`**
- Doppelte Endung: `.dinbrief` markiert Zugehörigkeit, `.json` signalisiert Texteditor-Lesbarkeit
- Export-Dialog (`showSaveFilePicker`) bietet `.dinbrief.json` als primäre Endung an

**4.3 Lesbarkeit dokumentieren**
- In `llms.txt` und README: *„DIN-BriefNEO-Dateien sind reines JSON und können jederzeit mit einem Texteditor geöffnet werden.“*
- Im Export-Dialog: Beschreibung „DIN-BriefNEO-Brief (JSON, lesbarer Text)“

---

### Phase 5: Governance

**5.1 Law Catalog A37 umformulieren**
- Von „HARD BAN: Service Worker“ auf: *„CONDITIONAL: Nur handgeschriebener Zero-Dependency-Service-Worker mit automatischer Build-Hash-Versionierung. Kein Workbox, kein CDN.“*

**5.2 `project.json` und `adr-check.js` anpassen**
- `manifest.webmanifest`, `sw.js`, `icons/` als legitime Assets eintragen (nicht als verwaist melden)

**5.3 Testmatrix (nur Chrome 150+ Desktop & Android)**

| Test | Erwartung |
|---|---|
| Desktop: Installation | Icon erscheint, Start im eigenen Fenster |
| Desktop: Offline | App startet, PLZ-Autovervollständigung funktioniert |
| Desktop: Doppelklick auf `.dinbrief.json` | App öffnet, Brief wird geladen |
| Android: Installation | App-Icon auf Startbildschirm |
| Android: Offline | App startet, PLZ-Datenbank verfügbar |
| `navigator.storage.persisted()` | `true` |

---

## Dateiänderungen im Überblick

| Datei | Aktion |
|---|---|
| `website/manifest.webmanifest` | **Neu** |
| `website/sw.js` | **Neu** |
| `website/icons/icon.svg` | **Neu** |
| `website/icons/icon-192.png` | **Neu** (generiert) |
| `website/icons/icon-512.png` | **Neu** (generiert) |
| `website/icons/icon-512-maskable.png` | **Neu** (generiert) |
| `website/index.html` | Manifest-Link + `theme-color` |
| `website/js/main.js` | SW-Registrierung (außer localhost) |
| `website/js/persistence.js` | `launchQueue`-Consumer + `persist()` |
| `tools/build_db.js` | Cache-Hash in `sw.js` schreiben |
| `Immutable-Law-Catalog.md` | A37 umformulieren |
| `project.json` | Neue Assets eintragen |

**Aufwand:** 2–3 Tage für Phase 1–3 (Kern-PWA), +1 Tag für Phase 4–5.

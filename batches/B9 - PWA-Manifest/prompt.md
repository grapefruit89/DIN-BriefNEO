# Research-Auftrag B9 — Web-App-Manifest (PWA ohne Service Worker)

## Rolle
Senior Web-Platform-Engineer. Du **änderst nichts** in diesem Chat. Du
beantwortest eine begrenzte Frage: Was davon gilt für dieses Projekt, was
nicht — und was wäre die kleinste tragfähige Umsetzung.

## Worum es geht

Das Projekt ist eine rein lokale Web-App (Chrome 150+ Baseline, kein Framework,
kein Build). Ein PWA-Plan wurde am 2026-11-10 **verworfen**, weil er einen
Service Worker brauchte (Law A37: HARD BAN, Cache-Invalidierung = dauerhafte
Wartungslast).

**Die Frage lautet: geht „installierbar" auch ohne Service Worker?**

Zwei Quellen liegen bei (Rohtext, Bilder entfernt):

1. `webdev-add-manifest.txt` — https://web.dev/articles/add-manifest
   Alle Manifest-Felder, Icons, `display`, `shortcuts`, `screenshots`,
   Splashscreen, `<link rel="manifest">`.
2. `webdev-install-criteria.txt` — https://web.dev/articles/install-criteria
   **Die Kriterien, die Chrome für `beforeinstallprompt` verlangt.** Stand des
   Abrufs (2026-11-12) in wörtlicher Auszählung: gefordert sind HTTPS,
   Engagement-Heuristik, `name`/`short_name`, `start_url`, `display`,
   `prefer_related_applications != true` — **kein Service Worker**.

Zusätzlich liegt bei:

- `index.html` — der echte `<head>` (dort fehlt das Manifest; CSP ist gesetzt).
- `02-pwa-plan.md` — der verworfene Plan (enthält einen Manifest-Entwurf und
  die Liste der damals geplanten Felder; **nicht** als Vorlage übernehmen,
  prüfe ihn kritisch).
- `Immutable-Law-Catalog.md` — A37 und die Nachbargesetze (keine externen
  Abhängigkeiten, kein Build, Zero-Maintenance).

## Harter Kontext, den du nicht wegdiskutieren darfst

- **Kein Service Worker** (A37). Keine Ausnahme, kein „nur ein kleiner".
- **Kein Build-Schritt**, keine externen Abhängigkeiten, keine CDN-Requests.
- **Auslieferung über GitHub Pages** unter einem Unterpfad:
  `https://grapefruit89.github.io/DIN-BriefNEO/` → `start_url` und `scope`
  müssen diesen Pfad tragen, nicht `/`.
- Icons: im Repo existiert **nur** `website/og-image.png` (1200×630, Social
  Card). Es gibt **keine** 192/512-Icons, kein Maskable-Icon, kein SVG-Icon.
- Die CSP im `<head>` erlaubt `style-src 'self'`, `script-src 'self'`,
  `img-src 'self' data: blob:`. Prüfe, ob ein Manifest daran etwas ändert.

## Deine Aufgaben

1. **Installierbarkeit ohne SW belegen.** Zitiere aus
   `webdev-install-criteria.txt` die Bedingungsliste und sage, ob ein
   Manifest allein (plus Icons) den Install-Prompt auslöst. Unterscheide
   ausdrücklich: (a) `beforeinstallprompt` + Install-Button, (b) manuelle
   Installation über das Browsermenü, (c) „installiert" wirkende Anzeige
   (eigenes Fenster) ohne Prompt.
2. **Manifest-Entwurf für dieses Projekt.** Vollständiges JSON mit genau den
   Feldern, die hier Sinn haben — und mit Begründung je Feld. Beachte:
   `start_url`/`scope` unter `/DIN-BriefNEO/`, `id` stabil wählen,
   `display: standalone`, `theme_color` (die App hat `light-dark()`;
   das Manifest kennt nur einen Wert — wie löst man das sauber?),
   `background_color`, `lang: "de"`, `dir`, `description` (max. 300 Zeichen
   laut Quelle), `shortcuts` (nur wenn sie hier echt Nutzen haben).
3. **Icons.** Welche Dateien müssen entstehen (Größen, Formate, `purpose`),
   wo liegen sie, und was ist der kleinste Weg **ohne** Bildwerkzeug-Kette?
   (Vorhanden: `og-image.png`.) Sag auch, was passiert, wenn Icons fehlen.
4. **Was an der App zu ändern ist.** Konkrete Stellen: `<link rel="manifest">`
   im `<head>`, Dateiablage, `llms.txt`/Doku, Tests/Gates. Nenne **keine**
   Änderung, die nicht durch eine Zeile in den Quellen gedeckt ist.
5. **Was NICHT geht oder sich nicht lohnt.** Insbesondere: `file_handlers`
   (Doppelklick auf `.json`), `launch_handler`, `share_target`,
   `protocol_handlers`, `screenshots` (Richer Install UI), `shortcuts` —
   jeweils: geht das ohne SW, braucht es das hier, was kostet die Pflege?
6. **Risiken.** Was kann kaputtgehen (Pfad beim GitHub-Pages-Deploy,
   Manifest-Cache, doppelte Installationen durch wechselnde `id`,
   `start_url` mit Query, Dark-Mode-Farben, `.webmanifest`-MIME auf Pages)?

## Form deiner Antwort

- Kurz. Keine Zusammenfassung der Quellen — ich habe sie gelesen.
- Jede Behauptung mit Beleg: Datei + wörtliches Zitat aus den Quellen, oder
  „nicht in den Quellen" (dann als **ungeprüft** markieren).
- Am Ende drei Blöcke:
  1. **Manifest** — fertiges JSON, kommentierbar.
  2. **Dateien** — was angelegt/geändert wird (Pfad + 1 Zeile Zweck).
  3. **Entscheidungen** — je eine Zeile A/B mit Empfehlung, dort wo es
     Alternativen gibt.

## Was du NICHT tun sollst

- Keine Service-Worker-Vorschläge, auch nicht als „optional".
- Keine Build-Tools, kein npm, kein Icon-Generator-Skript als Pflicht.
- Keine Felder „weil sie in der Doku stehen" — nur was hier Nutzen hat.
- Keine Bewertung des übrigen Codes (liegt nicht bei).

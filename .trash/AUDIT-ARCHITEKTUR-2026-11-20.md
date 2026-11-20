[0m
> build · deepseek-v4.1-flash
I'll start by reading the project's governance files and map, then dig into the actual code.

```
AUFGABE: Schonungsloses Architektur-Audit von DIN-BriefNEO (DOM-als-State, Spezifitätskriege, Boot-Pfad, Event-Anti-Patterns) | TYP: Research
ENTSCHEIDENDE FRAGE: Welche architektonischen Fauxpasses sind im Code belegbar und wie gravierend? | STOPP: 3 Hauptdenkfehler + Top-Tabelle belegt, oder Beleg-Lücke benannt | FERTIG: Bericht mit Datei:Zeile-Belegen
```
[0m→ [0mRead map.md 
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && ls -la && echo "---GIT---" && git log --oneline -15 && echo "---SIZE---" && du -sh . 2>/dev/null
insgesamt 76
drwxr-xr-x 1 moritz moritz  484 19. Nov 18:24 .
drwxr-xr-x 1 moritz moritz  546 18. Nov 08:53 ..
-rw-r--r-- 1 moritz moritz 2562 19. Nov 18:31 AGENTS.md
drwxr-xr-x 1 moritz moritz  302 15. Nov 14:12 batch
-rw-r--r-- 1 moritz moritz 1631  9. Nov 12:36 biome.json
-rw-r--r-- 1 moritz moritz 1121 19. Nov 16:53 CLAUDE.md
-rw------- 1 moritz moritz   79 10. Sep 01:26 .directory
drwxr-xr-x 1 moritz moritz  110 19. Nov 18:28 docs
-rw-r--r-- 1 moritz moritz  405 10. Sep 01:25 envelope.svg
drwxr-xr-x 1 moritz moritz  198 19. Nov 12:25 fonts
-rw-r--r-- 1 moritz moritz 1081 19. Nov 16:53 GEMINI.md
drwxr-xr-x 1 moritz moritz  204 20. Nov 10:22 .git
-rw-r--r-- 1 moritz moritz 1173  3. Sep 14:33 .gitattributes
drwxr-xr-x 1 moritz moritz   38  9. Nov 17:30 githooks
drwxr-xr-x 1 moritz moritz  182  9. Nov 17:57 .github
lrwxrwxrwx 1 moritz moritz    7  9. Nov 17:47 github -> .github
-rw-r--r-- 1 moritz moritz 1243 19. Nov 12:25 .gitignore
-rw-r--r-- 1 moritz moritz  380 14. Nov 11:54 jsconfig.json
-rw-r--r-- 1 moritz moritz 1074  9. Nov 13:59 LICENSE
-rw-r--r-- 1 moritz moritz 3520 19. Nov 18:31 map.md
drwxr-xr-x 1 moritz moritz   92 17. Nov 16:03 .opencode
-rw-r--r-- 1 moritz moritz  194  9. Nov 16:05 opencode.json
-rw-r--r-- 1 moritz moritz 1168 15. Nov 15:38 package.json
-rw-r--r-- 1 moritz moritz 5283  9. Nov 18:52 README.md
-rw-r--r-- 1 moritz moritz 9105 19. Nov 18:24 repository.yaml
drwxr-xr-x 1 moritz moritz   24  9. Nov 00:04 .secrets
drwxr-xr-x 1 moritz moritz  198  9. Nov 17:57 skills
drwxr-xr-x 1 moritz moritz   90 16. Nov 13:12 test
drwxr-xr-x 1 moritz moritz 1392 19. Nov 12:25 tools
drwxr-xr-x 1 moritz moritz  248 17. Nov 16:29 .trash
drwxr-xr-x 1 moritz moritz  100 12. Nov 18:33 website
---GIT---
3d07a1d docs(geocoding): Benchmark-Ergebnisbericht archivieren und Arbeitsanweisung schärfen
e58575e feat(addons): B52 einheitlicher Plugin-Punkt und Addon-Manager
8f0daa0 feat(css): B51 rasterisierte Design-Tokens in base.css und sidebar.css durchziehen
8889421 docs(backlog): B59 dauerhaft als Medien-Firewall einfrieren (Entscheidung nach ADR-KISS-MINIMAL-JS)
e301161 fix(architecture): DOM-Hacks 1-3 beseitigt und Backlog bereinigt
f2aa821 feat(architecture): unify sidebar switches to data-* root attributes (Weg 2, ADR-KISS-MINIMAL-JS)
01918e3 docs: update STRUCTURE.md with ADR-KISS-MINIMAL-JS
eaaacc3 docs(adr): enrich ADR-KISS-MINIMAL-JS with semantic anchors and diminishing returns law
4381368 docs(adr): establish ADR-KISS-MINIMAL-JS for pragmatic 80/20 FOUC tolerance
1e0afac feat(docs): reorganize docs structure 1:1 mirroring website layout
5239b59 chore: move Papierkorb to hidden .trash and update CI checks
1a327a8 feat: implement Module 05 repo cockpit, center typography in fonts/ and enforce CI budget gates
d92d798 docs(meta): ID-Register korrigiert -- W4 ist eine Regel, I/EM und M1-M7 aufgeloest
8102cf9 docs(meta): Erledigtes eingedampft, Offenes vereint, ID-Register eingefuehrt
14f3d8a docs(adr): start.ps1-Verweise durch echte Gate-Mechanismen ersetzt
---SIZE---
17M	.
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && cat website/index.html | head -150
<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path>
            </svg>
          </a>
          <div class="seitenleiste-header-actions">
            <button type="button" id="btn-theme-toggle" class="icon-btn theme-toggle-btn" aria-label="Darstellung: Automatisch (System)">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon theme-icon-auto lucide lucide-sun-moon" aria-hidden="true"><path d="M12 2v2"></path><path d="M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715"></path><path d="M16 12a4 4 0 0 0-4-4"></path><path d="m19 5-1.256 1.256"></path><path d="M20 12h2"></path></svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon theme-icon-light lucide lucide-sun" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon theme-icon-dark lucide lucide-moon-star" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path></svg>
            </button>
          </div>
        </div>

        <!-- Ansicht: Brief oder Einstellungen. Radiogruppe statt Checkbox —
             der Zustand steht im Namen, die Pfeiltasten schalten nativ, und es
             gibt EIN sichtbares Label statt zwei (WCAG 2.5.3, Befund B14).
             Optik = dieselbe Segment-Pille wie Form A/B. -->
        <fieldset class="seitenleiste-modus">
          <legend class="sr-only">Ansicht</legend>
          <div class="segmented-control">
            <input type="radio" name="ansicht-modus" id="modus-brief" value="brief" class="sr-only" checked>
            <label for="modus-brief">Brief</label>
            <input type="radio" name="ansicht-modus" id="modus-einstellungen" value="einstellungen" class="sr-only">
            <label for="modus-einstellungen">Einstellungen</label>
          </div>
        </fieldset>

        <div class="seitenleiste-export-group seitenleiste-btn-row" role="group" aria-label="Ausgabe">
          <button type="button" id="btn-print" class="btn primary w-full">🖨️ Drucken / PDF</button>
          <button type="button" id="btn-export-dinletter" class="btn w-full" title="Speichert den Brief als .json-Datei">💾 Speichern (.json)</button>
        </div>

        <!-- Statuszeile: zeigt nur, was im Brief-Modus NICHT als Regler
             sichtbar ist (Schrift, Unterrand) - Form und Falzmarken stehen
             direkt darunter und sind hier entfernt (B74, gemessen 2026-11-14).
             "ändern" springt in die Einstellungen. Kein neuer Zustand: die
             Werte kommen aus den Einstellungen. -->
        <p class="seitenleiste-zustand" role="group" aria-label="Aktueller Stand">
          <span id="zustand-text">Schrift: System · Unterrand 20 mm</span>
          <button type="button" id="btn-zustand-aendern" class="zustand-aendern" aria-label="Ansicht ändern">ändern</button>
        </p>

        <!-- Zone 1: Brief-Steuerung -->
        <section id="zone-dokument" class="seitenleiste-zone">
          <!-- Ueberschriften-Ebene: h1 (Seite, sr-only) -> h2 Zone -> h3 Gruppe.
               Reine Struktur fuer Screenreader und die Gliederung; die Labels
               an den Reglern bleiben Labels. -->
          <h2 class="seitenleiste-h2">Brief</h2>

          <!-- Adressen zuerst: der Brief beginnt mit dem Empfaenger. -->
<search id="anschrift-suche-container" class="seitenleiste-options-group">
            <label for="input-anschrift-suche" class="seitenleiste-sub-label">Anschrift suchen:</label>
            <input type="search" id="input-anschrift-suche" class="input-field w-full" placeholder="Straße, PLZ, Ort…" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" role="combobox" aria-controls="anschrift-vorschlaege" aria-expanded="false">
            <ul id="anschrift-vorschlaege" popover="auto" class="autocomplete-dropdown nicht-drucken" role="listbox" aria-label="Adressvorschläge"></ul>
            <ul id="plz-suggestions-popover" popover="auto" class="anschrift-vorschlaege-liste nicht-drucken" role="listbox" aria-label="PLZ-Vorschläge"></ul>
          </search>

          <button type="button" id="btn-zwischenablage-anschrift" class="btn w-full" title="Liest kopierte Anschrift- oder Impressumsdaten aus der Zwischenablage">📋 Anschrift aus Zwischenablage</button>
          <ul id="clipboard-candidates-popover" class="autocomplete-dropdown nicht-drucken" popover="auto"></ul>

          <hr class="seitenleiste-divider">

<!-- 2. Briefelemente -->
          <div class="seitenleiste-subgroup">
            <div class="seitenleiste-field-group">
              <label id="label-postvermerk" for="seitenleiste-postvermerk-select" class="seitenleiste-label">Postvermerk</label>
              <select id="seitenleiste-postvermerk-select" class="seitenleiste-select" aria-labelledby="label-postvermerk">
                <option value="">— kein —</option>
                <optgroup label="Versandarten">
                  <option value="Einschreiben">Einschreiben</option>
                  <option value="Einschreiben Einwurf">Einschreiben Einwurf</option>
                  <option value="Einschreiben Rückschein">Einschreiben Rückschein</option>
                  <option value="Einschreiben Wert">Einschreiben Wert</option>
                  <option value="Warensendung">Warensendung</option>
                  <option value="Büchersendung">Büchersendung</option>
                  <option value="Einschreiben / Rückschein / Persönlich">Einschreiben / Rückschein / Persönlich</option>
                </optgroup>
                <optgroup label="Vertraulichkeit">
                  <option value="Persönlich">Persönlich</option>
                  <option value="Vertraulich">Vertraulich</option>
                  <option value="Persönlich / Vertraulich">Persönlich / Vertraulich</option>
                  <option value="Nicht nachsenden!">Nicht nachsenden!</option>
                  <option value="Bei Umzug mit neuer Anschrift zurück">Bei Umzug mit neuer Anschrift zurück</option>
                </optgroup>
              </select>
            </div>

            <div class="seitenleiste-field-group">
              <label for="stil-select" class="seitenleiste-label">Brief-Stil &amp; Anrede</label>
              <select id="stil-select" class="seitenleiste-select" aria-label="Brief-Stil &amp; Anrede">
                <option value="formal">Förmlich (Sehr geehrte(r)...)</option>
                <option value="polite">Höflich (Guten Tag...)</option>
                <option value="casual">Locker (Hallo...)</option>
              </select>
            </div>

          </div>

          <hr class="seitenleiste-divider">

          <!-- 3. Textformatierung -->
          <div class="seitenleiste-subgroup">
            <div class="seitenleiste-field-group">
              <h3 class="seitenleiste-label" id="titel-textformatierung">Textformatierung</h3>

[showing lines 48-150 of 150; full output saved to /home/moritz/.local/share/opencode/shell/7a65242475c99ea523f0bbf34cad22dd092dd441/sh_1f93140eb002Bp2Y10s3RNmf5a.out]
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && find website -type f | sort && echo "---LINES JS---" && wc -l website/js/*.js 2>/dev/null | sort -n && echo "---LINES CSS---" && wc -l website/css/*.css 2>/dev/null | sort -n
website/addons/geschaeftsangaben/geschaeftsangaben.js
website/addons/geschaeftsangaben/README.md
website/addons/testbrief/figuren.json
website/addons/testbrief/testbrief.js
website/addons/verlauf/README.md
website/addons/verlauf/verlauf.js
website/addons/webmcp-bridge.js
website/css/base.css
website/css/README.md
website/css/sheet-common.css
website/css/sheet.css
website/css/sheet-multipage.css
website/css/sidebar.css
website/data/grosskunden.json.gz
website/data/orte.json.gz
website/fonts/aptos.woff2
website/fonts/inter_18pt-bold.woff2
website/fonts/inter_18pt-regular.woff2
website/fonts/michelangelus-regular.woff2
website/index.html
website/js/addons.js
website/js/address-data.js
website/js/address.js
website/js/binary-storage.js
website/js/boot.js
website/js/boot-state.js
website/js/clipboard-parser.js
website/js/core.js
website/js/document.js
website/js/draft-manager.js
website/js/field.js
website/js/font-feature.js
website/js/format.js
website/js/main.js
website/js/multipage-controller.js
website/js/persistence.js
website/js/README.md
website/js/salutation.js
website/js/settings.js
website/js/signature.js
website/js/webapi.d.ts
website/llms.txt
website/og-image.png
---LINES JS---
    32 website/js/field.js
   100 website/js/boot.js
   129 website/js/binary-storage.js
   131 website/js/multipage-controller.js
   180 website/js/addons.js
   180 website/js/boot-state.js
   296 website/js/main.js
   300 website/js/core.js
   337 website/js/signature.js
   340 website/js/salutation.js
   340 website/js/settings.js
   388 website/js/font-feature.js
   450 website/js/format.js
   561 website/js/draft-manager.js
   616 website/js/clipboard-parser.js
   899 website/js/persistence.js
   940 website/js/document.js
  1066 website/js/address-data.js
  1383 website/js/address.js
  8668 insgesamt
---LINES CSS---
   354 website/css/sheet.css
   408 website/css/base.css
   624 website/css/sheet-multipage.css
   771 website/css/sheet-common.css
  1328 website/css/sidebar.css
  3485 insgesamt
> build · deepseek-v4.1-flash
[0m→ [0mRead website/js/main.js 
[0m→ [0mRead website/js/boot-state.js 
[0m→ [0mRead website/js/boot.js 
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && echo "=== !important count per file ===" && grep -c '!important' website/css/*.css && echo "=== all !important lines ===" && grep -n '!important' website/css/*.css | head -80
=== !important count per file ===
website/css/base.css:22
website/css/sheet-common.css:2
website/css/sheet.css:21
website/css/sheet-multipage.css:67
website/css/sidebar.css:3
=== all !important lines ===
website/css/base.css:19:  display: none !important;
website/css/base.css:49:  transition: none !important;
website/css/base.css:64:    animation-duration: 0.01ms !important;
website/css/base.css:65:    animation-iteration-count: 1 !important;
website/css/base.css:66:    transition-duration: 0.01ms !important;
website/css/base.css:67:    transition-delay: 0ms !important;
website/css/base.css:68:    scroll-behavior: auto !important;
website/css/base.css:76:    animation-duration: var(--hinweis-dauer, 4000ms) !important;
website/css/base.css:359:  color-scheme: light !important;
website/css/base.css:360:  print-color-adjust: exact !important;
website/css/base.css:363:din-falzmarke-1, din-falzmarke-2, din-lochmarke { opacity: 1 !important; }
website/css/base.css:365:din-falzmarke-1::after, din-falzmarke-2::after, din-lochmarke::after { visibility: hidden !important; }
website/css/base.css:370:  visibility: hidden !important;
website/css/base.css:373:#app-shell { display: block !important; width: auto !important; height: auto !important; overflow: visible !important; }
website/css/base.css:375:.unterschriftsbild-rahmen { outline: none !important; }
website/css/base.css:380:    display: none !important;
website/css/base.css:389:    outline: none !important;
website/css/base.css:390:    box-shadow: none !important;
website/css/base.css:391:    background: transparent !important;
website/css/base.css:392:    border-radius: 0 !important;
website/css/base.css:397:    color: transparent !important;
website/css/base.css:406:  border-radius: 0 !important;
website/css/sheet-common.css:589:    outline: 2px solid oklch(0.55 0.22 25) !important;
website/css/sheet-common.css:648:     Emulation auf print zeigte trotz !important einen 2px-Ring). */
website/css/sheet.css:11: * Inline-Formate. 298 Zeilen, 23 x !important, ein @scope (din-blatt),
website/css/sheet.css:28: * - 23 x !important gegen die Regeln, die heute in sheet-common.css stehen:
website/css/sheet.css:40: * 2. Die 23 !important einzeln begründen (Druck braucht sie, Bildschirm
website/css/sheet.css:67:  overflow: hidden !important;
website/css/sheet.css:191:    display: none !important;
website/css/sheet.css:318:    display: none !important;
website/css/sheet.css:321:  html, body { overflow: visible !important; height: auto !important; }
website/css/sheet.css:323:  body { background: oklch(100% 0 0) !important; }
website/css/sheet.css:325:  aside, .nicht-drucken, [popover], #hinweis-v4, #font-uploader, .unterschriftsbild-griff, .unterschriftsbild-drehgriff, #anschriftfeld::after { display: none !important; }
website/css/sheet.css:327:  #viewport { padding: 0 !important; background: transparent !important; container-type: normal !important; height: auto !important; overflow: visible !important; }
website/css/sheet.css:330:      transform: none !important; 
website/css/sheet.css:331:      box-shadow: none !important; 
website/css/sheet.css:332:      margin: 0 !important; 
website/css/sheet.css:334:      width: calc(attr(data-width-mm type(<number>)) * 1mm) !important;
website/css/sheet.css:335:      height: calc(attr(data-height-mm type(<number>)) * 1mm) !important; 
website/css/sheet.css:339:    orphans: 3 !important;
website/css/sheet.css:340:    widows: 3 !important;
website/css/sheet.css:344:    break-after: avoid !important;
website/css/sheet.css:345:    page-break-after: avoid !important;
website/css/sheet.css:350:    break-inside: avoid !important;
website/css/sheet.css:351:    page-break-inside: avoid !important;
website/css/sheet-multipage.css:61:/* B59-Test 1: diese zwei !important waren gegen base.css:293 gerichtet, das
website/css/sheet-multipage.css:63:   weiterhin mit !important setzt. Beides braucht kein !important, wenn die
website/css/sheet-multipage.css:81:  overflow-y: hidden !important;
website/css/sheet-multipage.css:82:  display: flex !important;
website/css/sheet-multipage.css:83:  justify-content: center !important;
website/css/sheet-multipage.css:84:  align-items: center !important;
website/css/sheet-multipage.css:85:  padding: 10px 20px !important;
website/css/sheet-multipage.css:91:  overflow-y: auto !important;
website/css/sheet-multipage.css:92:  display: block !important;
website/css/sheet-multipage.css:93:  padding: 40px 20px 80px !important;
website/css/sheet-multipage.css:100:  display: flex !important;
website/css/sheet-multipage.css:101:  justify-content: center !important;
website/css/sheet-multipage.css:102:  align-items: center !important;
website/css/sheet-multipage.css:103:  height: 100% !important;
website/css/sheet-multipage.css:104:  width: 100% !important;
website/css/sheet-multipage.css:105:  container-type: normal !important;
website/css/sheet-multipage.css:110:  display: flex !important;
website/css/sheet-multipage.css:111:  justify-content: center !important;
website/css/sheet-multipage.css:112:  align-items: flex-start !important;
website/css/sheet-multipage.css:113:  min-height: 100% !important;
website/css/sheet-multipage.css:114:  height: auto !important;
website/css/sheet-multipage.css:115:  width: 100% !important;
website/css/sheet-multipage.css:116:  container-type: normal !important;
website/css/sheet-multipage.css:139:    margin: 0 auto !important;
website/css/sheet-multipage.css:293:    display: block !important;
website/css/sheet-multipage.css:491:  @top-left { content: none !important; }
website/css/sheet-multipage.css:492:  @top-right { content: none !important; }
website/css/sheet-multipage.css:499:    overflow: visible !important;
website/css/sheet-multipage.css:500:    height: auto !important;
website/css/sheet-multipage.css:501:    background: oklch(100% 0 0) !important;
website/css/sheet-multipage.css:505:    display: none !important;
website/css/sheet-multipage.css:511:    display: none !important;
website/css/sheet-multipage.css:521:    padding: 0 !important;
website/css/sheet-multipage.css:522:    background: transparent !important;
website/css/sheet-multipage.css:523:    height: auto !important;
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && echo "=== attr( usage ===" && grep -rn 'attr(' website/css/ website/js/ | head -40 && echo "=== data-* in CSS ===" && grep -rno 'data-[a-z-]*' website/css/*.css | sed 's/.*://' | sort | uniq -c | sort -rn
=== attr( usage ===
website/css/README.md:14:| [`sheet-common.css`](file:///home/moritz/repos/DIN-BriefNEO/website/css/sheet-common.css) | 426 | 68 | 11,1 KB | DIN-5008-Geometrie (Gemeinsam) | Deklaratives Attribut-Mapping (`din-blatt { --blatt-breite: attr(...) }`), Falz- & Lochmarken, Anschriftfeld, Infoblock, Hilfslinien, Unterschrift |
website/css/README.md:42:3. **`sheet-common.css`**: Etabliert das Custom Element `<din-blatt>` als `container-type: inline-size` und berechnet DIN-Felder deterministisch via `attr(data-* type(<number>))` und `cqw`/`cqh`.
website/css/README.md:103:  - [`sheet-common.css`](file:///home/moritz/repos/DIN-BriefNEO/website/css/sheet-common.css) transformiert diese Werte über `attr(... type(<number>))` und `@function --mm-y()` in relative Container-Units (`cqh`).
website/css/sheet.css:118:    width: --mm-rel-x(attr(data-w type(<number>))); /* Kurz, nicht durch den Text schneidend */
website/css/sheet.css:128:    left: --mm-rel-x(attr(data-x type(<number>)));
website/css/sheet.css:129:    width: --mm-rel-x(attr(data-w type(<number>)));
website/css/sheet.css:130:    height: --mm-rel-y(attr(data-h type(<number>)));
website/css/sheet.css:131:    font-size: --pt-rel(attr(data-font type(<number>))); /* 7pt in cqw */
website/css/sheet.css:149:    left: --mm-rel-x(attr(data-x type(<number>)));
website/css/sheet.css:150:    width: --mm-rel-x(attr(data-w type(<number>)));
website/css/sheet.css:151:    height: --mm-rel-y(attr(data-h type(<number>)));
website/css/sheet.css:152:    font-size: --pt-rel(attr(data-font type(<number>))); /* 10pt in cqw */
website/css/sheet.css:163:    left: --mm-rel-x(attr(data-x type(<number>)));
website/css/sheet.css:164:    width: --mm-rel-x(attr(data-w type(<number>)));
website/css/sheet.css:165:    font-size: --pt-rel(attr(data-font type(<number>))); /* 8.5pt in cqw */
website/css/sheet.css:175:    font-size: --pt-rel(attr(data-font type(<number>))); /* 10pt in cqw */
website/css/sheet.css:182:    left: --mm-rel-x(attr(data-left type(<number>)));  /* Linker Fluchtrand: 25mm */
website/css/sheet.css:183:    right: --mm-rel-x(attr(data-right type(<number>))); /* Rechter Rand: 20mm */
website/css/sheet.css:184:    bottom: --mm-rel-y(attr(data-bottom type(<number>))); /* Abstand nach unten für Footer */
website/css/sheet.css:195:    font-size: --pt-rel(attr(data-font type(<number>))); /* 12pt in cqw */
website/css/sheet.css:198:    margin-bottom: --mm-rel-y(attr(data-margin-bottom type(<number>))); /* 2 Leerzeilen */
website/css/sheet.css:204:    font-size: --pt-rel(attr(data-font type(<number>))); /* 10.5pt in cqw */
website/css/sheet.css:205:    margin-bottom: --mm-rel-y(attr(data-margin-bottom type(<number>))); /* 1 Leerzeile */
website/css/sheet.css:209:    font-size: --pt-rel(attr(data-font type(<number>))); /* 10.5pt in cqw */
website/css/sheet.css:222:    font-size: --pt-rel(attr(data-font type(<number>)));
website/css/sheet.css:223:    margin-top: --mm-rel-y(attr(data-margin-top type(<number>)));
website/css/sheet.css:224:    margin-bottom: --mm-rel-y(attr(data-margin-bottom type(<number>))); /* 3 Leerzeilen für Unterschrift */
website/css/sheet.css:231:    font-size: --pt-rel(attr(data-font type(<number>)));
website/css/sheet.css:245:    bottom: --mm-rel-y(attr(data-bottom type(<number>))); /* 10mm */
website/css/sheet.css:246:    left: --mm-rel-x(attr(data-left type(<number>))); /* 25mm */
website/css/sheet.css:247:    right: --mm-rel-x(attr(data-right type(<number>))); /* 20mm */
website/css/sheet.css:248:    height: --mm-rel-y(attr(data-h type(<number>))); /* 15mm */
website/css/sheet.css:249:    font-size: --pt-rel(attr(data-font type(<number>))); /* 7.5pt in cqw */
website/css/sheet.css:251:    padding-top: --mm-rel-y(attr(data-padding-top type(<number>)));
website/css/sheet.css:254:    gap: 0 --mm-rel-x(attr(data-gap type(<number>)));
website/css/sheet.css:290:  content: "⚠️ Text übersteigt Seite 1 (ca. +" attr(data-ueberlauf-zeilen) " Zeilen)";
website/css/sheet.css:334:      width: calc(attr(data-width-mm type(<number>)) * 1mm) !important;
website/css/sheet.css:335:      height: calc(attr(data-height-mm type(<number>)) * 1mm) !important; 
website/css/sidebar.css:1007:   ist in CSS nicht messbar (`attr()` liefert Zeichen, keine Laenge), also
website/css/sheet-common.css:26:  --blatt-breite: attr(data-width-mm type(<number>));
=== data-* in CSS ===
     24 data-seiten
     21 data-seeded
     18 data-font
     16 data-ready
     12 data-layout
     10 data-w
     10 data-theme
      9 data-feldtyp
      7 data-status
      7 data-placeholder
      7 data-marks
      7 data-atom
      6 data-x
      6 data-type
      6 data-ort-farbe
      6 data-anlagen
      5 data-typ
      5 data-state
      4 data-voll
      4 data-margin-top
      4 data-h
      4 data-falzmarke-
      3 data-margin-bottom
      3 data-generated
      3 data-fuss
      2 data-width-mm
      2 data-ueberlauf
      2 data-right
      2 data-plugin-geschaeftsangaben
      2 data-left
      2 data-height-mm
      2 data-font-state
      2 data-bottom
      2 data-addon
      1 data-visible
      1 data-ueberlauf-zeilen
      1 data-seiten-
      1 data-plugin-testbrief
      1 data-padding-top
      1 data-lochmarke-y
      1 data-kern-y-b
      1 data-kern-y-a
      1 data-infoblock-y-b
      1 data-infoblock-y-a
      1 data-has-image
      1 data-gesetzt
      1 data-gap
      1 data-briefkopf-y-b
      1 data-briefkopf-y-a
      1 data-anschriftfeld-y-b
      1 data-anschriftfeld-y-a
> build · deepseek-v4.1-flash
[0m→ [0mRead website/css/sheet.css [90m[limit=130][0m
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && echo "=== dataset.*= in JS ===" && grep -rn "dataset\.[a-zA-Z]* *=" website/js/ website/addons/ | head -60 && echo "=== setAttribute in JS ===" && grep -rn "setAttribute(" website/js/ website/addons/ | head -60
website/js/font-feature.js:270:          btn.dataset.fontState = 'loaded';
website/js/font-feature.js:276:          btn.dataset.fontState = 'empty';
website/js/font-feature.js:346:        if (btn.dataset.fontState === 'loaded') {
website/js/boot.js:94:    if (!root.dataset.ready) root.dataset.ready = 'true';
website/js/address.js:105:  if (popoverEl.dataset.delegated === 'true') return;
website/js/address.js:106:  popoverEl.dataset.delegated = 'true';
website/js/address.js:153:  if (empfOrtEl.dataset.wired === 'true') return;
website/js/address.js:154:  empfOrtEl.dataset.wired = 'true';
website/js/address.js:494:      li.dataset.ortFarbe = farben[index];
website/js/address.js:498:      li.dataset.typ = typLower === 'behörde' ? 'behoerde' : typLower || 'city';
website/js/address.js:557:      li.dataset.index = String(index);
website/js/address.js:693:        absender.dataset.quelle = 'manuell';
website/js/address.js:719:      else absender.dataset.quelle = rueckModus;
website/js/address.js:807:    if (inputGeoapifyKey) inputGeoapifyKey.dataset.status = status;
website/js/address.js:809:      statusEl.dataset.status = status;
website/js/address.js:1272:      li.dataset.index = String(index);
website/js/multipage-controller.js:80:    document.body.dataset.seiten = String(n);
website/js/multipage-controller.js:82:    if (vp) vp.dataset.seiten = String(n);
website/js/salutation.js:205:          el.dataset.dirty = 'true';
website/js/salutation.js:266:        if (anredeEl.dataset.dirty === 'true') {
website/js/salutation.js:277:        if (grussEl.dataset.dirty === 'true') {
website/js/salutation.js:309:    if (el.dataset.dirty === 'true' && current) return;
website/js/document.js:761:    if (target.id === 'datum') target.dataset.dirty = 'true';
website/js/document.js:927:  if (datumFeld?.dataset.dirty === 'true') draft['datum__dirty'] = true;
website/js/draft-manager.js:289:          ziel.dataset.quelle = draft[id];
website/js/draft-manager.js:296:      if (elem.dataset.feldtyp === 'systemwert' && elem.id !== 'datum') return;
website/js/draft-manager.js:348:      if (datumEl) datumEl.dataset.dirty = 'true';
website/js/draft-manager.js:527:    el.dataset.state = state;
website/js/main.js:175:    document.documentElement.dataset.ready = 'true';
website/js/clipboard-parser.js:600:            item.dataset.index = String(idx);
website/js/core.js:215:      dom.global.dataset.type = type;
website/js/core.js:222:    dom.global.dataset.type = type;
=== setAttribute in JS ===
website/js/font-feature.js:123:    gruppe.setAttribute('data-systemschriften', '');
website/js/boot.js:48:  root.setAttribute('data-theme', theme);
website/js/boot.js:49:  root.setAttribute('data-layout', layout);
website/js/boot.js:50:  root.setAttribute('data-marks', istAn(settings.marks) ? 'true' : 'false');
website/js/boot.js:51:  root.setAttribute('data-plugin-testbrief', istAn(settings.pluginTestbrief) ? 'true' : 'false');
website/js/boot.js:54:  root.setAttribute('data-plugin-geschaeftsangaben', settings.pluginGeschaeftsangaben === true ? 'true' : 'false');
website/js/boot.js:59:  root.setAttribute('data-plugin-multipage', 'true');
website/js/boot.js:75:  root.setAttribute('data-anlagen', hatAnlagen ? 'true' : 'false');
website/js/boot.js:76:  root.setAttribute('data-fuss', hatFuss ? 'true' : 'false');
website/js/settings.js:29:  if (el.getAttribute(name) !== wert) el.setAttribute(name, wert);
website/js/settings.js:121:    document.documentElement.setAttribute('data-plugin-testbrief', String(testbrief));
website/js/settings.js:122:    document.documentElement.setAttribute(
website/js/settings.js:126:    document.documentElement.setAttribute('data-plugin-multipage', 'true');
website/js/settings.js:146:      document.documentElement.setAttribute('data-theme', active);
website/js/settings.js:153:        this.btnThemeToggle.setAttribute('title', titles[active] || 'Darstellung: Automatisch');
website/js/settings.js:154:        this.btnThemeToggle.setAttribute('aria-label', titles[active] || 'Darstellung: Automatisch');
website/js/address.js:83:    item.setAttribute('aria-selected', String(idx === naechster));
website/js/address.js:252:        empfOrtEl.setAttribute('data-autofilled', 'true');
website/js/address.js:260:            empfFirmaEl.setAttribute('data-autofilled', 'true');
website/js/address.js:263:            empfStrasseEl.setAttribute('data-placeholder', '(Großempfänger – Straße entfällt)');
website/js/address.js:299:        empfOrtEl.setAttribute('data-autofilled', 'true');
website/js/address.js:490:      li.setAttribute('role', 'option');
website/js/address.js:491:      li.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
website/js/address.js:567:      hintLi.setAttribute('role', 'option');
website/js/address.js:568:      hintLi.setAttribute('aria-disabled', 'true');
website/js/address.js:569:      hintLi.setAttribute('aria-selected', 'false');
website/js/address.js:859:    inputAddressSearch.setAttribute('aria-expanded', String(/** @type {any} */ (e).newState === 'open'));
website/js/address.js:1068:      inputAddressSearch.setAttribute('aria-activedescendant', `anschrift-vorschlag-${activeSuggestionIndex}`);
website/js/address.js:1261:      li.setAttribute('role', 'option');
website/js/address.js:1262:      li.setAttribute('aria-selected', 'false');
website/js/address.js:1279:      statusLi.setAttribute('role', 'option');
website/js/address.js:1280:      statusLi.setAttribute('aria-disabled', 'true');
website/js/address.js:1281:      statusLi.setAttribute('aria-selected', 'false');
website/js/address.js:1302:    li.setAttribute('role', 'option');
website/js/address.js:1303:    li.setAttribute('aria-disabled', 'true');
website/js/address.js:1304:    li.setAttribute('aria-selected', 'false');
website/js/document.js:397:  bold.setAttribute('aria-pressed', String(Boolean(el?.closest('b, strong'))));
website/js/document.js:398:  italic.setAttribute('aria-pressed', String(Boolean(el?.closest('i, em'))));
website/js/document.js:399:  quote.setAttribute('aria-pressed', String(Boolean(el?.closest('blockquote'))));
website/js/document.js:649:    feld.setAttribute('data-voll', 'true');
website/js/document.js:821:          blatt.setAttribute('data-ueberlauf', 'true');
website/js/document.js:826:          blatt.setAttribute('data-ueberlauf-zeilen', String(estimatedLines));
website/js/draft-manager.js:364:    document.documentElement.setAttribute('data-anlagen', anlagenSwitch?.checked ? 'true' : 'false');
website/js/draft-manager.js:382:    document.documentElement.setAttribute('data-fuss', fussSwitch?.checked ? 'true' : 'false');
website/js/draft-manager.js:468:    document.documentElement.setAttribute('data-anlagen', 'false');
website/js/draft-manager.js:469:    document.documentElement.setAttribute('data-fuss', 'false');
website/js/draft-manager.js:534:      el.setAttribute('role', 'alert');
website/js/draft-manager.js:535:      el.setAttribute('aria-live', 'assertive');
website/js/main.js:55:  box.setAttribute('role', 'alert');
website/js/main.js:243:        document.documentElement.setAttribute('data-anlagen', anlagenSwitch.checked ? 'true' : 'false');
website/js/main.js:254:      document.documentElement.setAttribute('data-fuss', fussSchalter.checked ? 'true' : 'false');
website/js/persistence.js:325:      meta.setAttribute('data-injected', 'true');
website/js/boot-state.js:173:    document.documentElement.setAttribute('data-seeded', 'true');
website/js/clipboard-parser.js:574:            item.setAttribute('role', 'button');
website/js/clipboard-parser.js:575:            item.setAttribute('tabindex', '0');
website/js/addons.js:165:    btn.setAttribute('aria-busy', 'true');
website/addons/testbrief/testbrief.js:991:  if (SPERRE_FELDER.has(id)) el.setAttribute('data-autofill-aus', 'true');
website/addons/testbrief/testbrief.js:1390:    document.documentElement.setAttribute('data-anlagen', 'true');
website/addons/testbrief/testbrief.js:1394:    document.documentElement.setAttribute('data-anlagen', 'false');
website/addons/testbrief/testbrief.js:1402:  document.documentElement.setAttribute('data-fuss', 'false');

[showing lines 7-99 of 99; full output saved to /home/moritz/.local/share/opencode/shell/7a65242475c99ea523f0bbf34cad22dd092dd441/sh_1f931a167001FosAsG5u5ZyciA.out]
> build · deepseek-v4.1-flash
[0m→ [0mRead website/js/core.js 
[0m→ [0mRead website/js/settings.js 
> build · deepseek-v4.1-flash
[0m→ [0mRead website/js/document.js 
> build · deepseek-v4.1-flash
[0m→ [0mRead website/js/draft-manager.js 
> build · deepseek-v4.1-flash
[0m→ [0mRead website/js/multipage-controller.js 
[0m→ [0mRead website/js/addons.js 
[0m→ [0mRead website/js/field.js 
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -n '<link\|<script\|<style\|defer\|type="module"' website/index.html
13:    <link rel="canonical" href="https://grapefruit89.github.io/DIN-BriefNEO/">
31:    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2036%2036'%3E%3Crect%20width%3D'36'%20height%3D'26'%20y%3D'5'%20fill%3D'%23ccd6dd'%20rx%3D'4'%2F%3E%3Cpath%20stroke%3D'%2399aab5'%20stroke-linecap%3D'round'%20stroke-width%3D'2'%20d%3D'm2%2029%2013-13m6%200%2013%2013'%2F%3E%3Cpath%20fill%3D'%2399aab5'%20d%3D'M4%205h28a4%204%200%200%201%204%204v2L21%2025a5%205%200%200%201-6%200L0%2011V9a4%204%200%200%201%204-4'%2F%3E%3Cpath%20fill%3D'%23e1e8ed'%20d%3D'M4%205h28a4%204%200%200%201%204%204L21%2022a4%204%200%200%201-6%200L0%209a4%204%200%200%201%204-4'%2F%3E%3C%2Fsvg%3E">
32:    <link rel="stylesheet" href="css/base.css?v=live6">
33:    <link rel="stylesheet" href="css/sidebar.css?v=live7">
34:    <link rel="stylesheet" href="css/sheet-common.css?v=common1">
35:    <link rel="stylesheet" href="css/sheet-multipage.css?v=multi1">
36:    <script src="js/boot.js?v=boot2"></script>
37:    <script type="module" src="js/main.js?v=live6"></script>
478:    <script src="js/boot-state.js?v=bs2"></script>
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && echo "=== import statements per file ===" && grep -rn "^import\|await import\|import(" website/js/*.js | grep -v '^\s*\*' | sed 's/:  */: /' | head -60
=== import statements per file ===
website/js/addons.js:16:import { notify } from './core.js';
website/js/addons.js:32: testbrief: () => import('../addons/testbrief/testbrief.js'),
website/js/addons.js:33: geschaeftsangaben: () => import('../addons/geschaeftsangaben/geschaeftsangaben.js'),
website/js/addons.js:34: verlauf: () => import('../addons/verlauf/verlauf.js'),
website/js/address.js:16:import {
website/js/address.js:30:import { ClipboardAddressParser } from './clipboard-parser.js';
website/js/address.js:31:import { Constants, Events, eventBus, hidePopoverSafe, notify, showPopoverSafe } from './core.js';
website/js/address.js:32:import { setCaretToEnd } from './document.js';
website/js/address.js:33:import { Field } from './field.js';
website/js/address.js:34:import { load, loadJSON, STORAGE_KEYS, save, saveJSON } from './persistence.js';
website/js/clipboard-parser.js:13:import { bindListSelection, feld } from './address.js';
website/js/clipboard-parser.js:14:import { AddressData, AddressIntelligence, normalizeText } from './address-data.js';
website/js/clipboard-parser.js:15:import { Constants, Events, eventBus, hidePopoverSafe, notify, showPopoverSafe } from './core.js';
website/js/clipboard-parser.js:17:import { Field } from './field.js';
website/js/document.js:13:import { Field } from './field.js';
website/js/document.js:14:import { applyMicroTypography } from './format.js';
website/js/draft-manager.js:13:import { AddressIntelligence } from './address.js';
website/js/draft-manager.js:14:import { Constants, Events, eventBus } from './core.js';
website/js/draft-manager.js:15:import { collectDraft, EDITABLE_FIELD_SELECTOR, getCaretCharacterOffset, sanitizeRichText, setCaretCharacterOffset } from './document.js';
website/js/draft-manager.js:16:import { Field } from './field.js';
website/js/draft-manager.js:17:import { isPrintTitleActive, loadJSON, remove, STORAGE_KEYS, save, saveJSON, stripHtmlToPlaintext } from './persistence.js';
website/js/draft-manager.js:46: * @param {ReturnType<typeof import('./core.js').createEventBus> | null} [bus]
website/js/draft-manager.js:49: /** @type {ReturnType<typeof import('./core.js').createEventBus> | null} */
website/js/font-feature.js:12:import { deleteBlob, loadBlob, saveBlob } from './binary-storage.js';
website/js/font-feature.js:13:import { Constants, notify, transitionOn } from './core.js';
website/js/font-feature.js:14:import { DEFAULT_SETTINGS, loadJSON, STORAGE_KEYS, saveJSON } from './persistence.js';
website/js/font-feature.js:17:/** @typedef {import('./settings.js').SettingsManager} SettingsManager */
website/js/font-feature.js:39: /** @type {import('./persistence.js').DinSettings & { previewFont?: string }} */
website/js/format.js:8:import { Field } from './field.js';
website/js/main.js:5:import { initAddonDispatcher } from './addons.js';
website/js/main.js:6:import { AddressIntelligence, initAddressServices, initSenderSync } from './address.js';
website/js/main.js:7:import { ClipboardAddressParser } from './clipboard-parser.js';
website/js/main.js:8:import { Events, eventBus, initToastSystem } from './core.js';
website/js/main.js:9:import { collectDraft, initFormatSync, toggleBlockquote, toggleInlineFormat, UIProtections } from './document.js';
website/js/main.js:10:import { DraftManager } from './draft-manager.js';
website/js/main.js:11:import { Field } from './field.js';
website/js/main.js:12:import { FontFeature } from './font-feature.js';
website/js/main.js:13:import { applyLetterDate, formatTelefonnummer } from './format.js';
website/js/main.js:15:import { initImportExport, MetadataService, requestPersistentStorage } from './persistence.js';
website/js/main.js:16:import { SalutationFeature } from './salutation.js';
website/js/main.js:17:import { SettingsManager } from './settings.js';
website/js/main.js:18:import { SignatureFeature } from './signature.js';
website/js/main.js:152: import('./multipage-controller.js')
website/js/multipage-controller.js:1:import { Field } from './field.js';
website/js/persistence.js:17:import { Constants, notify } from './core.js';
website/js/persistence.js:18:import { Field } from './field.js';
website/js/persistence.js:19:import { currentISODate } from './format.js';
website/js/salutation.js:16:import { Constants, Events, eventBus } from './core.js';
website/js/salutation.js:17:import { Field } from './field.js';
website/js/salutation.js:18:import { DEFAULT_SETTINGS, loadJSON, STORAGE_KEYS, saveJSON } from './persistence.js';
website/js/salutation.js:168: /** @type {import('./settings.js').SettingsManager | null} */
website/js/salutation.js:176: * @param {import('./settings.js').SettingsManager | null} [settingsManager]
website/js/settings.js:11:import { toggleAddon } from './addons.js';
website/js/settings.js:12:import { Events, eventBus, transitionOn } from './core.js';
website/js/settings.js:13:import { DEFAULT_SETTINGS, istAn, loadJSON, STORAGE_KEYS, saveJSON } from './persistence.js';
website/js/settings.js:49: /** @type {import('./persistence.js').DinSettings & { previewFont?: string }} */
website/js/signature.js:11:import { deleteBlob, loadBlob, saveBlob } from './binary-storage.js';
website/js/signature.js:12:import { Constants, notify } from './core.js';
website/js/signature.js:15:/** @typedef {import('./settings.js').SettingsManager} SettingsManager */
> build · deepseek-v4.1-flash
[0m→ [0mRead website/js/address.js [90m[limit=200][0m
[0m→ [0mRead website/js/address-data.js [90m[limit=90][0m
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -n -B4 -A8 'data-seeded\|data-ready' website/css/*.css
website/css/base.css-42- * keine Uebergaenge. Danach sind sie unveraendert da (Hover, Fokus, Klick).
website/css/base.css-43- * NICHT ENTFERNEN und NICHT auf einzelne Selektoren verengen: die naechste
website/css/base.css-44- * zustandsabhaengige Eigenschaft faellt sonst in dieselbe Falle. Die Wahrheit
website/css/base.css-45- * steht vor dem Paint als Attribut am <html> (siehe DECISION-LOG). */
website/css/base.css:46::root:not([data-seeded="true"]):not([data-ready="true"]) *,
website/css/base.css:47::root:not([data-seeded="true"]):not([data-ready="true"]) *::before,
website/css/base.css:48::root:not([data-seeded="true"]):not([data-ready="true"]) *::after {
website/css/base.css-49-  transition: none !important;
website/css/base.css-50-}
website/css/base.css-51-
website/css/base.css-52-html, body {
website/css/base.css-53-  margin: 0;
website/css/base.css-54-  padding: 0;
website/css/base.css-55-  width: 100%;
website/css/base.css-56-  height: 100dvh;
--
website/css/sheet-common.css-62- * Nur am Bildschirm, nur nach dem Seeding (kein Load-FOUC) und nicht bei
website/css/sheet-common.css-63- * reduzierter Bewegung. Im Druck gibt es keine Uebergaenge — das PDF bleibt
website/css/sheet-common.css-64- * exakt. NICHT auf die Pille beschraenken: sonst springt das Blatt. */
website/css/sheet-common.css-65-@media screen and (prefers-reduced-motion: no-preference) {
website/css/sheet-common.css:66:  :root[data-seeded="true"] #rucksendeangabe,
website/css/sheet-common.css:67:  :root[data-seeded="true"] #anschriftfeld,
website/css/sheet-common.css:68:  :root[data-seeded="true"] #infoblock,
website/css/sheet-common.css:69:  :root[data-seeded="true"] #kern,
website/css/sheet-common.css:70:  :root[data-seeded="true"] din-falzmarke-1,
website/css/sheet-common.css:71:  :root[data-seeded="true"] din-falzmarke-2 {
website/css/sheet-common.css-72-    transition: top 0.28s cubic-bezier(0.25, 1, 0.5, 1);
website/css/sheet-common.css-73-  }
website/css/sheet-common.css-74-
website/css/sheet-common.css:75:  :root[data-seeded="true"] #spacer {
website/css/sheet-common.css-76-    transition:
website/css/sheet-common.css-77-      height 0.28s cubic-bezier(0.25, 1, 0.5, 1),
website/css/sheet-common.css-78-      min-height 0.28s cubic-bezier(0.25, 1, 0.5, 1),
website/css/sheet-common.css-79-      max-height 0.28s cubic-bezier(0.25, 1, 0.5, 1);
website/css/sheet-common.css-80-  }
website/css/sheet-common.css-81-}
website/css/sheet-common.css-82-
website/css/sheet-common.css-83-din-rucksendeangabe,
--
website/css/sheet-common.css-695-     #unterschrift leer, also standen ihre Platzhalter ("2. September 2026",
website/css/sheet-common.css-696-     "Ihr getippter Name") für ~36 ms auf dem Papier, bevor der echte Wert
website/css/sheet-common.css-697-     kam.
website/css/sheet-common.css-698-
website/css/sheet-common.css:699:     Anker ist `data-seeded`, nicht `data-ready` (B70, gemessen 2026-11-14):
website/css/sheet-common.css:700:     `data-ready` kommt erst am Ende von initApp und lag in 21 von 30 lokalen
website/css/sheet-common.css-701-     Laeufen nach dem ersten Paint, unter 6x CPU-Drosselung in 29 von 30 und
website/css/sheet-common.css:702:     im langsamen Netz in 30 von 30 (bis 1,9 s spaeter). `data-seeded` ist der
website/css/sheet-common.css-703-     Punkt, an dem die Werte stehen — genau der Moment, in dem der Platzhalter
website/css/sheet-common.css-704-     wieder erlaubt sein muss, sonst fehlt er bei leeren Feldern sichtbar.
website/css/sheet-common.css:705:     `data-ready` bleibt als Netz: faellt der Seeder aus, setzt boot.js es nach
website/css/sheet-common.css-706-     2 s und die Platzhalter erscheinen trotzdem. Die Feld-Geometrie ist von
website/css/sheet-common.css-707-     beidem unberuehrt — nur der Text fehlt. */
website/css/sheet-common.css:708:  :root:not([data-seeded="true"]):not([data-ready="true"]) & [data-placeholder]:empty::before,
website/css/sheet-common.css:709:    :root:not([data-seeded="true"]):not([data-ready="true"]) & [contenteditable][data-placeholder]:empty::before {
website/css/sheet-common.css-710-      content: none;
website/css/sheet-common.css-711-    }
website/css/sheet-common.css-712-
website/css/sheet-common.css:713:  :root:not([data-seeded="true"]):not([data-ready="true"]) & textarea[data-feldtyp]::placeholder,
website/css/sheet-common.css:714:    :root:not([data-seeded="true"]):not([data-ready="true"]) & input[data-atom]::placeholder {
website/css/sheet-common.css-715-      color: transparent;
website/css/sheet-common.css-716-    }
website/css/sheet-common.css-717-
website/css/sheet-common.css-718-  /* Hier stand eine grau-kursive Markierung fuer automatisch erzeugte Anrede
website/css/sheet-common.css-719-     und Grussformel. Seit die Felder <input> mit Platzhalter sind, sah der
website/css/sheet-common.css-720-     echte Text dadurch wie ein Platzhalter aus (gemeldet 2026-11-12:
website/css/sheet-common.css-721-     "bleiben im placeholder styling stecken"). Das Attribut `data-generated`
website/css/sheet-common.css-722-     wird seitdem **nirgends** mehr gesetzt oder gelesen (geprueft
--
website/css/sidebar.css-656-}
website/css/sidebar.css-657-
website/css/sidebar.css-658-/* --- UI-SHELL & FORM CONTROLS (aus ehemals layout.css) --- */
website/css/sidebar.css-659-/* FOUC: Werte aus localStorage (Postvermerk, Schalter) stehen erst mit
website/css/sidebar.css:660:   data-ready fest (boot.js setzt es am Ende von initApp, Sicherheitsnetz nach
website/css/sidebar.css-661-   2 s). Bis dahin lieber unsichtbar als falsch — der Platz bleibt erhalten.
website/css/sidebar.css-662-   Textfelder sind davon nicht betroffen: boot-state.js fuellt sie schon vor
website/css/sidebar.css-663-   dem Paint. */
website/css/sidebar.css:664:/* Sichtbar, sobald boot-state.js geseedet hat (data-seeded). NICHT an
website/css/sidebar.css:665:   data-ready haengen: das kommt erst am Ende von initApp und liesse die Regler
website/css/sidebar.css:666:   nach dem ersten Paint nachploppen. data-ready bleibt als Sicherheitsnetz,
website/css/sidebar.css-667-   falls der Seeder ausfaellt (boot.js setzt es notfalls nach 2 s). */
website/css/sidebar.css:668::root:not([data-seeded="true"]):not([data-ready="true"]) #seitenleiste-postvermerk-select,
website/css/sidebar.css:669::root:not([data-seeded="true"]):not([data-ready="true"]) #seitenleiste input[switch] {
website/css/sidebar.css-670-  visibility: hidden;
website/css/sidebar.css-671-}
website/css/sidebar.css-672-
website/css/sidebar.css-673-/* Zonen-Ueberschrift. Bewusst klein und gedämpft: sie gliedert, sie schreit
website/css/sidebar.css-674-   nicht. Die Gruppen-Titel sind h3 mit derselben Optik wie bisher
website/css/sidebar.css-675-   (.seitenleiste-label), die Regler-Labels bleiben <label>. */
website/css/sidebar.css-676-.seitenleiste-h2 {
website/css/sidebar.css-677-  margin: 0 0 var(--space-2xs);
--
website/css/sidebar.css-745-/* "Gefuellt"-Optik direkt aus dem Formularzustand (B62, 2026-11-14).
website/css/sidebar.css-746-   Vorher spiegelte ein JS-Attribut (`data-gesetzt`) den Wert, weil die
website/css/sidebar.css-747-   Aenderung nach dem Paint aufblendete (gemessen 2026-11-12: background-color
website/css/sidebar.css-748-   30 -> 139 ms). Dieser Grund ist entfallen: seit demselben Tag sperrt
website/css/sidebar.css:749:   base.css alle Uebergaenge bis `data-seeded`, und der Seeder setzt die Werte
website/css/sidebar.css-750-   vorher. Das Attribut brachte dagegen einen eigenen Fehler mit - es wurde
website/css/sidebar.css-751-   berechnet, BEVOR der Seeder den Postvermerk setzte, und blieb deshalb auf
website/css/sidebar.css-752-   "false" (30 von 30 kalten Reloads, gemessen 2026-11-14): die Liste zeigte
website/css/sidebar.css-753-   "Einschreiben" in der Optik einer leeren Auswahl. `:has()` fragt den
website/css/sidebar.css-754-   Zustand, statt ihn zu kopieren, und kennt diese Reihenfolge nicht. */
website/css/sidebar.css-755-.seitenleiste-select:has(option:checked:not([value=""])) {
website/css/sidebar.css-756-  background: var(--segment-active-bg);
website/css/sidebar.css-757-  color: var(--text-primary);

[showing lines 6-109 of 109; full output saved to /home/moritz/.local/share/opencode/shell/7a65242475c99ea523f0bbf34cad22dd092dd441/sh_1f93237350013VrnzFj8lm4qT9.out]
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && echo "=== longest selectors (>110 chars) ===" && grep -n '.\{110,\}' website/css/*.css | grep -v '^\S*:[0-9]*: *\*\|^\S*:[0-9]*: */\*' | head -40
=== longest selectors (>110 chars) ===
website/css/base.css:175:  --c-blatt-night: oklch(0.85 0.005 250);         /* Gedimmtes Papier (blendfrei, wie Papier unter Abendlampe) */
website/css/base.css:182:  --bg-seitenleiste-glass: color-mix(in oklch, light-dark(var(--c-seitenleiste-day), var(--c-seitenleiste-night)) 80%, transparent);
website/css/base.css:209:  --font-system-stack: "Aptos", "Aptos Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Liberation Sans", "DejaVu Sans", Arial, sans-serif;
website/css/base.css:373:#app-shell { display: block !important; width: auto !important; height: auto !important; overflow: visible !important; }
website/css/sheet-common.css:633:      background-color: light-dark(oklch(from var(--accent-color) l c h / 4%), oklch(from var(--accent-color) l c h / 8%));
website/css/sheet-common.css:654:        background-color: light-dark(oklch(from var(--accent-color) l c h / 3%), oklch(from var(--accent-color) l c h / 6%));
website/css/sheet-common.css:709:    :root:not([data-seeded="true"]):not([data-ready="true"]) & [contenteditable][data-placeholder]:empty::before {
website/css/sheet.css:325:  aside, .nicht-drucken, [popover], #hinweis-v4, #font-uploader, .unterschriftsbild-griff, .unterschriftsbild-drehgriff, #anschriftfeld::after { display: none !important; }
website/css/sheet.css:327:  #viewport { padding: 0 !important; background: transparent !important; container-type: normal !important; height: auto !important; overflow: visible !important; }
website/css/sheet-multipage.css:24:  --zeilenabstand: calc(var(--rand-o) + var(--rand-u) + var(--luecke) + var(--fuss-hoehe)); /* 53mm, mit Fuss 68mm */
website/css/sidebar.css:40:  touch-action: pan-y;           /* Erlaubt vertikales Scrollen, blockiert Pinch-Zoom-Gesten auf der Leiste */
website/css/sidebar.css:219:.segmented-control:not(.segmented-control-layout):has(input[type="radio"]:nth-of-type(1):checked) { --active-idx: 0; }
website/css/sidebar.css:220:.segmented-control:not(.segmented-control-layout):has(input[type="radio"]:nth-of-type(2):checked) { --active-idx: 1; }
website/css/sidebar.css:221:.segmented-control:not(.segmented-control-layout):has(input[type="radio"]:nth-of-type(3):checked) { --active-idx: 2; }
website/css/sidebar.css:222:.segmented-control:not(.segmented-control-layout):has(input[type="radio"]:nth-of-type(4):checked) { --active-idx: 3; }
website/css/sidebar.css:1145::is(#anschrift-vorschlaege, #plz-suggestions-popover) .suggestion-item[data-typ="city"] { color: var(--text-primary); }
website/css/sidebar.css:1146::is(#anschrift-vorschlaege, #plz-suggestions-popover) .suggestion-item[data-typ="firma"] { color: oklch(45% 0.16 250); }
website/css/sidebar.css:1147::is(#anschrift-vorschlaege, #plz-suggestions-popover) .suggestion-item[data-typ="behoerde"] { color: oklch(50% 0.14 145); }
website/css/sidebar.css:1148::is(#anschrift-vorschlaege, #plz-suggestions-popover) .suggestion-item[data-typ="gericht"] { color: oklch(48% 0 0); }
website/css/sidebar.css:1149::is(#anschrift-vorschlaege, #plz-suggestions-popover) .suggestion-item[data-typ="institution"] { color: oklch(55% 0.18 45); }
website/css/sidebar.css:1160::is(#anschrift-vorschlaege, #plz-suggestions-popover) .suggestion-item[data-ort-farbe="1"] { --ort-ton: oklch(0.78 0.12 55); }
website/css/sidebar.css:1161::is(#anschrift-vorschlaege, #plz-suggestions-popover) .suggestion-item[data-ort-farbe="2"] { --ort-ton: oklch(0.74 0.10 250); }
website/css/sidebar.css:1162::is(#anschrift-vorschlaege, #plz-suggestions-popover) .suggestion-item[data-ort-farbe="3"] { --ort-ton: oklch(0.78 0.11 150); }
website/css/sidebar.css:1163::is(#anschrift-vorschlaege, #plz-suggestions-popover) .suggestion-item[data-ort-farbe="4"] { --ort-ton: oklch(0.76 0.10 300); }
website/css/sidebar.css:1164::is(#anschrift-vorschlaege, #plz-suggestions-popover) .suggestion-item[data-ort-farbe="5"] { --ort-ton: oklch(0.78 0.09 195); }
website/css/sidebar.css:1165::is(#anschrift-vorschlaege, #plz-suggestions-popover) .suggestion-item[data-ort-farbe="6"] { --ort-ton: oklch(0.78 0.11 15); }
website/css/sidebar.css:1267:#din-info-dialog .din-info-content { font-size: 0.8rem; line-height: 1.5; color: var(--text-muted); display: flex; flex-direction: column; gap: var(--space-md); }
website/css/sidebar.css:1273:  color: oklch(0.38 0.16 28); /* WCAG 2.1 AA: Dunkles Karminrot fuer > 5.5:1 Kontrast auf hellem Hintergrund */
website/css/sidebar.css:1289:  background: light-dark(oklch(from var(--accent-color) l c h / 5%), oklch(from var(--accent-color) l c h / 12%));
> build · deepseek-v4.1-flash
[0m→ [0mRead website/css/sheet-multipage.css [90m[limit=180][0m
> build · deepseek-v4.1-flash
[0m→ [0mRead website/css/base.css [90m[limit=100, offset=340][0m
[0m→ [0mRead website/css/sheet-multipage.css [90m[limit=180, offset=445][0m
> build · deepseek-v4.1-flash
[0m→ [0mRead website/css/sheet-common.css [90m[limit=140][0m
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -n 'data-x=\|data-w=\|data-h=\|data-font=\|data-bottom=\|data-width-mm' website/index.html | head -30
338:            data-width-mm="210"
356:            <din-falzmarke-1 data-w="8"></din-falzmarke-1>
357:            <din-falzmarke-2 data-w="8"></din-falzmarke-2>
358:            <din-lochmarke data-w="12"></din-lochmarke>
368:              data-x="25" data-w="85" data-h="45" data-font="10">
370:                <input type="text" id="rucksendeangabe" data-font="7" data-atom placeholder="Ihr Name, Ihre Straße 1, 12345 Musterstadt" aria-label="Absender (Rücksendezeile)" autocomplete="off" autocapitalize="words" spellcheck="false" maxlength="120">
371:                <input type="text" id="vermerke" data-atom data-font="8" placeholder="Postvermerk" aria-label="Postvermerk" autocomplete="off" spellcheck="false" autocapitalize="words" maxlength="80">
380:            <din-infoblock id="infoblock" data-x="125" data-w="65" data-font="8.5" role="group" aria-label="Infoblock">
386:              <input type="text" id="datum" data-atom data-font="10" class="single-line" data-feldtyp="systemwert" placeholder="2. September 2026" aria-label="Datum" autocomplete="off" spellcheck="false" enterkeyhint="done" maxlength="30">
391:              <input type="text" id="betreff" data-atom data-font="12" class="single-line" placeholder="Betreffzeile hier eingeben" aria-label="Betreff" autocomplete="off" spellcheck="true" autocapitalize="sentences" maxlength="140">
392:              <input type="text" id="anrede" data-atom data-font="10.5" class="single-line" placeholder="Sehr geehrte Damen und Herren," aria-label="Anrede" autocomplete="off" spellcheck="false" autocapitalize="sentences" maxlength="70">
393:              <din-text id="text" data-font="10.5" data-feldtyp="rich mehrzeilig" role="textbox" aria-multiline="true" contenteditable="true" enterkeyhint="enter" spellcheck="true" autocapitalize="sentences" writingsuggestions="false" data-placeholder="Schreiben Sie hier den eigentlichen Inhalt Ihres Briefes…" aria-label="Text"></din-text>
394:              <input type="text" id="grussformel" data-atom data-font="10.5" class="single-line" placeholder="Mit freundlichen Grüßen" aria-label="Grußformel" autocomplete="off" spellcheck="false" autocapitalize="sentences" maxlength="45">
398:                <input type="text" id="unterschrift" data-atom data-font="10.5" class="single-line" enterkeyhint="done" placeholder="Ihr getippter Name" aria-label="Getippter Name unter der Unterschrift" autocomplete="off" spellcheck="false" autocapitalize="words" maxlength="45">
411:            <din-geschaeftsangaben id="geschaeftsangaben" data-left="25" data-right="20" data-h="15" data-padding-top="2" data-gap="10" data-font="7.5" role="region" aria-label="Geschäftsangaben Fußzeile">
> build · deepseek-v4.1-flash
[0m→ [0mRead website/js/salutation.js 
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && sed -n '1,120p' website/js/persistence.js && echo "..." && grep -n "export function\|export const\|export class" website/js/persistence.js
// @ts-check
// @adr [[ADR-DATA-PERSISTENCE]] {LocalStoragePrimitives, ImportExport}
// @adr [[ADR-JS]] {DateFormat, MetadataBridge}
// @adr [[ADR-EVENT-DRIVEN-ARCHITECTURE]]
// @guide [[glossary]]
// @guide [[din-5008-css-architektur]]

/**
 * @file persistence.js — Konsolidierter Speicher-, Datums-, Metadaten- und Export-Layer für DIN-BriefNEO.
 * Bündelt die bisherigen 4 Module:
 *  1. DateFormat (ehem. 47-date-format.js): DIN-Datum via Intl.DateTimeFormat & Temporal API.
 *  2. Storage (ehem. 51-storage.js): System-Konstanten, LocalStorage-Primitives & Migration.
 *  3. Metadata (ehem. 53-metadata.js): Dateinamen-Generierung, PDF-Metadaten & Drucktitel-Schutz.
 *  4. ImportExport (ehem. 52-import-export.js): JSON-Export/Import mit Metadaten-Header und Validierung.
 */

import { Constants, notify } from './core.js';
import { Field } from './field.js';
import { currentISODate } from './format.js';
/* =========================================================================================
 * 2. STORAGE PRIMITIVES, CONSTANTS & MIGRATION
 * ========================================================================================= */

/**
 * @typedef {object} DinSettings
 * @property {'auto' | 'light' | 'dark' | string} theme
 * @property {'form-a' | 'form-b' | string} layout
 * @property {boolean} [marks]
 * @property {boolean} [pluginTestbrief]
 * @property {boolean} [pluginGeschaeftsangaben] Addon „Geschäftsangaben" (§ 35a)
 * @property {string} [previewFont]
 * @property {'formal' | 'polite' | 'casual' | string} formality
 * @property {20 | 30 | number} [randU]
 * @property {{ x: number, y: number, scale: number, rot: number }} [signatureState]
 */

/**
 * Standard-Einstellungen für UI und Typografie.
 * @type {DinSettings}
 */
/* `layout.copyfit` ist am 2026-11-15 entfernt: es war ein Schalter fuer
 * Kompaktsatz (Schriftgroesse/Zeilenabstand stauchen, um eine Seite zu sparen)
 * und hatte nie einen Leser — nur Speicherfeld, Schema-Pruefung und
 * llms.txt-Beispiel. Alte Dateien mit `layout.copyfit` werden weiterhin
 * importiert: der Schluessel wird ignoriert, nicht abgelehnt. */
export const DEFAULT_SETTINGS = {
  theme: 'auto',
  layout: 'form-b',
  marks: true,
  pluginTestbrief: true,
  /* Addon „Geschäftsangaben" (§ 35a GmbHG + IBAN/BIC): aus, bis der Nutzer es
   * einschaltet. Ein Addon darf den Brief nicht von selbst veraendern. */
  pluginGeschaeftsangaben: false,
  previewFont: 'default',
  formality: 'formal',
  randU: 20
};

/**
 * Eine Semantik für gespeicherte Schalter (B65).
 *
 * Gespeichert wird echtes JSON-Boolean. **Nur ein explizites `false` schaltet
 * aus**; fehlt der Wert oder ist er `null`, gilt der Default der Einstellung —
 * für `marks` und `pluginTestbrief` ist das `true` (siehe DEFAULT_SETTINGS).
 *
 * Vorher lagen drei Semantiken nebeneinander: `asBool` (boot.js),
 * `!== false` (boot-state.js) und `Boolean()` (settings.js). Bei fehlendem
 * `pluginTestbrief` ergaben sie true / true / false — der Schalter sprang
 * beim Booten um, und `settings.js` überschrieb das Attribut mit dem
 * falschen Wert. `'false'` als String bleibt akzeptiert, damit ein von Hand
 * geschriebener Wert in localStorage nicht als „an" gelesen wird.
 *
 * `boot.js` und `boot-state.js` sind klassische Skripte und können nicht
 * importieren; sie tragen dieselbe Zeile lokal. Ein Test hält alle drei
 * Fassungen deckungsgleich (`test/all.js`, „Schalter-Semantik").
 *
 * @param {unknown} v
 * @returns {boolean}
 */
export const istAn = (v) => v !== false && v !== 'false';

/**
 * Zentrale LocalStorage-Schlüssel.
 */
export const STORAGE_KEYS = {
  draft: 'din_draft_current',
  settings: 'din_settings',
  geoapifyKey: 'din_geoapify_key',
  addresses: 'din_local_addresses',
  senderCoords: 'din_sender_coords',
  schema: 'din_schema_version'
};

/**
 * Liest einen Rohwert (String) aus dem LocalStorage.
 * @param {string} key
 * @param {string | null} [fallback]
 * @returns {string | null}
 */
export function load(key, fallback = null) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Schreibt einen Rohwert (String) in den LocalStorage.
 * @param {string} key
 * @param {string} value
 * @returns {boolean}
 */
export function save(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
...
46:export const DEFAULT_SETTINGS = {
80:export const istAn = (v) => v !== false && v !== 'false';
85:export const STORAGE_KEYS = {
100:export function load(key, fallback = null) {
114:export function save(key, value) {
128:export function remove(key) {
144:export function loadJSON(key, fallback) {
173:export function saveJSON(key, value) {
186:export function requestPersistentStorage() {
216:export function collectLetterIdentity() {
241:export function buildLetterFileName() {
256:export function isPrintTitleActive() {
260:export const MetadataService = {
361:export const DINLETTER_FORMAT = 'dinletter';
413:export const DOCUMENT_SCHEMA_V5 = [
429:export function stripHtmlToPlaintext(html) {
457:export function buildDinLetterPayload(draft, settings = null) {
516:export function parseDinLetterPayload(input) {
717:export function registerDraftCollector(collector) {
727:export function buildDINLetterJSON(draftCollector = null) {
759:export function applyImportedData(pendingImport, { reloadFn = () => location.reload() } = {}) {
806:export function initImportExport({ collectDraft } = {}) {
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && sed -n '1,80p' website/js/format.js && echo "=== depth/coupling: window/document usage count ===" && for f in website/js/*.js; do printf "%-32s dom=%s\n" "$f" "$(grep -c 'document\.\|window\.' $f)"; done
// @ts-check
// @adr [[ADR-JS]]
// @guide [[glossary]]

/**
 * @file format.js — Reine Formatierungsfunktionen nach DIN 5008 (Telefonnummern, Text-Formatierung).
 */
import { Field } from './field.js';

/**
 * Formatiert eine eingegebene Telefonnummer nach DIN 5008 11.3.2 (Funktions- und
 * Ortsnetz-Vorwahlen per Leerzeichen abgesetzt, Durchwahl mit Bindestrich).
 * @param {string | null | undefined} input
 * @returns {string}
 */
export function formatTelefonnummer(input) {
  const original = String(input ?? '').trim();
  if (!original) return '';

  // 1. Vorbereinigung: "(0)" auflösen, erlaubte Zeichen behalten, Leerraum normalisieren.
  const cleaned = original
    .replace(/\(\s*0\s*\)/g, ' ')
    .replace(/[^0-9+\-/ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return original;

  // 2. Internationale Nummern: 00XX -> +XX. Nur +49 wird national weitergereicht.
  if (cleaned.startsWith('+') || cleaned.startsWith('00')) {
    const intl = cleaned.replace(/^00(\d{2})/, '+$1');
    if (!intl.startsWith('+49')) return intl;
    const afterCc = intl.slice(3).replace(/[^0-9-]/g, '');
    if (!afterCc) return intl;
    const national = afterCc.startsWith('0') ? afterCc : `0${afterCc}`;
    const formatted = formatNationalNumber(national);
    return formatted ? `+49 ${formatted.slice(1)}` : intl;
  }

  // 3. Nationale Nummern nur mit führender 0 — sonst unangetastet lassen.
  if (!cleaned.startsWith('0')) return original;
  return formatNationalNumber(cleaned) ?? original;
}

/**
 * Formatiert eine nationale Rufnummer (führende 0) in Vorwahl + Rufnummer + Durchwahl.
 * @param {string} national
 * @returns {string | null} null, wenn keine verwertbare Nummer vorliegt
 */
function formatNationalNumber(national) {
  let s = national.replace(/\s+/g, ' ').trim();
  if (!/^0\d/.test(s.replace(/\D/g, ''))) return null;

  // Durchwahl: abschließender Bindestrich + höchstens 4 Ziffern ("0228 123456-78").
  // Ein längerer Rest nach dem Bindestrich ist ein Trenner ("0172-1234567"), keine Durchwahl.
  let durchwahl = '';
  const dwMatch = s.match(/^(.*\d)-(\d{1,4})$/);
  if (dwMatch) {
    s = dwMatch[1].trim();
    durchwahl = `-${dwMatch[2]}`;
  } else {
    // Durchwahl als letzte, per Leerzeichen abgetrennte 2er-Gruppe ("0228 123456 78").
    // Mobilnummern werden laut Vorgabe zu einer Gruppe zusammengefasst, daher dort nicht.
    // Die Gruppe davor muss eine plausible Rufnummer sein (>= 4 Ziffern), sonst würde
    // eine Gruppierung wie "0170 123 45 67" falsch als Durchwahl gelesen.
    const groups = s.split(' ');
    const isMobile = /^01[5-7]\d/.test(s.replace(/[\s/-]+/g, ''));
    if (!isMobile && groups.length >= 3) {
      const last = groups[groups.length - 1];
      const before = groups[groups.length - 2];
      if (/^\d{2}$/.test(last) && /^\d{4,}$/.test(before)) {
        s = groups.slice(0, -1).join(' ');
        durchwahl = `-${last}`;
      }
    }
  }

  // Vorwahl: endet am ersten Trenner (Leerzeichen, / oder -).
  const sepIndex = s.search(/[ /-]/);
  const head = sepIndex === -1 ? s : s.slice(0, sepIndex);
  const headDigits = head.replace(/\D/g, '');
=== depth/coupling: window/document usage count ===
website/js/addons.js             dom=0
website/js/address-data.js       dom=0
website/js/address.js            dom=21
website/js/binary-storage.js     dom=0
website/js/boot.js               dom=1
website/js/boot-state.js         dom=15
website/js/clipboard-parser.js   dom=6
website/js/core.js               dom=8
website/js/document.js           dom=58
website/js/draft-manager.js      dom=38
website/js/field.js              dom=0
website/js/font-feature.js       dom=21
website/js/format.js             dom=1
website/js/main.js               dom=29
website/js/multipage-controller.js dom=16
website/js/persistence.js        dom=19
website/js/salutation.js         dom=11
website/js/settings.js           dom=27
website/js/signature.js          dom=5
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -rn "fetchGzipJson\|orte.json\|grosskunden" website/js/*.js | head -20 && echo "=== gz sizes ===" && ls -l website/data/ && echo "=== initAddressServices ===" && grep -n "export function initAddressServices" -A 60 website/js/address.js | head -70
website/js/address-data.js:8: *  1. Native Gzip-Decompression (DecompressionStream API) von `orte.json.gz` und `grosskunden.json.gz`.
website/js/address-data.js:49: * @param {string} path Pfad relativ zum Dokument, z. B. 'data/orte.json.gz'
website/js/address-data.js:52:export async function fetchGzipJson(path) {
website/js/address-data.js:103: * @param {Map<string, GrosskundeEntry> | null} [grosskundenMap]
website/js/address-data.js:107:export function resolvePostcode(plz, plzToCityMap, grosskundenMap = null, statesMap = null) {
website/js/address-data.js:111:  const grosskunde = grosskundenMap?.get(normPlz) || null;
website/js/address-data.js:130: * @param {Map<string, GrosskundeEntry> | null} [grosskundenMap]
website/js/address-data.js:133:export function getDistrict(plz, districtsMap = null, grosskundenMap = null) {
website/js/address-data.js:135:  if (grosskundenMap?.has(plz)) return 'Großempfänger';
website/js/address-data.js:146: * @param {Map<string, GrosskundeEntry> | null} [grosskundenMap]
website/js/address-data.js:149:export function resolveCity(query, cityToPlzMap, plzToCityMap, limit = 10, districtsMap = null, grosskundenMap = null) {
website/js/address-data.js:161:      results.push({ plz, city: canonicalCity, district: getDistrict(plz, districtsMap, grosskundenMap) });
website/js/address-data.js:171:        results.push({ plz, city: canonicalCity, district: getDistrict(plz, districtsMap, grosskundenMap) });
website/js/address-data.js:301: * Erzeugt den durchsuchbaren Firmen- & Großkunden-Index aus grosskunden.json.gz (Case C).
website/js/address-data.js:303: * @param {Map<string, GrosskundeEntry>} grosskundenMap
website/js/address-data.js:305:export function buildFirmenIndex(grosskundenMap) {
website/js/address-data.js:311:  for (const [plz, info] of grosskundenMap.entries()) {
website/js/address-data.js:408:  static grosskunden = new Map();
website/js/address-data.js:446:    return getDistrict(plz, AddressIntelligence.districts, AddressIntelligence.grosskunden);
website/js/address-data.js:471:          return fetchGzipJson(relPath)
=== gz sizes ===
insgesamt 120
-rw-r--r-- 1 moritz moritz 52623  9. Nov 01:57 grosskunden.json.gz
-rw-r--r-- 1 moritz moritz 68329  9. Nov 12:54 orte.json.gz
=== initAddressServices ===
793:export function initAddressServices() {
794-  const inputGeoapifyKey = /** @type {HTMLInputElement | null} */ (feld('input-geoapify-key'));
795-  const statusEl = feld('geoapify-status');
796-  const inputAddressSearch = /** @type {HTMLInputElement | null} */ (feld('input-anschrift-suche'));
797-  const addressSuggestions = feld('anschrift-vorschlaege');
798-  const addressSearchContainer = feld('anschrift-suche-container');
799-
800-  if (!inputGeoapifyKey || !inputAddressSearch || !addressSuggestions || !addressSearchContainer) return;
801-
802-  /**
803-   * @param {'valid' | 'invalid' | 'pending' | 'error' | ''} status
804-   * @param {string} [text]
805-   */
806-  function setGeoapifyState(status, text = '') {
807-    if (inputGeoapifyKey) inputGeoapifyKey.dataset.status = status;
808-    if (statusEl) {
809-      statusEl.dataset.status = status;
810-      Field.setValue(statusEl, text);
811-    }
812-  }
813-
814-  /** @type {AbortController | null} */
815-  let activeAbortController = null;
816-  /* Zaehlt jede Eingabe im Suchfeld. Eine Antwort darf nur rendern, wenn ihre
817-   * Generation noch die aktuelle ist (B3-03): der Abort greift nur, wenn
818-   * danach ein NEUER Request startet — bei "Feld geleert" oder "< 3 Zeichen"
819-   * startet keiner, und die alte Antwort blieb stehen. */
820-  let suchGeneration = 0;
821-  /** @type {any} */
822-  let debounceSearchTimeout = null;
823-  /** @type {any} */
824-  let keyDebounceTimeout = null;
825-  /** @type {AddressEntry[]} */
826-  let renderedSuggestions = [];
827-  let activeSuggestionIndex = -1;
828-
829-  // Load initial settings
830-  const savedKey = load(STORAGE_KEYS.geoapifyKey, '') || '';
831-  inputGeoapifyKey.value = savedKey;
832-
833-  if (!savedKey) {
834-    setGeoapifyState('', '');
835-  } else {
836-    setGeoapifyState('valid', '✓ Key aktiv und gespeichert.');
837-    validateKeyWithHeartbeat(savedKey, { isInitial: true });
838-  }
839-
840-  // Key input handler with Heartbeat Validation
841-  inputGeoapifyKey.addEventListener('input', () => {
842-    clearTimeout(keyDebounceTimeout);
843-    const val = inputGeoapifyKey.value.trim();
844-
845-    if (!val) {
846-      save(STORAGE_KEYS.geoapifyKey, '');
847-      setGeoapifyState('', '');
848-      return;
849-    }
850-
851-    setGeoapifyState('pending', '⏳ Prüfe Key…');
852-    keyDebounceTimeout = setTimeout(() => {
853-      validateKeyWithHeartbeat(val);
> build · deepseek-v4.1-flash
[0m→ [0mRead website/js/address-data.js [90m[limit=120, offset=390][0m
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -rn "AddressIntelligence.init\|\.init()" website/js/address.js | head -20 && echo "=== initSenderSync ===" && grep -n "export function initSenderSync" -A 40 website/js/address.js
1342:  AddressIntelligence.init().then(() => {
=== initSenderSync ===
645:export function initSenderSync() {
646-  const infoName = feld('absender-name');
647-  const infoStreet = feld('absender-strasse');
648-  const infoCity = feld('absender-ort');
649-  const absender = feld('rucksendeangabe');
650-  const unterschrift = feld('unterschrift');
651-
652-  if (!infoName || !infoStreet || !infoCity || !absender || !unterschrift) return;
653-
654-  /** @param {HTMLElement | null} el @returns {string} */
655-  const lies = (el) => Field.getValue(el).trim();
656-
657-  /** @param {string} name @param {string} street @param {string} city */
658-  const baueRueckzeile = (name, street, city) =>
659-    [abbreviateName(name), street, city].filter((p) => p.length > 0).join(' • ');
660-
661-  /* Drei Zustaende statt Textvergleich. Textvergleich war die Ursache dafuer,
662-   * dass eine aus dem Entwurf geladene Zeile ("Light Yagami • …") als
663-   * Nutzertext galt und nie wieder mit Initialen geschrieben wurde
664-   * (gemessen 2026-11-12).
665-   *   unklar  — direkt nach dem Laden, wird beim ersten Sync entschieden
666-   *   auto    — der Helfer besitzt die Zeile und darf sie ersetzen
667-   *   manuell — der Nutzer hat sie angefasst; sie bleibt stehen
668-   * "manuell" entsteht durch jede Eingabe in das Feld, also auch durch
669-   * Loeschen: dann bleibt die Zeile leer. */
670-  /** @type {'unklar'|'auto'|'manuell'} */
671-  let rueckModus = 'unklar';
672-  /** @type {'unklar'|'auto'|'manuell'} */
673-  let unterschriftModus = 'unklar';
674-  /** @type {string|null} */
675-  let letzterAutowert = null;
676-  let schreibeGerade = false;
677-
678-  /** @param {HTMLElement | null} el @param {string} wert */
679-  const schreibe = (el, wert) => {
680-    if (!el) return;
681-    schreibeGerade = true;
682-    Field.setValue(el, wert);
683-    el.dispatchEvent(new Event('input', { bubbles: true }));
684-    schreibeGerade = false;
685-  };
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && echo "=== index.html size/lines ===" && wc -lc website/index.html && echo "=== data-* attributes in html (unique) ===" && grep -o 'data-[a-z0-9-]*' website/index.html | sort | uniq -c | sort -rn
=== index.html size/lines ===
  480 37021 website/index.html
=== data-* attributes in html (unique) ===
     28 data-atom
     11 data-font
      6 data-w
      4 data-addon
      3 data-x
      3 data-feldtyp
      3 data-addon-action
      2 data-right
      2 data-left
      2 data-h
      2 data-aktion
      2 data-addon-toggle
      2 data-addon-arg
      1 data-width-mm
      1 data-state
      1 data-plugin-geschaeftsangaben
      1 data-placeholder
      1 data-padding-top
      1 data-margin-top
      1 data-lochmarke-y
      1 data-layout
      1 data-kern-y-b
      1 data-kern-y-a
      1 data-infoblock-y-b
      1 data-infoblock-y-a
      1 data-height-mm
      1 data-gap
      1 data-font-state
      1 data-falzmarke-2-y-b
      1 data-falzmarke-2-y-a
      1 data-falzmarke-1-y-b
      1 data-falzmarke-1-y-a
      1 data-briefkopf-y-b
      1 data-briefkopf-y-a
      1 data-anschriftfeld-y-b
      1 data-anschriftfeld-y-a
> build · deepseek-v4.1-flash
[0m→ [0mRead website/js/address.js [90m[limit=70, offset=1320][0m
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -n "wireDOM\|initSenderSync\|AddressIntelligence" website/js/main.js website/js/address.js | grep -v "^\s*\*" | head -30
website/js/main.js:6:import { AddressIntelligence, initAddressServices, initSenderSync } from './address.js';
website/js/main.js:129:    AddressIntelligence.targetLock = null;
website/js/main.js:162:  bootStep('Absender-Sync', () => initSenderSync());
website/js/main.js:216:        AddressIntelligence.targetLock = null;
website/js/address.js:12: *  1. AddressIntelligence.wireDOM & initSenderSync: Offline PLZ- und Großempfänger-Engine.
website/js/address.js:18:  AddressIntelligence,
website/js/address.js:38:  AddressIntelligence,
website/js/address.js:147:AddressIntelligence.wireDOM = function wireDOM() {
website/js/address.js:199:          if (el === empfOrtEl) AddressIntelligence.targetLock = null;
website/js/address.js:230:      AddressIntelligence.targetLock = null;
website/js/address.js:239:      const res = AddressIntelligence.lookupPlz(plz);
website/js/address.js:242:        if (AddressIntelligence.targetLock?.city) {
website/js/address.js:243:          const allowedPlzs = AddressIntelligence.ortIndex.get(AddressIntelligence.targetLock.city) || [];
website/js/address.js:245:            const warn = `PLZ ${plz} gehört nicht zu ${AddressIntelligence.targetLock.city} – meinten Sie ${res.city}?`;
website/js/address.js:254:        AddressIntelligence.targetLock = { plz: res.plz, city: res.city };
website/js/address.js:283:      const matches = AddressIntelligence.lookupPrefix(prefix, 15);
website/js/address.js:295:      const res = AddressIntelligence.resolveCityInput(rawText, maxItems);
website/js/address.js:300:        AddressIntelligence.targetLock = { plz: res.plz, city: res.city };
website/js/address.js:336:        const matches = AddressIntelligence.firmenIndex ? AddressIntelligence.firmenIndex.search(rawText, maxItems) : [];
website/js/address.js:343:            district: AddressIntelligence.getDistrict(m.plz),
website/js/address.js:412:    for (const eintrag of ausklappen ? AddressIntelligence.lookupCityPlzs(item.city) : [item]) {
website/js/address.js:472:        const plzs = AddressIntelligence.lookupCityPlzs(item.city);
website/js/address.js:477:      AddressIntelligence.applySelection(item, ortEl, firmaEl, strasseEl);
website/js/address.js:478:      AddressIntelligence.targetLock = { city: item.city, plz: item.plz };
website/js/address.js:539:      const stateCode = item.state || (item.plz ? AddressIntelligence.getState(item.plz) : '');
website/js/address.js:645:export function initSenderSync() {
website/js/address.js:914:        const stadt = AddressIntelligence.plzToCity.get(q);
website/js/address.js:920:        const treffer = (AddressIntelligence.lookupPrefix(q, 8) || []).map((t) => {
website/js/address.js:927:      const res = AddressIntelligence.lookupUniversal(query, 8);
website/js/address.js:1129:    const lock = AddressIntelligence.targetLock;
> build · deepseek-v4.1-flash
[0m→ [0mRead website/css/sidebar.css [90m[limit=120, offset=150][0m
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && echo "=== input[switch] usages ===" && grep -rn 'input\[switch\]\|switch\]' website/css/*.css | head -30 && echo "=== :has count per file ===" && grep -c ':has(' website/css/*.css
=== input[switch] usages ===
website/css/sidebar.css:599:input[type="checkbox"][switch] {
website/css/sidebar.css:633:  input[type="checkbox"][switch] {
website/css/sidebar.css:669::root:not([data-seeded="true"]):not([data-ready="true"]) #seitenleiste input[switch] {
=== :has count per file ===
website/css/base.css:7
website/css/sheet-common.css:1
website/css/sheet.css:2
website/css/sheet-multipage.css:0
website/css/sidebar.css:11
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -rno '<din-[a-z-]*' website/index.html | sed 's/.*<//' | sort | uniq -c
1 din-anlagen-angabe
      1 din-anlagenvermerk
      1 din-anschriftfeld
      1 din-beglaubigungsvermerk
      1 din-bezugszeichen
      1 din-blatt
      1 din-briefkopf
      2 din-falzmarke-
      1 din-geschaeftsangaben
      1 din-infoblock
      1 din-kern
      1 din-lochmarke
      1 din-seitennummerierung
      1 din-text
      1 din-unternehmensbezeichnung
      1 din-verteilvermerk
      1 din-werbliche-elemente
      1 din-zusaetze
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -rn "customElements\|attachShadow\|shadowRoot" website/ tools/ test/ | head -20; echo "exit=$?"
exit=0
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && sed -n '1,120p' website/css/README.md
---

## 2. Kaskaden-Ablauf & Lade-Reihenfolge (Cascade Flow)

Die Stylesheets werden bewusst und ausschließlich über statische `<link rel="stylesheet">`-Tags im HTML-`<head>` von [`website/index.html`](file:///home/moritz/repos/DIN-BriefNEO/website/index.html) eingebunden:

```html
<!-- 1. Tokens, Basis-Reset & DIN-Mathematik (@function) -->
<link rel="stylesheet" href="css/base.css">

<!-- 2. UI-Shell, Sidebar-Steuerung, Dialoge & Popovers -->
<link rel="stylesheet" href="css/sidebar.css">

<!-- 3. Gemeinsame DIN-5008-Blattgeometrie & Faltmarken -->
<link rel="stylesheet" href="css/sheet-common.css">

<!-- 4. Blatt-Schnittstelle: fest mehrseitig (Einzelseiten-Modus stillgelegt) -->
<link rel="stylesheet" href="css/sheet-multipage.css">
```

### Cascade-Hierarchie:
1. **`base.css`**: Legt die CSS Custom Properties auf `:root` fest und deklariert die standardisierten mathematischen CSS Functions (`@function`).
2. **`sidebar.css`**: Definiert alle isolierten Bedienelemente außerhalb des Briefblatts. Beeinflusst das Blatt nicht (0 Custom-Property-Kollisionen).
3. **`sheet-common.css`**: Etabliert das Custom Element `<din-blatt>` als `container-type: inline-size` und berechnet DIN-Felder deterministisch via `attr(data-* type(<number>))` und `cqw`/`cqh`.
4. **`sheet.css` bzw. `sheet-multipage.css`**: Das spezialisierte Layout-Sheet vervollständigt den Kaskaden-Baum für den Inhaltskern (`#kern`, `#text`).

---

## 3. CSS-Schichten-Modell

```
┌────────────────────────────────────────────────────────────────────────┐
│ Layer 4: Utility-, Status- & Animations-Layer                          │
│   :root[data-theme], [data-plugin-*], [data-ueberlauf], @keyframes     │
└───────────────────┬────────────────────────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────────────────────────┐
│ Layer 3: UI- & Seitenleisten-Layer                                     │
│   sidebar.css (Toolbar, Popovers, Segmented Controls, Badges, Toast)   │
└───────────────────┬────────────────────────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────────────────────────┐
│ Layer 2: DIN-5008-Layout- & Blatt-Layer                                │
│   sheet-common.css · sheet.css · sheet-multipage.css                   │
│   (Form A/B Geometrie, Faltmarken, Paged Media @page, Print-Resets)    │
└───────────────────┬────────────────────────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────────────────────────┐
│ Layer 1: Reset- & Shell-Layer                                          │
│   base.css (#app-shell Grid, Viewport-Scroll, Focus-Rings)             │
└───────────────────┬────────────────────────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────────────────────────┐
│ Layer 0: Design-Tokens & Mathematische Funktionen                      │
│   base.css (:root OKLCH-Farben, Typografie-Stacks, @function Formeln)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Risiko-Prüfung & Neuralgische Punkte

### 4.1 Zirkuläre Importe & Lade-Konflikte
- **`@import`-Audit:** **0 Vorkommen.** Keine einzige Datei nutzt `@import`. Dadurch entfallen Netzwerkkaskaden und Latenzen auf dem Critical Rendering Path (FCP) vollständig.
- **Kein Sheet-Austausch mehr:** `sheet-multipage.css` ist fest verlinkt und damit render-blockierend — es gibt keinen Pfad mehr, auf dem ein zweites Layout nach dem ersten Paint nachrücken könnte.
  - Der Einzelseiten-Modus (`sheet.css`) ist stillgelegt, die Datei bleibt ungenutzt liegen: siehe [ADR-EINSEITEN-STILLGELEGT](file:///home/moritz/repos/DIN-BriefNEO/docs/10-architecture/ADR-EINSEITEN-STILLGELEGT.md).
  - Ein `link.href`-Tausch ist **nicht** render-blockierend; genau daran hing der gemessene FOUC (38 ms nackter Dokumentfluss, danach Blattlayout).

### 4.2 Custom Properties Single Source of Truth (SSoT)
- **Root-Definitionen:**
  - Alle 87 globalen Variablen sind auf `:root` bzw. `:root[data-theme]` in `base.css` deklariert (OKLCH Farbräume, Typografie, Schattierungen).
  - Variablen für die DIN-Geometrie (`--blatt-breite`, `--blatt-hoehe`, `--falzmarke-1-y`, `--infoblock-y`, etc.) werden exklusiv am Custom Element `din-blatt` gebunden.
- **Undeclared Variables Check:**
  - Alle Parameter (`--mm`, `--points`) sind Argumente nativer `@function`-Deklarationen.
  - Dynamische Variablen (`--sig-x`, `--sig-y`, `--sig-scale`, `--sig-rot`, `--i`) besitzen konsistente Fallback-Defaults (`var(--sig-x, 11.9cqw)`).
- **Namensraum-Kollisionen:**
  - Ein Kreuzvergleich zwischen den Custom Properties von `sidebar.css` und den Blatt-Stylesheets ergab exakt **0 Überschneidungen**. Komponenten überschreiben niemals versehentlich Blatt-Variablen.

### 4.3 Geometrie-Invarianz nach DIN 5008
- **Zentrale Maße Form A vs. Form B:**
  - Form B (Standard): Faltmarke 1 bei 105 mm, Anschriftfeld 45 mm, Infoblock Y = 40 mm.
  - Form A: Faltmarke 1 bei 87 mm, Anschriftfeld 27 mm, Infoblock Y = 32 mm.
- **Single Source of Truth im DOM:**
  - Die numerischen Maße stehen als HTML-Datenattribute am `<din-blatt>` (`data-falzmarke-1-y-b="105"`, `data-falzmarke-1-y-a="87"`).
  - [`sheet-common.css`](file:///home/moritz/repos/DIN-BriefNEO/website/css/sheet-common.css) transformiert diese Werte über `attr(... type(<number>))` und `@function --mm-y()` in relative Container-Units (`cqh`).
  - Es existieren **keine Millimeter-Dubletten** in `sidebar.css` oder JavaScript.

### 4.4 Print- vs. Screen-Isolierung
- **Druck-Resets:**
  - [`base.css`](file:///home/moritz/repos/DIN-BriefNEO/website/css/base.css) setzt im `@media print`-Block `color-scheme: light !important`, schaltet alle interaktiven Outlines ab und erzwingt `print-color-adjust: exact`.
  - [`sheet.css`](file:///home/moritz/repos/DIN-BriefNEO/website/css/sheet.css) und [`sheet-multipage.css`](file:///home/moritz/repos/DIN-BriefNEO/website/css/sheet-multipage.css) unterdrücken garantiert alle Bildschirmelemente:
    ```css
    aside, .nicht-drucken, [popover], #hinweis-v4, #font-uploader,
    .unterschriftsbild-griff, .unterschriftsbild-drehgriff,
    #anschriftfeld::after { display: none !important; }
    ```
- **Spezifitäts-Hygiene:**
  - `!important` wird fast ausschließlich im Print-Block verwendet, um Browser-Defaults (wie automatische Druckränder oder Farbinversionen) zu überschreiben. Screen-Styles kommen ohne Spezifitätskriege aus.

[showing lines 18-116 of 116; full output saved to /home/moritz/.local/share/opencode/shell/7a65242475c99ea523f0bbf34cad22dd092dd441/sh_1f93355d6001otG6PoS3cQbrLm.out]
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && for t in $(grep -o '<din-[a-z-]*' website/index.html | sed 's/<//' | sort -u); do n=$(grep -c "$t" website/css/*.css 2>/dev/null | awk -F: '{s+=$2} END {print s}'); echo "$t css_refs=$n"; done
din-anlagen-angabe css_refs=1
din-anlagenvermerk css_refs=6
din-anschriftfeld css_refs=0
din-beglaubigungsvermerk css_refs=0
din-bezugszeichen css_refs=0
din-blatt css_refs=19
din-briefkopf css_refs=0
din-falzmarke- css_refs=14
din-geschaeftsangaben css_refs=5
din-infoblock css_refs=0
din-kern css_refs=0
din-lochmarke css_refs=8
din-seitennummerierung css_refs=0
din-text css_refs=0
din-unternehmensbezeichnung css_refs=0
din-verteilvermerk css_refs=0
din-werbliche-elemente css_refs=0
din-zusaetze css_refs=0
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && echo "=== @layer ===" && grep -rn '@layer' website/css/*.css && echo "=== @scope ===" && grep -rn '@scope' website/css/*.css && echo "=== @function ===" && grep -rn '@function' website/css/*.css
=== @layer ===
website/css/sheet-multipage.css:67:@layer screen {
=== @scope ===
website/css/sheet-common.css:263:     Tönung aus dem gemeinsamen Feld-Chrom (@scope din-blatt) überstimmen. */
website/css/sheet-common.css:603:@scope (din-blatt) {
website/css/sheet.css:11: * Inline-Formate. 298 Zeilen, 23 x !important, ein @scope (din-blatt),
website/css/sheet.css:31: * - Ein @scope (din-blatt) überlappt mit dem gleichnamigen Scope in
website/css/sheet.css:72:@scope (din-blatt) {
website/css/sheet-multipage.css:120:@scope (din-blatt) {
website/css/sheet-multipage.css:539:       Spiegel: `@scope (din-blatt) :scope` setzt ausserhalb des Druckblocks
website/css/sheet-multipage.css:619:  @scope (din-blatt) {
=== @function ===
website/css/base.css:246:/* --- 3. DIN-MATHEMATIK (@function) --- */
website/css/base.css:247:@function --mm-rel-x(--mm) {
website/css/base.css:250:@function --mm-rel-y(--mm) {
website/css/base.css:253:@function --pt-rel(--points) {
website/css/base.css:257:@function --mm-x(--mm) {
website/css/base.css:260:@function --mm-y(--mm) {
website/css/base.css:263:@function --pt(--points) {
website/css/sheet.css:12: * null @function.
website/css/sheet.css:47: * - "Die @function-Namen kollidieren mit sheet-multipage.css": falsch. Diese
website/css/sheet.css:48: *   Datei enthält kein @function. Die Funktionen liegen in base.css (--mm-x,
website/css/sheet-multipage.css:39:@function --mm-abs-x(--mm) {
website/css/sheet-multipage.css:42:@function --mm-abs-y(--mm) {
website/css/sheet-multipage.css:45:@function --pt-abs(--points) {
website/css/sheet-multipage.css:49:@function --mm-x(--mm) {
website/css/sheet-multipage.css:52:@function --mm-y(--mm) {
website/css/sheet-multipage.css:55:@function --pt(--points) {
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && python3 - <<'EOF'
import re,glob
for f in sorted(glob.glob('website/css/*.css')):
    lines=open(f).read().split('\n')
    depth=0; inprint=[False]
    # crude: track @media print block by braces
    stack=[]
    counts={'print':0,'other':0}
    in_print_depth=None
    for i,l in enumerate(lines,1):
        if re.search(r'@media\s+print', l):
            in_print_depth=depth
        for c in l:
            if c=='{': depth+=1
            elif c=='}':
                depth-=1
                if in_print_depth is not None and depth<=in_print_depth:
                    in_print_depth=None
        if '!important' in l and not l.strip().startswith('*') and not l.strip().startswith('/*'):
            counts['print' if in_print_depth is not None else 'other']+=1
    print(f, counts)
EOF
website/css/base.css {'print': 14, 'other': 8}
website/css/sheet-common.css {'print': 0, 'other': 2}
website/css/sheet-multipage.css {'print': 40, 'other': 26}
website/css/sheet.css {'print': 16, 'other': 2}
website/css/sidebar.css {'print': 0, 'other': 3}
> build · deepseek-v4.1-flash
[0m→ [0mRead website/css/base.css [90m[limit=100, offset=240][0m
[0m→ [0mRead website/css/base.css [90m[limit=50, offset=1][0m
> build · deepseek-v4.1-flash
[0m→ [0mRead website/css/sheet-common.css [90m[limit=120, offset=560][0m
> build · deepseek-v4.1-flash
[0m→ [0mRead website/js/persistence.js [90m[limit=130, offset=241][0m
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && sed -n '1,60p' website/js/signature.js && echo "=== init ===" && grep -n "init()" -A 30 website/js/signature.js | head -45
// @ts-check
// @adr [[ADR-JS]] {SignatureFeature}
// @guide [[din-5008-css-architektur]]

/**
 * @file signature.js — Bild-Upload, Kompression, interaktives Drag/Resize/Rotate
 * und Persistenz der Unterschrift. Aus `settings.js` ausgelagert (2026-11-08):
 * die Signatur-Engine teilt fachlich nichts mit Theme- und Layout-Toggles.
 */

import { deleteBlob, loadBlob, saveBlob } from './binary-storage.js';
import { Constants, notify } from './core.js';

/** Typ-Referenz auf den SettingsManager (nur Typ, kein Laufzeit-Import). */
/** @typedef {import('./settings.js').SettingsManager} SettingsManager */

export class SignatureFeature {
  /**
   * @param {SettingsManager | { settings: any, updateSettings?: () => void } | null} [settingsManager]
   */
  constructor(settingsManager = null) {
    this.settingsManager = settingsManager;
    /** @type {any} */
    this.settings = settingsManager ? settingsManager.settings : {};
    this.imgElement = /** @type {HTMLImageElement | null} */ (document.getElementById('unterschriftsbild-vorschau'));
    this.uploader = /** @type {HTMLInputElement | null} */ (document.getElementById('unterschriftsbild-datei'));
    this.btnAktion = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-unterschrift-aktion'));
    
    /** @type {{x: number, y: number, scale: number, rot: number}} */
    this.state = { x: 11.9, y: 96.0, scale: 0.5, rot: 0 };

    this.bbox = document.getElementById('unterschriftsbild-box');
    this.container = document.getElementById('unterschriftsbild-container');

    // Config: Maximale Dimension für hochauflösende Druck-/PDF-Wiedergabe (< 15 KB WebP)
    this.MAX_DIM = 800;

    /** @type {string | null} */
    this.currentBlobUrl = null;
  }

  init() {
    if (!this.uploader || !this.imgElement) return;

    // Zero-Base64: Alte Base64-Signaturbilder aus Settings restlos bereinigen
    if (this.settings?.signatureImage) {
      this.settings.signatureImage = undefined;
      this.#saveSettings();
    }

    this.uploader.addEventListener('change', (e) => {
      const target = /** @type {HTMLInputElement} */ (e.target);
      const file = target?.files?.[0] ?? null;
      if (file) {
        this.processFile(file);
      }
      if (target) target.value = '';
    });

    if (this.btnAktion) {
=== init ===
42:  init() {
43-    if (!this.uploader || !this.imgElement) return;
44-
45-    // Zero-Base64: Alte Base64-Signaturbilder aus Settings restlos bereinigen
46-    if (this.settings?.signatureImage) {
47-      this.settings.signatureImage = undefined;
48-      this.#saveSettings();
49-    }
50-
51-    this.uploader.addEventListener('change', (e) => {
52-      const target = /** @type {HTMLInputElement} */ (e.target);
53-      const file = target?.files?.[0] ?? null;
54-      if (file) {
55-        this.processFile(file);
56-      }
57-      if (target) target.value = '';
58-    });
59-
60-    if (this.btnAktion) {
61-      this.btnAktion.addEventListener('click', () => {
62-        if (this.btnAktion?.dataset.state === 'loaded') {
63-          this.resetImage();
64-        } else {
65-          this.uploader?.click();
66-        }
67-      });
68-    }
69-
70-    this.initWysiwyg();
71-
72-    // Bild liegt als Blob in IndexedDB; der Restore ist async und erscheint nach dem Paint.
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -rn "dispatchEvent(new Event('input'\|dispatchEvent(new Event(\"input\"\|dispatchEvent(new Event('change'" website/js/ website/addons/ | cat
website/js/settings.js:182:    ziel.dispatchEvent(new Event('change', { bubbles: true }));
website/js/address.js:683:    el.dispatchEvent(new Event('input', { bubbles: true }));
website/js/document.js:315:  textEl.dispatchEvent(new Event('input', { bubbles: true }));
website/js/document.js:377:  textEl.dispatchEvent(new Event('input', { bubbles: true }));
website/js/document.js:536:      text.dispatchEvent(new Event('input', { bubbles: true }));
website/js/document.js:562:    text.dispatchEvent(new Event('input', { bubbles: true }));
website/js/document.js:716:      target.dispatchEvent(new Event('input', { bubbles: true }));
website/js/document.js:748:    target.dispatchEvent(new Event('input', { bubbles: true }));
website/js/main.js:292:      tel.dispatchEvent(new Event('input', { bubbles: true }));
website/js/clipboard-parser.js:475:      empfFirmaEl.dispatchEvent(new Event('input', { bubbles: true }));
website/js/clipboard-parser.js:480:      empfNameEl.dispatchEvent(new Event('input', { bubbles: true }));
website/js/clipboard-parser.js:485:      empfStrasseEl.dispatchEvent(new Event('input', { bubbles: true }));
website/js/clipboard-parser.js:490:      empfOrtEl.dispatchEvent(new Event('input', { bubbles: true }));
website/addons/webmcp-bridge.js:30:  el.dispatchEvent(new Event('input', { bubbles: true }));
website/addons/testbrief/testbrief.js:1002:  el.dispatchEvent(new Event('input', { bubbles: true }));
website/addons/testbrief/testbrief.js:1484:  text.dispatchEvent(new Event('input', { bubbles: true }));
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -rn "isTrusted" website/js/ website/addons/ | cat && echo "=== dataset as branch ===" && grep -rn "dataset\.[a-zA-Z]* *===\|dataset\.[a-zA-Z]* *!==" website/js/ website/addons/ | cat
website/js/address.js:197:         * 2026-11-12). `isTrusted` ist bei dispatchEvent() false. */
website/js/address.js:198:        if (ev.isTrusted) {
=== dataset as branch ===
website/js/signature.js:62:        if (this.btnAktion?.dataset.state === 'loaded') {
website/js/format.js:404:  const manuallySet = el.dataset.dirty === 'true' && Field.getValue(el).trim() !== '';
website/js/font-feature.js:346:        if (btn.dataset.fontState === 'loaded') {
website/js/address.js:105:  if (popoverEl.dataset.delegated === 'true') return;
website/js/address.js:153:  if (empfOrtEl.dataset.wired === 'true') return;
website/js/salutation.js:266:        if (anredeEl.dataset.dirty === 'true') {
website/js/salutation.js:277:        if (grussEl.dataset.dirty === 'true') {
website/js/salutation.js:309:    if (el.dataset.dirty === 'true' && current) return;
website/js/document.js:927:  if (datumFeld?.dataset.dirty === 'true') draft['datum__dirty'] = true;
website/js/draft-manager.js:296:      if (elem.dataset.feldtyp === 'systemwert' && elem.id !== 'datum') return;
website/js/core.js:214:    if (dom.global.dataset.type !== type) {
> build · deepseek-v4.1-flash
[0m→ [0mRead website/js/format.js [90m[limit=70, offset=385][0m
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && sed -n '230,300p' website/js/font-feature.js && echo "=== 330-360 ===" && sed -n '330,365p' website/js/font-feature.js
URL.revokeObjectURL(this.activeFontUrl);
      this.activeFontUrl = null;
    }
    this.activeFontUrl = URL.createObjectURL(fontBlob);
    const face = new FontFace('CustomUserFont', `url(${this.activeFontUrl})`);
    try {
      await face.load();
    } catch (e) {
      console.warn('[FontFeature] Custom font invalid:', e);
      URL.revokeObjectURL(this.activeFontUrl);
      this.activeFontUrl = null;
      notify(Constants.TOASTS.FONT.FORMAT_ERROR, 'error');
      this.updateFontStatusUI(false);
      return false;
    }
    if (typeof document.fonts !== 'undefined') {
      for (const f of Array.from(document.fonts)) {
        if (f.family === 'CustomUserFont') {
          document.fonts.delete(f);
        }
      }
    }
    document.fonts.add(face);
    this.activeFontFace = face;
    this.updateFontStatusUI(true);
    return true;
  }

  /**
   * @param {boolean} hasCustomFont
   */
  updateFontStatusUI(hasCustomFont) {
    const btn = /** @type {HTMLButtonElement | null} */ (this.btnFontAction);
    const apply = () => {
      if (hasCustomFont) {
        document.documentElement.style.setProperty('--active-font-family', "'CustomUserFont', var(--font-system-stack)");
        if (btn) {
          /* Ein Zustandsattribut: `data-font-state` ist das, was CSS und
             index.html lesen. `data-schrift-modus` fuehrte denselben Zustand
             ein zweites Mal (B8-Review 2026-11-12). */
          btn.dataset.fontState = 'loaded';
          btn.textContent = '🗑️ Eigene Schrift entfernen';
        }
      } else {
        this.#applyPresetCss(this.settings.previewFont || 'default');
        if (btn) {
          btn.dataset.fontState = 'empty';
          btn.textContent = '🔤 Eigene Schriftart laden';
        }
      }
    };
    if (this.isReady && btn) {
      transitionOn(btn, apply);
    } else {
      apply();
    }
  }

  /**
   * Schaltet zwischen lokalen Test-Schriftarten (Inter, Aptos, Michelangelus)
   * und dem Standard-System-Stack um.
   * @param {string} val
   */
  applyFontPreset(val) {
    /* Systemschriften laufen an den Presets vorbei: `sys:<Familie>` wird als
       FontFace geladen, nicht als fester Stack. */
    if (typeof val === 'string' && val.startsWith('sys:')) {
      const family = val.slice(4);
      this.settings.previewFont = val;
      void this.#applySystemFont(family);
      this.#saveSettings();
=== 330-360 ===
    if (this.fontUploader) {
      this.fontUploader.value = '';
    }
  }

  attachListeners() {
    if (this.selectFont) {
      this.selectFont.addEventListener('change', (e) => {
        const val = /** @type {HTMLSelectElement} */ (e.target).value;
        this.applyFontPreset(val);
      });
    }

    if (this.btnFontAction) {
      this.btnFontAction.addEventListener('click', () => {
        const btn = /** @type {HTMLButtonElement} */ (this.btnFontAction);
        if (btn.dataset.fontState === 'loaded') {
          this.resetFont();
        } else {
          this.fontUploader?.click();
        }
      });
    }

    if (this.fontUploader) {
      this.fontUploader.addEventListener('change', (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        const file = target?.files?.[0] ?? null;
        if (!file) return;
        const validExtensions = ['.woff2', '.ttf', '.otf'];
        const isValid = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
        if (!isValid) {
          notify(Constants.TOASTS.FONT.FORMAT_ERROR, 'error');
          target.value = '';
          return;
        }
> build · deepseek-v4.1-flash
[0m→ [0mRead website/js/address.js [90m[limit=80, offset=680][0m
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -rn "data-quelle\|data-autofilled\|data-autofill-aus" website/js/ website/addons/ website/css/ | cat
website/js/address.js:186:  // Schutz vor Überschreiben: Manuelle Tastatureingaben entfernen data-autofilled
website/js/address.js:192:        el.removeAttribute('data-autofilled');
website/js/address.js:194:         * data-autofill-aus auf. Sonst loescht ein programmatisch gefuelltes
website/js/address.js:200:          el.removeAttribute('data-autofill-aus');
website/js/address.js:211:    if (empfOrtEl.hasAttribute('data-autofill-aus')) return;
website/js/address.js:252:        empfOrtEl.setAttribute('data-autofilled', 'true');
website/js/address.js:258:          if (empfFirmaEl && (!Field.getValue(empfFirmaEl).trim() || empfFirmaEl.getAttribute('data-autofilled') === 'true')) {
website/js/address.js:260:            empfFirmaEl.setAttribute('data-autofilled', 'true');
website/js/address.js:299:        empfOrtEl.setAttribute('data-autofilled', 'true');
website/js/address.js:323:      if (empfFirmaEl.hasAttribute('data-autofill-aus')) return;
website/js/address.js:718:      if (rueckModus === 'unklar') absender.removeAttribute('data-quelle');
website/js/address.js:743:    /* Die Herkunft steht im Entwurf (`data-quelle`), also nicht raten: nur
website/js/address.js:745:    const gespeichert = absender?.getAttribute('data-quelle');
website/js/address.js:1353:      if (absenderPlzOrtEl.hasAttribute('data-autofill-aus')) return;
website/js/address-data.js:997:      ortEl.setAttribute?.('data-autofilled', 'true');
website/js/address-data.js:1003:      ortEl.setAttribute?.('data-autofilled', 'true');
website/js/address-data.js:1007:      firmaEl.setAttribute?.('data-autofilled', 'true');
website/js/document.js:912:    const quelle = elem.getAttribute('data-quelle');
website/js/draft-manager.js:278:    document.querySelectorAll('[data-quelle]').forEach(el => {
website/js/draft-manager.js:279:      el.removeAttribute('data-quelle');
website/js/draft-manager.js:484:    document.querySelectorAll('[data-quelle]').forEach(el => {
website/js/draft-manager.js:485:      el.removeAttribute('data-quelle');
website/addons/testbrief/testbrief.js:991:  if (SPERRE_FELDER.has(id)) el.setAttribute('data-autofill-aus', 'true');
website/addons/testbrief/testbrief.js:1335:    ruecksende.removeAttribute('data-quelle');
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && printf "%-40s %8s\n" DATEI BYTES && for f in website/js/main.js website/js/address.js website/js/address-data.js website/js/clipboard-parser.js website/js/document.js website/js/draft-manager.js website/js/persistence.js website/js/settings.js website/js/salutation.js website/js/signature.js website/js/font-feature.js website/js/format.js website/js/core.js website/js/field.js website/js/addons.js website/js/binary-storage.js website/addons/testbrief/testbrief.js website/addons/geschaeftsangaben/geschaeftsangaben.js website/addons/verlauf/verlauf.js; do printf "%-40s %8s\n" "$f" "$(stat -c%s $f)"; done && echo "--- sum static boot path ---" && cat website/js/main.js website/js/addons.js website/js/address.js website/js/address-data.js website/js/clipboard-parser.js website/js/binary-storage.js website/js/core.js website/js/document.js website/js/draft-manager.js website/js/field.js website/js/font-feature.js website/js/format.js website/js/persistence.js website/js/salutation.js website/js/settings.js website/js/signature.js | wc -c
DATEI                                       BYTES
website/js/main.js                          12550
website/js/address.js                       52178
website/js/address-data.js                  39369
website/js/clipboard-parser.js              24104
website/js/document.js                      36483
website/js/draft-manager.js                 22163
website/js/persistence.js                   32642
website/js/settings.js                      14383
website/js/salutation.js                    12003
website/js/signature.js                     12408
website/js/font-feature.js                  13787
website/js/format.js                        16913
website/js/core.js                          11694
website/js/field.js                           847
website/js/addons.js                         5682
website/js/binary-storage.js                 4671
website/addons/testbrief/testbrief.js       62110
website/addons/geschaeftsangaben/geschaeftsangaben.js     5449
website/addons/verlauf/verlauf.js           12872
--- sum static boot path ---
311877
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -n "zonedDateTimeISO\|dateStyle: 'long'\|formatLetterDate\|currentISODate" website/js/format.js website/js/boot-state.js website/js/persistence.js | cat
website/js/format.js:194:      return pd.toLocaleString('de-DE', { dateStyle: 'long' });
website/js/format.js:369:export function currentISODate() {
website/js/format.js:371:    return Temporal.Now.zonedDateTimeISO('Europe/Berlin').toPlainDate().toString();
website/js/format.js:373:    console.warn('[DateFormat] currentISODate fehlgeschlagen:', err);
website/js/format.js:382:export function formatLetterDate() {
website/js/format.js:384:    const iso = currentISODate();
website/js/format.js:388:    console.warn('[DateFormat] formatLetterDate fehlgeschlagen:', err);
website/js/format.js:406:  const formatted = formatLetterDate();
website/js/boot-state.js:154:       gleiche Quelle wie currentISODate(), also Temporal mit expliziter Zone
website/js/boot-state.js:160:      datum.value = Temporal.Now.zonedDateTimeISO('Europe/Berlin')
website/js/boot-state.js:162:        .toLocaleString('de-DE', { dateStyle: 'long' });
website/js/persistence.js:19:import { currentISODate } from './format.js';
website/js/persistence.js:204: * @property {string} dateStr       ISO-Datum (zoniert, via currentISODate)
website/js/persistence.js:217:  const dateStr = currentISODate();
website/js/persistence.js:461:    generatedAt = Temporal.Now.zonedDateTimeISO('Europe/Berlin').toString();
website/js/persistence.js:463:    generatedAt = `${currentISODate()}T00:00:00+01:00`;
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && echo "=== test contract for seeder/dedup ===" && grep -n "Draft-Feld-Selektor\|Schalter-Semantik\|seeder" test/all.js | head -20 && echo "=== DECISION-LOG size ===" && wc -l docs/30-meta/DECISION-LOG.md 2>/dev/null || find docs -name 'DECISION-LOG.md'
=== test contract for seeder/dedup ===
5268:describe('Schalter-Semantik: eine Regel statt drei (B65)', () => {
5290:    const seeder = await (await fetch('/website/js/boot-state.js')).text();
5292:    assert(seeder.includes(zeile), 'boot-state.js: istAn-Zeile');
5303:describe('Draft-Feld-Selektor bleibt deckungsgleich (B69)', () => {
=== DECISION-LOG size ===
docs/meta/DECISION-LOG.md
> build · deepseek-v4.1-flash
[0m→ [0mRead test/all.js [90m[limit=80, offset=5260][0m
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && ls docs/10-architecture/ && echo "---" && sed -n '1,80p' docs/10-architecture/ADR-KISS-MINIMAL-JS.md
ls: Zugriff auf 'docs/10-architecture/' nicht möglich: Datei oder Verzeichnis nicht gefunden
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && find docs -maxdepth 2 -type d | sort && echo "---ADR files---" && find docs -iname '*ADR*' | sort | head -30
docs
docs/addons
docs/archive
docs/archive/legacy-readmes
docs/archive/todo-2026-11
docs/css
docs/data
docs/fonts
docs/js
docs/meta
docs/norm
---ADR files---
docs/css/ADR-CSS.md
docs/css/ADR-MESS-SCHLEIFE.md
docs/data/ADR-COLUMNAR-DATA.md
docs/data/ADR-OFFLINE-ADDRESS-INTELLIGENCE.md
docs/fonts/ADR-TYPOGRAPHY.md
docs/js/ADR-ANLAGEN-TEXTAREA.md
docs/js/ADR-BINARY-ASSETS.md
docs/js/ADR-CONTENTEDITABLE-MIGRATION.md
docs/js/ADR-DATA-PERSISTENCE.md
docs/js/ADR-EVENT-DRIVEN-ARCHITECTURE.md
docs/js/ADR-JS.md
docs/js/ADR-RUNTIME-CONTEXT.md
docs/js/ADR-SENDER-SYNCHRONIZATION.md
docs/js/ADR-TOAST-SYSTEM.md
docs/norm/ADR-ANTIPATTERN.md
docs/norm/ADR-EINSEITEN-STILLGELEGT.md
docs/norm/ADR-HTML.md
docs/norm/ADR-KISS-MINIMAL-JS.md
docs/norm/ADR-OMNITRACEABILITY.md
> build · deepseek-v4.1-flash
[0m→ [0mRead docs/norm/ADR-KISS-MINIMAL-JS.md 
[0m→ [0mRead docs/norm/ADR-ANTIPATTERN.md 
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && sed -n '1375,1410p' website/addons/testbrief/testbrief.js
delete anredeEl.dataset.dirty;
  }
  const grussEl = document.getElementById('grussformel');
  if (grussEl) {
    delete grussEl.dataset.dirty;
  }

  // Zusatzblöcke: Anlagen dynamisch steuern
  const anlagenToggle = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-anlagen'));
  const anlagenText = resolveAnlagenEintrag(szenario, themenHook);
  /* Ueber setField, wie alle anderen Felder: sonst gilt jede spaetere
     Ergaenzung dort (z. B. Sperren, Events) fuer Anlagen und Postvermerk
     nicht (Review 2026-11-12). */
  if (anlagenText) {
    if (anlagenToggle) anlagenToggle.checked = true;
    document.documentElement.setAttribute('data-anlagen', 'true');
    setField('anlagen-angabe', anlagenText);
  } else {
    if (anlagenToggle) anlagenToggle.checked = false;
    document.documentElement.setAttribute('data-anlagen', 'false');
    setField('anlagen-angabe', '');
  }

  const fussToggle = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-fuss'));
  if (fussToggle) {
    fussToggle.checked = false;
  }
  document.documentElement.setAttribute('data-fuss', 'false');

  // Postvermerk dynamisch steuern
  const postvermerk = resolvePostvermerk(szenario);
  const postvermerkField = document.getElementById('vermerke');
  const pvSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('seitenleiste-postvermerk-select'));
  const triggerLabel = document.getElementById('postvermerk-trigger-label');
  const triggerBtn = document.getElementById('btn-postvermerk-trigger');
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && echo "=== data-anlagen writers ===" && grep -rn "data-anlagen" website/js/ website/addons/*/*.js website/css/*.css | cat && echo && echo "=== data-fuss writers ===" && grep -rn "data-fuss" website/js/ website/addons/*/*.js website/css/*.css | cat
=== data-anlagen writers ===
website/js/boot.js:75:  root.setAttribute('data-anlagen', hatAnlagen ? 'true' : 'false');
website/js/draft-manager.js:364:    document.documentElement.setAttribute('data-anlagen', anlagenSwitch?.checked ? 'true' : 'false');
website/js/draft-manager.js:468:    document.documentElement.setAttribute('data-anlagen', 'false');
website/js/main.js:243:        document.documentElement.setAttribute('data-anlagen', anlagenSwitch.checked ? 'true' : 'false');
website/addons/testbrief/testbrief.js:1390:    document.documentElement.setAttribute('data-anlagen', 'true');
website/addons/testbrief/testbrief.js:1394:    document.documentElement.setAttribute('data-anlagen', 'false');
website/css/sheet.css:284::root[data-anlagen="true"] din-anlagenvermerk {
website/css/sheet-multipage.css:450:/* Sichtbarkeit ueber Root-Attribut data-anlagen (ADR-KISS-MINIMAL-JS).
website/css/sheet-multipage.css:452::root[data-anlagen="true"] din-anlagenvermerk,
website/css/sheet-multipage.css:453::root[data-anlagen="true"] #anlagenvermerk {
website/css/sheet-multipage.css:608:  :root:not([data-anlagen="true"]) din-anlagenvermerk,
website/css/sheet-multipage.css:609:  :root:not([data-anlagen="true"]) #anlagenvermerk {

=== data-fuss writers ===
website/js/boot.js:76:  root.setAttribute('data-fuss', hatFuss ? 'true' : 'false');
website/js/draft-manager.js:382:    document.documentElement.setAttribute('data-fuss', fussSwitch?.checked ? 'true' : 'false');
website/js/draft-manager.js:469:    document.documentElement.setAttribute('data-fuss', 'false');
website/js/main.js:254:      document.documentElement.setAttribute('data-fuss', fussSchalter.checked ? 'true' : 'false');
website/addons/testbrief/testbrief.js:1402:  document.documentElement.setAttribute('data-fuss', 'false');
website/css/sheet-common.css:184::root[data-fuss="true"] din-geschaeftsangaben,
website/css/sheet-common.css:185::root[data-fuss="true"] #geschaeftsangaben {
website/css/sheet-common.css:189::root[data-fuss="true"] {
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -rn "DOM als\|State-Store\|Spezifit\|spezifit\|Boot-Pfad\|boot path\|Lazy\|lazy" docs/meta/*.md docs/norm/*.md 2>/dev/null | head -30 && echo "=== todo/backlog ===" && ls docs/archive/todo-2026-11/ 2>/dev/null | head
docs/meta/BACKLOG.md:242:Klick geladen, **nie** im Boot-Pfad. Ein Addon darf den Kern nicht voraussetzen
docs/meta/BACKLOG.md:288:`website/addons/`, geladen per `import()` beim Klick, **nicht** im Boot-Pfad
docs/meta/BACKLOG.md:309:**Bedingung:** nur lazy laden (beim Fokussieren des BIC-Felds), nicht beim
docs/meta/DECISION-LOG.md:569:1. **`.dinletter` (52-import-export.js, neu):** JSON-Format mit Header `format/schema_version/app/created/tool` + Draft-Payload 1:1 aus `din_draft_current`. Export schreibt erst den Live-Draft (`onSaveDraft`) und lädt via Blob-Download (Dateiname = `buildLetterFileName()`). Import: File-Input → Validierung → Confirm-Dialog → `localStorage` + `location.reload()` — Restore läuft ausschließlich über den bewährten Boot-Pfad (EIN Owner, C1-Lektion). Pure Funktionen (`buildDinLetterPayload`/`parseDinLetterPayload`) sind unit-getestet (Roundtrip + 5 Fehlerfälle). `created` via `currentISODate()` (A48 — ein versehentlicher `new Date()`-Versuch wurde noch im Editor abgefangen).
docs/meta/DECISION-LOG.md:659:**Umgesetzt:** (1) `reset.css`: `-moz-osx-font-smoothing: grayscale` entfernt — Firefox-only, in Chromium No-op (Chrome-only-Baseline). (2) `reset.css`: `html { color-scheme: light dark }` entfernt — war von `:root { color-scheme: light dark }` (`variables.css:16`; höhere Spezifität *und* spätere Lage, gleiches Element) vollständig verdeckt. (3) `reset.css`: UI-Font-Literal durch `var(--font-active-stack)` ersetzt (SSOT; Token wird nie mutiert, Custom-Font läuft über `body.font-custom-active` via `02-settings-manager.js:145`). (4) `#btn-font-action`-Visualblock von `signature.css` nach `sidebar.css` verschoben (Schriftarten-Manager-CSS gehört nicht zur Unterschrift; beide `layout`-Layer → kaskadisch neutral, kein Konkurrenz-Selektor, vorher per grep verifiziert).
docs/meta/DECISION-LOG.md:665:**Generalisierbarkeit:** Für `llm_boilerplate`: (a) bei Chrome-only-Baseline Vendor-Prefixe der Nicht-Ziel-Engines (`-moz-*`) als toten Ballast entfernen; (b) doppelte `color-scheme`-Deklarationen sind still verdeckt (`:root` schlägt `html` per Spezifität) — eine Theme-Quelle; (c) Datei-Organisation nach Feature statt Historie: Layout-Layer-Moves sind kaskadisch neutral, solange kein gleichspezifischer Konkurrenz-Selektor existiert — vorher per grep prüfen.
docs/meta/DECISION-LOG.md:1618:6. **B8-Abschluss (CSS `!important`):** Alle 12 Non-Print-`!important` in Autoren-Styles wurden restlos aufgelöst. Verfehlt platzierte Seitenleisten-Labels wanderten nach `sidebar.css`, DIN-Elemente nach `sheet.css`, Postvermerk-Styling in `layout.css` wurde konsolidiert und `.hidden` über native Spezifität und Layer-Hierarchie gelöst.
docs/meta/DECISION-LOG.md:1676:3. `#commandButtons-Map` durch direkte `querySelector`-Refs ersetzt — Lazy-Lookup unnötig, 5 Zeilen gespart.
docs/meta/DECISION-LOG.md:1686:- Button-Cache mit Lazy-Lookup ist Overhead: direkte `querySelector`-Refs sind schneller und einfacher.
docs/meta/DECISION-LOG.md:1983:Historisch war das CSS in 8 separate Dateien fragmentiert (`variables.css`, `reset.css`, `layers.css`, `layout.css`, `sidebar.css`, `sheet.css`, `signature.css`, `floating.css`, `print.css`). Diese Zerstückelung führte zu unübersichtlichen Kaskaden-Abhängigkeiten, zirkulären Spezifitäts-Fixes zwischen `layout.css` und `floating.css` sowie übermäßigem Kontextaufwand bei Änderungen. Zudem erforderten Änderungen an gemeinsamen UI-Komponenten parallele Edits in bis zu 4 Dateien.
docs/meta/DECISION-LOG.md:2598:nötig) und das fehlende `data-erscheinungsbild` im Boot-Pfad (kosmetisch).
docs/meta/DECISION-LOG.md:3105:**Anlass.** Das Faktenblatt zum Boot-Pfad behauptete „12 von 12 Läufen vor dem
docs/meta/DECISION-LOG.md:3356:| Stelle | Ziel | am Boot-Pfad? |
docs/meta/DECISION-LOG.md:3359:| `:288`, `:302`, `:314` | `../addons/testbrief/testbrief.js` | nein, lazy im Klick-Handler |
docs/meta/DECISION-LOG.md:3398:Spezifität **(3,1,0)** (`#seitenleiste` + `:has(#modus-einstellungen:checked)`
docs/meta/DECISION-LOG.md:3579:der Datei, gleiche Spezifität, also gewinnt er".
docs/meta/DECISION-LOG.md:3700:Basisregel `#seitenleiste`. Gleiche Spezifität, spätere Deklaration gewinnt —
docs/meta/PERFEKTER-PROMPT.md:158:**Warum Pflicht:** Ohne sie baue ich auf Rot weiter. Der Adressdaten-Lazy-Load
docs/meta/PERFEKTER-PROMPT.md:300:| „Wenn Gate rot: zurückrollen, Ursache melden" | Verhindert Bauen auf Sand | Adressdaten-Lazy-Load zurückgerollt |
docs/norm/ARCHITECTURE-MAP.md:95:Reihenfolge zählt: Spätere Dateien überschreiben frühere bei gleicher Spezifität.
=== todo/backlog ===
01-mehrseiten-plan.md
03-mobile-ansicht-plan.md
05-brief-history-verlauf-plan.md
07-addon-copyfitting-plan.md
08-testbrief-erzaehlung-plan.md
09-text-parsing-modernization-plan.md
13-review-2026-11-06-optimierungen.md
14-format-grundbausteine-review.md
15-overengineering-review.md
16-deklarativ-review.md
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -n "data-\|Attribut\|Seeder\|FOUC" docs/meta/BACKLOG.md | head -30 && echo "=== open items ===" && grep -n "^### B[0-9]\|^## " docs/meta/BACKLOG.md | tail -40
82:**Kontext:** Nach der Geometrie-SSoT-Migration (Commit `1a6dba0`) leben alle statischen DIN-5008-Werte als `data-*`-Attribute im HTML.
86:  - Jedes `attr(data-X)` besitzt eine entsprechende HTML-Quelle am zugehörigen Element
120:- **Bestand:** 35 echte Duplikate wurden in B88 bereits eliminiert. Die verbleibenden 90 sind unvermeidbare Barrieren (Print-Isolation, FOUC-Schutz, `prefers-reduced-motion`, `[hidden]`, `#spacer`).
360:**Problem:** Die Rücksendezeile steht 5,7–6,8 mm und die Empfängeranschrift 12,1 mm zu hoch (gemessen 2026-11-11). `data-anschriftfeld-y` trifft die DIN-Rücksendezeile auf 0,1–0,2 mm, wird aber als Beginn der Adresszone gelesen; `#vermerke` reserviert die 17,7-mm-Zone nicht (`display: none`). Optionen A/B/C stehen in `docs/10-architecture/IMR-Registry.md` §2a.
=== open items ===
51:## Übersicht
77:## 🏗️ Architektur & Technik
81:### B22 · Automatisierter Guard gegen hartcodierte Geometriewerte (`tools/check-geometry.js`) · **M** · ⭐⭐
93:### B40 · Vier vorbestehende Testfehler dokumentieren · **M** · ⭐⭐
107:### B58 · Gzip/Minify als Abschluss-Option · **S** · ⭐
115:### B59 · Kaskade über `@layer` statt `!important` · **M** · ⭐
123:### B93 · `targetLock` wird viermal geleert — Redundanz **nicht** bewiesen · **S** · ⭐
154:### B80 · Export als `.txt` und `.md` · **S** · ⭐⭐
159:### B81 · Multi-Tab: das Restrisiko benennen oder abschaffen · **S** · ⭐
180:### B84 · `ClipboardAddressParser` bewerten: behalten oder aufteilen · **M** · ⭐⭐
185:## ✨ Neue Features
190:### B25 · Vorkonfigurierte Brief-Vorlagen (JSON-Muster) · **M** · ⭐⭐⭐
199:### B26 · Optionale DIN-5008-Validatoren (Anschrift-Zeilenlimit & IBAN) · **S** · ⭐⭐
215:### B31 · Native Browser-APIs: LocalFonts API (Systemschriften), EyeDropper & showPicker · **S** · ⭐⭐
224:### B33 · DIN-5008-Telefonnummer-Formatierer (Expliziter Button) · **S** · ⭐⭐⭐
234:### B87 · Text- und Adress-Parsing modernisieren (Konzept) · **M** · ⭐
239:## 🧩 Addons
245:### B32 · Brief-Verlauf und zwei Adressbücher (Addon `verlauf`) · **S** · ⭐⭐⭐⭐
285:### B76 · PDF-Export als Addon · **M** · ⭐⭐
291:### B91 · BIC → Bankname als Erweiterung (Addon) · **M** · ⭐⭐
326:### B38 · Chromium klemmt Rahmenbreiten unter 1px auf 1px · **N** · ⭐
339:### B94 · Batch 06 auswerten: Layer-Kaskade · **S** · ⭐⭐
349:### B95 · Batch 07 auswerten: PDF-Export (Bibliothek oder Browser?) · **S** · ⭐⭐
358:### B85 · Anschriftfeld-Geometrie: DIN Tab. B.1 oder bewusste Abweichung? · **M** · ⭐⭐⭐
> build · deepseek-v4.1-flash
[0m→ [0mRead docs/meta/BACKLOG.md [90m[limit=45, offset=107][0m
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && ls tools/ | head -40 && echo "=== geometry attr guard? ===" && grep -rln "data-briefkopf-y\|data-width-mm" tools/ test/ | head
adr-check.js
agent_gateway.py
antipatterns
backlog-sync.mjs
batch-facts.mjs
boilerplate.config.json
browser-audit.html
browser.mjs
build_db.js
build_grosskunden_columnar.mjs
build_plz_data.mjs
check-feature.js
data
debug-session.mjs
dev_server.ps1
dev.sh
druck-pixel.mjs
filematch.js
geometrie-zustaende.mjs
id-register.js
imr.js
isolation.js
lawcoverage.js
links.js
mess.js
mess.mjs
mess-print.mjs
og-image.mjs
paint-probe.mjs
print-messung.mjs
query_chrome_feature.mjs
README.md
reconciliation.js
repo-map-check.mjs
seeder-diff.mjs
seed-geoapify.mjs
serve.mjs
setup-din-home.ps1
setup-din-home.sh
start.bat
=== geometry attr guard? ===
tools/imr.js
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -rn "attr(" test/all.js | head -20; echo "---"; grep -rn "geometry\|Geometrie" test/all.js | head -20
1719:    assert(block.includes('height: --mm-abs-y(attr(data-h'), 'Hoehe bleibt data-h (45mm)');
---
1551:    // Geometrie: linke Kante 25mm + Textbreite 80mm = Zeilenende 105mm
1569:    // Die Geometrie kommt weiterhin aus data-h (15mm) und der Print-Regel.
1687:  it('erbt Geometrie vom Container und behaelt 45mm Blockhoehe', async () => {
1689:    /* Paket A: das Feld ist ein <input>; die Geometrie kommt weiter aus dem
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && head -40 tools/geometrie-zustaende.mjs && echo "=== imr.js head ===" && head -40 tools/imr.js
/**
 * tools/geometrie-zustaende.mjs — Bildschirm-Geometrie in 8 Zustaenden.
 *
 * Zweck: „hat diese CSS-Aenderung das Layout verschoben?" beantworten, ohne
 * Screenshot. 2 Formen × `data-seiten` fehlt/1/2/3, je Zustand die
 * getBoundingClientRect und die relevanten computed styles von `#viewport`,
 * `#brief-ansicht`, `din-blatt`, `#kern`, `#seitenleiste`.
 *
 * Warum ein fester Entwurf im Skript steht: der Vorgaenger (b92-screen.mjs)
 * hat den Entwurf NICHT gesetzt. Jeder Lauf sah einen anderen Draft, damit
 * eine andere Seitenzahl, und der Vergleich meldete Abweichungen ohne jede
 * CSS-Aenderung („seiten 2 → 3", gemessen 2026-11-15). Hier wird ein fester
 * 3-Seiten-Brief und ein festes `din_settings` per
 * `Page.addScriptToEvaluateOnNewDocument` VOR dem Boot gesetzt. Der
 * Nutzerzustand wird gesichert und am Ende zurueckgeschrieben — das Profil
 * des Debug-Browsers ist persistent (siehe AGENTS.md).
 *
 * Aufruf:
 *   node tools/geometrie-zustaende.mjs /tmp/opencode/vorher.json
 *   node tools/geometrie-zustaende.mjs /tmp/opencode/nachher.json
 *   # vergleichen: die Dateien muessen identisch sein (oder der Diff ist der Befund)
 *
 * Voraussetzung: `din-dev` (Server 8088, CDP 9222).
 */
import { writeFileSync } from 'node:fs';

const ZIEL = process.argv[2];
if (!ZIEL) { console.error('Ziel fehlt'); process.exit(2); }
if (!(await fetch('http://127.0.0.1:9222/json/version').then(() => true).catch(() => false))) {
  console.error('9222 zu — din-dev starten'); process.exit(2);
}
const liste = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const tab = liste.find((t) => t.type === 'page' && (t.url || '').startsWith('http://127.0.0.1:8088'));
if (!tab) { console.error('kein Tab auf 8088'); process.exit(2); }
const ws = new WebSocket(tab.webSocketDebuggerUrl);
let id = 0;
const offen = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && offen.has(m.id)) { offen.get(m.id)(m); offen.delete(m.id); }
=== imr.js head ===
'use strict';
/**
 * tools/imr.js — IMR-Registry als maschinenlesbare SSOT.
 *
 * Liest docs/norm/IMR-Registry.md (normatives Modell + JSON-Inventar),
 * prueft die Registry-Invarianten und dass der Website-Code + die `data-*`-Geometrie
 * exakt der Registry entsprechen. Kein Dependency, kein Build-Step.
 *
 *   const { checkImr } = require('./tools/imr.js');
 *   const { violations } = checkImr('/pfad/zum/repo');
 */
const fs = require('fs');
const path = require('path');

const REGISTRY_REL = 'docs/norm/IMR-Registry.md';

function readRegistry(targetDir) {
  const md = fs.readFileSync(path.join(targetDir, REGISTRY_REL), 'utf-8');
  const tags = new Set((md.match(/<din-[a-z0-9-]+>/g) || []).map(t => t.slice(1, -1)));
  const m = md.match(/<!-- IMR-INVENTORY:START -->\s*```json\s*([\s\S]*?)```\s*<!-- IMR-INVENTORY:END -->/);
  const inventory = m ? JSON.parse(m[1]) : null;
  return { md, tags, inventory };
}

/** Erwartete `data-*`-Geometrie aus dem Inventar (Reihenfolge egal). */
function expectedDataAttrs(inventory) {
  const out = {
    'data-width-mm': inventory.sheet.width,
    'data-height-mm': inventory.sheet.height,
  };
  for (const [id, spec] of Object.entries(inventory.geometry || {})) {
    const base = id.replace(/^din-/, '');
    const y = spec.y || {};
    if ('Y' in y) out[`data-${base}-y`] = y.Y;
    if ('A' in y) out[`data-${base}-y-a`] = y.A;
    if ('B' in y) out[`data-${base}-y-b`] = y.B;
  }
  return out;
}
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -rn "imr" tools/build_db.js test/all.js package.json tools/repo-map-check.mjs | head -20
tools/build_db.js:158:| imr.js | IMR-Registry & DIN-Geometrie-Invarianten |
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && cat package.json
{
  "name": "din-briefneo",
  "version": "4.1.0",
  "description": "DIN-BriefNEO — Reines natives DIN-5008-Briefsystem nach Web-Baseline Chrome 150+",
  "scripts": {
    "test": "node tools/test-runner.mjs && node test/corpus/run.js",
    "check": "biome check website/",
    "check:antipatterns": "node tools/reconciliation.js --only-rules",
    "check:browser-feature": "node tools/query_chrome_feature.mjs",
    "check:fitness": "node tools/build_db.js -q",
    "docs:index": "node tools/build_db.js -q",
    "build:data": "node tools/build_plz_data.mjs",
    "docs:backlog": "node tools/backlog-sync.mjs",
    "docs:facts": "node tools/batch-facts.mjs && node tools/batch-facts.mjs --scheibe 01 && node tools/batch-facts.mjs --scheibe 03 && node tools/batch-facts.mjs --scheibe 04 && node tools/batch-facts.mjs --scheibe 05 && node tools/batch-facts.mjs --scheibe 06 && node tools/batch-facts.mjs --scheibe 07",
    "docs:tests": "node tools/test-dossier.mjs",
    "docs:all": "npm run docs:backlog && npm run docs:facts && npm run docs:tests"
  },
  "keywords": [
    "din-5008",
    "letter",
    "privacy-first",
    "offline-first"
  ],
  "license": "MIT"
}
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -rn "checkImr\|imr.js" --include=*.js --include=*.mjs --include=*.json . | grep -v node_modules | head -20
./tools/imr.js:3: * tools/imr.js — IMR-Registry als maschinenlesbare SSOT.
./tools/imr.js:9: *   const { checkImr } = require('./tools/imr.js');
./tools/imr.js:10: *   const { violations } = checkImr('/pfad/zum/repo');
./tools/imr.js:151:function checkImr(targetDir) {
./tools/imr.js:303:module.exports = { checkImr, checkVocabulary, checkCase, expectedDataAttrs, REGISTRY_REL };
./tools/imr.js:306:  const r = checkImr(path.resolve(__dirname, '..'));
./tools/isolation.js:21: * Aufrufvertrag wie tools/links.js und tools/imr.js:
./tools/lawcoverage.js:28: * Aufrufvertrag wie tools/isolation.js, tools/links.js, tools/imr.js:
./tools/build_db.js:158:| imr.js | IMR-Registry & DIN-Geometrie-Invarianten |
./tools/terminology.js:11: * Aufrufvertrag wie tools/links.js und tools/imr.js:
./tools/reconciliation.js:533:  // Werkzeug: tools/imr.js. Prueft die Registry-Invarianten (45 Atome, 3 System,
./tools/reconciliation.js:540:      imrViolations = require('./imr.js').checkImr(targetDir).violations;
./website/js/binary-storage.js:18: * und wird von tools/imr.js als Tag gelesen. */
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && echo "=== --mm-y( / --mm-x( usage ===" && grep -rn -- '--mm-y(\|--mm-x(\|--pt(' website/css/*.css | cat && echo && echo "=== --mm-rel / --mm-abs usage ===" && grep -rn -- '--mm-rel-\|--mm-abs-\|--pt-rel(\|--pt-abs(' website/css/*.css | cat
=== --mm-y( / --mm-x( usage ===
website/css/base.css:257:@function --mm-x(--mm) {
website/css/base.css:260:@function --mm-y(--mm) {
website/css/base.css:263:@function --pt(--points) {
website/css/sheet-common.css:29:  --briefkopf-y: --mm-y(attr(data-briefkopf-y-b type(<number>)));
website/css/sheet-common.css:30:  --anschriftfeld-y: --mm-y(attr(data-anschriftfeld-y-b type(<number>)));
website/css/sheet-common.css:31:  --infoblock-y: --mm-y(attr(data-infoblock-y-b type(<number>)));
website/css/sheet-common.css:32:  --kern-y: --mm-y(attr(data-kern-y-b type(<number>)));
website/css/sheet-common.css:34:  --falz-oben-y: --mm-y(attr(data-falzmarke-1-y-b type(<number>)));
website/css/sheet-common.css:35:  --falz-unten-y: --mm-y(attr(data-falzmarke-2-y-b type(<number>)));
website/css/sheet-common.css:36:  --lochmarke-y: --mm-y(attr(data-lochmarke-y type(<number>)));
website/css/sheet-common.css:42:  --briefkopf-y: --mm-y(attr(data-briefkopf-y-a type(<number>)));
website/css/sheet-common.css:43:  --anschriftfeld-y: --mm-y(attr(data-anschriftfeld-y-a type(<number>)));
website/css/sheet-common.css:44:  --infoblock-y: --mm-y(attr(data-infoblock-y-a type(<number>)));
website/css/sheet-common.css:45:  --kern-y: --mm-y(attr(data-kern-y-a type(<number>))); /* Muss zwingend UNTER Falzmarke 1 (87mm) liegen */
website/css/sheet-common.css:46:  --falz-oben-y: --mm-y(attr(data-falzmarke-1-y-a type(<number>)));
website/css/sheet-common.css:47:  --falz-unten-y: --mm-y(attr(data-falzmarke-2-y-a type(<number>)));
website/css/sheet-common.css:235:  font-size: --pt(attr(data-font type(<number>)));
website/css/sheet-common.css:244:  margin-top: --mm-y(attr(data-margin-top type(<number>)));
website/css/sheet-common.css:732:      width: --mm-x(attr(data-w type(<number>))); /* Breite: 12mm */
website/css/sheet-multipage.css:49:@function --mm-x(--mm) {
website/css/sheet-multipage.css:52:@function --mm-y(--mm) {
website/css/sheet-multipage.css:55:@function --pt(--points) {

=== --mm-rel / --mm-abs usage ===
website/css/base.css:247:@function --mm-rel-x(--mm) {
website/css/base.css:250:@function --mm-rel-y(--mm) {
website/css/base.css:253:@function --pt-rel(--points) {
website/css/base.css:258:  result: --mm-rel-x(var(--mm));
website/css/base.css:261:  result: --mm-rel-y(var(--mm));
website/css/base.css:264:  result: --pt-rel(var(--points));
website/css/sheet-common.css:170:  font-size: --pt-rel(attr(data-font type(<number>)));
website/css/sheet-common.css:174:  gap: 0 --mm-rel-x(10);
website/css/sheet.css:49: *   --mm-rel-x, --pt) und sheet-multipage.css (--mm-abs-*), bereits getrennt.
website/css/sheet.css:118:    width: --mm-rel-x(attr(data-w type(<number>))); /* Kurz, nicht durch den Text schneidend */
website/css/sheet.css:128:    left: --mm-rel-x(attr(data-x type(<number>)));
website/css/sheet.css:129:    width: --mm-rel-x(attr(data-w type(<number>)));
website/css/sheet.css:130:    height: --mm-rel-y(attr(data-h type(<number>)));
website/css/sheet.css:131:    font-size: --pt-rel(attr(data-font type(<number>))); /* 7pt in cqw */
website/css/sheet.css:149:    left: --mm-rel-x(attr(data-x type(<number>)));
website/css/sheet.css:150:    width: --mm-rel-x(attr(data-w type(<number>)));
website/css/sheet.css:151:    height: --mm-rel-y(attr(data-h type(<number>)));
website/css/sheet.css:152:    font-size: --pt-rel(attr(data-font type(<number>))); /* 10pt in cqw */
website/css/sheet.css:163:    left: --mm-rel-x(attr(data-x type(<number>)));
website/css/sheet.css:164:    width: --mm-rel-x(attr(data-w type(<number>)));
website/css/sheet.css:165:    font-size: --pt-rel(attr(data-font type(<number>))); /* 8.5pt in cqw */
website/css/sheet.css:175:    font-size: --pt-rel(attr(data-font type(<number>))); /* 10pt in cqw */
website/css/sheet.css:182:    left: --mm-rel-x(attr(data-left type(<number>)));  /* Linker Fluchtrand: 25mm */
website/css/sheet.css:183:    right: --mm-rel-x(attr(data-right type(<number>))); /* Rechter Rand: 20mm */
website/css/sheet.css:184:    bottom: --mm-rel-y(attr(data-bottom type(<number>))); /* Abstand nach unten für Footer */
website/css/sheet.css:195:    font-size: --pt-rel(attr(data-font type(<number>))); /* 12pt in cqw */
website/css/sheet.css:198:    margin-bottom: --mm-rel-y(attr(data-margin-bottom type(<number>))); /* 2 Leerzeilen */
website/css/sheet.css:204:    font-size: --pt-rel(attr(data-font type(<number>))); /* 10.5pt in cqw */
website/css/sheet.css:205:    margin-bottom: --mm-rel-y(attr(data-margin-bottom type(<number>))); /* 1 Leerzeile */
website/css/sheet.css:209:    font-size: --pt-rel(attr(data-font type(<number>))); /* 10.5pt in cqw */
website/css/sheet.css:211:    min-height: --mm-rel-y(40);
website/css/sheet.css:222:    font-size: --pt-rel(attr(data-font type(<number>)));
website/css/sheet.css:223:    margin-top: --mm-rel-y(attr(data-margin-top type(<number>)));
website/css/sheet.css:224:    margin-bottom: --mm-rel-y(attr(data-margin-bottom type(<number>))); /* 3 Leerzeilen für Unterschrift */
website/css/sheet.css:231:    font-size: --pt-rel(attr(data-font type(<number>)));
website/css/sheet.css:245:    bottom: --mm-rel-y(attr(data-bottom type(<number>))); /* 10mm */
website/css/sheet.css:246:    left: --mm-rel-x(attr(data-left type(<number>))); /* 25mm */
website/css/sheet.css:247:    right: --mm-rel-x(attr(data-right type(<number>))); /* 20mm */
website/css/sheet.css:248:    height: --mm-rel-y(attr(data-h type(<number>))); /* 15mm */
website/css/sheet.css:249:    font-size: --pt-rel(attr(data-font type(<number>))); /* 7.5pt in cqw */
website/css/sheet.css:251:    padding-top: --mm-rel-y(attr(data-padding-top type(<number>)));
website/css/sheet.css:254:    gap: 0 --mm-rel-x(attr(data-gap type(<number>)));
website/css/sheet-multipage.css:38:/* Exakte physische Millimeter-Umrechnung für Mehrseiten-Layout (C1: explizit --mm-abs-*) */
website/css/sheet-multipage.css:39:@function --mm-abs-x(--mm) {
website/css/sheet-multipage.css:42:@function --mm-abs-y(--mm) {
website/css/sheet-multipage.css:45:@function --pt-abs(--points) {
website/css/sheet-multipage.css:50:  result: --mm-abs-x(var(--mm));
website/css/sheet-multipage.css:53:  result: --mm-abs-y(var(--mm));
website/css/sheet-multipage.css:56:  result: --pt-abs(var(--points));
website/css/sheet-multipage.css:158:    width: --mm-abs-x(attr(data-w type(<number>)));
website/css/sheet-multipage.css:179:    left: --mm-abs-x(attr(data-x type(<number>)));
website/css/sheet-multipage.css:180:    width: --mm-abs-x(attr(data-w type(<number>)));
website/css/sheet-multipage.css:181:    height: --mm-abs-y(attr(data-h type(<number>)));
website/css/sheet-multipage.css:182:    font-size: --pt-abs(attr(data-font type(<number>)));
website/css/sheet-multipage.css:222:    font-size: --pt-abs(attr(data-font type(<number>)));
website/css/sheet-multipage.css:242:    left: --mm-abs-x(attr(data-x type(<number>)));
website/css/sheet-multipage.css:243:    width: --mm-abs-x(attr(data-w type(<number>)));
website/css/sheet-multipage.css:244:    font-size: --pt-abs(attr(data-font type(<number>)));
website/css/sheet-multipage.css:260:    font-size: --pt-abs(attr(data-font type(<number>)));
website/css/sheet-multipage.css:368:    margin-top: --mm-abs-y(attr(data-margin-top type(<number>)));
website/css/sheet-multipage.css:383:    font-size: --pt-abs(attr(data-font type(<number>)));
> build · deepseek-v4.1-flash
[0m$ [0mcurl -s -m 2 -o /dev/null -w "8088=%{http_code}\n" http://127.0.0.1:8088/website/index.html; curl -s -m 2 -o /dev/null -w "9222=%{http_code}\n" http://127.0.0.1:9222/json/version
8088=000
9222=000
> build · deepseek-v4.1-flash
[0m% [0mWebFetch https://drafts.csswg.org/css-mixins-1/#function-rule 
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/.local/share/opencode/tool-output && grep -n -i "same name\|cascad\|last one\|later one\|conflict" tool_1f936267b001nSbnduG80715I3 | head -30
256:The name of a [@function](#at-ruledef-function) rule is a [tree-scoped name](https://drafts.csswg.org/css-shadow-1/#css-tree-scoped-name). If more than one @function exists for a given name, then the rule in the stronger cascade layer wins, and rules defined later win within the same layer.
288:In that list, earlier things "win" over later things of the same name—​if you have a [local variable](#local-variables) named \--foo, var(--foo) will be substituted by that local variable, not by an argument or a custom property defined outside. The other values can still be *accessed*, however: setting the \--foo local variable to [initial](https://drafts.csswg.org/css-cascade-5/#valdef-all-initial) will resolve it to the \--foo parameter, while [inherit](https://drafts.csswg.org/css-cascade-5/#valdef-all-inherit) will resolve it to the \--foo custom property from the call site.
335:#### 2\.3.1. Argument/Local Cascading: the [initial](https://drafts.csswg.org/css-cascade-5/#valdef-all-initial) and [inherit](https://drafts.csswg.org/css-cascade-5/#valdef-all-inherit) keywords[](#arg-cascade)
341:While evaluating the parameters, the [initial](https://drafts.csswg.org/css-cascade-5/#valdef-all-initial) keyword resolves to the [guaranteed-invalid value](https://drafts.csswg.org/css-variables-2/#guaranteed-invalid-value), while [inherit](https://drafts.csswg.org/css-cascade-5/#valdef-all-inherit) resolves to the inherited value of the same-named [custom property](https://drafts.csswg.org/css-variables-2/#custom-property) in the calling context (usually the element being styled).
343:After parameters are resolved, the [custom function](#custom-function) resolves its body styles in the same way, with all the parameters added as [local variables](#local-variables) at the top of the [function body](#custom-function-function-body) and set to their resolved value. In this phase, the [initial](https://drafts.csswg.org/css-cascade-5/#valdef-all-initial) keyword resolves to that resolved value, but [inherit](https://drafts.csswg.org/css-cascade-5/#valdef-all-inherit) still resolves to the inherited value of the same-named [custom property](https://drafts.csswg.org/css-variables-2/#custom-property) in the calling context.
503:[Custom functions](#custom-function) are evaluated by, essentially, pretending their function body is a [style rule](https://drafts.csswg.org/css-syntax-3/#style-rule) being applied to a hypothetical element, resolving styles as normal, and then returning the value of the [result](#descdef-function-result) descriptor on that hypothetical element. The hypothetical element "inherits" the values of all custom properties as if it were a child of its [calling context](#calling-context), with its [function parameters](#custom-function-function-parameter) overriding "inherited" custom properties of the same name.
547:To resolve function styles, given a [custom function](#custom-function) custom function, a style rule rule, a set of [custom property registrations](https://drafts.css-houdini.org/css-properties-values-api-1/#custom-property-registration) registrations, and a [calling context](#calling-context) calling context, returning a set of [computed](https://drafts.csswg.org/css-cascade-5/#computed-value) styles:
551:2. Apply rule to el to the [specified value](https://drafts.csswg.org/css-cascade-5/#specified-value) stage, with the following changes:
555:   - The [inherited value](https://drafts.csswg.org/css-cascade-5/#inherited-value) of calling context’s property is the [guaranteed-invalid value](https://drafts.csswg.org/css-variables-2/#guaranteed-invalid-value).
559:     **[initial](https://drafts.csswg.org/css-cascade-5/#valdef-all-initial)**
562:     **[inherit](https://drafts.csswg.org/css-cascade-5/#valdef-all-inherit)**
565:     Note: This ensures that a [function parameter](#custom-function-function-parameter) defaulted to [inherit](https://drafts.csswg.org/css-cascade-5/#valdef-all-inherit) is reinterpreted using the local [parameter type](#custom-function-parameter-parameter-type).
570:     Note: [initial](https://drafts.csswg.org/css-cascade-5/#valdef-all-initial) references the [custom property registration](https://drafts.css-houdini.org/css-properties-values-api-1/#custom-property-registration) created from the [function parameters](#custom-function-function-parameter), letting you "reset" a property to the passed value. [inherit](https://drafts.csswg.org/css-cascade-5/#valdef-all-inherit) inherits from the [calling context](#calling-context)’s element.\\
574:     Note: [result: inherit](#descdef-function-result), for example, will cause the [\<dashed-function\>](#typedef-dashed-function) to *evaluate to* the [inherit](https://drafts.csswg.org/css-cascade-5/#valdef-all-inherit) keyword, similar to var(--unknown, inherit).
580:3. Determine the [computed value](https://drafts.csswg.org/css-cascade-5/#computed-value) of all [custom properties](https://drafts.csswg.org/css-variables-2/#custom-property) and the [result](#descdef-function-result) "property" on el, as defined in [CSS Properties and Values API 1 § 2.4 Computed Value-Time Behavior](https://drafts.css-houdini.org/css-properties-values-api-1/#calculation-of-computed-values), with changes from the previous step, and the following:
748:The name of a [@mixin](#at-ruledef-mixin) rule is a [tree-scoped name](https://drafts.csswg.org/css-shadow-1/#css-tree-scoped-name). If more than one @mixin exists for a given name, then the rule in the stronger cascade layer wins, and rules defined later win within the same layer.
758:[@layer](https://drafts.csswg.org/css-cascade-5/#at-ruledef-layer) is not valid within a [mixin body](#mixin-body). The contents of any @layer within a mixin body are dropped when the [mixin](#mixin) is applied. This is to leave room to allow [@layer](https://drafts.csswg.org/css-cascade-5/#at-ruledef-layer) within a [mixin](#mixin) in a future level.
1165:- It is considered to be a different property from any non-private [custom property](https://drafts.csswg.org/css-variables-2/#custom-property), even if they share the same name.
1167:- Two [private properties](#private-property) with the same name are considered the same property if and only if they have the same nearest [style rule](https://drafts.csswg.org/css-syntax-3/#style-rule) ancestor that has their name in its [private property names](#private-property-names).
1171:Distinct [private properties](#private-property) with the same name are, for all intents and purposes, separate properties. They can exist together on a single element at the same time, carry their own distinct values, etc.
1363:A [@property](https://drafts.css-houdini.org/css-properties-values-api-1/#at-ruledef-property) rule inside of a [@private](#private) rule defines a [private property name](#private-property-names) for the parent [style rule](https://drafts.csswg.org/css-syntax-3/#style-rule), just like using the [private property](#private-property) normally does. Its [custom property registration](https://drafts.css-houdini.org/css-properties-values-api-1/#custom-property-registration) only applies to that private property, not any other of the same name.
1731:- Made [@layer](https://drafts.csswg.org/css-cascade-5/#at-ruledef-layer) invalid within a [mixin body](#mixin-body). ([Issue 12417](https://github.com/w3c/csswg-drafts/issues/12417))
1946:- [\[CSS-CASCADE-5\]]() defines the following terms:
2177:**\[CSS-CASCADE-5\]**
2178:: Elika Etemad; Miriam Suzanne; Tab Atkins Jr.. [CSS Cascading and Inheritance Level 5](https://drafts.csswg.org/css-cascade-5/). URL: [https://drafts.csswg.org/css-cascade-5/](https://drafts.csswg.org/css-cascade-5/)
2205:: Tab Atkins Jr.. [CSS Custom Properties for Cascading Variables Module Level 1](https://drafts.csswg.org/css-variables/). URL: [https://drafts.csswg.org/css-variables/](https://drafts.csswg.org/css-variables/)
2208:: [CSS Custom Properties for Cascading Variables Module Level 2](https://drafts.csswg.org/css-variables-2/). Editor's Draft. URL: [https://drafts.csswg.org/css-variables-2/](https://drafts.csswg.org/css-variables-2/)

[showing lines 2-28 of 28; full output saved to /home/moritz/.local/share/opencode/shell/7a65242475c99ea523f0bbf34cad22dd092dd441/sh_1f936368b001fyEVFQMWayJrRB.out]
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && sed -n '320,360p' website/index.html && echo "..." && sed -n '460,480p' website/index.html
</section>

        <!-- Zone 4: Fester Fußbereich -->
        <div role="group" id="zone-aktionen" class="seitenleiste-footer" aria-label="Aktionen">
          <!-- Name nennt beide Inhalte: der Speicherstatus und das Zuruecksetzen.
               "Aktionen" verschwieg den Status, "Status" das Zuruecksetzen
               (Befund B15/B3). -->
          <h2 class="sr-only">Status &amp; Zurücksetzen</h2>
          <div class="save-status-row">
            <span id="save-status" class="save-status saved" title="Alle Änderungen gespeichert">Gespeichert</span>
          </div>
          <button type="button" id="btn-reset" class="btn btn-ghost btn-danger-subtle w-full" commandfor="reset-dialog" command="show-modal">🗑️ Brief zurücksetzen</button>
        </div>
      </aside>
      <main id="viewport">
        <h1 class="sr-only">DIN-BriefNEO – Brief-Editor nach DIN 5008</h1>
        <div id="brief-ansicht">
          <din-blatt class="blatt-theme seite-1"
            data-width-mm="210"
            data-height-mm="297"
            data-lochmarke-y="148.5"
            data-briefkopf-y-b="45"
            data-anschriftfeld-y-b="45.8"
            data-infoblock-y-b="51"
            data-kern-y-b="109"
            data-falzmarke-1-y-b="105"
            data-falzmarke-2-y-b="210"
            data-briefkopf-y-a="27"
            data-anschriftfeld-y-a="28.9"
            data-infoblock-y-a="34"
            data-kern-y-a="91"
            data-falzmarke-1-y-a="87"
            data-falzmarke-2-y-a="192"
            role="article"
            writingsuggestions="false"
            aria-label="DIN 5008 Brief">
            <din-falzmarke-1 data-w="8"></din-falzmarke-1>
            <din-falzmarke-2 data-w="8"></din-falzmarke-2>
            <din-lochmarke data-w="12"></din-lochmarke>
            <din-briefkopf hidden></din-briefkopf>
            <!-- Guard: contenteditable="plaintext-only" + enterkeyhint. Umbrueche sind NICHT
...
          <button value="confirm" class="btn primary">Importieren</button>
        </div>
      </form>
    </dialog>
    <dialog id="din-info-dialog" class="glass-dialog nicht-drucken" closedby="any" aria-labelledby="din-info-title">
      <h2 id="din-info-title" class="din-info-title">DIN 5008 Standard-Leitfaden</h2>
      <div class="din-info-content">
        <p><strong>Form A vs. Form B:</strong> Form A hat einen 27-mm-Briefkopf (mehr Platz für Text). Form B nutzt 45 mm (Standard für Privatbriefe mit Absenderblock oder Logo).</p>
        <p><strong>Fensterumschlag (DIN Lang):</strong> Das Anschriftfeld (85 × 45 mm) ist exakt so platziert, dass es bei korrekter Faltung im 90 × 45 mm Sichtfenster liegt.</p>
        <p><strong>Falz- & Lochmarken:</strong> Falzmarke 1 (105 mm, Form A: 87 mm) und Falzmarke 2 (210 mm, Form A: 192 mm) teilen das Blatt in Drittel (Zickzack- oder Wickelfalz). Die Lochmarke (148,5 mm) zentriert das Blatt im Ordner.</p>
      </div>
      <div class="dialog-actions">
        <form method="dialog"><button class="btn primary">Verstanden</button></form>
      </div>
    </dialog>

    <!-- Setzt den gespeicherten UI-Zustand (Form, Postvermerk, Schalter) vor
         dem ersten Paint; ohne ihn springt die Anzeige beim Hard-Reload. -->
    <script src="js/boot-state.js?v=bs2"></script>
  </body>
</html>
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -n "probe" -B3 -A6 website/index.html website/css/*.css | head -50
website/index.html-39-  <body>
website/index.html-40-    <a href="#viewport" class="skip-link">Zum Briefkern springen</a>
website/index.html-41-    <div id="app-shell">
website/index.html:42:      <div id="probe" aria-hidden="true"></div>
website/index.html-43-      <aside id="seitenleiste" class="seitenleiste nicht-drucken" aria-label="Seitenleiste Werkzeuge">
website/index.html-44-        <!-- Normaler Modus Header -->
website/index.html-45-        <div class="seitenleiste-header-row" role="group" aria-label="Allgemein">
website/index.html-46-          <a href="https://github.com/grapefruit89/DIN-BriefNEO" target="_blank" rel="noopener noreferrer" class="icon-btn" aria-label="GitHub Repository">
website/index.html-47-            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-github" aria-hidden="true">
website/index.html-48-              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path>
--
website/css/sheet-multipage.css-409-  font-family: inherit;
website/css/sheet-multipage.css-410-}
website/css/sheet-multipage.css-411-
website/css/sheet-multipage.css:412:#probe {
website/css/sheet-multipage.css-413-  position: fixed;
website/css/sheet-multipage.css-414-  top: 0;
website/css/sheet-multipage.css-415-  left: 0;
website/css/sheet-multipage.css-416-  visibility: hidden;
website/css/sheet-multipage.css-417-  height: 1000mm;
website/css/sheet-multipage.css-418-  width: 1px;
--
website/css/sheet-multipage.css-501-    background: oklch(100% 0 0) !important;
website/css/sheet-multipage.css-502-  }
website/css/sheet-multipage.css-503-
website/css/sheet-multipage.css:504:  #probe {
website/css/sheet-multipage.css-505-    display: none !important;
website/css/sheet-multipage.css-506-  }
website/css/sheet-multipage.css-507-
website/css/sheet-multipage.css-508-  aside, .nicht-drucken, [popover], #hinweis-v4, #font-uploader,
website/css/sheet-multipage.css-509-  .unterschriftsbild-griff, .unterschriftsbild-drehgriff,
website/css/sheet-multipage.css-510-  #anschriftfeld::after, #folgekoepfe, .folgekopf-screen {
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -n "A60\|A62\|A25\|A49\|A43\|A22\|A34" docs/norm/Immutable-Law-Catalog.md | head -20
83:| S1 | HARD BAN anderer Produktspeicher | `localStorage` für Produktdaten | **Synchron** (Boot-Restore ohne await, kein FOUC), Zero-Dependency, Datenmenge passt (ein Brief + Einstellungen). Andere Speicher-APIs sind nicht „unbrauchbar“, sondern für diesen Kontext nicht gewählt — siehe [[ADR-RUNTIME-CONTEXT]]. **Binär-Assets (Signaturbild, Schriftdatei) sind keine Produktdaten im Sinne dieser Zeile** — siehe A34 |
135:| A22 | HARD BAN | CSS-in-JS | Stylesheets | JS-Overhead, FOUC, bricht `@layer`-Kaskade und CSP ohne `unsafe-inline` |
138:| A25 | HARD BAN | Inline `style` für Farbe/Layout (`style.color`, `style.background`, `style.display`) | CSS | Ausnahme: kurzlebige Koordinaten am Selektionsanker; CSS Custom Properties für UI-Zustand (Dimmer, Signatur-Transform, Swipe) dürfen per JS gesetzt werden |
141:| A43 | HARD BAN | unkontrolliertes Dokument-/Seiten-Scrolling | `overflow` am Dokument begrenzen; internes Scrollen MAY in abgegrenzter UI | Viewport bleibt Brief-Arbeitsfläche |
144:| A46 | HARD BAN | `page-break-before: always` auf Layout-Wurzeln | kontrolliertes Print | leere erste PDF-Seite. **Gegenpflicht:** Sperrt der Viewport per `overflow: hidden` + `height: 100vh` (A43), MUSS `@media print` ihn mit `html, body { overflow: visible; height: auto; }` wieder freigeben — sonst schneidet der Druck ab oder bleibt leer. |
146:| A49 | HARD BAN | JS-basiertes Text-Fitting & DOM-Layout-Polling (`scrollWidth > clientWidth`, MutationObserver für Textanpassung, `48-text-fit.js`) | CSS `field-sizing: content`, `overflow: clip`, `text-wrap: balance/pretty`; **Feldbreite begrenzt die Eingabe** (Sperre in `document.js`, DECISION-LOG 2026-11-12). `text-fit` ist Projekt-HARD-BAN (P39). | Verursacht Layout Thrashing, Ruckeln und JS-Overhead. Natives CSS löst die dynamische Feld- und Textanpassung performant und 100% deklarativ. `text-fit` scheidet aus: es verkleinert die Schrift und erzeugt mehrere Schriftgroessen im Brief. |
152:| A34 | HARD BAN in diesem Produkt | IndexedDB **für strukturierte Produktdaten** (Draft, Einstellungen, Keys, Adressen, Schema-Version) | `localStorage` | Asynchron → Boot-Restore bräuchte await und erzeugt FOUC; Transaktions-Overhead ohne Nutzen bei einem Brief. **Ausnahme (2026-11-06): Binär-Assets (Signaturbild, Schriftdatei als `Blob`) dürfen in IndexedDB liegen** — `localStorage` kann nur Strings, jeder andere Binärweg (OPFS, FSA) bleibt verboten. Festgelegt in [[ADR-BINARY-ASSETS]] |
180:| A57 | HARD BAN für neue Schalter | **binäre** Ein/Aus-Schalter als doppelte `<input type="radio" class="sr-only">` + zwei `<label>` + JS-Zustandssync | `<input type="checkbox" switch>`, Zustand per `:has(#schalter:checked)` (Attribut ist in keinem ausgelieferten Browser implementiert — bis dahin rendert der Browser eine native Checkbox; Größe nicht strecken, sonst wird der Haken zum dunklen Quadrat) | Halber DOM, kein JS. **Abgrenzung zu A60:** mehrwertige Schalter (3+ Zustände, z. B. Form A/B/C) bleiben Radio-Gruppen mit `:has()` — verboten ist nur der Radio-Nachbau eines Booleans. Bestand (`#btn-form-a`) ist bestandsgeschützt. **Abgrenzung Ansicht (2026-11-13):** ein Ansichtswechsel ist keine Einstellung, sondern die Wahl *welcher Inhalt* sichtbar ist (Brief | Einstellungen). Dafür ist eine Radiogruppe im Segment-Design richtig: der Zustand steckt im Namen (WCAG 2.5.3), die Gruppe ist ein Tab-Stopp mit Pfeiltasten, und CSS-only bleibt es ohnehin (`:has(#modus-einstellungen:checked)`). Verboten bleibt der Radio-Nachbau eines *Schalters*, also einer Einstellung mit An/Aus-Wirkung. |
182:| A60 | HARD BAN | globalen UI-Zustand per JS-Klassen schalten (`classList.add('active')` auf Wrapper, um Sektionen ein-/auszublenden) | versteckter nativer Schalter + `:has()` im CSS; JS **nur** für Anti-FOUC-Restore beim Boot und zum Persistieren im `change`-Handler | Der Zustand lebt im DOM statt in einer JS-Variable, ist tastaturbedienbar und überlebt ohne Sync-Code. |
183:| A62 | HARD BAN | aktive Zustände von Bedienelementen über `classList.add('active')` ausdrücken | `aria-pressed="true\|false"`, Styling per `button[aria-pressed="true"]` | Eine Quelle für Semantik **und** Styling; Screenreader bekommen den Zustand geschenkt. |
211:> jetzt als `A51`–`A62`, `H11` hier, ihre Begründungen in den thematischen ADRs.
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && sed -n '755,830p' website/js/persistence.js
* @param {any} pendingImport
 * @param {{ reloadFn?: () => void }} [options]
 * @returns {boolean} true bei Erfolg, false bei Speicherfehler
 */
export function applyImportedData(pendingImport, { reloadFn = () => location.reload() } = {}) {
  if (!pendingImport?.ok) return false;
  /* Alter Stand fuer den Rueckfall. Ohne ihn bleibt bei einem Fehler im
     zweiten Schreibvorgang ein halber Import stehen: Draft neu, Einstellungen
     alt — nach dem Reload ein Mischzustand, den niemand mehr zuordnen kann
     (Befund B13). Die Rueckfall-Schreibvorgaenge koennen selbst scheitern
     (gleiche Quota); dann bleibt wenigstens der Versuch dokumentiert. */
  const altDraft = load(STORAGE_KEYS.draft);
  const altSettings = load(STORAGE_KEYS.settings);
  try {
    const draftGespeichert = saveJSON(STORAGE_KEYS.draft, pendingImport.fields);
    const currentSettings = loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS) || DEFAULT_SETTINGS;
    /** @type {Record<string, any>} */
    const nextSettings = { ...currentSettings };
    const layout = pendingImport.layout;
    if (layout) {
      if (layout.form !== undefined) nextSettings.layout = layout.form;
      if (layout.marks !== undefined) nextSettings.marks = layout.marks;
    }
    if (pendingImport.signature?.transform) {
      nextSettings.signatureState = { ...pendingImport.signature.transform };
    }
    const settingsGespeichert = saveJSON(STORAGE_KEYS.settings, nextSettings);
    // saveJSON gibt bei vollem Speicher false zurück statt zu werfen (B55).
    // Ohne diese Prüfung meldet der Dialog Erfolg und der Reload verwirft den Import.
    if (!draftGespeichert || !settingsGespeichert) {
      stelleAltenStandWiederHer(STORAGE_KEYS.draft, altDraft);
      stelleAltenStandWiederHer(STORAGE_KEYS.settings, altSettings);
      notify(Constants.TOASTS.DRAFT.IMPORT_STORAGE_ERROR, 'error');
      return false;
    }
    if (typeof reloadFn === 'function') {
      reloadFn();
    }
    return true;
  } catch {
    stelleAltenStandWiederHer(STORAGE_KEYS.draft, altDraft);
    stelleAltenStandWiederHer(STORAGE_KEYS.settings, altSettings);
    notify(Constants.TOASTS.DRAFT.IMPORT_STORAGE_ERROR, 'error');
    return false;
  }
}

/**
 * Verdrahtet Export/Import-UI (Sidebar-Buttons, Datei-Input, Confirm-Dialog, Keyboard-Shortcut).
 * @param {{ collectDraft?: () => Record<string, string | boolean> }} [options]
 */
export function initImportExport({ collectDraft } = {}) {
  if (typeof collectDraft === 'function') {
    registerDraftCollector(collectDraft);
  }

  const exportBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-export-dinletter'));
  const copyBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-copy-dinletter'));
  const importBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-import-dinletter'));
  const importInput = /** @type {HTMLInputElement | null} */ (document.getElementById('dinletter-uploader'));
  const importDialog = /** @type {HTMLDialogElement | null} */ (document.getElementById('import-dialog'));
  const importFileName = document.getElementById('import-file-name');
  if (!exportBtn || !importBtn || !importInput || !importDialog) return;

  const handleExport = async () => {
    // Kein DOCUMENT_SAVE_REQUESTED: das Payload entsteht direkt aus dem DOM
    // (collectDraft). Der Request löste nur einen zweiten Speichervorgang aus (B47).
    const payload = buildDINLetterJSON(collectDraft);
    await exportDocumentToFile(payload);
  };

  exportBtn.addEventListener('click', handleExport);

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
> build · deepseek-v4.1-flash
[0m→ [0mRead website/js/address-data.js [90m[limit=70, offset=960][0m
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -n "feld(\|bindListSelection\|^const \|^let \|^class \|^export" website/js/clipboard-parser.js | head -40
13:import { bindListSelection, feld } from './address.js';
78:export class ClipboardAddressParser {
463:    const empfFirmaEl = feld('empfaenger-firma');
464:    const empfNameEl = feld('empfaenger-name');
465:    const empfStrasseEl = feld('empfaenger-strasse');
466:    const empfOrtEl = feld('empfaenger-ort');
494:    hidePopoverSafe(feld('plz-suggestions-popover'));
495:    hidePopoverSafe(feld('anschrift-vorschlaege'));
527:    const btn = feld('btn-zwischenablage-anschrift');
528:    const popover = feld('clipboard-candidates-popover');
604:          bindListSelection(popover, candidates, selectCandidate);
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -rn "toggleAddon\|activate(" website/js/ website/addons/*/*.js | cat | head -20
website/js/settings.js:11:import { toggleAddon } from './addons.js';
website/js/settings.js:335:        void toggleAddon('geschaeftsangaben', pluginGeschaeft.checked);
website/js/addons.js:12: *    - Toggle-Plugins: export async function activate(ctx) -> optional dispose()
website/js/addons.js:112:export async function toggleAddon(id, enabled, ctx = {}) {
website/js/addons.js:178:    toggleAddon(addonId, target.checked, { event: e });
> build · deepseek-v4.1-flash
[0m→ [0mRead website/addons/geschaeftsangaben/geschaeftsangaben.js 
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -rn "webmcp" website/ tools/ docs/ test/ | head -10; echo "---"; head -30 website/addons/webmcp-bridge.js
website/addons/webmcp-bridge.js:4:/* addons/webmcp-bridge.js — WebMCP Bridge & Polyfill für DIN-BriefNEO.
docs/STRUCTURE.md:48:| addons/webmcp-bridge.js | ADR-JS | - | WebMCP Bridge & Polyfill — derzeit nicht eingebunden |
docs/norm/ARCHITECTURE-MAP.md:49:| `website/addons/webmcp-bridge.js` | WebMCP-Bridge | **gar nicht** | derzeit nicht eingebunden, in [[STRUCTURE]] entsprechend markiert |
docs/norm/ARCHITECTURE-MAP.md:132:   `webmcp-bridge.js` wird gar nicht geladen. Vor Änderungen den Trigger-Pfad in `main.js` prüfen.
docs/norm/repository.json:136:      "file": "addons/webmcp-bridge.js",
docs/meta/DECISION-LOG.md:2233:3. **4.5 liegengelassen, nicht archiviert.** Der erste Versuch, `webmcp-bridge.js` (202 Zeilen)
docs/archive/dead-code-audit-2026-11-05.md:48:| 4.5 | Niedrig | `addons/webmcp-bridge.js` (202 Zeilen) wird nirgends importiert. | einzige Erwähnungen: `tools/build_db.js`, `docs/STRUCTURE.md` | **liegen gelassen**, in [[STRUCTURE]] als „derzeit nicht eingebunden" markiert |
docs/archive/dead-code-audit-2026-11-05.md:50:| 4.8 | **Hoch** | Archivieren der `webmcp-bridge.js` nach `docs/90-archive/` bricht die TypeScript-Prüfung: `docs/90-archive/webmcp-bridge.js(11,34): error TS2307: Cannot find module '../js/core.js'` — relative Importe lösen sich am neuen Ort nicht mehr auf. Folge: `Fitness Score 99.93 %`, Gate rot. | eigener Gate-Lauf 2026-11-05 | **Option A: liegen lassen.** Ein sauberes Archivieren setzt voraus, dass `jsconfig.json` `docs/` ausschließt **oder** `tools/build_db.js` bereinigt ist — beides ein eigener Auftrag |
docs/archive/todo-2026-11/19-brainstorm-verifikation.md:28:| A webmcp-bridge vs. CSP | teilweise, falsch gerahmt | ws://127.0.0.1:8333 (webmcp-bridge.js:68), CSP connect-src 'self' https://api.geoapify.com. ABER: Datei wird nirgends geladen; dead-code-audit 4.5 sagt "wird nirgends importiert", Status "liegen gelassen" |
docs/archive/todo-2026-11/19-brainstorm-verifikation.md:35:## 37 · webmcp-bridge: Entscheidung abschliessen
---
// @ts-check
// @adr [[ADR-JS]]

/* addons/webmcp-bridge.js — WebMCP Bridge & Polyfill für DIN-BriefNEO.
 *
 * Verbindet den Browser-Tab direkt und ohne Erweiterung mit einem lokalen
 * Bash-Agenten über ws://127.0.0.1:8333.
 * Stellt window.modelContext bereit (W3C WebMCP Standard).
 *
 * ⚠️ STATUS: GEPARKT — ABSICHTLICH NICHT GELADEN (Stand 2026-11-14).
 * Es gibt weder ein <script> in index.html noch einen import in js/main.js.
 * Das ist kein toter Code und kein Versehen: die Nutzung ist noch nicht
 * entschieden, und ohne Plugin-Punkt ([[B52]]) würde ein Import den Addon-Code
 * fest in den Boot-Pfad ziehen. Kosten im Betrieb heute: 0 Byte.
 * Wer das hier als "ungenutzt" meldet: bitte zuerst B52 im Backlog lesen.
 */

import { Events, eventBus } from '../js/core.js';

/**
 * Setzt den Inhalt eines Feldes, feuert ein Event und lässt es grün aufleuchten.
 * @param {string} id
 * @param {unknown} value
 */
function setField(id, value) {
  if (value === undefined || value === null) return;
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = String(value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && ls tools/antipatterns/ && sed -n '500,560p' tools/reconciliation.js
base.json
project.json
web.json
      if (allowedDirs.length > 0 && allowedRootFiles.length > 0) {
        const tracked = execSync('git ls-files', { cwd: targetDir, encoding: 'utf-8' })
          .split('\n').map(s => s.trim()).filter(Boolean);
        for (const rel of tracked) {
          const top = rel.includes('/') ? rel.split('/')[0] : null;
          const ok = top === null ? allowedRootFiles.includes(rel) : allowedDirs.includes(top);
          if (!ok) taxonomyViolations.push(rel);
        }
      }
    } catch (err) {
      logs.push({
        file_path: 'repository.yaml',
        check_type: 'taxonomy',
        severity: 'low',
        message: `Taxonomie-Check uebersprungen: ${err.message}`
      });
      taxonomyViolations = [];
    }
    if (taxonomyViolations.length === 0) {
      conformancePassed += 1;
    } else {
      for (const v of taxonomyViolations) {
        logs.push({
          file_path: v,
          check_type: 'taxonomy',
          severity: 'critical',
          message: `Datei liegt ausserhalb der Taxonomie (repository.yaml/taxonomy): ${v}`
        });
      }
    }
  }

  // --- IMR-Check (docs/10-architecture/IMR-Registry.md = SSOT) --------------
  // Werkzeug: tools/imr.js. Prueft die Registry-Invarianten (45 Atome, 3 System,
  // 42 Inhalt, keine verbotenen Aliase), dass der Website-Code nur registrierte
  // `din-*` verwendet und dass die `data-*`-Geometrie exakt der Registry entspricht.
  conformanceChecked += 1;
  {
    let imrViolations = [];
    try {
      imrViolations = require('./imr.js').checkImr(targetDir).violations;
    } catch (err) {
      logs.push({
        file_path: 'docs/norm/IMR-Registry.md',
        check_type: 'imr',
        severity: 'low',
        message: `IMR-Check uebersprungen: ${err.message}`
      });
      imrViolations = [];
    }
    if (imrViolations.length === 0) {
      conformancePassed += 1;
    } else {
      for (const v of imrViolations) {
        logs.push({
          file_path: v.file,
          check_type: 'imr',
          severity: 'critical',
          message: v.message
        });
      }
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && python3 -c "
import json
for f in ['base','project','web']:
    d=json.load(open('tools/antipatterns/%s.json'%f))
    print('==',f, type(d))
    print(json.dumps(d, ensure_ascii=False)[:1200])
"
== base <class 'dict'>
{"version": "1.1.1", "layer": "base", "id_space": "JSON-IDs (B*/W*) bleiben. Normative IDs nur in catalog_ref.", "description": "Übertragbare HARD-BAN-Sonden. Normative SSoT: docs/norm/Immutable-Law-Catalog.md", "rules": [{"id": "B2", "catalog_ref": ["TM1", "A48"], "class": "hard-ban", "severity": "critical", "check": "regex", "category": "javascript", "description": "Legacy Date API in website/. Catalog TM1/A48. Tooling exempt.", "pattern": "\\bnew\\s+Date\\(|\\bDate\\.now\\(|\\bDate\\.parse\\(|\\bmoment\\(|\\bdate-fns\\b|\\bluxon\\b|from ['\"]moment['\"]|from ['\"]date-fns['\"]|from ['\"]luxon['\"]", "file_patterns": ["*.js"], "exemptions": []}, {"id": "W1", "catalog_ref": ["A52"], "class": "hard-ban", "severity": "critical", "check": "regex", "category": "javascript", "description": "document.execCommand()/queryCommandState() in jeder Form ist Catalog HARD BAN A52 (deprecated, inkonsistent zwischen Engines). Ersatz: gezielte DOM-Mutation + Selection API.", "pattern": "\\bexecCommand\\(|\\bqueryCommandState\\(", "ignore_line_pattern": "^\\s*(?://|\\*|/\\*)", "file_patterns": ["*.js"], "exemptions": []}, {"id": "W7", "catalog_ref": ["A41"], "class": "hard-ban", "severity": "critic
== project <class 'dict'>
{"version": "1.2.0", "layer": "project", "id_space": "JSON-IDs (P*) bleiben. Normative IDs nur in catalog_ref.", "description": "DIN-BriefNEO-only Sonden. Keine generische Boilerplate.", "rules": [{"id": "P1", "catalog_ref": ["A61", "H11"], "class": "hard_ban", "severity": "critical", "check": "regex", "category": "javascript", "description": "setHTMLUnsafe() ist Catalog HARD BAN A61 (XSS-Pfad), nicht blosse Praeferenz. Ersatz: setHTML() oder textContent. H11 bleibt als Stilbezug.", "pattern": "setHTMLUnsafe", "file_patterns": ["*.js"], "exemptions": []}, {"id": "P2", "catalog_ref": ["A38", "T2"], "class": "info", "severity": "info", "check": "review", "category": "network", "description": "Hinweis, kein Gate: A38 wird ladend von tools/isolation.js erzwungen und per CDN-Hostliste von B5. Diese Sonde dokumentiert nur die fetch()-Allowlist (api.geoapify.com, photon.komoot.io, api.zippopotam.us), die KEIN Verstoss ist.", "pattern": "", "file_patterns": ["*.js", "*.html"], "exemptions": []}, {"id": "P3", "catalog_ref": ["A49"], "class": "hard_ban", "severity": "critical", "check": "regex", "category": "javascript", "description": "JS text-fitting or DOM layout loops (scrollWidth > clie
== web <class 'dict'>
{"version": "1.1.1", "layer": "web", "id_space": "JSON-IDs (W*) bleiben. Normative IDs nur in catalog_ref.", "description": "Web-Mechanik-Sonden. Farbe ist Policy-Warnung, kein Hex-Verbot. Norm: Immutable-Law-Catalog.", "rules": [{"id": "W2", "catalog_ref": [], "class": "preferred", "severity": "info", "check": "regex", "category": "javascript", "description": "XMLHttpRequest is not a Catalog HARD BAN. Prefer fetch() on the target platform.", "pattern": "\\bXMLHttpRequest\\b", "file_patterns": ["*.js"], "exemptions": [], "no_catalog_ref_reason": "XMLHttpRequest ist im Law Catalog nicht verboten; die Sonde ist ein reiner Modernisierungs-Hinweis zugunsten von fetch(). Bewusst norm-frei."}, {"id": "W3", "catalog_ref": ["A61"], "class": "hard_ban", "severity": "critical", "check": "regex", "category": "javascript", "description": "Schreibender innerHTML-Zugriff (auch '+=' und ['innerHTML']) sowie setHTMLUnsafe() sind Catalog HARD BAN A61 (XSS-Pfad). Lesender Zugriff bleibt erlaubt. Ersatz: textContent, setHTML(), oder DOMParser + replaceChildren().", "pattern": "\\.\\s*innerHTML\\s*\\+?=(?!=)|\\[\\s*['\\\"]innerHTML['\\\"]\\s*\\]\\s*\\+?=(?!=)|\\bsetHTMLUnsafe\\s*\\(", "file_patterns":
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && python3 -c "
import json
d=json.load(open('tools/antipatterns/project.json'))
for r in d['rules']:
    if r['id'] in ('P3','P4','P5','P6','P7','P8','P9','P10'):
        print('---',r['id'],r.get('class'),r.get('severity'))
        print('pattern:', r.get('pattern','')[:300])
        print('exemptions:', json.dumps(r.get('exemptions'), ensure_ascii=False)[:700])
"
--- P3 hard_ban critical
pattern: \bnew\s+TextFitEngine\b|import.*TextFitEngine|\.scrollWidth\s*>\s*\w*\.clientWidth
exemptions: [{"file": "website/js/document.js", "pattern": "istVoll\\(|scrollWidth\\s*>\\s*\\w+\\.clientWidth"}]
--- P4 hard_ban critical
pattern: beforeInputFormatTypes|beforeInputParagraphTypes
exemptions: []
--- P5 hard_ban critical
pattern: --swipe-x\s*:|var\(\s*--swipe-x|\bsetPointerCapture\s*\(
exemptions: []
--- P6 hard_ban critical
pattern: \bfrom\s+['\"](react|react-dom|vue|svelte|@angular/[\w-]+|jquery)['\"]|\bReact\.createElement\s*\(|\bnew\s+Vue\s*\(
exemptions: []
--- P7 hard_ban critical
pattern: \bfrom\s+['\"](lodash|lodash-es|underscore)['\"]|\b_\.(map|filter|reduce|debounce|throttle|merge|cloneDeep)\s*\(
exemptions: []
--- P8 hard_ban critical
pattern: \bgsap\s*\.|\bfrom\s+['\"](gsap|animejs|motion|@motionone/[\w-]+)['\"]|\banime\s*\(\s*\{
exemptions: []
--- P9 hard_ban critical
pattern: navigator\s*\.\s*serviceWorker|\bserviceWorker\s*\.\s*register\s*\(
exemptions: []
--- P10 hard_ban critical
pattern: \bindexedDB\s*\.\s*open\s*\(|window\.indexedDB|\bnew\s+IDBRequest\b
exemptions: [{"file": "website/js/binary-storage.js", "line_range": "*", "reason": "Einziger erlaubter Ort fuer Binaer-Assets (ADR-BINARY-ASSETS, A34-Ausnahme)"}]
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -rn "data-ueberlauf" website/ | cat
website/css/README.md:52:│   :root[data-theme], [data-plugin-*], [data-ueberlauf], @keyframes     │
website/css/sheet.css:289:din-blatt[data-ueberlauf="true"]::after {
website/css/sheet.css:290:  content: "⚠️ Text übersteigt Seite 1 (ca. +" attr(data-ueberlauf-zeilen) " Zeilen)";
website/css/sheet.css:317:  din-blatt[data-ueberlauf="true"]::after {
website/js/document.js:795:   * Setzt data-ueberlauf und data-ueberlauf-zeilen am din-blatt.
website/js/document.js:821:          blatt.setAttribute('data-ueberlauf', 'true');
website/js/document.js:826:          blatt.setAttribute('data-ueberlauf-zeilen', String(estimatedLines));
website/js/document.js:828:          blatt.removeAttribute('data-ueberlauf');
website/js/document.js:829:          blatt.removeAttribute('data-ueberlauf-zeilen');
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && echo "=== who reads data-ueberlauf (live CSS) ===" && grep -l "data-ueberlauf" website/css/base.css website/css/sidebar.css website/css/sheet-common.css website/css/sheet-multipage.css 2>/dev/null; echo "(leer = niemand)"; echo "=== UIProtections.init callers ==="; grep -rn "setupOverflowDetector\|new UIProtections" website/js/ | cat
=== who reads data-ueberlauf (live CSS) ===
(leer = niemand)
=== UIProtections.init callers ===
website/js/document.js:424:    this.setupOverflowDetector();
website/js/document.js:797:  setupOverflowDetector() {
website/js/main.js:142:  const uiProtections = kritischerWert('UI-Schutz-Objekt', () => new UIProtections());
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && echo "file,getElementById,querySelector" && for f in website/js/*.js; do printf "%s,%s,%s\n" "$(basename $f)" "$(grep -c 'getElementById' $f)" "$(grep -c 'querySelector' $f)"; done | column -t -s,
file,getElementById,querySelector
addons.js                0   0
address-data.js          0   0
address.js               1   2
binary-storage.js        0   0
boot.js                  0   0
boot-state.js            13  0
clipboard-parser.js      0   0
core.js                  2   0
document.js              11  8
draft-manager.js         14  6
field.js                 0   0
font-feature.js          4   1
format.js                1   0
main.js                  17  2
multipage-controller.js  9   0
persistence.js           10  1
salutation.js            10  0
settings.js              18  1
signature.js             5   0
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/BriefNEO 2>/dev/null; cd /home/moritz/repos/DIN-BriefNEO && sed -n '516,600p' website/js/persistence.js
export function parseDinLetterPayload(input) {
  /** @type {any} */
  let data;
  if (typeof input === 'object' && input !== null) {
    data = input;
  } else if (typeof input === 'string') {
    const text = input.replace(/^\uFEFF/, '');
    try {
      data = JSON.parse(text);
    } catch {
      return { ok: false, reason: 'Keine gültige JSON-Datei.', error: 'Keine gültige JSON-Datei.' };
    }
  } else {
    return { ok: false, reason: 'Ungültiges Argument (String oder Objekt erwartet).', error: 'Ungültiges Argument (String oder Objekt erwartet).' };
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, reason: 'Keine gültige DIN-Brief-Datei (.json, Objekt erwartet).', error: 'Keine gültige DIN-Brief-Datei (.json, Objekt erwartet).' };
  }
  if (data.format !== DINLETTER_FORMAT) {
    return { ok: false, reason: `Falsches Format — erwartet '${DINLETTER_FORMAT}'.`, error: `Falsches Format — erwartet '${DINLETTER_FORMAT}'.` };
  }
  if (data.schema_version !== 5) {
    return {
      ok: false,
      reason: `Nur Schema v5 wird unterstützt (erhalten: v${data.schema_version}).`,
      error: `Nur Schema v5 wird unterstützt (erhalten: v${data.schema_version}).`
    };
  }
  if (!Array.isArray(data.fields) || !Array.isArray(data._meta?.schema)) {
    return {
      ok: false,
      reason: 'Ungültiges Schema-v4-Dokument: fields (Array) und _meta.schema (Array) sind zwingend erforderlich.',
      error: 'Ungültiges Schema-v4-Dokument: fields (Array) und _meta.schema (Array) sind zwingend erforderlich.'
    };
  }

  const schema = data._meta.schema;
  const rawFields = data.fields;
  const fields = /** @type {Record<string, string | boolean>} */ (Object.create(null));

  for (let i = 0; i < schema.length; i++) {
    const key = schema[i];
    if (typeof key !== 'string' || key === 'constructor' || key === 'prototype' || key === '__proto__' || !/^[A-Za-z][\w-]*$/.test(key)) {
      return { ok: false, reason: `Ungültiger Feldname '${key}'.`, error: `Ungültiger Feldname '${key}'.` };
    }
    const val = rawFields[i];
    const istToggle = key.startsWith('toggle-');
    if (istToggle) {
      if (val !== undefined && typeof val !== 'boolean') {
        return { ok: false, reason: `Ungültiger Feldtyp bei '${key}'.`, error: `Ungültiger Feldtyp bei '${key}'.` };
      }
      fields[key] = val === true;
    } else {
      if (val !== undefined && val !== null && typeof val !== 'string') {
        return { ok: false, reason: `Ungültiger Feldtyp bei '${key}'.`, error: `Ungültiger Feldtyp bei '${key}'.` };
      }
      fields[key] = typeof val === 'string' ? val : '';
    }
  }

  /* Kanonische Reihenfolge prüfen (P4, 2026-11-10): Ohne diese Prüfung würde
   * eine Datei mit vertauschten Feldnamen importiert und die Werte still
   * falsch zugeordnet. Die Form-Prüfung oben bleibt zuerst, damit ein kaputter
   * Feldname die spezifischere Meldung bekommt. */
  if (schema.length !== DOCUMENT_SCHEMA_V5.length) {
    return {
      ok: false,
      reason: `_meta.schema hat ${schema.length} Felder, erwartet ${DOCUMENT_SCHEMA_V5.length}.`,
      error: `_meta.schema hat ${schema.length} Felder, erwartet ${DOCUMENT_SCHEMA_V5.length}.`
    };
  }
  for (let i = 0; i < DOCUMENT_SCHEMA_V5.length; i++) {
    if (schema[i] !== DOCUMENT_SCHEMA_V5[i]) {
      return {
        ok: false,
        reason: `_meta.schema[${i}] ist '${schema[i]}', erwartet '${DOCUMENT_SCHEMA_V5[i]}'.`,
        error: `_meta.schema[${i}] ist '${schema[i]}', erwartet '${DOCUMENT_SCHEMA_V5[i]}'.`
      };
    }
  }

  /** @type {Partial<DinLetterLayout>} */
  const layout = Object.create(null);
  if (data.layout !== undefined) {
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && sed -n '1,40p' website/index.html
<!-- @adr [[ADR-HTML]]  -->
<!-- @guide [[din-5008-css-architektur]]  -->

<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f5f7fa">
    <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1e2025">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <meta name="description" content="Normgerechter, datenschutzfreundlicher Brief-Editor nach DIN 5008 für geschäftliche und private Korrespondenz. Daten bleiben lokal (Adress-Suche optional extern).">
    <link rel="canonical" href="https://grapefruit89.github.io/DIN-BriefNEO/">
    <meta property="og:url" content="https://grapefruit89.github.io/DIN-BriefNEO/">
    <meta property="og:title" content="DIN-BriefNEO | Normgerechter DIN-5008-Briefgenerator">
    <meta property="og:description" content="Normgerechter, datenschutzfreundlicher Brief-Editor nach DIN 5008 für geschäftliche und private Korrespondenz.">
    <meta property="og:type" content="website">
    <meta property="og:image" content="https://grapefruit89.github.io/DIN-BriefNEO/website/og-image.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="DIN-BriefNEO – Brief-Editor nach DIN 5008">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="https://grapefruit89.github.io/DIN-BriefNEO/website/og-image.png">
    <!-- CSP: keine 'unsafe-inline'/'unsafe-eval'. Es gibt kein layers.css;
         alle Styles kommen aus den vier externen Dateien unter css/. Der Boot
         ist ein externes Classic-Script (js/boot.js), daher braucht die CSP
         weder Inline-Hash noch Nonce. connect-src erlaubt nur die
         A38-Allowlist (optionale Tier-2-Fach-API, ohne Key tot). -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self' data: blob:; img-src 'self' data: blob:; connect-src 'self' https://api.geoapify.com https://api-eu.geoapify.com; object-src 'none'; base-uri 'self'; form-action 'none'; frame-src 'none'; worker-src 'none'">
    <title>DIN-BriefNEO | Pure Refactored</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2036%2036'%3E%3Crect%20width%3D'36'%20height%3D'26'%20y%3D'5'%20fill%3D'%23ccd6dd'%20rx%3D'4'%2F%3E%3Cpath%20stroke%3D'%2399aab5'%20stroke-linecap%3D'round'%20stroke-width%3D'2'%20d%3D'm2%2029%2013-13m6%200%2013%2013'%2F%3E%3Cpath%20fill%3D'%2399aab5'%20d%3D'M4%205h28a4%204%200%200%201%204%204v2L21%2025a5%205%200%200%201-6%200L0%2011V9a4%204%200%200%201%204-4'%2F%3E%3Cpath%20fill%3D'%23e1e8ed'%20d%3D'M4%205h28a4%204%200%200%201%204%204L21%2022a4%204%200%200%201-6%200L0%209a4%204%200%200%201%204-4'%2F%3E%3C%2Fsvg%3E">
    <link rel="stylesheet" href="css/base.css?v=live6">
    <link rel="stylesheet" href="css/sidebar.css?v=live7">
    <link rel="stylesheet" href="css/sheet-common.css?v=common1">
    <link rel="stylesheet" href="css/sheet-multipage.css?v=multi1">
    <script src="js/boot.js?v=boot2"></script>
    <script type="module" src="js/main.js?v=live6"></script>
  </head>
  <body>
    <a href="#viewport" class="skip-link">Zum Briefkern springen</a>
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && sed -n '68,120p' website/js/signature.js && echo "=== font-feature init ===" && grep -n "init()" -A 25 website/js/font-feature.js | head -35
}

    this.initWysiwyg();

    // Bild liegt als Blob in IndexedDB; der Restore ist async und erscheint nach dem Paint.
    /* Blob-Restore ist async: der Container (#unterschriftsbild-container) ist
       absolut positioniert und anfangs display:none — das CSS schliesst den
       data:image/svg-Platzhalter im src aus (sheet-common.css). Er erscheint
       mit dem Bild und verschiebt das Blatt nicht, weil er aus dem Fluss ist.
       Akzeptiert wie der Systemschrift-FOUC in font-feature.js (Befund B13:
       die Begruendung "Platz reserviert" war falsch, die Entscheidung richtig).
       Ein Ladefehler bleibt bewusst STILL (entschieden 2026-11-13): Signatur
       ist optional, Speichern meldet Fehler dagegen sichtbar (Toast). */
    loadBlob('signature').then((blob) => {
      if (!blob) return;
      this.#setImageFromBlob(blob);
      this.applyTransform();
      this.#updateButtonState(true);
    });
  }

  initWysiwyg() {
    const bbox = this.bbox;
    const container = this.container;
    if (!bbox || !container) return;

    const savedState = this.settings?.signatureState || this.settings?.signature?.transform;
    if (savedState) {
      this.state = {
        x: typeof savedState.x === 'number' && Number.isFinite(savedState.x) ? savedState.x : 11.9,
        y: typeof savedState.y === 'number' && Number.isFinite(savedState.y) ? savedState.y : 96.0,
        scale: typeof savedState.scale === 'number' && Number.isFinite(savedState.scale)
          ? Math.max(0.15, Math.min(4.5, savedState.scale))
          : 0.5,
        rot: typeof savedState.rot === 'number' && Number.isFinite(savedState.rot) ? savedState.rot : 0
      };
    }
    this.applyTransform();

    /** @type {{
     *   action: string | null,
     *   startX: number, startY: number,
     *   centerX: number, centerY: number,
     *   startAngle: number, startDistance: number,
     *   pxToCqw?: number,
     *   initial: {x: number, y: number, scale: number, rot: number} | null
     * }} */
    const interaction = {
      action: null,
      startX: 0, startY: 0,
      centerX: 0, centerY: 0,
      startAngle: 0, startDistance: 0,
      pxToCqw: 0.125,
=== font-feature init ===
59:  init() {
60-    this.applyInitialFont();
61-    this.attachListeners();
62-    this.initFontInjection();
63-    this.#initSystemFonts();
64-    this.isReady = true;
65-  }
66-
67-  /* --- Systemschriften (Local Font Access API) ---------------------------
68-   * `queryLocalFonts()` liefert die auf dem Rechner installierten Familien.
69-   * Der Browser fragt beim ersten Aufruf nach Erlaubnis; ohne Erlaubnis wirft
70-   * die API `NotAllowedError`. Dann bleibt es beim Standard-Stack — der Knopf
71-   * ist da, die Liste unveraendert.
72-   *
73-   * Die Schriften werden NICHT gespeichert: die Berechtigung gilt pro Sitzung
74-   * fuer den Origin, die Liste wird bei Bedarf neu abgefragt. Ein Eintrag im
75-   * `previewFont`-Feld ueberlebt deshalb keinen Reload, und das ist Absicht
76-   * (sonst zeigte ein Brief auf eine Schrift, die es auf dem Zielrechner
77-   * vielleicht nicht gibt). */
78-  /**
79-   * Die API steht nicht im lib.dom von TypeScript 5.x — deshalb der Umweg
80-   * ueber `globalThis` mit Cast, statt die Typen zu erweitern.
81-   * @returns {(() => Promise<any[]>) | null}
82-   */
83-  #queryLocalFontsApi() {
84-    const api = /** @type {any} */ (globalThis).queryLocalFonts;
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -n "#initSystemFonts" -A 30 website/js/font-feature.js | head -40
63:    this.#initSystemFonts();
64-    this.isReady = true;
65-  }
66-
67-  /* --- Systemschriften (Local Font Access API) ---------------------------
68-   * `queryLocalFonts()` liefert die auf dem Rechner installierten Familien.
69-   * Der Browser fragt beim ersten Aufruf nach Erlaubnis; ohne Erlaubnis wirft
70-   * die API `NotAllowedError`. Dann bleibt es beim Standard-Stack — der Knopf
71-   * ist da, die Liste unveraendert.
72-   *
73-   * Die Schriften werden NICHT gespeichert: die Berechtigung gilt pro Sitzung
74-   * fuer den Origin, die Liste wird bei Bedarf neu abgefragt. Ein Eintrag im
75-   * `previewFont`-Feld ueberlebt deshalb keinen Reload, und das ist Absicht
76-   * (sonst zeigte ein Brief auf eine Schrift, die es auf dem Zielrechner
77-   * vielleicht nicht gibt). */
78-  /**
79-   * Die API steht nicht im lib.dom von TypeScript 5.x — deshalb der Umweg
80-   * ueber `globalThis` mit Cast, statt die Typen zu erweitern.
81-   * @returns {(() => Promise<any[]>) | null}
82-   */
83-  #queryLocalFontsApi() {
84-    const api = /** @type {any} */ (globalThis).queryLocalFonts;
85-    return typeof api === 'function' ? api : null;
86-  }
87-
88:  #initSystemFonts() {
89-    if (!this.btnSystemFonts) return;
90-    if (!this.#queryLocalFontsApi()) return;
91-    this.btnSystemFonts.hidden = false;
92-    this.btnSystemFonts.addEventListener('click', () => {
93-      void this.ladeSystemschriften();
94-    });
95-  }
96-
97-  async ladeSystemschriften() {
98-    const btn = this.btnSystemFonts;
99-    const api = this.#queryLocalFontsApi();
100-    if (!api) return;
101-    if (btn) btn.disabled = true;
102-    try {
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && python3 - <<'EOF'
import re
for f in ['website/css/base.css','website/css/sheet-common.css','website/css/sheet-multipage.css','website/css/sidebar.css']:
    lines=open(f).read().split('\n')
    depth=0; inprint=None; hits=[]
    for i,l in enumerate(lines,1):
        if re.search(r'@media\s+print', l): inprint=depth
        for c in l:
            if c=='{': depth+=1
            elif c=='}':
                depth-=1
                if inprint is not None and depth<=inprint: inprint=None
        if '!important' in l and not l.strip().startswith(('*','/*')) and inprint is None:
            hits.append(i)
    print(f, len(hits), hits)
EOF
website/css/base.css 8 [19, 49, 64, 65, 66, 67, 68, 76]
website/css/sheet-common.css 2 [589, 648]
website/css/sheet-multipage.css 26 [63, 81, 82, 83, 84, 85, 91, 92, 93, 100, 101, 102, 103, 104, 105, 110, 111, 112, 113, 114, 115, 116, 139, 293, 491, 492]
website/css/sidebar.css 3 [306, 307, 1328]
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && sed -n '288,296p' website/css/sheet-multipage.css && echo "---sidebar 300-310---" && sed -n '298,310p' website/css/sidebar.css && echo "---sidebar 1320-1330---" && sed -n '1318,1330p' website/css/sidebar.css
display: block;
    overflow: visible;
  }

  #spacer {
    display: block !important;
    height: var(--spacer-hoehe);
    min-height: var(--spacer-hoehe);
    max-height: var(--spacer-hoehe);
---sidebar 300-310---

/* Motion-Präferenz: Animationen bei reduzierter Bewegung deaktivieren */
@media (prefers-reduced-motion: reduce) {
  .segmented-control::before,
  .btn,
  .btn-ghost,
  .input-field,
  .select-chevron {
    transition: none !important;
    transform: none !important;
  }
}

---sidebar 1320-1330---
   Einstellungen aktiv ist. Standard ist aus: die Anwendung verhaelt sich ohne
   das Addon wie vorher (kein Fussblock, keine Zusatzfelder). */
:root:not([data-plugin-geschaeftsangaben="true"]) [data-addon="geschaeftsangaben"],
:root[data-plugin-geschaeftsangaben="false"] [data-addon="geschaeftsangaben"] {
  display: none;
}

/* --- PLUGINS (Schalter in den Einstellungen) ---
   Elemente erscheinen nur, wenn das jeweilige Plugin aktiv ist. Die Attribute
   setzt SettingsManager.#applyPlugins() aus din_settings. */
:root[data-plugin-testbrief="false"] #btn-testbrief { display: none !important; }
> build · deepseek-v4.1-flash
[0m$ [0mcd /home/moritz/repos/DIN-BriefNEO && grep -rn "btn-testbrief" website/css/*.css website/index.html | cat
website/css/sidebar.css:1328::root[data-plugin-testbrief="false"] #btn-testbrief { display: none !important; }
website/index.html:223:          <button type="button" id="btn-testbrief" class="btn btn-ghost w-full" data-addon="testbrief" data-addon-action="start" title="Zufälligen Testbrief mit zwei Figuren generieren">
> build · deepseek-v4.1-flash
## Verdikt

Der Code ist handwerklich überdurchschnittlich (EventBus, `@layer screen`-Ansatz, IMR-Geometrie-Registry, Lazy-Addon-Vertrag, CSP ohne `unsafe-inline`). Das Problem ist nicht Schlamperei, sondern **ein fehlendes Zustandsmodell**, das an vier Stellen kompensiert wird: DOM-Attribute, drei Boot-Stufen, CSS-Messung per `attr()` und JS-Layoutmessung. Jede dieser Stellen hat historisch einen Fehler geheilt und dabei eine zweite Wahrheit erzeugt. Die eigene ADR von gestern ([`ADR-KISS-MINIMAL-JS`](file:///home/moritz/repos/DIN-BriefNEO/docs/norm/ADR-KISS-MINIMAL-JS.md), 2026-11-20) beschreibt exakt diese Krankheit — der Code implementiert sie noch.

---

## 1. Pflicht-Tabelle: Top-Architektur-Fauxpasses

| Schwere | Ort | Symptom / Denkfehler | Warum es ein Hack ist | Saubere Lösung |
|---|---|---|---|---|
| **Hoch** | `/home/moritz/repos/DIN-BriefNEO/website/js/document.js:797-859` (Aufruf `:424`, Start `main.js:142`) | `setupOverflowDetector()` misst bei jedem Tastendruck (`debounce 200ms`) + via `ResizeObserver` `scrollHeight`, `getComputedStyle(lineHeight)` und schreibt `data-ueberlauf` / `data-ueberlauf-zeilen` ans `<din-blatt>` (`:821,826,828`) | **Kein lebendes Stylesheet liest diese Attribute.** Einziger Leser ist `website/css/sheet.css:289-290` — die Datei ist per eigenem Kopf (`sheet.css:5-19`) „STILLGELEGT, NICHT EINBINDEN" und wird in `index.html:32-35` nicht geladen. Es läuft also eine Messmaschine mit vollem Preis für eine Warnung, die niemand sieht; „Text übersteigt Seite 1" ist im Mehrseiten-Modus ohnehin konzeptionell überholt | Entweder Löschen (`document.js:424` + Methode) oder den Warntext in `sheet-multipage.css` rendern — nie beides halb. Vorher `tools/mess.js`-Beleg, dass niemand den Zustand braucht |
| **Hoch** | `/home/moritz/repos/DIN-BriefNEO/website/js/address.js:693,718,745` · `document.js:761,912,927` · `draft-manager.js:346-349` · `format.js:404` · `salutation.js:205,266,277,309` · `address-data.js:997,1003,1007` | **Fünf DOM-Attribute + drei Closure-Variablen für eine einzige Frage: „Wem gehört dieses Feld?"** — `data-dirty` (Nutzer hat getippt), `data-quelle` (auto/manuell, wird persistiert), `data-autofilled`, `data-autofill-aus` (Sperre), `data-wired`/`data-delegated` (Verdrahtung), dazu `rueckModus`, `unterschriftModus`, `schreibeGerade` in `address.js:671-676` | Dasselbe Konzept hat je Feld eine andere Lebensdauer: `data-quelle` überlebt Reload (`document.js:913`), `data-dirty` nur bis zum Reload — außer `datum__dirty` (`document.js:927`). `format.js:404` und `salutation.js:309` interpretieren `data-dirty` unterschiedlich (Datum: „nicht überschreiben", Anrede: „nicht neu generieren"). Kein Ort kann die Invariante prüfen | Ein `FieldState`-Modul: `{ value, origin: 'user'\|'auto'\|'import', dirty: boolean }` pro Feld-ID, ein Owner, Persistenz als Teil des Drafts. Attribute sind danach **nur Render-Output** (eine Richtung) |
| **Hoch** | `/home/moritz/repos/DIN-BriefNEO/website/js/boot.js:75-76` · `main.js:243,254` · `draft-manager.js:364,382,468-469` · `website/addons/testbrief/testbrief.js:1390,1394,1402` | `data-anlagen` hat **6**, `data-fuss` **5** Schreibstellen am `<html>` | Das ist wörtlich das, was `docs/norm/ADR-KISS-MINIMAL-JS.md:101-102` (Regel 3) verbietet: „native Zustände durch zusätzliche JS-Schreiber (`setAttribute('data-...')`) ummanteln". `testbrief.js:1390` setzt sogar Checkbox **und** Attribut manuell, statt `change` zu feuern und den einen Listener zu lassen | Ein Schreiber (Ableitung aus `collectDraft`-Zustand), Checkboxen sind die einzige Eingabe. Restliche Aufrufe löschen |
| **Hoch** | `/home/moritz/repos/DIN-BriefNEO/website/js/boot.js:17-95` · `boot-state.js:115-163` · `draft-manager.js:272-386` | **Drei Boot-Stufen schreiben dieselbe Wahrheit**: Theme/Layout-Attribute (boot.js), dann alle Feldwerte (boot-state.js), dann nochmal alle Feldwerte sanitisiert (draft-manager). Zusätzlich zwei Ready-Flags (`data-seeded`, `data-ready`) + 2-s-Notnetz (`boot.js:93-95`) | `boot-state.js:147-148` schreibt gespeichertes HTML **ungefiltert** per `DOMParser` + `replaceChildren` ins `#text`; `:129-131` behauptet „was hier ankommt, ist bereits gesäubert". Das gilt für Autosave, **nicht** für den Import-Pfad (`persistence.js:769` schreibt `pendingImport.fields` roh in `localStorage`, dann `location.reload()`). Die schwächere Sicherheitsgrenze läuft also zuerst, die sanitisierende (`draft-manager.js:328`) danach. Heute fängt nur die CSP (`index.html:29`) Inline-Handler ab | Provisorium: `boot-state.js` bekommt denselben Allowlist-Sanitizer (klassisches Skript → Sanitizer als eigenes Classic-Script oder inline-Kopie mit Ratsche). Strukturell: boot-state auf Theme/Layout reduzieren, Feldwerte **einmal** über den sanitisierenden Pfad |
| **Hoch** | `/home/moritz/repos/DIN-BriefNEO/website/css/base.css:257-265` **vs.** `website/css/sheet-multipage.css:49-57` | `@function --mm-x/--mm-y/--pt` ist **zweimal definiert, mit gegensätzlicher Semantik**: base.css relativ (`--mm-rel-*` → `cqw/cqh`), sheet-multipage.css absolut (`--mm-abs-*` → `1mm/1pt`) | Laut Spezifikation gewinnt bei gleichem Namen die **spätere** Definition (`css-mixins-1 §2.1`: „rules defined later win within the same layer" — belegt, siehe Quellen). Da `sheet-multipage.css` als letztes `<link>` steht (`index.html:32-35`), meinen `--mm-y()` in `sheet-common.css:29-36` und `--pt()` in `:235` in Wahrheit die **absolute** Variante. Die Definitionen in `base.css` sind toter Code, `website/css/README.md:103` und `sheet.css:47-49` beschreiben die tote Semantik. Wer die vier `<link>`-Tags umsortiert oder das „Duplikat" in sheet-multipage entfernt, verschiebt **jede** vertikale Position und jede Schriftgröße im Brief | Nur **eine** Definition pro Name, in einer Datei, mit Unit im Namen (`--mm-abs-y`, `--mm-rel-y`), Aufrufer eindeutig. Kein Override per Ladereihenfolge |
| **Hoch** | `/home/moritz/repos/DIN-BriefNEO/website/js/main.js:6-7` · `address.js:1342-1344,833-838` | 115 KB von 305 KB Boot-JS (38 %) sind die **optionale** Adress-Domäne (`address.js` 52 KB + `address-data.js` 39 KB + `clipboard-parser.js` 24 KB), statisch importiert. `initAddressServices()` startet beim Boot `AddressIntelligence.init()` (2 × gzip-Fetch à 121 KB, Indexaufbau) und bei gespeichertem Key einen **Netz-Heartbeat** (`:837`) | Der Lazy-Vertrag existiert im Projekt bereits und funktioniert (`addons.js:31-35`, 0 Byte im Boot-Pfad). Die Adresssuche ist derselbe Fall, wird aber wie Kern behandelt. `address-data.js` ist außerdem nach eigenem Anspruch (`:14`) DOM-frei und wird trotzdem im Boot geladen | `import('./address.js')` beim ersten `focus` auf `#input-anschrift-suche` bzw. `#plz-suggestions-popover`; Heartbeat erst bei Key-Eingabe. Addon-Mechanik wiederverwenden statt neu erfinden |
| **Mittel-Hoch** | `/home/moritz/repos/DIN-BriefNEO/website/css/sheet-multipage.css:77-117` (+ `:139`, `:293`) mit Druckblock `:520-552` | **22 `!important` in Screen-Regeln**, weil die Regeln nicht in `@media screen` stehen und deshalb auch im Druck gelten. Der Druckblock muss sie mit `#app-shell #viewport` (2,0,0) überbieten; der Kommentar `:514-519` dokumentiert den Spezifitätskrieg offen | Genau die vermeidbare Gruppe, die `docs/meta/BACKLOG.md:116-120` als „unvermeidbare Medien-Firewall" einfriert. Vermeidbar ist sie durch Medienklammerung, nicht durch höhere Spezifität. `website/css/README.md:116` behauptet zudem „!important fast ausschließlich im Print-Block" — gemessen sind es 94 in lebenden Dateien, davon 25 außerhalb `@media print` | `77-117` in `@media screen` klammern; danach braucht der Print-Block für `padding/display/container-type/overflow` kein `!important`. Prüfung mit `tools/geometrie-zustaende.mjs` + `tools/druck-pixel.mjs` (beide vorhanden) |
| **Mittel-Hoch** | `/home/moritz/repos/DIN-BriefNEO/website/js/multipage-controller.js:48-77,80-82` | Seitenzahl wird **durch Messen** ermittelt: `#probe` (1000 mm hoch) → `getBoundingClientRect`, `getComputedStyle(document.documentElement)` für `--seite`/`--luecke`, dann `body.dataset.seiten` **und** `viewport.dataset.seiten` | Doppelter Schreiber für einen Wert, den CSS zweimal liest (`sheet-multipage.css:77-117`) — beide Pfade müssen synchron bleiben. Der `ResizeObserver` auf `#kern` (`:116`) schreibt in ein Attribut, das CSS-Layout von `#viewport`/`#brief-ansicht` ändert; ein Mess-Schreib-Mess-Zyklus | Ein Schreiber (nur `body`), CSS liest nur diesen. Perspektivisch: Seitenzahl aus CSS (`counter(pages)` im Druck, `column-count`-Ableitung), nicht aus JS-Geometrie |
| **Mittel** | `/home/moritz/repos/DIN-BriefNEO/website/js/address.js:30` ↔ `website/js/clipboard-parser.js:13` | **Zirkulärer ESM-Import** zwischen den zwei größten Modulen (`ClipboardAddressParser` ↔ `bindListSelection`/`feld`) | Funktioniert nur, weil beide Partner erst **innerhalb** von Methoden benutzt werden (`clipboard-parser.js:463-604`) — kein Top-Level-Zugriff. Eine harmlose Umstellung (Modul-Level-Konstante) erzeugt TDZ-Fehler zur Ladezeit, die im Browser als „Cannot access before initialization" auftauchen | `feld()` und `bindListSelection` in ein neutrales `dom-refs.js` / `listbox.js` ziehen; `clipboard-parser` importiert nicht mehr `address.js` |
| **Mittel** | `/home/moritz/repos/DIN-BriefNEO/website/js/address-data.js:14` vs. `:992-1013,1023` | Modul behauptet „100 % DOM- und import-frei", nimmt aber DOM-Elemente an (`ortEl.setAttribute?.()`), und `wireDOM` ist ein Stub, der von `address.js:147` **monkey-patched** wird | Die Schichtgrenze wird per Duck-Typing (`{textContent, setAttribute?}`) umgangen, damit die Behauptung im Dateikopf stimmt. Zwei Owner für eine Klassenmethode | Entweder ehrlich UI-Modul (dann `Field` importieren) oder reine Domäne (dann `applySelection` gibt ein Ergebnisobjekt zurück, das die UI anwendet) |
| **Mittel** | 15 Stellen, u. a. `/home/moritz/repos/DIN-BriefNEO/website/js/document.js:315,377,536,562,716,748` · `main.js:292` · `address.js:683` · `clipboard-parser.js:475-490` | **DOM-Mutation als Event-Ersatz**: Programm schreibt Wert, feuert `new Event('input')`, damit Listener „Nutzer hat getippt" glauben. `address.js:198` braucht deshalb `ev.isTrusted`, um eigene Events zu erkennen | Ein Ereignis, das „Nutzer" bedeutet, wird vom Programm erzeugt. Jeder neue `input`-Listener muss wissen, dass er lügen kann — diese Regel steht nur in einem Kommentar (`address.js:193-197`). Der globale Speicher-Listener (`main.js:221-228`) speichert folglich auch programmatische Schreibvorgänge | Getrennte Topics im vorhandenen `eventBus` (`DOCUMENT_CHANGED` vs. `FIELD_EDITED_BY_USER`); kein synthetisches `input` mehr |
| **Mittel** | `/home/moritz/repos/DIN-BriefNEO/website/js/document.js:886-939` · `draft-manager.js:166-243` · `persistence.js:759,787-789` | **Speichern = gesamtes DOM serialisieren**: `collectDraft()` liest alle Felder, sanitisiert jedes Rich-Feld, `JSON.stringify` für den Undo-Vergleich. Import kann Zustand nur per `location.reload()` anwenden („EIN Owner" = der Boot-Pfad) | Es gibt keine Zustandsschicht, also ist der einzige Weg, einen Zustand „anzuwenden", die Seite neu zu booten. Jede Tastenpause kostet O(ganzes Dokument) | Mit `FieldState` (Zeile 2) werden Dirty-Sets und `applyState(state)` möglich; Reload entfällt |
| **Niedrig** | `/home/moritz/repos/DIN-BriefNEO/website/css/sidebar.css:1328` | `:root[data-plugin-testbrief="false"] #btn-testbrief { display: none !important; }` — der Selektor ist (2,1,0), der einzige Gegner `.btn` (0,1,0) | **Nachweislich unnötiges `!important`** (keine konkurrierende Regel für `#btn-testbrief`, geprüft). Widerspricht der Freeze-Begründung „alle 90 sind unvermeidbar" (`BACKLOG.md:120`) | `!important` streichen; Regel gewinnt ohnehin |
| **Niedrig** | `/home/moritz/repos/DIN-BriefNEO/website/index.html:338-411` · `website/css/README.md:42` | 17 `din-*`-Tags, **0 × `customElements.define`** im ganzen Repo; 10 davon (`din-text`, `din-kern`, `din-infoblock`, `din-anschriftfeld`, `din-briefkopf`, …) haben **0 CSS-Referenzen** | Die Doku nennt `<din-blatt>` ein „Custom Element" — es ist ein unbekanntes HTML-Element ohne Lifecycle, ohne Kapselung, ohne Vertrag. Das erzeugt ein Komponentenmodell, das nur in der Doku existiert | Entweder echte Custom Elements (dann Lifecycle/Attribute-Vertrag) oder ehrlich „semantische Marker" nennen und die 10 refe­renzlosen Tags entfernen |
| **Niedrig** | `/home/moritz/repos/DIN-BriefNEO/test/all.js:5287-5293,5303-5317` · `boot-state.js:160-162` vs. `format.js:382-390` | Tests namens „Ratsche" **zementieren Duplikate**: `istAn` muss in boot.js und boot-state.js zeichengleich stehen, `FELD_SELECTOR` in zwei Dateien; das Datumsformat ist in `boot-state.js` nachgebaut | Architekturschuld wird per Test geschützt statt beseitigt. Jede Änderung muss an 2–3 Stellen erfolgen, der Test verhindert nur die *unstimmige* Variante | Duplikat beseitigen (gemeinsames Classic-Script `boot-shared.js`), dann kann der Test auf „eine Quelle" prüfen |

---

## 2. Ihre vier Kernfragen — direkte Antworten

**1) DOM als State-Store / CSS-Zustands-Hacks**
Ja, aber differenziert: `A60` *verlangt* DOM-Zustand für UI-Toggles — das ist richtig und kein Fehler. Missbrauch liegt dort, wo DOM **nicht nur Anzeige** ist: (a) `dataset.state === 'loaded'` entscheidet, **was ein Klick tut** (`signature.js:62`, `font-feature.js:346`) — Verhalten hängt an einem Darstellungsattribut; (b) Feldbesitz in fünf Attributen (§ Tabelle Zeile 2); (c) `settings.js:232-238` liest die Statuszeile aus `selectedOptions[0].textContent` („die Liste ist die Anzeige-Wahrheit") — Anzeige als Datenquelle; (d) `data-ueberlauf` ohne Leser. `attr(data-*)` selbst ist **gut abgesichert** (`tools/imr.js` prüft Registry ↔ HTML ↔ Code), problematisch ist nur die doppelte `@function`-Semantik (Zeile 5) und der stille Fehlermodus: fehlt ein `data-*-y-*`-Attribut, wird `top: var(--kern-y)` ungültig und die DIN-Geometrie fällt lautlos auf `auto`.

**2) Spezifitätskriege / Kaskaden-Defekte**
Die Trennung Bildschirm↔Druck ist **nicht** architektonisch gelöst, sondern per Medienklammer *an manchen* Stellen (`base.css:357`, `sheet-common.css:649,662`) und per `!important` an anderen (`sheet-multipage.css:77-139`). Folge: 94 `!important` in lebenden Dateien, davon 25 außerhalb `@media print`, ein dokumentierter Spezifitätskrieg (`#app-shell #viewport` gegen `body[data-seiten]:not(...) #viewport`, `:514-519`), explizite Spezifitätsrechnung im Kommentar (`base.css:325-328`), und ein Layer-Modell, das nur **eine** Schicht deklariert (`sheet-multipage.css:67`) — der Rest ist ungeschichtet, weshalb `@layer` als Werkzeug faktisch nicht wirkt.

**3) Kopplung & Boot-Pfad**
Der Addon-Pfad ist vorbildlich (`addons.js`, Registry + In-Flight-Lock + AbortController). Der Rest ist das Gegenteil: alles außer `multipage-controller.js` statisch in `main.js`, inklusive 115 KB optionaler Adress-Domäne, Netz-Heartbeat beim Start, IndexedDB-Blob-Restore für die Signatur (`signature.js:81`) und `queryLocalFonts`-Verdrahtung. Zusätzlich greift die „DOM-freie" Datenschicht ins DOM (Zeile 10) und zwei UI-Module importieren sich zirkulär (Zeile 9).

**4) Mutation & Event-Anti-Patterns**
Drei Zyklen: (a) **synthetische `input`-Events** als Zustandsbus mit `isTrusted`-Unterscheidung; (b) **Mess-Schreib-Mess**: `ResizeObserver(#kern)` → `data-seiten` → CSS ändert `#viewport`/`#brief-ansicht` → Layout; (c) **Restore schreibt DOM, DOM-Listener speichert wieder**: `#restoreState` schreibt Felder, jeder Schreiber feuert `input`, `main.js:221` publiziert `DOCUMENT_SAVE_REQUESTED`. Der `#isRestoring`-Flag (`draft-manager.js:31,216`) fängt nur den Undo-Stack, nicht die Speicherkette.

---

## 3. Tiefen-Analyse: die drei gravierendsten Denkfehler

### D1 — „Der DOM ist die Datenbank, die Serialisierung ist der Zustand"

Es gibt keinen Zustand, den man lesen könnte; es gibt nur das DOM und `collectDraft()`. Daraus folgt zwangsläufig: Undo/Redo sind Volltext-Snapshots (`draft-manager.js:231-240`), Feldbesitz muss **im Feld selbst** stehen (fünf Attribute), Import ist nur durch `location.reload()` möglich (`persistence.js:787`), und Speichern kostet das ganze Dokument. Der Beleg, dass das keine Meinung ist: `document.js:912-913` schreibt Herkunft als Pseudo-Feld `${id}__quelle` in den Draft — der Zustand muss also durch die Serialisierung „durchgereicht" werden, weil es keinen Ort gibt, an dem er sonst leben könnte. Und weil das Duplikat unvermeidlich ist, entstehen Ratschen-Tests (`test/all.js:5287`), die das Duplikat schützen. Das ist der Kern: **die Tests bewachen die Schuld, statt sie zu verhindern.**

### D2 — „FOUC bekämpft man mit Schreib-Reihenfolge, nicht mit einem Zustandsmodell"

Drei Stufen (`boot.js` im `<head>`, `boot-state.js` am Body-Ende, `main.js` nach Paint) schreiben nacheinander dieselben Werte, plus zwei Ready-Flags, plus 2-Sekunden-Notnetz, plus `visibility: hidden`-Masken (`sidebar.css:668-671`) und globales `transition: none !important` bis `data-seeded` (`base.css:46-50`). Die eigene ADR sagt seit gestern, dass genau das Overengineering ist (Option A, `ADR-KISS-MINIMAL-JS.md:76,96-102`) — der Code ist weiterhin Option A. Zwei konkrete Kosten: (a) der **billigere** Schreibpfad läuft zuerst und ohne Sanitizer (`boot-state.js:147`, Sicherheitsgrenze nur CSP); (b) `boot-state.js:160-162` dupliziert das Datumsformat aus `format.js:382-390`, was nur per Kommentar zusammengehalten wird („Wer format.js aendert, muss diese Zeile mitpruefen"). Ein Zustandsmodell mit einem Owner würde die drei Stufen auf **eine** reduzieren — und die ADR wäre eingehalten, nicht nur zitiert.

### D3 — „Geometrie gehört gleichzeitig HTML, CSS und JS"

Der Millimeterwert für „Briefkopf Y (Form B)" existiert **vier Mal**: als `data-briefkopf-y-b="45"` (`index.html:341`), als Registry-Eintrag in `docs/norm/IMR-Registry.md`, als `@function`-Aufruf in `sheet-common.css:29` und als zweite `@function`-Definition in `sheet-multipage.css:49`, deren Gültigkeit von der `<link>`-Reihenfolge abhängt. Dazu kommt die Seitengeometrie, die JS **misst** (`multipage-controller.js:56,70`) und als `data-seiten` an zwei Elemente schreibt. Jede Schicht glaubt, sie besitze die Wahrheit. Das IMR-Gate (`tools/reconciler`→`tools/imr.js:151`) prüft nur HTML↔Registry, **nicht** die `@function`-Semantik und nicht den doppelten Attributschreiber. Deshalb ist der gefährlichste denkbare Refactor hier ein „offensichtliches Aufräumen": das Duplikat in `sheet-multipage.css` zu entfernen sieht wie toter Code aus und verschiebt das ganze Blatt.

---

## 4. Handlungsempfehlungen

### Quick-Wins (je < 1 h, einzeln verifizierbar, kein Umbau)

1. **`document.js:424` Overflow-Detektor abhängen** (oder Warnung in `sheet-multipage.css` rendern). Vorher: `data-ueberlauf`-Suche über die vier lebenden CSS-Dateien als Beleg. Größter Sofortgewinn pro Zeile.
2. **`sidebar.css:1328` `!important` streichen.** Kein Gegner > (0,1,0) vorhanden.
3. **`@function`-Dublette auflösen:** absolute Variante nach `base.css`, Löschung in `sheet-multipage.css:49-57`, dann `website/css/README.md:103` und `sheet.css:47-49` korrigieren. Danach `tools/geometrie-zustaende.mjs` vorher/nachher vergleichen.
4. **Addon beim Boot rehydrieren:** eine Zeile in `main.js` nach `initAddonDispatcher()`, die für jedes aktive `data-plugin-*` `toggleAddon(id, true)` ruft. Heute ist „Geschäftsangaben an" nach Reload nur CSS, nie `aktiviere()` (`geschaeftsangaben.js:112`).
5. **Einen Schreiber für `data-anlagen`/`data-fuss`** einführen (`applyRootFlags()`), die vier Fremdschreibstellen (`main.js:243,254`, `draft-manager.js:364,382,468-469`, `testbrief.js:1390,1394,1402`) darauf umstellen. Das ist ADR-Regel 3 und sofort prüfbar.
6. **Boot-State-Sanitizer angleichen** (Allowlist) — die billigste Schließung der zweiten Sicherheitsgrenze.

### Backlog (strukturell, in dieser Reihenfolge)

7. **`FieldState` einführen** (Feld-ID → `{value, origin, dirty}`, ein Owner, Persistenz im Draft). Danach `data-dirty`/`data-quelle`/`data-autofilled`/`data-autofill-aus` auf **abgeleitete** Render-Attribute reduzieren. Das ist der Hebel für D1 und löst Zeilen 2, 12, 15 der Tabelle gleichzeitig.
8. **Boot auf zwei Stufen reduzieren** gemäß `ADR-KISS-MINIMAL-JS`: `boot.js` nur Theme/Layout (bleibt), `boot-state.js` nur die zwei bis drei FOUC-kritischen Regler (oder ganz weg, wie die ADR es verlangt). Feldwerte ausschließlich über den sanitisierenden Pfad.
9. **Adress-Domäne lazy laden:** `import('./address.js')` bei erstem Fokus, Heartbeat erst bei Key-Aktion. Addon-Mechanik wiederverwenden. Erwartung: −115 KB Boot-JS, 2 Fetches weniger beim Start.
10. **Print/Screen-Isolation zu Ende bauen:** `sheet-multipage.css:77-139` in `@media screen`; danach den Print-Block von vermeidbarem `!important` befreien (Pixelvergleich mit `tools/druck-pixel.mjs`). Das ist der einzige Teil von B59, der die Freeze-Begründung „0 Pixel Mehrwert" widerlegt — nicht der ganze B59.
11. **`@layer` konsequent statt punktuell:** entweder `@layer screen, sheet, print` über alle Dateien oder `@layer` als Werkzeug aufgeben und die eine Deklaration (`sheet-multipage.css:67`) entfernen, damit niemand sich auf eine Ordnung verlässt, die es nicht gibt.
12. **Zyklus brechen:** `feld()` → `dom-refs.js`, `bindListSelection` → `listbox.js`. Danach ist `clipboard-parser.js` ein echter Blatt-Knoten.
13. **Gate nachschärfen (Poka-Yoke statt Kommentar):** neue Antipattern-Regel für `scrollHeight`/`getBoundingClientRect`-Polling (die A49-Sonde `tools/antipatterns/project.json` P3 erkennt nur `scrollWidth > clientWidth` und hat dafür eine Ausnahme für `document.js`), plus Regel „jedes `:root[data-*]`-Attribut hat genau eine Schreibstelle".
14. **`location.reload()` beim Import** erst nach Schritt 7 ersetzen (`applyState(draft)`).

### Nicht anfassen ohne Messung

`B59` bleibt eingefroren — aber die Begründung „90 unvermeidbare Barrieren" ist widerlegt (Zeile 13 der Tabelle, plus die 22 Medienklammer-Fälle). Bitte den Freeze-Text präzisieren, nicht aufheben. Ebenso `sheet.css` nicht löschen (Eigentümerentscheidung) — aber die acht Doku-Stellen, die es als aktive Kaskade beschreiben, sollten den Status tragen, den die Datei selbst nennt.

---

## 5. Fairness-Notiz: was ich **nicht** als Hack werte

- `data-*` als CSS-Wahrheit ist per `A60` korrekt und wird durch `tools/imr.js` gegen die HTML-Quelle geprüft — das ist besser als die meisten React-Projekte.
- Der Addon-Vertrag (`ADDON_REGISTRY`, In-Flight-Lock, `AbortController`, `dispose`) ist die Lösung, die Zeile 6 nur konsequent auf die Adressdomäne anwenden müsste.
- Die `@media screen`-Klammern in `sheet-common.css:649,662` und `base.css:357` zeigen, dass das Muster bekannt ist — es fehlt nur die Flächendeckung.
- Die `:has(option:checked:not([value=""]))`-Lösung (`sidebar.css:755`) ist ein echtes Upgrade gegenüber dem gespiegelten Attribut und ein Beleg, dass das Team Hacks auch wieder abbaut.

---

## 6. Beleg-Status

- **Am Code gemessen** (grep/Zeilen/Dateigrößen/`wc`): alle Datei:Zeile-Angaben, Zählungen (94 `!important` live, 25 außerhalb `@media print`), 305 KB statischer Boot-Pfad vs. 80 KB Lazy-Addons, 0 `customElements.define`, 0 lebende Leser von `data-ueberlauf`.
- **Upstream belegt**: `css-mixins-1 §2.1` (Editor's Draft 4.11.2026) — „rules defined later win within the same layer". Damit ist die `@function`-Kollision keine Vermutung.
- **Abgeleitet, nicht am laufenden System gemessen** (Server 8088/CDP 9222 waren aus, Browser habe ich nicht gestartet): die konkrete Pixelwirkung der `@function`-Reihenfolge (sollte bei 210 mm Blattbreite identisch sein, deshalb heute unauffällig), die Ausnutzbarkeit des ungefilterten Boot-Restores (CSP blockt Inline-Handler → **kein** XSS-Nachweis, nur fehlende zweite Verteidigungslinie).
- Keine Dateien geändert → `npm test` / `node tools/build_db.js` nicht nötig.

`RECHERCHE-CALLS: 1 | EXTERN: 1` (W3C `css-mixins-1`; alle übrigen Befunde sind lokale Code-Diagnose)

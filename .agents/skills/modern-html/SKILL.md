---
name: modern-html
description: Tier 1 declarative HTML5 standards, constraint validation, native popovers/dialogs, DIN 5008 custom elements, and accessibility rules for DIN-BriefNEO. Zero-framework, platform-first architecture enforcing 'HTML before CSS before JS' (JavaScript = Krücke). Use whenever creating, modifying, structuring, or auditing HTML markup in DIN-BriefNEO.
---

# Modern HTML (DIN-BriefNEO Tier-1 Guide)

> **Das unumstößliche Kern-Dogma von DIN-BriefNEO:**
> **Alles, was im HTML gemacht werden kann, machen wir im HTML.**
> **Alles, was dort nicht geht, machen wir mit CSS.**
> **Und erst wenn CSS nachweislich nicht ausreicht, kommt JavaScript:**
> 👉 **`JavaScript = Krücke`** — HTML ist die fundamentale Struktur und die erste Verteidigungslinie.

DIN-BriefNEO ist eine reine Vanilla-W3C-Webanwendung auf Baseline **Chrome 150+** (Immutable Law H11). In diesem Projekt übernimmt HTML Aufgaben, für die in traditionellen Frameworks Hunderte Zeilen JavaScript verschwendet werden: Formular-Validierung, Modals, Popovers, Tastatur-Führung und Barrierefreiheit.

---

## 1. Platform-First Formulare & Constraint Validation

Nutze native HTML5-Attribute, um Eingaben direkt im Browser abzusichern, bevor auch nur ein Byte JS ausgeführt wird:

```html
<form class="key-form" id="geoapify-key-form" novalidate>
  <div class="key-row">
    <input
      type="password"
      id="input-geoapify-key"
      name="geoKey"
      pattern="[0-9a-fA-F]{32}"
      minlength="32"
      maxlength="32"
      autocomplete="off"
      spellcheck="false"
      inputmode="text"
      placeholder="Key eingeben…"
      aria-describedby="geoapify-key-msg">
    <button type="button" class="key-remove" aria-label="Key entfernen">✕</button>
  </div>

  <p id="geoapify-key-msg" role="status" aria-live="polite" class="key-msg">
    <span class="msg msg-empty">Bitte Key eingeben (32 Hex-Zeichen).</span>
    <span class="msg msg-valid">✓ Key aktiv und gespeichert.</span>
    <span class="msg msg-invalid">✗ Key ungültig.</span>
  </p>
</form>
```

### Die Goldenen Formular-Regeln:
1. **Format-Gate via `pattern` & `minlength`/`maxlength`:** Ersetzt manuelle JS-Regex-Filter.
2. **Mobile Ergonomie via `inputmode`:**
   - `inputmode="tel"` für Telefonnummern.
   - `inputmode="email"` für E-Mail-Adressen.
   - `inputmode="numeric"` für Postleitzahlen.
3. **Kein versehentlicher Submit:** Buttons innerhalb von Formularen haben immer `type="button"`, sofern sie nicht explizit absenden sollen.
4. **Keine Inline-Event-Handler:** Niemals `onsubmit="return false;"` oder `onclick="..."` schreiben (verstößt gegen CSP `script-src 'self'`).

---

## 2. Deklarative Controls (Popover API & Invoker Commands)

Schalte UI-Elemente ohne JavaScript-Klick-Handler:

### A. Popovers (Dropdowns, Toolbars, Menüs)
```html
<!-- Trigger -->
<button type="button" popovertarget="mein-menue" popovertargetaction="toggle" class="btn">
  Optionen öffnen
</button>

<!-- Popover-Container -->
<div id="mein-menue" popover="auto" class="dropdown-popover">
  <button type="button" class="popover-item">Aktion 1</button>
  <button type="button" class="popover-item">Aktion 2</button>
</div>
```
- Browser verwaltet Fokus, Schließen bei Klick ins Leere (Light Dismiss) und ESC-Taste vollautomatisch.

### B. Native Dialoge mit Invoker Commands (`commandfor`)
```html
<!-- Öffnen per nativem HTML-Invoker (Zero-JS!) -->
<button type="button" commandfor="din-info-dialog" command="show-modal" class="btn">
  ℹ️ Leitfaden öffnen
</button>

<dialog id="din-info-dialog" class="din-dialog" aria-labelledby="dialog-title">
  <div class="dialog-content">
    <h2 id="dialog-title">DIN 5008 Leitfaden</h2>
    <p>Inhalt…</p>
    <!-- Schließen per Form-Method -->
    <form method="dialog">
      <button type="submit" class="btn">Schließen</button>
    </form>
  </div>
</dialog>
```

---

## 3. DIN 5008 Dokument-Struktur & Custom Elements

Der Briefbogen wird aus semantischen Custom Elements aufgebaut:

```html
<din-briefbogen id="sheet" data-form="form-b">
  <din-faltmarke data-pos="105"></din-faltmarke>
  <din-lochmarke data-pos="148.5"></din-lochmarke>
  <din-faltmarke data-pos="210"></din-faltmarke>

  <!-- Anschriftzone (85mm x 45mm) -->
  <din-anschriftfeld id="anschriftfeld" data-x="25" data-w="85" data-h="45">
    <din-rucksendeangabe id="rucksendezeile" contenteditable="plaintext-only" enterkeyhint="next" aria-label="Rücksendeangabe"></din-rucksendeangabe>
    <din-empfaenger-firma id="empfaenger-firma" contenteditable="plaintext-only" enterkeyhint="next" aria-label="Firma"></din-empfaenger-firma>
    <din-empfaenger-name id="empfaenger-namenszeile" contenteditable="plaintext-only" enterkeyhint="next" aria-label="Empfänger"></din-empfaenger-name>
    <din-empfaenger-strasse id="empfaenger-strasse" contenteditable="plaintext-only" enterkeyhint="next" aria-label="Straße"></din-empfaenger-strasse>
    <din-empfaenger-ort id="empfaenger-ort" contenteditable="plaintext-only" enterkeyhint="next" aria-label="Ort"></din-empfaenger-ort>
  </din-anschriftfeld>

  <!-- Infoblock (Form B rechts) -->
  <din-infoblock id="infoblock" data-x="125" data-w="65" role="group" aria-label="Infoblock">
    <!-- Absender-Angaben -->
  </din-infoblock>

  <!-- Brieftext & Anlagen -->
  <din-betreff id="betreff" contenteditable="plaintext-only" enterkeyhint="next" aria-label="Betreff"></din-betreff>
  <din-anrede id="anrede" contenteditable="plaintext-only" enterkeyhint="next" aria-label="Anrede"></din-anrede>
  <din-text id="text" contenteditable="true" enterkeyhint="enter" aria-label="Brieftext"></din-text>
  <din-grussformel id="grussformel" contenteditable="plaintext-only" enterkeyhint="next" aria-label="Grußformel"></din-grussformel>
  <din-unterschrift id="unterschrift" contenteditable="plaintext-only" enterkeyhint="done" aria-label="Name unter Unterschrift"></din-unterschrift>
</din-briefbogen>
```

### Richtlinien für editierbare DIN-Felder:
- **`contenteditable="plaintext-only"` (Immutable Law A55):** Verhindert das Einschleppen von HTML/Styles beim Copy-Paste. Verhindert manuelle JS-Intercept-Schleifen.
- **`enterkeyhint` steuert die Bildschirm-Tastatur:**
  - `enterkeyhint="next"`: Springt logisch ins nächste Feld.
  - `enterkeyhint="done"`: Beendet die Eingabe.
  - `enterkeyhint="enter"`: Erzeugt Zeilenumbruch (nur im Haupttextfeld `<din-text>`).
- **`writingsuggestions="false"` & `spellcheck="false"`:** Auf Formular- und Strukturfeldern aktivieren, um Browser-Overlay-Kollisionen zu vermeiden.

---

## 4. Barrierefreiheit & ARIA (Lighthouse-100-Garantie)

Um 100% im Lighthouse Accessibility Audit zu garantieren, beachte diese strengen Regeln:

1. **Kein verbotenes ARIA auf Standard-Tags:**
   - Ein `<label>` darf **kein** `aria-label` oder `aria-pressed` haben, wenn es keine explizite Widget-Rolle hat.
   - Falls ein Label als Button fungiert (z. B. Einstellungen-Toggle): `role="button"` explizit angeben!
2. **`role="group"` für Custom Elements:**
   - Da Custom Elements (`<din-*>`) standardmäßig die implizite Rolle `generic` haben, dürfen sie keine unbegründeten ARIA-Labels tragen.
   - Gib zusammengesetzten Containern immer `role="group"` oder `role="region"`:
     ```html
     <din-anlagen-angabe id="anlagen-text" role="group" aria-label="Anlagen">...</din-anlagen-angabe>
     ```
3. **Namensgebung für Icon-Buttons:**
   - Jeder Icon-Button muss für Screenreader benannt sein:
     ```html
     <button type="button" class="icon-btn" aria-label="Brief drucken" title="Drucken">
       <svg aria-hidden="true">...</svg>
     </button>
     ```
   - Alle rein dekorativen SVGs tragen `aria-hidden="true"`.
4. **Skip-Links:**
   - Der erste Fokuspunkt im Body ist immer ein sichtbarer Skip-Link:
     ```html
     <a href="#viewport" class="skip-link">Zum Briefkern springen</a>
     ```

---

## 5. Head & Sicherheits-Architektur (CSP & Isolation)

- **Immutable Law A38 (Keine fremden Hosts):** Niemals `<link>` oder `<script>` auf externe CDNs verweisen lassen. Alles muss lokal aus `website/` geladen werden.
- **Strikte Content-Security-Policy (CSP):**
  ```html
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'sha256-...'; style-src 'self'; font-src 'self' data:; img-src 'self' data:; connect-src 'self' https://api.geoapify.com; object-src 'none'; base-uri 'self'; form-action 'none'; frame-src 'none'; worker-src 'none'">
  ```
- **FOUC-Prävention:** Kritische Theme-Skripte im `<head>` müssen inline sein und über ihren exakten SHA-256-Hash in `script-src` freigegeben werden.

---

## 6. Referenz-Dateien

| Referenz | Inhalt |
|---|---|
| `references/FORMS-VALIDATION.md` | Constraint Validation Attribute, Regex-Patterns, Inputmodes |
| `references/POPOVERS-DIALOGS.md` | Popover API Spezifikation, `<dialog>`, Invoker Commands (`commandfor`) |
| `references/DIN-ELEMENTS.md` | Vollständige Liste aller DIN-5008 Custom Tags und `data-*`-Koordinaten |

---

## 7. Verifikation & Qualitätssicherung

Nach jeder Änderung an HTML-Dateien muss der konsolidierte Gatekeeper ausgeführt werden:
```bash
node tools/build_db.js -q
npm test
npm run check
npm run check:antipatterns
```
Er validiert in unter 2 Sekunden:
1. **Hermetik & Isolation (Law A38/A45):** Keine fremden Host-Referenzen in ladenden Attributen.
2. **IMR-Registry:** 51 normative `<din-*>`-Bezeichner, Koordinaten-Konsistenz.
3. **Biome Linter & Code-Formatierung:** 0 Fehler in eingebetteten/referenzierten Skripten.
4. **Antipatterns & Evolutionary Fitness:** 100% Score.

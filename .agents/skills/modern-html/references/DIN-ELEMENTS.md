# DIN 5008 Custom Elements & Koordinaten

DIN-BriefNEO nutzt semantische Custom Elements, um den normgerechten Briefbogen nach DIN 5008 (Form A und B) abzubilden.

## 1. Elemente-Hierarchie

```
<din-briefbogen id="sheet" data-form="form-b">
  ├── <din-faltmarke data-pos="105">
  ├── <din-lochmarke data-pos="148.5">
  ├── <din-faltmarke data-pos="210">
  ├── <din-anschriftfeld data-x="25" data-w="85" data-h="45">
  │     ├── <din-rucksendeangabe data-h="5">
  │     ├── <din-vermerke data-feldtyp="zweizeilig">
  │     ├── <din-empfaenger-firma>
  │     ├── <din-empfaenger-name>
  │     ├── <din-empfaenger-strasse>
  │     └── <din-empfaenger-ort>
  ├── <din-infoblock data-x="125" data-w="65" role="group">
  │     ├── <din-absender-name>
  │     ├── <din-absender-strasse>
  │     ├── <din-absender-ort>
  │     ├── <din-absender-tel>
  │     └── <din-absender-mail>
  ├── <din-datum data-x="125" data-w="65">
  ├── <din-betreff data-feldtyp="zweizeilig">
  ├── <din-anrede>
  ├── <din-text data-feldtyp="rich mehrzeilig">
  ├── <din-grussformel>
  ├── <din-unterschrift>
  ├── <din-anlagenvermerk>
  │     └── <din-anlagen-angabe role="group">
  └── <din-geschaeftsangaben id="fuss" role="region">
        ├── <div id="fuss-spalte-1">
        ├── <div id="fuss-spalte-2">
        └── <div id="fuss-spalte-3">
```

## 2. Koordinaten & Maße (Millimeter)

- **Blattgröße (A4):** `210mm × 297mm`.
- **Linker Rand:** `25mm`.
- **Rechter Rand:** Mindestens `20mm`.
- **Anschriftfeld (Form B):**
  - Position: `x = 25mm`, `y = 45mm`.
  - Abmessungen: `85mm × 45mm`.
  - Rücksendeangabe: Erste `5mm` des Anschriftfeldes, Schriftgröße `8pt`.
- **Infoblock (Form B):**
  - Position: `x = 125mm`, `y = 32mm`.
  - Breite: `65mm`.
- **Falz- & Lochmarken:**
  - Oberer Falz: `105mm` von Oberkante.
  - Lochmarke: `148.5mm` von Oberkante (Mitte).
  - Unterer Falz: `210mm` von Oberkante.

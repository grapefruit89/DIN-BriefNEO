---
id: agenten-webmcp
title: 'Agenten-Zugang: WebMCP, window.dinBriefAgent und der MCP-Server'
type: reference
status: active
created: '2026-11-23'
updated: '2026-11-23'
tags:
  - din-briefneo
  - agent
  - webmcp
  - mcp
  - integration
doc_links:
  - '[[DECISION-LOG]]'
  - '[[STRUCTURE]]'
code_links:
  - 'website/js/webmcp.js'
  - 'website/js/api.js'
  - 'tools/runtime/mcp-live.mjs'
depends_on: []
---

# Agenten-Zugang

> **Kurzfassung:** Es gibt drei Schichten. `api.js` kann den Brief schreiben.
> `webmcp.js` beschreibt diese Fähigkeiten als Werkzeuge (Name, Beschreibung,
> JSON-Schema) und meldet sie bei WebMCP an. `tools/mcp-live.mjs` reicht
> dieselben Werkzeuge an Agenten in der Kommandozeile durch. Alle drei nutzen
> **eine** Wahrheit: `window.dinApi`.

## 1. Warum WebMCP allein nicht reicht

WebMCP ist ein Entwurf, in dem die **Seite** ihre Werkzeuge deklariert. Der
Agent ruft sie auf, statt Knöpfe zu raten. Das wirkt aber nur in einem Client,
der die Seite selbst besucht — eine Browser-Erweiterung, Gemini in Chrome, oder
der Model Context Tool Inspector.

Ein Agent in der Kommandozeile (opencode, Claude Code, Codex) sieht WebMCP
nicht: statische GitHub-Pages-Seite, kein Server, kein Endpunkt. Deshalb gibt es
einen zweiten Transport über derselben Werkzeugliste:

| Transport | Zielgruppe | Wie |
|---|---|---|
| WebMCP (`document.modelContext`) | Agenten im Browser | Seite besuchen, Werkzeuge werden beim Laden registriert |
| MCP über stdio (`tools/mcp-live.mjs`) | Agenten in der Kommandozeile | die Seite meldet sich an einem lokalen Kanal; kein Debug-Port |

## 2. Die Werkzeuge

> **In der App:** Einstellungen → *Agent verbinden* — drei Zeilen: Schalter,
> Status, Kopierknopf. Der Schalter „Zugriff erlauben" entscheidet, ob Agenten den Brief
> schreiben dürfen. Der Knopf „Verbindung kopieren" kopiert die fertige `mcp.servers`-Konfiguration
> mit dem aktuellen Token.

`website/js/webmcp.js` definiert 15 Werkzeuge; sie sind gleichzeitig
`window.dinBriefAgent.werkzeuge()`:

| Werkzeug | Wirkung | readOnly |
|---|---|---|
| `brief_hilfe` | Feld-IDs, Schalter, Signaturen | ja |
| `brief_lesen` | alle Feldwerte + Schalterstand | ja |
| `brief_setzen` | ein Feld oder ein Schalter | nein |
| `brief_adresse_setzen` | Empfänger/Absender (leere Teile bleiben stehen) | nein |
| `brief_anrede_setzen` | Anrede + Grußformel nach Tonalität | nein |
| `brief_datum_setzen` | Datum in deutscher Langform | nein |
| `brief_tonalitaet_setzen` | Tonalität + Stilvertrag (Anrede/Grußformel passend) | nein |
| `brief_fuss_setzen` | § 35a-Fuß in einem Aufruf (inkl. IBAN-Format) | nein |
| `brief_seiten` | Seitenzahl, Zeilen pro Seite, Warnung bei fast leeren Seiten | ja |
| `brief_layout_setzen` | Form A (Briefkopf 27 mm) oder Form B (45 mm) | nein |
| `brief_ort_pruefen` | PLZ gegen 10.184 Orte offline prüfen, Ort abgleichen | ja |
| `brief_strasse_suchen` | Geoapify-Straßensuche (nur mit Key) | ja |
| `brief_pruefen` | Befunde: Pflichtfelder, Datum, PLZ, IBAN, BIC, Tonalität, Seiten | ja |
| `brief_schreiben` | kompletter Brief in einem Aufruf | nein |
| `brief_exportieren` | DIN-Letter-JSON | ja |

Beide Transporte bieten **dieselbe** Liste. Zwei frühere Zusatzwerkzeuge der
CDP-Brücke (`brief_als_pdf` über `Page.printToPDF`, `brief_seite_oeffnen`) sind
am 2026-11-24 entfernt: sie waren Transport-Funktionen des Browsers, keine
Brief-Funktionen, und im Live-Kanal nicht verfügbar.

### Was der Agent vom Blatt „sieht"

Keine Pixel — aber mehr als nur Text. `brief_seiten` rechnet dieselbe
Seitengeometrie wie der Mehrseiten-Controller (`#kern`, `--seite` +
`--luecke`), zählt die Zeilen jedes Textknotens über `Range.getClientRects()`
und ordnet sie dem Band zu. Ergebnis pro Seite: Zeilenzahl, erste und letzte
Zeile, plus Warnung, wenn eine Folgeseite nur ein bis zwei Zeilen hat.

```
Seite 1: 32 Zeilen | beginnt: "Zeile 1 …" | endet: "Zeile 32 …"
Seite 2:  2 Zeilen | beginnt: "Zeile 33 …" | endet: "Zeile 34 …"
Warnungen: Seite 2 hat nur 2 Zeile(n) — Umbruch prüfen.
```

Das ist der **Bildschirm**, nicht das PDF: der Druck bricht nach eigenem
Satzalgorithmus um (Randboxen, `@page`). Ein Screenshot oder der echte
PDF-Umbruch braucht den Druckdialog des Menschen (`window.print()`).

## 3. Im Browser (WebMCP)

Voraussetzung: Chrome 149+ mit `chrome://flags/#enable-webmcp-testing`
(lokal) oder ein Origin-Trial-Token für die veröffentlichte Origin. Ohne beides
passiert nichts — `initWebMCP()` erkennt das, registriert nichts und lässt nur
`window.dinBriefAgent` stehen.

Prüfen in der Konsole:

```js
await document.modelContext.getTools()   // 15 Werkzeuge mit Schema
await document.modelContext.executeTool(
  (await document.modelContext.getTools()).find((t) => t.name === 'brief_lesen')
)
```

`executeTool()` liefert das Ergebnis als **JSON-String** (Chrome serialisiert
Objekt-Rückgaben), also `JSON.parse(...)`, bevor ein Client es weiterverarbeitet.
Getestet am 2026-11-23 mit Chrome 158, Flag über
`browser.enabled_labs_experiments: ["enable-webmcp-testing@1"]` im Profil
(das ist genau das, was `chrome://flags` schreibt).

## 4. In der Kommandozeile (ohne Debug-Port)

Ein Agent im Terminal sieht die Seite nicht. Deshalb dreht
`tools/mcp-live.mjs` die Richtung um: **die Seite ruft an.** Kein Debug-Port,
kein Flag, keine Erweiterung.

```bash
node tools/mcp-live.mjs --check   # Kanal starten, Werkzeuge und Öffnen-URL zeigen
```

Ablauf im Alltag: in der Seitenleiste **Einstellungen → Agent verbinden** den
Schalter „Zugriff erlauben" einschalten, „📋 Verbindung kopieren" drücken und den Block
in den Agenten einfügen:

```jsonc
{ "mcp": { "servers": { "briefneo": {
    "type": "local",
    "command": ["node", "tools/mcp-live.mjs", "--token=<32 Hex-Zeichen>"] } } } }
```

Der Token entsteht **in der Seite** (16 Zufallsbytes), nicht im Programm. Ohne
passenden Token antwortet der Kanal mit `403`. Startet der Agent den Server,
meldet sich der offene Tab von selbst; in der Seitenleiste steht dann
„verbunden".

| Option | Vorgabe |
|---|---|
| `--token=<hex>` | zufällig — dann muss die Seite mit `#agent=<token>` geöffnet werden |
| `--url=<adresse>` | `https://grapefruit89.github.io/DIN-BriefNEO/` (nur für die Öffnen-Hilfe) |
| `--port=<n>` | 8765; belegte Ports werden übersprungen (8766, 8775, 8785, 8795) |

- Werkzeugliste kommt aus `website/js/webmcp.js` — dieselbe Datei, die WebMCP
  bedient. Keine Kopie, keine Zusatzwerkzeuge.
- CSP: `connect-src` erlaubt `http://127.0.0.1:*` — nur Loopback, und nur die
  Seite selbst spricht dort.
- Die frühere CDP-Brücke (`tools/mcp-dinbrief.mjs`, Debug-Port) ist am
  2026-11-24 entfernt: sie bot keine Brief-Funktion zusätzlich, nur
  Browser-Steuerung.

## 5. Grenzen (bewusst)

- **Kein Netz, kein Backend.** Jede Ausführung passiert im Browser des Nutzers;
  der MCP-Server schickt nur JSON an `window.dinBriefAgent`.
- **Datei-Dialoge und Druckdialog bleiben beim Menschen.** Drucken geht über
  `window.print()` und damit nur per Klick; Unterschrift- und Schrift-Upload
  brauchen eine echte Nutzergeste und sind nicht Teil der Werkzeuge.
- **Ein Browserprofil ist der Speicher.** Entwürfe landen im `localStorage` des
  gesteuerten Profils, nicht in der Datei, die der Agent liest.
- **Die Spezifikation wandert.** `navigator.modelContext` wurde zu
  `document.modelContext`, JSON-String-Argumente sind ab Chrome 155 veraltet,
  `outputSchema` gibt es ab 159. Die Typen liegen deshalb in
  `website/js/webapi.d.ts`, der Aufruf bleibt dünn.
- **Kein Polyfill.** Wer WebMCP in einem Browser ohne die API nachbaut, baut
  eine zweite Wahrheit — der geparkte `addons/webmcp-bridge.js` tat genau das
  und ist überholt.

## 6. Prüfen

```bash
node tools/test-runner.mjs --filter="dinBriefAgent|WebMCP|Agenten-Kanal"   # 9 Fälle
node tools/mcp-live.mjs --check                              # 15 Werkzeuge
node tools/build_db.js                                       # Fitness-Gate + Wegweiser
```

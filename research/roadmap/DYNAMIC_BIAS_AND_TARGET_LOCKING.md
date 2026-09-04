# Dynamischer Bias & Target-Locking: Wie PLZ-First die Straßensuche perfektioniert

> **Status:** UX- & Architektur-Konzept (Reine Recherche, keine Änderungen am Produktiv-Repository).  
> **Kernidee:** Sobald der Nutzer eine PLZ (z. B. 46359) tippt, verliert der Standard-Bonn-Bias seine Gültigkeit. Das System schaltet auf "Target Locked" um.

---

## 1. Das Problem mit statischen Bias-Werten

Ein statischer Bias auf Bonn (`50.7374, 7.0982`) ist exzellent als neutrale Grundeinstellung.  
Sobald der Nutzer jedoch einen Brief an einen Empfänger in **46359 Heiden** (Münsterland / Kreis Borken) schreibt, wäre ein Festhalten am Bonner Bias kontraproduktiv:
- Bonn und Heiden liegen rund 120 km Luftlinie voneinander entfernt.
- Ein starrer Bonn-Bias würde bei der Straßensuche bevorzugt Treffer aus dem Rheinland vorschlagen, anstatt direkt im Münsterland zu suchen.

---

## 2. Die Lösung: 2-Phasen Bias-Modell („Target Locked“)

```text
[PHASE 1: Standard / Kaltstart]
Keine PLZ/Ort im Empfängerfeld eingetragen.
➔ Standard-Anker BONN (oder Absender-PLZ) ist aktiv.
➔ Verhindert bundesweite Streuung bei allgemeinen Straßennamen.

           ▼  Nutzer tippt "46359" (in 0 ms über Brotli ➔ "Heiden")

[PHASE 2: Target Locked (Zielgebiet fixiert)]
PLZ 46359 und Ort Heiden stehen fest!
➔ 1. Bonn-Bias wird SOFORT ABGESCHALTET.
➔ 2. Neuer harter Filter: "Nur noch PLZ 46359 Heiden".
➔ 3. Autocomplete muss PLZ und Ort NICHT mehr suchen.
➔ 4. Straßensuche wird zur 100 % lokalen Suche.
```

---

## 3. Was das für die verschiedenen Provider bedeutet

Sobald `46359 Heiden` im PLZ-Feld steht und der Nutzer im Straßenfeld tippt (z. B. `B...`):

### A. Bei OpenPLZ API (Kostenlos, ohne Key):
- Request: `https://openplzapi.org/de/Streets?postalCode=46359&name=^B.*`
- Ergebnis in 100 ms: Liefert sofort die 10 Heidener Straßen mit B (`Bahnhofstr.`, `Barbarastr.`, `Beethovenstr.`, `Bergstr.`, `Borkener Str.` usw.).
- Keine einzige fremde Straße aus Bonn oder Köln taucht auf!

### B. Bei Geoapify (EU-Cluster):
- Request: `https://api-eu.geoapify.com/v1/geocode/autocomplete?text={strasse}&filter=countrycode:de&postcode=46359`  
  *(oder Text-Kombination: `{strasse}, 46359 Heiden`)*
- Ergebnis: Geoapify sucht mit Hausnummern punktgenau im Zustellbezirk 46359.

### C. Bei Komoot Photon:
- Request: `https://photon.komoot.io/api/?q={strasse}+Heiden+46359`
- Der alte Bonner `lat/lon` Parameter wird weggelassen. Das Ergebnis ist exklusiv Heiden.

---

## 4. Die immensen Vorteile für Performance & Trefferquote

1. **Massive Einsparung bei API-Calls:**  
   Die Autocomplete-API muss weder den Ort noch die PLZ erraten oder auflösen. Der Suchbaum schrumpft von 82 Millionen Bundesbürgern auf eine einzige 8.000-Einwohner-Gemeinde.
2. **Keine Verwechslungen:**  
   Gemeinsame Namen wie „Bahnhofstraße“, „Kirchplatz“ oder „Hauptstraße“ existieren in tausenden deutschen Städten. Durch den Target-Lock auf `46359` ist eine falsche Stadt im Dropdown technisch ausgeschlossen.
3. **Fliegender Wechsel:**  
   Löscht der Nutzer das Feld wieder leer, springt das System lautlos zurück in Phase 1 (Bonn-Default).

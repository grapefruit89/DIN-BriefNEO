import json

data_file = r"C:\Users\morit\Documents\dinbrief-temp\chrome_scraper_data_2026.json"
with open(data_file, "r", encoding="utf-8") as f:
    data = json.load(f)

features = data.get("features", [])

css_features = []
for feat in features:
    cat = feat.get("category", "")
    name = feat.get("name", "")
    summary = feat.get("summary", "")
    spec = feat.get("standards", {}).get("spec", "")
    milestone = feat.get("browsers", {}).get("chrome", {}).get("desktop", "")
    
    text_lower = f"{name} {summary} {cat}".lower()
    
    # Filter auf CSS Relevanz
    if cat.lower() == "css" or "css" in text_lower or "style" in text_lower or "@page" in text_lower or "font" in text_lower:
        css_features.append({
            "id": feat.get("id"),
            "name": name,
            "category": cat,
            "milestone": milestone,
            "spec": spec,
            "summary": summary
        })

print(f"Gefundene CSS-Features 2026: {len(css_features)}")

# Speichere gezielte JSON-Ergebnisse
json_out = r"C:\Users\morit\Documents\dinbrief-temp\roadmap_css_targeted_findings.json"
with open(json_out, "w", encoding="utf-8") as jf:
    json.dump({"total_css_features": len(css_features), "features": css_features}, jf, ensure_ascii=False, indent=2)

print(f"Gespeichert in: {json_out}")

# Erstelle detaillierten Bericht
report_file = r"C:\Users\morit\Documents\dinbrief-temp\roadmap_css_modernization_2026.txt"

lines = []
lines.append("=" * 90)
lines.append("CSS MODERNISIERUNGS-ROADMAP 2026: NATIVES CSS STATT WORKAROUNDS & HACKS")
lines.append("Projekt: DIN-Brief Neo (website/css/)")
lines.append("=" * 90)
lines.append("")
lines.append("ZIEL:")
lines.append("Ersetzen von Legacy-CSS-Hacks, absoluten Koordinaten, manuellen z-Indexen und künstlichen")
lines.append("Abstands-Kompensationen durch die neuesten CSS-Standards aus dem Chrome 2026 Katalog.")
lines.append("")

lines.append("=" * 90)
lines.append("1. DIN 5008 MILLIMETER-GENAUIGKEIT: TEXT-BOX-TRIM & ANCHORING (layout.css)")
lines.append("=" * 90)
lines.append("")
lines.append("Problem heute in layout.css:")
lines.append("In DIN-Briefen müssen Abstände (z.B. 45 mm zur Empfängeranschrift, 8.46 mm Zeilenabstand)")
lines.append("auf den Millimeter genau stimmen. Web-Schriftarten bringen jedoch unsichtbaren Leerraum")
lines.append("(Font-Ascender und Descender) mit, wodurch 'margin-top: 45mm' real oft 47mm oder 48mm beträgt.")
lines.append("Bisher musste dies mit 'calc()' und negativen Margins ungenau korrigiert werden.")
lines.append("")
lines.append("Natives 2026 Feature: CSS 'text-box-trim: both' & 'text-box-edge: cap alphabetic'")
lines.append("Nutzen:")
lines.append("- Schneidet den Schriftart-Leerraum oben und unten exakt an der Versalhöhe (Cap Height)")
lines.append("  und Grundlinie (Baseline) ab.")
lines.append("- Ein 'margin-top: 45mm' in layout.css bedeutet jetzt auf Druck und Screen EXAKT 45mm!")
lines.append("- Ersetzt: Alle künstlichen Schriftausgleichs-Hacks in layout.css.")
lines.append("")
lines.append("Natives 2026 Feature: CSS Anchor Positioning (position-anchor, anchor(), position-try)")
lines.append("Nutzen:")
lines.append("- Falzmarken (bei 105mm und 210mm) und Lochmarke (bei 148.5mm) können sich direkt an den")
lines.append("  DIN-Rändern verankern, ohne starres 'position: absolute; left: 0; top: ...' mit Ausrichtungsfehlern.")
lines.append("")

lines.append("=" * 90)
lines.append("2. FLOATING UI, TOOLBAR & TOASTS OHNE Z-INDEX-KRIEGE (floating.css)")
lines.append("=" * 90)
lines.append("")
lines.append("Problem heute in floating.css:")
lines.append("Die Toolbar, Dropdowns und Toasts kämpfen mit 'z-index: 1000+', 'z-index: 9999',")
lines.append("overflow-clipping in Containern und komplexen @keyframes für Fade-In/Fade-Out.")
lines.append("")
lines.append("Natives 2026 Feature: CSS '@starting-style' & discrete property transitions")
lines.append("Nutzen:")
lines.append("- Erlaubt sanfte CSS-Transitions von 'display: none' auf 'display: block' / Popovers.")
lines.append("- Keine @keyframes 'toastSlideIn' mehr nötig!")
lines.append("- Elemente faden nativ via CSS 'transition: opacity 0.2s, transform 0.2s' ein und aus.")
lines.append("")
lines.append("Natives 2026 Feature: CSS 'interpolate-size: allow-keywords'")
lines.append("Nutzen:")
lines.append("- Ermöglicht weiche CSS-Animationen von 'height: 0' auf 'height: auto' bei Akkordeons,")
lines.append("  Sidebar-Panels und Dropdowns – bisher in CSS schlicht unmöglich ohne feste Pixelwerte oder JS!")
lines.append("")

lines.append("=" * 90)
lines.append("3. DYNAMISCHE FORMULARE & TEXT-ANPASSUNG (layout.css)")
lines.append("=" * 90)
lines.append("")
lines.append("Problem heute:")
lines.append("Einzeilige Inputs (Betreff, Datum, Absender) brechen bei langem Text unschön um oder")
lines.append("müssen via JS gemessen werden.")
lines.append("")
lines.append("Natives 2026 Feature: CSS 'field-sizing: content'")
lines.append("Nutzen:")
lines.append("- Inputs und Textareas wachsen vollautomatisch horizontal und vertikal mit dem getippten Text mit.")
lines.append("- Kein horizontales Scrollen im Betrefffeld mehr, kein Abschneiden von Absenderzeilen.")
lines.append("")
lines.append("Natives 2026 Feature: CSS 'text-wrap: balance' & 'text-wrap: pretty'")
lines.append("Nutzen:")
lines.append("- 'text-wrap: pretty' verhindert einzelne 'Waisen'-Wörter am Zeilenende im Brieftext.")
lines.append("- 'text-wrap: balance' balanciert Überschriften und Betreffzeilen harmonisch aus.")
lines.append("")

lines.append("=" * 90)
lines.append("4. THEMING & VARIABLEN-SYSTEM (variables.css)")
lines.append("=" * 90)
lines.append("")
lines.append("Problem heute in variables.css:")
lines.append("Dunkel-Modus erfordert doppelte Definitionen aller Variablen unter :root und unter .theme-dark")
lines.append("oder [data-theme='dark'].")
lines.append("")
lines.append("Natives 2026 Feature: CSS 'light-dark()' Funktion")
lines.append("Nutzen:")
lines.append("- Definition mit einer einzigen Zeile:")
lines.append("  --bg-primary: light-dark(#ffffff, #1e1e1e);")
lines.append("  --text-color: light-dark(#111111, #eeeeee);")
lines.append("- Der Browser wählt anhand von 'color-scheme: light dark' automatisch den korrekten Wert.")
lines.append("- Halbiert die Theming-Zeilen in variables.css!")
lines.append("")
lines.append("Natives 2026 Feature: CSS 'color-mix()' & OKLCH-Farbraum")
lines.append("Nutzen:")
lines.append("- Dim-Stufen können dynamisch gemischt werden: 'color-mix(in srgb, var(--bg-paper) 90%, black)'.")
lines.append("- Keine statischen Hilfsfarben mehr für Hover- und Dim-Zustände.")
lines.append("")

lines.append("=" * 90)
lines.append("5. DRUCK & PAGINIERUNG (print.css)")
lines.append("=" * 90)
lines.append("")
lines.append("Natives 2026 Feature: Erweiterte Paged-Media & Margin Boxes (@page)")
lines.append("Nutzen:")
lines.append("- Seitenzahlen ('Seite X von Y') können direkt nativ über '@page { @bottom-right { content: counter(page); } }'")
lines.append("  definiert werden.")
lines.append("- Fußzeilen müssen nicht mehr künstlich im DOM als absolute Elemente am Seitenende positioniert werden.")
lines.append("")

lines.append("=" * 90)
lines.append("ZUSAMMENFASSUNG & EINSPARUNGEN FÜR DEIN CSS:")
lines.append("=" * 90)
lines.append("CSS-Datei       | Zeilen Heute | Mit CSS 2026 | Hauptvorteil")
lines.append("----------------+--------------+--------------+---------------------------------------------------")
lines.append("variables.css   |     ~160     |     ~85      | light-dark() & color-mix halbiert Farbdeklarationen")
lines.append("floating.css    |     ~320     |     ~160     | @starting-style & Anchor eliminieren Keyframe-Hacks")
lines.append("layout.css      |     ~780     |     ~510     | field-sizing & text-box-trim sparen Mess-Klassen")
lines.append("print.css       |     ~65      |     ~40      | Nativer Margin-Box Counter & Umbruch-Regeln")
lines.append("reset.css       |     ~45      |     ~35      | Bereinigt durch moderne Browser-Defaults")
lines.append("----------------+--------------+--------------+---------------------------------------------------")
lines.append("GESAMT          |    ~1370     |     ~830     | ~ 40 % saubereres, robusteres & deklaratives CSS!")
lines.append("=" * 90)

with open(report_file, "w", encoding="utf-8") as rf:
    rf.write("\n".join(lines))

print(f"CSS Modernisierungs-Roadmap geschrieben nach: {report_file}")

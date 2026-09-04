import json

data_file = r"C:\Users\morit\Documents\dinbrief-temp\chrome_scraper_data_2026.json"
with open(data_file, "r", encoding="utf-8") as f:
    data = json.load(f)

features = data.get("features", [])

html_features = []
keywords = [
    "dom", "html", "element", "dialog", "popover", "switch", "input",
    "select", "button", "command", "invoker", "interesttarget", "form",
    "datalist", "custom element", "contenteditable", "attribute",
    "widget", "shadow", "focus", "inert", "aria", "accessibility"
]

for feat in features:
    cat = feat.get("category", "")
    name = feat.get("name", "")
    summary = feat.get("summary", "")
    spec = feat.get("standards", {}).get("spec", "")
    milestone = feat.get("browsers", {}).get("chrome", {}).get("desktop", "")
    
    text_lower = f"{name} {summary} {cat}".lower()
    
    matched_kws = [kw for kw in keywords if kw in text_lower]
    if cat.lower() in ["dom", "user input"] or matched_kws:
        html_features.append({
            "id": feat.get("id"),
            "name": name,
            "category": cat,
            "milestone": milestone,
            "spec": spec,
            "matched_keywords": matched_kws,
            "summary": summary
        })

print(f"Gefundene HTML/DOM Features 2026: {len(html_features)}")

# Speichere JSON
json_out = r"C:\Users\morit\Documents\dinbrief-temp\roadmap_html_targeted_findings.json"
with open(json_out, "w", encoding="utf-8") as jf:
    json.dump({"total_html_features": len(html_features), "features": html_features}, jf, ensure_ascii=False, indent=2)

print(f"Gespeichert in: {json_out}")

# Erstelle Bericht
report_file = r"C:\Users\morit\Documents\dinbrief-temp\roadmap_html_modernization_2026.txt"

lines = []
lines.append("=" * 90)
lines.append("HTML & DOM MODERNISIERUNGS-ROADMAP 2026: DEKLARATIVES WEB STATT JAVASCRIPT-HACKS")
lines.append("Projekt: DIN-Brief Neo (website/index.html)")
lines.append("=" * 90)
lines.append("")
lines.append("STATUS QUO IN INDEX.HTML:")
lines.append("Das HTML von DIN-Brief Neo ist bereits sehr fortschrittlich (nutzt Custom Elements <din-*>,")
lines.append("popover='hint/auto/manual', dialog und erste Invoker commandfor/command). Dennoch gibt es")
lines.append("mehrere Workarounds mit unsichtbaren Checkboxen, JS-getriebenen Dropdowns und manuellen Tooltips.")
lines.append("")

lines.append("=" * 90)
lines.append("1. NATIVE SCHALTER STATT RADIO/CHECKBOX-WORKAROUNDS")
lines.append("=" * 90)
lines.append("Problem heute in index.html (Zeilen 51-89):")
lines.append("Theme-Wechsel (Hell/Dunkel), DIN-Hilfslinien (Ein/Aus), Anlagen-Schalter und Postvermerk")
lines.append("müssen über verdeckte Radio-Buttons (<input type=\"radio\" class=\"sr-only\">) und verdeckte")
lines.append("Checkboxen mit CSS-Klassen getrickst werden.")
lines.append("")
lines.append("Natives 2026 Feature: <input type=\"checkbox\" switch> (ID: 5178587742339072)")
lines.append("Nutzen:")
lines.append("- Ersetzt das gesamte Konstrukt aus 'sr-only' Inputs + Labels durch einen einzigen,")
lines.append("  vollständig barrierefreien nativen Schalter:")
lines.append("  <label><input type=\"checkbox\" switch id=\"switch-guides\" checked> Hilfslinien</label>")
lines.append("- OS-native Optik auf Windows/macOS/Android, native Tastatursteuerung (Leertaste/Pfeile),")
lines.append("  ohne ein einziges span- oder div-Wrapper-Element.")
lines.append("")

lines.append("=" * 90)
lines.append("2. RICHTIGE TOOLTIPS OHNE JAVASCRIPT: INTEREST INVOKERS (INTERESTTARGET)")
lines.append("=" * 90)
lines.append("Problem heute in index.html:")
lines.append("Buttons haben einfache 'title=\"...\"' Attribute (z.B. Form A / Form B, Format-Buttons).")
lines.append("Der native Browser-Tooltip von 'title' reagiert träge (1-2 Sekunden Verzögerung), ist hässlich,")
lines.append("nicht stylebar und auf Touch-Geräten völlig unbrauchbar.")
lines.append("")
lines.append("Natives 2026 Feature: 'interesttarget' (Interest Invokers)")
lines.append("Nutzen:")
lines.append("- Ermöglicht reines deklaratives HTML-Triggering von Popovers/Tooltips bei Hover und Keyboard-Focus:")
lines.append("  <button interesttarget=\"tip-form-a\">Form A</button>")
lines.append("  <div id=\"tip-form-a\" popover=\"hint\">Hoher Briefkopf (27mm nach DIN 5008)</div>")
lines.append("- Perfekte Barrierefreiheit, sofortiges Einblenden, stylingfähig im Top-Layer.")
lines.append("")

lines.append("=" * 90)
lines.append("3. CUSTOMIZABLE <SELECT> STATT EIGENER AUTOCOMPLETE-DROPDOWNS")
lines.append("=" * 90)
lines.append("Problem heute in index.html (Zeilen 90-104 & 137):")
lines.append("Für den Postvermerk wird ein Standard-<select> genutzt, der im Betriebssystem-Look festhängt,")
lines.append("während für Adress-Vorschläge (Geoapify) eine manuelle <ul popover='auto'> per JS befüllt wird.")
lines.append("")
lines.append("Natives 2026 Feature: Customizable <select> (ehemals <selectmenu>) & Enhanced Range Input")
lines.append("Nutzen:")
lines.append("- Erlaubt freies HTML/CSS-Styling des ausgewählten Elements (<button>) und des Dropdowns (<datalist>/options).")
lines.append("- Icons, Untertitel und DIN-Kennzeichnungen können direkt nativ im Select gerendert werden,")
lines.append("  ohne dass Drittanbieter-Dropdown-Bibliotheken oder komplexe JS-Menüs gebaut werden müssen.")
lines.append("")

lines.append("=" * 90)
lines.append("4. STANDARDISIERTE COMMANDS & INVOKERS (COMMAND / COMMANDFOR)")
lines.append("=" * 90)
lines.append("Stand heute in index.html (Zeilen 144 & 218-222):")
lines.append("Index.html nutzt bereits 'commandfor=\"reset-dialog\" command=\"show-modal\"' und experimentelle")
lines.append("Commands für Fett/Kursiv. 2026 werden diese nativen Invokers finaler Web-Standard.")
lines.append("")
lines.append("Natives 2026 Feature: Invoker Buttons & Native Dialog Commands")
lines.append("Nutzen:")
lines.append("- Dialoge öffnen, schließen und Popovers umschalten komplett ohne 'addEventListener('click')'!")
lines.append("- Selbst das Zurücksetzen oder Umschalten der Sidebar kann rein deklarativ gesteuert werden.")
lines.append("")

lines.append("=" * 90)
lines.append("5. PERSISTENTE WIDGETS IM MULTI-PAGE-DOKUMENT (<PERSISTENTWIDGET>)")
lines.append("=" * 90)
lines.append("Natives 2026 Feature: <persistentwidget> (ID: 5155555348971520)")
lines.append("Nutzen:")
lines.append("- Wenn DIN-Brief Neo mehrseitige Briefe oder ausgelagerte Live-Vorschauen erhält,")
lines.append("  können persistent widgets Kontext und State über Seitenwechsel hinweg ohne Neuladen erhalten.")
lines.append("")

lines.append("=" * 90)
lines.append("ZUSAMMENFASSUNG: HTML-STRUKTUR-OPTIMIERUNG")
lines.append("=" * 90)
lines.append("Bereich                   | HTML Heute                            | HTML 2026 (Nativ)")
lines.append("--------------------------+---------------------------------------+----------------------------------")
lines.append("Settings & Toggles        | <input type=\"radio\" class=\"sr-only\">  | <input type=\"checkbox\" switch>")
lines.append("Tooltips & UX-Hilfen      | title=\"...\" (verzögert, unstylebar)   | interesttarget=\"id\" + popover=\"hint\"")
lines.append("Postvermerk / Auswahl     | Standard-<select> (unflexibel)        | Customizable <select> mit Icons")
lines.append("Aktionen & Dialog-Trigger | Teilweise JS addEventListener         | commandfor / command deklarativ")
lines.append("=" * 90)

with open(report_file, "w", encoding="utf-8") as rf:
    rf.write("\n".join(lines))

print(f"HTML Modernisierungs-Roadmap geschrieben nach: {report_file}")

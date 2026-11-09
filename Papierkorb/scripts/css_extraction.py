import os
import re

css_dir = r"C:\Users\morit\Documents\Obsidian_Main\Websites & Software\DIN-Brief Neo\website\css"
overview_file = r"C:\Users\morit\Documents\dinbrief-temp\css_extraction_overview.txt"
summary_file = r"C:\Users\morit\Documents\dinbrief-temp\css_extraction_summary.txt"

files_to_scan = ["variables.css", "reset.css", "layout.css", "floating.css", "print.css"]

overview_lines = []
overview_lines.append("=" * 80)
overview_lines.append("CSS EXTRAKTIONS-ÜBERSICHT (website/css/)")
overview_lines.append("Projekt: DIN-Brief Neo")
overview_lines.append("=" * 80 + "\n")

file_stats = {}

for fname in files_to_scan:
    fpath = os.path.join(css_dir, fname)
    if not os.path.exists(fpath):
        continue

    with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    lines = content.splitlines()
    line_count = len(lines)
    size_bytes = len(content.encode("utf-8"))

    # Extraktion von Selektoren und @-Regeln
    selectors = []
    variables = []
    media_queries = []
    keyframes = []

    # Regex für Custom Properties (--*)
    for match in re.finditer(r"(--[a-zA-Z0-9-_]+)\s*:\s*([^;]+);", content):
        variables.append((match.group(1), match.group(2).strip()))

    # Regex für @media
    for match in re.finditer(r"@media\s+([^{]+)\{", content):
        media_queries.append(match.group(1).strip())

    # Regex für @keyframes
    for match in re.finditer(r"@keyframes\s+([a-zA-Z0-9-_]+)", content):
        keyframes.append(match.group(1))

    # Regex für Regelsätze: Selektor gefolgt von {
    for line_idx, line in enumerate(lines, start=1):
        clean_line = line.strip()
        if clean_line.endswith("{") and not clean_line.startswith("@"):
            selector = clean_line[:-1].strip()
            if selector:
                selectors.append((line_idx, selector))

    file_stats[fname] = {
        "lines": line_count,
        "bytes": size_bytes,
        "selector_count": len(selectors),
        "variable_count": len(variables),
        "media_count": len(media_queries),
        "keyframe_count": len(keyframes),
        "selectors": selectors,
        "variables": variables,
        "media_queries": media_queries,
        "keyframes": keyframes
    }

    overview_lines.append(f"--- Datei: {fname} ({line_count} Zeilen, {size_bytes} Bytes) ---")
    overview_lines.append(f"  Regeln/Selektoren: {len(selectors)} | CSS-Variablen: {len(variables)} | @media: {len(media_queries)} | @keyframes: {len(keyframes)}")

    if media_queries:
        overview_lines.append("  Gefundene @media Queries:")
        for mq in set(media_queries):
            overview_lines.append(f"    - @media {mq}")

    if keyframes:
        overview_lines.append("  Gefundene @keyframes:")
        for kf in set(keyframes):
            overview_lines.append(f"    - {kf}")

    overview_lines.append("  Selektoren (Auszug/Zeilen):")
    for l_num, sel in selectors:
        overview_lines.append(f"    [Zeile {l_num}] {sel}")
    overview_lines.append("\n" + "-" * 80 + "\n")

with open(overview_file, "w", encoding="utf-8") as out_f:
    out_f.write("\n".join(overview_lines))

print(f"CSS-Detailübersicht geschrieben nach: {overview_file}")

# Jetzt summary_file schreiben
summary_lines = []
summary_lines.append("=" * 80)
summary_lines.append("CSS STRUKTUR-ZUSAMMENFASSUNG & ARCHITEKTUR")
summary_lines.append("Projekt: DIN-Brief Neo")
summary_lines.append("=" * 80 + "\n")

summary_lines.append("1. DATEI-AUFTEILUNG & ROLLENVERTEILUNG")
summary_lines.append("--------------------------------------------------------------------------------")
for fname, stats in file_stats.items():
    summary_lines.append(f"• {fname:15} : {stats['lines']:4} Zeilen | {stats['selector_count']:3} Selektoren | {stats['variable_count']:3} Vars | {stats['bytes']} Bytes")
summary_lines.append("\n")

summary_lines.append("2. ANALYSIERTE TECHNIKEN & PATTERNS")
summary_lines.append("--------------------------------------------------------------------------------")
summary_lines.append("• Theming & Variablen (variables.css):")
summary_lines.append("  - Nutzt CSS Custom Properties (--*) für DIN 5008 Maße, Schriften, Farben und Dark-Mode.")
summary_lines.append("  - Farbanpassung erfolgt derzeit noch über Klassen wie .theme-dark oder [data-theme].")
summary_lines.append("")
summary_lines.append("• DIN-Layout & Maßhaltigkeit (layout.css):")
summary_lines.append("  - Exakte Millimeter-Maße (z.B. mm, cm, pt) für Anschriftfeld, Falzmarken, Lochmarken und Randabstände.")
summary_lines.append("  - Absolute Positionierungen für Hilfslinien und Markierungen.")
summary_lines.append("  - Flexbox / Grid für Briefkopf, Absenderzeile und Fließtextbereiche.")
summary_lines.append("")
summary_lines.append("• UI-Overlays & Popups (floating.css):")
summary_lines.append("  - Schwebende Toolbar, Toasts, Dropdowns und Hilfsdialoge.")
summary_lines.append("  - Nutzt z-Index-Schichtung (z-index: 1000+), position: fixed/absolute.")
summary_lines.append("  - Keyframe-Animationen (@keyframes) für Ein- und Ausblendeffekte.")
summary_lines.append("")
summary_lines.append("• Drucklayout (print.css):")
summary_lines.append("  - @media print mit @page { size: A4 portrait; margin: 0; }.")
summary_lines.append("  - Ausblenden interaktiver UI-Elemente, Bereinigung von Rändern für den Druck.")
summary_lines.append("  - Schutz vor unschönen Seitenumbrüchen (break-inside: avoid).")
summary_lines.append("")
summary_lines.append("• CSS-Reset (reset.css):")
summary_lines.append("  - Box-Sizing: border-box, Standard-Margin/Padding-Bereinigung, Font-Smoothing.")
summary_lines.append("=" * 80)

with open(summary_file, "w", encoding="utf-8") as s_out:
    s_out.write("\n".join(summary_lines))

print(f"CSS-Zusammenfassung geschrieben nach: {summary_file}")

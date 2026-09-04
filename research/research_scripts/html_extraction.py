import os
import re
from html.parser import HTMLParser
from collections import Counter

html_path = r"C:\Users\morit\Documents\Obsidian_Main\Websites & Software\DIN-Brief Neo\website\index.html"
overview_path = r"C:\Users\morit\Documents\dinbrief-temp\html_extraction_overview.txt"
summary_path = r"C:\Users\morit\Documents\dinbrief-temp\html_extraction_summary.txt"

with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

class HTMLAnalyzer(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = Counter()
        self.custom_elements = Counter()
        self.attributes = Counter()
        self.ids = []
        self.classes = set()
        self.popovers = []
        self.dialogs = []
        self.commands = []
        self.inputs = []
        self.contenteditables = []
        self.line_records = []

    def handle_starttag(self, tag, attrs):
        self.tags[tag] += 1
        attr_dict = dict(attrs)
        line, _ = self.getpos()

        if "-" in tag:
            self.custom_elements[tag] += 1

        for a, val in attrs:
            self.attributes[a] += 1

        if "id" in attr_dict:
            self.ids.append((line, tag, attr_dict["id"]))

        if "class" in attr_dict:
            for c in attr_dict["class"].split():
                self.classes.add(c)

        if "popover" in attr_dict:
            self.popovers.append((line, tag, attr_dict.get("id", "no-id"), attr_dict["popover"]))

        if tag == "dialog":
            self.dialogs.append((line, attr_dict.get("id", "no-id")))

        if "commandfor" in attr_dict or "command" in attr_dict:
            self.commands.append((line, tag, attr_dict.get("commandfor", ""), attr_dict.get("command", "")))

        if tag in ["input", "select", "textarea", "button"]:
            self.inputs.append((line, tag, attr_dict.get("type", "standard"), attr_dict.get("id", "no-id"), attr_dict.get("name", "")))

        if "contenteditable" in attr_dict:
            self.contenteditables.append((line, tag, attr_dict.get("id", "no-id"), attr_dict["contenteditable"]))

analyzer = HTMLAnalyzer()
analyzer.feed(html_content)

# Overview schreiben
lines_ov = []
lines_ov.append("=" * 80)
lines_ov.append("HTML EXTRAKTIONS-ÜBERSICHT (website/index.html)")
lines_ov.append("Projekt: DIN-Brief Neo")
lines_ov.append("=" * 80 + "\n")

lines_ov.append(f"Gesamtzeilen: {len(html_content.splitlines())} | Dateigröße: {len(html_content.encode('utf-8'))} Bytes")
lines_ov.append(f"Gefundene Tags: {sum(analyzer.tags.values())} ({len(analyzer.tags)} verschiedene Tags)")
lines_ov.append(f"Eindeutige IDs: {len(analyzer.ids)} | CSS-Klassen: {len(analyzer.classes)}\n")

lines_ov.append("--- 1. CUSTOM ELEMENTS (DIN-SPEZIFISCHE TAGS) ---")
for el, count in analyzer.custom_elements.most_common():
    lines_ov.append(f"  <{el}> : {count}x vorkommend")
lines_ov.append("")

lines_ov.append("--- 2. CONTENTEDITABLE ELEMENTE (TEXTFELDER) ---")
for line, tag, el_id, mode in analyzer.contenteditables:
    lines_ov.append(f"  [Zeile {line}] <{tag} id=\"{el_id}\" contenteditable=\"{mode}\">")
lines_ov.append("")

lines_ov.append("--- 3. FORMULARE & STEUERELEMENTE (INPUTS, BUTTONS, SELECTS) ---")
for line, tag, itype, el_id, name in analyzer.inputs:
    lines_ov.append(f"  [Zeile {line}] <{tag} type=\"{itype}\" id=\"{el_id}\" name=\"{name}\">")
lines_ov.append("")

lines_ov.append("--- 4. TOP-LAYER & INTERAKTIONEN (POPOVER, DIALOG, COMMANDS) ---")
lines_ov.append("• Popovers:")
for line, tag, el_id, pmode in analyzer.popovers:
    lines_ov.append(f"  [Zeile {line}] <{tag} id=\"{el_id}\" popover=\"{pmode}\">")
lines_ov.append("• Dialoge:")
for line, el_id in analyzer.dialogs:
    lines_ov.append(f"  [Zeile {line}] <dialog id=\"{el_id}\">")
lines_ov.append("• Command / Invoker Buttons:")
for line, tag, cfor, cmd in analyzer.commands:
    lines_ov.append(f"  [Zeile {line}] <{tag} commandfor=\"{cfor}\" command=\"{cmd}\">")
lines_ov.append("")

with open(overview_path, "w", encoding="utf-8") as f_ov:
    f_ov.write("\n".join(lines_ov))

print(f"HTML-Übersicht geschrieben nach: {overview_path}")

# Summary schreiben
lines_sum = []
lines_sum.append("=" * 80)
lines_sum.append("HTML ARCHITEKTUR-ZUSAMMENFASSUNG")
lines_sum.append("Projekt: DIN-Brief Neo")
lines_sum.append("=" * 80 + "\n")

lines_sum.append("1. DOM-STRUKTUR & SEMANTIK")
lines_sum.append("--------------------------------------------------------------------------------")
lines_sum.append("• App-Shell: Zweigeteilter Aufbau mit <aside class=\"no-print\"> (Sidebar) und <main id=\"viewport\">.")
lines_sum.append("• DIN-Brief Modell: Semantische Custom Elements (<din-a4>, <din-anschriftfeld>, <din-infoblock>,")
lines_sum.append("  <din-betreff>, <din-text>, etc.) mit millimetergenauen data-Attributen für Form A und Form B.")
lines_sum.append("")

lines_sum.append("2. EINGABEKONZEPT & EDITIERBARKEIT")
lines_sum.append("--------------------------------------------------------------------------------")
lines_sum.append(f"• Insgesamt {len(analyzer.contenteditables)} editierbare Bereiche.")
lines_sum.append("• Fast alle einzeiligen Felder nutzen bereits 'contenteditable=\"plaintext-only\"'.")
lines_sum.append("• Nur der eigentliche <din-text id=\"brieftext\"> und <ul id=\"anlagen-text\"> nutzen Rich-Text ('true').")
lines_sum.append("")

lines_sum.append("3. MODERNE HTML5 & TOP-LAYER APIs")
lines_sum.append("--------------------------------------------------------------------------------")
lines_sum.append(f"• Popovers: {len(analyzer.popovers)} Elemente nutzen bereits das popover-Attribut (hint/auto/manual).")
lines_sum.append(f"• Dialoge: {len(analyzer.dialogs)} nativer <dialog> für Zurücksetzen-Modal.")
lines_sum.append(f"• Invoker/Commands: {len(analyzer.commands)} Buttons steuern Aktionen deklarativ via commandfor/command.")
lines_sum.append("• Form-Steuerelemente: Segmented Controls via Radio-Inputs mit verdeckten Checkboxen.")
lines_sum.append("=" * 80)

with open(summary_path, "w", encoding="utf-8") as f_sum:
    f_sum.write("\n".join(lines_sum))

print(f"HTML-Zusammenfassung geschrieben nach: {summary_path}")

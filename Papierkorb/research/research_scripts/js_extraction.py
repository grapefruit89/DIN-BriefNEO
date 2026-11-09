import os
import re

js_dir = r"C:\Users\morit\Documents\Obsidian_Main\Websites & Software\DIN-Brief Neo\website\js"
output_file = r"C:\Users\morit\Documents\dinbrief-temp\js_extraction_overview.txt"

func_patterns = [
    re.compile(r'^\s*(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)', re.MULTILINE),
    re.compile(r'^\s*(?:async\s+)?([a-zA-Z0-9_$]+)\s*\(([^)]*)\)\s*\{', re.MULTILINE),
    re.compile(r'^\s*(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>', re.MULTILINE),
    re.compile(r'^\s*(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?function\s*\(([^)]*)\)', re.MULTILINE),
]

lines_out = []
lines_out.append("==================================================")
lines_out.append("JAVASCRIPT FUNKTIONS-ÜBERSICHT (website/js/)")
lines_out.append("==================================================\n")

for root, dirs, files in os.walk(js_dir):
    for f in sorted(files):
        if f.endswith('.js'):
            filepath = os.path.join(root, f)
            lines_out.append(f"--- Datei: {f} ---")
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as file_content:
                content = file_content.read()
                
            found = []
            for line_idx, line in enumerate(content.splitlines(), start=1):
                # match class definitions
                class_match = re.match(r'^\s*class\s+([a-zA-Z0-9_$]+)', line)
                if class_match:
                    found.append(f"  [Zeile {line_idx}] CLASS {class_match.group(1)}")
                    continue
                
                # match functions / methods
                for pattern in func_patterns:
                    m = pattern.search(line)
                    if m:
                        name = m.group(1)
                        args = m.group(2).strip()
                        if name not in ['if', 'for', 'while', 'switch', 'catch']:
                            found.append(f"  [Zeile {line_idx}] function/method {name}({args})")
                            break
            
            if found:
                lines_out.extend(found)
            else:
                lines_out.append("  (Keine Funktionen gefunden)")
            lines_out.append("")

with open(output_file, 'w', encoding='utf-8') as out:
    out.write("\n".join(lines_out))

print(f"Extraction complete. Output written to {output_file}")

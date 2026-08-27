#!/usr/bin/env python3
"""
add_wikilinks.py — Obsidian Wikilink Generator für DIN-BriefNEO
================================================================
Findet unverlinkte Dokumentnennungen in allen .md-Dateien und
konvertiert sie zu [[wikilinks]].

Regeln:
- Überspringt YAML-Frontmatter (--- Block am Anfang)
- Überspringt Code-Blöcke (``` ... ```) und Inline-Code (`...`)
- Überspringt bereits verlinkte Mentions [[...]]
- Überspringt Markdown-Links [text](url)
- Konvertiert: filename.md → [[filename]]
- Dry-run Modus zeigt Änderungen ohne zu schreiben

Aufruf:
  python tools/add_wikilinks.py          # Dry-run (nur anzeigen)
  python tools/add_wikilinks.py --apply  # Tatsächlich schreiben
"""

import os
import re
import sys
import argparse
from pathlib import Path

# ── Konfiguration ──────────────────────────────────────────────────────────────

DOCS_ROOT = Path(__file__).parent.parent  # aktueller_arbeitsordner/
MD_DIRS = [
    DOCS_ROOT / "docs",
    DOCS_ROOT,  # Wurzel-Dateien
]

# Dateien die NICHT verändert werden sollen
EXCLUDE_FILES = {
    "ADR-TEMPLATE.md",
    "GUIDE-TEMPLATE.md",
}

# Mindest-Länge eines Dateinamens um false positives zu vermeiden
MIN_STEM_LENGTH = 3


# ── Schritt 1: Alle .md-Dateien scannen und Stem-Map aufbauen ─────────────────

def collect_all_stems(md_dirs: list[Path]) -> dict[str, str]:
    """
    Gibt {stem_lowercase: stem_original} zurück.
    Stem = Dateiname ohne .md-Extension.
    """
    stems = {}
    for md_dir in md_dirs:
        for md_file in md_dir.rglob("*.md"):
            if md_file.name in EXCLUDE_FILES:
                continue
            stem = md_file.stem
            if len(stem) >= MIN_STEM_LENGTH:
                stems[stem.lower()] = stem
    return stems


# ── Schritt 2: Frontmatter überspringen ───────────────────────────────────────

def split_frontmatter(content: str) -> tuple[str, str]:
    """Gibt (frontmatter, body) zurück. Frontmatter = '---\\n...\\n---\\n'."""
    if content.startswith("---\n"):
        end = content.find("\n---\n", 4)
        if end != -1:
            frontmatter = content[:end + 5]
            body = content[end + 5:]
            return frontmatter, body
    return "", content


# ── Schritt 3: Body verarbeiten ────────────────────────────────────────────────

def process_body(body: str, stems: dict[str, str], current_stem: str) -> tuple[str, int]:
    """
    Ersetzt `stem.md` und freistehendes `STEM` durch [[stem]].
    Gibt (neuer_body, anzahl_ersetzungen) zurück.
    """
    replacements = 0
    lines = body.split("\n")
    result_lines = []
    in_code_block = False

    for line in lines:
        # Code-Block-Grenzen tracken
        if line.strip().startswith("```"):
            in_code_block = not in_code_block
            result_lines.append(line)
            continue

        if in_code_block:
            result_lines.append(line)
            continue

        # Inline-Code-Bereiche maskieren bevor wir suchen
        new_line, count = replace_in_line(line, stems, current_stem)
        replacements += count
        result_lines.append(new_line)

    return "\n".join(result_lines), replacements


def replace_in_line(line: str, stems: dict[str, str], current_stem: str) -> tuple[str, int]:
    """
    Ersetzt in einer einzelnen Zeile (außerhalb von Code-Blöcken).
    Schützt: [[...]], [text](...), `...`
    """
    # Schütze Bereiche die nicht verändert werden sollen
    protected = []  # Liste von (start, end, original_text)

    # 1. Schütze bestehende [[wikilinks]]
    for m in re.finditer(r'\[\[.*?\]\]', line):
        protected.append((m.start(), m.end(), m.group()))

    # 2. Schütze Markdown-Links [text](url)
    for m in re.finditer(r'\[.*?\]\(.*?\)', line):
        protected.append((m.start(), m.end(), m.group()))

    # 3. Schütze Inline-Code `...`
    for m in re.finditer(r'`[^`]+`', line):
        protected.append((m.start(), m.end(), m.group()))

    # 4. Schütze HTML-Tags
    for m in re.finditer(r'<[^>]+>', line):
        protected.append((m.start(), m.end(), m.group()))

    if not protected:
        return _do_replace(line, stems, current_stem)

    # Zerlege die Zeile in geschützte und freie Segmente
    protected.sort(key=lambda x: x[0])
    parts = []
    pos = 0
    replacements = 0
    for start, end, text in protected:
        if pos < start:
            free_segment, count = _do_replace(line[pos:start], stems, current_stem)
            parts.append(free_segment)
            replacements += count
        parts.append(text)  # geschützter Bereich unverändert
        pos = end
    if pos < len(line):
        free_segment, count = _do_replace(line[pos:], stems, current_stem)
        parts.append(free_segment)
        replacements += count

    return "".join(parts), replacements


def _do_replace(text: str, stems: dict[str, str], current_stem: str) -> tuple[str, int]:
    """Führt die eigentlichen Ersetzungen durch."""
    replacements = 0

    # Pattern 1: `stem.md` (explizite Dateinennungen mit Extension)
    def replace_with_ext(m):
        nonlocal replacements
        stem_key = m.group(1).lower()
        if stem_key in stems and stem_key != current_stem.lower():
            original_stem = stems[stem_key]
            replacements += 1
            return f"[[{original_stem}]]"
        return m.group(0)

    text = re.sub(
        r'(?<!\[)(?<!\[)\b([A-Za-z][A-Za-z0-9_\-]{2,})\.md\b(?!\])',
        replace_with_ext,
        text
    )

    return text, replacements


# ── Hauptprogramm ──────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Obsidian Wikilink Generator")
    parser.add_argument("--apply", action="store_true",
                        help="Änderungen tatsächlich schreiben (Standard: Dry-run)")
    parser.add_argument("--dir", type=str, default=None,
                        help="Nur dieses Verzeichnis verarbeiten")
    args = parser.parse_args()

    dry_run = not args.apply

    if dry_run:
        print("🔍 DRY-RUN — Keine Dateien werden verändert")
        print("   Führe mit --apply aus um Änderungen zu schreiben\n")
    else:
        print("✏️  APPLY — Dateien werden verändert\n")

    # Stem-Map aufbauen
    stems = collect_all_stems(MD_DIRS)
    print(f"📚 {len(stems)} Dokumente im Index:\n")
    for k, v in sorted(stems.items()):
        print(f"   {v}")
    print()

    # Alle .md-Dateien verarbeiten
    total_files = 0
    total_changes = 0
    changed_files = []

    search_dirs = [Path(args.dir)] if args.dir else MD_DIRS
    all_md_files = []
    for md_dir in search_dirs:
        all_md_files.extend(md_dir.rglob("*.md"))

    # Deduplizieren (DOCS_ROOT enthält auch docs/ — kein doppeltes Scannen)
    all_md_files = list(dict.fromkeys(all_md_files))

    for md_file in sorted(all_md_files):
        if md_file.name in EXCLUDE_FILES:
            continue
        if any(p in md_file.parts for p in [".venv", ".git", ".agents", "build"]):
            continue

        current_stem = md_file.stem
        try:
            original = md_file.read_text(encoding="utf-8-sig")
        except UnicodeDecodeError:
            original = md_file.read_text(encoding="cp1252")
            print(f"  ⚠️  Warnung: {md_file.name} ist nicht in UTF-8 kodiert. Wurde als ANSI gelesen.")
        frontmatter, body = split_frontmatter(original)
        new_body, count = process_body(body, stems, current_stem)

        if count > 0:
            total_files += 1
            total_changes += count
            rel_path = md_file.relative_to(DOCS_ROOT)
            changed_files.append((rel_path, count))
            print(f"  📝 {rel_path}  (+{count} links)")

            if args.apply:
                new_content = frontmatter + new_body
                md_file.write_text(new_content, encoding="utf-8")

    print(f"\n{'─'*60}")
    print(f"{'✅ DONE' if not dry_run else '📊 VORSCHAU'}:")
    print(f"   {total_files} Dateien {'verändert' if not dry_run else 'würden verändert'}")
    print(f"   {total_changes} Wikilinks {'hinzugefügt' if not dry_run else 'würden hinzugefügt'}")

    if dry_run and total_changes > 0:
        print(f"\n   Führe mit --apply aus um die Änderungen zu schreiben:")
        print(f"   python tools/add_wikilinks.py --apply")


if __name__ == "__main__":
    main()

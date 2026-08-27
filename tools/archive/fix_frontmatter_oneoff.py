#!/usr/bin/env python3
"""
Ergänzt fehlende Pflicht-Frontmatter-Felder (Schema V6) in Markdown-Dateien
unter docs/, ohne bestehende Werte zu verändern.

Nur zwei konkrete Lücken werden geschlossen, exakt wie vom Build-Reconciliation
gemeldet:
  - depends_on fehlt  -> depends_on: []  (leeres Array, echte Werte trägt der Autor nach)
  - code_links fehlt  -> code_links: []  (nur bei reinen Meta/Template-Dokumenten ohne Codebezug)

Einmal-Skript für den Repo-Refactor 2026-08-27, danach nach tools/archive/ verschoben.
"""
import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else ".")

FRONTMATTER_RE = re.compile(r"^---\n(.*?\n)---\n", re.DOTALL)

NEEDS_DEPENDS_ON = [
    "docs/00-foundation/HYBRID-SPEC-DRIVEN-WORKFLOW.md",
    "docs/00-foundation/Immutable-Law-Catalog.md",
    "docs/00-foundation/README.md",
    "docs/00-foundation/constitution.md",
    "docs/00-foundation/longevity-guidelines.md",
    "docs/00-foundation/spec.md",
    "docs/10-architecture/ADR-005-Sender-Synchronization.md",
    "docs/10-architecture/ADR-ANTIPATTERN.md",
    "docs/10-architecture/ADR-API.md",
    "docs/10-architecture/ADR-BETREFF.md",
    "docs/10-architecture/ADR-CSS.md",
    "docs/10-architecture/ADR-DATA-PERSISTENCE.md",
    "docs/10-architecture/ADR-FEATURE.md",
    "docs/10-architecture/ADR-HTML.md",
    "docs/10-architecture/ADR-JS.md",
    "docs/10-architecture/ADR-MIGRATION.md",
    "docs/10-architecture/ADR-OMNITRACEABILITY.md",
    "docs/10-architecture/ADR-PROFILE-MANAGEMENT.md",
    "docs/10-architecture/Architecture-Compliance-Matrix.md",
    "docs/10-architecture/Code-Referenzen.md",
    "docs/10-architecture/Function-Traceability.md",
    "docs/10-architecture/IMR-Registry.md",
    "docs/10-architecture/README.md",
    "docs/10-architecture/adr-toast-system.md",
    "docs/20-implementation/README-DB.md",
    "docs/20-implementation/README.md",
    "docs/20-implementation/Salutation-Engine.md",
    "docs/20-implementation/din-5008-css-architektur.md",
    "docs/20-implementation/geoapify-autocomplete.md",
    "docs/20-implementation/glossary.md",
    "docs/20-implementation/no-scroll-techniques.md",
    "docs/20-implementation/sqlite-vec.md",
    "docs/20-implementation/testing-guide.md",
    "docs/20-implementation/toast-system.md",
    "docs/30-meta/ADR-TEMPLATE.md",
    "docs/30-meta/DIN-BriefNEO_memory_konsolidiert.md",
    "docs/30-meta/Feature-Matrix.md",
    "docs/30-meta/GUIDE-TEMPLATE.md",
    "docs/30-meta/OBSIDIAN-SETUP-GUIDE.md",
    "docs/30-meta/PROJECT.md",
    "docs/30-meta/README.md",
    "docs/30-meta/ROADMAP.md",
    "docs/30-meta/architektur-evolution-und-quellen.md",
    "docs/30-meta/tooling-overview.md",
    "docs/30-meta/web-standards-tracking.md",
    "docs/index.md",
]

NEEDS_CODE_LINKS = [
    "docs/00-foundation/README.md",
    "docs/10-architecture/README.md",
    "docs/20-implementation/README.md",
    "docs/30-meta/ADR-TEMPLATE.md",
    "docs/30-meta/GUIDE-TEMPLATE.md",
    "docs/30-meta/README.md",
    "docs/30-meta/ROADMAP.md",
    "docs/30-meta/architektur-evolution-und-quellen.md",
    "docs/index.md",
]


def add_field_before_closing(content: str, field_line: str) -> str:
    m = FRONTMATTER_RE.match(content)
    if not m:
        raise ValueError("Kein Frontmatter-Block gefunden")
    fm_body = m.group(1)
    if not fm_body.endswith("\n"):
        fm_body += "\n"
    new_fm_body = fm_body + field_line + "\n"
    return content[: m.start(1)] + new_fm_body + content[m.end(1):]


def already_has_field(content: str, field: str) -> bool:
    m = FRONTMATTER_RE.match(content)
    if not m:
        return False
    fm_body = m.group(1)
    return re.search(rf"^{re.escape(field)}\s*:", fm_body, re.MULTILINE) is not None


def process(rel_path: str, field: str, line: str):
    path = ROOT / rel_path
    if not path.exists():
        print(f"SKIP (not found): {rel_path}")
        return
    content = path.read_text(encoding="utf-8")
    if already_has_field(content, field):
        print(f"SKIP (already has {field}): {rel_path}")
        return
    new_content = add_field_before_closing(content, line)
    path.write_text(new_content, encoding="utf-8", newline="\n")
    print(f"FIXED ({field}): {rel_path}")


def main():
    for rel in NEEDS_DEPENDS_ON:
        process(rel, "depends_on", "depends_on: []")
    for rel in NEEDS_CODE_LINKS:
        process(rel, "code_links", "code_links: []")


if __name__ == "__main__":
    main()

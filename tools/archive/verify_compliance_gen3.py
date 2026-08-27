import os
import yaml
import sys
from datetime import datetime

# Reconfigure stdout/stderr to use UTF-8 on Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except AttributeError:
        pass

# Configurations
DOCS_DIR = r"c:\Users\morit\Documents\Obsidian_Main\Websites & Software\DIN-Brief Neo\aktueller_arbeitsordner\docs"
REPORT_PATH = r"c:\Users\morit\Documents\Obsidian_Main\Websites & Software\DIN-Brief Neo\.agents\teamwork_preview_challenger_m3_2_gen3\verification.md"

REQUIRED_KEYS = ["id", "created", "updated", "title", "type", "status", "doc_links", "code_links", "depends_on", "tags"]
BANNED_WORDS = ["React", "Vue", "innerHTML"]

def run_verification():
    log_messages = []
    def log(msg):
        print(msg)
        log_messages.append(msg)

    log(f"Starting verification at {datetime.now().isoformat()}...")
    log(f"Scanning directory: {DOCS_DIR}")
    
    files_scanned = 0
    passed_frontmatter = 0
    passed_banned_words = 0
    non_compliant_files = []
    
    # Sort walk for deterministic output
    for root, dirs, files in sorted(os.walk(DOCS_DIR)):
        for file in sorted(files):
            if not file.endswith('.md'):
                continue
                
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, DOCS_DIR)
            files_scanned += 1
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
            except Exception as e:
                log(f"[ERROR] Failed to read {rel_path}: {e}")
                non_compliant_files.append({
                    'file': rel_path,
                    'errors': [f"Failed to read file: {e}"]
                })
                continue
            
            errors = []
            meta = None
            
            # Extract frontmatter
            if content.startswith("---"):
                parts = content.split("---", 2)
                if len(parts) >= 3:
                    frontmatter_str = parts[1]
                    try:
                        meta = yaml.safe_load(frontmatter_str)
                    except Exception as e:
                        errors.append(f"Frontmatter parsing error (PyYAML): {e}")
                else:
                    errors.append("Invalid frontmatter formatting (missing closing ---)")
            else:
                errors.append("Missing frontmatter block (does not start with ---)")
                
            if meta is not None:
                if not isinstance(meta, dict):
                    errors.append("Frontmatter is not a dictionary/object")
                else:
                    # Verify V6 Frontmatter keys
                    missing_keys = [k for k in REQUIRED_KEYS if k not in meta]
                    if missing_keys:
                        errors.append(f"Missing V6 keys: {', '.join(missing_keys)}")
                        
                    # Verify ADR-specific fields
                    if meta.get('type') == 'adr':
                        adr_errors = []
                        if 'chosen_option' not in meta:
                            adr_errors.append('chosen_option')
                        if 'decision_options' not in meta:
                            adr_errors.append('decision_options')
                        if adr_errors:
                            errors.append(f"ADR missing fields: {', '.join(adr_errors)}")

            frontmatter_ok = len(errors) == 0
            if frontmatter_ok:
                passed_frontmatter += 1
                
            # Case-sensitive search for React, Vue, innerHTML
            banned_found = []
            lines = content.splitlines()
            for line_idx, line in enumerate(lines, 1):
                for word in BANNED_WORDS:
                    if word in line:
                        banned_found.append({
                            'word': word,
                            'line': line_idx,
                            'content': line.strip()
                        })
            
            if banned_found:
                for bf in banned_found:
                    errors.append(f"Banned word '{bf['word']}' found on line {bf['line']}: \"{bf['content'][:100]}\"")
            else:
                passed_banned_words += 1
                
            if errors:
                log(f"[FAIL] {rel_path}")
                for err in errors:
                    log(f"  - {err}")
                non_compliant_files.append({
                    'file': rel_path,
                    'errors': errors
                })
            else:
                log(f"[PASS] {rel_path}")

    # Read our own script source code
    try:
        with open(__file__, 'r', encoding='utf-8') as f:
            script_code = f.read()
    except Exception as e:
        script_code = f"Error reading script code: {e}"

    # Generate the Markdown Report
    report_content = f"""# Documentation Verification Report

## Verification Metadata
- **Date/Time**: {datetime.now().isoformat()}
- **Workspace Directory**: `{DOCS_DIR}`
- **Scrubbing Validation**: React, Vue, innerHTML (Case-Sensitive)

## Verification Result Summary
- **Total Markdown Files Scanned**: {files_scanned}
- **V6 Frontmatter Compliance**: {passed_frontmatter} / {files_scanned} ({passed_frontmatter / files_scanned * 100:.2f}%)
- **Banned Word Compliance**: {passed_banned_words} / {files_scanned} ({passed_banned_words / files_scanned * 100:.2f}%)
- **Overall Status**: {"PASS" if not non_compliant_files else "FAIL"}

## Detailed Compliance Status
"""

    if not non_compliant_files:
        report_content += "\nAll scanned markdown files are 100% compliant with V6 frontmatter specifications and have successfully had all occurrences of 'React', 'Vue', and 'innerHTML' scrubbed.\n"
    else:
        report_content += f"\nFound {len(non_compliant_files)} non-compliant file(s):\n\n"
        for item in non_compliant_files:
            report_content += f"### File: `{item['file']}`\n"
            for err in item['errors']:
                report_content += f"- [ ] {err}\n"
            report_content += "\n"

    report_content += f"""
## Verification Script (`verify_compliance_gen3.py`)
```python
{script_code}
```

## Raw Execution Logs
```text
{"\n".join(log_messages)}
```
"""

    # Write report
    try:
        os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
        with open(REPORT_PATH, 'w', encoding='utf-8') as f:
            f.write(report_content)
        print(f"\nVerification report written successfully to {REPORT_PATH}")
    except Exception as e:
        print(f"\nFailed to write report to {REPORT_PATH}: {e}")
        sys.exit(2)

    if non_compliant_files:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == '__main__':
    run_verification()

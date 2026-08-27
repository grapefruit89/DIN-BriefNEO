import os
import re
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
REPORT_PATH = r"c:\Users\morit\Documents\Obsidian_Main\Websites & Software\DIN-Brief Neo\.agents\teamwork_preview_challenger_m3_1\verification.md"

REQUIRED_KEYS = ["id", "created", "updated", "title", "type", "status", "doc_links", "code_links", "depends_on", "tags"]
BANNED_WORDS = ["React", "Vue", "innerHTML"]

def parse_frontmatter(content):
    # Match the frontmatter at the beginning of the file
    match = re.match(r'^---\r?\n(.*?)\r?\n---\r?\n(.*)', content, re.DOTALL)
    if not match:
        return None, content
    return match.group(1), match.group(2)

def parse_simple_yaml(text):
    data = {}
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line.strip() or line.strip().startswith('#'):
            i += 1
            continue
        
        # Check for key-value pair
        match = re.match(r'^([a-zA-Z0-9_-]+):\s*(.*)$', line)
        if match:
            key = match.group(1)
            val = match.group(2).strip()
            
            # Remove optional quotes
            if (val.startswith("'") and val.endswith("'")) or (val.startswith('"') and val.endswith('"')):
                val = val[1:-1]
                
            if val == '[]':
                data[key] = []
                i += 1
            elif val == '{}':
                data[key] = {}
                i += 1
            elif val.startswith('[') and val.endswith(']'):
                inner = val[1:-1].strip()
                if not inner:
                    data[key] = []
                else:
                    items = [item.strip() for item in inner.split(',')]
                    items_cleaned = []
                    for item in items:
                        if (item.startswith("'") and item.endswith("'")) or (item.startswith('"') and item.endswith('"')):
                            item = item[1:-1]
                        items_cleaned.append(item)
                    data[key] = items_cleaned
                i += 1
            elif val == '':
                # Collect indented/sub-lines
                sub_lines = []
                j = i + 1
                while j < len(lines):
                    next_line = lines[j]
                    if not next_line.strip():
                        j += 1
                        continue
                    indent = len(next_line) - len(next_line.lstrip())
                    if indent > 0 or next_line.strip().startswith('-'):
                        sub_lines.append(next_line)
                        j += 1
                    else:
                        break
                
                # Parse sub_lines as list or nested dict
                if sub_lines:
                    if any(line.strip().startswith('-') for line in sub_lines):
                        lst = []
                        for sub_line in sub_lines:
                            sub_strip = sub_line.strip()
                            if sub_strip.startswith('-'):
                                item = sub_strip[1:].strip()
                                if (item.startswith("'") and item.endswith("'")) or (item.startswith('"') and item.endswith('"')):
                                    item = item[1:-1]
                                lst.append(item)
                        data[key] = lst
                    else:
                        # Parse as dict
                        nested = {}
                        for sub_line in sub_lines:
                            sub_match = re.match(r'^\s*([a-zA-Z0-9_-]+):\s*(.*)$', sub_line)
                            if sub_match:
                                sub_k = sub_match.group(1)
                                sub_v = sub_match.group(2).strip()
                                if (sub_v.startswith("'") and sub_v.endswith("'")) or (sub_v.startswith('"') and sub_v.endswith('"')):
                                    sub_v = sub_v[1:-1]
                                nested[sub_k] = sub_v
                        data[key] = nested
                    i = j
                else:
                    data[key] = None
                    i += 1
            else:
                data[key] = val
                i += 1
        else:
            i += 1
    return data

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
                
            fm_text, body = parse_frontmatter(content)
            errors = []
            
            # 1. Frontmatter compliance assertion
            if fm_text is None:
                errors.append("Missing frontmatter block (starts/ends with ---)")
                meta = {}
            else:
                try:
                    meta = parse_simple_yaml(fm_text)
                    
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
                except Exception as e:
                    errors.append(f"Frontmatter parsing error: {e}")
                    meta = {}

            frontmatter_ok = len(errors) == 0
            if frontmatter_ok:
                passed_frontmatter += 1
                
            # 2. Case-sensitive search for React, Vue, innerHTML
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
## Verification Script (`verify_compliance.py`)
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

if __name__ == '__main__':
    run_verification()

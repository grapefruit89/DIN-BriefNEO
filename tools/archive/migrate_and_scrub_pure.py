import os
import re
import subprocess
import sys
from datetime import datetime
import frontmatter

WORKING_DIR = r"c:\Users\morit\Documents\Obsidian_Main\Websites & Software\DIN-Brief Neo\aktueller_arbeitsordner"
DOCS_DIR = os.path.join(WORKING_DIR, "docs")

BANNED_WORDS = ["React", "Vue", "innerHTML"]
BANNED_PATTERNS = {
    'new Date': re.compile(r'\bnew\s+Date\b'),
    'rgba': re.compile(r'\brgba\b', re.IGNORECASE),
    'rgb': re.compile(r'\brgb\b', re.IGNORECASE),
    'hsl': re.compile(r'\bhsl\b', re.IGNORECASE),
    'hex_color': re.compile(r'(?<!#)#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b')
}

def get_git_dates(file_path, repo_dir):
    try:
        rel_path = os.path.relpath(file_path, repo_dir)
        result = subprocess.run(
            ['git', 'log', '--follow', '--format=%aI', '--', rel_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            cwd=repo_dir,
            check=True
        )
        dates = [line.strip() for line in result.stdout.splitlines() if line.strip()]
        if dates:
            updated = dates[0][:10]
            created = dates[-1][:10]
            return created, updated
    except Exception as e:
        print(f"  [Git Warning] Failed git log for {os.path.basename(file_path)}: {e}")
    
    # Fallback to filesystem metadata
    try:
        stat = os.stat(file_path)
        created_dt = datetime.fromtimestamp(stat.st_ctime)
        updated_dt = datetime.fromtimestamp(stat.st_mtime)
        c_str = created_dt.strftime('%Y-%m-%d')
        u_str = updated_dt.strftime('%Y-%m-%d')
        if c_str > u_str:
            c_str = u_str
        return c_str, u_str
    except Exception as e:
        print(f"  [Stat Warning] Failed stat for {os.path.basename(file_path)}: {e}")
    
    today = datetime.now().strftime('%Y-%m-%d')
    return today, today

def derive_type(file_path):
    parts = file_path.lower().replace('\\', '/').split('/')
    if 'adr' in parts or any(p.startswith('adr-') for p in parts):
        return 'adr'
    if 'guides' in parts or 'guide' in os.path.basename(file_path).lower():
        return 'guide'
    
    filename = os.path.basename(file_path).lower()
    if filename.startswith('readme'):
        return 'README'
    if filename == 'changelog.md':
        return 'changelog'
    if filename == 'decision-log.md':
        return 'log'
    if filename == 'constitution.md':
        return 'policy'
    if filename in ('spec.md', 'specification.md'):
        return 'specification'
    if 'roadmap' in filename:
        return 'roadmap'
    if 'matrix' in filename:
        return 'matrix'
    if 'registry' in filename:
        return 'registry'
    return 'concept'

def derive_id(filename, file_type):
    name = os.path.splitext(filename)[0]
    cleaned = re.sub(r'[^a-z0-9\-]', '', name.lower().replace(' ', '-').replace('_', '-'))
    cleaned = re.sub(r'-+', '-', cleaned).strip('-')
    
    if cleaned in ('index', 'readme'):
        return cleaned
        
    if file_type == 'adr' and not cleaned.startswith('adr-'):
        cleaned = f"adr-{cleaned}"
    elif file_type == 'guide' and not cleaned.startswith('guide-'):
        cleaned = f"guide-{cleaned}"
    return cleaned

def parse_markdown_blocks(content):
    lines = content.splitlines()
    blocks = []
    current_block = []
    in_code_block = False
    
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('```'):
            if in_code_block:
                current_block.append(line)
                blocks.append(('\n'.join(current_block), 'code_block'))
                current_block = []
                in_code_block = False
            else:
                if current_block:
                    blocks.append(('\n'.join(current_block), 'text'))
                    current_block = []
                current_block.append(line)
                in_code_block = True
        elif in_code_block:
            current_block.append(line)
        else:
            if stripped == '':
                if current_block:
                    blocks.append(('\n'.join(current_block), 'text'))
                    current_block = []
            elif stripped.startswith('#'):
                if current_block:
                    blocks.append(('\n'.join(current_block), 'text'))
                    current_block = []
                blocks.append((line, 'heading'))
            elif stripped.startswith('- ') or stripped.startswith('* ') or stripped.startswith('+ ') or re.match(r'^\d+\.\s', stripped):
                if current_block:
                    blocks.append(('\n'.join(current_block), 'text'))
                    current_block = []
                blocks.append((line, 'bullet'))
            else:
                current_block.append(line)
                
    if current_block:
        block_type = 'code_block' if in_code_block else 'text'
        blocks.append(('\n'.join(current_block), block_type))
        
    return blocks

def scrub_content(content, filename):
    blocks = parse_markdown_blocks(content)
    cleaned_blocks = []
    scrubbed_count = 0
    
    for block_text, block_type in blocks:
        # Check for case-sensitive React, Vue, innerHTML anywhere in block
        has_unconditional = any(word in block_text for word in BANNED_WORDS)
        
        # Check other patterns
        has_other_pattern = False
        other_type = None
        for name, pattern in BANNED_PATTERNS.items():
            if pattern.search(block_text):
                has_other_pattern = True
                other_type = name
                break
        
        if has_unconditional:
            print(f"  [Scrubbed] Deleted {block_type} block in {filename} containing exact banned keyword (React/Vue/innerHTML).")
            scrubbed_count += 1
        elif has_other_pattern:
            if block_type == 'code_block':
                print(f"  [Scrubbed] Deleted {block_type} block in {filename} containing {other_type}.")
                scrubbed_count += 1
            else:
                # Check if it is a prohibition block
                is_warning = bool(re.search(
                    r'\b(kein|keine|verboten|untersagt|vermeide|avoid|never|not|deprecated|banned|'
                    r'anti-pattern|antipattern|dont|don\'t|deprecate|alternative|anstelle|statt|'
                    r'verzicht|verzichten|ausschließen|regeln|verbot|nicht|no|without)\b',
                    block_text, re.IGNORECASE
                ))
                if is_warning:
                    cleaned_blocks.append(block_text)
                else:
                    print(f"  [Scrubbed] Deleted {block_type} block in {filename} containing casual {other_type}.")
                    scrubbed_count += 1
        else:
            cleaned_blocks.append(block_text)
            
    return '\n\n'.join(cleaned_blocks), scrubbed_count

def process_file(file_path, dry_run=True):
    filename = os.path.basename(file_path)
    rel_path = os.path.relpath(file_path, WORKING_DIR)
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            post = frontmatter.load(f)
    except Exception as e:
        print(f"  [Error] Failed to read {rel_path}: {e}")
        return False
        
    meta = post.metadata
    body = post.content
    
    # 1. Frontmatter Migration (R1)
    if 'type' not in meta:
        meta['type'] = derive_type(file_path)
        
    # Derive clean ID
    if 'id' not in meta or meta['id'] == 'doc-index-root' or "YYYY-MM-DD" in str(meta['id']):
        derived_id = derive_id(filename, meta['type'])
        if 'Support' in file_path or 'support' in file_path:
            derived_id = f"{derived_id}-support"
        meta['id'] = derived_id
        print(f"  [Derived] id: {meta['id']} for {filename}")
        
    # Correct Git Dates
    created_date, updated_date = get_git_dates(file_path, WORKING_DIR)
    
    meta['created'] = created_date
    meta['updated'] = updated_date
    
    # Set standard title if missing
    if 'title' not in meta or not meta['title'] or "YYYY-MM-DD" in str(meta['title']):
        # Find first heading in body
        h_match = re.search(r'^#\s+(.*)$', body, re.MULTILINE)
        if h_match:
            meta['title'] = h_match.group(1).strip()
        else:
            meta['title'] = os.path.splitext(filename)[0].replace('-', ' ').replace('_', ' ').title()
            
    # Standard array fields
    for field in ['doc_links', 'code_links', 'depends_on', 'tags']:
        if field not in meta or not isinstance(meta[field], list):
            meta[field] = []
            
    if 'status' not in meta:
        meta['status'] = 'active'
        
    # Additional fields for ADR
    if meta['type'] == 'adr':
        if 'chosen_option' not in meta:
            meta['chosen_option'] = ""
        if 'decision_options' not in meta:
            meta['decision_options'] = []
            
    # Clean placeholders like YYYY-MM-DD in all values
    for k, v in list(meta.items()):
        if isinstance(v, str) and ("YYYY-MM-DD" in v or v == "TBD"):
            meta[k] = ""
            
    # 2. Rule Violation Scrub (R2)
    cleaned_body, scrubbed = scrub_content(body, filename)
    post.content = cleaned_body
    
    if not dry_run:
        try:
            # frontmatter.dumps will automatically serialize YAML using PyYAML safely
            # and it will handle dict list types correctly and quote strings with @ properly!
            new_content = frontmatter.dumps(post)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"  [Saved] Updated {filename} (scrubbed {scrubbed} blocks)")
        except Exception as e:
            print(f"  [Error] Failed to write {filename}: {e}")
            return False
            
    return True

def run_migration_and_scrub(dry_run=True):
    print(f"Starting documentation migration and scrubbing...")
    print(f"Docs Directory: {DOCS_DIR}")
    print(f"Dry Run: {dry_run}")
    
    total = 0
    success = 0
    
    for root, dirs, files in os.walk(DOCS_DIR):
        for file in files:
            if not file.endswith('.md'):
                continue
            file_path = os.path.join(root, file)
            total += 1
            if process_file(file_path, dry_run=dry_run):
                success += 1
                
    print(f"\nCompleted: {success}/{total} files processed.")

if __name__ == '__main__':
    write_mode = '--write' in sys.argv
    run_migration_and_scrub(dry_run=not write_mode)

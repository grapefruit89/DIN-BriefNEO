import os
import re
import subprocess
import sys
from datetime import datetime
import frontmatter

# Define the paths
WORKING_DIR = r"c:\Users\morit\Documents\Obsidian_Main\Websites & Software\DIN-Brief Neo\aktueller_arbeitsordner"
DOCS_DIR = os.path.join(WORKING_DIR, "docs")
AUDIT_REPORT_PATH = os.path.join(WORKING_DIR, "audit_report.md")

# Banned patterns for R2 scrubbing
BANNED_PATTERNS = {
    'React': re.compile(r'\bReact\b', re.IGNORECASE),
    'Vue': re.compile(r'\bVue\b', re.IGNORECASE),
    'innerHTML': re.compile(r'\binnerHTML\b'),
    'new Date': re.compile(r'\bnew\s+Date\b'),
    'rgba': re.compile(r'\brgba\b', re.IGNORECASE),
    'rgb': re.compile(r'\brgb\b', re.IGNORECASE),
    'hsl': re.compile(r'\bhsl\b', re.IGNORECASE),
    'hex_color': re.compile(r'(?<!#)#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b')
}

def get_git_dates(file_path, repo_dir):
    """
    Get the first and last commit dates for a file in git history.
    If not in git, fallback to file system metadata.
    """
    try:
        # Run git log command to get commit timestamps in ISO format
        result = subprocess.run(
            ['git', 'log', '--follow', '--format=%aI', '--', file_path],
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
        print(f"Git log failed for {os.path.basename(file_path)}: {e}")
    
    # Fallback to filesystem metadata
    try:
        stat = os.stat(file_path)
        # On Windows, st_ctime is creation time, st_mtime is modification time
        created_dt = datetime.fromtimestamp(stat.st_ctime)
        updated_dt = datetime.fromtimestamp(stat.st_mtime)
        c_str = created_dt.strftime('%Y-%m-%d')
        u_str = updated_dt.strftime('%Y-%m-%d')
        if c_str > u_str:
            c_str = u_str
        return c_str, u_str
    except Exception as e:
        print(f"File metadata failed for {os.path.basename(file_path)}: {e}")
    
    # Ultimate fallback to today
    today = datetime.now().strftime('%Y-%m-%d')
    return today, today

def derive_type(file_path):
    """
    Derive the document type based on path, filename, and content clues.
    """
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
    """
    Derive the document ID dynamically from the filename.
    """
    name = os.path.splitext(filename)[0]
    cleaned = re.sub(r'[^a-z0-9\-]', '', name.lower().replace(' ', '-').replace('_', '-'))
    cleaned = re.sub(r'-+', '-', cleaned).strip('-')
    
    if file_type == 'adr' and not cleaned.startswith('adr-'):
        cleaned = f"adr-{cleaned}"
    elif file_type == 'guide' and not cleaned.startswith('guide-'):
        cleaned = f"guide-{cleaned}"
        
    return cleaned

def parse_markdown_blocks(content):
    """
    Parse markdown into blocks while keeping code blocks intact.
    Returns list of tuples: (block_content, block_type)
    """
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

PROHIBITION_WORDS_RE = re.compile(
    r'\b(kein|keine|verboten|untersagt|vermeide|avoid|never|not|deprecated|banned|'
    r'anti-pattern|antipattern|dont|don\'t|deprecate|alternative|anstelle|statt|'
    r'ächtung|ächtet|warum|philosophie|säule|verzicht|verzichten|ausschließen|'
    r'ausschluss|ordnung|regeln|gesetz|verbot|abgelehnt|zurückgewiesen|nicht|'
    r'no|without|historisch|geschichte|damals|früher|alt|altlast|altlasten|'
    r'klassisch|klassische|detektor|detector|detectors|checker|linting|'
    r'validation|pipeline|prüfung|compliance|untersuchung)\b',
    re.IGNORECASE
)

def is_prohibition_or_rejection(block_text):
    """
    Check if the block expresses a prohibition, warning, or rejection rather than casual use.
    """
    return bool(PROHIBITION_WORDS_RE.search(block_text))

def scrub_content(content, filename):
    """
    Review text content and delete paragraphs/bullet points/code blocks that use banned tech casually.
    """
    blocks = parse_markdown_blocks(content)
    cleaned_blocks = []
    scrubbed_count = 0
    
    for block_text, block_type in blocks:
        has_violation = False
        violation_type = None
        
        # Check against banned patterns
        for name, pattern in BANNED_PATTERNS.items():
            if pattern.search(block_text):
                has_violation = True
                violation_type = name
                break
        
        # Unconditional case-sensitive deletion for React, Vue, innerHTML
        is_unconditional_ban = any(sub in block_text for sub in ["React", "Vue", "innerHTML"])
        
        if is_unconditional_ban:
            # Unconditionally deleted (not kept even if it has prohibition keywords)
            print(f"  [Scrubbed] Unconditionally deleted {block_type} block in {filename} containing exact banned keyword.")
            scrubbed_count += 1
        elif has_violation:
            if block_type == 'code_block':
                # Code blocks using banned tech are direct violations and always deleted
                print(f"  [Scrubbed] Deleted {block_type} block in {filename} containing {violation_type}.")
                scrubbed_count += 1
            elif is_prohibition_or_rejection(block_text):
                # Text blocks expressing prohibition/warnings are kept
                cleaned_blocks.append(block_text)
            else:
                # Text blocks using/recommending banned tech casually are deleted
                print(f"  [Scrubbed] Deleted {block_type} block in {filename} containing {violation_type}.")
                scrubbed_count += 1
        else:
            cleaned_blocks.append(block_text)
            
    # Reassemble blocks with double newlines
    # Headings and bullets don't need double newlines before them if they are adjacent, 
    # but separating all blocks with double newlines is standard markdown formatting.
    return '\n\n'.join(cleaned_blocks), scrubbed_count

def process_file(file_path):
    """
    Parse a single markdown file, update its frontmatter to V6, and scrub violations.
    """
    filename = os.path.basename(file_path)
    rel_path = os.path.relpath(file_path, WORKING_DIR)
    print(f"Processing {rel_path}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            post = frontmatter.load(f)
    except Exception as e:
        print(f"  [Error] Failed to read {rel_path}: {e}")
        return False
        
    meta = post.metadata
    content = post.content
    
    # 1. Frontmatter Migration (R1)
    # Determine type
    if 'type' not in meta:
        meta['type'] = derive_type(file_path)
        print(f"  [Derived] type: {meta['type']}")
        
    # Determine ID
    if 'id' not in meta:
        derived_id = derive_id(filename, meta['type'])
        if 'Support' in file_path or 'support' in file_path:
            derived_id = f"{derived_id}-support"
        meta['id'] = derived_id
        print(f"  [Derived] id: {meta['id']}")
        
    # Get created and updated dates
    created_date, updated_date = get_git_dates(file_path, WORKING_DIR)
    
    if 'created' not in meta or not meta['created']:
        meta['created'] = created_date
        print(f"  [Derived] created: {meta['created']}")
    if 'updated' not in meta or not meta['updated']:
        meta['updated'] = updated_date
        print(f"  [Derived] updated: {meta['updated']}")
        
    # Standard array fields
    if 'doc_links' not in meta:
        meta['doc_links'] = []
    if 'code_links' not in meta:
        meta['code_links'] = []
    if 'depends_on' not in meta:
        meta['depends_on'] = []
    if 'tags' not in meta:
        meta['tags'] = []
    if 'status' not in meta:
        meta['status'] = 'active'
        
    # Additional fields for ADR
    if meta['type'] == 'adr':
        if 'chosen_option' not in meta:
            meta['chosen_option'] = ""
        if 'decision_options' not in meta:
            meta['decision_options'] = []
        else:
            # Ensure each option in decision_options has a status
            opts = meta['decision_options']
            if isinstance(opts, list):
                for opt in opts:
                    if isinstance(opt, dict) and 'status' not in opt:
                        opt['status'] = 'considered'
                meta['decision_options'] = opts

    # 2. Rule Violation Scrub (R2)
    # We scrub content for files that are flagged with violations in the audit report
    # For safety and thoroughness, we check all processed files, but we only print details for deletions.
    cleaned_content, scrubbed_count = scrub_content(content, filename)
    post.content = cleaned_content
    
    # Save file back (Dry run check or actual write)
    # Since we are in read-only investigation mode, the runner script will write findings.
    # To demonstrate implementation, this script can write back if Overwrite is enabled.
    return post, scrubbed_count

def run_migration_and_scrub(dry_run=True):
    """
    Run migration and scrubbing across the docs directory.
    """
    print(f"Starting documentation migration and scrubbing...")
    print(f"Docs Directory: {DOCS_DIR}")
    print(f"Dry Run: {dry_run}")
    
    stats = {
        'total': 0,
        'migrated': 0,
        'scrubbed_blocks': 0,
        'errors': 0
    }
    
    for root, dirs, files in os.walk(DOCS_DIR):
        for file in files:
            if not file.endswith('.md'):
                continue
            
            # Skip TEMPLATE files if required, but let's parse all for completeness
            file_path = os.path.join(root, file)
            stats['total'] += 1
            
            res = process_file(file_path)
            if res:
                post, scrubbed = res
                stats['migrated'] += 1
                stats['scrubbed_blocks'] += scrubbed
                
                if not dry_run:
                    try:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(frontmatter.dumps(post))
                        print(f"  [Saved] Updated {file}")
                    except Exception as e:
                        print(f"  [Error] Failed to write {file}: {e}")
                        stats['errors'] += 1
            else:
                stats['errors'] += 1
                
    print("\nMigration & Scrubbing Summary:")
    print(f"  Total files scanned: {stats['total']}")
    print(f"  Files migrated successfully: {stats['migrated']}")
    print(f"  Blocks scrubbed (deleted): {stats['scrubbed_blocks']}")
    print(f"  Errors encountered: {stats['errors']}")
    return stats

if __name__ == '__main__':
    # Default is dry-run. Run with --write to actually modify files.
    write_mode = '--write' in sys.argv
    run_migration_and_scrub(dry_run=not write_mode)

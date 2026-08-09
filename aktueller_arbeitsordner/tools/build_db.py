import os
import sqlite3
import re
import json
import frontmatter
from markdown_it import MarkdownIt
import sqlite_vec
from sentence_transformers import SentenceTransformer

# --- Custom Markdown-It Plugin for Wikilinks ---
def wikilink_plugin(md):
    def wikilink_rule(state, silent):
        start = state.pos
        if state.src[start:start+2] != '[[':
            return False
        
        end = state.src.find(']]', start + 2)
        if end == -1:
            return False
            
        if not silent:
            link_text = state.src[start+2:end]
            label = link_text
            target = link_text
            if '|' in link_text:
                parts = link_text.split('|', 1)
                target = parts[0]
                label = parts[1]
                
            token = state.push('wikilink', '', 0)
            token.content = label
            token.meta = {'target': target}
            
        state.pos = end + 2
        return True

    md.inline.ruler.before('link', 'wikilink', wikilink_rule)


def init_db(cursor):
    # Drop existing tables to avoid locking/migration issues
    cursor.execute('DROP TABLE IF EXISTS tbl_decision_options')
    cursor.execute('DROP TABLE IF EXISTS tbl_code_entities')
    cursor.execute('DROP TABLE IF EXISTS tbl_concept_links')
    cursor.execute('DROP TABLE IF EXISTS tbl_concepts_fts')
    cursor.execute('DROP TABLE IF EXISTS tbl_concepts')
    cursor.execute('DROP TABLE IF EXISTS tbl_concept_chunks')
    cursor.execute('DROP TABLE IF EXISTS tbl_concept_embeddings')
    cursor.execute('DROP TABLE IF EXISTS tbl_file_hashes')

    cursor.execute('''
    CREATE TABLE tbl_concepts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      chosen_option TEXT,
      content_body TEXT NOT NULL,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    cursor.execute('''
    CREATE TABLE tbl_concept_links (
      source_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      FOREIGN KEY (source_id) REFERENCES tbl_concepts(id) ON DELETE CASCADE,
      PRIMARY KEY (source_id, target_id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE tbl_code_entities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_path TEXT NOT NULL,
      line_number INTEGER NOT NULL,
      concept_id TEXT NOT NULL,
      FOREIGN KEY (concept_id) REFERENCES tbl_concepts(id) ON DELETE CASCADE
    )
    ''')

    cursor.execute('''
    CREATE TABLE tbl_decision_options (
      adr_id TEXT NOT NULL,
      option_id TEXT NOT NULL,
      label TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (adr_id) REFERENCES tbl_concepts(id) ON DELETE CASCADE
    )
    ''')
    
    cursor.execute('''
    CREATE VIRTUAL TABLE tbl_concepts_fts USING fts5(
        id, title, content_body, content='tbl_concepts', content_rowid='rowid'
    )
    ''')

    # Triggers for FTS
    cursor.execute('''
    CREATE TRIGGER tbl_concepts_ai AFTER INSERT ON tbl_concepts BEGIN
        INSERT INTO tbl_concepts_fts(rowid, id, title, content_body)
        VALUES (new.rowid, new.id, new.title, new.content_body);
    END;
    ''')
    cursor.execute('''
    CREATE TRIGGER tbl_concepts_ad AFTER DELETE ON tbl_concepts BEGIN
        INSERT INTO tbl_concepts_fts(tbl_concepts_fts, rowid, id, title, content_body)
        VALUES ('delete', old.rowid, old.id, old.title, old.content_body);
    END;
    ''')
    cursor.execute('''
    CREATE TRIGGER tbl_concepts_au AFTER UPDATE ON tbl_concepts BEGIN
        INSERT INTO tbl_concepts_fts(tbl_concepts_fts, rowid, id, title, content_body)
        VALUES ('delete', old.rowid, old.id, old.title, old.content_body);
        INSERT INTO tbl_concepts_fts(rowid, id, title, content_body)
        VALUES (new.rowid, new.id, new.title, new.content_body);
    END;
    ''')

    # Phase 2: sqlite-vec
    cursor.execute('''
    CREATE TABLE tbl_concept_chunks (
      rowid INTEGER PRIMARY KEY AUTOINCREMENT,
      concept_id TEXT NOT NULL,
      chunk_text TEXT NOT NULL,
      FOREIGN KEY (concept_id) REFERENCES tbl_concepts(id) ON DELETE CASCADE
    )
    ''')
    cursor.execute('''
    CREATE VIRTUAL TABLE tbl_concept_embeddings USING vec0(
      embedding float[384]
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE tbl_file_hashes (
      file_path TEXT PRIMARY KEY,
      hash TEXT NOT NULL
    )
    ''')

def chunk_markdown(content):
    chunks = re.split(r'(?m)^(#+.*?)$', content)
    final_chunks = []
    current_chunk = ""
    for piece in chunks:
        if piece.startswith('#'):
            if current_chunk.strip():
                final_chunks.append(current_chunk.strip())
            current_chunk = piece + "\n"
        else:
            current_chunk += piece
    if current_chunk.strip():
        final_chunks.append(current_chunk.strip())
    return final_chunks

import hashlib

def get_file_hash(content):
    return hashlib.md5(content.encode('utf-8')).hexdigest()

def parse_docs(md_parser, docs_dir):
    concepts = []
    file_hashes = {}
    
    for root, dirs, files in os.walk(docs_dir):
        for file in files:
            if file.endswith('.md'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        raw_content = f.read()
                        f.seek(0)
                        post = frontmatter.load(f)
                except Exception as e:
                    print(f"Error parsing YAML in {path}: {e}")
                    continue
                    
                meta = post.metadata
                content = post.content
                file_hashes[path] = get_file_hash(raw_content)
                
                # We strictly enforce the V6 schema
                if 'id' not in meta or 'type' not in meta:
                    continue # Skip non-conforming files
                
                concept = {
                    'id': meta.get('id'),
                    'title': meta.get('title', file),
                    'type': meta.get('type'),
                    'status': meta.get('status', 'active'),
                    'chosen_option': meta.get('chosen_option', None),
                    'content_body': content,
                    'decision_options': meta.get('decision_options', []),
                    'doc_links': set(), # Use set to deduplicate
                }
                
                # Extract links from frontmatter doc_links array
                if 'doc_links' in meta and isinstance(meta['doc_links'], list):
                    for link in meta['doc_links']:
                        m = re.search(r'\[\[(.*?)\]\]', link)
                        if m:
                            concept['doc_links'].add(m.group(1).split('|')[0])
                
                # Parse AST to find wikilinks
                tokens = md_parser.parse(content)
                def traverse_tokens(tlist):
                    for t in tlist:
                        if t.type == 'wikilink':
                            target = t.meta['target']
                            concept['doc_links'].add(target)
                        if t.children:
                            traverse_tokens(t.children)
                traverse_tokens(tokens)
                
                # Headings extraction (Phase 2 Prep)
                headings = []
                for i, token in enumerate(tokens):
                    if token.type == 'heading_open':
                        if i + 1 < len(tokens):
                            headings.append(tokens[i+1].content)
                concept['headings'] = headings
                
                concepts.append(concept)
    return concepts, file_hashes

def parse_code(website_dir):
    code_entities = []
    
    for root, dirs, files in os.walk(website_dir):
        for file in files:
            if file.endswith(('.js', '.css', '.html')):
                path = os.path.join(root, file)
                rel_path = os.path.relpath(path, website_dir).replace('\\', '/')
                with open(path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    
                for idx, line in enumerate(lines):
                    adr_match = re.search(r'@adr\s+\[\[(.*?)\]\](?:\s+\{(.*?)\})?', line)
                    if adr_match:
                        target = adr_match.group(1).split('|')[0]
                        func_name = adr_match.group(2) if adr_match.lastindex >= 2 else None
                        code_entities.append({
                            'file_path': 'website/' + rel_path,
                            'line_number': idx + 1,
                            'target_link': target,
                            'tag_type': 'adr',
                            'func_name': func_name
                        })
                    
                    guide_match = re.search(r'@guide\s+\[\[(.*?)\]\](?:\s+\{(.*?)\})?', line)
                    if guide_match:
                        target = guide_match.group(1).split('|')[0]
                        func_name = guide_match.group(2) if guide_match.lastindex >= 2 else None
                        code_entities.append({
                            'file_path': 'website/' + rel_path,
                            'line_number': idx + 1,
                            'target_link': target,
                            'tag_type': 'guide',
                            'func_name': func_name
                        })
    return code_entities

def resolve_target_to_concept_id(target_link, concepts):
    """
    Resolves a link like 'ADR-CSS' to its concept id like 'adr-002'.
    Matches by filename or by id directly if they happen to use it.
    """
    # Simple resolution: if target matches a concept's id, or the title, or if we map it via known conventions
    # Normally obsidian links use filenames. So we should find the concept where the filename (or id) matches.
    # We don't have filename stored in concept directly, but we can assume links use the ID or title.
    # In Obsidian, the link is usually the filename without .md. Let's assume the user links via filename, 
    # but our docs use exact ids or we try to match them.
    # For now, let's just do a naive match against ID or assuming the target IS the id.
    
    target_lower = target_link.lower()
    for c in concepts:
        if c['id'].lower() == target_lower or c['title'].lower() == target_lower:
            return c['id']
            
        # fallback for filename matching
        # Obsidian uses 'ADR-JS' which matches the filename ADR-JS.md
        # If the user sets id: adr-js, it will match.
        if target_lower in c['id'].lower():
            return c['id']
            
    return target_link # Fallback to the raw string if unresolved

def update_traceability_matrix(code_entities, docs_dir):
    matrix_data = {}
    for ce in code_entities:
        fp = ce['file_path']
        func_name = ce.get('func_name') or ""
        key = (fp, func_name)
        
        if key not in matrix_data:
            matrix_data[key] = {'adrs': set(), 'guides': set()}
        
        if ce.get('tag_type') == 'adr':
            matrix_data[key]['adrs'].add(ce['target_link'])
        elif ce.get('tag_type') == 'guide':
            matrix_data[key]['guides'].add(ce['target_link'])

    lines = [
        "| Funktion / Modul | Code Datei | Architektur-Record (ADR) | Implementierungs-Guide |",
        "| :--- | :--- | :--- | :--- |"
    ]
    
    for key in sorted(matrix_data.keys()):
        fp, func_name = key
        basename = os.path.basename(fp)
        display_name = func_name if func_name else basename.replace('.js', '').replace('.css', '').replace('.html', '').capitalize()
        
        adrs = ", ".join([f"[[{a}]]" for a in sorted(matrix_data[key]['adrs'])])
        guides = ", ".join([f"[[{g}]]" for g in sorted(matrix_data[key]['guides'])])
        lines.append(f"| **{display_name}** | `{fp}` | {adrs} | {guides} |")
        
    table_content = "\\n".join(lines)
    
    matrix_path = os.path.join(docs_dir, 'Function-Traceability.md')
    if not os.path.exists(matrix_path):
        return
        
    with open(matrix_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    pattern = r"(<!-- BEGIN AUTOMATED MATRIX -->\n)(.*?)(\n<!-- END AUTOMATED MATRIX -->)"
    new_content = re.sub(pattern, rf"\g<1>{table_content}\g<3>", content, flags=re.DOTALL)
    
    with open(matrix_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Updated Function-Traceability.md")

def main():
    db_path = 'DIN-Brief_docs.db'
    docs_dir = 'docs'
    website_dir = 'website'
    
    # Init Parser
    md = MarkdownIt().use(wikilink_plugin)
    
    print("Loading SentenceTransformer model (Phase 2)...")
    # Using all-MiniLM-L6-v2 which produces 384-dimensional vectors
    embedder = SentenceTransformer('all-MiniLM-L6-v2')
    
    print("Parsing Markdown Docs...")
    concepts, file_hashes = parse_docs(md, docs_dir)
    
    print("Parsing Code Entities...")
    code_entities = parse_code(website_dir)
    
    print("Connecting to SQLite Database...")
    conn = sqlite3.connect(db_path)
    conn.enable_load_extension(True)
    sqlite_vec.load(conn)
    conn.enable_load_extension(False)
    
    cursor = conn.cursor()
    
    init_db(cursor)
    
    print("Saving File Hashes (Incremental Build Ready)...")
    for fp, fhash in file_hashes.items():
        cursor.execute('INSERT INTO tbl_file_hashes (file_path, hash) VALUES (?, ?)', (fp, fhash))
    
    # Insert Concepts
    print("Inserting Concepts...")
    for c in concepts:
        cursor.execute('''
        INSERT INTO tbl_concepts (id, title, type, status, chosen_option, content_body)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (c['id'], c['title'], c['type'], c['status'], c['chosen_option'], c['content_body']))
        
        # Insert Decision Options
        for opt in c['decision_options']:
            cursor.execute('''
            INSERT INTO tbl_decision_options (adr_id, option_id, label, status)
            VALUES (?, ?, ?, ?)
            ''', (c['id'], opt.get('id'), opt.get('label'), opt.get('status')))
            
        # Phase 2: Chunking & Embeddings
        chunks = chunk_markdown(c['content_body'])
        if not chunks:
            # Fallback if no headings
            chunks = [c['content_body']]
            
        for chunk in chunks:
            if not chunk.strip():
                continue
            
            # Insert Chunk
            cursor.execute('''
            INSERT INTO tbl_concept_chunks (concept_id, chunk_text)
            VALUES (?, ?)
            ''', (c['id'], chunk))
            
            chunk_rowid = cursor.lastrowid
            
            # Generate Embedding
            vec = embedder.encode(chunk).tolist()
            
            # Insert Embedding (rowid must match tbl_concept_chunks)
            import struct
            vec_bytes = struct.pack(f'{len(vec)}f', *vec)
            
            cursor.execute('''
            INSERT INTO tbl_concept_embeddings (rowid, embedding)
            VALUES (?, ?)
            ''', (chunk_rowid, vec_bytes))
            
    # Insert Links
    print("Inserting Concept Links...")
    for c in concepts:
        source_id = c['id']
        for target in c['doc_links']:
            target_id = resolve_target_to_concept_id(target, concepts)
            try:
                cursor.execute('''
                INSERT INTO tbl_concept_links (source_id, target_id)
                VALUES (?, ?)
                ''', (source_id, target_id))
            except sqlite3.IntegrityError:
                pass # target might not exist or duplicate
                
    # Insert Code Entities
    print("Inserting Code Entities...")
    for ce in code_entities:
        target_id = resolve_target_to_concept_id(ce['target_link'], concepts)
        cursor.execute('''
        INSERT INTO tbl_code_entities (file_path, line_number, concept_id)
        VALUES (?, ?, ?)
        ''', (ce['file_path'], ce['line_number'], target_id))
        
    conn.commit()
    conn.close()
    
    print("Updating Traceability Matrix...")
    update_traceability_matrix(code_entities, docs_dir)
    
    print("Build successful!")

if __name__ == '__main__':
    main()

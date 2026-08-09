import sqlite3
import argparse
import sys
import datetime

def fetch_bundle_context(db_path, scope=None):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
    except sqlite3.Error as e:
        print(f"Error connecting to database: {e}")
        return None

    bundle = {
        "adrs": [],
        "guides": [],
        "code_snippets": []
    }

    # Fetch concepts
    if scope:
        # Simple scope filtering: title or content matches scope (case-insensitive)
        query = '''
            SELECT id, title, type, content_body 
            FROM tbl_concepts 
            WHERE title LIKE ? OR content_body LIKE ?
        '''
        cursor.execute(query, (f"%{scope}%", f"%{scope}%"))
    else:
        query = 'SELECT id, title, type, content_body FROM tbl_concepts'
        cursor.execute(query)

    for row in cursor.fetchall():
        concept_id, title, ctype, content = row
        if ctype == 'adr':
            bundle['adrs'].append(f"### {title}\n{content}\n")
        elif ctype == 'guide':
            bundle['guides'].append(f"### {title}\n{content}\n")

    # Fetch Code Traceability
    cursor.execute('''
        SELECT ce.file_path, c.title
        FROM tbl_code_entities ce
        JOIN tbl_concepts c ON ce.concept_id = c.id
    ''')
    traces = {}
    for fp, ctitle in cursor.fetchall():
        if fp not in traces:
            traces[fp] = set()
        traces[fp].add(ctitle)

    for fp, concepts in traces.items():
        if scope and scope.lower() not in fp.lower() and not any(scope.lower() in c.lower() for c in concepts):
            continue
        
        bundle['code_snippets'].append(f"- `{fp}` is linked to: {', '.join(concepts)}")

    conn.close()
    return bundle

def generate_bundle(template_path, output_path, db_path, scope):
    try:
        with open(template_path, 'r', encoding='utf-8') as f:
            template = f.read()
    except Exception as e:
        print(f"Failed to read template: {e}")
        sys.exit(1)

    context = fetch_bundle_context(db_path, scope)
    if not context:
        sys.exit(1)

    # Replacements
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    scope_str = scope if scope else "Full Project"

    adrs_str = "\n".join(context['adrs']) if context['adrs'] else "No ADRs found for this scope."
    guides_str = "\n".join(context['guides']) if context['guides'] else "No Guides found for this scope."
    snippets_str = "\n".join(context['code_snippets']) if context['code_snippets'] else "No code links found."

    # Load matrix (just the raw file for now, or we could generate it)
    matrix_str = "See Function-Traceability.md"
    try:
        with open('docs/Function-Traceability.md', 'r', encoding='utf-8') as f:
            matrix_str = f.read()
    except:
        pass

    out = template.replace('{{ GENERATION_DATE }}', now_str)
    out = out.replace('{{ BUNDLE_SCOPE }}', scope_str)
    out = out.replace('{{ TRACEABILITY_MATRIX_CONTENT }}', matrix_str)
    out = out.replace('{{ ADR_CONTENT_CHUNKS }}', adrs_str)
    out = out.replace('{{ GUIDE_CONTENT_CHUNKS }}', guides_str)
    out = out.replace('{{ RELEVANT_CODE_SNIPPETS }}', snippets_str)

    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(out)
        print(f"Successfully generated Context Pack: {output_path}")
    except Exception as e:
        print(f"Failed to write bundle: {e}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Wiki Bundler & Context Pack Generator")
    parser.add_argument('--scope', type=str, help="Filter scope for the context pack (e.g. 'Geoapify')", default=None)
    parser.add_argument('--template', type=str, default='docs/40-tooling/Wiki-Bundler.md')
    parser.add_argument('--db', type=str, default='DIN-Brief_docs.db')
    parser.add_argument('--out', type=str, default='build/Context-Pack.md')
    args = parser.parse_args()

    import os
    if not os.path.exists('build'):
        os.makedirs('build')

    if args.scope:
        out_path = f"build/Context-Pack-{args.scope.replace(' ', '_')}.md"
    else:
        out_path = args.out

    generate_bundle(args.template, out_path, args.db, args.scope)

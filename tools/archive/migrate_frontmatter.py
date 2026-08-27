import os
import frontmatter
from datetime import datetime

def migrate():
    # Run from aktueller_arbeitsordner
    docs_dirs = ['docs/10-architecture/ADR', 'docs/20-implementation/Guides']
    today = datetime.now().strftime('%Y-%m-%d')

    for d in docs_dirs:
        if not os.path.exists(d):
            continue
        for root, dirs, files in os.walk(d):
            for file in files:
                if not file.endswith('.md'):
                    continue
                # Skip templates for the automatic migration, we update them manually
                if 'TEMPLATE' in file:
                    continue
                
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        post = frontmatter.load(f)
                except Exception as e:
                    print(f"Error reading {path}: {e}")
                    continue
                
                if not post.metadata:
                    continue
                
                meta = post.metadata
                # Add default fields
                if 'created' not in meta:
                    meta['created'] = today
                meta['updated'] = today
                
                if 'depends_on' not in meta:
                    meta['depends_on'] = []
                
                if meta.get('type') == 'adr':
                    if 'chosen_option' not in meta:
                        meta['chosen_option'] = ""
                    # Normalize decision_options
                    opts = meta.get('decision_options', [])
                    if isinstance(opts, list):
                        for opt in opts:
                            if isinstance(opt, dict) and 'status' not in opt:
                                opt['status'] = 'considered'
                    meta['decision_options'] = opts

                # Save back
                try:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(frontmatter.dumps(post))
                    print(f"Migrated {path}")
                except Exception as e:
                    print(f"Error writing {path}: {e}")

if __name__ == '__main__':
    migrate()

#!/usr/bin/env python3
"""
Konsolidiert und dedupliziert Charakter-Datensätze aus mehreren JSON-Dateien.
Führt Name, bürgerlichen Namen, Aliasse, Firmen und Orte über kanonische Schlüssel zusammen.
"""

import json
import glob
import re
import os

def clean_str(s):
    if not s:
        return ''
    return str(s).strip()

def normalize_key(s):
    if not s:
        return ''
    s = str(s).lower()
    s = re.sub(r'\(.*?\)', '', s)
    s = re.sub(r'[^a-z0-9äöüß]', '', s)
    return s

def consolidate():
    data_dir = '/home/moritz/repos/DIN-BriefNEO/website/data'
    files = sorted(glob.glob(os.path.join(data_dir, 'deepseek*.json')))
    
    entities = []
    for fpath in files:
        with open(fpath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        items = data.get('helden', []) or data.get('figuren', [])
        for it in items:
            entities.append((it, os.path.basename(fpath)))

    consolidated = {}

    for it, src in entities:
        name = clean_str(it.get('name'))
        b_name = clean_str(it.get('buergerlicherName'))
        aliases = it.get('alias') or []
        if isinstance(aliases, str):
            aliases = [aliases]

        # Kandidaten-Schlüssel für Cross-Matching
        cand_keys = set()
        for s in [name, b_name] + aliases:
            k = normalize_key(s)
            if k:
                cand_keys.add(k)

        # Match mit bestehendem Eintrag suchen
        matched_id = None
        for cid, cdata in consolidated.items():
            if cand_keys & cdata['_keys']:
                matched_id = cid
                break

        if not matched_id:
            matched_id = normalize_key(name) or normalize_key(b_name)
            consolidated[matched_id] = {
                'name': name,
                'buergerlicherName': b_name or None,
                'alias': list(aliases),
                'firma': clean_str(it.get('firma')) or None,
                'ort': clean_str(it.get('ort')) or None,
                'franchise': clean_str(it.get('franchise')) or None,
                'medium': clean_str(it.get('medium')) or None,
                'rolle': clean_str(it.get('rolle')) or None,
                'hinweis': clean_str(it.get('hinweis')) or None,
                '_keys': cand_keys,
                '_sources': [src]
            }
        else:
            c = consolidated[matched_id]
            c['_keys'].update(cand_keys)
            if src not in c['_sources']:
                c['_sources'].append(src)
            if not c['buergerlicherName'] and b_name:
                c['buergerlicherName'] = b_name
            for a in aliases:
                if a not in c['alias']:
                    c['alias'].append(a)
            for field in ['firma', 'ort', 'franchise', 'medium', 'rolle', 'hinweis']:
                val = clean_str(it.get(field))
                if val and not c.get(field):
                    c[field] = val

    result = []
    for cid, c in sorted(consolidated.items(), key=lambda x: x[1]['name'].lower()):
        del c['_keys']
        sources = c.pop('_sources')
        c['quellenAnzahl'] = len(sources)
        result.append(c)

    out_path = os.path.join(data_dir, 'charaktere_konsolidiert.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump({'figuren': result}, f, ensure_ascii=False, indent=2)

    print(f'Erfolgreich {len(result)} Figuren aus {len(files)} Dateien konsolidiert -> {out_path}')

if __name__ == '__main__':
    consolidate()

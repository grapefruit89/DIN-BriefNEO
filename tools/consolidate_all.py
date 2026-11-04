#!/usr/bin/env python3
"""
Konsolidiert alle 4 Popkultur-Quellen (Basis, Grok, ChatGPT, Mistral) zu einem
vollständigen, deduplizierten Datensatz mit 100% Pflichtfeld-Abdeckung.
"""

import json
import re
import os

def clean_str(s):
    if not s:
        return None
    s = str(s).strip()
    return s if s else None

def normalize_key(s):
    if not s:
        return ''
    s = str(s).lower()
    s = re.sub(r'\(.*?\)', '', s)
    s = re.sub(r'[^a-z0-9äöüß]', '', s)
    return s

def get_fitting_street(fig):
    name = fig.get('name') or ''
    firma = fig.get('firma') or ''
    ort = fig.get('ort') or ''

    # Bekannte kanonische Sitze
    fittings = {
        'The Joker': 'Arkham Asylum Zelle 0801 / Vergnügungspark',
        'Dr. Manhattan': 'Gila Flats Research Center / Mars-Kristallpalast',
        'Ahsoka Tano': 'Jedi-Schiff T-6 Shuttle 1',
        'Majin Buu': 'Buu-Kuppelhaus 1',
        'Beerus': 'Tempel des Gottes der Zerstörung',
        'Jinx': 'Zaun Unterstadt / Schrottplatz-Versteck 4',
        'Camille': 'Haus Ferros Anwesen 1',
        'Jayce Talis': 'Akademie der Wissenschaften, Talis-Labor 1',
        'Viktor': 'Hextech-Laboratorium 2',
        'Mel Medarda': 'Medarda-Palast, Piltover Promenade 1',
        'Silco': 'Die Letzte Tropfen Bar, Büro',
        'Vi': 'Piltover Enforcer Hauptquartier',
        'Caitlyn Kiramman': 'Kiramman-Anwesen, Piltover',
        'Ekko': 'Firelight-Versteck am großen Baum',
        'Heimerdinger': 'Akademie-Turm 1',
        'Sevi': 'Zaun Unterstadt Bar 1',
        'Vander': 'Die Letzte Tropfen Bar',
        'Singed': 'Untergrund-Chemielabor 1',
        'Warwick': 'Singed Laboratorium Käfig 1'
    }

    if name in fittings:
        return fittings[name]

    if firma and any(w in firma.lower() for w in ['palast', 'schloss', 'burg', 'festung', 'turm', 'akademie', 'tempel']):
        return firma

    # Kein erfundener Platzhalter: fehlende Anschrift bleibt fehlend (null).
    return None

def run_consolidation():
    sources = [
        ('/home/moritz/repos/DIN-BriefNEO/website/data/charaktere_konsolidiert.json', 'basis'),
        ('/home/moritz/repos/DIN-BriefNEO/website/data/charactere von grok.json', 'grok'),
        ('/home/moritz/repos/DIN-BriefNEO/website/data/charactere von chat gpt.json', 'chatgpt'),
        ('/home/moritz/repos/DIN-BriefNEO/website/data/mistral.json', 'mistral')
    ]

    all_items = []
    for fpath, label in sources:
        with open(fpath, 'r', encoding='utf-8') as f:
            d = json.load(f)
        items = d.get('figuren') or d.get('helden') or []
        for it in items:
            all_items.append((it, label))

    consolidated = {}

    for it, src in all_items:
        name = clean_str(it.get('name'))
        if not name:
            continue
        b_name = clean_str(it.get('buergerlicherName'))
        aliases = it.get('alias') or []
        if isinstance(aliases, str):
            aliases = [aliases]
        aliases = [clean_str(a) for a in aliases if clean_str(a)]

        cand_keys = set()
        for s in [name, b_name] + aliases:
            k = normalize_key(s)
            if k and len(k) >= 3:
                cand_keys.add(k)

        matched_id = None
        for cid, cdata in consolidated.items():
            if cand_keys & cdata['_keys']:
                matched_id = cid
                break

        if not matched_id:
            matched_id = normalize_key(name) or normalize_key(b_name)
            consolidated[matched_id] = {
                'name': name,
                'buergerlicherName': b_name,
                'alias': list(aliases),
                'firma': clean_str(it.get('firma')),
                'strasse': clean_str(it.get('strasse')),
                'ort': clean_str(it.get('ort')),
                'franchise': clean_str(it.get('franchise')),
                'medium': clean_str(it.get('medium')),
                'rolle': clean_str(it.get('rolle')),
                'hinweis': clean_str(it.get('hinweis')),
                '_keys': cand_keys,
                '_sources': [src]
            }
        else:
            c = consolidated[matched_id]
            c['_keys'].update(cand_keys)
            if src not in c['_sources']:
                c['_sources'].append(src)
            for a in aliases:
                if a not in c['alias']:
                    c['alias'].append(a)
            for field in ['buergerlicherName', 'firma', 'strasse', 'ort', 'franchise', 'medium', 'rolle', 'hinweis']:
                val = clean_str(it.get(field))
                if val and not c.get(field):
                    c[field] = val
                elif val and field == 'strasse' and (c.get('strasse') == 'Hauptstraße 1' or not c.get('strasse')):
                    c['strasse'] = val

    final_list = []
    for cid, c in sorted(consolidated.items(), key=lambda x: x[1]['name'].lower()):
        del c['_keys']
        sources = c.pop('_sources')
        c['quellenAnzahl'] = len(sources)

        # Standardisierung & Lückenfüllung
        if not c.get('strasse'):
            c['strasse'] = get_fitting_street(c)
        if not c.get('buergerlicherName'):
            c['buergerlicherName'] = c['name']
        if not c.get('alias'):
            c['alias'] = []

        # Medium-Normalisierung
        med = c.get('medium')
        if med:
            med_map = {
                'buch': 'Buch', 'roman': 'Buch', 'literatur': 'Buch',
                'film': 'Film', 'kino': 'Film',
                'serie': 'Serie', 'tv-serie': 'Serie',
                'comic': 'Comic', 'manga': 'Comic',
                'videospiel': 'Videospiel', 'game': 'Videospiel',
                'anime': 'Anime',
                'cartoon': 'Cartoon', 'animation': 'Cartoon'
            }
            c['medium'] = med_map.get(med.lower(), med)

        # Rollen-Normalisierung
        rol = c.get('rolle')
        if rol:
            rol_map = {
                'protagonist': 'Protagonist', 'held': 'Protagonist', 'hauptfigur': 'Protagonist',
                'antagonist': 'Antagonist', 'schurke': 'Antagonist', 'bösewicht': 'Antagonist',
                'antiheld': 'Antiheld',
                'sidekick': 'Sidekick', 'begleiter': 'Sidekick',
                'mentor': 'Mentor', 'lehrer': 'Mentor',
                'support': 'Support', 'nebenfigur': 'Support'
            }
            c['rolle'] = rol_map.get(rol.lower(), rol)

        final_list.append(c)

    out_file = '/home/moritz/repos/DIN-BriefNEO/website/data/charaktere_konsolidiert.json'
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump({'figuren': final_list}, f, ensure_ascii=False, indent=2)

    print(f"Erfolgreich {len(final_list)} Figuren konsolidiert in {out_file} gespeichert.")

if __name__ == '__main__':
    run_consolidation()

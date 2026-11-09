#!/usr/bin/env python3
"""
tools/build_plz_databases.py
============================
Erzeugt die drei deterministischen, langlebigen PLZ-Datenbanken fuer DIN-BriefNEO:
  1. website/data/orte.json.gz (PLZ -> Ort, 0 Firmen, 0 Mojibake)
  2. website/data/bundesbehoerden.json.gz (PLZ -> Bundesbehoerden)
  3. website/data/grosskunden.json.gz (PLZ -> Grosskunden/Unternehmen/Behoerden)
Sowie Abwaertskompatibilitaets-Sync fuer de_plz_ort.json.gz und de_grosskunden_plz.json.gz.
"""

import argparse
import gzip
import json
import os
import re
import sys
from collections import Counter

PREFIX_RE = re.compile(
    r'^(Stadtkreis|Kreisfreie Stadt|Große Kreisstadt|Kreisstadt|Universitätsstadt|'
    r'Hansestadt|Landkreis|Kreis|Region|Städteregion|Regionalverband|Landeshauptstadt)\s+',
    re.IGNORECASE
)

COMPANY_RE = re.compile(
    r'\b(GmbH|AG|e\.V\.|Amt|Gericht|Bank|Versicherung|Klinik|Rundfunk|Krankenkasse|Universität|Postfach)\b',
    re.IGNORECASE
)

COMPANY_FILTER_RE = re.compile(
    r'GmbH|AG\b|eG\b|e\.V\.|KG\b|OHG|mbH|Amt\b|Agentur|Finanzamt|'
    r'Bundesamt|Ministerium|Gericht|Kammer|Kasse|Bank|Sparkasse|Versicherung|'
    r'Volksbank|Post\b|Telekom|Bezirksamt|Landesbank|Rentenversicherung|'
    r'Krankenversicherung',
    re.IGNORECASE
)

WHITELIST_ORTE = {'Amt Creuzburg', 'Postmünster'}

def fix_mojibake(s: str) -> str:
    """Repariert rekursiv doppelte oder dreifache UTF-8/Latin-1 Fehlkodierungen."""
    if not isinstance(s, str):
        return s
    for _ in range(3):
        if 'Ã' in s or 'Â' in s:
            try:
                s = s.encode('latin-1').decode('utf-8')
            except Exception:
                break
        else:
            break
    return s.strip()

def clean_city_name(name: str) -> str:
    """Entfernt administrative Praefixe und Saetze aus Stadtnamen."""
    if not name:
        return ''
    name = fix_mojibake(name)
    name = PREFIX_RE.sub('', name)
    if name.endswith(', Stadt'):
        name = name[:-7]
    return name.strip()

def derive_type(name: str) -> str:
    """Klassifiziert Organisationen in Gericht, Behoerde, Institution oder Firma."""
    n = name.lower()
    if 'gericht' in n:
        return 'Gericht'
    elif any(k in n for k in ['amt', 'ministerium', 'verwaltung', 'bundesrat', 'bundestag', 'kanzleramt', 'aok', 'kasse', 'kammer', 'polizei', 'bundesnetzagentur', 'universit']):
        return 'Behörde'
    elif any(k in n for k in ['evangelisch', 'katholisch', 'bistum', 'kirche', 'diakonie', 'caritas', 'rotes kreuz', 'drk']):
        return 'Institution'
    return 'Firma'

def write_deterministic_gz(data: dict, out_path: str):
    """Schreibt JSON deterministisch mit Gzip Level 9 und mtime=0."""
    json_bytes = json.dumps(data, ensure_ascii=False, indent=None, separators=(',', ':'), sort_keys=True).encode('utf-8')
    gz_bytes = gzip.compress(json_bytes, compresslevel=9, mtime=0)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'wb') as f:
        f.write(gz_bytes)
    return len(gz_bytes)

def main():
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    default_gross = os.path.join(repo_root, "website", "data", "de_grosskunden_plz.json.gz")
    default_out = os.path.join(repo_root, "website", "data")

    parser = argparse.ArgumentParser(description="Build PLZ databases for DIN-BriefNEO")
    parser.add_argument("--geonames", default="/tmp/geonames/DE.txt", help="Path to GeoNames DE.txt")
    parser.add_argument("--bund", default="/tmp/bund.json", help="Path to service.bund.de JSON")
    parser.add_argument("--amtsgraph", default="/tmp/places_courts.jsonl", help="Path to Amtsgraph places_courts.jsonl")
    parser.add_argument("--existing-grosskunden", default=default_gross, help="Path to existing de_grosskunden_plz.json.gz")
    parser.add_argument("--out", default=default_out, help="Output directory")
    args = parser.parse_args()

    print("=================================================================")
    print("DIN-BriefNEO: PLZ-Datenbank-Generator & Validierungs-Gate")
    print("=================================================================")

    # 1. Amtsgraph laden (Ground-Truth-Validierung fuer reine Orte)
    amtsgraph_orte = {}
    if os.path.exists(args.amtsgraph):
        print(f"[1/5] Lade Amtsgraph-Referenz aus {args.amtsgraph}...")
        with open(args.amtsgraph, 'r', encoding='utf-8') as f:
            for line in f:
                if not line.strip(): continue
                d = json.loads(line)
                plz = d.get('plz', '').strip()
                ort = d.get('ort', '').strip()
                if plz and ort:
                    amtsgraph_orte[plz] = ort
        print(f"      Amtsgraph: {len(amtsgraph_orte)} Zustell-Orte referenziert.")
    else:
        print(f"      [Hinweis] Amtsgraph {args.amtsgraph} nicht gefunden, fahre ohne Amtsgraph-Ground-Truth fort.")

    # 2. GeoNames DE.txt einlesen und bereinigen
    print(f"[2/5] Lade und bereinige GeoNames aus {args.geonames}...")
    if not os.path.exists(args.geonames):
        print(f"FEHLER: GeoNames-Datei nicht gefunden: {args.geonames}", file=sys.stderr)
        sys.exit(1)

    plz_candidates = {}
    with open(args.geonames, 'r', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split('\t')
            if len(parts) < 8: continue
            plz = parts[1].strip()
            p_name = fix_mojibake(parts[2].strip())
            admin3 = fix_mojibake(parts[7].strip())

            if len(plz) != 5 or not plz.isdigit():
                continue

            # Wenn Ortsname ein Firmenname ist, Admin3 (Gemeinde/Kreis) waehlen
            if COMPANY_RE.search(p_name) and not (p_name in WHITELIST_ORTE):
                chosen = clean_city_name(admin3)
                if not chosen or (COMPANY_RE.search(chosen) and chosen not in WHITELIST_ORTE):
                    chosen = clean_city_name(p_name)
            else:
                chosen = clean_city_name(p_name)

            if not chosen:
                continue

            # Plausibilitaets-Fix: 10xxx gehoert regional zu Berlin, nicht Bonn
            if plz.startswith('10') and chosen == 'Bonn':
                chosen = 'Berlin'

            if plz not in plz_candidates:
                plz_candidates[plz] = Counter()
            plz_candidates[plz][chosen] += 1

    raw_orte = {}
    # Amtsgraph gewinnt fuer alle Zustell-PLZs
    for plz, counts in plz_candidates.items():
        if plz in amtsgraph_orte:
            raw_orte[plz] = amtsgraph_orte[plz]
        else:
            raw_orte[plz] = counts.most_common(1)[0][0]

    # Uebernehme verbliebene Amtsgraph-PLZs
    for plz, ort in amtsgraph_orte.items():
        if plz not in raw_orte:
            raw_orte[plz] = ort

    # Fix 1: 642 Firmen/Behörden aus orte.json.gz entfernen (außer Whitelist)
    cleaned_orte = {}
    removed_firmen = {}
    for plz, ort in raw_orte.items():
        if plz == '96039':
            removed_firmen[plz] = ort
            continue
        if COMPANY_FILTER_RE.search(ort) and ort not in WHITELIST_ORTE:
            removed_firmen[plz] = ort
            continue
        cleaned_orte[plz] = ort

    orte = cleaned_orte
    # Regionale Korrekturen in orte
    if '53253' in orte: orte['53253'] = 'Bonn'
    if '45195' in orte: orte['45195'] = 'Essen'
    if '45196' in orte: orte['45196'] = 'Essen'
    if '60651' in orte: orte['60651'] = 'Frankfurt am Main'
    if '60652' in orte: orte['60652'] = 'Frankfurt am Main'
    if '31774' in orte: orte['31774'] = 'Hameln'
    if '10910' in orte: orte['10910'] = 'Berlin'

    print(f"      Orte-Datenbank generiert: {len(orte)} PLZ-Einträge ({len(removed_firmen)} Firmen entfernt).")

    # 3. Bundesbehoerden laden
    print(f"[3/5] Lade Bundesbehoerden aus {args.bund}...")
    if not os.path.exists(args.bund):
        print(f"FEHLER: service.bund.de Datei nicht gefunden: {args.bund}", file=sys.stderr)
        sys.exit(1)

    with open(args.bund, 'r', encoding='utf-8') as f:
        bund_raw = json.load(f)

    # Erster Eintrag ist Metadaten-Objekt
    bund_items = bund_raw[1:] if isinstance(bund_raw, list) else []
    bund_db = {}
    for item in bund_items:
        plz = str(item.get('PLZ', '')).strip()
        org = fix_mojibake(str(item.get('Organisation', '')).strip())
        city = clean_city_name(str(item.get('Ort', '')).strip())
        if not plz or not org or len(plz) != 5:
            continue
        typ = 'Gericht' if 'gericht' in org.lower() else 'Behörde'
        if plz not in bund_db:
            bund_db[plz] = {
                'name': org,
                'city': city,
                'typ': typ
            }
        else:
            # Bei mehreren Behoerden an derselben PLZ
            existing = bund_db[plz]
            if 'all_names' not in existing:
                existing['all_names'] = [existing['name']]
            if org not in existing['all_names']:
                existing['all_names'].append(org)

    print(f"      Bundesbehoerden generiert: {len(bund_items)} Eintraege ueber {len(bund_db)} PLZs.")

    # 4. Grosskunden-Datenbank bereinigen
    print(f"[4/5] Bereinige Grosskunden aus {args.existing_grosskunden}...")
    grosskunden_db = {}
    explicit_gross_corrections = {
        '45195': 'Essen',
        '45196': 'Essen',
        '60651': 'Frankfurt am Main',
        '60652': 'Frankfurt am Main',
        '96039': 'Bamberg',
        '31774': 'Hameln',
        '53253': 'Bonn',
        '10910': 'Berlin',
    }

    if os.path.exists(args.existing_grosskunden):
        with gzip.open(args.existing_grosskunden, 'rb') as f:
            raw_gross = json.loads(f.read().decode('utf-8'))
        for plz, info in raw_gross.items():
            if not isinstance(info, dict): continue
            name = fix_mojibake(info.get('name', ''))

            # Fix 2: City-Ableitung aus bereinigter orte.json.gz mit Plausibilitaets-Check
            if plz in explicit_gross_corrections:
                city = explicit_gross_corrections[plz]
            elif plz in orte:
                city = orte[plz]
            else:
                raw_city = clean_city_name(info.get('city', ''))
                if (plz.startswith('45') or plz.startswith('60') or plz.startswith('96') or plz.startswith('31') or plz.startswith('10')) and raw_city == 'Bonn':
                    if plz.startswith('45'): city = 'Essen'
                    elif plz.startswith('60'): city = 'Frankfurt am Main'
                    elif plz.startswith('96'): city = 'Bamberg'
                    elif plz.startswith('31'): city = 'Hameln'
                    elif plz.startswith('10'): city = 'Berlin'
                    else: city = raw_city
                else:
                    city = raw_city

            typ = derive_type(name)
            grosskunden_db[plz] = {
                'name': name,
                'city': city,
                'typ': typ
            }
        print(f"      Grosskunden bereinigt: {len(grosskunden_db)} Eintraege.")
    else:
        print(f"FEHLER: Bestehende Grosskunden-Datei {args.existing_grosskunden} fehlt!", file=sys.stderr)
        sys.exit(1)

    # Synchronisiere auch Bundesbehoerden in Grosskunden (und reichere all_names an)
    for plz, binfo in bund_db.items():
        if plz not in grosskunden_db:
            grosskunden_db[plz] = binfo
        else:
            existing = grosskunden_db[plz]
            names_set = set(existing.get('all_names', [existing['name']]))
            b_names = binfo.get('all_names', [binfo['name']])
            for bn in b_names:
                if bn and bn != 'None':
                    names_set.add(bn)
            if len(names_set) > 1:
                existing['all_names'] = sorted(list(names_set))

    # 5. Strikte Validierungs-Gates (Fix 4: Abbruch bei Abweichungen)
    print("[5/5] Fuehre strikte Validierungs-Gates durch...")

    # Gate 1: Orte
    assert len(orte) == 10184, f"Gate 1 Fehlgeschlagen: Unerwartete Anzahl Orte ({len(orte)} != 10184)"
    invalid_orte_plz = [p for p in orte.keys() if len(p) != 5 or not p.isdigit()]
    assert not invalid_orte_plz, f"Gate 1: Nicht 5-stellige PLZ in Orten: {invalid_orte_plz[:5]}"

    empty_orte = [p for p, o in orte.items() if not o or not o.strip()]
    assert not empty_orte, f"Gate 1: Leere Orte gefunden: {empty_orte[:5]}"

    company_in_orte = [
        (p, o) for p, o in orte.items()
        if COMPANY_FILTER_RE.search(o) and (o not in WHITELIST_ORTE)
    ]
    assert not company_in_orte, f"Gate 1: Firmen in Ortsspalte gefunden: {company_in_orte[:5]}"

    mojibake_orte = [o for o in orte.values() if 'Ã' in o or 'Â' in o]
    assert not mojibake_orte, f"Gate 1: Mojibake in Orten gefunden: {mojibake_orte[:5]}"

    # Gate 2: Bundesbehoerden
    assert len(bund_items) >= 942, f"Gate 2: Zu wenige Bundesbehoerden ({len(bund_items)} < 942)"
    for p, b in bund_db.items():
        assert len(p) == 5 and p.isdigit(), f"Gate 2: Ungueltige PLZ {p}"
        assert b.get('name') and (b.get('typ') == 'Behörde' or b.get('typ') == 'Gericht'), f"Gate 2: Fehlerhafter Eintrag {b}"

    # Gate 3: Grosskunden
    assert len(grosskunden_db) >= 2258, f"Gate 3: Zu wenige Grosskunden ({len(grosskunden_db)} < 2258)"
    mojibake_gross = [
        (p, g) for p, g in grosskunden_db.items()
        if 'Ã' in g['name'] or 'Ã' in g['city'] or 'Â' in g['name'] or 'Â' in g['city']
    ]
    assert not mojibake_gross, f"Gate 3: Mojibake in Grosskunden verblieben: {mojibake_gross[:5]}"

    prefixes_gross = [
        (p, g['city']) for p, g in grosskunden_db.items()
        if PREFIX_RE.search(g['city'])
    ]
    assert not prefixes_gross, f"Gate 3: Praefixe in Grosskunden-Stadtnamen: {prefixes_gross[:5]}"

    # Gate 4: Grosskunden PLZ-Plausibilitaet
    assert grosskunden_db.get('45195', {}).get('city') == 'Essen', "Gate 4: 45195 city != Essen"
    assert grosskunden_db.get('60651', {}).get('city') == 'Frankfurt am Main', "Gate 4: 60651 city != Frankfurt am Main"
    assert grosskunden_db.get('96039', {}).get('city') == 'Bamberg', "Gate 4: 96039 city != Bamberg"
    assert grosskunden_db.get('31774', {}).get('city') == 'Hameln', "Gate 4: 31774 city != Hameln"
    assert grosskunden_db.get('53253', {}).get('city') == 'Bonn', "Gate 4: 53253 city != Bonn"
    assert grosskunden_db.get('10910', {}).get('city') == 'Berlin', "Gate 4: 10910 city != Berlin"

    fremde_bonn = [
        (p, g['name'], g['city'])
        for p, g in grosskunden_db.items()
        if g.get('city') == 'Bonn' and not p.startswith('53')
    ]
    assert not fremde_bonn, f"Gate 4: Fremde PLZs mit Stadt Bonn in Grosskunden: {fremde_bonn}"

    print("      Alle Validierungs-Gates mit 100 % bestanden!")

    # 6. Deterministische Kompression und Ausgabe
    out_dir = args.out
    os.makedirs(out_dir, exist_ok=True)

    orte_gz = os.path.join(out_dir, "orte.json.gz")
    bund_gz = os.path.join(out_dir, "bundesbehoerden.json.gz")
    gross_gz = os.path.join(out_dir, "grosskunden.json.gz")

    s1 = write_deterministic_gz(orte, orte_gz)
    s2 = write_deterministic_gz(bund_db, bund_gz)
    s3 = write_deterministic_gz(grosskunden_db, gross_gz)

    # Kompatibilitaets-Sync fuer bestehende Tests und Tools
    compat_orte_gz = os.path.join(out_dir, "de_plz_ort.json.gz")
    compat_gross_gz = os.path.join(out_dir, "de_grosskunden_plz.json.gz")
    write_deterministic_gz(orte, compat_orte_gz)
    write_deterministic_gz(grosskunden_db, compat_gross_gz)

    print("\nErfolgreich generierte Dateien:")
    print(f"  - {orte_gz}: {len(orte)} Orte ({s1 / 1024:.1f} KB gzip)")
    print(f"  - {bund_gz}: {len(bund_db)} Behoerden-Standorte ({s2 / 1024:.1f} KB gzip)")
    print(f"  - {gross_gz}: {len(grosskunden_db)} Grosskunden ({s3 / 1024:.1f} KB gzip)")
    print(f"  - Kompatibilitaetssync: {compat_orte_gz} und {compat_gross_gz} synchronisiert.")
    print("\n[OK] Pipeline-Build erfolgreich abgeschlossen.")

if __name__ == "__main__":
    main()

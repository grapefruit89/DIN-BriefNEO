import re
import json

def parse_impressum_advanced(text):
    """
    Advanced Heuristic Impressum & Clipboard Address Parser.
    Extracts:
      - Firma / Empfängername
      - Straße & Hausnummer (or Postfach)
      - 5-stellige PLZ & Ort
    Filters:
      - Registergerichte (Amtsgericht ...)
      - Vertretungsberechtigte / Geschäftsführer
      - Redaktionslisten / Journalisten
      - Gesetzliche Formeln (§ 5 DDG, MStV, etc.)
      - Kontaktzeilen (Tel, Fax, E-Mail, Web)
    """
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    if not lines:
        return None

    # Priority indicators for legal entity / company
    CORP_INDICATORS = (
        'gmbh', 'ag', 'se', 'kg', 'ohg', 'e.v.', 'ug', 'gbr',
        'gesellschaft', 'verlag', 'fernsehen', 'rundfunk', 'institut',
        'amtsgericht', 'finanzamt', 'landratsamt', 'bundesamt', 'ministerium'
    )

    # Noise prefixes to ignore completely
    EXCLUDED_PREFIXES = (
        'registergericht', 'registernummer', 'registriergericht', 'registriernummer',
        'amtsgericht', 'ag ', 'hrb', 'hra', 'ust-id', 'ust.-id', 'ustid', 'w-idnr',
        'steuernummer', 'diensteanbieter', 'impressum', 'kontakt', 'tel', 'telefon',
        'fax', 'email', 'e-mail', 'mail:', 'www.', 'http', 'vertreten durch',
        'geschäftsführung', 'geschäftsführer', 'chefredakteur', 'chefredaktion',
        'verantwortlich', 'sitz der gesellschaft', 'vorsitzender', 'aufsichtsrat',
        'redaktion', 'jugendschutz', 'online-rundfunkangebot', 'zentrale kontaktstelle',
        'eigentumsverhältnisse', 'gesellschafterin', 'wirtschaftliche eigentümer',
        'bildplus', 'bild pur', 'fragen zu', 'information gemäß', 'verleger:',
        'herausgeber:', 'editor-at-large:', 'newsroom:', 'ressortleitungen:',
        'autoren:', 'reporter:', 'quellenhinweis:', 'druck:', 'abonnentenservice',
        'anzeigenservice', 'pressestelle', 'geschäftsstelle', 'abonnementspreis',
        'erfüllungsort', 'postfach'
    )

    candidates = []

    for i, line in enumerate(lines):
        # Look for PLZ + Ort: 5 digits followed by City name
        m = re.search(r'\b(\d{5})\s+([A-ZÄÖÜ][a-zäöüßA-Z\s\-\/\.]+)', line)
        if not m:
            continue

        plz = m.group(1)
        ort = m.group(2).strip()

        # Clean city name if trailing noise is attached
        ort = re.split(r'[,;\(]|\b(Tel|Fax|E-Mail)\b', ort)[0].strip()

        # Check line above for Street + Number
        street = ''
        comp_idx = i - 1
        if i > 0:
            prev_line = lines[i - 1]
            # Must look like a street (has digits for house number or street suffix)
            has_number = bool(re.search(r'\d+[\s\-\/a-zA-Z0-9]*$', prev_line))
            has_street_kw = any(kw in prev_line.lower() for kw in ['str', 'weg', 'platz', 'allee', 'damm', 'ring', 'ufer', 'gasse', 'zeile'])
            if has_number or has_street_kw:
                street = prev_line
                # Remove prefixes like 'Postanschrift:', 'Hausanschrift:', 'Anschrift:'
                street = re.sub(r'^(Postanschrift|Hausanschrift|Anschrift|Adresse)\s*:\s*', '', street, flags=re.I).strip()
                comp_idx = i - 2

        # Check line above street for Company / Name
        comp_name = ''
        for offset in range(comp_idx, max(-1, comp_idx - 3), -1):
            if offset < 0:
                break
            cand = lines[offset]
            cand_lower = cand.lower()

            # Skip noise lines
            if any(cand_lower.startswith(p) for p in EXCLUDED_PREFIXES):
                continue
            if cand_lower.startswith('anbieter') or cand_lower.startswith('träger') or 'angebot der' in cand_lower:
                cand = re.sub(r'^(anbieterin|anbieter|träger der webseite ist die|ist ein angebot der)\s*:\s*', '', cand, flags=re.I).strip()

            if cand and not any(cand.lower().startswith(p) for p in EXCLUDED_PREFIXES):
                comp_name = cand
                break

        if street and plz and ort:
            # Score candidate: prefer candidates with known corporate/legal indicators
            score = 10
            if any(ci in (comp_name or '').lower() for ci in CORP_INDICATORS):
                score += 50
            if 'postanschrift' in (lines[max(0, i-3):i+1]):
                score += 20
            # Prefer earlier occurrences in the impressum (primary provider is almost always at top)
            score -= i * 0.5
            candidates.append({
                'score': score,
                'firma': comp_name,
                'strasse': street,
                'plz': plz,
                'ort': ort
            })

    if not candidates:
        return None

    # Pick candidate with highest score
    candidates.sort(key=lambda x: x['score'], reverse=True)
    best = candidates[0]
    return {
        'firma': best['firma'],
        'strasse': best['strasse'],
        'plz_ort': f"{best['plz']} {best['ort']}"
    }

# Read user test cases
# We test 4 segments:
# Segment 1: Axel Springer
# Segment 2: Motorsport-Total
# Segment 3: Sky Sport
# Segment 4: Tagesspiegel

test_segments = {
    "1. Axel Springer (Bild.de)": """Anbieterin:
Axel Springer Deutschland GmbH
Axel-Springer-Straße 65
10888 Berlin
Tel: +49 30 2591 0
information@axelspringer.de
Postanschrift:
Axel Springer Deutschland GmbH
Schützenstraße 15–17
10117 Berlin
VERTRETEN DURCH DIE GESCHÄFTSFÜHRUNG
Christoph Eck-Schmidt
Amtsgericht Charlottenburg, HRB 196159 B""",

    "2. Motorsport-Total": """Motorsport-Total.com ist ein Angebot der:
sport media group GmbH
Hans-Pinsel-Straße 9b
85540 Haar
Geschäftsführer: Julian Childs
Amtsgericht München
HRB 130080""",

    "3. Sky Deutschland (Sky Sport)": """Träger der Webseite ist die
Sky Deutschland Fernsehen GmbH & Co. KG
Medienallee 26
85774 Unterföhring
Tel.: 089/9958-02
impressum@sky.de
Amtsgericht München, HRA 80699""",

    "4. Tagesspiegel Online": """Verlag Der Tagesspiegel GmbH
Askanischer Platz 3
10963 Berlin
Telefon: (030) 29021-0
Zentraler Abonnentenservice: Tel. (030) 29021-500
Postfach 11 02 47
10832 Berlin
Registriergericht: AG Charlottenburg
HRB 43850"""
}

results = {}
for title, snippet in test_segments.items():
    res = parse_impressum_advanced(snippet)
    results[title] = res
    print(f"=== {title} ===")
    print("Firma:  ", res.get('firma') if res else 'None')
    print("Straße: ", res.get('strasse') if res else 'None')
    print("PLZ/Ort:", res.get('plz_ort') if res else 'None')
    print()

output_path = r"C:\Users\morit\Documents\dinbrief-temp\research_results\impressum_test_run_results.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"Test results written to {output_path}")

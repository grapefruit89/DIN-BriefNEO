import json
import urllib.request
import urllib.parse
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

test_cases = [
    {"query": "Poststraße 1, 53111 Bonn", "desc": "Exakte Adresse mit Hausnummer und PLZ"},
    {"query": "Friedrich-Breuer-Str 15, Beuel", "desc": "Abkürzung Str und Ortsteil"},
    {"query": "Kaufingerstr 10 München", "desc": "Ferne Großstadt"},
    {"query": "Willy-Brandt-Allee Bonn", "desc": "Prominente Bonner Adresse"}
]

results = []

for tc in test_cases:
    q = tc["query"]
    # 1. Komoot Photon
    photon_url = f"https://photon.komoot.io/api/?q={urllib.parse.quote(q)}&lat=50.7374&lon=7.0982&limit=3&lang=de"
    photon_res = None
    try:
        req = urllib.request.Request(photon_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5, context=ctx) as r:
            data = json.loads(r.read().decode('utf-8'))
            features = data.get('features', [])
            photon_res = [
                {
                    "name": f.get('properties', {}).get('name'),
                    "street": f.get('properties', {}).get('street'),
                    "housenumber": f.get('properties', {}).get('housenumber'),
                    "postcode": f.get('properties', {}).get('postcode'),
                    "city": f.get('properties', {}).get('city'),
                    "state": f.get('properties', {}).get('state'),
                    "country": f.get('properties', {}).get('country')
                } for f in features[:2]
            ]
    except Exception as e:
        photon_res = {"error": str(e)}

    # 2. OpenPLZ
    # OpenPLZ separates by endpoint (Streets, Localities)
    # Extract street name candidate
    street_cand = q.split()[0].replace(",", "")
    openplz_url = f"https://openplzapi.org/de/Streets?name=^{urllib.parse.quote(street_cand)}.*"
    openplz_res = None
    try:
        req = urllib.request.Request(openplz_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5, context=ctx) as r:
            data = json.loads(r.read().decode('utf-8'))
            openplz_res = [
                {
                    "street": item.get('name'),
                    "postcode": item.get('postalCode'),
                    "locality": item.get('locality'),
                    "borough": item.get('borough'),
                    "suburb": item.get('suburb')
                } for item in data[:2]
            ]
    except Exception as e:
        openplz_res = {"error": str(e)}

    results.append({
        "test_case": tc,
        "photon_results": photon_res,
        "openplz_results": openplz_res
    })

output_path = r"C:\Users\morit\Documents\dinbrief-temp\research_results\precision_test_results.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"Precision test saved to {output_path}")

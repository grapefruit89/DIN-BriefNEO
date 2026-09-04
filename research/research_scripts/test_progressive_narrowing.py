import urllib.request
import urllib.parse
import json

def test_narrowing():
    street = "Droste-Hülshoff-Straße 9"
    plz_steps = ["", "4", "46", "463", "4635", "46359"]

    print("=================================================================")
    print(f"PROGRESSIVE NARROWING TEST: '{street}'")
    print("=================================================================")

    # First fetch all Droste-Hülshoff-Straße 9 in Germany
    encoded = urllib.parse.quote(f"{street}, Deutschland")
    url = f"https://photon.komoot.io/api/?q={encoded}&limit=50"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            all_features = data.get('features', [])
    except Exception as e:
        print(f"Error: {e}")
        return

    # Extract clean list of unique address candidates
    candidates = []
    seen = set()
    for f in all_features:
        p = f.get('properties', {})
        st = p.get('street', p.get('name', ''))
        hn = p.get('housenumber', '')
        pc = str(p.get('postcode', '')).strip()
        ct = p.get('city', p.get('town', p.get('village', '')))
        if pc and ct and st:
            key = f"{st} {hn}, {pc} {ct}"
            if key not in seen:
                seen.add(key)
                candidates.append({
                    "street": st,
                    "housenumber": hn,
                    "postcode": pc,
                    "city": ct
                })

    print(f"Found {len(candidates)} unique '{street}' locations across Germany:\n")
    for c in candidates:
        print(f"  - {c['street']} {c['housenumber']}, {c['postcode']} {c['city']}")

    print("\n--- SIMULATING USER TYPING PLZ PREFIX STEP-BY-STEP ---")
    for prefix in plz_steps:
        matching = [c for c in candidates if c['postcode'].startswith(prefix)]
        print(f"\nPLZ Input: '{prefix}' => Remaining candidates: {len(matching)}")
        if len(matching) == 1:
            m = matching[0]
            print(f"  >>> [EINDEUTIG / ZERO-CLICK AUTOFILL TRIGGERED!]")
            print(f"      Sofortige automatische Einsetzung ohne Klick oder Enter:")
            print(f"      Straße: {m['street']} {m['housenumber']}")
            print(f"      PLZ/Ort: {m['postcode']} {m['city']}")
            break
        else:
            for m in matching[:4]:
                print(f"      * {m['postcode']} {m['city']}")

if __name__ == "__main__":
    test_narrowing()

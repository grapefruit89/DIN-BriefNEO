import urllib.request
import urllib.parse
import json

def query_photon(query):
    encoded = urllib.parse.quote(query)
    url = f"https://photon.komoot.io/api/?q={encoded}&limit=10"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data.get('features', [])
    except Exception as e:
        print(f"Photon error: {e}")
        return []

def query_openplz_streets(street_name, locality=None):
    params = f"name={urllib.parse.quote(street_name)}"
    if locality:
        params += f"&locality={urllib.parse.quote(locality)}"
    url = f"https://openplzapi.org/de/Streets?{params}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"OpenPLZ error: {e}")
        return []

print("=== 1. Photon Search: 'Droste-Hülshoff-Straße 9' (bundesweit) ===")
features = query_photon("Droste-Hülshoff-Straße 9, Deutschland")
print(f"Total results: {len(features)}")
for idx, f in enumerate(features[:8], 1):
    props = f.get('properties', {})
    street = props.get('street', props.get('name', ''))
    housenumber = props.get('housenumber', '')
    postcode = props.get('postcode', '')
    city = props.get('city', props.get('town', props.get('village', '')))
    state = props.get('state', '')
    print(f"  [{idx}] {street} {housenumber} | PLZ: {postcode} {city} ({state})")

print("\n=== 2. Photon Search: 'Droste-Hülshoff-Straße 9, 46359 Heiden' ===")
features_heiden = query_photon("Droste-Hülshoff-Straße 9, 46359 Heiden")
print(f"Total results: {len(features_heiden)}")
for idx, f in enumerate(features_heiden, 1):
    props = f.get('properties', {})
    street = props.get('street', props.get('name', ''))
    housenumber = props.get('housenumber', '')
    postcode = props.get('postcode', '')
    city = props.get('city', props.get('town', props.get('village', '')))
    print(f"  [{idx}] {street} {housenumber} | PLZ: {postcode} {city}")

print("\n=== 3. OpenPLZ Search for 'Droste-Hülshoff-Straße' in Heiden ===")
streets_heiden = query_openplz_streets("Droste-Hülshoff-Straße", "Heiden")
print(f"Total results: {len(streets_heiden)}")
for s in streets_heiden:
    print(f"  Name: {s.get('name')} | PLZ: {s.get('postalCode')} | Ort: {s.get('locality')}")

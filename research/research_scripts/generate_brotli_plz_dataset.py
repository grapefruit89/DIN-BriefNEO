import urllib.request
import zipfile
import io
import json
import gzip
import brotli
import time
import os

print("1. Downloading German Postal Code Dataset...")
url = 'https://raw.githubusercontent.com/zauberware/postal-codes-json-xml-csv/master/data/DE.zip'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=20) as resp:
    zip_bytes = resp.read()

print("2. Extracting and parsing zipcodes.de.json...")
with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
    raw_content = z.read('zipcodes.de.json')
    # Source dataset is encoded in Latin-1 / ISO-8859-1
    data = json.loads(raw_content.decode('latin-1'))

print(f"   Total raw records in dataset: {len(data)}")

print("3. Building canonical clean PLZ -> Ort dictionary...")
plz_dict = {}

# Separate Großempfänger (Große Firmen, Behörden, Gerichte mit eigener PLZ)
grosskunden = {}

for record in data:
    zipcode = record.get('zipcode', '').strip()
    if len(zipcode) != 5 or not zipcode.isdigit():
        continue

    place = record.get('place', '').strip()
    community = record.get('community', '').strip()
    name = place or community
    if not name:
        continue

    # Check if this is a Großempfänger (e.g. Daimler, Bundesbank, Gerichte, ZDF, etc.)
    is_corp = any(kw in place.lower() for kw in ['gmbh', 'ag', 'co.kg', 'bundes', 'gericht', 'amt', 'kasse', 'zdf', 'wdr', 'postfach', 'brand', 'service', 'universit'])
    if is_corp:
        grosskunden[zipcode] = {"name": place, "city": community}

    # Canonical city mapping
    if zipcode in plz_dict:
        existing = plz_dict[zipcode]
        is_existing_corp = any(kw in existing.lower() for kw in ['gmbh', 'ag', 'co.kg', 'postfach', 'brand', 'service'])
        is_new_corp = any(kw in name.lower() for kw in ['gmbh', 'ag', 'co.kg', 'postfach', 'brand', 'service'])
        if is_existing_corp and not is_new_corp:
            plz_dict[zipcode] = name
        elif not is_existing_corp and not is_new_corp and len(name) < len(existing) and not any(char.isdigit() for char in name):
            plz_dict[zipcode] = name
    else:
        plz_dict[zipcode] = name

sorted_plz = {k: plz_dict[k] for k in sorted(plz_dict.keys())}
print(f"   Clean unique 5-digit postal codes: {len(sorted_plz)}")
print(f"   Identified Großkunden / Behörden mit eigener PLZ: {len(grosskunden)}")

output_dir = r"C:\Users\morit\Documents\dinbrief-temp\research_results"
os.makedirs(output_dir, exist_ok=True)

json_path = os.path.join(output_dir, "de_plz_ort.json")
brotli_path = os.path.join(output_dir, "de_plz_ort.json.br")
gzip_path = os.path.join(output_dir, "de_plz_ort.json.gz")
grosskunden_path = os.path.join(output_dir, "de_grosskunden_plz.json")

print("4. Serializing UTF-8 JSON...")
json_bytes = json.dumps(sorted_plz, ensure_ascii=False, indent=None, separators=(',', ':')).encode('utf-8')
with open(json_path, "wb") as f:
    f.write(json_bytes)

with open(grosskunden_path, "w", encoding="utf-8") as f:
    json.dump(grosskunden, f, indent=2, ensure_ascii=False)

raw_size_kb = len(json_bytes) / 1024
print(f"   Raw JSON size: {raw_size_kb:.1f} KB")

print("5. Compressing with Gzip (Level 9)...")
gzip_bytes = gzip.compress(json_bytes, compresslevel=9)
with open(gzip_path, "wb") as f:
    f.write(gzip_bytes)

gzip_size_kb = len(gzip_bytes) / 1024
print(f"   Gzip size: {gzip_size_kb:.1f} KB")

print("6. Compressing with Brotli (Quality 11 / Max)...")
brotli_bytes = brotli.compress(json_bytes, quality=11, mode=brotli.MODE_TEXT)
with open(brotli_path, "wb") as f:
    f.write(brotli_bytes)

brotli_size_kb = len(brotli_bytes) / 1024
print(f"   Brotli size: {brotli_size_kb:.1f} KB (Ersparnis vs Raw: {(1 - len(brotli_bytes)/len(json_bytes))*100:.1f}%)")

print("7. Benchmarking Brotli Decompression in Python...")
t0 = time.perf_counter()
decompressed = brotli.decompress(brotli_bytes)
t1 = time.perf_counter()
parsed = json.loads(decompressed.decode('utf-8'))
t2 = time.perf_counter()

decomp_ms = (t1 - t0) * 1000
parse_ms = (t2 - t1) * 1000
total_ms = (t2 - t0) * 1000

print(f"   Brotli Decompression Time: {decomp_ms:.2f} ms")
print(f"   JSON Parse Time: {parse_ms:.2f} ms")
print(f"   Total Ready Time: {total_ms:.2f} ms")

print("8. Testing sample lookups:")
test_samples = ['53111', '46359', '10115', '80331', '50667', '20095', '01067', '99998']
for s in test_samples:
    print(f"   PLZ {s} => {parsed.get(s, 'NICHT GEFUNDEN')}")

stats = {
    "total_plz": len(sorted_plz),
    "total_grosskunden": len(grosskunden),
    "raw_json_kb": round(raw_size_kb, 1),
    "gzip_kb": round(gzip_size_kb, 1),
    "brotli_kb": round(brotli_size_kb, 1),
    "brotli_savings_percent": round((1 - len(brotli_bytes)/len(json_bytes))*100, 1),
    "decompression_ms": round(decomp_ms, 2),
    "json_parse_ms": round(parse_ms, 2),
    "total_ready_ms": round(total_ms, 2),
    "samples": {s: parsed.get(s) for s in test_samples}
}

with open(os.path.join(output_dir, "plz_brotli_stats.json"), "w", encoding="utf-8") as f:
    json.dump(stats, f, indent=2, ensure_ascii=False)

print("\nAll files successfully generated and saved to research_results!")

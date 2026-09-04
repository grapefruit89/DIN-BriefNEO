import os
import json
import brotli
import time
import urllib.request
import zipfile
import io

def run_update_pipeline():
    """
    Automated Maintenance & Build Pipeline for DIN-Brief Neo Postal Data.
    1. Fetches canonical German postal code dataset (Open Data).
    2. Merges Großempfänger and constitutional bodies.
    3. Normalizes and validates PLZ-to-City mappings.
    4. Compresses to Brotli (Quality 11) for client-side instant caching.
    5. Outputs build metadata with timestamps and version hash.
    """
    print("=================================================================")
    print("DIN-BRIEF NEO: AUTOMATED POSTAL CODE DATA UPDATE PIPELINE")
    print("=================================================================")

    output_dir = r"C:\Users\morit\Documents\dinbrief-temp\research_results"
    os.makedirs(output_dir, exist_ok=True)

    # 1. Fetch base dataset
    print("[1/5] Fetching base postal dataset...")
    url = 'https://raw.githubusercontent.com/zauberware/postal-codes-json-xml-csv/master/data/DE.zip'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=20) as resp:
        zip_bytes = resp.read()

    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
        raw_content = z.read('zipcodes.de.json')
        data = json.loads(raw_content.decode('latin-1'))
    print(f"      Raw records loaded: {len(data)}")

    # 2. Extract clean PLZ mapping
    print("[2/5] Normalizing PLZ-to-City dictionary...")
    plz_dict = {}
    for record in data:
        zipcode = record.get('zipcode', '').strip()
        if len(zipcode) != 5 or not zipcode.isdigit():
            continue
        place = record.get('place', '').strip()
        community = record.get('community', '').strip()
        name = place or community
        if not name:
            continue

        # Prefer shorter canonical names without district noise
        if zipcode not in plz_dict:
            plz_dict[zipcode] = name
        else:
            existing = plz_dict[zipcode]
            if len(name) < len(existing) and not any(c.isdigit() for c in name):
                plz_dict[zipcode] = name

    # 3. Load Großempfänger
    print("[3/5] Integrating Großempfänger & constitutional bodies...")
    grosskunden_path = os.path.join(output_dir, "de_grosskunden_plz.json")
    if os.path.exists(grosskunden_path):
        with open(grosskunden_path, "r", encoding="utf-8") as f:
            grosskunden = json.load(f)
        # Ensure Großempfänger cities are reflected in main dictionary as fallbacks
        for plz, info in grosskunden.items():
            if plz not in plz_dict and info.get('city'):
                clean_city = info['city'].replace('Kreisfreie Stadt ', '').replace('Stadtkreis ', '').replace(', Stadt', '').strip()
                plz_dict[plz] = clean_city

    sorted_plz = {k: plz_dict[k] for k in sorted(plz_dict.keys())}
    print(f"      Total unique postal codes in dictionary: {len(sorted_plz)}")

    # 4. Serialize JSON and compress with Brotli
    print("[4/5] Serializing JSON and compressing with Brotli (Quality 11)...")
    json_bytes = json.dumps(sorted_plz, ensure_ascii=False, indent=None, separators=(',', ':')).encode('utf-8')
    raw_size_kb = len(json_bytes) / 1024

    brotli_bytes = brotli.compress(json_bytes, quality=11, mode=brotli.MODE_TEXT)
    brotli_size_kb = len(brotli_bytes) / 1024

    json_path = os.path.join(output_dir, "de_plz_ort.json")
    brotli_path = os.path.join(output_dir, "de_plz_ort.json.br")

    with open(json_path, "wb") as f:
        f.write(json_bytes)
    with open(brotli_path, "wb") as f:
        f.write(brotli_bytes)

    print(f"      Raw JSON size:    {raw_size_kb:.1f} KB")
    print(f"      Brotli size:      {brotli_size_kb:.1f} KB")
    print(f"      Compression ratio: {(1 - len(brotli_bytes)/len(json_bytes))*100:.1f}% saved")

    # 5. Benchmark and verify
    print("[5/5] Benchmarking client decompression speed...")
    t0 = time.perf_counter()
    decompressed = brotli.decompress(brotli_bytes)
    t1 = time.perf_counter()
    parsed = json.loads(decompressed.decode('utf-8'))
    t2 = time.perf_counter()

    decomp_ms = (t1 - t0) * 1000
    parse_ms = (t2 - t1) * 1000
    total_ms = (t2 - t0) * 1000
    print(f"      Decompression: {decomp_ms:.2f} ms | Parse: {parse_ms:.2f} ms | Total: {total_ms:.2f} ms")

    version_hash = f"v_{int(time.time())}"
    manifest = {
        "version": version_hash,
        "updated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_plz": len(sorted_plz),
        "total_grosskunden": len(grosskunden) if 'grosskunden' in locals() else 0,
        "raw_kb": round(raw_size_kb, 1),
        "brotli_kb": round(brotli_size_kb, 1),
        "ready_time_ms": round(total_ms, 2)
    }

    manifest_path = os.path.join(output_dir, "plz_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"\nSUCCESS: Pipeline completed! Manifest written to {manifest_path}")

if __name__ == "__main__":
    run_update_pipeline()

import time
import json
import urllib.request
import urllib.parse
import gzip
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def measure_endpoint(name, url, headers=None):
    headers = headers or {'User-Agent': 'DIN-Brief-Neo-Benchmark/1.0'}
    req = urllib.request.Request(url, headers=headers)
    times = []
    status_code = None
    sample_data = None
    error = None

    for i in range(3):
        t0 = time.perf_counter()
        try:
            with urllib.request.urlopen(req, timeout=5, context=ctx) as resp:
                data = resp.read()
                t1 = time.perf_counter()
                times.append((t1 - t0) * 1000)
                status_code = resp.status
                if i == 0:
                    try:
                        sample_data = json.loads(data.decode('utf-8'))
                    except Exception:
                        sample_data = data[:200].decode('utf-8', errors='ignore')
        except urllib.error.HTTPError as e:
            t1 = time.perf_counter()
            times.append((t1 - t0) * 1000)
            status_code = e.code
            error = f"HTTP {e.code}: {e.reason}"
        except Exception as e:
            times.append(9999)
            error = str(e)
        time.sleep(0.1)

    avg_time = sum(times) / len(times) if times else 9999
    min_time = min(times) if times else 9999
    return {
        'name': name,
        'url': url,
        'status': status_code,
        'min_ms': round(min_time, 1),
        'avg_ms': round(avg_time, 1),
        'error': error,
        'has_results': bool(sample_data),
        'sample_preview': str(sample_data)[:150] if sample_data else None
    }

print("Running provider benchmarks...")

benchmarks = []

# 1. Komoot Photon (Bonn Poststraße)
url_photon = "https://photon.komoot.io/api/?q=Bonn+Poststrasse&lat=50.7374&lon=7.0982&limit=5&lang=de"
benchmarks.append(measure_endpoint("Komoot Photon (Bonn Search)", url_photon))

# 2. OpenPLZ API (Bonn Poststr)
url_openplz = "https://openplzapi.org/de/Streets?name=%5EPoststr.*&locality=Bonn"
benchmarks.append(measure_endpoint("OpenPLZ API (Bonn Streets)", url_openplz))

# 3. Zippopotam.us (Bonn 53111)
url_zippo = "https://api.zippopotam.us/de/53111"
benchmarks.append(measure_endpoint("Zippopotam.us (PLZ 53111)", url_zippo))

# 4. Geoapify EU Endpoint Reachability
url_geo_eu = "https://api-eu.geoapify.com/v1/geocode/autocomplete?text=Bonn"
benchmarks.append(measure_endpoint("Geoapify EU Cluster", url_geo_eu))

# 5. Geoapify Global Endpoint Reachability
url_geo_global = "https://api.geoapify.com/v1/geocode/autocomplete?text=Bonn"
benchmarks.append(measure_endpoint("Geoapify Global Cluster", url_geo_global))

# 6. HERE Autocomplete Endpoint Reachability
url_here = "https://autocomplete.search.hereapi.com/v1/autocomplete?q=Bonn"
benchmarks.append(measure_endpoint("HERE Technologies Autocomplete", url_here))

print(json.dumps(benchmarks, indent=2))

# PLZ Size Simulation
# In Germany, there are exactly 8,170 distinct postal codes.
# Let's simulate a realistic German PLZ database with:
# [PLZ, Ort, Bundesland, Lat, Lon]
print("\nCalculating German PLZ Dataset Footprint...")
sample_plz_entry = {"p": "53111", "c": "Bonn", "s": "NW", "lat": 50.737, "lon": 7.098}
sample_json_str = json.dumps(sample_plz_entry)
entry_raw_bytes = len(sample_json_str.encode('utf-8'))

# Realistic dataset calculation for 8,170 German PLZ:
# Format A: Simple Dictionary { "53111": "Bonn", ... }
simple_dict = {f"{i:05d}": "Musterstadt" for i in range(8170)}
simple_json = json.dumps(simple_dict)
simple_raw_kb = len(simple_json.encode('utf-8')) / 1024
simple_gzip_kb = len(gzip.compress(simple_json.encode('utf-8'))) / 1024

# Format B: Rich Array [ [PLZ, Ort, Lat, Lon], ... ]
rich_list = [[f"{i:05d}", "Musterstadt am Rhein", 50.737, 7.098] for i in range(8170)]
rich_json = json.dumps(rich_list)
rich_raw_kb = len(rich_json.encode('utf-8')) / 1024
rich_gzip_kb = len(gzip.compress(rich_json.encode('utf-8'))) / 1024

plz_stats = {
    "total_german_plz_count": 8170,
    "format_a_simple_plz_to_city": {
        "uncompressed_kb": round(simple_raw_kb, 1),
        "gzip_compressed_kb": round(simple_gzip_kb, 1),
        "brotli_estimate_kb": round(simple_gzip_kb * 0.82, 1)
    },
    "format_b_rich_with_coordinates": {
        "uncompressed_kb": round(rich_raw_kb, 1),
        "gzip_compressed_kb": round(rich_gzip_kb, 1),
        "brotli_estimate_kb": round(rich_gzip_kb * 0.80, 1)
    }
}
print(json.dumps(plz_stats, indent=2))

output_data = {
    "benchmarks": benchmarks,
    "plz_preloading_analysis": plz_stats
}

with open(r"C:\Users\morit\Documents\dinbrief-temp\research_results\provider_benchmarks_and_plz_analysis.json", "w", encoding="utf-8") as f:
    json.dump(output_data, f, indent=2, ensure_ascii=False)

print("\nBenchmark and PLZ Analysis saved successfully!")

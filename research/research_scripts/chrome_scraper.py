import json
import urllib.request
import re

url = "https://chromestatus.com/api/v0/features?q=shipping_year:2026&num=500"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*'
}

print(f"Abrufen von {url}...")
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    raw = resp.read()

# XSSI-Präfix )]}' entfernen falls vorhanden
text = raw.decode('utf-8', errors='replace')
text = re.sub(r"^\)]\}'\s*", "", text)

data = json.loads(text)
total_count = data.get("total_count", 0)
features = data.get("features", [])

print(f"total_count: {total_count}")
print(f"Anzahl erhaltener Features: {len(features)}")

# Falls noch nicht alle da sind (Pagination)
if len(features) < total_count:
    print("Pagination aktiv, lade restliche Features...")
    start = len(features)
    while len(features) < total_count:
        p_url = f"https://chromestatus.com/api/v0/features?q=shipping_year:2026&num=100&start={start}"
        p_req = urllib.request.Request(p_url, headers=headers)
        with urllib.request.urlopen(p_req) as p_resp:
            p_text = p_resp.read().decode('utf-8', errors='replace')
            p_text = re.sub(r"^\)]\}'\s*", "", p_text)
            p_data = json.loads(p_text)
            batch = p_data.get("features", [])
            if not batch:
                break
            features.extend(batch)
            start += len(batch)
            print(f"Fortschritt: {len(features)} / {total_count}")

# JSON speichern
json_path = r"C:\Users\morit\Documents\dinbrief-temp\chrome_scraper_data_2026.json"
with open(json_path, "w", encoding="utf-8") as f:
    json.dump({"total_count": len(features), "features": features}, f, ensure_ascii=False, indent=2)
print(f"Gespeichert in: {json_path}")

# Text-Übersicht erstellen
txt_path = r"C:\Users\morit\Documents\dinbrief-temp\chrome_scraper_overview_2026.txt"
with open(txt_path, "w", encoding="utf-8") as f:
    f.write("=" * 80 + "\n")
    f.write(f"CHROME FEATURES 2026 (shipping_year:2026) - GESAMT: {len(features)}\n")
    f.write("=" * 80 + "\n\n")
    
    for idx, feat in enumerate(features, 1):
        name = feat.get("name", "Ohne Titel")
        fid = feat.get("id", "")
        summary = feat.get("summary", "").strip()
        category = feat.get("category", "Unbekannt")
        standards = feat.get("standards", {})
        spec = standards.get("spec", "")
        shipped_milestone = feat.get("browsers", {}).get("chrome", {}).get("desktop", "")
        
        f.write(f"[{idx}] {name} (ID: {fid})\n")
        if category:
            f.write(f"     Kategorie: {category}\n")
        if shipped_milestone:
            f.write(f"     Chrome Desktop Milestone: {shipped_milestone}\n")
        if spec:
            f.write(f"     Spezifikation: {spec}\n")
        if summary:
            clean_summary = " ".join(summary.split())
            f.write(f"     Beschreibung: {clean_summary}\n")
        f.write("-" * 80 + "\n")

print(f"Text-Übersicht gespeichert in: {txt_path}")

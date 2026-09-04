import os
import sys
import json
import brotli
import time
import urllib.request
import zipfile
import io
import base64
import argparse

UPSTREAM_URL = 'https://raw.githubusercontent.com/zauberware/postal-codes-json-xml-csv/master/data/DE.zip'
MAX_ACCEPTABLE_PLZ_DELTA = 50       # Mehr als 50 geänderte PLZs pro Quartal = Anomalie -> Manuelles Review
MAX_ACCEPTABLE_SIZE_DRIFT = 0.05    # Mehr als ±5% Dateigrößen-Änderung = Anomalie -> Manuelles Review

def set_github_output(key: str, value: str):
    """Schreibt Variablen für nachfolgende GitHub Actions Schritte."""
    gh_out = os.environ.get('GITHUB_OUTPUT')
    if gh_out and os.path.exists(gh_out):
        with open(gh_out, 'a', encoding='utf-8') as f:
            f.write(f"{key}={value}\n")

def check_upstream_etag(url: str, timeout: int = 15):
    """
    Führt einen ultra-günstigen HTTP HEAD-Request durch (überträgt nur wenige Bytes Header).
    Gibt (etag, content_length) oder (None, None) bei Netzwerkfehlern zurück.
    """
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (DIN-Brief-Neo CI)'}, method='HEAD')
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            etag = resp.headers.get('ETag', '').strip('"')
            clength = resp.headers.get('Content-Length', '')
            return etag, clength
    except Exception as e:
        print(f"      Hinweis: Upstream-Verbindung temporär nicht erreichbar ({e}).")
        return None, None

def run_update_pipeline(force: bool = False, check_only: bool = False):
    """
    Idempotente, ausfallsichere und qualitätsgesicherte Open-Data Pipeline.
    1. Günstiger ETag-Pre-Check (verhindert unnötige Downloads & CI-Aktivität).
    2. Zero-Noise-Garantie: Bei Nichterreichbarkeit sanfter Abbruch ohne Fehler-Mails.
    3. Strikte Sanity-Prüfungen: Verfassungsorgane & Großstädte müssen existieren.
    4. Anomalie-Wächter: Ungewöhnliche Datensprünge (> 50 PLZs / > 5% Größe) erfordern manuelle Freigabe.
    5. Synchronisiert Brotli-Dateien und generiert das Offline-Fallback plz-embedded.js.
    """
    print("=================================================================")
    print("DIN-BRIEF NEO: INTELLIGENTE OPEN-DATA WARTUNGS-PIPELINE")
    print("=================================================================")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.abspath(os.path.join(script_dir, "..", ".."))
    research_results_dir = os.path.join(repo_root, "research", "research_results")
    website_data_dir = os.path.join(repo_root, "website", "data")
    manifest_path = os.path.join(research_results_dir, "plz_manifest.json")

    os.makedirs(research_results_dir, exist_ok=True)
    os.makedirs(website_data_dir, exist_ok=True)

    # Bestehendes Manifest laden (Baseline für Drift- und Idempotenz-Prüfung)
    manifest = {}
    if os.path.exists(manifest_path):
        try:
            with open(manifest_path, "r", encoding="utf-8") as f:
                manifest = json.load(f)
        except Exception:
            manifest = {}

    prev_etag = manifest.get("upstream_etag", "")
    prev_plz_count = manifest.get("total_plz", 10831)
    prev_brotli_kb = manifest.get("plz_brotli_kb", 70.5)

    # 1. Günstige Idempotenz-Prüfung per HTTP HEAD
    print("[1/6] Idempotenz-Prüfung (HTTP HEAD ETag-Check)...")
    remote_etag, remote_clength = check_upstream_etag(UPSTREAM_URL)

    if remote_etag is None:
        print("      Graceful Skip: Upstream aktuell nicht erreichbar. Nächster Versuch im folgenden Quartal.")
        set_github_output("pipeline_status", "network_skip")
        set_github_output("action_needed", "none")
        set_github_output("summary", "Upstream temporär nicht erreichbar. Kein Eingriff nötig.")
        return

    print(f"      Remote ETag:   {remote_etag}")
    print(f"      Lokaler ETag:  {prev_etag}")

    if not force and prev_etag and remote_etag == prev_etag:
        print("      IDEMPOTENT: Keine Änderungen bei der Datenquelle festgestellt.")
        print("      0 Bytes Download, 0 Commits, 0 Benachrichtigungen.")
        set_github_output("pipeline_status", "skipped")
        set_github_output("action_needed", "none")
        set_github_output("summary", "Keine Upstream-Änderungen. Pipeline idempotent beendet.")
        return

    if check_only:
        print("      Check-Only Modus: Neue Daten verfügbar.")
        set_github_output("pipeline_status", "updates_available")
        return

    # 2. Download und Entpacken
    print("[2/6] Änderungen erkannt! Lade neuen Datensatz herunter...")
    t_start = time.perf_counter()
    req = urllib.request.Request(UPSTREAM_URL, headers={'User-Agent': 'Mozilla/5.0 (DIN-Brief-Neo CI)'})
    with urllib.request.urlopen(req, timeout=30) as resp:
        zip_bytes = resp.read()

    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
        raw_content = z.read('zipcodes.de.json')
        try:
            data = json.loads(raw_content.decode('utf-8'))
        except UnicodeDecodeError:
            data = json.loads(raw_content.decode('latin-1'))
    print(f"      Rohdatensätze geladen: {len(data)}")

    # 3. Normalisierung & Großempfänger-Zusammenführung
    print("[3/6] Normalisiere PLZs & führe Großempfänger zusammen...")
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

        if zipcode not in plz_dict:
            plz_dict[zipcode] = name
        else:
            existing = plz_dict[zipcode]
            if len(name) < len(existing) and not any(c.isdigit() for c in name):
                plz_dict[zipcode] = name

    # Großempfänger aus lokalem Verzeichnis integrieren
    grosskunden_path = os.path.join(research_results_dir, "de_grosskunden_plz.json")
    grosskunden = {}
    if os.path.exists(grosskunden_path):
        with open(grosskunden_path, "r", encoding="utf-8") as f:
            grosskunden = json.load(f)
        for plz, info in grosskunden.items():
            if plz not in plz_dict and isinstance(info, dict) and info.get('city'):
                clean_city = info['city'].replace('Kreisfreie Stadt ', '').replace('Stadtkreis ', '').replace(', Stadt', '').strip()
                plz_dict[plz] = clean_city

    sorted_plz = {k: plz_dict[k] for k in sorted(plz_dict.keys())}
    new_plz_count = len(sorted_plz)
    new_gross_count = len(grosskunden)

    # 4. Serialisierung & Brotli-Kompression (Quality 11)
    print("[4/6] Serialisierung und Brotli-Kompression (Quality 11)...")
    plz_json_bytes = json.dumps(sorted_plz, ensure_ascii=False, indent=None, separators=(',', ':')).encode('utf-8')
    plz_br_bytes = brotli.compress(plz_json_bytes, quality=11, mode=brotli.MODE_TEXT)

    gross_json_bytes = json.dumps(grosskunden, ensure_ascii=False, indent=None, separators=(',', ':')).encode('utf-8')
    gross_br_bytes = brotli.compress(gross_json_bytes, quality=11, mode=brotli.MODE_TEXT)

    new_brotli_kb = round(len(plz_br_bytes) / 1024, 1)

    # 5. Strikte Plausibilitäts- und Sanity-Prüfungen (Wächter)
    print("[5/6] Führe Sanity-Suite & Plausibilitätsprüfungen durch...")
    decomp_plz = json.loads(brotli.decompress(plz_br_bytes).decode('utf-8'))
    decomp_gross = json.loads(brotli.decompress(gross_br_bytes).decode('utf-8'))

    # Hard-Failures: Bei grober Datenkorruption sofort abbrechen (ohne Dateien zu überschreiben!)
    assert new_plz_count >= 10000, f"KRITISCHER FEHLER: Zu wenige PLZs ({new_plz_count} < 10000)!"
    assert new_gross_count >= 2000, f"KRITISCHER FEHLER: Großempfänger-Verzeichnis beschädigt ({new_gross_count} < 2000)!"

    # Wichtige Verfassungsorgane & Großstädte prüfen
    assert decomp_gross.get("11011", {}).get("name") == "Deutscher Bundestag", "Bundestag-Lookup fehlgeschlagen!"
    assert decomp_gross.get("11012", {}).get("name") == "Bundeskanzleramt", "Kanzleramt-Lookup fehlgeschlagen!"
    assert decomp_gross.get("10888", {}).get("name") == "Axel Springer SE", "Axel-Springer-Lookup fehlgeschlagen!"
    assert decomp_gross.get("60600", {}).get("name") == "The Squaire", "The-Squaire-Lookup fehlgeschlagen!"
    assert decomp_plz.get("53111") == "Bonn", "Bonn-Lookup fehlgeschlagen!"
    assert decomp_plz.get("10115") == "Berlin", "Berlin-Lookup fehlgeschlagen!"
    assert decomp_plz.get("80331") == "M\u00fcnchen", "M\u00fcnchen-Lookup fehlgeschlagen!"
    assert decomp_plz.get("20095") == "Hamburg", "Hamburg-Lookup fehlgeschlagen!"
    assert decomp_plz.get("50667") == "K\u00f6ln", "K\u00f6ln-Lookup fehlgeschlagen!"
    assert decomp_plz.get("60311") == "Frankfurt am Main", "Frankfurt-Lookup fehlgeschlagen!"

    # Drift-Berechnung gegen Baseline
    plz_delta = abs(new_plz_count - prev_plz_count)
    size_ratio = new_brotli_kb / prev_brotli_kb if prev_brotli_kb > 0 else 1.0
    size_drift_percent = abs(size_ratio - 1.0) * 100

    print(f"      PLZ-Delta:        {plz_delta} (Toleranzgrenze: <= {MAX_ACCEPTABLE_PLZ_DELTA})")
    print(f"      Größenänderung:   {size_drift_percent:.1f}% (Toleranzgrenze: <= {MAX_ACCEPTABLE_SIZE_DRIFT * 100}%)")

    is_anomaly = (plz_delta > MAX_ACCEPTABLE_PLZ_DELTA) or (size_drift_percent > (MAX_ACCEPTABLE_SIZE_DRIFT * 100))

    if is_anomaly:
        print("\n[WARNUNG] ANOMALIE ERKANNT: Ungewöhnlich viele Änderungen im Datensatz!")
        print("          Produktivdateien werden NICHT direkt überschrieben.")
        print("          Es wird ein Pull Request zur manuellen Prüfung angefordert.")

        # In research_results als Review-Vorschau ablegen
        with open(os.path.join(research_results_dir, "de_plz_ort.review.json"), "wb") as f:
            f.write(plz_json_bytes)

        set_github_output("pipeline_status", "anomaly_detected")
        set_github_output("action_needed", "manual_review")
        set_github_output("summary", f"Anomalie: {plz_delta} PLZs geändert, Größe weicht um {size_drift_percent:.1f}% ab. Review erforderlich.")
        return

    # 6. Produktivschaltung & Offline-Modul-Generierung
    print("[6/6] Sanity-Suite 100% bestanden! Synchronisiere Produktivdaten...")

    # Write research_results
    with open(os.path.join(research_results_dir, "de_plz_ort.json"), "wb") as f:
        f.write(plz_json_bytes)
    with open(os.path.join(research_results_dir, "de_plz_ort.json.br"), "wb") as f:
        f.write(plz_br_bytes)
    with open(os.path.join(research_results_dir, "de_grosskunden_plz.json"), "w", encoding="utf-8") as f:
        json.dump(grosskunden, f, indent=2, ensure_ascii=False)
    with open(os.path.join(research_results_dir, "de_grosskunden_plz.json.br"), "wb") as f:
        f.write(gross_br_bytes)

    # Write website/data
    with open(os.path.join(website_data_dir, "de_plz_ort.json.br"), "wb") as f:
        f.write(plz_br_bytes)
    with open(os.path.join(website_data_dir, "de_grosskunden_plz.json.br"), "wb") as f:
        f.write(gross_br_bytes)

    # Generate plz-embedded.js
    plz_b64 = base64.b64encode(plz_br_bytes).decode('ascii')
    gross_b64 = base64.b64encode(gross_br_bytes).decode('ascii')
    embedded_content = f'''// @ts-check
// Embedded Base64 Brotli datasets for 100% offline and file:/// environments.
// Enables instant decompression via native DecompressionStream("brotli") in 0.5ms.

export const PLZ_DATA_BROTLI_B64 = "{plz_b64}";

export const GROSSKUNDEN_BROTLI_B64 = "{gross_b64}";
'''
    with open(os.path.join(website_data_dir, "plz-embedded.js"), "w", encoding="utf-8", newline="\n") as f:
        f.write(embedded_content)

    t_total = (time.perf_counter() - t_start) * 1000

    # Aktualisiertes Manifest speichern
    new_manifest = {
        "version": f"v_{int(time.time())}",
        "updated_at": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "upstream_etag": remote_etag,
        "total_plz": new_plz_count,
        "total_grosskunden": new_gross_count,
        "plz_raw_kb": round(len(plz_json_bytes) / 1024, 1),
        "plz_brotli_kb": new_brotli_kb,
        "grosskunden_raw_kb": round(len(gross_json_bytes) / 1024, 1),
        "grosskunden_brotli_kb": round(len(gross_br_bytes) / 1024, 1),
        "ready_time_ms": round(t_total, 2)
    }

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(new_manifest, f, indent=2, ensure_ascii=False)

    print(f"\nERFOLG: Sauberes Update abgeschlossen ({new_plz_count} PLZs, {new_brotli_kb} KB Brotli)!")
    set_github_output("pipeline_status", "healthy_update")
    set_github_output("action_needed", "auto_commit")
    set_github_output("summary", f"Reguläres Update: {new_plz_count} PLZs ({new_brotli_kb} KB) erfolgreich verifiziert und integriert.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="DIN-Brief Neo PLZ Pipeline")
    parser.add_argument("--force", action="store_true", help="Ignoriert den ETag und erzwingt einen vollen Durchlauf")
    parser.add_argument("--check-only", action="store_true", help="Prüft nur ob Upstream-Änderungen vorliegen")
    args = parser.parse_args()

    run_update_pipeline(force=args.force, check_only=args.check_only)

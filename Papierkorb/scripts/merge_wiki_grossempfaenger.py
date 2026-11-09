import json
import os
from analyze_wiki_grossempfaenger import parsed_wiki

json_path = r"C:\Users\morit\Documents\dinbrief-temp\research_results\de_grosskunden_plz.json"
with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

initial_count = len(data)
added_count = 0
updated_grouped = 0

for plz, entries in parsed_wiki.items():
    if plz not in data:
        if len(entries) == 1:
            data[plz] = {
                "name": entries[0]["name"],
                "city": entries[0]["city"],
                "type": "einzel",
                "notes": entries[0].get("notes", "")
            }
        else:
            data[plz] = {
                "name": entries[0]["name"], # Primary
                "all_names": [e["name"] for e in entries],
                "city": entries[0]["city"],
                "type": "gruppe",
                "notes": entries[0].get("notes", "")
            }
        added_count += 1
    else:
        # Check if Wikipedia has richer group data (e.g. 31131 Hildesheim)
        if len(entries) > 1:
            if isinstance(data[plz], dict):
                data[plz]["type"] = "gruppe"
                data[plz]["all_names"] = [e["name"] for e in entries]
                updated_grouped += 1

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Initial count: {initial_count}")
print(f"Added from Wikipedia: {added_count}")
print(f"Updated group PLZs: {updated_grouped}")
print(f"New total count: {len(data)}")

# Verify key entries
for test_plz in ["10888", "11011", "11012", "11015", "31131", "33333", "51777", "53094"]:
    print(f"Lookup {test_plz}: {data.get(test_plz)}")

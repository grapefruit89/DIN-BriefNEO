import json
import os
import shutil

settings_path = os.path.expanduser(r"~\.gemini\antigravity-cli\settings.json")
backup_path = settings_path + ".bak"

if not os.path.exists(settings_path):
    print(f"Error: {settings_path} not found.")
    exit(1)

shutil.copyfile(settings_path, backup_path)
print(f"Backup created at: {backup_path}")

with open(settings_path, "r", encoding="utf-8") as f:
    data = json.load(f)

if "permissions" not in data:
    data["permissions"] = {}
if "allow" not in data["permissions"]:
    data["permissions"]["allow"] = []

allow_list = data["permissions"]["allow"]

wildcards = [
    "write_file(*)",
    "edit_file(*)",
    "command(*)",
    "read_url(*)"
]

added = 0
for w in reversed(wildcards):
    if w not in allow_list:
        allow_list.insert(0, w)
        added += 1

with open(settings_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Success! Added {added} wildcard auto-approval rules to {settings_path}.")
print("You will no longer be asked for confirmation prompts for write_file, edit_file, command, or read_url.")

with open('website/js/43-geoapify.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Fix performAddressSearch URL
match = re.search(r'let url = https://api.geoapify.com.*?;', text)
if match:
    text = text.replace(match.group(0), 'let url = https://api.geoapify.com/v1/geocode/autocomplete?text=&apiKey=&lang=de&limit=5;')

# Fix fetchOptions
text = re.sub(r'let fetchOptions = \{[\s\S]*?signal: activeAbortController\.signal,[\s\S]*?\};', 'let fetchOptions = { signal: activeAbortController.signal };', text)

# Fix heartbeat fetch
match = re.search(r'const res = await fetch\(https://api.geoapify.com/v1/geocode/autocomplete\?text=Bonn&limit=1, \{[\s\S]*?\}\);', text)
if match:
    text = text.replace(match.group(0), 'const res = await fetch(https://api.geoapify.com/v1/geocode/autocomplete?text=Bonn&limit=1&apiKey=);')

with open('website/js/43-geoapify.js', 'w', encoding='utf-8') as f:
    f.write(text)

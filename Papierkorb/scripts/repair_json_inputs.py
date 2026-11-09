import json
import re

def repair_mistral():
    path = '/home/moritz/repos/DIN-BriefNEO/website/data/mistral.json'
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read().strip()

    # Strip markdown backticks
    if text.startswith('```'):
        text = text.split('\n', 1)[1]
    if text.endswith('```'):
        text = text.rsplit('\n', 1)[0]
    text = text.strip()

    m_idx = text.rfind('"name": "Prinzessin Daisy"')
    if m_idx != -1:
        m_idx = text.rfind('{', 0, m_idx)
        text = text[:m_idx] + '''{
      "name": "Prinzessin Daisy",
      "alias": ["Daisy"],
      "buergerlicherName": "Prinzessin Daisy von Sarasaland",
      "firma": "Königreich Sarasaland",
      "strasse": "Schloss Sarasaland",
      "ort": "Sarasaland",
      "franchise": "Super Mario",
      "medium": "Videospiel",
      "rolle": "Protagonist",
      "hinweis": "Herrscherin von Sarasaland, sportlich und temperamentvoll."
    }
  ]
}'''
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)

    data = json.loads(text)
    print(f"Mistral successfully repaired: {len(data['figuren'])} figures")

repair_mistral()

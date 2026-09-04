import re

class SmartSalutationParser:
    def __init__(self, common_names=None):
        self.common_names = common_names or {}
        self.titles = ["prof. dr.", "dipl.-ing.", "prof.", "dr.", "mag.", "b.sc.", "m.sc.", "ll.m."]

    def parse_name(self, raw_input):
        """
        Parses raw input from empfaenger-name:
        e.g. 'Herr Dr. Thomas Müller', 'Frau Sabine Becker', 'herr ', 'Dr. Frank Antwerpes'
        """
        text = raw_input.strip()
        if not text:
            return {"gender": "none", "titles": "", "firstName": "", "lastName": "", "isIncompletePrefix": False}

        lower = text.lower()
        gender = "none"
        clean_text = text

        # 1. Detect explicit salutation prefix (Herr, Herrn, Frau)
        m_prefix = re.match(r'^(herrn?|frau)\b\s*', clean_text, re.I)
        if m_prefix:
            prefix_word = m_prefix.group(1).lower()
            gender = "female" if prefix_word == "frau" else "male"
            clean_text = clean_text[m_prefix.end():].strip()
            # If the user ONLY typed "Herr" or "Frau" so far:
            if not clean_text:
                return {
                    "gender": gender,
                    "titles": "",
                    "firstName": "",
                    "lastName": "",
                    "isIncompletePrefix": True
                }

        # 2. Extract academic titles
        found_titles = []
        words = clean_text.split()
        idx = 0
        while idx < len(words):
            candidate = words[idx].lower()
            # Check 2-word titles like "prof. dr."
            if idx + 1 < len(words) and f"{candidate} {words[idx+1].lower()}" in self.titles:
                found_titles.append(f"{words[idx]} {words[idx+1]}")
                idx += 2
                continue
            elif candidate in self.titles or candidate.rstrip('.') + '.' in self.titles:
                found_titles.append(words[idx])
                idx += 1
                continue
            break

        remaining_words = words[idx:]
        titles_str = " ".join(found_titles)

        # 3. Separate First Name and Last Name
        if not remaining_words:
            return {
                "gender": gender,
                "titles": titles_str,
                "firstName": "",
                "lastName": "",
                "isIncompletePrefix": True
            }

        if len(remaining_words) == 1:
            first_name = ""
            last_name = remaining_words[0]
        else:
            first_name = " ".join(remaining_words[:-1])
            last_name = remaining_words[-1]

        # 4. If gender was not explicitly given via "Herr/Frau", check 5KB first name dictionary
        if gender == "none" and first_name:
            # Check first word of first_name
            fn_first = first_name.split()[0].lower()
            if fn_first in self.common_names:
                gender = self.common_names[fn_first]

        return {
            "gender": gender,
            "titles": titles_str,
            "firstName": first_name,
            "lastName": last_name,
            "isIncompletePrefix": False
        }

    def generate_salutation(self, parsed, formality="formal"):
        gender = parsed["gender"]
        titles = parsed["titles"]
        fn = parsed["firstName"]
        ln = parsed["lastName"]

        # If user just typed "herr" or "frau" without name yet
        if parsed.get("isIncompletePrefix"):
            if formality == "formal":
                return "Sehr geehrter Herr," if gender == "male" else "Sehr geehrte Frau,"
            elif formality == "polite":
                return "Guten Tag Herr," if gender == "male" else "Guten Tag Frau,"
            else:
                return "Hallo,"

        # Format title according to DIN 5008 (Spell out Professor in salutation!)
        salutation_title = titles
        if "prof." in titles.lower():
            salutation_title = re.sub(r'prof\.?\s*dr\.?', 'Professor Dr.', titles, flags=re.I)
            salutation_title = re.sub(r'prof\b\.?', 'Professor', salutation_title, flags=re.I)

        title_part = f"{salutation_title} " if salutation_title else ""
        surname = ln or fn

        if not surname:
            return "Sehr geehrte Damen und Herren," if formality == "formal" else ("Guten Tag," if formality == "polite" else "Hallo zusammen,")

        if formality == "formal":
            if gender == "female":
                return f"Sehr geehrte Frau {title_part}{surname},"
            elif gender == "male":
                return f"Sehr geehrter Herr {title_part}{surname},"
            else:
                return "Sehr geehrte Damen und Herren,"

        elif formality == "polite":
            if gender == "female":
                return f"Guten Tag Frau {title_part}{surname},"
            elif gender == "male":
                return f"Guten Tag Herr {title_part}{surname},"
            else:
                full = f"{fn} {ln}".strip()
                return f"Guten Tag {full},"

        else: # casual
            # In casual mode: if user explicitly wrote "Herr Müller", greet with "Hallo Herr Müller,"
            if gender in ("male", "female") and not fn:
                sal_prefix = "Herr" if gender == "male" else "Frau"
                return f"Hallo {sal_prefix} {surname},"
            target_name = fn or surname
            return f"Hallo {target_name},"

# Test dictionary with common names
names_db = {
    "sabine": "female", "julia": "female", "claudia": "female", "anna": "female", "sarah": "female",
    "thomas": "male", "frank": "male", "michael": "male", "stefan": "male", "moritz": "male"
}

parser = SmartSalutationParser(names_db)

test_cases = [
    # The user's exact bug case:
    ("herr ", "formal"),
    ("herr ", "casual"),
    ("herr ", "polite"),
    # Complete names with prefix:
    ("Herr Müller", "formal"),
    ("Herr Müller", "casual"),
    ("Herrn Dr. Thomas Müller", "formal"),
    ("Frau Prof. Dr. Julia Kroll", "formal"),
    # Names WITHOUT prefix (using 5KB dictionary auto-detection):
    ("Sabine Becker", "formal"),
    ("Dr. Frank Antwerpes", "formal"),
    ("Thomas Meier", "formal"),
    # Company / Unknown:
    ("DocCheck Community GmbH", "formal"),
]

print("=== TEST RUN: SMART SALUTATION PARSER ===")
for inp, form in test_cases:
    p = parser.parse_name(inp)
    sal = parser.generate_salutation(p, form)
    print(f"Input: '{inp}' [{form}]")
    print(f"  Parsed: gender={p['gender']}, titles='{p['titles']}', fn='{p['firstName']}', ln='{p['lastName']}', incomplete={p['isIncompletePrefix']}")
    print(f"  Result: '{sal}'\n")

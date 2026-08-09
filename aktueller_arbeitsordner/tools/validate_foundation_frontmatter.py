import os
import sys
import json
import yaml
import datetime
import jsonschema

def extract_frontmatter(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if not content.startswith('---'):
        raise ValueError(f"No starting frontmatter delimiter '---' in {file_path}")

    parts = content.split('---', 2)
    if len(parts) < 3:
        raise ValueError(f"Invalid frontmatter structure in {file_path}")

    yaml_str = parts[1]
    frontmatter = yaml.safe_load(yaml_str)
    if not isinstance(frontmatter, dict):
        raise ValueError(f"Frontmatter in {file_path} is not a valid YAML mapping")

    return frontmatter

def sanitize_dates(data):
    """
    Recursively converts datetime.date and datetime.datetime objects to string YYYY-MM-DD.
    """
    if isinstance(data, dict):
        new_dict = {}
        for k, v in data.items():
            new_dict[k] = sanitize_dates(v)
        return new_dict
    elif isinstance(data, list):
        return [sanitize_dates(item) for item in data]
    elif isinstance(data, (datetime.date, datetime.datetime)):
        return data.strftime('%Y-%m-%d')
    return data

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(script_dir)
    
    schema_path = os.path.join(base_dir, 'docs', '30-meta', 'schema-v6.json')
    foundation_dir = os.path.join(base_dir, 'docs', '00-foundation')

    if not os.path.exists(schema_path):
        print(f"ERROR: Schema file not found: {schema_path}")
        sys.exit(1)

    if not os.path.exists(foundation_dir):
        print(f"ERROR: Foundation directory not found: {foundation_dir}")
        sys.exit(1)

    with open(schema_path, 'r', encoding='utf-8') as f:
        schema = json.load(f)

    errors = []
    validated_count = 0

    md_files = [f for f in os.listdir(foundation_dir) if f.endswith('.md')]
    md_files.sort()

    if not md_files:
        print(f"WARNING: No markdown files found in {foundation_dir}")
        sys.exit(1)

    for filename in md_files:
        file_path = os.path.join(foundation_dir, filename)
        try:
            frontmatter = extract_frontmatter(file_path)
            frontmatter = sanitize_dates(frontmatter)

            jsonschema.validate(
                instance=frontmatter,
                schema=schema,
                format_checker=jsonschema.FormatChecker()
            )
            print(f"[PASS] {filename}")
            validated_count += 1
        except Exception as e:
            print(f"[FAIL] {filename} - {str(e)}")
            errors.append((filename, str(e)))

    print("\n" + "=" * 50)
    if errors:
        print(f"Validation FAILED: {len(errors)} error(s) out of {len(md_files)} file(s).")
        for fn, err in errors:
            print(f"  - {fn}: {err}")
        sys.exit(1)
    else:
        print(f"Validation SUCCESSFUL: All {validated_count} file(s) in 00-foundation passed schema-v6 validation.")
        sys.exit(0)

if __name__ == '__main__':
    main()

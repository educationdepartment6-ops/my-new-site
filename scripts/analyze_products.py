import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('C:/Users/Aditya/.gemini/antigravity/scratch/excel_all_151_rows.json', 'r', encoding='utf-8') as f:
    rows = json.load(f)

print(f"Total rows: {len(rows)}")

# Group by product name while preserving the order of first appearance
groups = {}
for i, r in enumerate(rows):
    prod = r['product_name']
    if prod not in groups:
        groups[prod] = []
    groups[prod].append((i + 1, r))

print(f"Total distinct product names: {len(groups)}")
for prod, items in groups.items():
    skus = [x[1]['col_C_item'] for x in items]
    print(f"{prod} ({len(items)} variants): {', '.join(skus)}")

import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('C:/Users/Aditya/.gemini/antigravity/scratch/excel_all_151_rows.json', 'r', encoding='utf-8') as f:
    rows = json.load(f)

non_10_vials = []
for r in rows:
    spec = r['col_D_spec'] or ''
    # check if 10 vials is mentioned
    if '10' not in spec and 'vial' not in spec.lower():
        non_10_vials.append(r)
    elif '3ml' in spec or '10ml' in spec:
        if '10vials' not in spec and '10 vials' not in spec:
            non_10_vials.append(r)

print(f"Total non-10-vials rows: {len(non_10_vials)}")
for r in non_10_vials:
    print(f"Row {r['row_in_excel']}: Product: {r['product_name']}, Item: {r['col_C_item']}, Spec: {r['col_D_spec']}, USD: {r['col_E_retail_price']}, INR: {r['col_G_sell_price_vial_inr']}")

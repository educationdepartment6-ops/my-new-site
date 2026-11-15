import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('C:/Users/Aditya/.gemini/antigravity/scratch/excel_full_rows.json', 'r', encoding='utf-8') as f:
    excel_rows = json.load(f)

for i, x in enumerate(excel_rows):
    if int(x['no']) != i + 1:
        print(f"Row {x['row']}: No in Col A = {x['no']}, Actual row index = {i+1} | {x['product']} | {x['item_code']}")

import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Let's read excel_full_rows.json
with open('C:/Users/Aditya/.gemini/antigravity/scratch/excel_full_rows.json', 'r', encoding='utf-8') as f:
    excel_rows = json.load(f)

print(f"Total excel rows: {len(excel_rows)}")

# Check items codes in Excel
excel_skus = [r['item_code'] for r in excel_rows]
print("First 10 SKUs in Excel:", excel_skus[:10])
print("Last 10 SKUs in Excel:", excel_skus[-10:])

# Let's inspect rows around 50-60 in Excel
for r in excel_rows[50:65]:
    print(r['no'], r['product'], r['item_code'], r['specification'], r['retail_usd'], r['sell_inr'])

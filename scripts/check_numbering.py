import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('C:/Users/Aditya/.gemini/antigravity/scratch/excel_full_rows.json', 'r', encoding='utf-8') as f:
    excel_rows = json.load(f)

print("Excel row count:", len(excel_rows))
for i, r in enumerate(excel_rows):
    # Print if numbering skips or differences
    if int(r['no']) != (i + 1):
        print(f"Discrepancy at index {i}: row no={r['no']}, expected {i+1}")
        break
else:
    print("All 148 rows in Excel are numbered consecutively 1 to 148.")

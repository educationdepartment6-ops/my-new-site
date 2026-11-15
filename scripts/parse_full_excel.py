import zipfile
import xml.etree.ElementTree as ET
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = 'C:/Users/Aditya/Downloads/零售价_Simple_1Vial_Selling_Price.xlsx'

with zipfile.ZipFile(file_path, 'r') as z:
    sheet_tree = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
    ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    
    rows = []
    for row in sheet_tree.findall('.//ns:row', ns):
        r_idx = row.attrib.get('r')
        row_cells = {}
        for c in row.findall('ns:c', ns):
            r = c.attrib.get('r') # e.g. A2, B2
            col = ''.join([ch for ch in r if ch.isalpha()])
            t = c.attrib.get('t')
            val = None
            if t == 'inlineStr':
                is_el = c.find('ns:is', ns)
                if is_el is not None:
                    t_el = is_el.find('.//ns:t', ns)
                    if t_el is not None:
                        val = t_el.text
            else:
                v_el = c.find('ns:v', ns)
                if v_el is not None:
                    val = v_el.text
            f_el = c.find('ns:f', ns)
            formula = f_el.text if f_el is not None else None
            row_cells[col] = {
                'val': val,
                'formula': formula,
                'type': t
            }
        rows.append((int(r_idx), row_cells))

rows.sort(key=lambda x: x[0])

print(f"Total rows parsed: {len(rows)}")

# Print Row 1 and Row 2 (Headers)
for r_idx, cells in rows[:3]:
    print(f"Row {r_idx}:")
    for col in sorted(cells.keys()):
        print(f"  Col {col}: {cells[col]}")

# Forward-fill Product Name if blank (merged cell)
current_product = ""
parsed_products = []
for r_idx, cells in rows[2:]: # from row 3 onwards
    # Column A is Sorting/No.
    no_val = cells.get('A', {}).get('val')
    if not no_val:
        continue
    
    prod_val = cells.get('B', {}).get('val')
    if prod_val and prod_val.strip():
        current_product = prod_val.strip()
    
    item_code = cells.get('C', {}).get('val', '')
    spec = cells.get('D', {}).get('val', '')
    retail_usd = cells.get('E', {}).get('val', '')
    cost_inr = cells.get('F', {}).get('val', '')
    sell_inr = cells.get('G', {}).get('val', '')
    
    parsed_products.append({
        'row': r_idx,
        'no': no_val,
        'product_raw': prod_val,
        'product': current_product,
        'item_code': item_code,
        'specification': spec,
        'retail_usd': retail_usd,
        'cost_inr': cost_inr,
        'sell_inr': sell_inr
    })

print(f"Total product rows: {len(parsed_products)}")
print("First 5 product rows:")
for p in parsed_products[:5]:
    print(p)
print("Last 5 product rows:")
for p in parsed_products[-5:]:
    print(p)

with open('C:/Users/Aditya/.gemini/antigravity/scratch/excel_full_rows.json', 'w', encoding='utf-8') as f:
    json.dump(parsed_products, f, ensure_ascii=False, indent=2)

print("Saved excel_full_rows.json")

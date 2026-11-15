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
        r_idx = int(row.attrib.get('r'))
        cells = {}
        for c in row.findall('ns:c', ns):
            r = c.attrib.get('r')
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
            cells[col] = {
                'val': val,
                'formula': formula
            }
        rows.append((r_idx, cells))

rows.sort(key=lambda x: x[0])

# Inspect all rows from row 3 onwards
all_product_rows = []
current_product = ""

for r_idx, cells in rows:
    if r_idx < 3: # Skip row 1 (Currency:USD) and row 2 (headers)
        continue
    
    # Check if this row has item code or retail price or product name
    col_a = cells.get('A', {}).get('val')
    col_b = cells.get('B', {}).get('val')
    col_c = cells.get('C', {}).get('val')
    col_d = cells.get('D', {}).get('val')
    col_e = cells.get('E', {}).get('val')
    col_f = cells.get('F', {}).get('val')
    col_g = cells.get('G', {}).get('val')
    
    if col_b and col_b.strip():
        current_product = col_b.strip()
    
    # If the row has at least an item code (Col C) or spec (Col D)
    if col_c or col_d or col_e or col_g:
        all_product_rows.append({
            'row_in_excel': r_idx,
            'col_A_no': col_a,
            'col_B_product_raw': col_b,
            'product_name': current_product,
            'col_C_item': col_c,
            'col_D_spec': col_d,
            'col_E_retail_price': col_e,
            'col_F_cost_vial_inr': col_f,
            'col_G_sell_price_vial_inr': col_g
        })

print(f"Total product rows found in Excel: {len(all_product_rows)}")

# Check which rows have no col_a
blank_a = [r for r in all_product_rows if not r['col_A_no']]
print(f"Rows with blank Col A ({len(blank_a)}):")
for r in blank_a:
    print(r)

with open('C:/Users/Aditya/.gemini/antigravity/scratch/excel_all_151_rows.json', 'w', encoding='utf-8') as f:
    json.dump(all_product_rows, f, ensure_ascii=False, indent=2)

print("Saved excel_all_151_rows.json successfully.")

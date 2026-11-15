import os
import sys
import zipfile
import xml.etree.ElementTree as ET
import json

sys.stdout.reconfigure(encoding='utf-8')

file_path = 'C:/Users/Aditya/Downloads/零售价_Simple_1Vial_Selling_Price.xlsx'

with zipfile.ZipFile(file_path, 'r') as z:
    # 1. Read shared strings
    shared_strings = []
    if 'xl/sharedStrings.xml' in z.namelist():
        tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
        # namespace
        ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        for si in tree.findall('ns:si', ns):
            # Text can be in <t> or multiple <r><t>
            texts = [t.text for t in si.findall('.//ns:t', ns) if t.text]
            shared_strings.append("".join(texts))

    # 2. Read workbook to get sheet names
    wb_tree = ET.fromstring(z.read('xl/workbook.xml'))
    ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
          'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
    sheets = []
    for sheet in wb_tree.findall('.//ns:sheet', ns):
        sheets.append((sheet.attrib['name'], sheet.attrib['sheetId'], sheet.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']))
    
    print("Sheets in workbook:", sheets)

    # 3. Read sheet1.xml
    sheet_tree = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
    rows_data = []
    
    for row in sheet_tree.findall('.//ns:row', ns):
        row_num = row.attrib.get('r')
        cells = {}
        for c in row.findall('ns:c', ns):
            cell_ref = c.attrib.get('r')
            cell_type = c.attrib.get('t')
            v = c.find('ns:v', ns)
            val = v.text if v is not None else ""
            if cell_type == 's' and val:
                val = shared_strings[int(val)]
            cells[cell_ref] = val
        rows_data.append((row_num, cells))

    print(f"Total rows in sheet1: {len(rows_data)}")
    
    # Print the first 10 rows
    for r_num, cells in rows_data[:10]:
        print(f"Row {r_num}: {cells}")

    # Save all parsed rows to json for inspection
    with open('C:/Users/Aditya/.gemini/antigravity/scratch/parsed_excel.json', 'w', encoding='utf-8') as out:
        json.dump(rows_data, out, ensure_ascii=False, indent=2)

print("Saved parsed_excel.json successfully.")

import fitz
import os
import io
import json
from PIL import Image

source_pdf = r'C:\Users\Aditya\Downloads\1a1e0ab6b8598f49ab1.pdf'
public_coa_dir = r'C:\Users\Aditya\.gemini\antigravity\scratch\react-app\public\coa'
server_coa_dir = r'C:\Users\Aditya\.gemini\antigravity\scratch\react-app\server\uploads\coa'

os.makedirs(public_coa_dir, exist_ok=True)
os.makedirs(server_coa_dir, exist_ok=True)

packs = [
    {
        "id": "coa_aod9604_2025248",
        "sample_name": "AOD-9604",
        "filename": "COA_AOD-9604_2025248.pdf",
        "start": 1,
        "end": 72,
        "batch": "2025248",
        "strength": "5mg / vial",
        "productId": "aod-9604",
        "productName": "AOD 9604",
        "category": "weight-loss",
        "testDate": "2026-04-21",
        "lab": "BioAnalytical Solutions & Eurofins Slovakia (SNAS Reg. No. 749/S-406)",
        "inCatalog": True,
        "dpi": 105,
        "quality": 55
    },
    {
        "id": "coa_ghkcu_2025240",
        "sample_name": "GHK-Cu",
        "filename": "COA_GHK-Cu_2025240.pdf",
        "start": 73,
        "end": 121,
        "batch": "2025240",
        "strength": "50mg / vial",
        "productId": "ghk-cu",
        "productName": "GHK-CU",
        "category": "beauty-skin",
        "testDate": "2026-04-21",
        "lab": "BioAnalytical Solutions & Eurofins Slovakia (SNAS Reg. No. 749/S-406)",
        "inCatalog": True,
        "dpi": 110,
        "quality": 60
    },
    {
        "id": "coa_ipamorelin_2025246",
        "sample_name": "Ipamorelin",
        "filename": "COA_Ipamorelin_2025246.pdf",
        "start": 122,
        "end": 187,
        "batch": "2025246",
        "strength": "5mg / vial",
        "productId": "ipamorelin",
        "productName": "Ipamorelin",
        "category": "muscle-growth",
        "testDate": "2026-04-21",
        "lab": "BioAnalytical Solutions & Eurofins Slovakia (SNAS Reg. No. 749/S-406)",
        "inCatalog": True,
        "dpi": 105,
        "quality": 55
    },
    {
        "id": "coa_pt141_2025233",
        "sample_name": "PT-141",
        "filename": "COA_PT-141_2025233.pdf",
        "start": 188,
        "end": 197,
        "batch": "2025233",
        "strength": "10mg / vial",
        "productId": "pt-141",
        "productName": "PT 141",
        "category": "sexual-health-fertility",
        "testDate": "2026-04-21",
        "lab": "BioAnalytical Solutions & Eurofins Slovakia (SNAS Reg. No. 749/S-406)",
        "inCatalog": True,
        "dpi": 120,
        "quality": 65
    },
    {
        "id": "coa_pinealon_2025266",
        "sample_name": "PINEALON",
        "filename": "COA_Pinealon_2025266.pdf",
        "start": 198,
        "end": 269,
        "batch": "2025266",
        "strength": "10mg / vial",
        "productId": None,
        "productName": "Pinealon",
        "category": "anti-aging-energy",
        "testDate": "2026-04-21",
        "lab": "BioAnalytical Solutions & Eurofins Slovakia (SNAS Reg. No. 749/S-406)",
        "inCatalog": False,
        "dpi": 105,
        "quality": 55
    },
    {
        "id": "coa_tesamorelin_2026203",
        "sample_name": "Tesamorelin",
        "filename": "COA_Tesamorelin_2026203.pdf",
        "start": 270,
        "end": 303,
        "batch": "2026203",
        "strength": "5mg / vial",
        "productId": "tesamorelin",
        "productName": "Tesamorelin",
        "category": "muscle-growth",
        "testDate": "2024-12-03",
        "lab": "BioAnalytical Solutions & Eurofins Slovakia (SNAS Reg. No. 749/S-406)",
        "inCatalog": True,
        "dpi": 115,
        "quality": 60
    },
    {
        "id": "coa_tb500_2025238",
        "sample_name": "Thymosin beta-4",
        "filename": "COA_TB-500_2025238.pdf",
        "start": 304,
        "end": 315,
        "batch": "2025238",
        "strength": "10mg / vial",
        "productId": "tb-500-thymosin-b4-acetate",
        "productName": "TB 500(Thymosin B4 AceTate)",
        "category": "recovery-healing",
        "testDate": "2026-04-21",
        "lab": "BioAnalytical Solutions & Eurofins Slovakia (SNAS Reg. No. 749/S-406)",
        "inCatalog": True,
        "dpi": 120,
        "quality": 65
    }
]

print(f"Opening source PDF: {source_pdf}")
src_doc = fitz.open(source_pdf)

coa_records = []

for pack in packs:
    start_page = pack['start'] - 1
    end_page = pack['end'] - 1
    num_pages = end_page - start_page + 1
    
    print(f"\nCompressing {pack['sample_name']} (pages {pack['start']}-{pack['end']}, {num_pages} pages)...")
    
    out_doc = fitz.open()
    dpi = pack['dpi']
    quality = pack['quality']
    
    for p_idx in range(start_page, end_page + 1):
        src_page = src_doc[p_idx]
        rect = src_page.rect
        
        pix = src_page.get_pixmap(dpi=dpi)
        img = Image.open(io.BytesIO(pix.tobytes('png')))
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG', quality=quality, optimize=True)
        
        new_page = out_doc.new_page(width=rect.width, height=rect.height)
        new_page.insert_image(rect, stream=img_byte_arr.getvalue())
        
    pub_path = os.path.join(public_coa_dir, pack['filename'])
    srv_path = os.path.join(server_coa_dir, pack['filename'])
    
    out_doc.save(pub_path, garbage=4, deflate=True)
    out_doc.save(srv_path, garbage=4, deflate=True)
    out_doc.close()
    
    size_bytes = os.path.getsize(pub_path)
    size_mb = round(size_bytes / (1024 * 1024), 2)
    print(f"  --> Saved {pack['filename']}: {size_mb} MB (Target < 5 MB: {'PASS' if size_mb < 5.0 else 'OVER'})")
    
    record = {
        "id": pack['id'],
        "productId": pack['productId'],
        "productName": pack['productName'],
        "category": pack['category'],
        "strength": pack['strength'],
        "batchNumber": pack['batch'],
        "testDate": pack['testDate'],
        "lab": pack['lab'],
        "pdfUrl": f"/coa/{pack['filename']}",
        "fileSize": f"{size_mb} MB",
        "pageCount": num_pages,
        "isVisible": True,
        "inCatalog": pack['inCatalog']
    }
    coa_records.append(record)

src_doc.close()

# Remove test file if exists
test_file = os.path.join(public_coa_dir, 'COA_AOD-9604_test.pdf')
if os.path.exists(test_file):
    os.remove(test_file)

# Save structured records to src/data/coa_records.json
records_file = r'C:\Users\Aditya\.gemini\antigravity\scratch\react-app\src\data\coa_records.json'
with open(records_file, 'w', encoding='utf-8') as f:
    json.dump(coa_records, f, indent=2, ensure_ascii=False)

print(f"\nAll 7 packs successfully compressed and saved to {records_file}")

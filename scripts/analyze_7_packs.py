import fitz
from rapidocr_onnxruntime import RapidOCR
import sys, io, json, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

pdf_path = r'C:\Users\Aditya\Downloads\1a1e0ab6b8598f49ab1.pdf'
doc = fitz.open(pdf_path)
ocr = RapidOCR()

packs = [
    {"id": 1, "start": 1, "end": 72, "name": "AOD-9604", "batch": "2025248"},
    {"id": 2, "start": 73, "end": 121, "name": "GHK-Cu", "batch": "2025240"},
    {"id": 3, "start": 122, "end": 187, "name": "Ipamorelin", "batch": "2025246"},
    {"id": 4, "start": 188, "end": 197, "name": "PT-141", "batch": "2025233"},
    {"id": 5, "start": 198, "end": 269, "name": "PINEALON", "batch": "2025266"},
    {"id": 6, "start": 270, "end": 303, "name": "Tesamorelin", "batch": "2026203"},
    {"id": 7, "start": 304, "end": 315, "name": "Thymosin beta-4", "batch": "2025238"}
]

with open('src/data/products.json', encoding='utf-8') as f:
    catalog = json.load(f)

pack_details = []

for pack in packs:
    print(f"\n=======================================================")
    print(f"PACK {pack['id']}: {pack['name']} (Pages {pack['start']}-{pack['end']}, Total {pack['end']-pack['start']+1} pages)")
    print(f"=======================================================")
    
    # 1. OCR Start Page
    p_start = doc[pack['start'] - 1]
    pix = p_start.get_pixmap(dpi=150)
    res_start, _ = ocr(pix.tobytes('png'))
    lines_start = [r[1].strip() for r in res_start] if res_start else []
    text_start = "\n".join(lines_start)
    
    # Sample preparation & strength
    strength = "Not specified"
    m_prep = re.search(r'The whole amount of .*?\((.*?)\) was dissolved', text_start, re.I)
    if m_prep:
        strength = m_prep.group(1)
    else:
        m_mg = re.search(r'(\d+\s*mg)', text_start, re.I)
        if m_mg:
            strength = m_mg.group(1)
            
    # Submitter info on start page
    submitter_lines = []
    capture = False
    for line in lines_start:
        if 'submitter' in line.lower():
            capture = True
            submitter_lines.append(line)
            continue
        if capture:
            if any(term in line.lower() for term in ['1.', 'peptide content', 'instrument', 'method', 'sequence', 'batch']):
                break
            submitter_lines.append(line)
    submitter_info = " | ".join(submitter_lines) if submitter_lines else "Not found on page 1"

    # Search for dates across first 3 pages and Eurofins report page
    dates = []
    for d in re.findall(r'\b(202[0-9][-/.][0-1]?[0-9][-/.][0-3]?[0-9])\b', text_start):
        dates.append(d)
    for d in re.findall(r'\b([0-3]?[0-9][-/.][0-1]?[0-9][-/.](?:20)?2[0-9])\b', text_start):
        dates.append(d)
        
    # Check Eurofins / other lab page in pack
    labs = ["Analytical Certificate Lab (CLND/HPLC)"]
    eurofins_found = False
    eurofins_date = None
    
    # Check pages within pack for Eurofins or additional info
    # Scan a sample of pages in the pack (start, start+1, start+9, start+10, end)
    sample_pages = sorted(list(set([
        pack['start'], pack['start'] + 1, min(pack['start'] + 9, pack['end']), 
        min(pack['start'] + 10, pack['end']), min(pack['start'] + 11, pack['end']), pack['end']
    ])))
    
    privacy_findings = []
    
    for sp in range(pack['start'], min(pack['start'] + 15, pack['end'] + 1)):
        p_obj = doc[sp - 1]
        pix_sp = p_obj.get_pixmap(dpi=120)
        res_sp, _ = ocr(pix_sp.tobytes('png'))
        sp_lines = [r[1].strip() for r in res_sp] if res_sp else []
        sp_text = "\n".join(sp_lines)
        
        if "eurofins" in sp_text.lower() and not eurofins_found:
            eurofins_found = True
            labs.append("Eurofins Environment Testing (Slovakia / Reg. No. 749/S-406)")
            # find dates
            for d in re.findall(r'\b(202[0-9][-/.][0-1]?[0-9][-/.][0-3]?[0-9])\b', sp_text):
                dates.append(d)
                
        # Privacy check: emails, phones, names
        emails = re.findall(r'[\w.-]+@[\w.-]+\.\w+', sp_text)
        phones = re.findall(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', sp_text)
        if emails:
            privacy_findings.extend([f"Email on p.{sp}: {e}" for e in emails])
        if phones:
            privacy_findings.extend([f"Phone on p.{sp}: {ph}" for ph in phones])
        for line in sp_lines:
            if any(term in line.lower() for term in ['customer:', 'client:', 'ordered by:', 'sample received from']):
                privacy_findings.append(f"Client detail on p.{sp}: {line}")

    # Matching Catalog Product
    matched_product = None
    pack_name_clean = pack['name'].lower().replace('-', '').replace(' ', '')
    for cp in catalog:
        cp_name_clean = cp['name'].lower().replace('-', '').replace(' ', '')
        cp_id_clean = cp['id'].lower().replace('-', '').replace(' ', '')
        if pack_name_clean in cp_name_clean or cp_name_clean in pack_name_clean or pack_name_clean in cp_id_clean:
            matched_product = cp
            break
            
    # Also check Thymosin beta-4 -> TB 500
    if not matched_product and ('thymosin' in pack['name'].lower() or 'tb' in pack['name'].lower()):
        for cp in catalog:
            if 'tb-500' in cp['id'] or 'thymosin' in cp['name'].lower():
                matched_product = cp
                break
                
    # Also check PT-141 -> Bremelanotide / PT-141
    if not matched_product and 'pt' in pack['name'].lower():
        for cp in catalog:
            if 'pt-141' in cp['id'] or 'bremelanotide' in cp['name'].lower():
                matched_product = cp
                break
                
    # Also check Pinealon
    if not matched_product and 'pinealon' in pack['name'].lower():
        for cp in catalog:
            if 'pinealon' in cp['name'].lower() or 'pinealon' in cp['id']:
                matched_product = cp
                break

    details = {
        "pack_id": pack['id'],
        "sample_name": pack['name'],
        "batch_number": pack['batch'],
        "page_range": f"{pack['start']}-{pack['end']} ({pack['end']-pack['start']+1} pages)",
        "strength": strength,
        "labs": labs,
        "dates": list(set(dates))[:5],
        "submitter_info": submitter_info,
        "privacy_findings": privacy_findings,
        "matched_product": {
            "id": matched_product['id'] if matched_product else None,
            "name": matched_product['name'] if matched_product else "NO DIRECT MATCH IN CATALOG",
            "category": matched_product['category'] if matched_product else None,
            "variants": [v['label'] for v in matched_product['variants']] if matched_product else []
        }
    }
    pack_details.append(details)
    
    print(f"Sample Name:    {pack['name']}")
    print(f"Batch No:       {pack['batch']}")
    print(f"Strength:       {strength}")
    print(f"Pages:          {pack['start']}-{pack['end']}")
    print(f"Labs:           {', '.join(labs)}")
    print(f"Dates found:    {dates[:4]}")
    print(f"Submitter:      {submitter_info}")
    print(f"Privacy info:   {privacy_findings}")
    if matched_product:
        print(f"Catalog Match:  {matched_product['name']} (ID: {matched_product['id']}, Category: {matched_product['category']})")
        print(f"Variants:       {[v['label'] for v in matched_product['variants']]}")
    else:
        print(f"Catalog Match:  *** NO DIRECT MATCH IN CATALOG ***")

with open(r'C:\Users\Aditya\.gemini\antigravity\scratch\react-app\scripts\coa_packs_analyzed.json', 'w', encoding='utf-8') as f:
    json.dump(pack_details, f, indent=2, ensure_ascii=False)
print("\nSaved analyzed data to coa_packs_analyzed.json")

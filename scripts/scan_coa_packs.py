import fitz
from rapidocr_onnxruntime import RapidOCR
import json
import re
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

pdf_path = r'C:\Users\Aditya\Downloads\1a1e0ab6b8598f49ab1.pdf'
doc = fitz.open(pdf_path)
total_pages = len(doc)
print(f"Total pages in PDF: {total_pages}")

ocr = RapidOCR()

packs = []
page_info = []

print("Starting scan of all pages...")

for page_idx in range(total_pages):
    page = doc[page_idx]
    page_num = page_idx + 1
    
    # Clip top 35% of page
    rect = page.rect
    clip = fitz.Rect(0, 0, rect.width, rect.height * 0.35)
    pix = page.get_pixmap(dpi=120, clip=clip)
    res, _ = ocr(pix.tobytes('png'))
    lines = [r[1].strip() for r in res] if res else []
    text_top = " \n ".join(lines)
    
    is_analytical_cert = bool(re.search(r'ANALYTICAL\s+CERTIFICATE', text_top, re.I))
    is_page_1 = bool(re.search(r'Page\s+1\s*/', text_top, re.I) or re.search(r'Page\s+1\b', text_top, re.I))
    is_eurofins = bool(re.search(r'eurofins', text_top, re.I))
    
    # Check if this is the start of an Analytical Certificate pack
    if is_analytical_cert and is_page_1:
        print(f"\n>>> FOUND PACK START on Page {page_num} <<<")
        # Do full page OCR for detailed info
        pix_full = page.get_pixmap(dpi=150)
        full_res, _ = ocr(pix_full.tobytes('png'))
        full_lines = [r[1].strip() for r in full_res] if full_res else []
        full_text = "\n".join(full_lines)
        
        packs.append({
            'start_page': page_num,
            'top_text': text_top,
            'full_text': full_text,
            'lines': full_lines
        })
    elif is_analytical_cert:
        # Note page N of certificate
        m = re.search(r'Page\s+(\d+)\s*/\s*(\d+)', text_top, re.I)
        p_str = f"Page {m.group(1)}/{m.group(2)}" if m else "Page ?"
        if page_num % 10 == 0:
            print(f"Page {page_num}: Analytical Cert ({p_str})")
    elif is_eurofins:
        if page_num % 10 == 0:
            print(f"Page {page_num}: Eurofins Report")
    else:
        if page_num % 25 == 0:
            print(f"Page {page_num}: Processed...")

print(f"\n==========================================")
print(f"SCAN COMPLETE. Found {len(packs)} candidate packs.")
print(f"==========================================")

# Now determine page ranges for each pack
for i, pack in enumerate(packs):
    start = pack['start_page']
    end = (packs[i+1]['start_page'] - 1) if (i + 1 < len(packs)) else total_pages
    pack['end_page'] = end
    pack['total_pack_pages'] = end - start + 1
    
    lines = pack['lines']
    full_text = pack['full_text']
    
    # Extract Sample name
    sample_name = "Unknown"
    for idx, line in enumerate(lines):
        if re.search(r'Sample\s+name', line, re.I):
            if idx + 1 < len(lines):
                sample_name = lines[idx+1]
            break
            
    # Extract Batch No
    batch_no = "Unknown"
    for idx, line in enumerate(lines):
        if re.search(r'Batch\s+No', line, re.I):
            if idx + 1 < len(lines):
                batch_no = lines[idx+1]
            break
            
    # Extract Page count format e.g. Page 1/10
    cert_pages = "Unknown"
    m = re.search(r'Page\s+1\s*/\s*(\d+)', full_text, re.I)
    if m:
        cert_pages = m.group(1)
        
    # Extract Submitter
    submitter = "Unknown"
    for idx, line in enumerate(lines):
        if re.search(r'Submitter', line, re.I):
            candidates = []
            for j in range(idx+1, min(idx+4, len(lines))):
                candidates.append(lines[j])
            submitter = " ".join(candidates)
            break
            
    # Extract Sample Preparation / strength
    strength = "Unknown"
    m_mg = re.search(r'\((\d+\s*mg)\)', full_text, re.I)
    if not m_mg:
        m_mg = re.search(r'(\d+\s*mg)', full_text, re.I)
    if m_mg:
        strength = m_mg.group(1)
        
    pack['extracted'] = {
        'sample_name': sample_name,
        'batch_no': batch_no,
        'cert_pages': cert_pages,
        'submitter': submitter,
        'strength': strength
    }
    
    print(f"\nPack #{i+1}: Pages {start}-{end} ({pack['total_pack_pages']} pages)")
    print(f"  Sample Name: {sample_name}")
    print(f"  Batch No:    {batch_no}")
    print(f"  Cert Pages:  Page 1/{cert_pages}")
    print(f"  Strength:    {strength}")
    print(f"  Submitter:   {submitter}")

# Save detailed results to JSON
output_file = r'C:\Users\Aditya\.gemini\antigravity\scratch\react-app\scripts\coa_packs_raw.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump([{
        'pack_index': i + 1,
        'start_page': p['start_page'],
        'end_page': p['end_page'],
        'total_pack_pages': p['total_pack_pages'],
        'extracted': p['extracted'],
        'full_text': p['full_text']
    } for i, p in enumerate(packs)], f, indent=2, ensure_ascii=False)

print(f"\nRaw results saved to {output_file}")

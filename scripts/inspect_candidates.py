import fitz
from rapidocr_onnxruntime import RapidOCR
import sys, io, json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

pdf_path = r'C:\Users\Aditya\Downloads\1a1e0ab6b8598f49ab1.pdf'
doc = fitz.open(pdf_path)
ocr = RapidOCR()

candidate_pages = [1, 2, 73, 122, 188, 190, 198, 270, 271, 272, 304, 306]

for p in candidate_pages:
    page = doc[p-1]
    pix = page.get_pixmap(dpi=150)
    res, _ = ocr(pix.tobytes('png'))
    lines = [r[1].strip() for r in res] if res else []
    print(f"\n==========================================")
    print(f"PAGE {p} (Candidate)")
    print(f"==========================================")
    for l in lines[:15]:
        print(f"  {l}")

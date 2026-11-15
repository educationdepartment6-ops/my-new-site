import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('C:/Users/Aditya/.gemini/antigravity/scratch/excel_all_151_rows.json', 'r', encoding='utf-8') as f:
    excel_rows = json.load(f)

print(f"Loaded {len(excel_rows)} rows from Excel.")

# Category mapping dictionary
cat_map = {
    'Tirzepatide': ('metabolic-candidates', 'Investigational Metabolic Candidates'),
    'Retatrutide': ('metabolic-candidates', 'Investigational Metabolic Candidates'),
    'Semaglutide': ('metabolic-candidates', 'Investigational Metabolic Candidates'),
    'Cagrilintide': ('metabolic-candidates', 'Investigational Metabolic Candidates'),
    'Survodutide': ('metabolic-candidates', 'Investigational Metabolic Candidates'),
    'Tesamorelin': ('growth-factors', 'Growth Factor & Secretagogue Biology'),
    'AOD 9604': ('metabolic-candidates', 'Investigational Metabolic Candidates'),
    '5-amino-1mq': ('metabolic-candidates', 'Investigational Metabolic Candidates'),
    'SLU-PP-332': ('metabolic-candidates', 'Investigational Metabolic Candidates'),
    'AICAR': ('cellular-energy', 'Cellular Energy & Mitochondrial Biology'),
    'L-Carn itine': ('cellular-energy', 'Cellular Energy & Mitochondrial Biology'),
    'MIC Lipo-c+B12': ('metabolic-candidates', 'Investigational Metabolic Candidates'),
    'Adipotide': ('metabolic-candidates', 'Investigational Metabolic Candidates'),
    'Cagrilintide 5mg+Semaglutide 5mg': ('metabolic-candidates', 'Investigational Metabolic Candidates'),
    'HGH 191AA': ('growth-factors', 'Growth Factor & Secretagogue Biology'),
    'CJC 1295 DAC': ('growth-factors', 'Growth Factor & Secretagogue Biology'),
    'CJC-1295 NO DAC 5mg+IPA5mg': ('growth-factors', 'Growth Factor & Secretagogue Biology'),
    'Ipamorelin': ('growth-factors', 'Growth Factor & Secretagogue Biology'),
    'GHRP-2': ('growth-factors', 'Growth Factor & Secretagogue Biology'),
    'GHRP-6': ('growth-factors', 'Growth Factor & Secretagogue Biology'),
    'Hexarelin': ('growth-factors', 'Growth Factor & Secretagogue Biology'),
    'Sermorelin Acetate': ('growth-factors', 'Growth Factor & Secretagogue Biology'),
    'IGF-1 LR3': ('growth-factors', 'Growth Factor & Secretagogue Biology'),
    'MGF': ('growth-factors', 'Growth Factor & Secretagogue Biology'),
    'PEG-MGF': ('growth-factors', 'Growth Factor & Secretagogue Biology'),
    'HGH Fragment 176-191': ('growth-factors', 'Growth Factor & Secretagogue Biology'),
    'GHK-CU': ('cosmetic-research', 'Cosmetic & Dermatological Science'),
    'AHK-CU': ('cosmetic-research', 'Cosmetic & Dermatological Science'),
    'SNAP-8': ('cosmetic-research', 'Cosmetic & Dermatological Science'),
    'Glutathione': ('cosmetic-research', 'Cosmetic & Dermatological Science'),
    'LemonBottle': ('cosmetic-research', 'Cosmetic & Dermatological Science'),
    'Botox': ('cosmetic-research', 'Cosmetic & Dermatological Science'),
    'BPC 157': ('tissue-repair', 'Tissue Repair & Cellular Integrity'),
    'TB 500(Thymosin B4 AceTate)': ('tissue-repair', 'Tissue Repair & Cellular Integrity'),
    'KPV': ('tissue-repair', 'Tissue Repair & Cellular Integrity'),
    'Thymosin Alpha-1': ('tissue-repair', 'Tissue Repair & Cellular Integrity'),
    'Thymalin': ('tissue-repair', 'Tissue Repair & Cellular Integrity'),
    'LL37': ('tissue-repair', 'Tissue Repair & Cellular Integrity'),
    'Ara-290': ('tissue-repair', 'Tissue Repair & Cellular Integrity'),
    'VIP': ('tissue-repair', 'Tissue Repair & Cellular Integrity'),
    'SS-31': ('cellular-energy', 'Cellular Energy & Mitochondrial Biology'),
    'Selank': ('neurobiology', 'Neurobiology & Cognitive Research'),
    'Semax': ('neurobiology', 'Neurobiology & Cognitive Research'),
    'DSIP': ('neurobiology', 'Neurobiology & Cognitive Research'),
    'FOXO4 DRI': ('cellular-energy', 'Cellular Energy & Mitochondrial Biology'),
    'Dermorphin': ('neurobiology', 'Neurobiology & Cognitive Research'),
    'Melatonin': ('neurobiology', 'Neurobiology & Cognitive Research'),
    'Melanotan 2': ('cosmetic-research', 'Cosmetic & Dermatological Science'),
    'Melanotan 1 (MT-1)': ('cosmetic-research', 'Cosmetic & Dermatological Science'),
    'Melanotan II': ('cosmetic-research', 'Cosmetic & Dermatological Science'),
    'Melanotan I': ('cosmetic-research', 'Cosmetic & Dermatological Science'),
    'PT 141': ('neurobiology', 'Neurobiology & Cognitive Research'),
    'KISSPEPTIN-10 (fragment)': ('growth-factors', 'Growth Factor & Secretagogue Biology'),
    'HCG': ('growth-factors', 'Growth Factor & Secretagogue Biology'),
    'HMG': ('growth-factors', 'Growth Factor & Secretagogue Biology'),
    'Gonadorrlin Acetate': ('growth-factors', 'Growth Factor & Secretagogue Biology'),
    'Oxytocin Acetate': ('neurobiology', 'Neurobiology & Cognitive Research'),
    'MOTS-C': ('cellular-energy', 'Cellular Energy & Mitochondrial Biology'),
    'NAD+ (5ML)': ('cellular-energy', 'Cellular Energy & Mitochondrial Biology'),
    'NAD+ (10ML)': ('cellular-energy', 'Cellular Energy & Mitochondrial Biology'),
    'Bac water': ('blends-diluents', 'Research Blends & Laboratory Diluents'),
    'B-12': ('cellular-energy', 'Cellular Energy & Mitochondrial Biology'),
    'XT100u': ('blends-diluents', 'Research Blends & Laboratory Diluents')
}

# Group items by product name to build sibling variants list
prod_variants_map = {}
for idx, r in enumerate(excel_rows):
    prod_name = r['product_name']
    sku = r['col_C_item']
    spec = r['col_D_spec']
    usd_kit = float(r['col_E_retail_price']) if r['col_E_retail_price'] else 0.0
    inr_vial = int(r['col_G_sell_price_vial_inr']) if r['col_G_sell_price_vial_inr'] else 0
    
    # Check vial count
    vials_count = 10
    if spec in ['3ml', '10ml'] and 'Bac water' in prod_name:
        vials_count = 1
    
    usdVial = round(usd_kit / vials_count, 2)
    
    v_obj = {
        'row': idx + 1,
        'sku': sku,
        'label': spec,
        'specification': spec,
        'vialsPerKit': vials_count,
        'supplierPrice': usd_kit,
        'priceUsd': usdVial,
        'priceInr': inr_vial,
        'price': inr_vial, # default price number
        'priceFormattedInr': f"₹{inr_vial:,} / vial",
        'priceFormattedUsd': f"${usdVial:.2f} / vial",
        'batchNumber': f"MW-{sku}-CERT",
        'inStock': True
    }
    
    if prod_name not in prod_variants_map:
        prod_variants_map[prod_name] = []
    prod_variants_map[prod_name].append(v_obj)

# Now build the 151 product objects
final_products = []

for idx, r in enumerate(excel_rows):
    row_num = idx + 1
    prod_name = r['product_name']
    sku = r['col_C_item']
    spec = r['col_D_spec']
    usd_kit = float(r['col_E_retail_price']) if r['col_E_retail_price'] else 0.0
    inr_vial = int(r['col_G_sell_price_vial_inr']) if r['col_G_sell_price_vial_inr'] else 0
    
    vials_count = 10
    if spec in ['3ml', '10ml'] and 'Bac water' in prod_name:
        vials_count = 1
        
    usdVial = round(usd_kit / vials_count, 2)
    
    # Clean slug
    clean_name = re.sub(r'[^a-z0-9]+', '-', prod_name.lower()).strip('-')
    clean_sku = re.sub(r'[^a-z0-9]+', '-', sku.lower()).strip('-')
    clean_spec = re.sub(r'[^a-z0-9]+', '-', spec.lower()).strip('-')
    
    # Unique slug incorporating sku
    slug = f"{clean_name}-{clean_sku}"
    # If slug duplicate exists, add row
    existing_slugs = [p['slug'] for p in final_products]
    if slug in existing_slugs:
        slug = f"{slug}-{row_num}"
    
    # Get category
    cat_slug, cat_title = cat_map.get(prod_name, ('blends-diluents', 'Research Blends & Laboratory Diluents'))
    
    # Find all variants for this product
    all_vars = prod_variants_map[prod_name]
    # Put the current variant first
    cur_var = [v for v in all_vars if v['row'] == row_num][0]
    other_vars = [v for v in all_vars if v['row'] != row_num]
    ordered_vars = [cur_var] + other_vars
    
    # Clean description based on sheet data
    short_desc = f"{prod_name} analytical research compound ({spec}). High-performance liquid chromatography purity ≥98.0%. For laboratory research use only."
    
    product_obj = {
        "row": row_num,
        "slug": slug,
        "name": prod_name,
        "itemCode": sku,
        "primarySku": sku,
        "specification": spec,
        "category": cat_slug,
        "categoryName": cat_title,
        "purity": "≥98.0% (HPLC)",
        "shortDescription": short_desc,
        "vialsPerKit": vials_count,
        "retailPriceUsd": usd_kit,
        "priceUsd": usdVial,
        "priceInr": inr_vial,
        "price": inr_vial,
        "priceFormattedInr": f"₹{inr_vial:,} / vial",
        "priceFormattedUsd": f"${usdVial:.2f} / vial",
        "inStock": True,
        "featured": row_num <= 8,
        "variants": ordered_vars,
        "coaUrl": f"/coa/samples/COA_{sku}.pdf"
    }
    
    final_products.append(product_obj)

print(f"Constructed {len(final_products)} products.")
print("Sample product #1:", json.dumps(final_products[0], indent=2))
print("Sample product #151:", json.dumps(final_products[-1], indent=2))

# Save to scratch/new_products.json
with open('C:/Users/Aditya/.gemini/antigravity/scratch/new_products.json', 'w', encoding='utf-8') as f:
    json.dump(final_products, f, ensure_ascii=False, indent=2)

print("Saved scratch/new_products.json successfully.")

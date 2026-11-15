import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open(r'C:\Users\Aditya\.gemini\antigravity\scratch\react-app\scripts\coa_packs_analyzed.json', encoding='utf-8') as f:
    data = json.load(f)

for p in data:
    print('-----------------------------------------')
    print(f"Pack #{p['pack_id']}: {p['sample_name']}")
    print(f"  Pages:        {p['page_range']}")
    print(f"  Batch:        {p['batch_number']}")
    print(f"  Strength:     {p['strength']}")
    print(f"  Match:        {p['matched_product']['name']} ({p['matched_product']['id']})")
    print(f"  Variants:     {p['matched_product']['variants']}")
    print(f"  Labs:         {p['labs']}")
    print(f"  Dates:        {p['dates']}")
    print(f"  Submitter:    {p['submitter_info']}")
    print(f"  Privacy:      {len(p['privacy_findings'])} items")
    for pf in p['privacy_findings'][:5]:
        print(f"    * {pf}")

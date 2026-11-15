import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

# PDF OCR lines from the prompt
pdf_ocr_text = """
1 Tirzepatide TR5 5mg/vial*10 vials $31.25 ■3,999
2 Tirzepatide TR10 10mg/vial*10 vials $49.11 ■7,249
3 Tirzepatide TR15 15mg/vial*10 vials $62.50 ■9,749
4 Tirzepatide TR20 20mg/vial*10 vials $75.89 ■11,999
5 Tirzepatide TR30 30mg/vial*10 vials $98.21 ■15,499
6 Tirzepatide TR40 40mg/vial*10 vials $138.39 ■18,999
7 Tirzepatide TR50 50mg/vial*10 vials $160.71 ■22,999
8 Tirzepatide TR60 60mg/vial*10 vials $174.11 ■25,499
9 Retatrutide RT5 5mg/vial*10 vials $35.71 ■3,999
10 Retatrutide RT10 10mg/vial*10 vials $53.57 ■5,499
11 Retatrutide RT15 15mg/vial*10 vials $75.89 ■7,499
12 Retatrutide RT20 20mg/vial*10 vials $93.75 ■8,999
13 Retatrutide RT30 30mg/vial*10 vials $142.86 ■12,499
14 Retatrutide RT40 40mg/vial*10 vials $191.96 ■15,999
15 Retatrutide RT50 50mg/vial*10 vials $227.68 ■18,499
16 Retatrutide RT60 60mg/vial*10 vials $263.39 ■21,499
17 GHK-CU CU50 50mg/vial*10 vials $22.32 ■3,999
18 GHK-CU CU100 100mg/vial*10 vials $31.25 ■5,749
19 AHK-CU AU50 50mg/vial*10 vials $44.64 ■4,999
20 AHK-CU AU100 100mg/vial*10 vials $75.89 ■7,499
21 Semaglutide SM5 5mg/vial*10 vials $31.25 ■3,499
22 Semaglutide SM10 10mg/vial*10 vials $44.64 ■5,249
23 Semaglutide SM15 15mg/vial*10 vials $66.96 ■6,499
24 Semaglutide SM20 20mg/vial*10 vials $75.89 ■8,249
25 Semaglutide SM30 30mg/vial*10 vials $89.29 ■10,999
26 Semaglutide SM40 40mg/vial*10 vials $142.86 ■13,999
27 Semaglutide SM50 50mg/vial*10 vials $169.64 ■16,999
28 Cagrilintide CGL5 5mg/vial*10 vials $66.96 ■5,749
29 Cagrilintide CGL10 10mg/vial*10 vials $116.07 ■8,749
30 Tesamorelin TSM2 2mg/vial*10 vials $53.57 ■4,499
31 Tesamorelin TSM5 5mg/vial*10 vials $89.29 ■5,499
32 Tesamorelin TSM10 10mg/vial*10 vials $160.71 ■9,249
33 Tesamorelin TSM20 20mg/vial*10 vials $308.04 ■16,999
34 MOTS-C MS5 5mg/vial*10 vials $49.11 ■4,499
35 MOTS-C MS10 10mg/vial*10 vials $80.36 ■6,499
36 MOTS-C MS20 20mg/vial*10 vials $138.39 ■10,999
37 MOTS-C MS30 30mg/vial*10 vials $183.04 ■14,499
38 MOTS-C MS40 40mg/vial*10 vials $258.93 ■18,499
39 AOD 9604 2AD 2mg/vial*10 vials $66.96 ■2,749
40 AOD 9604 5AD 5mg/vial*10 vials $80.36 ■3,249
41 AOD 9604 10AD 10mg/vial*10 vials $142.86 ■5,749
42 NAD+ (5ML) NJ100 100mg/vial*10 vials $44.64 ■1,749
43 NAD+ (5ML) NJ500 500mg/vial*10 vials $58.04 ■2,249
44 NAD+ (10ML) NJ1000 1000mg/vial*10 vials $84.82 ■3,249
45 BPC 157 BC2 2mg/vial*10 vials $26.79 ■2,999
46 BPC 157 BC5 5mg/vial*10 vials $42.41 ■3,499
47 BPC 157 BC10 10mg/vial*10 vials $66.96 ■4,499
48 TB 500(Thymosin B4 AceTate) BT2 2mg/vial*10 vials $42.41 ■3,249
49 TB 500(Thymosin B4 AceTate) BT5 5mg/vial*10 vials $89.29 ■3,999
50 TB 500(Thymosin B4 AceTate) BT10 10mg/vial*10 vials $147.32 ■4,999
51 CJC 1295 DAC CD2 2mg/vial*10 vials $44.64 ■1,499
52 CJC 1295 DAC CD5 5mg/vial*10 vials $89.29 ■2,999
53 CJC 1295 DAC CD10 10mg/vial*10 vials $160.71 ■5,249
54 CJC 1295 DAC CND2 2mg/vial*10 vials $44.64 ■1,499
55 CJC 1295 DAC CND5 5mg/vial*10 vials $89.29 ■2,999
56 CJC 1295 DAC CND10 10mg/vial*10 vials $160.71 ■5,249
57 Blend: BPC157 5mg + TB500 5mg BB10 (5mg+5mg)/vial*10 vials $107.14 ■4,749
58 Blend: BPC157 10mg + TB500 10mg BB20 (10mg+10mg)/vial*10 vials $191.96 ■8,499
59 CJC-1295 NO DAC 5mg+IPA5mg CP10 10 mg/vial■10vial/kit $116.07 ■6,249
60 Blend: BPC 157 10mg + TB500 10mg+ GHK-CU 50mg BBG70 (10mg+10mg+50mg)/vial*10vials $209.82 ■7,499
61 Blend: BPC 157 10mg + TB500 10mg+ GHK-CU 50mg+kpv10mg GLOW (10mg+10mg+50mg+10mg)/vial*10vials $200.89 ■7,499
62 Blend: BPC 157 10mg + TB500 10mg+ GHK-CU 50mg+kpv10mg KLOW (10mg+10mg+50mg+10mg)/vial*10vials $245.54 ■9,749
63 Selank SK2 2mg/vial*10 vials $26.79 ■3,249
64 Selank SK5 5mg/vial*10 vials $40.18 ■4,249
65 Selank SK10 10mg/vial*10 vials $62.50 ■5,499
66 Semax XA5 5mg/vial*10 vials $40.18 ■3,999
67 Semax XA10 10mg/vial*10 vials $62.50 ■4,999
68 Epithalon ET10 10mg/vial*10 vials $49.11 ■1,999
69 Epithalon ET20 10mg/vial*10 vials $98.21 ■3,749
70 Epithalon ET50 50mg/vial*10 vials $169.64 ■6,249
71 Epithalon ET100 100mg/vial*10 vials $294.64 ■10,999
72 PT 141 P141 10mg/vial*10 vials $71.43 ■5,499
73 Ipamorelin IP2 2mg/vial*10 vials $26.79 ■3,249
74 Ipamorelin IP5 5mg/vial*10 vials $40.18 ■4,749
75 Ipamorelin IP10 10mg/vial*10 vials $66.96 ■6,249
76 DSIP DS2 2mg/vial*10 vials $29.02 ■999
77 DSIP DS5 5mg/vial*10 vials $44.64 ■1,499
78 DSIP DS10 10mg/vial*10 vials $71.43 ■2,499
79 Melanotan 2 ML10 10mg/vial*10 vials $75.89 ■2,499
80 Melanotan 1 (MT-1) MT1 10mg/vial*10 vials $62.50 ■2,249
81 SS-31 2S10 10mg/vial*10 vials $93.75 ■3,499
82 SS-31 2S50 50mg/vial*10 vials $357.14 ■13,499
83 Melatonin MT10 10mg/vial*10 vials $93.75 ■3,249
84 Melanotan II ML10 10mg/vial*10 vials $84.82 ■2,999
85 Melanotan I MT1 10mg/vial*10 vials $66.96 ■2,249
86 KPV KP10 10mg/vial*10 vials $58.04 ■4,999
87 Glutathione GTT 600mg/vial*10 vials $44.64 ■1,749
88 Glutathione GTT 1500mg/vial*10 vials $66.96 ■2,499
89 B-12 B12 10mg*10vials $40.18 ■1,499
90 LemonBottle LB10■■■ 10ml*10vials $53.57 ■2,249
91 MIC Lipo-c+B12 LC216 10mg*10vials $80.36 ■3,249
92 L-Carn itine LC600 10 mg/vial■10vial/kit $80.36 ■3,249
93 Bac water BAC3 3ml $4.46 ■1,499
94 Bac water BAC10 10ml $6.25 ■1,999
95 Bac water WAC3 3ml $4.46 ■1,499
96 Bac water WAC10 10ml $6.25 ■1,999
97 5-amino-1mq 5AM 5mg/vial*10 vials $40.18 ■3,249
98 5-amino-1mq 10AM 10mg/vial*10 vials $62.50 ■4,249
99 5-amino-1mq 50AM 50mg/vial*10 vials $116.07 ■6,249
100 HGH 191AA H10 10iu*10vials $89.29 ■5,749
101 HGH 191AA H12 12iu*10vials $102.68 ■6,499
102 HGH 191AA H15 15iu*10vials $116.07 ■7,499
103 HGH 191AA H24 24iu*10vials $169.64 ■10,999
104 HGH 191AA H36 36iu*10vials $250.00 ■14,999
105 SLU-PP-332 332 5mg/vial*10 vials $49.11 ■1,999
106 SLU-PP-332 332 10mg/vial*10 vials $58.04 ■2,499
107 IGF-1 LR3 IG01 0.1mg/vial*10 vials $44.64 ■3,999
108 IGF-1 LR3 IG1 1mg/vial*10 vials $263.39 ■8,499
109 GHRP-2 G25 5mg/vial*10 vials $133.93 ■4,499
110 GHRP-2 G210 10mg/vial*10 vials $133.93 ■4,499
111 GHRP-2 G215 15mg/vial*10 vials $133.93 ■4,499
112 GHRP-6 G65 5mg/vial*10 vials $40.18 ■1,499
113 GHRP-6 G610 10mg/vial*10 vials $62.50 ■2,249
114 AICAR AR50 50mg/vial*10 vials $133.93 ■4,499
115 HCG HC1000 1000iu/vial*10 vials $49.11 ■1,749
116 HCG HC2000 2000iu/vial*10 vials $80.36 ■2,749
117 HCG HC5000 5000iu/vial*10 vials $116.07 ■3,999
118 HCG HC10000 10000iu/vial*10 vials $142.86 ■4,749
119 HMG HM75 75iu/vial*10 vials $133.93 ■4,499
120 Botox 100U 100u/vial*10 vials $125.00 ■4,249
121 Botox 150U 150u/vial*10 vials $178.57 ■5,999
122 Botox 200U 200u/vial*10 vials $236.61 ■7,749
123 XT100u 100iu 100u/vial*10 vials $89.29 ■2,999
124 KISSPEPTIN-10 (fragment) KS5 5mg/vial*10 vials $62.50 ■4,249
125 KISSPEPTIN-10 (fragment) KS10 10mg/vial*10 vials $107.14 ■5,749
126 Thymosin Alpha-1 TA5 5mg/vial*10 vials $133.93 ■4,999
127 Thymosin Alpha-1 TA10 10mg/vial*10 vials $133.93 ■4,999
128 Thymosin Alpha-1 TA50 50mg/vial*10 vials $133.93 ■4,999
129 Hexarelin HX2 2mg/vial*10 vials $71.43 ■2,499
130 Hexarelin HX5 5mg/vial*10 vials $142.86 ■4,749
131 Hexarelin HX10 10mg/vial*10 vials $258.93 ■8,499
132 Adipotide AP2 2mg/vial*10 vials $125.00 ■4,999
133 Adipotide AP5 5mg/vial*10 vials $250.00 ■9,999
134 Sermorelin Acetate SMO-5 5mg/vial*10 vials $111.61 ■3,749
135 Sermorelin Acetate SMO-10 10mg/vial*10 vials $178.57 ■5,999
136 SNAP-8 NP810 10mg/vial*10 vials $53.57 ■1,999
137 Thymalin TY10 10mg/vial*10 vials $133.93 ■4,999
138 FOXO4 DRI F410 10mg/vial*10 vials $133.93 ■4,999
139 LL37 375 5mg/vial*10 vials $133.93 ■4,999
140 Survodutide SUR10 10mg/vial*10 vials $133.93 ■5,249
141 Ara-290 RA10 10mg/vial*10 vials $80.36 ■2,999
142 Dermorphin DR5 5mg/vial*10 vials $133.93 ■4,499
143 VIP VP10 10mg/vial*10 vials $133.93 ■4,499
144 Cagrilintide 5mg+Semaglutide 5mg CS10 (5mg+5mg)/vial*10 vials $133.93 ■5,249
145 Gonadorrlin Acetate GND2 2mg/vial*10 vials $133.93 ■4,499
146 Oxytocin Acetate OT2 2mg/vial*10 vials $40.18 ■1,499
147 Oxytocin Acetate OT5 5mg/vial*10 vials $58.04 ■1,999
148 Oxytocin Acetate OT10 10mg/vial*10 vials $116.07 ■3,999
149 HGH Fragment 176-191 FR5 5mg/vial*10 vials $133.93 ■4,499
150 MGF FM2 2mg/vial*10 vials $133.93 ■4,499
151 PEG-MGF FMP2 2mg/vial*10 vials $133.93 ■4,499
"""

pdf_lines = [l.strip() for l in pdf_ocr_text.strip().split('\n') if l.strip()]
print(f"Total PDF lines in OCR: {len(pdf_lines)}")

with open('C:/Users/Aditya/.gemini/antigravity/scratch/excel_full_rows.json', 'r', encoding='utf-8') as f:
    excel_rows = json.load(f)

# Compare PDF line by line with Excel
for i in range(max(len(pdf_lines), len(excel_rows))):
    p_line = pdf_lines[i] if i < len(pdf_lines) else "NONE"
    e_row = excel_rows[i] if i < len(excel_rows) else {}
    
    # Extract SKU from PDF line
    # e.g. "1 Tirzepatide TR5 5mg/vial*10 vials $31.25 ■3,999"
    parts = p_line.split()
    pdf_num = parts[0]
    e_num = e_row.get('no', '')
    e_sku = e_row.get('item_code', '')
    e_prod = e_row.get('product', '')
    
    if e_sku not in p_line:
        print(f"Mismatch at index {i}:")
        print(f"  PDF: {p_line}")
        print(f"  Excel: row {e_row.get('row')}, no {e_num}, prod {e_prod}, sku {e_sku}")
        break

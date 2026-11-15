import json

with open('src/data/products.json', encoding='utf-8') as f:
    products = json.load(f)

print(f"Total products: {len(products)}")
for p in products:
    variants = [f"{v.get('label')} ({v.get('sku')})" for v in p.get('variants', [])]
    print(f"ID: {p.get('id')} | Name: {p.get('name')} | Cat: {p.get('category')} | Variants: {variants}")

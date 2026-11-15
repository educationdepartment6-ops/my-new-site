import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

search_roots = [
    'C:/Users/Aditya/Downloads',
    'C:/Users/Aditya/Desktop',
    'C:/Users/Aditya/Documents',
    'C:/Users/Aditya/.gemini/antigravity/scratch',
    'C:/Users/Aditya/.gemini/antigravity/brain'
]

image_exts = {'.png', '.jpg', '.jpeg', '.webp', '.svg'}

found_dirs = set()
for root_dir in search_roots:
    if not os.path.exists(root_dir):
        continue
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Check if dir is named images or has images
        imgs = [f for f in filenames if os.path.splitext(f)[1].lower() in image_exts]
        if 'image' in os.path.basename(dirpath).lower() or len(imgs) > 5:
            found_dirs.add((dirpath, len(imgs)))

print("Candidate image directories found:")
for d, count in sorted(found_dirs):
    print(f"  {d} ({count} images)")

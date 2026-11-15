import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
downloads = 'C:/Users/Aditya/Downloads'
image_exts = {'.png', '.jpg', '.jpeg', '.webp'}

for root, dirs, files in os.walk(downloads):
    for f in files:
        if os.path.splitext(f)[1].lower() in image_exts:
            full = os.path.join(root, f)
            print(full)

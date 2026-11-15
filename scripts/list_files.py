import os
import sys
import glob
import zipfile
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')

downloads = 'C:/Users/Aditya/Downloads'
for f in os.listdir(downloads):
    if 'Selling_Price' in f or 'Price' in f or 'Peptide' in f:
        print("Found:", repr(f))

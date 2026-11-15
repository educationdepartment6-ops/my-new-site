import zipfile
import xml.etree.ElementTree as ET

file_path = 'C:/Users/Aditya/Downloads/零售价_Simple_1Vial_Selling_Price.xlsx'

with zipfile.ZipFile(file_path, 'r') as z:
    sheet_xml = z.read('xl/worksheets/sheet1.xml').decode('utf-8')
    # Print the first 3000 chars of sheet1.xml
    print(sheet_xml[:3000])

    if 'xl/sharedStrings.xml' in z.namelist():
        ss_xml = z.read('xl/sharedStrings.xml').decode('utf-8')
        print("Shared strings length:", len(ss_xml))
        print("First 2000 chars of sharedStrings:")
        print(ss_xml[:2000])

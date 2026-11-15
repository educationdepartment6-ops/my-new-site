import zipfile
import sys

sys.stdout.reconfigure(encoding='utf-8')
file_path = 'C:/Users/Aditya/Downloads/零售价_Simple_1Vial_Selling_Price.xlsx'

with zipfile.ZipFile(file_path, 'r') as z:
    xml = z.read('xl/worksheets/sheet1.xml').decode('utf-8')
    start_str = '<row r="85"'
    idx = xml.find(start_str)
    print(xml[idx:idx+3000])

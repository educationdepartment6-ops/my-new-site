const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'C:/Users/Aditya/Downloads/Peptide_Selling_Price_Catalogue.pdf';
const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function(data) {
  fs.writeFileSync('C:/Users/Aditya/.gemini/antigravity/scratch/pdf_text.txt', data.text);
  console.log("Extracted PDF text length:", data.text.length);
  
  // Find lines starting with numbers
  const lines = data.text.split('\n');
  const tableRows = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^\d+\s+[A-Za-z]/.test(trimmed)) {
      tableRows.push(trimmed);
    }
  }
  console.log("Found table rows in PDF:", tableRows.length);
  fs.writeFileSync('C:/Users/Aditya/.gemini/antigravity/scratch/pdf_table_rows.json', JSON.stringify(tableRows, null, 2));
}).catch(console.error);

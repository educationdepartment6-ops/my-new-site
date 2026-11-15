const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAdmin } = require('../auth');
const db = require('../db');

const router = express.Router();

const publicCoaDir = path.join(__dirname, '..', '..', 'public', 'coa');
const serverCoaDir = path.join(__dirname, '..', 'uploads', 'coa');
if (!fs.existsSync(publicCoaDir)) fs.mkdirSync(publicCoaDir, { recursive: true });
if (!fs.existsSync(serverCoaDir)) fs.mkdirSync(serverCoaDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, publicCoaDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `COA_${cleanBase}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit as required
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are supported (maximum 10MB)'));
    }
  }
});

// Sync updated records back to src/data/coa_records.json for static builds
function syncJsonFile() {
  try {
    const records = db.getAllCOARecords();
    const filePath = path.join(__dirname, '..', '..', 'src', 'data', 'coa_records.json');
    fs.writeFileSync(filePath, JSON.stringify(records, null, 2), 'utf8');
  } catch (err) {
    console.error('[COA] Error syncing JSON file:', err);
  }
}

// Public: List visible COAs
router.get('/public-list', (req, res) => {
  try {
    const records = db.getAllCOARecords().filter((r) => r.is_visible === 1 && r.in_catalog === 1);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all COA records
router.get('/', requireAdmin, (req, res) => {
  try {
    const records = db.getAllCOARecords();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Upload / Create COA Record
router.post('/upload', requireAdmin, upload.single('pdf'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please select a valid PDF file (<10 MB)' });
    }

    const { productId, productName, category, strength, batchNumber, testDate, lab } = req.body || {};
    if (!productName || !strength || !batchNumber) {
      return res.status(400).json({ error: 'Product name, strength, and batch number are required.' });
    }

    // Also mirror to server/uploads/coa
    const srvCopy = path.join(serverCoaDir, req.file.filename);
    try {
      fs.copyFileSync(req.file.path, srvCopy);
    } catch (_) {}

    const distDir = path.join(__dirname, '..', '..', 'dist', 'coa');
    if (fs.existsSync(distDir)) {
      try {
        fs.copyFileSync(req.file.path, path.join(distDir, req.file.filename));
      } catch (_) {}
    }

    const id = `coa_${Date.now()}`;
    const pdfUrl = `/coa/${req.file.filename}`;
    const fileSize = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`;

    const newRecord = db.createCOARecord({
      id,
      productId: productId || null,
      productName: productName.trim(),
      category: category || 'general',
      strength: strength.trim(),
      batchNumber: batchNumber.trim(),
      testDate: testDate ? testDate.trim() : new Date().toISOString().split('T')[0],
      lab: lab ? lab.trim() : 'BioAnalytical Solutions & Eurofins Slovakia',
      pdfUrl,
      fileSize,
      pageCount: 1,
      isVisible: 1,
      inCatalog: 1
    });

    db.logActivity(
      req.admin.email,
      'COA_UPLOAD',
      `Uploaded COA for '${productName}' (${strength}, Batch ${batchNumber}, ${fileSize})`
    );

    syncJsonFile();
    res.status(201).json({ success: true, record: newRecord });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}, (err, req, res, next) => {
  res.status(400).json({ error: err.message || 'File upload error' });
});

// Admin: Update COA Record
router.put('/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { batchNumber, testDate, strength, isVisible, lab } = req.body || {};

  try {
    const updated = db.updateCOARecord(id, {
      batchNumber,
      testDate,
      strength,
      isVisible: isVisible !== undefined ? (isVisible ? 1 : 0) : undefined,
      lab
    });

    db.logActivity(
      req.admin.email,
      'COA_UPDATE',
      `Updated COA record '${id}' (Batch: ${updated.batch_number}, Visible: ${updated.is_visible})`
    );

    syncJsonFile();
    res.json({ success: true, record: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete COA Record
router.delete('/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  try {
    const existing = db.getCOARecordById(id);
    if (!existing) {
      return res.status(404).json({ error: 'COA record not found' });
    }

    db.deleteCOARecord(id);
    db.logActivity(
      req.admin.email,
      'COA_DELETE',
      `Deleted COA record '${id}' (${existing.product_name}, Batch ${existing.batch_number})`
    );

    syncJsonFile();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

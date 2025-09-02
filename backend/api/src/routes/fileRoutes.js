const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { uploadToAzureBlob } = require('../utils/azureBlob');
const File = require('../models/File');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Create file or folder
router.post('/', auth, fileController.createFile);
// Get all files/folders (optionally by parentId)
router.get('/', auth, fileController.getFiles);
// Get a single file/folder by id
router.get('/:id', auth, fileController.getFileById);
// Update file/folder metadata
router.put('/:id', auth, fileController.updateFile);
// Delete file/folder
router.delete('/:id', auth, fileController.deleteFile);
// Upload file to Azure Blob and save metadata
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = await uploadToAzureBlob(req.file);
    let { parentId, tags } = req.body;
    // Convert parentId to ObjectId if valid, else set to null
    if (parentId && mongoose.Types.ObjectId.isValid(parentId)) {
      parentId = new mongoose.Types.ObjectId(parentId);
    } else {
      parentId = null;
    }
    const fileDoc = new File({
      name: req.file.originalname,
      type: 'file',
      mimeType: req.file.mimetype,
      size: req.file.size,
      owner: req.user.id,
      parentId,
      tags: tags ? tags.split(',') : [],
      azureBlobUrl: url
    });
    await fileDoc.save();
    res.status(201).json(fileDoc);
  } catch (err) {
    console.error('File upload error:', err); // Log full error
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});
// Update share settings
router.put('/:id/share', auth, fileController.updateShareSettings);
// Public access to shared file
router.get('/shared/:id', fileController.getSharedFile);

module.exports = router;

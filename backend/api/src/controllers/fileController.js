const File = require('../models/File');
const { deleteFromAzureBlob } = require('../utils/azureBlob');

// Create file or folder
exports.createFile = async (req, res) => {
  try {
    const file = new File({ ...req.body, owner: req.user.id });
    await file.save();
    res.status(201).json(file);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all files/folders (optionally by parentId)
exports.getFiles = async (req, res) => {
  try {
    const { parentId } = req.query;
    const query = { owner: req.user.id };
    if (parentId !== undefined) query.parentId = parentId;
    const files = await File.find(query);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single file/folder by id
exports.getFileById = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });
    res.json(file);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update file/folder metadata
exports.updateFile = async (req, res) => {
  try {
    const file = await File.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!file) return res.status(404).json({ error: 'File not found' });
    res.json(file);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete file/folder
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });
    // Delete from Azure Blob Storage if applicable
    if (file.azureBlobUrl) {
      await deleteFromAzureBlob(file.azureBlobUrl);
    }
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update file/folder share settings
exports.updateShareSettings = async (req, res) => {
  try {
    const file = await File.findByIdAndUpdate(
      req.params.id,
      { shareSettings: req.body.shareSettings, isShared: req.body.shareSettings?.isPublic || false },
      { new: true }
    );
    if (!file) return res.status(404).json({ error: 'File not found' });
    res.json(file);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Public endpoint to get a shared file by ID
exports.getSharedFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    console.log('[getSharedFile] File:', file ? 'found' : 'not found', 'ID:', req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });
    console.log('[getSharedFile] isPublic:', file.shareSettings?.isPublic, 'requireSignIn:', file.shareSettings?.requireSignIn);
    if (!file.shareSettings?.isPublic) return res.status(403).json({ error: 'File is not shared publicly' });

    // Enforce requireSignIn if set
    if (file.shareSettings.requireSignIn) {
      const authHeader = req.headers.authorization;
      console.log('[getSharedFile] requireSignIn: true, authHeader:', !!authHeader);
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      // Optionally, verify the token here if you want to check validity
    }

    res.json(file);
  } catch (err) {
    console.error('[getSharedFile] Error:', err);
    res.status(500).json({ error: err.message });
  }
};

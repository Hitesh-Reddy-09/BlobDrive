const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get current user's profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ _id: user._id, username: user.username, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update current user's profile
router.put('/', auth, async (req, res) => {
  try {
    const updates = {};
    if (req.body.username) updates.username = req.body.username;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.password) updates.password = req.body.password;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (updates.username) user.username = updates.username;
    if (updates.email) user.email = updates.email;
    if (updates.password) user.password = updates.password;
    await user.save();
    res.json({ _id: user._id, username: user.username, email: user.email });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

// routes/user.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authenticateToken = require('../middleware/auth');
const User = require('../models/User');

// GET /api/users/search - Recherche d'utilisateurs par username (commence par le terme de recherche)
router.get('/search', authenticateToken, async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ message: 'La recherche doit contenir un terme.' });
  }

  try {
    const users = await User.find({
      username: { $regex: `^${query}`, $options: 'i' }
    }).select('username');
    
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la recherche d\'utilisateurs.' });
  }
});

module.exports = router;

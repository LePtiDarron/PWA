const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', async (req, res) => {
  const { email, firstname, lastname } = req.body;

  if (!email || !firstname || !lastname) {
    console.error("Missing fields");
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const user = await User.create({ email, firstname, lastname });
    return res.status(201).json(user);
  } catch (err) {
    console.error("error: ", err.message);
    return res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
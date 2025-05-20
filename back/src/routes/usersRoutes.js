const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', async (req, res) => {
  console.log('----------------------------------------');
  const { email, firstname, lastname } = req.body;

  if (!email || !firstname || !lastname) {
    console.log("Missing fields");
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const user = await User.create({ email, firstname, lastname });
    console.log("Created !");
    return res.status(201).json(user);
  } catch (err) {
    console.log("error: ", err.message);
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
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    maxlength: 100,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // Ajoute createdAt et updatedAt automatiquement
});

module.exports = mongoose.model('User', userSchema);

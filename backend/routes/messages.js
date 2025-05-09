// routes/messages.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// GET /api/messages/:conversationId - Récupérer les messages d'une conversation
router.get('/:conversationId', authenticateToken, async (req, res) => {
  const { conversationId } = req.params;

  try {
    const user = await User.findById(req.user.id).select('username');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const conversation = await Conversation.findById(conversationId).populate('participants canInvite', 'username email');
    if (!conversation) {
      console.error('Conversation non trouvée');
      return res.status(404).json({ message: 'Not found' });
    }

    const isParticipant = conversation.participants.some(participant => participant._id.toString() === req.user.id.toString());
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const messages = await Message.find({ conversationId }).populate('senderId', 'username');

    const messagesWithUsername = messages.map(msg => ({
      ...msg.toObject(),
      username: msg.senderId?.username || 'Unknown',
    }));

    const participants = conversation.participants.map(user => ({
      username: user.username,
      email: user.email,
    }));

    const canInvite = conversation.canInvite.map(user => ({
      username: user.username,
      email: user.email,
    }));

    res.status(200).json({
      canInvite: canInvite,
      participants: participants,
      conversation: conversation.name,
      messages: messagesWithUsername,
    });
  } catch (err) {
    console.error('Erreur GET /api/messages:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/messages - Créer un nouveau message
router.post('/', authenticateToken, async (req, res) => {
  const { conversationId, text } = req.body;

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: 'Not found' });

    const isParticipant = conversation.participants.some(
      participant => participant._id.toString() === req.user.id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const message = new Message({
      conversationId,
      senderId: user._id,
      text,
    });

    await message.save();

    res.status(201).json({
      _id: message._id,
      conversationId: message.conversationId,
      text: message.text,
      senderId: message.senderId,
      username: user.username,
      createdAt: message.createdAt,
    });
  } catch (err) {
    console.error('Erreur POST /api/messages:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;

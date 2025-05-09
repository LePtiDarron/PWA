// routes/conversations.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authenticateToken = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Fonction pour vérifier si une chaîne est un email valide
function isValidEmail(email) {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
}

// Configuration de Nodemailer pour envoyer des emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_EMAIL_PASSWORD,
  },
});

// GET /api/conversations - Liste des conversations de l'utilisateur
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({
      participants: userId
    }).populate('participants', 'username username');

    res.json(conversations);
  } catch (err) {
    console.error('Erreur get /api/conversations:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/conversations - Créer une nouvelle conversation avec des usernames ou emails
router.post('/', authenticateToken, async (req, res) => {
  const { participantUsername, name } = req.body;

  try {
    const participants = [];
    const emailsToInvite = [];

    // Ajouter l'utilisateur actuel aux participants
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Traiter chaque participant (username ou email)
    for (const username of participantUsername) {
      if (isValidEmail(username)) {
        // Si c'est un email, on le garde pour envoyer l'invitation plus tard
        emailsToInvite.push(username);
      } else {
        // Si ce n'est pas un email, chercher l'utilisateur
        const user = await User.findOne({ username });
        if (user) {
          participants.push(user);
        } else {
          console.warn(`Utilisateur avec le nom d'utilisateur '${username}' non trouvé`);
        }
      }
    }

    // Ajouter l'utilisateur actuel à la conversation
    participants.push({ _id: userId });

    // Créer la conversation
    const conversation = new Conversation({
      participants: [...new Set(participants.map(u => u._id))],
      name: name || null,
      canInvite: [req.user.id],
    });

    await conversation.save();

    // Une fois la conversation créée, envoyer les invitations par email
    for (const email of emailsToInvite) {
      const inviteLink = `https://epimsg.duckdns.org/invite/${conversation._id}`;
      const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Invitation à rejoindre une conversation',
        text: `Vous avez été invité à rejoindre une conversation. Cliquez sur ce lien pour accepter l'invitation : ${inviteLink}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Erreur lors de l\'envoi de l\'email :', error);
        }
      });
    }

    // Retourner la conversation créée
    res.status(201).json(conversation);

  } catch (err) {
    console.error('Erreur lors de la création de la conversation:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/conversations/:id/invite - Inviter un utilisateur par username ou email
router.post('/:id/invite', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  try {
    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    const isAuthorized = conversation.canInvite.includes(req.user.id);
    if (!isAuthorized) return res.status(403).json({ message: 'Not allowed' });

    if (isValidEmail(username)) {
      const inviteLink = `https://epimsg.duckdns.org/invite/${id}`;
      const mailOptions = {
        from: 'your-email@gmail.com',
        to: username,
        subject: 'Invitation à rejoindre une conversation',
        text: `Vous avez été invité à rejoindre une conversation. Cliquez sur ce lien pour accepter l'invitation : ${inviteLink}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Erreur lors de l\'envoi de l\'email :', error);
          return res.status(500).json({ message: 'error while sending email' });
        }
        res.status(200).json({ message: 'Invite sent' });
      });
    } else {
      const user = await User.findOne({ username });
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (!conversation.participants.includes(user._id)) {
        conversation.participants.push(user._id);
      }

      await conversation.save();
      res.status(200).json({ message: 'User invited' });
    }
  } catch (err) {
    console.error('Erreur invite /api/conversations/:id/invite:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


// POST /api/conversations/:id/leave - Quitter une conversation
router.post('/:id/leave', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    conversation.participants = conversation.participants.filter(p => p.toString() !== userId);

    conversation.canInvite = conversation.canInvite.filter(p => p.toString() !== userId);

    if (conversation.participants.length === 0) {
      await conversation.deleteOne();
      return res.status(200).json({ message: 'Deleted, no user left' });
    }

    if (conversation.canInvite.length === 0) {
      conversation.canInvite.push(conversation.participants[0]);
    }

    await conversation.save();
    res.status(200).json({ message: 'Conversation left' });
  } catch (err) {
    console.error('Erreur leave /api/conversations/:id/leave:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/conversations/:id/expel - Expulser un utilisateur d'une conversation
router.post('/:id/kick', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  const userId = req.user.id;

  try {
    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    const isAuthorized = conversation.canInvite.includes(userId);
    if (!isAuthorized) return res.status(403).json({ message: 'Not allowed' });

    const userToExpel = await User.findOne({ username });
    if (!userToExpel) return res.status(404).json({ message: 'User not found' });

    if (!conversation.participants.includes(userToExpel._id)) {
      return res.status(400).json({ message: 'Not in the conversation' });
    }

    conversation.participants = conversation.participants.filter(p => !p.equals(userToExpel._id));
    conversation.canInvite = conversation.canInvite.filter(p => !p.equals(userToExpel._id));

    if (conversation.participants.length === 0) {
      await conversation.deleteOne();
      return res.status(200).json({ message: 'Deleted, no user left' });
    }

    if (conversation.canInvite.length === 0) {
      conversation.canInvite.push(conversation.participants[0]);
    }

    await conversation.save();

    res.status(200).json({ message: 'User kicked' });
  } catch (err) {
    console.error('Erreur expel /api/conversations/:id/expel:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/invite/:id - Accepter une invitation
router.get('/invite/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ message: 'Not found' });
    }

    if (conversation.participants.includes(userId)) {
      return res.status(400).json({ message: 'You already are in this conversation' });
    }

    conversation.participants.push(userId);
    await conversation.save();

    res.status(200).json({ message: 'Accepted' });
  } catch (err) {
    console.error('Erreur lors de l\'acceptation de l\'invitation:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


module.exports = router;

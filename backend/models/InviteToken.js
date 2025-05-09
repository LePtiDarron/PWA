const mongoose = require('mongoose');

const inviteTokenSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const InviteToken = mongoose.model('InviteToken', inviteTokenSchema);

module.exports = InviteToken;

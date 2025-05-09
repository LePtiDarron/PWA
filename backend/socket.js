const User = require('./models/User');
const Conversation = require('./models/Conversation');

function initSocket(io) {
  io.on("connection", (socket) => {
    console.log("✅ Client connecté :", socket.id);

    socket.on("identify", (userId, email, username) => {
      if (userId) {
        socket.userId = userId;
        socket.email = email;
        socket.username = username;
        console.log(`🆔 Identifié avec : ${userId}, ${email}, ${username}`);
      } else {
        console.error('❌ Le userId est manquant');
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Client déconnecté :", socket.id);
    });

    socket.on("join conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`👥 ${socket.username} a rejoint la conversation ${conversationId}`);
    });

    socket.on("disconnect conversation", (conversationId) => {
      socket.leave(conversationId);
      console.log(`🚪 ${socket.username} s'est déconnecté de la conversation ${conversationId}`);
    });

    socket.on("chat message", async (msg) => {
      console.log("💬 Message reçu :", msg.text);

      if (!msg.conversationId) {
        return console.error('❌ conversationId manquant');
      }

      const conversation = await Conversation.findById(msg.conversationId);
      
      if (!conversation) {
        return console.error('❌ conversation non trouvée');
      }

      const participants = conversation.participants;
      for (const [id, s] of io.of("/").sockets) {
        if (participants.some(p => p._id.toString() === s.userId)) {
          s.emit("chat message", msg);
        }
      }
    });

    socket.on("kick user", ({ username, conversationId }) => {
      console.log(`🚫 Utilisateur ${username} expulsé de la conversation ${conversationId}`);
      io.to(conversationId).emit("kick user", { username, conversationId });

      for (const [id, s] of io.of("/").sockets) {
        if (s.username === username) {
          s.emit("kick user", { username, conversationId });
        }
      }
    });

    socket.on('user invited', async ({ conversationId, participantUsernames }) => {
      try {
        const users = await User.find({ username: { $in: participantUsernames } });
        const allUsers = await User.find({});
        const usernames = users.map(u => u.username);
        const conversation = await Conversation.findById(conversationId);
        
        if (conversation) {
          const conversationData = {
            _id: conversation._id,
            name: conversation.name,
          };

          io.to(conversationId).emit('user invited', { usernames, conversation: conversationData });
          
          for (const [id, s] of io.of('/').sockets) {
            const user = allUsers.find(u => u.username === s.username);
            if (user) {
              console.log(`📩 Inviting user ${user.username} in conversation ${conversationId}`);
              s.emit('user invited', { usernames, conversation: conversationData });
            }
          }
        } else {
          console.error(`❌ Conversation avec l'ID ${conversationId} introuvable`);
        }
      } catch (err) {
        console.error('❌ Erreur lors de l\'invitation des utilisateurs :', err);
      }
    });

    socket.on("leave conversation", ({ username, conversationId }) => {
      socket.leave(conversationId);
      console.log(`🚶‍♂️ ${username} quitte la conversation ${conversationId}`);
      io.to(conversationId).emit("leave conversation", { username });
    });
  });
}

module.exports = initSocket;

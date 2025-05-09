import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false,
});

socket.on('connect_error', (err) => {
  console.error('Erreur de connexion Socket.IO:', err);
});

socket.on('connect_timeout', () => {
  console.error('Connexion Socket.IO a expiré');
});

socket.on('disconnect', (reason) => {
  console.log('Déconnexion du socket:', reason);
});

function setupSocketIdentification() {
  const userId = localStorage.getItem('userId');
  const email = localStorage.getItem('email');
  const username = localStorage.getItem('username');

  if (!socket.connected) {
    console.log('Tentative de connexion au serveur...');
    socket.connect();
  }

  socket.userId = userId;
  socket.email = email;
  socket.username = username;

  socket.on('connect', () => {
    console.log('Connexion établie avec le serveur via Socket.IO');
    if (userId && email && username) {
      console.log('Envoi des informations d\'identification:', { userId, email, username });
      socket.emit('identify', userId, email, username);
    } else {
      console.error('Les informations nécessaires sont manquantes pour l\'identification');
    }
  });

  socket.on('identify', (data) => {
    console.log('Réponse après identification:', data);
  });

  socket.on('error', (error) => {
    console.error('Erreur du socket:', error);
  });

  socket.on('reconnect', (attempt) => {
    console.log(`Reconnexion réussie, tentative #${attempt}`);
  });
  
  socket.on('reconnect_error', (err) => {
    console.error('Erreur lors de la reconnexion:', err);
  });

  socket.on('reconnect_failed', () => {
    console.error('Impossible de se reconnecter au serveur');
  });
}

export { socket, setupSocketIdentification };

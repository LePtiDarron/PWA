import { io } from 'socket.io-client';

const socket = io('wss://epimsg.duckdns.org', {
  autoConnect: false,
});

function setupSocketIdentification() {
  const userId = localStorage.getItem('userId');
  const email = localStorage.getItem('email');
  const username = localStorage.getItem('username');

  socket.userId = userId;
  socket.email = email;
  socket.username = username;

  if (!socket.connected) {
    socket.connect();
  }

  socket.on('connect', () => {
    if (userId && email && username) {
      socket.emit('identify', userId, email, username);
    }
  });
}

export { socket, setupSocketIdentification };

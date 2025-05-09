import { io } from 'socket.io-client';

const socket = io('ws://localhost:3000', {
  autoConnect: false,
});

function setupSocketIdentification() {
  const userId = localStorage.getItem('userId');
  const email = localStorage.getItem('email');
  const username = localStorage.getItem('username');

  if (!socket.connected) {
    socket.connect();
  }

  socket.userId = userId;
  socket.email = email;
  socket.username = username;

  socket.on('connect', () => {
    if (userId && email && username) {
      socket.emit('identify', userId, email, username);
    }
  });
}

export { socket, setupSocketIdentification };

// src/socket.js
import { io } from 'socket.io-client';

let socket;

const BACKEND_URL = 'http://localhost:3001'; 

export const initiateSocketConnection = () => {
  const token = localStorage.getItem('token');

  // Voorkom dubbele connecties
  if (socket && socket.connected) {
    return socket;
  }
  
  // Als er al een socket is maar niet verbonden, probeer opnieuw te verbinden
  if (socket) {
    socket.connect();
    return socket;
  }

  console.log(`Opzetten van nieuwe Socket.IO verbinding met ${BACKEND_URL}...`);
  socket = io(BACKEND_URL, {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
  });

  socket.on('connect', () => console.log('✅ Succesvol verbonden met Socket.IO server!'));
  socket.on('disconnect', () => console.log('❌ Verbinding met Socket.IO server verbroken.'));
  socket.on('connect_error', (err) => console.error('❌ Socket.IO connect_error:', err.message));

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// --- START WIJZIGING: Functies robuuster gemaakt ---
export const subscribeToEvent = (eventName, callback) => {
  // Zorg ervoor dat de socket bestaat en verbonden is voordat we ons abonneren.
  if (!socket) {
    initiateSocketConnection();
  }
  socket.on(eventName, callback);
};

export const unsubscribeFromEvent = (eventName, callback) => {
  // Gebruik optional chaining voor veiligheid
  socket?.off(eventName, callback);
};
// --- EINDE WIJZIGING ---
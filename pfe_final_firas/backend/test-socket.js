const io = require('socket.io-client');

// Test de connexion Socket.IO
const testSocket = () => {
  console.log('Test de connexion Socket.IO...');
  
  const socket = io('http://localhost:5000', {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  socket.on('connect', () => {
    console.log('✅ Socket connecté avec succès');
    console.log('Socket ID:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Erreur de connexion Socket.IO:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket déconnecté:', reason);
  });

  // Test d'envoi d'un événement
  setTimeout(() => {
    if (socket.connected) {
      console.log('📤 Test d\'envoi d\'événement...');
      socket.emit('test', { message: 'Hello from test client' });
    }
  }, 2000);

  // Nettoyer après 10 secondes
  setTimeout(() => {
    console.log('🧹 Nettoyage...');
    socket.disconnect();
    process.exit(0);
  }, 10000);
};

// Lancer le test
testSocket(); 
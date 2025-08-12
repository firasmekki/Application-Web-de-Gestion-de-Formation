const socketAuthMiddleware = require('./socketMiddleware');
const handleChat = require('./chatHandler');

const initializeSocket = (server) => {
  const { Server } = require('socket.io');
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  const onlineUsers = new Map();

  io.use(socketAuthMiddleware);

  io.on('connection', async (socket) => {
    try {
      console.log('Nouvel utilisateur connecté:', socket.userId, socket.user.nom);
      
      onlineUsers.set(socket.userId, socket.id);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));

      // Initialize chat handlers
      handleChat(io, socket, onlineUsers);

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
        onlineUsers.delete(socket.userId);
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      });

    } catch (error) {
      console.error('Socket connection error:', error);
    }
  });

  return { io, onlineUsers };
};

module.exports = initializeSocket;

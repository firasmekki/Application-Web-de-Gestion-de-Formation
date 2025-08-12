const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const chatController = require('../controllers/chatController');

function initializeSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Middleware d'authentification
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  // Gérer les connexions
  io.on('connection', (socket) => {
    chatController.handleUserConnection(socket);

    // Gérer la déconnexion
    socket.on('disconnect', () => {
      chatController.handleUserDisconnection(socket);
    });

    // Rejoindre une conversation
    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
    });

    // Quitter une conversation
    socket.on('leaveConversation', (conversationId) => {
      socket.leave(conversationId);
    });

    // Envoyer un message
    socket.on('sendMessage', async (data) => {
      try {
        const { conversationId, content, type = 'text' } = data;
        const message = await chatController.envoyerMessage({
          body: {
            conversationId,
            content,
            type,
            sender: socket.userId
          }
        });

        io.to(conversationId).emit('newMessage', message);

        // Notifier les autres participants
        const conversation = await chatController.getParticipants({
          params: { conversationId }
        });
        
        conversation.participants.forEach((participant) => {
          if (participant._id.toString() !== socket.userId) {
            io.to(chatController.onlineUsers.get(participant._id.toString()))
              .emit('messageNotification', {
                conversationId,
                message
              });
          }
        });
      } catch (error) {
        socket.emit('messageError', error.message);
      }
    });

    // Gérer l'indicateur de frappe
    socket.on('typing', (data) => {
      const { conversationId, isTyping } = data;
      socket.to(conversationId).emit('userTyping', {
        userId: socket.userId,
        isTyping
      });
    });

    // Marquer les messages comme lus
    socket.on('markAsRead', async (data) => {
      try {
        const { conversationId } = data;
        await chatController.markMessagesAsRead({
          body: {
            conversationId,
            userId: socket.userId
          }
        });

        io.to(conversationId).emit('messagesRead', {
          conversationId,
          userId: socket.userId
        });
      } catch (error) {
        socket.emit('readError', error.message);
      }
    });
  });

  return io;
}

module.exports = initializeSocket;

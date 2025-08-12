const Chat = require('../models/Chat');

const handleChat = (io, socket, onlineUsers) => {
  socket.on('joinChat', async (chatId) => {
    try {
      console.log(`User ${socket.userId} joining chat ${chatId}`);
      
      const chat = await Chat.findById(chatId)
        .populate('participants', 'nom prenom email photo');

      if (!chat) {
        console.log(`Chat ${chatId} not found`);
        socket.emit('chatError', { message: 'Chat not found' });
        return;
      }

      const isParticipant = chat.participants.some(
        p => p._id.toString() === socket.userId.toString()
      );

      if (!isParticipant) {
        console.log(`User ${socket.userId} not authorized for chat ${chatId}`);
        socket.emit('chatError', { message: 'Not authorized to join this chat' });
        return;
      }

      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });
      
      socket.join(chatId);
      console.log(`User ${socket.userId} joined chat ${chatId}`);
      
      socket.to(chatId).emit('userJoined', {
        userId: socket.userId,
        user: socket.user
      });
    } catch (error) {
      console.error(`Error joining chat ${chatId}:`, error);
      socket.emit('chatError', { message: 'Error joining chat' });
    }
  });

  socket.on('sendMessage', async ({ chatId, message }) => {
    try {
      console.log(`Message reçu de ${socket.userId} pour le chat ${chatId}:`, message);
      
      const chat = await Chat.findById(chatId)
        .populate('participants', 'nom prenom email photo');

      if (!chat) {
        socket.emit('chatError', { message: 'Chat not found' });
        return;
      }

      const isParticipant = chat.participants.some(
        p => p._id.toString() === socket.userId.toString()
      );

      if (!isParticipant) {
        socket.emit('chatError', { message: 'Not authorized to send messages in this chat' });
        return;
      }

      io.to(chatId).emit('newMessage', {
        chatId,
        message: {
          ...message,
          expediteur: socket.user
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('chatError', { message: 'Error sending message' });
    }
  });

  // Gérer l'événement de frappe
  socket.on('typing', ({ chatId, isTyping }) => {
    try {
      console.log(`User ${socket.userId} typing in chat ${chatId}: ${isTyping}`);
      
      // Émettre l'état de frappe aux autres participants du chat
      socket.to(chatId).emit('userTyping', {
        userId: socket.userId,
        chatId,
        isTyping
      });
    } catch (error) {
      console.error('Error handling typing event:', error);
    }
  });
};

module.exports = handleChat;

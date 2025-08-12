const Chat = require('../models/Chat');
const User = require('../models/User');

// Map pour suivre les utilisateurs en ligne
const onlineUsers = new Map();

// Gérer la connexion d'un utilisateur
exports.handleUserConnection = async (socket) => {
  const userId = socket.userId;
  console.log('User connected:', userId);

  try {
    // Mettre à jour le statut en ligne
    await User.findByIdAndUpdate(userId, { isOnline: true });
    
    // Ajouter à la map des utilisateurs en ligne
    onlineUsers.set(userId, socket.id);
    
    // Diffuser le statut en ligne
    socket.broadcast.emit('userStatus', {
      userId: userId,
      status: true
    });
  } catch (error) {
    console.error('Error updating user online status:', error);
  }
};

// Gérer la déconnexion d'un utilisateur
exports.handleUserDisconnection = async (socket) => {
  const userId = socket.userId;
  console.log('User disconnected:', userId);

  try {
    // Mettre à jour le statut hors ligne
    await User.findByIdAndUpdate(userId, { 
      isOnline: false,
      lastSeen: new Date()
    });
    
    // Retirer de la map des utilisateurs en ligne
    onlineUsers.delete(userId);
    
    // Diffuser le statut hors ligne
    socket.broadcast.emit('userStatus', {
      userId: userId,
      status: false
    });
  } catch (error) {
    console.error('Error updating user offline status:', error);
  }
};

// Créer ou récupérer une conversation individuelle
exports.getOuCreerConversation = async (req, res) => {
  try {
    const { destinataireId } = req.body;
    const expediteurId = req.user._id;

    if (!destinataireId) {
      return res.status(400).json({
        success: false,
        message: 'ID du destinataire requis'
      });
    }

    // Vérifier que l'expéditeur et le destinataire existent
    const [expediteur, destinataire] = await Promise.all([
      User.findById(expediteurId),
      User.findById(destinataireId)
    ]);

    if (!expediteur || !destinataire) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Trouver ou créer la conversation
    let chat = await Chat.findOne({
      type: 'individuel',
      participants: {
        $all: [expediteurId, destinataireId],
        $size: 2
      },
      statut: 'actif'
    }).populate('participants', 'nom prenom email photo');

    if (!chat) {
      chat = await Chat.create({
        type: 'individuel',
        participants: [expediteurId, destinataireId]
      });
      await chat.populate('participants', 'nom prenom email photo');
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Erreur getOuCreerConversation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création/récupération de la conversation',
      error: error.message
    });
  }
};

// Obtenir les messages d'une conversation avec pagination
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // Vérifier si la conversation existe et si l'utilisateur en fait partie
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
      statut: 'actif'
    })
    .populate({
      path: 'messages.expediteur',
      select: 'nom prenom email photo'
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }

    // Trier les messages du plus récent au plus ancien
    const messages = chat.messages.sort((a, b) => b.dateCreation - a.dateCreation);

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages'
    });
  }
};

// Envoyer un message
exports.envoyerMessage = async (req, res) => {
  try {
    const { chatId, contenu } = req.body;
    const expediteurId = req.user._id;
    const fichier = req.file;

    console.log('Données reçues:', { chatId, contenu, expediteurId, fichier });

    // Vérifier si la conversation existe et si l'utilisateur en fait partie
    const chat = await Chat.findOne({
      _id: chatId,
      participants: expediteurId,
      statut: 'actif'
    }).populate('participants', 'nom prenom email photo');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat non trouvé'
      });
    }

    // Ajouter le message
    const message = {
      expediteur: expediteurId,
      contenu,
      dateCreation: new Date()
    };

    if (fichier) {
      message.fichier = {
        nom: fichier.originalname,
        chemin: fichier.path,
        type: fichier.mimetype,
        taille: fichier.size
      };
    }

    chat.messages.push(message);
    chat.dernierMessage = message.dateCreation;
    await chat.save();

    // Récupérer le message avec les informations de l'expéditeur
    const messagePopulated = await Chat.findOne(
      { _id: chatId },
      { messages: { $slice: -1 } }
    ).populate('messages.expediteur', 'nom prenom email photo');

    const newMessage = messagePopulated.messages[0];

    // Émettre le message via Socket.IO
    const io = req.app.get('io');
    if (io) {
      // Émettre à tous les participants du chat
      io.to(chatId).emit('newMessage', {
        chatId,
        message: newMessage
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès',
      data: newMessage
    });
  } catch (error) {
    console.error('Erreur envoyerMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message',
      error: error.message
    });
  }
};

// Obtenir les messages d'une conversation
exports.getMessagesPagination = async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const chat = await Chat.findById(chatId)
      .populate('participants', 'nom prenom email photo isOnline lastSeen')
      .populate('messages.expediteur', 'nom prenom email photo')
      .slice('messages', -limit);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat non trouvé'
      });
    }

    // Vérifier que l'utilisateur est un participant
    if (!chat.participants.map(p => p._id.toString()).includes(req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à voir ces messages'
      });
    }

    res.status(200).json({
      success: true,
      data: chat.messages,
      pagination: {
        page,
        limit,
        total: chat.messages.length
      }
    });
  } catch (error) {
    console.error('Erreur getMessages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages',
      error: error.message
    });
  }
};

// Obtenir les conversations d'un utilisateur
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Chat.find({
      participants: userId,
      statut: 'actif'
    })
    .populate('participants', 'nom prenom email photo')
    .populate({
      path: 'messages',
      options: { sort: { dateCreation: -1 }, limit: 1 }
    })
    .sort({ 'messages.dateCreation': -1 });

    // Formater les conversations pour n'inclure que les informations nécessaires
    const formattedConversations = conversations.map(conv => {
      const lastMessage = conv.messages && conv.messages.length > 0 ? conv.messages[0] : null;
      return {
        _id: conv._id,
        participants: conv.participants.map(p => ({
          _id: p._id,
          nom: p.nom,
          prenom: p.prenom,
          email: p.email,
          photo: p.photo
        })),
        dernierMessage: lastMessage ? {
          contenu: lastMessage.contenu,
          dateCreation: lastMessage.dateCreation,
          expediteur: lastMessage.expediteur
        } : null,
        type: conv.type
      };
    });

    res.status(200).json({
      success: true,
      data: formattedConversations
    });
  } catch (error) {
    console.error('Erreur getConversations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des conversations',
      error: error.message
    });
  }
};

// Obtenir l'historique des messages d'un utilisateur
exports.getHistorique = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({ 
      participants: userId,
      statut: 'actif'
    })
    .populate('participants', 'nom prenom email photo isOnline lastSeen')
    .populate('messages.expediteur', 'nom prenom email photo')
    .sort({ 'messages.dateCreation': -1 });

    res.status(200).json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Erreur getHistorique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique',
      error: error.message
    });
  }
};

// Obtenir la liste des participants
exports.getParticipants = async (req, res) => {
  try {
    const userId = req.user._id;

    // Trouver tous les utilisateurs sauf l'utilisateur actuel
    const participants = await User.find(
      { 
        _id: { $ne: userId },
        role: { $in: ['participant', 'formateur'] }
      },
      'nom prenom email photo isOnline lastSeen role'
    ).sort({ nom: 1, prenom: 1 });

    res.status(200).json({
      success: true,
      data: participants
    });

  } catch (error) {
    console.error('Erreur getParticipants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des participants',
      error: error.message
    });
  }
};

// Obtenir tous les participants disponibles pour le chat
exports.getAvailableParticipants = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Récupérer tous les utilisateurs sauf l'utilisateur actuel
    const participants = await User.find(
      { 
        _id: { $ne: currentUserId },
        role: { $ne: 'admin' } // Exclure les administrateurs si nécessaire
      },
      'nom prenom email photo isOnline lastSeen'
    ).sort({ nom: 1, prenom: 1 });

    res.status(200).json({
      success: true,
      data: participants
    });
  } catch (error) {
    console.error('Erreur getAvailableParticipants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des participants',
      error: error.message
    });
  }
};

// Gérer l'indicateur de frappe
exports.handleTypingStatus = (socket) => {
  socket.on('typing', ({ chatId, isTyping }) => {
    const userId = socket.userId;
    
    // Émettre l'état de frappe aux autres participants
    socket.to(chatId).emit('userTyping', {
      userId,
      chatId,
      isTyping
    });
  });
};

// Marquer les messages comme lus
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findOneAndUpdate(
      {
        _id: chatId,
        'messages.expediteur': { $ne: userId },
        'messages.lu': false
      },
      {
        $set: {
          'messages.$[elem].lu': true,
          'messages.$[elem].dateLecture': new Date()
        }
      },
      {
        arrayFilters: [{ 'elem.expediteur': { $ne: userId }, 'elem.lu': false }],
        new: true
      }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }

    // Émettre un événement pour notifier les autres utilisateurs
    const io = req.app.get('io');
    io.to(chatId).emit('messagesRead', {
      chatId,
      userId
    });

    res.status(200).json({
      success: true,
      message: 'Messages marqués comme lus'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage des messages'
    });
  }
};

module.exports.onlineUsers = onlineUsers;

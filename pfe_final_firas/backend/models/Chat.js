const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  expediteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contenu: {
    type: String,
    required: true
  },
  fichier: {
    nom: String,
    chemin: String,
    type: String,
    taille: Number
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  lu: {
    type: Boolean,
    default: false
  }
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [messageSchema],
  type: {
    type: String,
    enum: ['individuel', 'groupe'],
    required: true,
    default: 'individuel'
  },
  dernierMessage: {
    type: Date,
    default: Date.now
  },
  formation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formation'
  },
  statut: {
    type: String,
    enum: ['actif', 'archive', 'supprime'],
    default: 'actif'
  }
}, {
  timestamps: true
});

// Indexes pour de meilleures performances
chatSchema.index({ participants: 1 });
chatSchema.index({ dernierMessage: -1 });
chatSchema.index({ 'messages.dateCreation': -1 });

// Méthodes statiques
chatSchema.statics.getOuCreerConversation = async function(expediteurId, destinataireId) {
  let chat = await this.findOne({
    type: 'individuel',
    participants: {
      $all: [expediteurId, destinataireId],
      $size: 2
    },
    statut: 'actif'
  }).populate('participants', 'nom prenom email photo');

  if (!chat) {
    chat = await this.create({
      type: 'individuel',
      participants: [expediteurId, destinataireId]
    });
    await chat.populate('participants', 'nom prenom email photo');
  }

  return chat;
};

// Méthodes d'instance
chatSchema.methods.ajouterMessage = async function(expediteurId, contenu, fichier = null) {
  const message = {
    expediteur: expediteurId,
    contenu: contenu,
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

  this.messages.push(message);
  this.dernierMessage = message.dateCreation;
  await this.save();
  
  // Populate the expediteur field of the newly added message
  const populatedChat = await this.populate('messages.expediteur', 'nom prenom email photo');
  return populatedChat.messages[populatedChat.messages.length - 1];
};

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;

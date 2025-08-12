const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  destinataire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  titre: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['inscription', 'formation', 'question', 'systeme', 'acceptee', 'refusee'],
    required: true
  },
  lu: {
    type: Boolean,
    default: false
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  donnees: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  lienAction: {
    type: String,
    default: null
  }
});

// Index pour améliorer les performances des requêtes
notificationSchema.index({ destinataire: 1, lu: 1 });
notificationSchema.index({ dateCreation: -1 });

// Méthode statique pour créer une notification
notificationSchema.statics.creerNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  return notification;
};

// Méthode statique pour marquer plusieurs notifications comme lues
notificationSchema.statics.marquerCommeLues = function(destinataireId, notificationIds) {
  return this.updateMany(
    {
      _id: { $in: notificationIds },
      destinataire: destinataireId
    },
    { $set: { lu: true } }
  );
};

// Méthode statique pour obtenir les notifications non lues d'un utilisateur
notificationSchema.statics.getNonLues = function(destinataireId) {
  return this.find({
    destinataire: destinataireId,
    lu: false
  }).sort({ dateCreation: -1 });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

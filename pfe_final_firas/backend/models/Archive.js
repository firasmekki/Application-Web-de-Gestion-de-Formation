const mongoose = require('mongoose');

const archiveSchema = new mongoose.Schema({
  typeElement: {
    type: String,
    enum: ['formation', 'utilisateur'],
    required: true
  },
  elementId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  donnees: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  raisonArchivage: {
    type: String,
    required: true
  },
  dateArchivage: {
    type: Date,
    default: Date.now
  },
  archivePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaure: {
    type: Boolean,
    default: false
  },
  dateRestauration: {
    type: Date,
    default: null
  },
  restaurePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
});

// Index pour améliorer les performances des requêtes
archiveSchema.index({ typeElement: 1, dateArchivage: -1 });
archiveSchema.index({ elementId: 1 });

// Méthode statique pour archiver un élément
archiveSchema.statics.archiverElement = async function(data) {
  const archive = new this(data);
  await archive.save();
  return archive;
};

// Méthode statique pour restaurer un élément
archiveSchema.statics.restaurerElement = async function(archiveId, restaurePar) {
  return this.findByIdAndUpdate(
    archiveId,
    {
      $set: {
        restaure: true,
        dateRestauration: new Date(),
        restaurePar
      }
    },
    { new: true }
  );
};

// Méthode statique pour obtenir l'historique des archives
archiveSchema.statics.getHistorique = function(filters = {}) {
  return this.find(filters)
    .sort({ dateArchivage: -1 })
    .populate('archivePar', 'nom prenom email')
    .populate('restaurePar', 'nom prenom email');
};

const Archive = mongoose.model('Archive', archiveSchema);

module.exports = Archive;

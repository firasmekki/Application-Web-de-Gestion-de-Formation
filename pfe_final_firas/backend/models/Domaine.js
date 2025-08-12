const mongoose = require('mongoose');

const domaineSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  nombreFormations: {
    type: Number,
    default: 0
  },
  statut: {
    type: String,
    enum: ['actif', 'inactif'],
    default: 'actif'
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  derniereModification: {
    type: Date,
    default: Date.now
  }
});

// Middleware pre-save pour mettre à jour la date de dernière modification
domaineSchema.pre('save', function(next) {
  this.derniereModification = Date.now();
  next();
});

// Méthode statique pour récupérer les domaines actifs
domaineSchema.statics.getDomainesActifs = function() {
  return this.find({ statut: 'actif' });
};

const Domaine = mongoose.model('Domaine', domaineSchema);

module.exports = Domaine;

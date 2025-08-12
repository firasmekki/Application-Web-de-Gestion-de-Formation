const mongoose = require('mongoose');

const demandeSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['inscription', 'formation']
  },
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  statut: {
    type: String,
    required: true,
    enum: ['en_attente', 'acceptee', 'refusee'],
    default: 'en_attente'
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  dateTraitement: {
    type: Date
  },
  detailsDemande: {
    nom: String,
    prenom: String,
    email: String,
    telephone: String,
    role: String
  }
});

module.exports = mongoose.model('Demande', demandeSchema);

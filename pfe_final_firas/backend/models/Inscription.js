const mongoose = require('mongoose');

const inscriptionSchema = new mongoose.Schema({
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  formation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formation',
    required: true
  },
  dateInscription: {
    type: Date,
    default: Date.now
  },
  dateCompletion: {
    type: Date
  },
  statut: {
    type: String,
    enum: ['en_cours', 'terminee', 'abandonnee'],
    default: 'en_cours'
  },
  progression: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  evaluation: {
    note: {
      type: Number,
      min: 1,
      max: 5
    },
    commentaire: String,
    date: Date
  },
  certificatUrl: String
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
inscriptionSchema.index({ participant: 1, formation: 1 }, { unique: true });
inscriptionSchema.index({ statut: 1 });
inscriptionSchema.index({ dateInscription: -1 });

// Méthode pour vérifier si une inscription existe
inscriptionSchema.statics.estInscrit = async function(participantId, formationId) {
  const inscription = await this.findOne({
    participant: participantId,
    formation: formationId
  });
  return !!inscription;
};

// Méthode pour obtenir les statistiques d'une formation
inscriptionSchema.statics.getStatistiquesFormation = async function(formationId) {
  return this.aggregate([
    { $match: { formation: mongoose.Types.ObjectId(formationId) } },
    {
      $group: {
        _id: '$statut',
        count: { $sum: 1 },
        avgProgression: { $avg: '$progression' },
        avgNote: { $avg: '$evaluation.note' }
      }
    }
  ]);
};

const Inscription = mongoose.model('Inscription', inscriptionSchema);

module.exports = Inscription;

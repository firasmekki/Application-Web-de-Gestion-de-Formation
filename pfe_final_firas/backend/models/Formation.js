const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  note: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  commentaire: {
    type: String,
    maxlength: [500, 'Le commentaire ne peut pas dépasser 500 caractères']
  },
  dateEvaluation: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const formationSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Veuillez ajouter un titre'],
    trim: true,
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'Veuillez ajouter une description'],
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  domaine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domaine',
    required: true
  },
  formateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dateDebut: {
    type: Date,
    required: [true, 'Veuillez ajouter une date de début']
  },
  dateFin: {
    type: Date,
    required: [true, 'Veuillez ajouter une date de fin'],
    validate: {
      validator: function(value) {
        return !this.dateDebut || value > this.dateDebut;
      },
      message: 'La date de fin doit être postérieure à la date de début'
    }
  },
  duree: {
    type: Number,
    required: [true, 'Veuillez ajouter une durée']
  },
  capaciteMax: {
    type: Number,
    required: [true, 'Veuillez ajouter une capacité maximale'],
    min: [1, 'La capacité maximale doit être au moins 1']
  },
  niveau: {
    type: String,
    required: [true, 'Veuillez ajouter un niveau'],
    enum: ['debutant', 'intermediaire', 'avance']
  },
  prerequis: [{
    type: String
  }],
  objectifs: [{
    type: String
  }],
  contenu: [{
    titre: String,
    description: String
  }],
  modalites: {
    type: String,
    enum: ['presentiel', 'distanciel', 'hybride'],
    required: true
  },
  lieu: {
    type: String,
    required: function() {
      return this.modalites !== 'distanciel';
    }
  },
  lienVisio: {
    type: String,
    required: function() {
      return this.modalites !== 'presentiel';
    }
  },
  statut: {
    type: String,
    enum: ['en_attente', 'approuve', 'refuse', 'en_cours', 'termine', 'annule'],
    default: 'en_attente'
  },
  motifRefus: {
    type: String,
    default: null
  },
  motifAnnulation: {
    type: String,
    default: null
  },
  evaluations: [evaluationSchema],
  dateCreation: {
    type: Date,
    default: Date.now
  },
  derniereMiseAJour: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
formationSchema.virtual('nombreParticipants').get(function() {
  return this.participants.length;
});

formationSchema.virtual('tauxRemplissage').get(function() {
  return (this.participants.length / this.capaciteMax) * 100;
});

formationSchema.virtual('moyenneEvaluations').get(function() {
  if (!this.evaluations || this.evaluations.length === 0) return 0;
  const somme = this.evaluations.reduce((acc, eval) => acc + eval.note, 0);
  return Math.round((somme / this.evaluations.length) * 10) / 10;
});

// Middleware pour mettre à jour la date de dernière mise à jour
formationSchema.pre('save', function(next) {
  this.derniereMiseAJour = Date.now();
  next();
});

// Index pour améliorer les performances des requêtes
formationSchema.index({ formateur: 1, dateCreation: -1 });
formationSchema.index({ domaine: 1 });
formationSchema.index({ statut: 1 });
formationSchema.index({ dateDebut: 1 });

const Formation = mongoose.model('Formation', formationSchema);

module.exports = Formation;

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const schemaUtilisateur = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  motDePasse: {
    type: String,
    required: true,
    minlength: 6
  },
  nom: {
    type: String,
    required: true,
    trim: true
  },
  prenom: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['participant', 'formateur', 'administrateur'],
    default: 'participant'
  },
  estActif: {
    type: Boolean,
    default: false
  },
  photoProfile: {
    type: String,
    default: ''
  },
  departement: String,
  poste: String,
  biographie: String,
  competences: [String],
  formationsInscrites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formation'
  }],
  formationsTerminees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formation'
  }],
  notifications: [{
    message: String,
    type: String,
    lue: {
      type: Boolean,
      default: false
    },
    dateCreation: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hachage du mot de passe avant sauvegarde
schemaUtilisateur.pre('save', async function(next) {
  if (this.isModified('motDePasse')) {
    this.motDePasse = await bcrypt.hash(this.motDePasse, 8);
  }
  next();
});

// Méthode de comparaison du mot de passe
schemaUtilisateur.methods.comparerMotDePasse = async function(motDePasse) {
  return bcrypt.compare(motDePasse, this.motDePasse);
};

module.exports = mongoose.model('Utilisateur', schemaUtilisateur);

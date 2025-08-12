const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Veuillez ajouter un nom'],
    trim: true
  },
  prenom: {
    type: String,
    required: [true, 'Veuillez ajouter un prénom'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Veuillez ajouter un email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez ajouter un email valide'
    ]
  },
  role: {
    type: String,
    enum: ['participant', 'formateur', 'administrateur'],
    default: 'participant'
  },
  motDePasse: {
    type: String,
    required: [true, 'Veuillez ajouter un mot de passe'],
    minlength: 6,
    select: false
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  telephone: {
    type: String,
    maxlength: [20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères']
  },
  adresse: {
    type: String,
    maxlength: [200, 'L\'adresse ne peut pas dépasser 200 caractères']
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: null
  },
  statut: {
    type: String,
    enum: ['actif', 'inactif', 'en_attente'],
    default: 'en_attente'
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  derniereMiseAJour: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
});

// Mettre à jour la date de dernière mise à jour
userSchema.pre('save', function(next) {
  this.derniereMiseAJour = Date.now();
  next();
});

// Signer le token JWT
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      role: this.role 
    },
    process.env.JWT_SECRET || 'default_secret_key',
    { expiresIn: '24h' }
  );
};

// Générer et hasher le token de réinitialisation du mot de passe
userSchema.methods.getResetPasswordToken = function() {
  // Générer le token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hasher le token et le stocker dans resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Définir la date d'expiration
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);

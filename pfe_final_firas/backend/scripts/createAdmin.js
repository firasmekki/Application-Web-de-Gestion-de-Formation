require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/formationhub');
    console.log('Connecté à MongoDB');

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: 'admin@formationhub.com' });
    if (existingAdmin) {
      console.log('Un administrateur existe déjà avec cet email.');
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    // Créer l'administrateur
    const admin = new User({
      email: 'admin@formationhub.com',
      motDePasse: hashedPassword,
      nom: 'Admin',
      prenom: 'System',
      role: 'administrateur',
      statut: 'actif',
      dateCreation: new Date(),
      derniereMiseAJour: new Date()
    });

    await admin.save();
    console.log('Administrateur créé avec succès!');
    console.log('Email: admin@formationhub.com');
    console.log('Mot de passe: Admin123!');

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
  }
};

createAdmin();

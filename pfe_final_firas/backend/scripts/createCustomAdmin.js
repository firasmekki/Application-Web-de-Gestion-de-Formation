require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createCustomAdmin = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/formationhub');
    console.log('Connecté à MongoDB');

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: 'admin@admin.com' });
    if (existingAdmin) {
      console.log('Un administrateur existe déjà avec cet email.');
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Créer l'administrateur
    const admin = new User({
      email: 'admin@admin.com',
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
    console.log('Email: admin@admin.com');
    console.log('Mot de passe: admin123');

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
  }
};

createCustomAdmin(); 
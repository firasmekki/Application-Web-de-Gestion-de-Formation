require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createFormateur = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/formationhub');
    console.log('Connecté à MongoDB');

    // Vérifier si le formateur existe déjà
    const existingFormateur = await User.findOne({ email: 'formateur@test.com' });
    if (existingFormateur) {
      console.log('Un formateur existe déjà avec cet email.');
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('formateur123', 10);

    // Créer le formateur
    const formateur = new User({
      email: 'formateur@test.com',
      motDePasse: hashedPassword,
      nom: 'Dupont',
      prenom: 'Jean',
      role: 'formateur',
      statut: 'actif',
      dateCreation: new Date(),
      derniereMiseAJour: new Date()
    });

    await formateur.save();
    console.log('Formateur créé avec succès!');
    console.log('Email: formateur@test.com');
    console.log('Mot de passe: formateur123');

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
  }
};

createFormateur(); 
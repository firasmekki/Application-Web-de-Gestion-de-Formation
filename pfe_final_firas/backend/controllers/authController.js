const User = require('../models/User');
const Demande = require('../models/Demande');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Fonction pour envoyer un email
const envoyerEmail = async (destinataire, sujet, contenu) => {
  try {
    // Créer un transporteur
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    // Configuration de l'email
    const mailOptions = {
      from: {
        name: 'Formation Platforme',
        address: process.env.EMAIL_USER
      },
      to: destinataire,
      subject: sujet,
      html: contenu
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email');
  }
};

// Génération du token JWT
const genererToken = (utilisateur) => {
  return jwt.sign(
    { id: utilisateur._id, role: utilisateur.role },
    process.env.JWT_SECRET || 'default_secret_key',
    { expiresIn: '24h' }
  );
};

// Inscription
exports.inscription = async (req, res) => {
  try {
    console.log('Données reçues:', req.body);
    const { nom, prenom, email, motDePasse, role } = req.body;

    // Validation des champs requis
    if (!nom || !prenom || !email || !motDePasse) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez remplir tous les champs obligatoires'
      });
    }

    try {
      // Vérifier si l'utilisateur existe déjà
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'Un utilisateur avec cet email existe déjà'
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(motDePasse, 10);

      // Créer l'utilisateur avec statut inactif
      const user = await User.create({
        nom,
        prenom,
        email,
        motDePasse: hashedPassword,
        role: role || 'participant',
        statut: 'inactif'
      });

      // Créer une demande d'inscription
      const demande = new Demande({
        type: 'inscription',
        utilisateur: user._id,
        detailsDemande: {
          nom,
          prenom,
          email,
          role: role || 'participant'
        }
      });
      await demande.save();

      // Envoyer un email de confirmation
      const emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4A90E2; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenue sur Formation Platforme</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${prenom} ${nom},</h2>
              <p>Nous avons bien reçu votre demande d'inscription sur Formation Platforme.</p>
              <p>Votre compte est actuellement en cours d'examen par notre équipe administrative.</p>
              <p>Vous recevrez un email de confirmation dès que votre compte sera validé.</p>
              <p>En attendant, n'hésitez pas à explorer notre catalogue de formations.</p>
            </div>
            <div class="footer">
              <p>Cordialement,<br>L'équipe Formation Platforme</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await envoyerEmail(email, 'Bienvenue sur Formation Platforme', emailContent);

      res.status(201).json({
        success: true,
        message: 'Votre demande d\'inscription a été envoyée et est en cours de traitement'
      });
    } catch (error) {
      console.error('Erreur détaillée:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: error.message
    });
  }
};

// Connexion
exports.connexion = async (req, res) => {
  try {
    console.log('Tentative de connexion:', req.body);
    const { email, motDePasse } = req.body;

    // Validation des champs
    if (!email || !motDePasse) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email }).select('+motDePasse');
    if (!user) {
      console.log('Utilisateur non trouvé:', email);
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) {
      console.log('Mot de passe incorrect pour:', email);
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier si le compte est actif
    if (user.statut === 'inactif' && user.role === 'participant') {
      console.log('Compte inactif:', email);
      return res.status(403).json({
        success: false,
        message: 'Votre compte est en attente de validation par l\'administrateur'
      });
    }

    // Update isOnline status
    user.isOnline = true;
    await user.save();

    // Créer le token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'votre_clé_secrète_par_défaut',
      { expiresIn: '24h' }
    );

    // Ne pas renvoyer le mot de passe
    const userResponse = user.toObject();
    delete userResponse.motDePasse;

    console.log('Connexion réussie pour:', email);
    res.status(200).json({
      success: true,
      token,
      utilisateur: userResponse
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

// Déconnexion
exports.deconnexion = async (req, res) => {
  try {
    // Mettre à jour le statut isOnline
    await User.findByIdAndUpdate(req.user._id, { isOnline: false });

    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur déconnexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la déconnexion',
      error: error.message
    });
  }
};

// Réinitialisation du mot de passe
exports.demandeReinitialisationMotDePasse = async (req, res) => {
  try {
    const { email } = req.body;
    const utilisateur = await User.findOne({ email });

    if (!utilisateur) {
      return res.status(404).json({ message: 'Aucun compte associé à cet email' });
    }

    const token = jwt.sign(
      { id: utilisateur._id },
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: '1h' }
    );

    try {
      // Envoyer l'email de réinitialisation
      await envoyerEmail(email, 'Réinitialisation de votre mot de passe', `
        <h3>Réinitialisation de votre mot de passe</h3>
        <p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe :</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reinitialisation-mot-de-passe/${token}">
          Réinitialiser mon mot de passe
        </a>
        <p>Ce lien expire dans 1 heure.</p>
      `);
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      // Ne pas retourner d'erreur à l'utilisateur, continuer la réinitialisation
    }

    res.json({ message: 'Email de réinitialisation envoyé' });
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    res.status(500).json({ message: 'Erreur lors de la demande de réinitialisation', error: error.message });
  }
};

// Validation du nouveau mot de passe
exports.reinitialisationMotDePasse = async (req, res) => {
  try {
    const { token, nouveauMotDePasse } = req.body;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
    const utilisateur = await User.findById(decoded.id);

    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    utilisateur.motDePasse = await bcrypt.hash(nouveauMotDePasse, 10);
    await utilisateur.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Le lien de réinitialisation a expiré' });
    }
    console.error('Erreur lors de la réinitialisation:', error);
    res.status(500).json({ message: 'Erreur lors de la réinitialisation', error: error.message });
  }
};

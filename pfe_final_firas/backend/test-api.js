const mongoose = require('mongoose');
const User = require('./models/User');

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/pfe_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testAPI() {
  try {
    console.log('Connexion à MongoDB...');
    await mongoose.connection.asPromise();
    console.log('✅ Connecté à MongoDB');

    // Compter les utilisateurs
    const userCount = await User.countDocuments();
    console.log(`📊 Nombre total d'utilisateurs: ${userCount}`);

    if (userCount === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
      console.log('💡 Créez d\'abord des utilisateurs avec les scripts de seed');
      return;
    }

    // Lister quelques utilisateurs
    const users = await User.find({}, 'nom prenom email role').limit(5);
    console.log('👥 Utilisateurs trouvés:');
    users.forEach(user => {
      console.log(`  - ${user.prenom} ${user.nom} (${user.email}) - ${user.role}`);
    });

    // Tester la requête de l'API
    const participants = await User.find(
      { 
        _id: { $ne: users[0]._id }, // Exclure le premier utilisateur
        role: { $ne: 'administrateur' }
      },
      'nom prenom email photo isOnline lastSeen'
    ).sort({ nom: 1, prenom: 1 });

    console.log(`\n🔍 Participants disponibles pour le chat (excluant ${users[0].prenom} ${users[0].nom}):`);
    participants.forEach(participant => {
      console.log(`  - ${participant.prenom} ${participant.nom} (${participant.email})`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

testAPI(); 
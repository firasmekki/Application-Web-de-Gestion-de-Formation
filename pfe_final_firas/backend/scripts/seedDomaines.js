const mongoose = require('mongoose');
const Domaine = require('../models/Domaine');
require('dotenv').config();

const domaines = [
    {
        nom: "Développement Web",
        description: "Formation sur les technologies web modernes incluant HTML5, CSS3, JavaScript, React, Node.js et les frameworks populaires."
    },
    {
        nom: "Intelligence Artificielle",
        description: "Cours sur l'IA, le machine learning, le deep learning et leurs applications pratiques dans différents secteurs."
    },
    {
        nom: "Cybersécurité",
        description: "Formation sur la sécurité informatique, la protection des données, la cryptographie et les bonnes pratiques de sécurité."
    },
    {
        nom: "Cloud Computing",
        description: "Apprentissage des services cloud (AWS, Azure, GCP), de l'architecture cloud et des pratiques DevOps."
    },
    {
        nom: "Data Science",
        description: "Formation en analyse de données, statistiques, visualisation et outils de traitement de données massives."
    },
    {
        nom: "Développement Mobile",
        description: "Création d'applications mobiles pour iOS et Android, avec React Native, Flutter et les technologies natives."
    },
    {
        nom: "Gestion de Projet IT",
        description: "Méthodologies agiles, outils de gestion de projet, leadership et communication dans les projets IT."
    },
    {
        nom: "Réseaux et Systèmes",
        description: "Administration système, configuration réseau, virtualisation et conteneurisation."
    },
    {
        nom: "Design UX/UI",
        description: "Conception d'interfaces utilisateur, expérience utilisateur, prototypage et design thinking."
    },
    {
        nom: "Base de Données",
        description: "Conception et administration de bases de données SQL et NoSQL, optimisation et sécurité."
    },
    {
        nom: "IoT et Systèmes Embarqués",
        description: "Développement pour objets connectés, programmation embarquée, Arduino, Raspberry Pi et protocoles IoT."
    },
    {
        nom: "Blockchain",
        description: "Technologies blockchain, smart contracts, cryptomonnaies et applications décentralisées (DApps)."
    },
    {
        nom: "DevOps",
        description: "Pratiques DevOps, intégration continue, déploiement continu, containers et orchestration."
    },
    {
        nom: "Business Intelligence",
        description: "Analyse décisionnelle, tableaux de bord, ETL, reporting et outils de BI."
    },
    {
        nom: "Qualité Logicielle",
        description: "Tests automatisés, assurance qualité, méthodes de test, outils et bonnes pratiques."
    },
    {
        nom: "Architecture Logicielle",
        description: "Patterns de conception, architecture microservices, DDD, et bonnes pratiques de conception."
    },
    {
        nom: "Big Data",
        description: "Technologies de traitement des données massives, Hadoop, Spark, et analyses distribuées."
    },
    {
        nom: "Réalité Virtuelle/Augmentée",
        description: "Développement VR/AR, Unity, Unreal Engine et applications immersives."
    },
    {
        nom: "Sécurité des Applications",
        description: "Sécurisation des applications web et mobiles, tests de pénétration et correction des vulnérabilités."
    },
    {
        nom: "Green IT",
        description: "Développement durable, optimisation énergétique des systèmes IT et éco-conception logicielle."
    }
];

async function seedDomaines() {
    try {
        // Connexion à MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connecté à MongoDB');

        // Suppression des domaines existants
        await Domaine.deleteMany({});
        console.log('Anciens domaines supprimés');

        // Insertion des nouveaux domaines
        const insertedDomaines = await Domaine.insertMany(domaines);
        console.log(`${insertedDomaines.length} domaines ont été insérés avec succès`);

        // Déconnexion de MongoDB
        await mongoose.connection.close();
        console.log('Déconnecté de MongoDB');

    } catch (error) {
        console.error('Erreur lors du seeding:', error);
        process.exit(1);
    }
}

// Exécution du script
seedDomaines();

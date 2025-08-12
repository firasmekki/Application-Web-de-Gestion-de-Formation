# Plateforme de Formation - PFA

Une plateforme complète de gestion de formations avec système de chat en temps réel, développée avec Node.js, Express, MongoDB et React.

## 🚀 Fonctionnalités

- **Authentification** : Système de connexion/inscription avec JWT
- **Gestion des rôles** : Admin, Formateur, Participant
- **Formations** : Création, gestion et inscription aux formations
- **Chat en temps réel** : Communication entre participants et formateurs
- **Notifications** : Système de notifications en temps réel
- **Upload de fichiers** : Gestion des documents de formation
- **Statistiques** : Tableaux de bord avec analyses
- **Archivage** : Système d'archivage des formations

## 🛠️ Technologies utilisées

### Backend
- **Node.js** & **Express.js**
- **MongoDB** avec **Mongoose**
- **Socket.IO** pour le chat en temps réel
- **JWT** pour l'authentification
- **Multer** pour l'upload de fichiers
- **CORS** pour la gestion des requêtes cross-origin

### Frontend
- **React.js** avec **Redux Toolkit**
- **Tailwind CSS** pour le styling
- **Socket.IO Client** pour le chat
- **Axios** pour les requêtes HTTP
- **React Router** pour la navigation

## 📦 Installation

### Prérequis
- Node.js (version 14 ou supérieure)
- MongoDB (local ou MongoDB Atlas)
- npm ou yarn

### 1. Cloner le repository
```bash
git clone <votre-repo-url>
cd pfe_final_khalil
```

### 2. Configuration Backend
```bash
cd backend
npm install
```

### 3. Configuration des variables d'environnement
Copiez le fichier `env.example` vers `.env` et configurez vos variables :
```bash
cp env.example .env
```

Modifiez le fichier `.env` avec vos propres valeurs :
```env
DB_HOST=localhost
DB_PORT=27017
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
# ... autres variables
```

### 4. Configuration Frontend
```bash
cd ../frontend
npm install
```

### 5. Lancer l'application

#### Backend
```bash
cd backend
npm start
# ou pour le développement
npm run dev
```

#### Frontend
```bash
cd frontend
npm start
```

L'application sera accessible sur :
- Frontend : http://localhost:3000
- Backend : http://localhost:5000

## 🗄️ Base de données

### Scripts de configuration
Le projet inclut plusieurs scripts pour initialiser la base de données :

```bash
# Créer un administrateur par défaut
node scripts/createAdmin.js

# Créer un formateur
node scripts/createFormateur.js

# Créer des domaines de formation
node scripts/seedDomaines.js
```

## 📁 Structure du projet

```
├── backend/
│   ├── controllers/     # Contrôleurs API
│   ├── models/         # Modèles MongoDB
│   ├── routes/         # Routes API
│   ├── middleware/     # Middlewares
│   ├── socket/         # Gestion Socket.IO
│   ├── scripts/        # Scripts de configuration
│   └── uploads/        # Fichiers uploadés
├── frontend/
│   ├── src/
│   │   ├── components/ # Composants React
│   │   ├── pages/      # Pages de l'application
│   │   ├── redux/      # Store Redux
│   │   └── config/     # Configuration
│   └── public/         # Fichiers publics
└── README.md
```

## 🔐 Sécurité

- Les variables d'environnement sensibles sont masquées via `.gitignore`
- Authentification JWT sécurisée
- Validation des données côté serveur
- Protection CORS configurée

## 🧪 Tests

Pour tester les fonctionnalités :

```bash
# Test de l'API
cd backend
node test-api.js

# Test des sockets
node test-socket.js
```

## 📝 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion

### Formations
- `GET /api/formations` - Liste des formations
- `POST /api/formations` - Créer une formation
- `PUT /api/formations/:id` - Modifier une formation
- `DELETE /api/formations/:id` - Supprimer une formation

### Chat
- `GET /api/chat/messages` - Récupérer les messages
- `POST /api/chat/messages` - Envoyer un message

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est développé dans le cadre d'un PFA.

## 👨‍💻 Auteur

**Firas** - Développeur Full Stack

---

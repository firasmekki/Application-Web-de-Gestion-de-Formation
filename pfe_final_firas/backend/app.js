const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/error');

// Import routes
const authRoutes = require('./routes/authRoutes');
const utilisateurRoutes = require('./routes/utilisateurRoutes');
const formationRoutes = require('./routes/formationRoutes');
const domaineRoutes = require('./routes/domaineRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const archiveRoutes = require('./routes/archiveRoutes');
const chatRoutes = require('./routes/chatRoutes');
const statistiquesRoutes = require('./routes/statistiquesRoutes');
const demandeRoutes = require('./routes/demandeRoutes');
const participantRoutes = require('./routes/participantRoutes');
const formateurRoutes = require('./routes/formateurRoutes');

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/formations', formationRoutes);
app.use('/api/domaines', domaineRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/archives', archiveRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/statistiques', statistiquesRoutes);
app.use('/api/demandes', demandeRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/formateur', formateurRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;

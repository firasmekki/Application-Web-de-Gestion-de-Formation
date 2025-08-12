const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'chat');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non supporté.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// Appliquer le middleware d'authentification à toutes les routes
router.use(protect);

// Routes pour la gestion des conversations et messages
router.get('/conversations', chatController.getConversations);
router.get('/participants', chatController.getAvailableParticipants);
router.post('/conversation', chatController.getOuCreerConversation);
router.post('/message', upload.single('fichier'), chatController.envoyerMessage);
router.get('/messages/:chatId', chatController.getMessages);
router.patch('/messages/:chatId/read', chatController.markMessagesAsRead);
router.get('/online-users', (req, res) => {
  res.json({
    success: true,
    data: Array.from(chatController.onlineUsers.keys())
  });
});

module.exports = router;

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const createUploadsDir = () => {
  const uploadPath = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return uploadPath;
};

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = createUploadsDir();
    console.log('Saving file to:', uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  console.log('Received file:', file);
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    console.log('Invalid file type:', file.mimetype);
    return cb(new Error('Only image files are allowed!'), false);
  }
  
  if (!file.mimetype.startsWith('image/')) {
    console.log('Invalid mimetype:', file.mimetype);
    return cb(new Error('Le fichier doit être une image'), false);
  }
  
  console.log('File accepted:', file.originalname);
  cb(null, true);
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Add error handling middleware
const handleUpload = (req, res, next) => {
  const uploadSingle = upload.single('photo');
  
  uploadSingle(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        message: 'Erreur lors du téléchargement: ' + err.message
      });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

module.exports = handleUpload;

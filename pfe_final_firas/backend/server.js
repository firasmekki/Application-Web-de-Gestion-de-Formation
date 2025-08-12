const dotenv = require('dotenv');
const app = require('./app');
const connectDB = require('./config/database');
const initializeSocket = require('./socket/socketManager');
const createUploadsDirectory = require('./utils/createUploadsDir');
const createDefaultImage = require('./utils/createDefaultImage');

// Load env vars
dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = require('http').createServer(app);

// Initialize Socket.IO
const { io, onlineUsers } = initializeSocket(server);

// Make io accessible to routes
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Error: ', err.message);
  server.close(() => process.exit(1));
});

// Start server
const startServer = async () => {
  try {
    // Create necessary directories and files
    await createUploadsDirectory();
    await createDefaultImage();
    
    // Connect to database
    await connectDB();
    
    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is already in use. Trying port ${PORT + 1}`);
        server.close();
        server.listen(PORT + 1, () => {
          console.log(`Server is running on port ${PORT + 1}`);
        });
      } else {
        console.error('Server error:', error);
      }
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;

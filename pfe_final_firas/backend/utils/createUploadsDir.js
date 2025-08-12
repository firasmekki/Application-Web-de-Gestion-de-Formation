const fs = require('fs');
const path = require('path');

const createUploadsDirectory = () => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('Created uploads directory:', uploadsDir);
    } else {
      console.log('Uploads directory already exists:', uploadsDir);
    }
    
    // Test write permissions
    const testFile = path.join(uploadsDir, 'test.txt');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('Successfully tested write permissions');
    
  } catch (error) {
    console.error('Error setting up uploads directory:', error);
    process.exit(1);
  }
};

module.exports = createUploadsDirectory;

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { networkInterfaces } from 'os';

// Create the uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Use original filename (requirements specify no special handling for duplicates)
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Get local IP address
const getLocalIpAddress = (): string | null => {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    const netInterfaces = nets[name];
    if (netInterfaces) {
      for (const net of netInterfaces) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
  }
  return null;
};

// API Routes
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Return successful response with file details
  return res.status(200).json({
    success: true,
    message: 'File uploaded successfully',
    file: {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: `/uploads/${req.file.originalname}`
    }
  });
});

// Get list of uploaded files
app.get('/api/files', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading files directory' });
    }
    
    const fileDetails = files.map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        createdAt: stats.birthtime,
        path: `/uploads/${filename}`
      };
    });
    
    return res.json(fileDetails);
  });
});

// Start server
app.listen(PORT, () => {
  const localIp = getLocalIpAddress();
  console.log(`Server running on port ${PORT}`);
  console.log(`Local URL: http://localhost:${PORT}`);
  if (localIp) {
    console.log(`Network URL: http://${localIp}:${PORT}`);
    console.log(`Access the file sharing application at: http://${localIp}:${PORT}`);
  }
});

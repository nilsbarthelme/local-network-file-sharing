"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = require("os");
// Create the uploads directory if it doesn't exist
const uploadsDir = path_1.default.join(__dirname, '../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Use original filename (requirements specify no special handling for duplicates)
        cb(null, file.originalname);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
// Create Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(uploadsDir));
// Get local IP address
const getLocalIpAddress = () => {
    const nets = (0, os_1.networkInterfaces)();
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
    fs_1.default.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading files directory' });
        }
        const fileDetails = files.map(filename => {
            const filePath = path_1.default.join(uploadsDir, filename);
            const stats = fs_1.default.statSync(filePath);
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

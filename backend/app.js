require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { upload, cleanUpOnError } = require('./config/multer');

const app = express();

// Configuration CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cleanUpOnError);

// Service des fichiers statiques - FIXED: Options go inside express.static()
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.set('Cache-Control', 'public, max-age=31536000');
  }
}));

// Import and debug routes
console.log('Importing routes...');

const memberRoutes = require('./routes/membreRoutes');
console.log('memberRoutes type:', typeof memberRoutes, 'is function:', typeof memberRoutes === 'function');

const employeeRoutes = require('./routes/employeeRoutes');
console.log('employeeRoutes type:', typeof employeeRoutes, 'is function:', typeof employeeRoutes === 'function');

const financialRoutes = require('./routes/financialRoutes');
console.log('financialRoutes type:', typeof financialRoutes, 'is function:', typeof financialRoutes === 'function');

const attendanceRoutes = require('./routes/attendanceRoutes');
console.log('attendanceRoutes type:', typeof attendanceRoutes, 'is function:', typeof attendanceRoutes === 'function');

// Use routes with proper checks
console.log('Setting up routes...');

if (typeof memberRoutes === 'function') {
  app.use('/membres', memberRoutes);
  console.log('✓ Member routes loaded');
} else {
  console.error('✗ Member routes is not a function:', memberRoutes);
}

if (typeof employeeRoutes === 'function') {
  app.use('/employes', employeeRoutes);
  console.log('✓ Employee routes loaded');
} else {
  console.error('✗ Employee routes is not a function:', employeeRoutes);
}

if (typeof financialRoutes === 'function') {
  app.use('/finances', financialRoutes);
  console.log('✓ Financial routes loaded');
} else {
  console.error('✗ Financial routes is not a function:', financialRoutes);
}

if (typeof attendanceRoutes === 'function') {
  app.use('/attendance', attendanceRoutes);
  console.log('✓ Attendance routes loaded');
} else {
  console.error('✗ Attendance routes is not a function:', attendanceRoutes);
}

// Route de santé
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('[ERROR]', new Date().toISOString(), err.stack);
  
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Fichier trop volumineux (max 5MB)' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err.message.includes('Seuls les JPEG et PNG')) {
    return res.status(415).json({ error: err.message });
  }
  
  res.status(500).json({
    error: 'Erreur serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Gestion des 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint non trouvé' });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Serveur en écoute sur le port ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
});

// Gestion propre des shutdowns
process.on('SIGTERM', () => {
  console.log('Fermeture du serveur...');
  server.close(() => {
    console.log('Serveur arrêté');
  });
});

module.exports = app;
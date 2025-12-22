const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer le dossier uploads/members s'il n'existe pas
const uploadDir = path.join(__dirname, '../uploads/members');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom unique avec timestamp et extension originale
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `member-${uniqueSuffix}${extension}`);
  }
});

// Filtre pour les types de fichiers
const fileFilter = (req, file, cb) => {
  // Vérifier le type MIME
  if (file.mimetype.startsWith('image/')) {
    // Vérification supplémentaire de l'extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers JPEG, PNG, GIF et WebP sont autorisés'), false);
    }
  } else {
    cb(new Error('Seuls les fichiers image sont autorisés'), false);
  }
};

// Configuration Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum
    files: 1 // Un seul fichier à la fois
  }
});

// Middleware de nettoyage en cas d'erreur
const cleanUpOnError = (err, req, res, next) => {
  if (err && req.file) {
    // Supprimer le fichier uploadé en cas d'erreur
    fs.unlink(req.file.path, (unlinkErr) => {
      if (unlinkErr) {
        console.error('Erreur lors de la suppression du fichier:', unlinkErr);
      }
    });
  }
  next(err);
};

module.exports = {
  upload,
  cleanUpOnError
};
const express = require('express');
const router = express.Router();
const { upload } = require('../config/multer');
const {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getExpiredMembers,
  processRenewal,
  getRenewalInfo,
  uploadPhoto,
  deletePhoto
} = require('../controllers/membreController');

// Routes CRUD de base
router.get('/', getAllMembers);
router.get('/:id', getMemberById);

// Routes avec upload de photo
router.post('/', upload.single('photo'), createMember);
router.put('/:id', upload.single('photo'), updateMember);
router.delete('/:id', deleteMember);

// Routes pour les adhésions
router.get('/expired/list', getExpiredMembers);
router.get('/:id/renewal-info', getRenewalInfo);
router.post('/:id/process-renewal', processRenewal);

// Routes pour la gestion des photos
router.post('/:id/photo', upload.single('photo'), uploadPhoto);
router.delete('/:id/photo', deletePhoto);

module.exports = router;

const Employee = require('../models/Employee');
const multer = require('multer'); // Ajouter cette ligne

exports.getAll = async (req, res) => {
    try {
        const employees = await Employee.getAll();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const employee = await Employee.getById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employé non trouvé' });
        }
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

exports.create = [
  upload.single('photo'),
  async (req, res) => {
    try {
      console.log('Received Body:', req.body);
      console.log('Received File:', req.file);
      const employeeData = {
        nom: req.body.nom,
        prenom: req.body.prenom,
        email: req.body.email || null,
        telephone: req.body.telephone || null,
        poste: req.body.poste,
        salaire: parseFloat(req.body.salaire) || 0.00, // Assure un decimal
        date_embauche: req.body.date_embauche || new Date().toISOString().split('T')[0], // Format date
        statut: req.body.statut || 'Actif',
        photo_url: req.file ? `/uploads/${req.file.filename}` : 'https://via.placeholder.com/50'
      };
      const newId = await Employee.create(employeeData);
      res.status(201).json({ id: newId, ...employeeData });
    } catch (error) {
      console.error('Create Error:', error);
      res.status(400).json({ message: error.message });
    }
  }
];

exports.update = [
  upload.single('photo'),
  async (req, res) => {
    try {
      console.log('Received Body:', req.body);
      console.log('Received File:', req.file);
      const employeeData = {
        nom: req.body.nom,
        prenom: req.body.prenom,
        email: req.body.email || null,
        telephone: req.body.telephone || null,
        poste: req.body.poste,
        salaire: parseFloat(req.body.salaire) || 0.00,
        date_embauche: req.body.date_embauche || new Date().toISOString().split('T')[0],
        statut: req.body.statut || 'Actif',
        photo_url: req.file ? `/uploads/${req.file.filename}` : req.body.photo_url || 'https://via.placeholder.com/50'
      };
      await Employee.update(req.params.id, employeeData);
      res.json({ message: 'Employé mis à jour avec succès' });
    } catch (error) {
      console.error('Update Error:', error);
      res.status(400).json({ message: error.message });
    }
  }
];

exports.update = async (req, res) => {
    try {
        await Employee.update(req.params.id, req.body);
        res.json({ message: 'Employé mis à jour avec succès' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await Employee.delete(req.params.id);
        res.json({ message: 'Employé supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const stats = await Employee.getDashboardStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.search = async (req, res) => {
    try {
        const results = await Employee.search(req.query.q);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.processPayroll = async (req, res) => {
    try {
        const result = await Employee.processPayroll();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
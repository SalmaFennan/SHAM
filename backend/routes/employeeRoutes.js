const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

router.get('/', employeeController.getAll);
router.get('/:id', employeeController.getById);
router.post('/', employeeController.create);
router.put('/:id', employeeController.update);
router.delete('/:id', employeeController.delete);
router.get('/stats/dashboard', employeeController.getDashboardStats);
router.get('/search', employeeController.search);
router.post('/payroll', employeeController.processPayroll); 

module.exports = router;
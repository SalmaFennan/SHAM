const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/transactions', transactionController.getAll);
router.get('/transactions/overview', transactionController.getFinancialOverview);
router.post('/transactions', transactionController.create);
router.get('/transactions/memberships', transactionController.getMembershipPayments);
router.get('/transactions/evolution', transactionController.getRevenueEvolution);
router.get('/transactions/revenue-by-membership-type', transactionController.getRevenueByMembershipType); 
router.get('/transactions/monthly-revenue', transactionController.getMonthlyRevenue);
router.get('/transactions/monthly-expenses', transactionController.getMonthlyExpenses);

module.exports = router;
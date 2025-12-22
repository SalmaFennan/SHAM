const Transaction = require('../models/Transaction');

exports.getAll = async (req, res) => {
  try {
    const transactions = await Transaction.getAll();
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getFinancialOverview = async (req, res) => {
  try {
    const revenue = await Transaction.getMonthlyRevenue();
    const expenses = await Transaction.getMonthlyExpenses();
    const netProfit = (revenue.total_revenue || 0) - (expenses || 0);

    res.json({
      success: true,
      data: {
        monthlyRevenue: revenue.total_revenue || 0,
        monthlyExpenses: expenses || 0,
        netProfit: netProfit,
        revenueBreakdown: {
          adhesion: revenue.adhesion_revenue || 0,
          product: revenue.product_revenue || 0,
          course: revenue.course_revenue || 0
        },
        transactionCount: revenue.transaction_count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching financial overview:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.create = async (req, res) => {
  try {
    const newId = await Transaction.create(req.body);
    res.status(201).json({
      success: true,
      data: { id: newId, ...req.body }
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.getMembershipPayments = async (req, res) => {
  try {
    const count = await Transaction.getMembershipPayments();
    res.json({
      success: true,
      data: { count: count || 0 }
    });
  } catch (error) {
    console.error('Error fetching membership payments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getRevenueEvolution = async (req, res) => {
  try {
    const evolution = await Transaction.getRevenueEvolution();
    res.json({
      success: true,
      data: evolution || []
    });
  } catch (error) {
    console.error('Error fetching revenue evolution:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getRevenueByMembershipType = async (req, res) => {
  try {
    const revenue = await Transaction.getRevenueByMembershipType();
    res.json({
      success: true,
      data: revenue || []
    });
  } catch (error) {
    console.error('Error fetching revenue by membership type:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getMonthlyRevenue = async (req, res) => {
  try {
    const revenue = await Transaction.getMonthlyRevenue(); // À implémenter dans Transaction.js
    res.json({
      success: true,
      data: revenue
    });
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération du revenu mensuel'
    });
  }
};

exports.getMonthlyExpenses = async (req, res) => {
  try {
    const expenses = await Transaction.getMonthlyExpenses();
    res.json({
      success: true,
      data: expenses // { total: number }
    });
  } catch (error) {
    console.error('Error fetching monthly expenses:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des dépenses mensuelles'
    });
  }
};
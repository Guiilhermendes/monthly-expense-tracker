if (false) {
const express = require('express');
const {
  addExpense,
  getDashboardSummary,
  getExpenses,
  getSettings,
  setSettings,
} = require('./store');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    name: 'Monthly Expense Tracker API',
    version: '1.0.0',
    endpoints: {
      expenses: '/expenses',
      dashboard: '/dashboard',
      settings: '/settings',
    },
  });
});

app.get('/expenses', (req, res) => {
  const filters = {
    type: req.query.type || 'all',
    month: req.query.month || null,
    startDate: req.query.startDate || null,
    endDate: req.query.endDate || null,
    category: req.query.category || 'all',
  };

  const expenses = getExpenses(filters);
  res.json(expenses);
});

app.post('/expenses', (req, res) => {
  try {
    const expense = addExpense(req.body || {});
    return res.status(201).json(expense);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});

app.get('/dashboard', (req, res) => {
  try {
    const filters = {
      month: req.query.month || null,
      type: req.query.type || 'all',
      category: req.query.category || 'all',
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
    };

    return res.json(getDashboardSummary(filters));
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.get('/settings', (req, res) => {
  res.json(getSettings());
});

app.post('/settings', (req, res) => {
  try {
    const settings = setSettings(req.body || {});
    return res.status(200).json(settings);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ message: 'Invalid JSON body' });
  }

  return res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
}

module.exports = require('./api');

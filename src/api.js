const express = require('express');
const store = require('./workbook-store');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  const allowedOrigin = req.headers.origin;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(allowedOrigin || '')) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

function filters(query) {
  return { startDate: query.startDate, endDate: query.endDate, category: query.category, type: query.type, month: query.month };
}

function badRequest(res, error) { return res.status(400).json({ message: error.message }); }

app.get('/', (req, res) => res.json({ name: 'Monthly Expense Tracker API', version: '1.0.0' }));
app.get('/expenses', (req, res) => { try { return res.json(store.getExpenses(filters(req.query))); } catch (error) { return badRequest(res, error); } });
app.get('/expenses/export/csv', (req, res) => { try { return res.type('text/csv').attachment('expenses-export.csv').send(store.toCsv(store.getExpenses(filters(req.query)))); } catch (error) { return badRequest(res, error); } });
app.get('/expenses/:id', (req, res) => { const item = store.findExpense(req.params.id); return item ? res.json(item) : res.status(404).json({ message: 'Expense not found' }); });
app.post('/expenses', (req, res) => { try { return res.status(201).json(store.addExpense(req.body)); } catch (error) { return badRequest(res, error); } });
app.put('/expenses/:id', (req, res) => { try { const item = store.updateExpense(req.params.id, req.body); return item ? res.json(item) : res.status(404).json({ message: 'Expense not found' }); } catch (error) { return badRequest(res, error); } });
app.delete('/expenses/:id', (req, res) => { const item = store.removeExpense(req.params.id); return item ? res.json({ message: 'Expense removed', expense: item }) : res.status(404).json({ message: 'Expense not found' }); });

app.get('/reports/monthly-summary', (req, res) => { try { return res.json(store.monthlySummary(req.query.month)); } catch (error) { return badRequest(res, error); } });
app.get('/reports/monthly-comparison', (req, res) => { try { const months = store.monthRange(req.query.from, req.query.to); return res.json({ from: req.query.from, to: req.query.to, months: months.map(store.monthlySummary) }); } catch (error) { return badRequest(res, error); } });
app.get('/reports/by-category', (req, res) => { try { return res.json(store.categoryTotals(filters(req.query))); } catch (error) { return badRequest(res, error); } });
app.get('/reports/income-vs-expense', (req, res) => { try { const values = store.getExpenses(filters(req.query)).reduce((result, item) => { result[item.type] += item.amount; return result; }, { income: 0, expense: 0 }); return res.json({ income: values.income, expense: values.expense, balance: values.income - values.expense }); } catch (error) { return badRequest(res, error); } });

app.get('/settings', (req, res) => res.json(store.getSettings()));
app.put('/settings', (req, res) => { try { return res.json(store.setSettings(req.body)); } catch (error) { return badRequest(res, error); } });
app.post('/settings', (req, res) => { try { return res.json(store.setSettings(req.body)); } catch (error) { return badRequest(res, error); } });

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ message: 'Invalid JSON body' });
  return res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;

const fs = require('fs');
const path = require('path');

const CSV_HEADERS = ['id', 'description', 'category', 'date', 'amount', 'type', 'createdAt', 'createdAt'];
const CSV_PATH = path.resolve(__dirname, '..', 'expenses.csv');
const DEFAULT_SETTINGS = {
  baseSalary: 0,
  salarySources: [],
};

let expenses = [];
let nextId = 1;
let settings = { ...DEFAULT_SETTINGS };

function escapeCsvValue(value) {
  const stringValue = String(value ?? '');
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function writeCsv() {
  const rows = [CSV_HEADERS.join(',')];

  for (const expense of expenses) {
    rows.push([
      expense.id,
      expense.description,
      expense.category || '',
      expense.date,
      expense.amount,
      expense.type,
      expense.createdAt,
    ].map(escapeCsvValue).join(','));
  }

  fs.writeFileSync(CSV_PATH, `${rows.join('\n')}\n`, 'utf8');
}

function ensureCsvFile() {
  if (!fs.existsSync(CSV_PATH)) {
    fs.writeFileSync(CSV_PATH, `${CSV_HEADERS.join(',')}\n`, 'utf8');
  }
}

function normalizeDate(value, fallback = new Date().toISOString()) {
  if (!value) {
    return fallback;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error('Date is invalid');
  }

  return parsedDate.toISOString();
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeExpense(rawExpense = {}) {
  const description = normalizeString(rawExpense.description);
  const category = normalizeString(rawExpense.category);
  const rawAmount = Number(rawExpense.amount);
  const type = rawExpense.type === 'income' ? 'income' : 'expense';

  if (!description) {
    throw new Error('Description is required');
  }

  if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  const createdAt = new Date().toISOString();
  const date = normalizeDate(rawExpense.date, createdAt);

  return {
    id: nextId++,
    description,
    category,
    date: date.slice(0, 10),
    amount: Number(rawAmount),
    type,
    createdAt,
  };
}

function matchesFilters(expense, filters = {}) {
  const {
    type,
    month,
    startDate,
    endDate,
    category,
  } = filters;

  if (type && type !== 'all' && expense.type !== type) {
    return false;
  }

  if (month) {
    const expenseMonth = expense.date.slice(0, 7);
    if (expenseMonth !== month) {
      return false;
    }
  }

  if (startDate && expense.date < startDate) {
    return false;
  }

  if (endDate && expense.date > endDate) {
    return false;
  }

  if (category && category !== 'all' && expense.category !== category) {
    return false;
  }

  return true;
}

function getExpenses(filters = {}) {
  return expenses
    .filter((expense) => matchesFilters(expense, filters))
    .sort((firstItem, secondItem) => new Date(secondItem.createdAt) - new Date(firstItem.createdAt))
    .map((expense) => ({ ...expense }));
}

function addExpense(rawExpense) {
  const expense = normalizeExpense(rawExpense);
  expenses.push(expense);
  writeCsv();
  return { ...expense };
}

function getSettings() {
  return {
    baseSalary: Number(settings.baseSalary) || 0,
    salarySources: settings.salarySources.map((source) => ({ ...source })),
  };
}

function setSettings(nextSettings = {}) {
  const baseSalary = Number(nextSettings.baseSalary ?? settings.baseSalary ?? 0);

  if (!Number.isFinite(baseSalary) || baseSalary < 0) {
    throw new Error('Base salary must be a non-negative number');
  }

  const salarySources = Array.isArray(nextSettings.salarySources)
    ? nextSettings.salarySources.map((source, index) => ({
        id: source.id ?? index + 1,
        name: normalizeString(source.name),
        amount: Number(source.amount ?? 0),
      })).filter((source) => source.name && Number.isFinite(source.amount) && source.amount >= 0)
    : [];

  settings = {
    baseSalary,
    salarySources,
  };

  return getSettings();
}

function getMonthlyTotals(filterMonth = null) {
  const targetMonth = filterMonth || new Date().toISOString().slice(0, 7);

  const monthExpenses = getExpenses({ month: targetMonth });
  const income = monthExpenses
    .filter((expense) => expense.type === 'income')
    .reduce((sum, expense) => sum + Number(expense.amount), 0);
  const expenses = monthExpenses
    .filter((expense) => expense.type === 'expense')
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  return {
    month: targetMonth,
    income,
    expenses,
    balance: income - expenses,
  };
}

function getCategoryTotals(filter = {}) {
  const filteredExpenses = getExpenses(filter).filter((expense) => expense.type === 'expense');

  return filteredExpenses.reduce((accumulator, expense) => {
    const key = expense.category || 'Uncategorized';
    accumulator[key] = (accumulator[key] || 0) + Number(expense.amount);
    return accumulator;
  }, {});
}

function getDashboardSummary(filters = {}) {
  const selectedMonth = filters.month || new Date().toISOString().slice(0, 7);
  const monthExpenses = getExpenses({ ...filters, month: selectedMonth });

  const income = monthExpenses
    .filter((expense) => expense.type === 'income')
    .reduce((sum, expense) => sum + Number(expense.amount), 0);
  const expenses = monthExpenses
    .filter((expense) => expense.type === 'expense')
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  const monthlyComparison = [];
  const currentDate = new Date(`${selectedMonth}-01T00:00:00.000Z`);

  for (let offset = 5; offset >= 0; offset -= 1) {
    const monthDate = new Date(currentDate);
    monthDate.setUTCMonth(currentDate.getUTCMonth() - offset);
    const monthKey = monthDate.toISOString().slice(0, 7);
    const totals = getMonthlyTotals(monthKey);
    monthlyComparison.push({
      month: monthKey,
      income: totals.income,
      expenses: totals.expenses,
      balance: totals.balance,
    });
  }

  return {
    month: selectedMonth,
    summary: {
      income,
      expenses,
      balance: income - expenses,
    },
    byCategory: getCategoryTotals({ ...filters, month: selectedMonth }),
    monthlyComparison,
    settings: getSettings(),
  };
}

ensureCsvFile();

module.exports = {
  CSV_PATH,
  addExpense,
  getDashboardSummary,
  getExpenses,
  getSettings,
  normalizeExpense,
  setSettings,
  writeCsv,
};

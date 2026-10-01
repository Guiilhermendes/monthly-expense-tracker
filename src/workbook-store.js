const fs = require('fs');
const path = require('path');

const CSV_PATH = path.resolve(__dirname, '..', 'expenses.csv');
const HEADERS = ['id', 'description', 'category', 'date', 'amount', 'type', 'createdAt', 'recordType', 'settingKey', 'settingValue'];
const EXPENSE_HEADERS = HEADERS.slice(0, 7);
const DEFAULT_SETTINGS = { baseSalary: 0, salarySources: [] };

function csvValue(value) { return `"${String(value ?? '').replace(/"/g, '""')}"`; }

function parseCsvLine(line) {
  const values = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && quoted && line[index + 1] === '"') { value += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) { values.push(value); value = ''; }
    else value += character;
  }
  values.push(value);
  return values;
}

function emptyData() { return { expenses: [], settings: { ...DEFAULT_SETTINGS } }; }

function load() {
  if (!fs.existsSync(CSV_PATH)) return emptyData();
  const lines = fs.readFileSync(CSV_PATH, 'utf8').split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return emptyData();
  const headers = parseCsvLine(lines.shift());
  const loaded = emptyData();
  for (const line of lines) {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
    if (row.recordType === 'setting') {
      if (row.settingKey === 'baseSalary') loaded.settings.baseSalary = Number(row.settingValue) || 0;
      if (row.settingKey === 'salarySources') {
        try { loaded.settings.salarySources = JSON.parse(row.settingValue) || []; } catch (error) { loaded.settings.salarySources = []; }
      }
    } else if (row.id) {
      loaded.expenses.push({
        id: Number(row.id), description: row.description, category: row.category,
        date: row.date, amount: Number(row.amount), type: row.type, createdAt: row.createdAt,
      });
    }
  }
  return loaded;
}

let data = load();

function persist() {
  const rows = [HEADERS.join(',')];
  for (const item of data.expenses) rows.push(EXPENSE_HEADERS.map((header) => csvValue(item[header])).concat(['', '', '']).join(','));
  rows.push(['', '', '', '', '', '', '', 'setting', 'baseSalary', data.settings.baseSalary].map(csvValue).join(','));
  rows.push(['', '', '', '', '', '', '', 'setting', 'salarySources', JSON.stringify(data.settings.salarySources)].map(csvValue).join(','));
  const temporaryPath = `${CSV_PATH}.tmp`;
  fs.writeFileSync(temporaryPath, `${rows.join('\n')}\n`, 'utf8');
  fs.renameSync(temporaryPath, CSV_PATH);
}

function stringValue(value) { return typeof value === 'string' ? value.trim() : ''; }

function dateValue(value, fallback = new Date().toISOString().slice(0, 10)) {
  const date = value ? String(value).slice(0, 10) : fallback;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Date is invalid');
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) throw new Error('Date is invalid');
  return date;
}

function monthOf(date) { return date.slice(0, 7); }
function all() { return data.expenses.map((item) => ({ ...item })); }

function validateFilters(filters = {}) {
  if (filters.type && !['all', 'expense', 'income'].includes(filters.type)) throw new Error('Type is invalid');
  if (filters.startDate) dateValue(filters.startDate);
  if (filters.endDate) dateValue(filters.endDate);
  if (filters.month && !/^\d{4}-\d{2}$/.test(filters.month)) throw new Error('Month is invalid');
}

function matches(item, filters = {}) {
  validateFilters(filters);
  return (!filters.type || filters.type === 'all' || item.type === filters.type)
    && (!filters.month || monthOf(item.date) === filters.month)
    && (!filters.startDate || item.date >= filters.startDate)
    && (!filters.endDate || item.date <= filters.endDate)
    && (!filters.category || filters.category === 'all' || item.category === filters.category);
}

function getExpenses(filters = {}) {
  return all().filter((item) => matches(item, filters)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function normalize(input = {}, current = null) {
  const description = stringValue(input.description ?? current?.description);
  const category = stringValue(input.category ?? current?.category);
  const amount = Number(input.amount ?? current?.amount);
  const type = input.type ?? current?.type ?? 'expense';
  if (!description) throw new Error('Description is required');
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Amount must be a positive number');
  if (!['expense', 'income'].includes(type)) throw new Error('Type is invalid');
  return {
    id: current?.id ?? (data.expenses.reduce((max, item) => Math.max(max, item.id), 0) + 1), description, category,
    date: dateValue(input.date ?? current?.date), amount, type,
    createdAt: current?.createdAt ?? new Date().toISOString(),
  };
}

function addExpense(input) { const item = normalize(input); data.expenses.push(item); persist(); return { ...item }; }
function findExpense(id) { return all().find((item) => item.id === Number(id)) || null; }

function updateExpense(id, input) {
  const current = findExpense(id);
  if (!current) return null;
  const updated = normalize(input, current);
  data.expenses = data.expenses.map((item) => item.id === current.id ? updated : item);
  persist(); return { ...updated };
}

function removeExpense(id) {
  const current = findExpense(id);
  if (!current) return null;
  data.expenses = data.expenses.filter((item) => item.id !== current.id);
  persist(); return { ...current };
}

function totals(items) {
  return items.reduce((result, item) => { result[item.type] += item.amount; return result; }, { income: 0, expense: 0 });
}

function monthlySummary(month) {
  const values = totals(getExpenses({ month }));
  const baseSalary = Number(data.settings.baseSalary) || 0;
  const income = values.income + baseSalary;
  return { month, income, expenses: values.expense, balance: income - values.expense, baseSalary };
}

function monthRange(from, to) {
  if (!/^\d{4}-\d{2}$/.test(from) || !/^\d{4}-\d{2}$/.test(to) || from > to) throw new Error('Month range is invalid');
  const result = [];
  const cursor = new Date(`${from}-01T00:00:00.000Z`);
  const end = new Date(`${to}-01T00:00:00.000Z`);
  while (cursor <= end) { result.push(cursor.toISOString().slice(0, 7)); cursor.setUTCMonth(cursor.getUTCMonth() + 1); }
  return result;
}

function categoryTotals(filters = {}) {
  return getExpenses({ ...filters, type: 'expense' }).reduce((result, item) => {
    const key = item.category || 'Uncategorized'; result[key] = (result[key] || 0) + item.amount; return result;
  }, {});
}

function getSettings() { return { baseSalary: data.settings.baseSalary, salarySources: data.settings.salarySources.map((item) => ({ ...item })) }; }

function setSettings(input = {}) {
  const baseSalary = Number(input.baseSalary ?? data.settings.baseSalary);
  if (!Number.isFinite(baseSalary) || baseSalary < 0) throw new Error('Base salary must be a non-negative number');
  const sources = input.salarySources === undefined ? data.settings.salarySources : input.salarySources;
  if (!Array.isArray(sources)) throw new Error('Salary sources must be an array');
  const salarySources = sources.map((source, index) => {
    const amount = Number(source.amount);
    if (!stringValue(source.name) || !Number.isFinite(amount) || amount < 0) throw new Error('Salary source is invalid');
    return { id: source.id ?? index + 1, name: stringValue(source.name), amount };
  });
  data.settings = { baseSalary, salarySources }; persist(); return getSettings();
}

function toCsv(items) { return `${[HEADERS.join(','), ...items.map((item) => HEADERS.map((header) => csvValue(item[header])).join(','))].join('\n')}\n`; }

module.exports = { addExpense, categoryTotals, findExpense, getExpenses, getSettings, monthRange, monthlySummary, removeExpense, setSettings, toCsv, updateExpense };

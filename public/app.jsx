const { useEffect, useMemo, useState } = React;

const ICONS = {
  overview: "layout-dashboard",
  transactions: "receipt-text",
  dashboard: "bar-chart-3",
  settings: "settings-2",
  search: "search",
  calendar: "calendar-days",
  download: "download",
  plus: "plus",
  arrowUp: "trending-up",
  arrowDown: "trending-down",
  wallet: "wallet-cards",
  list: "list-ordered",
  eye: "eye",
  edit: "pencil",
  trash: "trash-2",
  x: "x",
  filter: "sliders-horizontal",
  briefcase: "briefcase-business",
  home: "house",
  utensils: "utensils",
  bus: "bus-front",
  heart: "heart-pulse",
  laptop: "laptop",
  empty: "file-search-2",
  refresh: "refresh-cw",
};
function Icon({ name, size = 15 }) {
  const iconName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  const icon = window.lucide?.icons?.[iconName] || [];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icon.map(([tag, attrs], index) =>
        React.createElement(tag, { ...attrs, key: index }),
      )}
    </svg>
  );
}

const CATEGORIES = [
  "Housing",
  "Food",
  "Transportation",
  "Healthcare",
  "Education",
  "Entertainment",
  "Shopping",
  "Salary",
  "Work",
  "Other",
];
const API_BASE_URL = window.API_BASE_URL || "http://127.0.0.1:3000";
const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value || 0,
  );
const dateLabel = (value) =>
  new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
const monthLabel = (value) =>
  new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(`${value}-01T00:00:00`),
  );
const iconFor = (category) =>
  ({
    Housing: "home",
    Food: "utensils",
    Transportation: "bus-front",
    Healthcare: "heart-pulse",
    Salary: "wallet-cards",
    Work: "laptop",
  })[category] || "circle-dollar-sign";

async function api(path, options = {}) {
  let requestPath = path;
  const reportMonth = path.match(
    /^\/reports\/(by-category|income-vs-expense)\?month=(\d{4}-\d{2})$/,
  );
  if (reportMonth) {
    const end = new Date(`${reportMonth[2]}-01T00:00:00`);
    end.setMonth(end.getMonth() + 1, 0);
    requestPath = `/reports/${reportMonth[1]}?startDate=${reportMonth[2]}-01&endDate=${end.toISOString().slice(0, 10)}`;
  }
  const comparison = path.match(
    /^\/reports\/monthly-comparison\?from=(\d{4}-\d{2})&to=\1$/,
  );
  if (comparison) {
    const start = new Date(`${comparison[1]}-01T00:00:00`);
    start.setMonth(start.getMonth() - 3);
    requestPath = `/reports/monthly-comparison?from=${start.toISOString().slice(0, 7)}&to=${comparison[1]}`;
  }
  const response = await fetch(`${API_BASE_URL}${requestPath}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok)
    throw new Error((await response.json()).message || "Request failed");
  return response.json();
}

function SummaryCard({ label, value, note, tone, icon, change }) {
  return (
    <div className={`card summary-card ${tone || ""}`}>
      <div className="summary-icon">
        <Icon name={icon} size={15} />
      </div>
      <div className="metric-label">{label}</div>
      <div
        className={`metric-value ${tone === "income" || tone === "positive" ? "green" : ""}`}
      >
        {value}
      </div>
      <div
        className={`metric-foot ${change?.startsWith("-") ? "negative" : change ? "positive" : ""}`}
      >
        {change || note}
      </div>
    </div>
  );
}
function PageHeading({ title, subtitle, children }) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  );
}
function Sidebar({ page, setPage, count }) {
  const items = [
    ["transactions", "Transactions"],
    ["dashboard", "Dashboard"],
    ["settings", "Settings"],
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Icon name="wallet-cards" size={16} />
        </div>
        <div>
          <strong>
            Monthly Expense
            <br />
            Tracker
          </strong>
          <span>Finance & control</span>
        </div>
      </div>
      <nav className="nav">
        {items.map(([id, label]) => (
          <button
            key={id}
            className={page === id ? "active" : ""}
            onClick={() => setPage(id)}
          >
            <Icon name={ICONS[id]} size={15} />
            {label}
            {id === "transactions" && <span className="count">{count}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
}
function MobileNav({ page, setPage }) {
  return (
    <nav className="mobile-nav">
      {[
        ["transactions", "Transactions"],
        ["dashboard", "Dashboard"],
        ["settings", "Settings"],
      ].map(([id, label]) => (
        <button
          key={id}
          className={page === id ? "active" : ""}
          onClick={() => setPage(id)}
        >
          <Icon name={ICONS[id]} size={17} />
          {label}
        </button>
      ))}
    </nav>
  );
}
function Topbar({ month, setMonth, search, setSearch, months }) {
  return (
    <header className="topbar">
      <div className="search">
        <Icon name="search" size={14} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transactions, categories or tags..."
        />
      </div>
      <div className="topbar-actions">
        <select
          className="month-control"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          {months.map((value) => (
            <option key={value} value={value}>
              {monthLabel(value)}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}

function TransactionModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(
    item || {
      description: "",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      category: "",
      type: "expense",
    },
  );
  const [error, setError] = useState("");
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.description.trim()) return setError("Description is required.");
    if (!Number(form.amount) || Number(form.amount) <= 0)
      return setError("Amount must be a positive number.");
    if (!form.date) return setError("Date is required.");
    onSave({ ...form, amount: Number(form.amount) });
  };
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2>{item ? "Edit transaction" : "Add transaction"}</h2>
            <p>Keep your monthly records accurate.</p>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="x" />
          </button>
        </div>
        <form className="modal-form" onSubmit={submit}>
          <div className="field">
            <label>Description</label>
            <input
              autoFocus
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="e.g. Groceries"
            />
          </div>
          <div className="modal-grid">
            <div className="field">
              <label>Amount</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="field">
              <label>Transaction date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
              />
            </div>
          </div>
          <div className="modal-grid">
            <div className="field">
              <label>
                Category <span className="metric-foot">(optional)</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
              >
                <option value="">Uncategorized</option>
                {CATEGORIES.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Type</label>
              <select
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit">
              {item ? "Save changes" : "Save transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function ConfirmModal({ onClose, onConfirm }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2>Delete transaction?</h2>
            <p>
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </p>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="x" />
          </button>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete transaction
          </button>
        </div>
      </div>
    </div>
  );
}
function Filters({ filters, setFilters, clear, categories }) {
  return (
    <div className="card filters">
      <div className="field">
        <label>Search</label>
        <div className="search">
          <Icon name="search" size={13} />
          <input
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Description, category..."
          />
        </div>
      </div>
      <div className="field">
        <label>Category</label>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="all">All</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Type</label>
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="all">All</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>
      <div className="field">
        <label>Start date</label>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
        />
      </div>
      <div className="field">
        <label>End date</label>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
      </div>
      <div className="field">
        <label>Sort by</label>
        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
        >
          <option value="date">Date (recent)</option>
          <option value="amount">Amount</option>
          <option value="description">Description</option>
        </select>
      </div>
      <button className="btn btn-small" onClick={clear}>
        <Icon name="filter" size={13} />
        Clear
      </button>
    </div>
  );
}
function TransactionsPage({
  transactions,
  setTransactions,
  month,
  recurringIncome,
  setToast,
  openModal,
}) {
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    type: "all",
    startDate: "",
    endDate: "",
    sort: "date",
  });
  const [confirm, setConfirm] = useState(null);
  const categories = [
    ...new Set(transactions.map((item) => item.category).filter(Boolean)),
  ];
  const visible = useMemo(
    () =>
      transactions
        .filter(
          (item) =>
            item.date.startsWith(month) &&
            (!filters.search ||
              `${item.description} ${item.category}`
                .toLowerCase()
                .includes(filters.search.toLowerCase())) &&
            (filters.category === "all" ||
              item.category === filters.category) &&
            (filters.type === "all" || item.type === filters.type) &&
            (!filters.startDate || item.date >= filters.startDate) &&
            (!filters.endDate || item.date <= filters.endDate),
        )
        .sort((a, b) =>
          filters.sort === "amount"
            ? b.amount - a.amount
            : filters.sort === "description"
              ? a.description.localeCompare(b.description)
              : b.date.localeCompare(a.date),
        ),
    [transactions, filters, month],
  );
  const income = visible
    .filter((i) => i.type === "income")
    .reduce((sum, i) => sum + i.amount, 0);
  const fixedIncome = filters.type === "expense" ? 0 : recurringIncome;
  const expenses = visible
    .filter((i) => i.type === "expense")
    .reduce((sum, i) => sum + i.amount, 0);
  const remove = async () => {
    const item = confirm;
    setConfirm(null);
    try {
      await api(`/expenses/${item.id}`, { method: "DELETE" });
    } catch (_) {}
    setTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== item.id),
    );
    setToast({ text: "Transaction deleted.", type: "success" });
  };
  return (
    <>
      <PageHeading
        title="Transactions"
        subtitle="Manage your monthly expenses and income"
      >
        <button className="btn" onClick={() => window.downloadCsv?.(visible)}>
          <Icon name="download" size={14} />
          Export CSV
        </button>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Icon name="plus" size={14} />
          Add transaction
        </button>
      </PageHeading>
      <div className="summary-grid">
        <SummaryCard
          label="Income for the period"
          value={money(income + fixedIncome)}
          note="Fixed monthly sources included"
          tone="income"
          icon="trending-up"
        />
        <SummaryCard
          label="Expenses for the period"
          value={money(expenses)}
          note="-4.2% vs previous month"
          tone="expense"
          icon="trending-down"
        />
        <SummaryCard
          label="Net balance"
          value={money(income + fixedIncome - expenses)}
          note={
            income + fixedIncome >= expenses
              ? "Positive balance"
              : "Review your spending"
          }
          tone="positive"
          icon="wallet-cards"
        />
        <SummaryCard
          label="Total transactions"
          value={`${visible.length} records`}
          note="Updated just now"
          icon="receipt-text"
        />
      </div>
      <Filters
        filters={filters}
        setFilters={setFilters}
        clear={() =>
          setFilters({
            search: "",
            category: "all",
            type: "all",
            startDate: "",
            endDate: "",
            sort: "date",
          })
        }
        categories={categories}
      />
      <div className="card table-card">
        {visible.length ? (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="description-cell">
                          <span className={`transaction-icon ${item.type}`}>
                            <Icon name={iconFor(item.category)} size={14} />
                          </span>
                          {item.description}
                        </div>
                      </td>
                      <td>{dateLabel(item.date)}</td>
                      <td>
                        <span className="badge category">
                          {item.category || "Uncategorized"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge type-${item.type}`}>
                          {item.type === "income" ? "Income" : "Expense"}
                        </span>
                      </td>
                      <td className={`amount ${item.type}`}>
                        {item.type === "income" ? "+" : "-"}
                        {money(item.amount)}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-btn" title="View details">
                            <Icon name="eye" size={14} />
                          </button>
                          <button
                            className="icon-btn"
                            title="Edit"
                            onClick={() => openModal(item)}
                          >
                            <Icon name="edit" size={14} />
                          </button>
                          <button
                            className="icon-btn"
                            title="Delete"
                            onClick={() => setConfirm(item)}
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="list-summary">
              <span>
                Total income{" "}
                <strong className="positive">{money(income)}</strong>
              </span>
              <span>
                Total expenses{" "}
                <strong className="negative">{money(expenses)}</strong>
              </span>
              <span>
                Balance{" "}
                <strong>{money(income + fixedIncome - expenses)}</strong>
              </span>
              <span>{visible.length} transactions</span>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <Icon name="file-search-2" size={28} />
            <p>No transactions found for this period.</p>
            <button className="btn btn-primary" onClick={() => openModal()}>
              <Icon name="plus" size={13} />
              Add your first transaction
            </button>
          </div>
        )}
      </div>
      {confirm && (
        <ConfirmModal onClose={() => setConfirm(null)} onConfirm={remove} />
      )}
    </>
  );
}

function DonutChart({ categories = {}, total = 0 }) {
  const colors = [
    "#cf4e08",
    "#5150e8",
    "#097d43",
    "#235bda",
    "#7625cc",
    "#d97706",
    "#0891b2",
    "#64748b",
  ];
  const [hovered, setHovered] = useState(null);
  const rows = Object.entries(categories).filter(
    ([, value]) => Number(value) > 0,
  );
  const chartTotal = rows.reduce((sum, [, value]) => sum + Number(value), 0);
  let cursor = 0;
  const segments = rows.map(([name, value], index) => {
    const start = cursor;
    cursor += (Number(value) / (chartTotal || 1)) * 100;
    return {
      name,
      value: Number(value),
      start,
      end: cursor,
      color: colors[index % colors.length],
    };
  });
  const selected = hovered === null ? null : segments[hovered];
  const circumference = 2 * Math.PI * 54;
  return (
    <div className="donut-layout">
      <div className="donut-wrap">
        <div className="donut">
          <svg viewBox="0 0 160 160" role="img" aria-label="Expenses by category">
            {!segments.length && (
              <circle cx="80" cy="80" r="54" fill="none" stroke="#edf0f7" strokeWidth="34" />
            )}
            {segments.map((segment, index) => (
              <circle
                key={segment.name}
                className="donut-segment"
                cx="80"
                cy="80"
                r="54"
                fill="none"
                stroke={segment.color}
                strokeWidth="34"
                strokeDasharray={`${((segment.end - segment.start) / 100) * circumference} ${circumference}`}
                strokeDashoffset={-(segment.start / 100) * circumference}
                transform="rotate(-90 80 80)"
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}
          </svg>
          <div className="donut-center">
            Total<strong>{money(total || chartTotal)}</strong>
          </div>
        </div>
        {selected && (
          <div className="chart-tooltip donut-tooltip">
            <strong>{selected.name}</strong>
            <span>
              {money(selected.value)} ·{" "}
              {Math.round((selected.value / chartTotal) * 100)}%
            </span>
          </div>
        )}
      </div>
      <div className="category-legend">
        {segments.map((segment, index) => (
          <span
            key={segment.name}
            className={hovered !== null && hovered !== index ? "muted" : ""}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
          >
            <label>
              <i style={{ background: segment.color }} />
              {segment.name}
            </label>
            <b>{Math.round((segment.value / chartTotal) * 100)}%</b>
          </span>
        ))}
        {!segments.length && (
          <span className="metric-foot">
            No expense categories for this period.
          </span>
        )}
      </div>
    </div>
  );
}
function IncomeVsExpensesChart({ comparison }) {
  const [hovered, setHovered] = useState(null);
  const max = Math.max(
    ...comparison.flatMap((item) => [Number(item.income) || 0, Number(item.expenses) || 0]),
    1,
  );
  return (
    <>
      <div className="chart-legend">
        <span><i className="dot green" />Income</span>
        <span><i className="dot red" />Expenses</span>
      </div>
      <div className="bars grouped-bars">
        {comparison.map((item) => (
          <div className="bar-group" key={item.month}>
            {[
              ["income", "green", Number(item.income) || 0],
              ["expenses", "red", Number(item.expenses) || 0],
            ].map(([type, tone, value]) => {
              const key = `${item.month}-${type}`;
              return (
                <div
                  className={`bar ${tone} ${hovered === key ? "is-hovered" : ""}`}
                  key={type}
                  style={{ height: `${Math.max(8, (value / max) * 78)}%` }}
                  onMouseEnter={() => setHovered(key)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {hovered === key && (
                    <div className="chart-tooltip bar-tooltip">
                      <strong>{monthLabel(item.month)}</strong>
                      <span>{type === "income" ? "Income" : "Expenses"}: {money(value)}</span>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="bar-label">
              {new Date(`${item.month}-01T00:00:00`).toLocaleDateString("en-US", { month: "short" })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
function LineChart({ comparison, metric = "expenses" }) {
  const [hovered, setHovered] = useState(null);
  const width = 600;
  const height = 220;
  const padding = { top: 18, right: 18, bottom: 30, left: 42 };
  const values = comparison.map((item) =>
    Math.max(0, Number(item[metric]) || 0),
  );
  const max = Math.max(...values, 1);
  const x = (index) =>
    padding.left +
    (index * (width - padding.left - padding.right)) /
      Math.max(comparison.length - 1, 1);
  const y = (value) =>
    height -
    padding.bottom -
    (value / max) * (height - padding.top - padding.bottom);
  const points = comparison
    .map((item, index) => `${x(index)},${y(values[index])}`)
    .join(" ");
  return (
    <div className="line-chart-wrap">
      <svg
        className="line-chart-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Expense evolution chart"
      >
        {[0, 0.5, 1].map((ratio) => (
          <g key={ratio}>
            <line
              className="chart-gridline-svg"
              x1={padding.left}
              x2={width - padding.right}
              y1={y(max * ratio)}
              y2={y(max * ratio)}
            />
            <text className="chart-axis-label" x={4} y={y(max * ratio) + 4}>
              {money(max * ratio).replace("$", "")}
            </text>
          </g>
        ))}
        <polyline className="line-chart-path" points={points} />
        {comparison.map((item, index) => (
          <g
            key={item.month}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            className="line-point-group"
          >
            <circle
              className="line-chart-point"
              cx={x(index)}
              cy={y(values[index])}
              r={hovered === index ? 6 : 4}
            />
            <text
              className="line-chart-label"
              x={x(index)}
              y={height - 8}
              textAnchor="middle"
            >
              {new Date(`${item.month}-01T00:00:00`).toLocaleDateString(
                "en-US",
                { month: "short" },
              )}
            </text>
            {hovered === index && (
              <g
                className="svg-tooltip"
                transform={`translate(${Math.min(x(index) - 58, width - 132)},${Math.max(y(values[index]) - 48, 4)})`}
              >
                <rect width="116" height="34" rx="6" />
                <text x="58" y="14" textAnchor="middle">
                  {monthLabel(item.month)}
                </text>
                <text x="58" y="27" textAnchor="middle">
                  {money(values[index])}
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
function Bars({ comparison, metric = "expenses" }) {
  const [hovered, setHovered] = useState(null);
  const max = Math.max(
    ...comparison.map((item) => Math.abs(Number(item[metric]) || 0)),
    1,
  );
  return (
    <div className="bars">
      {comparison.map((item) => (
        <div
          className="bar-group"
          key={item.month}
          onMouseEnter={() => setHovered(item.month)}
          onMouseLeave={() => setHovered(null)}
        >
          <div
            className={`bar ${hovered === item.month ? "is-hovered" : ""}`}
            style={{
              height: `${Math.max(8, (Math.abs(Number(item[metric]) || 0) / max) * 78)}%`,
            }}
          />
          {hovered === item.month && (
            <div className="chart-tooltip bar-tooltip">
              <strong>{monthLabel(item.month)}</strong>
              <span>{money(item[metric])}</span>
            </div>
          )}
          <div className="bar-label">
            {new Date(`${item.month}-01T00:00:00`).toLocaleDateString("en-US", {
              month: "short",
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
function DashboardPage({ month, recurringIncome, onRefresh }) {
  const [metric, setMetric] = useState("expenses");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setError("");
    Promise.all([
      api(`/reports/monthly-comparison?from=${month}&to=${month}`),
      api(`/reports/by-category?month=${month}`),
      api(`/reports/income-vs-expense?month=${month}`),
      api(`/reports/monthly-summary?month=${month}`),
    ])
      .then(([comparison, categories, totals, summary]) => {
        if (active)
          setData({
            comparison: comparison.months || [],
            categories,
            totals,
            summary,
          });
      })
      .catch(() => {
        if (active) setError("Unable to load dashboard data.");
      });
    return () => {
      active = false;
    };
  }, [month, onRefresh]);
  const comparison = (data?.comparison || []).map((item) => {
    const baseSalary = Number(item.baseSalary) || 0;
    return {
      ...item,
      income: Number(item.income || 0) - baseSalary + recurringIncome,
      balance: Number(item.balance || 0) - baseSalary + recurringIncome,
    };
  });
  const rawSummary = data?.summary || { income: 0, expenses: 0, balance: 0 };
  const summary = {
    ...rawSummary,
    income:
      Number(rawSummary.income || 0) -
      (Number(rawSummary.baseSalary) || 0) +
      recurringIncome,
    balance:
      Number(rawSummary.balance || 0) -
      (Number(rawSummary.baseSalary) || 0) +
      recurringIncome,
  };
  return (
    <>
      <PageHeading
        title="Financial dashboard"
        subtitle="Track the evolution of your finances"
      >
        <button className="btn" onClick={onRefresh}>
          <Icon name="refresh-cw" size={13} />
          Refresh data
        </button>
        <button className="btn" onClick={() => window.downloadCsv?.()}>
          <Icon name="download" size={13} />
          Export CSV
        </button>
      </PageHeading>
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="summary-grid five">
            <SummaryCard
              label="Total income"
              value={money(summary.income)}
              tone="income"
              icon="trending-up"
            />
            <SummaryCard
              label="Total expenses"
              value={money(summary.expenses)}
              tone="expense"
              icon="trending-down"
            />
            <SummaryCard
              label="Balance"
              value={money(summary.balance)}
              tone="positive"
              icon="wallet-cards"
            />
            <SummaryCard
              label="Average expenses"
              value={money(
                summary.expenses / Math.max(new Date().getDate(), 1),
              )}
              note="Based on the selected period"
              icon="calculator"
            />
            <SummaryCard
              label="Change vs previous"
              value="-"
              note="No comparison data"
              icon="arrow-up-right"
            />
          </div>
          {comparison.length ? (
            <>
              <div className="chart-grid">
                <div className="card chart-card">
                  <div className="chart-heading">
                    <div>
                      <h2>Expense evolution</h2>
                      <p>Monthly expense trend over time</p>
                    </div>
                  </div>
                  <LineChart comparison={comparison} metric="expenses" />
                </div>
                <div className="card chart-card">
                  <div className="chart-heading">
                    <div>
                      <h2>Expenses by category</h2>
                      <p>Monthly distribution</p>
                    </div>
                  </div>
                  <DonutChart
                    categories={data.categories}
                    total={summary.expenses}
                  />
                </div>
              </div>
              <div className="chart-grid equal">
                <div className="card chart-card">
                  <div className="chart-heading">
                    <div>
                      <h2>Monthly comparison</h2>
                      <p>Selected period</p>
                    </div>
                    <div className="segmented">
                      {[
                        ["expenses", "Expenses"],
                        ["income", "Income"],
                        ["balance", "Balance"],
                      ].map(([id, label]) => (
                        <button
                          key={id}
                          className={metric === id ? "active" : ""}
                          onClick={() => setMetric(id)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Bars comparison={comparison} metric={metric} />
                </div>
                <div className="card chart-card">
                  <div className="chart-heading">
                    <div>
                      <h2>Income vs. expenses</h2>
                      <p>Monthly income and expenses</p>
                    </div>
                  </div>
                  <IncomeVsExpensesChart comparison={comparison} />
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <Icon name="file-search-2" size={28} />
              <p>
                There is not enough data to generate charts for this period.
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
}

function SettingsPage({ sources, setSources, setToast }) {
  const [editing, setEditing] = useState(null);
  const total = sources.reduce((sum, s) => sum + Number(s.amount), 0);
  const saveSource = async (source) => {
    const next = source.id
      ? sources.map((item) => (item.id === source.id ? source : item))
      : [...sources, { ...source, id: Date.now() }];
    try {
      const saved = await api("/settings", {
        method: "PUT",
        body: JSON.stringify({ baseSalary: 0, salarySources: next }),
      });
      setSources(saved.salarySources);
      setEditing(null);
      setToast({ text: "Income source saved.", type: "success" });
    } catch (_) {
      setToast({ text: "Unable to save income settings.", type: "error" });
    }
  };
  const remove = async (source) => {
    const next = sources.filter((item) => item.id !== source.id);
    try {
      const saved = await api("/settings", {
        method: "PUT",
        body: JSON.stringify({ baseSalary: 0, salarySources: next }),
      });
      setSources(saved.salarySources);
      setToast({ text: "Income source removed.", type: "success" });
    } catch (_) {
      setToast({ text: "Unable to remove income source.", type: "error" });
    }
  };
  return (
    <>
      <PageHeading
        title="Income settings"
        subtitle="Manage your salary and other income sources"
      >
        <button
          className="btn btn-primary"
          onClick={() => setEditing({ name: "", amount: "", description: "" })}
        >
          <Icon name="plus" size={14} />
          Add income source
        </button>
      </PageHeading>
      <div className="summary-grid">
        <SummaryCard
          label="Total monthly income"
          value={money(total)}
          note="Fixed monthly income sources"
          tone="income"
          icon="wallet-cards"
        />
        <SummaryCard
          label="Income sources"
          value={`${sources.length} sources`}
          note="All recur monthly"
          icon="layers-2"
        />
        <SummaryCard
          label="Primary income source"
          value={sources[0]?.name || "Not configured"}
          note={
            sources[0]
              ? `${Math.round((sources[0].amount / (total || 1)) * 100)}% of total`
              : "Add your first source"
          }
          icon="briefcase-business"
        />
        <SummaryCard
          label="Last updated"
          value={new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
          }).format(new Date())}
          note="Synchronized automatically"
          icon="clock-3"
        />
      </div>
      <div className="card settings-list">
        <div className="settings-list-heading">
          <h2>My income sources</h2>
          <span className="metric-label">Configure recurring income</span>
        </div>
        {sources.length ? (
          sources.map((source) => (
            <div className="source-row" key={source.id}>
              <div className="source-icon">
                <Icon
                  name={
                    source.name.toLowerCase().includes("salary")
                      ? "briefcase-business"
                      : "laptop"
                  }
                  size={17}
                />
              </div>
              <div className="source-info">
                <div className="source-name">
                  {source.name}
                  <span className="status">Monthly</span>
                </div>
                <div className="source-description">
                  {source.description || "No description added"}
                </div>
              </div>
              <div className="source-amount">
                {money(source.amount)}
                <small>Monthly amount</small>
              </div>
              <button
                className="icon-btn"
                title="Edit"
                onClick={() => setEditing(source)}
              >
                <Icon name="edit" size={14} />
              </button>
              <button
                className="icon-btn"
                title="Remove"
                onClick={() => remove(source)}
              >
                <Icon name="trash" size={14} />
              </button>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Icon name="wallet-cards" size={28} />
            <p>No income sources configured.</p>
            <button
              className="btn btn-primary"
              onClick={() =>
                setEditing({
                  name: "",
                  amount: "",
                  description: "",
                })
              }
            >
              Add income source
            </button>
          </div>
        )}
      </div>
      {editing && (
        <IncomeModal
          source={editing}
          onClose={() => setEditing(null)}
          onSave={saveSource}
        />
      )}
    </>
  );
}
function IncomeModal({ source, onClose, onSave }) {
  const [form, setForm] = useState(source);
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2>{source.id ? "Edit income source" : "Add income source"}</h2>
            <p>Track recurring income in one place.</p>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="x" />
          </button>
        </div>
        <form
          className="modal-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (form.name && Number(form.amount) >= 0)
              onSave({ ...form, amount: Number(form.amount) });
          }}
        >
          <div className="field">
            <label>Source name</label>
            <input
              autoFocus
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Primary salary"
            />
          </div>
          <div className="field">
            <label>Monthly amount</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => update("amount", e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="field">
            <label>
              Description <span className="metric-foot">(optional)</span>
            </label>
            <input
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Type or notes"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary">Save source</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function App() {
  const initialMonth = new Date().toISOString().slice(0, 7);
  const [page, setPage] = useState("transactions");
  const [month, setMonth] = useState(initialMonth);
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [sources, setSources] = useState([]);
  const [months, setMonths] = useState([initialMonth]);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    window.setSelectedMonth = setMonth;
    return () => delete window.setSelectedMonth;
  }, []);
  useEffect(() => {
    Promise.all([api("/expenses"), api("/settings")])
      .then(([expenseData, settings]) => {
        const loadedTransactions = Array.isArray(expenseData)
          ? expenseData
          : [];
        setTransactions(loadedTransactions);
        setSources(
          Array.isArray(settings?.salarySources) ? settings.salarySources : [],
        );
        setMonths(
          [
            ...new Set([
              initialMonth,
              ...loadedTransactions.map((item) => item.date.slice(0, 7)),
            ]),
          ]
            .sort()
            .reverse(),
        );
      })
      .catch(() => {
        setTransactions([]);
        setSources([]);
        setToast({ text: "Unable to load data from the API.", type: "error" });
      });
  }, [initialMonth, refresh]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timer);
  }, [toast]);
  const saveTransaction = async (item) => {
    try {
      const saved = modal?.id
        ? await api(`/expenses/${modal.id}`, {
            method: "PUT",
            body: JSON.stringify(item),
          })
        : await api("/expenses", {
            method: "POST",
            body: JSON.stringify(item),
          });
      setTransactions((prev) =>
        modal?.id
          ? prev.map((t) => (t.id === modal.id ? saved : t))
          : [saved, ...prev],
      );
      setMonths((prev) =>
        [...new Set([item.date.slice(0, 7), ...prev])].sort().reverse(),
      );
      setModal(null);
      setToast({
        text: modal?.id
          ? "Transaction updated successfully."
          : "Transaction added successfully.",
        type: "success",
      });
    } catch (_) {
      setToast({ text: "Unable to save the transaction.", type: "error" });
    }
  };
  const exportCsv = (items = transactions) => {
    const rows = [
      ["Description", "Category", "Date", "Amount", "Type"],
      ...items.map((item) => [
        item.description,
        item.category,
        item.date,
        item.amount,
        item.type,
      ]),
    ];
    const blob = new Blob([rows.map((row) => row.join("\n")).join("\n")], {
      type: "text/csv",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "expenses-export.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };
  useEffect(() => {
    window.downloadCsv = exportCsv;
    return () => delete window.downloadCsv;
  }, [transactions]);
  const selectedTransactions = transactions.filter(
    (item) =>
      item.date.slice(0, 7) === month &&
      (!search ||
        `${item.description} ${item.category}`
          .toLowerCase()
          .includes(search.toLowerCase())),
  );
  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        setPage={setPage}
        count={selectedTransactions.length}
      />
      <div className="main">
        <Topbar
          month={month}
          setMonth={setMonth}
          search={search}
          setSearch={setSearch}
          months={months}
        />
        <main className="content">
          {page === "transactions" && (
            <TransactionsPage
              transactions={selectedTransactions}
              setTransactions={setTransactions}
              month={month}
              recurringIncome={sources.reduce(
                (sum, source) => sum + Number(source.amount || 0),
                0,
              )}
              setToast={setToast}
              openModal={(item) => setModal(item || {})}
            />
          )}
          {page === "dashboard" && (
            <DashboardPage
              month={month}
              recurringIncome={sources.reduce(
                (sum, source) => sum + Number(source.amount || 0),
                0,
              )}
              onRefresh={() => setRefresh((value) => value + 1)}
            />
          )}
          {page === "settings" && (
            <SettingsPage
              sources={sources}
              setSources={setSources}
              setToast={setToast}
            />
          )}
          {page === "overview" && (
            <DashboardPage
              month={month}
              recurringIncome={sources.reduce(
                (sum, source) => sum + Number(source.amount || 0),
                0,
              )}
              onRefresh={() => setRefresh((value) => value + 1)}
            />
          )}
        </main>
      </div>
      <MobileNav page={page} setPage={setPage} />
      {modal && (
        <TransactionModal
          item={modal.id ? modal : null}
          onClose={() => setModal(null)}
          onSave={saveTransaction}
        />
      )}
      {toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

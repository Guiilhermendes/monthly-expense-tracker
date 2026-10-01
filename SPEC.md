# Monthly Expense Tracker - Specification

## What the app does
Allows managing monthly expenses - expense visualization, adding expenses, date logging, expense categorization, month-to-month comparison, chart visualization, filters, monthly income

## Interface (Frontend)
- Home page
    - Form: Description field, amount field, expense date (current date as default value), expense category, categorization by Income vs. Expenses (expense by default)
    - List of registered expenses/income
    - Total expenses displayed at the footer of the list
- Dashboard page
    - Overview charts of monthly expenses
    - Comparison charts of expenses between months
    - Expense charts by category
    - Expense vs. Income visualization charts
    - Date filters for the charts
- Settings page
    - Form: Base salary input, salary source
        - Ability to add more than one source
    - The base salary and salary sources must be persisted in the spreadsheet data file
    - The base salary is a global setting and must be used as the base salary for every month tab

## API (Backend)
- GET /expenses -> Return all expenses from all month tabs
- GET /expenses/:id -> Return one expense by id
- POST /expenses -> Add a new expense and persist it to the month tab based on expense date
- PUT /expenses/:id -> Update an expense and persist update in spreadsheet (if month changes, move line to correct month tab)
- DELETE /expenses/:id -> Remove expense and delete it from corresponding month tab
- GET /expenses?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&category=<category>&type=expense|income -> Filter expenses by date range, category and type
- GET /reports/monthly-summary?month=YYYY-MM -> Return month totals (income, expense, balance)
- GET /reports/monthly-comparison?from=YYYY-MM&to=YYYY-MM -> Return comparison data between months
- GET /reports/by-category?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&type=expense -> Return totals grouped by category
- GET /reports/income-vs-expense?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD -> Return income vs expense totals for charts
- GET /expenses/export/csv?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD -> Export filtered data snapshot to CSV file
- GET /settings -> Return the persisted base salary and salary sources
- PUT /settings -> Update and persist the base salary and salary sources

## Rules
- Only "expense category" is not a required field
- The amount must be a positive number
- Spreadsheet is the main database for expenses/income persistence
- The data file is stored in project root and organized by month tabs (format: YYYY-MM)
- The data file must persist settings in a dedicated `settings` section alongside the month tabs:
    - `baseSalary`: non-negative number representing the base salary for all months
    - `salarySources`: list of salary sources, each with `id`, `name` and `amount`
- `baseSalary` is global: every month tab uses the current persisted value as its base salary, including month tabs created after the setting is saved
- Updating `baseSalary` changes the base salary used by all months; it must not create an expense entry or duplicate income entries in the month tabs
- Updating salary sources must persist the complete list and make it available to the Settings page after reload
- Every new line inserted from UI must be appended to corresponding month tab
- Every remove action from UI must remove the same line from corresponding month tab
- Every update action from UI must update the same line in tab; if date month changes, line must move to the new month tab
- Each expense has id, description, category, date, amount, type, createdAt
- CSV export files can be generated on demand as snapshots, but the spreadsheet remains the source of truth
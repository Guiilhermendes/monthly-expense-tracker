# Monthly Expense Tracker

A web application for recording expenses and income, tracking monthly balances, and visualizing financial trends through charts.

This project was also created as a laboratory for practicing system development with **specialized agents**. The idea is to divide the work into focused responsibilities such as interface development, API design, persistence, validation, requirements analysis, and code review, while observing how these parts connect in a real application.

## Features

- Create, edit, and delete transactions
- Classify transactions as expenses or income
- Categorize transactions
- Filter by text, category, type, and date range
- Select a month
- Export data as CSV
- Dashboard with:
  - monthly expense evolution
  - category distribution
  - comparison of expenses, income, and balance
  - income versus expenses visualization
- Configure base salary and recurring income sources
- Local persistence in a CSV file

## Technologies

- **Frontend:** React 18 via CDN, JSX, and Babel Standalone
- **Styling:** Plain CSS
- **Backend:** Node.js and Express
- **Persistence:** `expenses.csv`
- **Icons:** Lucide

## Project Structure

```text
.
├── expenses.csv          # Persisted application data
├── package.json
├── SPEC.md               # Project requirements and rules
├── public/
│   ├── app.jsx           # React interface
│   ├── index.html
│   └── styles.css
└── src/
    ├── api.js            # Express HTTP routes
    ├── app.js            # Application configuration/export
    ├── index.js          # Server entry point
    ├── store.js          # Legacy store based on a simple CSV
    └── workbook-store.js # Current expense and settings store
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the API

```bash
node src/index.js
```

By default, the API is available at `http://127.0.0.1:3000`.

### 3. Open the frontend

With the API running, open `public/index.html` in a browser. The frontend uses `http://127.0.0.1:3000` as the default API address.

To use a different address, define `window.API_BASE_URL` before `app.jsx` is loaded.

## Main API

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/expenses` | Lists transactions, with optional filters |
| `POST` | `/expenses` | Creates a transaction |
| `PUT` | `/expenses/:id` | Updates a transaction |
| `DELETE` | `/expenses/:id` | Deletes a transaction |
| `GET` | `/expenses/export/csv` | Exports filtered transactions |
| `GET` | `/reports/monthly-summary` | Returns a monthly summary |
| `GET` | `/reports/monthly-comparison` | Compares consecutive months |
| `GET` | `/reports/by-category` | Groups expenses by category |
| `GET` | `/reports/income-vs-expense` | Compares income and expenses |
| `GET` | `/settings` | Reads income settings |
| `PUT` | `/settings` | Updates base salary and income sources |

## Persistence

The `expenses.csv` file is the local data source. In addition to transactions, the current format stores settings in rows identified by `recordType=setting`.

The original specification mentions a workbook with monthly tabs. That is a possible direction for the exercise; the current implementation keeps records in a single CSV and determines the month from the `date` field.

## Practicing With Specialized Agents

The project can be developed and reviewed using agents with separate areas of responsibility, for example:

- **Requirements agent:** turns `SPEC.md` into verifiable tasks.
- **Backend agent:** implements routes, validation, and persistence rules.
- **Frontend agent:** handles components, filters, forms, and accessibility.
- **Data agent:** checks CSV consistency, reports, and monthly calculations.
- **Testing agent:** creates scenarios for the API and main interface flows.
- **Review agent:** looks for regressions, inconsistencies between the specification and code, and maintenance risks.

The goal is not only to generate code, but also to experiment with clear responsibility boundaries, contracts between modules, and cross-agent review.

## Project Status

This is a functional prototype for study. The test script has not been configured yet (`npm test` is only a placeholder), so relevant changes should be checked manually through the API and interface until an automated test suite is added.
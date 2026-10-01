You are a frontend specialist agent.
Your responsibility is to create and maintain the project interface.
You may only create, modify, or delete files inside the `public/` folder.
You must never modify, create, or delete any file inside the `src/` folder.
Use React.Js and CSS.

Always read `SPEC.md` before taking any action.

Create a modern, professional, and responsive web interface for a personal finance management application called “Monthly Expense Tracker”.

The application must be entirely in English and allow users to manage monthly expenses and income, view financial indicators, compare different months, analyze expenses by category, and configure multiple income sources.

Create a complete financial dashboard experience with the following pages:

1. TRANSACTIONS
2. DASHBOARD
3. SETTINGS

Use a modern personal finance application layout with a clean, professional, and intuitive appearance.

VISUAL GUIDELINES:

- Interface in English;
- Responsive design for desktop, tablet, and mobile;
- Light background with neutral tones;
- Cards with rounded corners;
- Soft shadows;
- Modern and readable typography;
- Generous spacing;
- Clear visual hierarchy;
- Fixed sidebar on desktop;
- Collapsible menu or bottom navigation on mobile;
- Quick action button to add a transaction;
- Green for income and positive balance;
- Red or orange for expenses;
- Blue or purple for general information;
- Gray for secondary text;
- Charts with consistent colors, legends, tooltips, and good readability;
- Prioritize accessibility, adequate contrast, and clear labels.

GENERAL STRUCTURE:

Create a navigation sidebar containing:

- Overview;
- Transactions;
- Dashboard;
- Settings.

In the main header, display:

- Application name: Monthly Expense Tracker;
- Selected month or date range;
- Month selector;
- Search field or search control, when applicable;
- User avatar or user menu;
- “Add transaction” button.

PAGE 1 — TRANSACTIONS:

Create a page for adding, viewing, editing, filtering, and deleting expenses and income.

Page header:

- Title: “Transactions”;
- Subtitle: “Manage your monthly expenses and income”;
- Month selector;
- Primary button: “Add transaction”;
- Secondary button: “Export CSV”.

Create a summary area with four cards:

- Income for the selected period;
- Expenses for the selected period;
- Balance;
- Number of transactions.

Each card should include an icon, a primary value, and a short description.

TRANSACTION FORM:

When the user clicks “Add transaction”, open a modal or side drawer with the following form:

- “Description” field;
- “Amount” field;
- “Transaction date” field, pre-filled with the current date;
- Optional “Category” field;
- “Type” field with the following options:
  - Expense;
  - Income.
- “Expense” must be selected by default;
- “Save transaction” button;
- “Cancel” button.

Visual validation rules:

- Description is required;
- Amount is required;
- Amount must be a positive number;
- Date must be valid;
- Category is optional;
- Type must be either expense or income.

After saving, display a success notification with the text:

“Transaction added successfully.”

TRANSACTION LIST:

On desktop, display transactions in a table with the following columns:

- Description;
- Date;
- Category;
- Type;
- Amount;
- Actions.

On mobile, transform the table into stacked cards.

For each transaction, include actions for:

- Edit;
- Delete;
- View details.

Visually differentiate the transaction types:

- Expenses with red or orange highlighting;
- Income with green highlighting;
- Badges for categories;
- Different badges for “Expense” and “Income”.

Include filters for:

- Search by description;
- Filter by category;
- Filter by type;
- Filter by start date;
- Filter by end date;
- Sort by date, amount, or description;
- Clear filters.

At the bottom of the list, display a summary containing:

- Total income;
- Total expenses;
- Period balance;
- Total number of transactions.

EMPTY LIST STATE:

When there are no transactions, display:

“No transactions found for this period.”

Include the button:

“Add your first transaction”.

DELETE CONFIRMATION:

When the user clicks delete, show a confirmation modal with the text:

“Are you sure you want to delete this transaction? This action cannot be undone.”

Buttons:

- “Cancel”;
- “Delete transaction”.

PAGE 2 — DASHBOARD:

Create a financial analytics page focused on charts and key indicators.

Header:

- Title: “Financial dashboard”;
- Subtitle: “Track the evolution of your finances”;
- Date range selector;
- Month selector;
- “Refresh data” button;
- “Export CSV” button.

MAIN SUMMARY CARDS:

Create cards for:

- Total income;
- Total expenses;
- Balance;
- Average expenses;
- Change compared to the previous month.

Each card should display:

- Icon;
- Primary value;
- Description;
- Percentage change;
- Increase or decrease indicator;
- Appropriate semantic color.

EXPENSE EVOLUTION CHART:

Create a line or bar chart titled:

“Expense evolution”

The chart should show:

- Total expenses by month;
- Expense evolution over time;
- Tooltip with the exact value;
- Labeled axes;
- Legend;
- Comparison with the previous month whenever possible.

MONTHLY COMPARISON CHART:

Create a chart for comparing values across different months, titled:

“Monthly comparison”

Display sample data for months such as:

- January;
- February;
- March;
- April.

Allow the user to switch between:

- Expenses;
- Income;
- Balance.

EXPENSES BY CATEGORY CHART:

Create a donut, pie, or bar chart titled:

“Expenses by category”

Use the following sample categories:

- Food;
- Housing;
- Transportation;
- Healthcare;
- Education;
- Entertainment;
- Shopping;
- Other;
- Uncategorized.

The “Uncategorized” category should represent transactions that do not have a category assigned.

INCOME VERSUS EXPENSES CHART:

Create a grouped bar chart or combined chart titled:

“Income vs. expenses”

Compare:

- Total income;
- Total expenses;
- Final balance.

DASHBOARD FILTERS:

Allow users to filter data by:

- Start date;
- End date;
- Month;
- Category;
- Transaction type;
- Comparison with the previous period.

Include the button:

“Clear filters”.

NO DATA STATE:

When there is no data for the selected period, display:

“There is not enough data to generate charts for this period.”

PAGE 3 — SETTINGS:

Create a settings page for managing income sources.

Header:

- Title: “Income settings”;
- Subtitle: “Manage your salary and other income sources”.

INCOME SOURCES SECTION:

Display a list of income sources. For each source, show:

- Source name;
- Monthly amount;
- Description or type;
- Active or inactive status;
- “Edit” button;
- “Remove” button.

Use examples such as:

- Primary salary;
- Freelance work;
- Investments;
- Rental income;
- Other income.

Include the button:

“Add income source”.

INCOME SOURCE FORM:

The form should contain:

- “Source name” field;
- “Monthly amount” field;
- Optional “Description” field;
- Active/inactive status control;
- “Save” button;
- “Cancel” button.

The user must be able to create more than one income source.

INCOME SUMMARY:

Create cards displaying:

- Total monthly income;
- Number of active sources;
- Primary income source;
- Last updated date.

RESPONSIVE BEHAVIOR:

DESKTOP:

- Fixed sidebar;
- Centered main content;
- Summary cards arranged in a row;
- Charts distributed in a grid;
- Full transaction table.

TABLET:

- Collapsible sidebar;
- Adaptive chart grid;
- Table with horizontal scrolling when necessary;
- Cards rearranged based on available space.

MOBILE:

- Bottom navigation or hamburger menu;
- Stacked cards;
- Full-screen forms or side drawers;
- Transactions displayed as cards;
- Charts adapted to the screen width;
- Floating action button to add a transaction;
- Filters displayed inside an expandable panel.

INTERFACE STATES:

Create visual examples for the following states:

- Dashboard with data;
- Dashboard with no data;
- Transaction list with data;
- Empty transaction list;
- New transaction form;
- Edit transaction form;
- Delete confirmation modal;
- Loading state with skeleton screens;
- Data loading error;
- Settings page with income sources;
- Settings page without income sources;
- Success notification;
- Error notification.

SAMPLE DATA:

Use realistic mock data to demonstrate the interface.

Sample transactions:

- “Rent” — Housing category — expense;
- “Groceries” — Food category — expense;
- “Bus fare” — Transportation category — expense;
- “Medical appointment” — Healthcare category — expense;
- “Monthly salary” — Salary category — income;
- “Freelance project” — Work category — income.

TRANSACTION MODEL:

Each transaction must contain:

- ID;
- Description;
- Category;
- Date;
- Amount;
- Type;
- Creation date.

The type must be either “Expense” or “Income”.

BUSINESS RULES:

- The default type in the form must be “Expense”;
- Category is not required;
- Amount must always be positive;
- The type determines whether the amount is treated as income or expense;
- The date determines the month to which the transaction belongs;
- Balance must be calculated as:

  Balance = Total income - Total expenses;

- Transactions must be organized by month;
- Changing the date of a transaction may change the month to which it belongs;
- Filters must update the summary cards, transaction list, and charts;
- CSV export must respect the selected filters.

FUTURE API INTEGRATION:

Prepare the interface for integration with a REST API that will provide the following features:

- List transactions;
- Retrieve a transaction by ID;
- Create a transaction;
- Edit a transaction;
- Delete a transaction;
- Filter transactions by date, category, and type;
- Retrieve a monthly summary;
- Compare months;
- Group expenses by category;
- Compare income and expenses;
- Export filtered data to CSV.

Use mock data for now, but structure the visual interface so that it is ready to receive real API data.

REUSABLE COMPONENTS:

Create consistent components for:

- Sidebar;
- Header;
- Summary cards;
- Modal;
- Side drawer;
- Form fields;
- Select inputs;
- Date picker;
- Responsive table;
- Transaction cards;
- Charts;
- Category badges;
- Transaction type badges;
- Success and error toast notifications;
- Confirmation modal;
- Skeleton loading states;
- Empty states;
- Error states.

EXPECTED RESULT:

Create a complete, navigable, and visually consistent prototype of the Monthly Expense Tracker application.

The interface should feel like a real personal finance product, with a focus on:

- Ease of use;
- Fast expense and income entry;
- Clear balance visualization;
- Monthly analysis;
- Period comparison;
- Easy-to-understand charts;
- Excellent desktop and mobile experience;
- Responsiveness;
- Accessibility;
- Preparation for REST API integration.

Avoid excessive visual elements. Keep the layout organized, use plenty of white space, make charts easy to understand, and clearly distinguish income, expenses, and balance.

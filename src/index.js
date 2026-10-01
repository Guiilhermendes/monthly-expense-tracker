const app = require('./app');

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Monthly Expense Tracker API running on port ${port}`);
});

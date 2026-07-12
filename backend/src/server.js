import express from 'express';
import { initDb } from './db.js';
import { seedDb } from './seed.js';
import authRouter from './routes/auth.js';
import vehiclesRouter from './routes/vehicles.js';
import driversRouter from './routes/drivers.js';
import tripsRouter from './routes/trips.js';
import maintenanceRouter from './routes/maintenance.js';
import fuelExpensesRouter from './routes/fuelExpenses.js';
import reportsRouter from './routes/reports.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Body parser
app.use(express.json());

// Custom CORS middleware (offline-safe, no external package issues)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize Database & Seed
try {
  initDb();
  seedDb();
} catch (error) {
  console.error('Error during database initialization/seeding:', error);
}

// Routes
app.use('/api/auth', authRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/drivers', driversRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api', fuelExpensesRouter); // Handles /api/fuel-logs and /api/expenses
app.use('/api/reports', reportsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`TransitOps API server is running on http://localhost:${PORT}`);
});

import { Router } from 'express';
import { db } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

const fuelLogSchema = z.object({
  vehicleId: z.number(),
  tripId: z.number().nullable().optional(),
  liters: z.number().positive(),
  cost: z.number().positive(),
  date: z.string().optional()
});

const expenseSchema = z.object({
  vehicleId: z.number(),
  category: z.enum(['toll', 'other', 'maintenance']),
  amount: z.number().positive(),
  description: z.string().min(1)
});

// GET /api/fuel-logs
router.get('/fuel-logs', authenticate, (req, res) => {
  const logs = db.prepare(`
    SELECT FuelLogs.*, Vehicles.registrationNumber as vehicleReg
    FROM FuelLogs
    JOIN Vehicles ON FuelLogs.vehicleId = Vehicles.id
    ORDER BY FuelLogs.id DESC
  `).all();
  return res.json(logs);
});

// POST /api/fuel-logs
router.post('/fuel-logs', authenticate, authorize(['FleetManager', 'Driver', 'FinancialAnalyst']), (req, res) => {
  const parsed = fuelLogSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
  }

  const { vehicleId, tripId, liters, cost, date } = parsed.data;

  // Insert Fuel Log
  const insert = db.prepare(`
    INSERT INTO FuelLogs (vehicleId, tripId, liters, cost, date)
    VALUES (?, ?, ?, ?, COALESCE(?, datetime("now")))
  `);

  try {
    const result = insert.run(vehicleId, tripId || null, liters, cost, date || null);
    const insertedId = result.lastInsertRowid;
    const created = db.prepare('SELECT * FROM FuelLogs WHERE id = ?').get(insertedId);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Database error' });
  }
});

// GET /api/expenses
router.get('/expenses', authenticate, (req, res) => {
  const expenses = db.prepare(`
    SELECT Expenses.*, Vehicles.registrationNumber as vehicleReg
    FROM Expenses
    JOIN Vehicles ON Expenses.vehicleId = Vehicles.id
    ORDER BY Expenses.id DESC
  `).all();
  return res.json(expenses);
});

// POST /api/expenses
router.post('/expenses', authenticate, authorize(['FleetManager', 'FinancialAnalyst']), (req, res) => {
  const parsed = expenseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
  }

  const { vehicleId, category, amount, description } = parsed.data;

  const insert = db.prepare(`
    INSERT INTO Expenses (vehicleId, category, amount, date, description)
    VALUES (?, ?, ?, datetime("now"), ?)
  `);

  try {
    const result = insert.run(vehicleId, category, amount, description);
    const insertedId = result.lastInsertRowid;
    const created = db.prepare('SELECT * FROM Expenses WHERE id = ?').get(insertedId);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Database error' });
  }
});

export default router;

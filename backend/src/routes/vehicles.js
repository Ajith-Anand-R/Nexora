import { Router } from 'express';
import { db } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

const vehicleSchema = z.object({
  registrationNumber: z.string().min(1),
  nameModel: z.string().min(1),
  type: z.string().min(1),
  maxLoadCapacity: z.number().positive(),
  odometer: z.number().nonnegative(),
  acquisitionCost: z.number().positive(),
  region: z.string().min(1),
  status: z.enum(['Available', 'On Trip', 'In Shop', 'Retired']).default('Available')
});

// GET /api/vehicles
router.get('/', authenticate, (req, res) => {
  const { status, type, region } = req.query;

  let query = 'SELECT * FROM Vehicles WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  if (region) {
    query += ' AND region = ?';
    params.push(region);
  }

  query += ' ORDER BY id DESC';

  const stmt = db.prepare(query);
  const vehicles = stmt.all(...params);
  return res.json(vehicles);
});

// GET /api/vehicles/:id
router.get('/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const vehicle = db.prepare('SELECT * FROM Vehicles WHERE id = ?').get(id);
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  return res.json(vehicle);
});

// POST /api/vehicles - FleetManager only
router.post('/', authenticate, authorize(['FleetManager']), (req, res) => {
  const parsed = vehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
  }

  const v = parsed.data;

  // Check unique registrationNumber
  const existing = db.prepare('SELECT id FROM Vehicles WHERE registrationNumber = ?').get(v.registrationNumber);
  if (existing) {
    return res.status(400).json({ error: 'Registration number already exists' });
  }

  const insert = db.prepare(`
    INSERT INTO Vehicles (registrationNumber, nameModel, type, maxLoadCapacity, odometer, acquisitionCost, region, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  try {
    const result = insert.run(v.registrationNumber, v.nameModel, v.type, v.maxLoadCapacity, v.odometer, v.acquisitionCost, v.region, v.status);
    const insertedId = result.lastInsertRowid;
    const created = db.prepare('SELECT * FROM Vehicles WHERE id = ?').get(insertedId);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Database error' });
  }
});

// PUT /api/vehicles/:id - FleetManager only
router.put('/:id', authenticate, authorize(['FleetManager']), (req, res) => {
  const { id } = req.params;
  const parsed = vehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
  }

  const v = parsed.data;

  // Check existence
  const existing = db.prepare('SELECT id FROM Vehicles WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  // Check unique registrationNumber excluding current
  const duplicate = db.prepare('SELECT id FROM Vehicles WHERE registrationNumber = ? AND id != ?').get(v.registrationNumber, id);
  if (duplicate) {
    return res.status(400).json({ error: 'Registration number already exists on another vehicle' });
  }

  const update = db.prepare(`
    UPDATE Vehicles
    SET registrationNumber = ?, nameModel = ?, type = ?, maxLoadCapacity = ?, odometer = ?, acquisitionCost = ?, region = ?, status = ?
    WHERE id = ?
  `);

  try {
    update.run(v.registrationNumber, v.nameModel, v.type, v.maxLoadCapacity, v.odometer, v.acquisitionCost, v.region, v.status, id);
    const updated = db.prepare('SELECT * FROM Vehicles WHERE id = ?').get(id);
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Database error' });
  }
});

// PUT /api/vehicles/:id/retire - One-way retire (FleetManager only)
router.put('/:id/retire', authenticate, authorize(['FleetManager']), (req, res) => {
  const { id } = req.params;
  const vehicle = db.prepare('SELECT * FROM Vehicles WHERE id = ?').get(id);
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  const update = db.prepare('UPDATE Vehicles SET status = "Retired" WHERE id = ?');
  update.run(id);
  
  const updated = db.prepare('SELECT * FROM Vehicles WHERE id = ?').get(id);
  return res.json(updated);
});

export default router;

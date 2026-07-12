import { Router } from 'express';
import { db } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

const driverSchema = z.object({
  name: z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseCategory: z.string().min(1),
  licenseExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  contactNumber: z.string().min(1),
  safetyScore: z.number().min(0).max(100).default(100.0),
  status: z.enum(['Available', 'On Trip', 'Off Duty', 'Suspended']).default('Available')
});

// GET /api/drivers
router.get('/', authenticate, (req, res) => {
  const { status } = req.query;

  let query = 'SELECT * FROM Drivers WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY id DESC';

  const stmt = db.prepare(query);
  const drivers = stmt.all(...params);
  return res.json(drivers);
});

// GET /api/drivers/:id
router.get('/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const driver = db.prepare('SELECT * FROM Drivers WHERE id = ?').get(id);
  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }
  return res.json(driver);
});

// POST /api/drivers - FleetManager only
router.post('/', authenticate, authorize(['FleetManager']), (req, res) => {
  const parsed = driverSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
  }

  const d = parsed.data;

  // Check unique licenseNumber
  const existing = db.prepare('SELECT id FROM Drivers WHERE licenseNumber = ?').get(d.licenseNumber);
  if (existing) {
    return res.status(400).json({ error: 'License number already exists' });
  }

  const insert = db.prepare(`
    INSERT INTO Drivers (name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  try {
    const result = insert.run(d.name, d.licenseNumber, d.licenseCategory, d.licenseExpiryDate, d.contactNumber, d.safetyScore, d.status);
    const insertedId = result.lastInsertRowid;
    const created = db.prepare('SELECT * FROM Drivers WHERE id = ?').get(insertedId);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Database error' });
  }
});

// PUT /api/drivers/:id - FleetManager (full) & SafetyOfficer (score, status)
router.put('/:id', authenticate, authorize(['FleetManager', 'SafetyOfficer']), (req, res) => {
  const { id } = req.params;
  const userRole = req.user.role;

  const existing = db.prepare('SELECT * FROM Drivers WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Driver not found' });
  }

  if (userRole === 'SafetyOfficer') {
    // SafetyOfficer can only update status and safetyScore
    const safetySchema = z.object({
      status: z.enum(['Available', 'On Trip', 'Off Duty', 'Suspended']),
      safetyScore: z.number().min(0).max(100)
    });

    const parsed = safetySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
    }

    const { status, safetyScore } = parsed.data;
    const update = db.prepare('UPDATE Drivers SET status = ?, safetyScore = ? WHERE id = ?');
    try {
      update.run(status, safetyScore, id);
      const updated = db.prepare('SELECT * FROM Drivers WHERE id = ?').get(id);
      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Database error' });
    }
  } else {
    // FleetManager has full update
    const parsed = driverSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
    }

    const d = parsed.data;

    // Check unique licenseNumber
    const duplicate = db.prepare('SELECT id FROM Drivers WHERE licenseNumber = ? AND id != ?').get(d.licenseNumber, id);
    if (duplicate) {
      return res.status(400).json({ error: 'License number already exists on another driver' });
    }

    const update = db.prepare(`
      UPDATE Drivers
      SET name = ?, licenseNumber = ?, licenseCategory = ?, licenseExpiryDate = ?, contactNumber = ?, safetyScore = ?, status = ?
      WHERE id = ?
    `);

    try {
      update.run(d.name, d.licenseNumber, d.licenseCategory, d.licenseExpiryDate, d.contactNumber, d.safetyScore, d.status, id);
      const updated = db.prepare('SELECT * FROM Drivers WHERE id = ?').get(id);
      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Database error' });
    }
  }
});

// PUT /api/drivers/:id/suspend
router.put('/:id/suspend', authenticate, authorize(['FleetManager', 'SafetyOfficer']), (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT id FROM Drivers WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Driver not found' });
  }

  const update = db.prepare('UPDATE Drivers SET status = "Suspended" WHERE id = ?');
  update.run(id);

  const updated = db.prepare('SELECT * FROM Drivers WHERE id = ?').get(id);
  return res.json(updated);
});

export default router;

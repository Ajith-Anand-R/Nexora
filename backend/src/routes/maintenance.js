import { Router } from 'express';
import { db, runTransaction } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

const maintenanceSchema = z.object({
  vehicleId: z.number(),
  description: z.string().min(1),
  cost: z.number().nonnegative()
});

// GET /api/maintenance
router.get('/', authenticate, (req, res) => {
  const logs = db.prepare(`
    SELECT MaintenanceLogs.*, Vehicles.registrationNumber as vehicleReg, Vehicles.nameModel as vehicleModel
    FROM MaintenanceLogs
    JOIN Vehicles ON MaintenanceLogs.vehicleId = Vehicles.id
    ORDER BY MaintenanceLogs.id DESC
  `).all();
  return res.json(logs);
});

// POST /api/maintenance
router.post('/', authenticate, authorize(['FleetManager']), (req, res) => {
  const parsed = maintenanceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
  }

  const { vehicleId, description, cost } = parsed.data;

  const vehicle = db.prepare('SELECT status FROM Vehicles WHERE id = ?').get(vehicleId);
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  if (vehicle.status === 'Retired') {
    return res.status(400).json({ error: 'Cannot put a retired vehicle in maintenance' });
  }
  if (vehicle.status === 'On Trip') {
    return res.status(400).json({ error: 'Cannot put an active trip vehicle in maintenance' });
  }

  try {
    const createdLog = runTransaction(() => {
      // 1. Create Maintenance Log
      db.prepare(`
        INSERT INTO MaintenanceLogs (vehicleId, description, cost, status, startDate)
        VALUES (?, ?, ?, "Active", datetime("now"))
      `).run(vehicleId, description, cost);

      const logId = (db.prepare('SELECT last_insert_rowid() as id').get()).id;

      // 2. Set vehicle to In Shop
      db.prepare('UPDATE Vehicles SET status = "In Shop" WHERE id = ?').run(vehicleId);

      // 3. Add to Expenses
      db.prepare(`
        INSERT INTO Expenses (vehicleId, category, amount, date, description)
        VALUES (?, "maintenance", ?, datetime("now"), ?)
      `).run(vehicleId, cost, `Maintenance: ${description}`);

      return db.prepare('SELECT * FROM MaintenanceLogs WHERE id = ?').get(logId);
    });

    return res.status(201).json(createdLog);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Database error' });
  }
});

// PUT /api/maintenance/:id/close
router.put('/:id/close', authenticate, authorize(['FleetManager']), (req, res) => {
  const { id } = req.params;

  const log = db.prepare('SELECT * FROM MaintenanceLogs WHERE id = ?').get(id);
  if (!log) {
    return res.status(404).json({ error: 'Maintenance log not found' });
  }

  if (log.status !== 'Active') {
    return res.status(400).json({ error: 'Maintenance log is already closed' });
  }

  try {
    const closedLog = runTransaction(() => {
      // 1. Close Log
      db.prepare('UPDATE MaintenanceLogs SET status = "Closed", endDate = datetime("now") WHERE id = ?').run(id);

      // 2. Update Vehicle Status
      const vehicle = db.prepare('SELECT status FROM Vehicles WHERE id = ?').get(log.vehicleId);
      if (vehicle && vehicle.status !== 'Retired') {
        db.prepare('UPDATE Vehicles SET status = "Available" WHERE id = ?').run(log.vehicleId);
      }

      return db.prepare('SELECT * FROM MaintenanceLogs WHERE id = ?').get(id);
    });

    return res.json(closedLog);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Database error' });
  }
});

export default router;

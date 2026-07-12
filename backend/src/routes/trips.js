import { Router } from 'express';
import { db, runTransaction } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

const tripCreateSchema = z.object({
  source: z.string().min(1),
  destination: z.string().min(1),
  vehicleId: z.number(),
  driverId: z.number(),
  cargoWeight: z.number().positive(),
  plannedDistance: z.number().positive(),
  startOdometer: z.number().nonnegative()
});

const tripCompleteSchema = z.object({
  finalOdometer: z.number().positive()
});

// GET /api/trips
router.get('/', authenticate, (req, res) => {
  const { status } = req.query;
  let query = `
    SELECT Trips.*, 
           Vehicles.registrationNumber as vehicleReg, Vehicles.nameModel as vehicleModel,
           Drivers.name as driverName, Drivers.licenseNumber as driverLicense
    FROM Trips
    JOIN Vehicles ON Trips.vehicleId = Vehicles.id
    JOIN Drivers ON Trips.driverId = Drivers.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    query += ' AND Trips.status = ?';
    params.push(status);
  }

  query += ' ORDER BY Trips.id DESC';

  const trips = db.prepare(query).all(...params);
  return res.json(trips);
});

// GET /api/trips/:id
router.get('/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const trip = db.prepare(`
    SELECT Trips.*, 
           Vehicles.registrationNumber as vehicleReg, Vehicles.nameModel as vehicleModel,
           Drivers.name as driverName, Drivers.licenseNumber as driverLicense
    FROM Trips
    JOIN Vehicles ON Trips.vehicleId = Vehicles.id
    JOIN Drivers ON Trips.driverId = Drivers.id
    WHERE Trips.id = ?
  `).get(id);

  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }
  return res.json(trip);
});

// POST /api/trips
router.post('/', authenticate, authorize(['FleetManager', 'Driver']), (req, res) => {
  const parsed = tripCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
  }

  const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance, startOdometer } = parsed.data;

  // Retrieve vehicle & driver to run checks
  const vehicle = db.prepare('SELECT * FROM Vehicles WHERE id = ?').get(vehicleId);
  const driver = db.prepare('SELECT * FROM Drivers WHERE id = ?').get(driverId);

  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
  if (!driver) return res.status(404).json({ error: 'Driver not found' });

  // Cargo capacity check
  if (cargoWeight > vehicle.maxLoadCapacity) {
    return res.status(400).json({ error: `Cargo weight exceeds vehicle max load capacity of ${vehicle.maxLoadCapacity}kg` });
  }

  // Insert trip as Draft
  const insert = db.prepare(`
    INSERT INTO Trips (source, destination, vehicleId, driverId, cargoWeight, plannedDistance, startOdometer, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Draft')
  `);

  try {
    const result = insert.run(source, destination, vehicleId, driverId, cargoWeight, plannedDistance, startOdometer);
    const insertedId = result.lastInsertRowid;
    const created = db.prepare('SELECT * FROM Trips WHERE id = ?').get(insertedId);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Database error' });
  }
});

// PUT /api/trips/:id/dispatch
router.put('/:id/dispatch', authenticate, authorize(['FleetManager', 'Driver']), (req, res) => {
  const { id } = req.params;

  const trip = db.prepare('SELECT * FROM Trips WHERE id = ?').get(id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  if (trip.status !== 'Draft') {
    return res.status(400).json({ error: `Cannot dispatch trip in ${trip.status} state` });
  }

  try {
    const updatedTrip = runTransaction(() => {
      const vehicle = db.prepare('SELECT * FROM Vehicles WHERE id = ?').get(trip.vehicleId);
      const driver = db.prepare('SELECT * FROM Drivers WHERE id = ?').get(trip.driverId);

      if (vehicle.status !== 'Available') {
        throw new Error(`Vehicle not available (current status: ${vehicle.status})`);
      }
      if (vehicle.status === 'Retired') {
        throw new Error('Vehicle retired');
      }
      if (driver.status !== 'Available') {
        throw new Error(`Driver not available (current status: ${driver.status})`);
      }
      if (driver.status === 'Suspended') {
        throw new Error('Driver suspended');
      }

      // Expiry check
      const expiryDate = new Date(driver.licenseExpiryDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (expiryDate < today) {
        throw new Error('Driver license expired');
      }

      if (trip.cargoWeight > vehicle.maxLoadCapacity) {
        throw new Error('Cargo weight exceeds vehicle capacity');
      }

      // Perform updates
      db.prepare("UPDATE Trips SET status = 'Dispatched', dispatchedAt = datetime('now') WHERE id = ?").run(id);
      db.prepare("UPDATE Vehicles SET status = 'On Trip' WHERE id = ?").run(trip.vehicleId);
      db.prepare("UPDATE Drivers SET status = 'On Trip' WHERE id = ?").run(trip.driverId);

      return db.prepare('SELECT * FROM Trips WHERE id = ?').get(id);
    });

    return res.json(updatedTrip);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Dispatch failed' });
  }
});

// PUT /api/trips/:id/start
router.put('/:id/start', authenticate, authorize(['FleetManager', 'Driver']), (req, res) => {
  const { id } = req.params;
  const trip = db.prepare('SELECT * FROM Trips WHERE id = ?').get(id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  if (trip.status !== 'Dispatched') {
    return res.status(400).json({ error: `Cannot start trip in ${trip.status} state` });
  }

  const update = db.prepare("UPDATE Trips SET status = 'En Route' WHERE id = ?");
  update.run(id);

  const updated = db.prepare('SELECT * FROM Trips WHERE id = ?').get(id);
  return res.json(updated);
});

// PUT /api/trips/:id/complete
router.put('/:id/complete', authenticate, authorize(['FleetManager', 'Driver']), (req, res) => {
  const { id } = req.params;
  const parsed = tripCompleteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
  }

  const { finalOdometer } = parsed.data;

  const trip = db.prepare('SELECT * FROM Trips WHERE id = ?').get(id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  if (trip.status !== 'En Route') {
    return res.status(400).json({ error: `Cannot complete trip in ${trip.status} state` });
  }

  if (finalOdometer < trip.startOdometer) {
    return res.status(400).json({ error: `Final odometer cannot be less than starting odometer (${trip.startOdometer} km)` });
  }

  try {
    const updatedTrip = runTransaction(() => {
      const actualDistance = finalOdometer - trip.startOdometer;
      
      // Calculate fuel consumed based on vehicle type
      const vehicle = db.prepare('SELECT * FROM Vehicles WHERE id = ?').get(trip.vehicleId);
      let rate = 0.15; // default 15L/100km
      if (vehicle) {
        if (vehicle.type === 'Van') rate = 0.10;
        else if (vehicle.type === 'Semi') rate = 0.35;
        else if (vehicle.type === 'Box Truck') rate = 0.20;
      }
      const fuelConsumed = actualDistance * rate;

      // 1. Complete Trip
      db.prepare(`
        UPDATE Trips 
        SET status = 'Completed', completedAt = datetime('now'), actualDistance = ?, fuelConsumed = ?, finalOdometer = ?
        WHERE id = ?
      `).run(actualDistance, fuelConsumed, finalOdometer, id);

      // 2. Add Fuel Log
      db.prepare(`
        INSERT INTO FuelLogs (vehicleId, tripId, liters, cost, date)
        VALUES (?, ?, ?, ?, datetime('now'))
      `).run(trip.vehicleId, id, fuelConsumed, fuelConsumed * 1.5);

      // 3. Update Vehicle Odometer
      db.prepare("UPDATE Vehicles SET status = 'Available', odometer = ? WHERE id = ?").run(finalOdometer, trip.vehicleId);

      // 4. Update Driver
      db.prepare("UPDATE Drivers SET status = 'Available' WHERE id = ?").run(trip.driverId);

      return db.prepare('SELECT * FROM Trips WHERE id = ?').get(id);
    });

    return res.json(updatedTrip);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Database transaction error' });
  }
});

// PUT /api/trips/:id/cancel
router.put('/:id/cancel', authenticate, authorize(['FleetManager', 'Driver']), (req, res) => {
  const { id } = req.params;

  const trip = db.prepare('SELECT * FROM Trips WHERE id = ?').get(id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  if (trip.status !== 'Dispatched') {
    return res.status(400).json({ error: `Cannot cancel trip in ${trip.status} state` });
  }

  try {
    const updatedTrip = runTransaction(() => {
      // 1. Cancel Trip
      db.prepare("UPDATE Trips SET status = 'Cancelled' WHERE id = ?").run(id);

      // 2. Revert Vehicle
      db.prepare("UPDATE Vehicles SET status = 'Available' WHERE id = ?").run(trip.vehicleId);

      // 3. Revert Driver
      db.prepare("UPDATE Drivers SET status = 'Available' WHERE id = ?").run(trip.driverId);

      return db.prepare('SELECT * FROM Trips WHERE id = ?').get(id);
    });

    return res.json(updatedTrip);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Database transaction error' });
  }
});

export default router;

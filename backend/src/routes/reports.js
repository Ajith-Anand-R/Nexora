import { Router } from 'express';
import { db } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/reports/dashboard
router.get('/dashboard', authenticate, (req, res) => {
  try {
    const totalVehicles = (db.prepare("SELECT COUNT(*) as count FROM Vehicles WHERE status != 'Retired'").get()).count;
    const activeVehicles = (db.prepare("SELECT COUNT(*) as count FROM Vehicles WHERE status = 'On Trip'").get()).count;
    const inShopVehicles = (db.prepare("SELECT COUNT(*) as count FROM Vehicles WHERE status = 'In Shop'").get()).count;
    const retiredVehicles = (db.prepare("SELECT COUNT(*) as count FROM Vehicles WHERE status = 'Retired'").get()).count;

    const activeTrips = (db.prepare("SELECT COUNT(*) as count FROM Trips WHERE status = 'Dispatched'").get()).count;
    const totalDrivers = (db.prepare("SELECT COUNT(*) as count FROM Drivers").get()).count;
    const activeDrivers = (db.prepare("SELECT COUNT(*) as count FROM Drivers WHERE status = 'On Trip'").get()).count;

    const fuelCost = (db.prepare('SELECT SUM(cost) as sum FROM FuelLogs').get()).sum || 0;
    const expenseCost = (db.prepare('SELECT SUM(amount) as sum FROM Expenses').get()).sum || 0;
    const totalCost = fuelCost + expenseCost;

    // Fleet utilization %
    const utilization = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

    return res.json({
      metrics: {
        totalVehicles,
        activeVehicles,
        inShopVehicles,
        retiredVehicles,
        activeTrips,
        totalDrivers,
        activeDrivers,
        totalCost,
        utilization
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Database query error' });
  }
});

// GET /api/reports/fleet-utilization
router.get('/fleet-utilization', authenticate, (req, res) => {
  try {
    // Group vehicles by type and status
    const vehicles = db.prepare('SELECT type, status, COUNT(*) as count FROM Vehicles GROUP BY type, status').all();
    
    // Group trips by region/destination
    const tripsByRegion = db.prepare(`
      SELECT Vehicles.region, COUNT(*) as count 
      FROM Trips
      JOIN Vehicles ON Trips.vehicleId = Vehicles.id
      GROUP BY Vehicles.region
    `).all();

    return res.json({
      vehicles,
      tripsByRegion
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Database query error' });
  }
});

// GET /api/reports/vehicle-roi
router.get('/vehicle-roi', authenticate, (req, res) => {
  try {
    // Calculate ROI for each vehicle
    // Revenue = actualDistance * 2.5
    // Costs = FuelLogs cost + Expenses amount
    const vehicles = db.prepare("SELECT id, registrationNumber, nameModel, acquisitionCost, odometer FROM Vehicles WHERE status != 'Retired'").all();

    const roiData = vehicles.map(v => {
      const fuel = (db.prepare('SELECT SUM(cost) as sum FROM FuelLogs WHERE vehicleId = ?').get(v.id)).sum || 0;
      const expenses = (db.prepare('SELECT SUM(amount) as sum FROM Expenses WHERE vehicleId = ?').get(v.id)).sum || 0;
      
      const tripStats = db.prepare("SELECT SUM(actualDistance) as dist FROM Trips WHERE vehicleId = ? AND status = 'Completed'").get(v.id);
      const distance = tripStats?.dist || 0;
      const revenue = distance * 2.5;
      const cost = fuel + expenses;
      const profit = revenue - cost;
      const roi = v.acquisitionCost > 0 ? Math.round((profit / v.acquisitionCost) * 100) : 0;

      return {
        id: v.id,
        registrationNumber: v.registrationNumber,
        nameModel: v.nameModel,
        distance,
        revenue,
        cost,
        profit,
        roi
      };
    });

    return res.json(roiData);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Database query error' });
  }
});

// GET /api/reports/export/csv
router.get('/export/csv', authenticate, (req, res) => {
  const { type } = req.query;

  try {
    let csvContent = '';
    let filename = 'export.csv';

    if (type === 'vehicles') {
      filename = 'vehicles_export.csv';
      const data = db.prepare('SELECT id, registrationNumber, nameModel, type, maxLoadCapacity, odometer, acquisitionCost, region, status FROM Vehicles').all();
      csvContent = 'ID,Registration Number,Model,Type,Max Capacity (kg),Odometer (km),Acquisition Cost,Region,Status\n';
      data.forEach(row => {
        csvContent += `"${row.id}","${row.registrationNumber}","${row.nameModel}","${row.type}","${row.maxLoadCapacity}","${row.odometer}","${row.acquisitionCost}","${row.region}","${row.status}"\n`;
      });
    } else if (type === 'drivers') {
      filename = 'drivers_export.csv';
      const data = db.prepare('SELECT id, name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status FROM Drivers').all();
      csvContent = 'ID,Name,License Number,License Category,License Expiry,Contact,Safety Score,Status\n';
      data.forEach(row => {
        csvContent += `"${row.id}","${row.name}","${row.licenseNumber}","${row.licenseCategory}","${row.licenseExpiryDate}","${row.contactNumber}","${row.safetyScore}","${row.status}"\n`;
      });
    } else if (type === 'trips') {
      filename = 'trips_export.csv';
      const data = db.prepare(`
        SELECT Trips.id, Trips.source, Trips.destination, Vehicles.registrationNumber as vehicleReg, Drivers.name as driverName, Trips.cargoWeight, Trips.plannedDistance, Trips.actualDistance, Trips.status, Trips.createdAt
        FROM Trips
        JOIN Vehicles ON Trips.vehicleId = Vehicles.id
        JOIN Drivers ON Trips.driverId = Drivers.id
      `).all();
      csvContent = 'ID,Source,Destination,Vehicle,Driver,Cargo Weight (kg),Planned Distance (km),Actual Distance (km),Status,Created At\n';
      data.forEach(row => {
        csvContent += `"${row.id}","${row.source}","${row.destination}","${row.vehicleReg}","${row.driverName}","${row.cargoWeight}","${row.plannedDistance}","${row.actualDistance || ''}","${row.status}","${row.createdAt}"\n`;
      });
    } else {
      return res.status(400).json({ error: 'Invalid export type. Must be vehicles, drivers, or trips' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    return res.send(csvContent);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'CSV generation error' });
  }
});

export default router;

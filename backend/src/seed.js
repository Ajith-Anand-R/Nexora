import { db, initDb } from './db.js';
import { hashPassword } from './utils/crypto.js';

export function seedDb() {
  console.log('Seeding Database...');
  initDb();

  // Check if roles already exist, if so skip seeding
  const checkRoles = db.prepare('SELECT COUNT(*) as count FROM Roles').get();
  if (checkRoles.count > 0) {
    console.log('Database already has data. Skipping seed.');
    return;
  }

  // 1. Roles
  const roles = ['FleetManager', 'Driver', 'SafetyOfficer', 'FinancialAnalyst'];
  const insertRole = db.prepare('INSERT OR IGNORE INTO Roles (name) VALUES (?)');
  roles.forEach(role => insertRole.run(role));

  // Get role IDs
  const getRole = db.prepare('SELECT id FROM Roles WHERE name = ?');
  const roleIds = {};
  roles.forEach(role => {
    const row = getRole.get(role);
    roleIds[role] = row.id;
  });

  // 2. Users
  const users = [
    { name: 'Fleet Manager User', email: 'manager@transitops.com', password: 'manager123', roleId: roleIds['FleetManager'] },
    { name: 'Driver Dispatcher User', email: 'dispatcher@transitops.com', password: 'driver123', roleId: roleIds['Driver'] },
    { name: 'Safety Officer User', email: 'safety@transitops.com', password: 'safety123', roleId: roleIds['SafetyOfficer'] },
    { name: 'Financial Analyst User', email: 'finance@transitops.com', password: 'finance123', roleId: roleIds['FinancialAnalyst'] }
  ];

  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO Users (name, email, passwordHash, roleId)
    VALUES (?, ?, ?, ?)
  `);

  users.forEach(u => {
    const passwordHash = hashPassword(u.password);
    insertUser.run(u.name, u.email, passwordHash, u.roleId);
  });

  // 3. Vehicles
  const vehicles = [
    { registrationNumber: 'Van-01', nameModel: 'Ford Transit 2021', type: 'Van', maxLoadCapacity: 1200, odometer: 25152, acquisitionCost: 35000, region: 'North', status: 'Available' },
    { registrationNumber: 'Van-02', nameModel: 'Ford Transit 2022', type: 'Van', maxLoadCapacity: 1200, odometer: 15220, acquisitionCost: 38000, region: 'South', status: 'Available' },
    { registrationNumber: 'Truck-01', nameModel: 'Volvo FH16', type: 'Semi', maxLoadCapacity: 20000, odometer: 120000, acquisitionCost: 150000, region: 'East', status: 'In Shop' },
    { registrationNumber: 'Truck-02', nameModel: 'Scania R500', type: 'Semi', maxLoadCapacity: 20000, odometer: 85000, acquisitionCost: 145000, region: 'West', status: 'Retired' },
    { registrationNumber: 'Van-03', nameModel: 'Mercedes Sprinter', type: 'Box Truck', maxLoadCapacity: 3500, odometer: 45000, acquisitionCost: 55000, region: 'North', status: 'On Trip' },
    { registrationNumber: 'Van-04', nameModel: 'RAM ProMaster', type: 'Van', maxLoadCapacity: 1500, odometer: 8000, acquisitionCost: 40000, region: 'South', status: 'Available' }
  ];

  const insertVehicle = db.prepare(`
    INSERT OR REPLACE INTO Vehicles (registrationNumber, nameModel, type, maxLoadCapacity, odometer, acquisitionCost, region, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  vehicles.forEach(v => {
    insertVehicle.run(v.registrationNumber, v.nameModel, v.type, v.maxLoadCapacity, v.odometer, v.acquisitionCost, v.region, v.status);
  });

  // 4. Drivers
  const drivers = [
    { name: 'John Doe', licenseNumber: 'LIC-001', licenseCategory: 'Class A', licenseExpiryDate: '2028-12-31', contactNumber: '555-0101', safetyScore: 95.5, status: 'Available' },
    { name: 'Jane Smith', licenseNumber: 'LIC-002', licenseCategory: 'Class A', licenseExpiryDate: '2029-05-15', contactNumber: '555-0102', safetyScore: 98.0, status: 'Available' },
    { name: 'Bob Johnson', licenseNumber: 'LIC-003', licenseCategory: 'Class B', licenseExpiryDate: '2027-08-20', contactNumber: '555-0103', safetyScore: 88.0, status: 'On Trip' },
    { name: 'Alice Williams', licenseNumber: 'LIC-004', licenseCategory: 'Class C', licenseExpiryDate: '2026-06-01', contactNumber: '555-0104', safetyScore: 92.0, status: 'Available' },
    { name: 'Charlie Brown', licenseNumber: 'LIC-005', licenseCategory: 'Class A', licenseExpiryDate: '2029-10-10', contactNumber: '555-0105', safetyScore: 75.0, status: 'Suspended' },
    { name: 'David Miller', licenseNumber: 'LIC-006', licenseCategory: 'Class B', licenseExpiryDate: '2028-04-04', contactNumber: '555-0106', safetyScore: 90.0, status: 'Off Duty' }
  ];

  const insertDriver = db.prepare(`
    INSERT OR REPLACE INTO Drivers (name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  drivers.forEach(d => {
    insertDriver.run(d.name, d.licenseNumber, d.licenseCategory, d.licenseExpiryDate, d.contactNumber, d.safetyScore, d.status);
  });

  // 5. Historical Completed Trips and logs
  const getVehicleId = db.prepare('SELECT id FROM Vehicles WHERE registrationNumber = ?');
  const getDriverId = db.prepare('SELECT id FROM Drivers WHERE licenseNumber = ?');

  const van1 = getVehicleId.get('Van-01');
  const van2 = getVehicleId.get('Van-02');
  const truck1 = getVehicleId.get('Truck-01');

  const john = getDriverId.get('LIC-001');
  const jane = getDriverId.get('LIC-002');

  if (van1 && van2 && truck1 && john && jane) {
    const insertTrip = db.prepare(`
      INSERT INTO Trips (source, destination, vehicleId, driverId, cargoWeight, plannedDistance, actualDistance, fuelConsumed, status, createdAt, dispatchedAt, completedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Trip 1
    insertTrip.run(
      'Warehouse A', 'Client X', van1.id, john.id, 500, 150, 152, 15.2, 'Completed',
      '2026-07-01 08:00:00', '2026-07-01 08:30:00', '2026-07-01 12:00:00'
    );
    const trip1Id = (db.prepare('SELECT last_insert_rowid() as id').get()).id;

    // Fuel Log 1
    db.prepare(`
      INSERT INTO FuelLogs (vehicleId, tripId, liters, cost, date)
      VALUES (?, ?, ?, ?, ?)
    `).run(van1.id, trip1Id, 15.2, 15.2 * 1.5, '2026-07-01 12:00:00');

    // Trip 2
    insertTrip.run(
      'Port Y', 'Warehouse B', van2.id, jane.id, 800, 220, 220, 24.0, 'Completed',
      '2026-07-05 07:00:00', '2026-07-05 07:15:00', '2026-07-05 11:45:00'
    );
    const trip2Id = (db.prepare('SELECT last_insert_rowid() as id').get()).id;

    // Fuel Log 2
    db.prepare(`
      INSERT INTO FuelLogs (vehicleId, tripId, liters, cost, date)
      VALUES (?, ?, ?, ?, ?)
    `).run(van2.id, trip2Id, 24.0, 24.0 * 1.5, '2026-07-05 11:45:00');

    // 6. Maintenance Logs
    db.prepare(`
      INSERT INTO MaintenanceLogs (vehicleId, description, cost, status, startDate)
      VALUES (?, ?, ?, ?, ?)
    `).run(truck1.id, 'Engine overhaul and diagnostic check', 1500, 'Active', '2026-07-10 09:00:00');

    // 7. Expenses
    db.prepare(`
      INSERT INTO Expenses (vehicleId, category, amount, date, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(van1.id, 'toll', 15.5, '2026-07-01 10:00:00', 'Expressway Route 66 Toll');
  }

  console.log('Database seeded successfully!');
}

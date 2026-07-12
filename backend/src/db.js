import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../transitops.db');
export const db = new DatabaseSync(dbPath);

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      roleId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(roleId) REFERENCES Roles(id)
    );

    CREATE TABLE IF NOT EXISTS Vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      registrationNumber TEXT UNIQUE NOT NULL,
      nameModel TEXT NOT NULL,
      type TEXT NOT NULL,
      maxLoadCapacity REAL NOT NULL,
      odometer REAL NOT NULL,
      acquisitionCost REAL NOT NULL,
      region TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      licenseNumber TEXT UNIQUE NOT NULL,
      licenseCategory TEXT NOT NULL,
      licenseExpiryDate TEXT NOT NULL,
      contactNumber TEXT NOT NULL,
      safetyScore REAL DEFAULT 100.0,
      status TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      destination TEXT NOT NULL,
      vehicleId INTEGER NOT NULL,
      driverId INTEGER NOT NULL,
      cargoWeight REAL NOT NULL,
      plannedDistance REAL NOT NULL,
      actualDistance REAL,
      fuelConsumed REAL,
      startOdometer REAL,
      finalOdometer REAL,
      status TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      dispatchedAt TEXT,
      completedAt TEXT,
      FOREIGN KEY(vehicleId) REFERENCES Vehicles(id),
      FOREIGN KEY(driverId) REFERENCES Drivers(id)
    );

    CREATE TABLE IF NOT EXISTS MaintenanceLogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicleId INTEGER NOT NULL,
      description TEXT NOT NULL,
      cost REAL NOT NULL,
      status TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT,
      FOREIGN KEY(vehicleId) REFERENCES Vehicles(id)
    );

    CREATE TABLE IF NOT EXISTS FuelLogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicleId INTEGER NOT NULL,
      tripId INTEGER,
      liters REAL NOT NULL,
      cost REAL NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY(vehicleId) REFERENCES Vehicles(id),
      FOREIGN KEY(tripId) REFERENCES Trips(id)
    );

    CREATE TABLE IF NOT EXISTS Expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicleId INTEGER NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      FOREIGN KEY(vehicleId) REFERENCES Vehicles(id)
    );
  `);
}

export function runTransaction(fn) {
  db.exec('BEGIN TRANSACTION');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

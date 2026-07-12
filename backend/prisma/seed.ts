import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Roles
  const roles = [
    { name: 'FleetManager' },
    { name: 'Driver' }, // functions as Dispatcher
    { name: 'SafetyOfficer' },
    { name: 'FinancialAnalyst' }
  ];

  const dbRoles: Record<string, any> = {};
  for (const r of roles) {
    const dbRole = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: { name: r.name }
    });
    dbRoles[r.name] = dbRole;
    console.log(`Role ${r.name} created/found.`);
  }

  // 2. Seed Users
  const users = [
    {
      name: 'Fleet Manager User',
      email: 'manager@transitops.com',
      password: 'manager123',
      roleId: dbRoles['FleetManager'].id
    },
    {
      name: 'Driver Dispatcher User',
      email: 'dispatcher@transitops.com',
      password: 'driver123',
      roleId: dbRoles['Driver'].id
    },
    {
      name: 'Safety Officer User',
      email: 'safety@transitops.com',
      password: 'safety123',
      roleId: dbRoles['SafetyOfficer'].id
    },
    {
      name: 'Financial Analyst User',
      email: 'finance@transitops.com',
      password: 'finance123',
      roleId: dbRoles['FinancialAnalyst'].id
    }
  ];

  for (const u of users) {
    const passwordHash = bcrypt.hashSync(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        passwordHash,
        roleId: u.roleId
      },
      create: {
        name: u.name,
        email: u.email,
        passwordHash,
        roleId: u.roleId
      }
    });
    console.log(`User ${u.email} seeded.`);
  }

  // 3. Seed Vehicles
  const vehicles = [
    {
      registrationNumber: 'Van-01',
      nameModel: 'Ford Transit 2021',
      type: 'Van',
      maxLoadCapacity: 1200,
      odometer: 25152,
      acquisitionCost: 35000,
      region: 'North',
      status: 'Available'
    },
    {
      registrationNumber: 'Van-02',
      nameModel: 'Ford Transit 2022',
      type: 'Van',
      maxLoadCapacity: 1200,
      odometer: 15220,
      acquisitionCost: 38000,
      region: 'South',
      status: 'Available'
    },
    {
      registrationNumber: 'Truck-01',
      nameModel: 'Volvo FH16',
      type: 'Semi',
      maxLoadCapacity: 20000,
      odometer: 120000,
      acquisitionCost: 150000,
      region: 'East',
      status: 'In Shop'
    },
    {
      registrationNumber: 'Truck-02',
      nameModel: 'Scania R500',
      type: 'Semi',
      maxLoadCapacity: 20000,
      odometer: 85000,
      acquisitionCost: 145000,
      region: 'West',
      status: 'Retired'
    },
    {
      registrationNumber: 'Van-03',
      nameModel: 'Mercedes Sprinter',
      type: 'Box Truck',
      maxLoadCapacity: 3500,
      odometer: 45000,
      acquisitionCost: 55000,
      region: 'North',
      status: 'On Trip'
    },
    {
      registrationNumber: 'Van-04',
      nameModel: 'RAM ProMaster',
      type: 'Van',
      maxLoadCapacity: 1500,
      odometer: 8000,
      acquisitionCost: 40000,
      region: 'South',
      status: 'Available'
    }
  ];

  const dbVehicles: Record<string, any> = {};
  for (const v of vehicles) {
    const dbVehicle = await prisma.vehicle.upsert({
      where: { registrationNumber: v.registrationNumber },
      update: v,
      create: v
    });
    dbVehicles[v.registrationNumber] = dbVehicle;
    console.log(`Vehicle ${v.registrationNumber} seeded.`);
  }

  // 4. Seed Drivers
  const drivers = [
    {
      name: 'John Doe',
      licenseNumber: 'LIC-001',
      licenseCategory: 'Class A',
      licenseExpiryDate: new Date('2028-12-31'),
      contactNumber: '555-0101',
      safetyScore: 95.5,
      status: 'Available'
    },
    {
      name: 'Jane Smith',
      licenseNumber: 'LIC-002',
      licenseCategory: 'Class A',
      licenseExpiryDate: new Date('2029-05-15'),
      contactNumber: '555-0102',
      safetyScore: 98.0,
      status: 'Available'
    },
    {
      name: 'Bob Johnson',
      licenseNumber: 'LIC-003',
      licenseCategory: 'Class B',
      licenseExpiryDate: new Date('2027-08-20'),
      contactNumber: '555-0103',
      safetyScore: 88.0,
      status: 'On Trip'
    },
    {
      name: 'Alice Williams',
      licenseNumber: 'LIC-004',
      licenseCategory: 'Class C',
      licenseExpiryDate: new Date('2026-06-01'), // Expired
      contactNumber: '555-0104',
      safetyScore: 92.0,
      status: 'Available'
    },
    {
      name: 'Charlie Brown',
      licenseNumber: 'LIC-005',
      licenseCategory: 'Class A',
      licenseExpiryDate: new Date('2029-10-10'),
      contactNumber: '555-0105',
      safetyScore: 75.0,
      status: 'Suspended'
    },
    {
      name: 'David Miller',
      licenseNumber: 'LIC-006',
      licenseCategory: 'Class B',
      licenseExpiryDate: new Date('2028-04-04'),
      contactNumber: '555-0106',
      safetyScore: 90.0,
      status: 'Off Duty'
    }
  ];

  const dbDrivers: Record<string, any> = {};
  for (const d of drivers) {
    const dbDriver = await prisma.driver.upsert({
      where: { licenseNumber: d.licenseNumber },
      update: d,
      create: d
    });
    dbDrivers[d.licenseNumber] = dbDriver;
    console.log(`Driver ${d.name} seeded.`);
  }

  // 5. Seed Historical Completed Trips and logs
  const histTrips = [
    {
      source: 'Warehouse A',
      destination: 'Client X',
      vehicleId: dbVehicles['Van-01'].id,
      driverId: dbDrivers['LIC-001'].id,
      cargoWeight: 500,
      plannedDistance: 150,
      actualDistance: 152,
      fuelConsumed: 15.2,
      status: 'Completed',
      createdAt: new Date('2026-07-01T08:00:00Z'),
      dispatchedAt: new Date('2026-07-01T08:30:00Z'),
      completedAt: new Date('2026-07-01T12:00:00Z')
    },
    {
      source: 'Port Y',
      destination: 'Warehouse B',
      vehicleId: dbVehicles['Van-02'].id,
      driverId: dbDrivers['LIC-002'].id,
      cargoWeight: 800,
      plannedDistance: 220,
      actualDistance: 220,
      fuelConsumed: 24.0,
      status: 'Completed',
      createdAt: new Date('2026-07-05T07:00:00Z'),
      dispatchedAt: new Date('2026-07-05T07:15:00Z'),
      completedAt: new Date('2026-07-05T11:45:00Z')
    }
  ];

  for (const t of histTrips) {
    const dbTrip = await prisma.trip.create({ data: t });
    // Seed fuel logs corresponding to completed trips
    await prisma.fuelLog.create({
      data: {
        vehicleId: t.vehicleId,
        tripId: dbTrip.id,
        liters: t.fuelConsumed,
        cost: t.fuelConsumed * 1.5, // estimate cost
        date: t.completedAt
      }
    });
    console.log(`Historical Trip seeded from ${t.source} to ${t.destination}.`);
  }

  // 6. Seed a Maintenance Log
  await prisma.maintenanceLog.create({
    data: {
      vehicleId: dbVehicles['Truck-01'].id,
      description: 'Engine overhaul and diagnostic check',
      cost: 1500,
      status: 'Active',
      startDate: new Date('2026-07-10T09:00:00Z')
    }
  });
  console.log('Active maintenance log seeded for Truck-01.');

  // 7. Seed an Expense
  await prisma.expense.create({
    data: {
      vehicleId: dbVehicles['Van-01'].id,
      category: 'toll',
      amount: 15.5,
      date: new Date('2026-07-01T10:00:00Z'),
      description: 'Expressway Route 66 Toll'
    }
  });
  console.log('Historical expense seeded for Van-01.');

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

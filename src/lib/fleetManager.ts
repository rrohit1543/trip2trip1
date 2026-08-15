/**
 * TripMandi - Fleet, Contractors & Drivers Management Engine
 * Full CRUD capabilities: Add, Edit, Delete for Contractors, Vehicles, and Drivers.
 */

export interface ContractorEntity {
  id: string;
  agencyName: string;
  companyName?: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstNumber?: string;
  contractDocumentUrl?: string;
  payoutRateAgreement: { baseRatePerKm: number; platformSharePct: number };
  createdAt: string;
}

export interface VehicleEntity {
  id: string;
  contractorId: string;
  contractorName: string;
  vehicleNumber: string;
  vehicleCategory: 'AC_SLEEPER' | 'NON_AC_SEATER' | 'VOLVO_MULTI_AXLE' | 'MINI_BUS' | 'SUV_7_SEATER' | 'TRAVELLER_16_SEATER';
  totalSeats: number;
  insuranceExpiry: string;
  fitnessExpiry: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED';
  createdAt: string;
}

export interface DriverEntity {
  id: string;
  fullName: string;
  primaryPhone: string;
  emergencyPhone: string;
  licenseNumber: string;
  licenseExpiry: string;
  assignedContractorId?: string;
  assignedContractorName?: string;
  status?: 'ACTIVE' | 'ON_TRIP' | 'OFF_DUTY' | 'SUSPENDED';
  createdAt: string;
}

// Memory Persistent Stores
export let contractorsStore: Record<string, ContractorEntity> = {
  cnt_1: {
    id: 'cnt_1',
    agencyName: 'Himalayan Yatra Logistics',
    companyName: 'Himalayan Yatra Logistics Pvt Ltd',
    contactPerson: 'Vikram Singh',
    phone: '+91 9812345678',
    email: 'vikram@himalayanyatra.com',
    gstNumber: '02AAACH1234F1Z9',
    payoutRateAgreement: { baseRatePerKm: 42, platformSharePct: 10 },
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  cnt_2: {
    id: 'cnt_2',
    agencyName: 'Goa Coastal Transport',
    companyName: 'Goa Coastal Transport LLP',
    contactPerson: 'Anil Deshmukh',
    phone: '+91 9822334455',
    email: 'anil@goacoastal.com',
    gstNumber: '30AAACG5678E1Z4',
    payoutRateAgreement: { baseRatePerKm: 38, platformSharePct: 12 },
    createdAt: '2026-08-02T00:00:00.000Z',
  },
};

export let vehiclesStore: Record<string, VehicleEntity> = {
  veh_1: {
    id: 'veh_1',
    contractorId: 'cnt_1',
    contractorName: 'Himalayan Yatra Logistics',
    vehicleNumber: 'HP 01 AB 9988',
    vehicleCategory: 'VOLVO_MULTI_AXLE',
    totalSeats: 36,
    insuranceExpiry: '2026-12-31',
    fitnessExpiry: '2026-11-15',
    status: 'ACTIVE',
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  veh_2: {
    id: 'veh_2',
    contractorId: 'cnt_2',
    contractorName: 'Goa Coastal Transport',
    vehicleNumber: 'GA 08 C 4455',
    vehicleCategory: 'AC_SLEEPER',
    totalSeats: 30,
    insuranceExpiry: '2026-09-01',
    fitnessExpiry: '2026-08-25',
    status: 'ACTIVE',
    createdAt: '2026-08-02T00:00:00.000Z',
  },
};

export let driversStore: Record<string, DriverEntity> = {
  drv_1: {
    id: 'drv_1',
    fullName: 'Ramesh Kumar',
    primaryPhone: '+91 9876501234',
    emergencyPhone: '+91 9876509999',
    licenseNumber: 'DL-042011009876',
    licenseExpiry: '2027-05-20',
    assignedContractorId: 'cnt_1',
    assignedContractorName: 'Himalayan Yatra Logistics',
    status: 'ACTIVE',
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  drv_2: {
    id: 'drv_2',
    fullName: 'Suresh Patil',
    primaryPhone: '+91 9876505678',
    emergencyPhone: '+91 9876508888',
    licenseNumber: 'MH-122015004321',
    licenseExpiry: '2026-08-30',
    assignedContractorId: 'cnt_2',
    assignedContractorName: 'Goa Coastal Transport',
    status: 'ACTIVE',
    createdAt: '2026-08-02T00:00:00.000Z',
  },
};

// CONTRACTOR CRUD
export function addContractor(contractor: Omit<ContractorEntity, 'id' | 'createdAt'>): ContractorEntity {
  const id = `cnt_${Date.now()}`;
  const newContractor: ContractorEntity = {
    ...contractor,
    id,
    createdAt: new Date().toISOString(),
  };
  contractorsStore[id] = newContractor;
  return newContractor;
}

export function editContractor(id: string, updates: Partial<ContractorEntity>): ContractorEntity | null {
  if (!contractorsStore[id]) return null;
  contractorsStore[id] = { ...contractorsStore[id], ...updates };
  return contractorsStore[id];
}

export function deleteContractor(id: string): boolean {
  if (!contractorsStore[id]) return false;
  delete contractorsStore[id];
  return true;
}

// VEHICLE CRUD
export function addVehicle(vehicle: Omit<VehicleEntity, 'id' | 'createdAt'>): VehicleEntity {
  const id = `veh_${Date.now()}`;
  const newVehicle: VehicleEntity = {
    ...vehicle,
    id,
    createdAt: new Date().toISOString(),
  };
  vehiclesStore[id] = newVehicle;
  return newVehicle;
}

export function editVehicle(id: string, updates: Partial<VehicleEntity>): VehicleEntity | null {
  if (!vehiclesStore[id]) return null;
  vehiclesStore[id] = { ...vehiclesStore[id], ...updates };
  return vehiclesStore[id];
}

export function deleteVehicle(id: string): boolean {
  if (!vehiclesStore[id]) return false;
  delete vehiclesStore[id];
  return true;
}

// DRIVER CRUD
export function addDriver(driver: Omit<DriverEntity, 'id' | 'createdAt'>): DriverEntity {
  const id = `drv_${Date.now()}`;
  const newDriver: DriverEntity = {
    ...driver,
    id,
    createdAt: new Date().toISOString(),
  };
  driversStore[id] = newDriver;
  return newDriver;
}

export function editDriver(id: string, updates: Partial<DriverEntity>): DriverEntity | null {
  if (!driversStore[id]) return null;
  driversStore[id] = { ...driversStore[id], ...updates };
  return driversStore[id];
}

export function deleteDriver(id: string): boolean {
  if (!driversStore[id]) return false;
  delete driversStore[id];
  return true;
}

/**
 * Check for document expiry alerts within 30 days
 */
export function getDocumentExpiryAlerts(): {
  vehiclesExpiring: { vehicleNumber: string; docType: string; expiryDate: string; daysLeft: number }[];
  driversExpiring: { driverName: string; licenseNumber: string; expiryDate: string; daysLeft: number }[];
} {
  const now = new Date();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  const vehiclesExpiring: any[] = [];
  Object.values(vehiclesStore).forEach((v) => {
    const insTime = new Date(v.insuranceExpiry).getTime();
    const fitTime = new Date(v.fitnessExpiry).getTime();
    const nowTime = now.getTime();

    if (insTime - nowTime <= thirtyDaysMs) {
      vehiclesExpiring.push({
        vehicleNumber: v.vehicleNumber,
        docType: 'Insurance Policy',
        expiryDate: v.insuranceExpiry,
        daysLeft: Math.ceil((insTime - nowTime) / (1000 * 60 * 60 * 24)),
      });
    }
    if (fitTime - nowTime <= thirtyDaysMs) {
      vehiclesExpiring.push({
        vehicleNumber: v.vehicleNumber,
        docType: 'Fitness Certificate',
        expiryDate: v.fitnessExpiry,
        daysLeft: Math.ceil((fitTime - nowTime) / (1000 * 60 * 60 * 24)),
      });
    }
  });

  const driversExpiring: any[] = [];
  Object.values(driversStore).forEach((d) => {
    const licTime = new Date(d.licenseExpiry).getTime();
    const nowTime = now.getTime();

    if (licTime - nowTime <= thirtyDaysMs) {
      driversExpiring.push({
        driverName: d.fullName,
        licenseNumber: d.licenseNumber,
        expiryDate: d.licenseExpiry,
        daysLeft: Math.ceil((licTime - nowTime) / (1000 * 60 * 60 * 24)),
      });
    }
  });

  return { vehiclesExpiring, driversExpiring };
}

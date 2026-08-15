/**
 * TripMandi - Customer & Booking Administration Engine
 * Module E: Full Customer Directory CRUD, Real-Time Seat Map, Manual Seat Reallocation & Manifest Export.
 */

export interface CustomerEntity {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  lifetimeValue: number;
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
}

export let customersStore: Record<string, CustomerEntity> = {
  cust_1: {
    id: 'cust_1',
    name: 'Rahul Sharma',
    email: 'rahul@gmail.com',
    phone: '+91 9811223344',
    totalBookings: 3,
    lifetimeValue: 4800,
    status: 'ACTIVE',
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  cust_2: {
    id: 'cust_2',
    name: 'Priya Verma',
    email: 'priya@gmail.com',
    phone: '+91 9822334455',
    totalBookings: 2,
    lifetimeValue: 3200,
    status: 'ACTIVE',
    createdAt: '2026-08-05T00:00:00.000Z',
  },
  cust_3: {
    id: 'cust_3',
    name: 'Amit Patel',
    email: 'amit@gmail.com',
    phone: '+91 9833445566',
    totalBookings: 1,
    lifetimeValue: 1200,
    status: 'ACTIVE',
    createdAt: '2026-08-10T00:00:00.000Z',
  },
};

export function addCustomer(cust: Omit<CustomerEntity, 'id' | 'createdAt'>): CustomerEntity {
  const id = `cust_${Date.now()}`;
  const newCust: CustomerEntity = {
    ...cust,
    id,
    createdAt: new Date().toISOString(),
  };
  customersStore[id] = newCust;
  return newCust;
}

export function editCustomer(id: string, updates: Partial<CustomerEntity>): CustomerEntity | null {
  if (!customersStore[id]) return null;
  customersStore[id] = { ...customersStore[id], ...updates };
  return customersStore[id];
}

export function deleteCustomer(id: string): boolean {
  if (!customersStore[id]) return false;
  delete customersStore[id];
  return true;
}

/**
 * TripMandi - Operators & Sub-Roles Management Engine
 * Module D: Add, Edit, Delete Operators with granular role permissions.
 */

export type OperatorSubRole = 'DISPATCHER' | 'SUPPORT' | 'TRIP_MANAGER' | 'FINANCE_AUDITOR';

export interface OperatorEntity {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  subRole: OperatorSubRole;
  permissions: string[];
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export let operatorsStore: Record<string, OperatorEntity> = {
  op_1: {
    id: 'op_1',
    name: 'Vikram Singh',
    email: 'vikram@himalayanyatra.com',
    phone: '+91 9812345678',
    companyName: 'Himalayan Yatra Logistics',
    subRole: 'TRIP_MANAGER',
    permissions: ['create_trip', 'edit_trip', 'view_manifest', 'manage_fleet'],
    status: 'ACTIVE',
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  op_2: {
    id: 'op_2',
    name: 'Anil Deshmukh',
    email: 'anil@goacoastal.com',
    phone: '+91 9822334455',
    companyName: 'Goa Coastal Transport',
    subRole: 'DISPATCHER',
    permissions: ['assign_driver', 'assign_vehicle', 'view_manifest'],
    status: 'ACTIVE',
    createdAt: '2026-08-02T00:00:00.000Z',
  },
};

export function addOperator(op: Omit<OperatorEntity, 'id' | 'createdAt'>): OperatorEntity {
  const id = `op_${Date.now()}`;
  const newOp: OperatorEntity = {
    ...op,
    id,
    createdAt: new Date().toISOString(),
  };
  operatorsStore[id] = newOp;
  return newOp;
}

export function editOperator(id: string, updates: Partial<OperatorEntity>): OperatorEntity | null {
  if (!operatorsStore[id]) return null;
  operatorsStore[id] = { ...operatorsStore[id], ...updates };
  return operatorsStore[id];
}

export function deleteOperator(id: string): boolean {
  if (!operatorsStore[id]) return false;
  delete operatorsStore[id];
  return true;
}

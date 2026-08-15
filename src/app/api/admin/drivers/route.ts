import { NextResponse } from 'next/server';
import {
  driversStore,
  addDriver,
  editDriver,
  deleteDriver,
} from '@/lib/fleetManager';

export async function GET() {
  return NextResponse.json({ success: true, drivers: Object.values(driversStore) });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newDriver = addDriver({
      fullName: body.fullName || 'New Driver',
      primaryPhone: body.primaryPhone || '+91 9800000000',
      emergencyPhone: body.emergencyPhone || '+91 9800000001',
      licenseNumber: body.licenseNumber || `DL-${Date.now()}`,
      licenseExpiry: body.licenseExpiry || '2027-12-31',
      assignedContractorId: body.assignedContractorId,
      assignedContractorName: body.assignedContractorName,
      status: 'ACTIVE',
    });
    return NextResponse.json({ success: true, driver: newDriver });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updated = editDriver(body.id, body);
    if (!updated) return NextResponse.json({ success: false, error: 'Driver not found' }, { status: 404 });
    return NextResponse.json({ success: true, driver: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }
    if (!id) return NextResponse.json({ success: false, error: 'Driver ID required' }, { status: 400 });

    const deleted = deleteDriver(id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

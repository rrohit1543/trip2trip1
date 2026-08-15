import { NextResponse } from 'next/server';
import {
  vehiclesStore,
  addVehicle,
  editVehicle,
  deleteVehicle,
} from '@/lib/fleetManager';

export async function GET() {
  return NextResponse.json({ success: true, vehicles: Object.values(vehiclesStore) });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newVehicle = addVehicle({
      vehicleNumber: body.vehicleNumber || 'MP 09 AB 1234',
      contractorId: body.contractorId || 'cnt_1',
      contractorName: body.contractorName || 'Himalayan Yatra Logistics',
      vehicleCategory: body.vehicleCategory || 'VOLVO_MULTI_AXLE',
      totalSeats: body.totalSeats || 36,
      insuranceExpiry: body.insuranceExpiry || '2026-12-31',
      fitnessExpiry: body.fitnessExpiry || '2026-11-30',
      status: 'ACTIVE',
    });
    return NextResponse.json({ success: true, vehicle: newVehicle });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updated = editVehicle(body.id, body);
    if (!updated) return NextResponse.json({ success: false, error: 'Vehicle not found' }, { status: 404 });
    return NextResponse.json({ success: true, vehicle: updated });
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
    if (!id) return NextResponse.json({ success: false, error: 'Vehicle ID required' }, { status: 400 });

    const deleted = deleteVehicle(id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

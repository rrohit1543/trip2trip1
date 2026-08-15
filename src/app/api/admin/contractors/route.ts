import { NextResponse } from 'next/server';
import {
  contractorsStore,
  addContractor,
  editContractor,
  deleteContractor,
} from '@/lib/fleetManager';

export async function GET() {
  return NextResponse.json({ success: true, contractors: Object.values(contractorsStore) });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newContractor = addContractor({
      agencyName: body.agencyName || 'New Contractor Agency',
      companyName: body.companyName || body.agencyName,
      contactPerson: body.contactPerson || 'Agency Admin',
      phone: body.phone || '+91 9800000000',
      email: body.email || 'partner@tripmandi.com',
      gstNumber: body.gstNumber,
      payoutRateAgreement: body.payoutRateAgreement || { baseRatePerKm: 40, platformSharePct: 10 },
    });
    return NextResponse.json({ success: true, contractor: newContractor });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updated = editContractor(body.id, body);
    if (!updated) return NextResponse.json({ success: false, error: 'Contractor not found' }, { status: 404 });
    return NextResponse.json({ success: true, contractor: updated });
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
    if (!id) return NextResponse.json({ success: false, error: 'Contractor ID required' }, { status: 400 });

    const deleted = deleteContractor(id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

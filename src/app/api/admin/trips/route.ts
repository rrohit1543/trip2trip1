import { NextResponse } from 'next/server';

// Mock DB Persistence Store for Admin Trips & Vehicle Layout Templates
export const adminTripsStore: Record<string, any> = {};
export const adminSeatPricingStore: Record<string, any[]> = {};

/**
 * Helper to auto-generate default RedBus seat layout template based on Vehicle Type
 */
function generateDefaultSeatLayout(vehicleType: 'BUS' | 'CAR' | 'TRAVELLER', basePrice: number) {
  const seats: any[] = [];

  if (vehicleType === 'CAR') {
    const carLayout = [
      { seatNumber: 1, label: 'F1', deck: 'LOWER', row: 1, col: 2, type: 'SEATER' },
      { seatNumber: 2, label: 'M1', deck: 'LOWER', row: 2, col: 1, type: 'SEATER' },
      { seatNumber: 3, label: 'M2', deck: 'LOWER', row: 2, col: 2, type: 'SEATER' },
      { seatNumber: 4, label: 'M3', deck: 'LOWER', row: 2, col: 3, type: 'SEATER' },
      { seatNumber: 5, label: 'R1', deck: 'LOWER', row: 3, col: 1, type: 'SEATER' },
      { seatNumber: 6, label: 'R2', deck: 'LOWER', row: 3, col: 3, type: 'SEATER' },
    ];
    return carLayout.map((s) => ({
      ...s,
      priceOverride: basePrice,
      status: 'AVAILABLE',
    }));
  }

  if (vehicleType === 'TRAVELLER') {
    let seatNo = 1;
    for (let r = 1; r <= 4; r++) {
      seats.push({ seatNumber: seatNo++, label: `T${r}A`, deck: 'LOWER', row: r, col: 1, type: 'SEATER', priceOverride: basePrice, status: 'AVAILABLE' });
      seats.push({ seatNumber: seatNo++, label: `T${r}B`, deck: 'LOWER', row: r, col: 3, type: 'SEATER', priceOverride: basePrice, status: 'AVAILABLE' });
      seats.push({ seatNumber: seatNo++, label: `T${r}C`, deck: 'LOWER', row: r, col: 4, type: 'SEATER', priceOverride: basePrice, status: 'AVAILABLE' });
    }
    return seats;
  }

  let seatNo = 1;
  for (let r = 1; r <= 5; r++) {
    seats.push({ seatNumber: seatNo++, label: `L${r}A`, deck: 'LOWER', row: r, col: 1, type: 'SEATER', priceOverride: basePrice, status: 'AVAILABLE' });
    seats.push({ seatNumber: seatNo++, label: `L${r}B`, deck: 'LOWER', row: r, col: 2, type: 'SEATER', priceOverride: basePrice, status: 'AVAILABLE' });
    seats.push({ seatNumber: seatNo++, label: `L${r}C`, deck: 'LOWER', row: r, col: 4, type: 'SEATER', priceOverride: basePrice, status: 'AVAILABLE' });
    seats.push({ seatNumber: seatNo++, label: `L${r}D`, deck: 'LOWER', row: r, col: 5, type: 'SEATER', priceOverride: basePrice, status: 'AVAILABLE' });
  }

  for (let r = 1; r <= 4; r++) {
    seats.push({ seatNumber: seatNo++, label: `U${r}A`, deck: 'UPPER', row: r, col: 1, type: 'SLEEPER_UPPER', priceOverride: basePrice + 200, status: 'AVAILABLE' });
    seats.push({ seatNumber: seatNo++, label: `U${r}B`, deck: 'UPPER', row: r, col: 4, type: 'SLEEPER_UPPER', priceOverride: basePrice + 200, status: 'AVAILABLE' });
    seats.push({ seatNumber: seatNo++, label: `U${r}C`, deck: 'UPPER', row: r, col: 5, type: 'SLEEPER_UPPER', priceOverride: basePrice + 200, status: 'AVAILABLE' });
  }

  return seats;
}

/**
 * GET /api/admin/trips
 * Fetches all admin trips.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    trips: Object.values(adminTripsStore),
  });
}

/**
 * POST /api/admin/trips
 * Creates a new trip, attaches vehicle & route, and generates initial seat map.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      source = 'Delhi',
      destination = 'Manali',
      vehicleType = 'BUS',
      vehicleName = 'Volvo Multi-Axle 9600',
      departureTime = new Date().toISOString(),
      arrivalTime = new Date(Date.now() + 43200000).toISOString(),
      basePrice = 1200,
      dynamicSurgeEnabled = true,
      surgeThresholdPct = 75,
      surgeIncreasePct = 15,
      intermediateStops = [
        { name: 'Delhi', distanceKm: 0, pricePercentage: 0 },
        { name: 'Chandigarh', distanceKm: 250, pricePercentage: 40 },
        { name: 'Mandi', distanceKm: 420, pricePercentage: 75 },
        { name: 'Manali', distanceKm: 530, pricePercentage: 100 },
      ],
    } = body;

    const tripId = `trip_${Date.now()}`;

    const tripRecord = {
      id: tripId,
      source,
      destination,
      vehicleType,
      vehicleName,
      departureTime,
      arrivalTime,
      basePrice: Number(basePrice),
      dynamicSurgeEnabled: Boolean(dynamicSurgeEnabled),
      surgeThresholdPct: Number(surgeThresholdPct),
      surgeIncreasePct: Number(surgeIncreasePct),
      intermediateStops,
      createdAt: new Date().toISOString(),
    };

    const initialSeats = generateDefaultSeatLayout(vehicleType, Number(basePrice));
    
    adminTripsStore[tripId] = tripRecord;
    adminSeatPricingStore[tripId] = initialSeats;

    return NextResponse.json({
      success: true,
      message: 'Trip created successfully with dynamic seat map initialized.',
      trip: tripRecord,
      totalSeatsGenerated: initialSeats.length,
      seats: initialSeats,
    });
  } catch (err: any) {
    console.error('Error in POST /api/admin/trips:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/trips
 * Deletes a trip package permanently by tripId.
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let tripId = searchParams.get('tripId');

    if (!tripId) {
      const body = await request.json().catch(() => ({}));
      tripId = body.tripId;
    }

    if (!tripId) {
      return NextResponse.json(
        { success: false, error: 'tripId parameter is required for deletion.' },
        { status: 400 }
      );
    }

    delete adminTripsStore[tripId];
    delete adminSeatPricingStore[tripId];

    return NextResponse.json({
      success: true,
      message: `Trip ${tripId} has been deleted permanently.`,
      deletedTripId: tripId,
    });
  } catch (err: any) {
    console.error('Error in DELETE /api/admin/trips:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

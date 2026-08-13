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
    // 7-Seater SUV (Driver, Passenger front, 3 Middle, 2 Rear)
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
    // 12-Seater Traveller (1x2 configuration across 4 rows)
    let seatNo = 1;
    for (let r = 1; r <= 4; r++) {
      seats.push({ seatNumber: seatNo++, label: `T${r}A`, deck: 'LOWER', row: r, col: 1, type: 'SEATER', priceOverride: basePrice, status: 'AVAILABLE' });
      seats.push({ seatNumber: seatNo++, label: `T${r}B`, deck: 'LOWER', row: r, col: 3, type: 'SEATER', priceOverride: basePrice, status: 'AVAILABLE' });
      seats.push({ seatNumber: seatNo++, label: `T${r}C`, deck: 'LOWER', row: r, col: 4, type: 'SEATER', priceOverride: basePrice, status: 'AVAILABLE' });
    }
    return seats;
  }

  // Default: 36-Seat RedBus 2x1 Sleeper + Seater Bus (Lower Deck Seater 2x2, Upper Deck Sleeper 2x1)
  let seatNo = 1;
  // Lower Deck: 20 Seater Seats
  for (let r = 1; r <= 5; r++) {
    seats.push({ seatNumber: seatNo++, label: `L${r}A`, deck: 'LOWER', row: r, col: 1, type: 'SEATER', priceOverride: basePrice, status: 'AVAILABLE' });
    seats.push({ seatNumber: seatNo++, label: `L${r}B`, deck: 'LOWER', row: r, col: 2, type: 'SEATER', priceOverride: basePrice, status: 'AVAILABLE' });
    seats.push({ seatNumber: seatNo++, label: `L${r}C`, deck: 'LOWER', row: r, col: 4, type: 'SEATER', priceOverride: basePrice, status: 'AVAILABLE' });
    seats.push({ seatNumber: seatNo++, label: `L${r}D`, deck: 'LOWER', row: r, col: 5, type: 'SEATER', priceOverride: basePrice, status: 'AVAILABLE' });
  }

  // Upper Deck: 12 Sleeper Berths (Premium +₹200)
  for (let r = 1; r <= 4; r++) {
    seats.push({ seatNumber: seatNo++, label: `U${r}A`, deck: 'UPPER', row: r, col: 1, type: 'SLEEPER_UPPER', priceOverride: basePrice + 200, status: 'AVAILABLE' });
    seats.push({ seatNumber: seatNo++, label: `U${r}B`, deck: 'UPPER', row: r, col: 4, type: 'SLEEPER_UPPER', priceOverride: basePrice + 200, status: 'AVAILABLE' });
    seats.push({ seatNumber: seatNo++, label: `U${r}C`, deck: 'UPPER', row: r, col: 5, type: 'SLEEPER_UPPER', priceOverride: basePrice + 200, status: 'AVAILABLE' });
  }

  return seats;
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

    // Auto-generate seat map using vehicle layout template
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

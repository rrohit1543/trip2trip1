import { NextResponse } from 'next/server';
import { adminTripsStore, adminSeatPricingStore } from '../../route';
import { calculateEffectiveSeatPrice, calculateSegmentFare } from '@/lib/dynamicPricing';

/**
 * GET /api/admin/trips/:tripId/layout
 * Fetches complete live seat grid with dynamic surge price matrix & route segment calculations.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const { searchParams } = new URL(request.url);
    const boardingStop = searchParams.get('boarding') || '';
    const droppingStop = searchParams.get('dropping') || '';

    let trip = adminTripsStore[tripId];
    let seats = adminSeatPricingStore[tripId];

    // Fallback initializer for demo if trip not yet in memory
    if (!trip) {
      trip = {
        id: tripId || 'trip_demo_1',
        source: 'Delhi',
        destination: 'Manali',
        vehicleType: 'BUS',
        vehicleName: 'Volvo 9600 Multi-Axle Sleeper',
        basePrice: 1200,
        dynamicSurgeEnabled: true,
        surgeThresholdPct: 75,
        surgeIncreasePct: 15,
        intermediateStops: [
          { name: 'Delhi', distanceKm: 0, pricePercentage: 0 },
          { name: 'Chandigarh', distanceKm: 250, pricePercentage: 40 },
          { name: 'Mandi', distanceKm: 420, pricePercentage: 75 },
          { name: 'Manali', distanceKm: 530, pricePercentage: 100 },
        ],
      };
      adminTripsStore[trip.id] = trip;
    }

    if (!seats) {
      // Default 36 seat grid
      const demoSeats: any[] = [];
      let seatNo = 1;
      // Lower Deck
      for (let r = 1; r <= 5; r++) {
        demoSeats.push({ seatNumber: seatNo++, label: `L${r}A`, deck: 'LOWER', row: r, col: 1, type: 'SEATER', priceOverride: 1200, status: r === 1 ? 'FEMALE_ONLY' : 'AVAILABLE' });
        demoSeats.push({ seatNumber: seatNo++, label: `L${r}B`, deck: 'LOWER', row: r, col: 2, type: 'SEATER', priceOverride: 1200, status: r === 2 ? 'BOOKED' : 'AVAILABLE' });
        demoSeats.push({ seatNumber: seatNo++, label: `L${r}C`, deck: 'LOWER', row: r, col: 4, type: 'SEATER', priceOverride: 1200, status: 'AVAILABLE' });
        demoSeats.push({ seatNumber: seatNo++, label: `L${r}D`, deck: 'LOWER', row: r, col: 5, type: 'SEATER', priceOverride: 1200, status: 'AVAILABLE' });
      }
      // Upper Deck Sleeper
      for (let r = 1; r <= 4; r++) {
        demoSeats.push({ seatNumber: seatNo++, label: `U${r}A`, deck: 'UPPER', row: r, col: 1, type: 'SLEEPER_UPPER', priceOverride: 1450, status: 'AVAILABLE' });
        demoSeats.push({ seatNumber: seatNo++, label: `U${r}B`, deck: 'UPPER', row: r, col: 4, type: 'SLEEPER_UPPER', priceOverride: 1450, status: r === 3 ? 'BOOKED' : 'AVAILABLE' });
        demoSeats.push({ seatNumber: seatNo++, label: `U${r}C`, deck: 'UPPER', row: r, col: 5, type: 'SLEEPER_UPPER', priceOverride: 1450, status: 'AVAILABLE' });
      }
      seats = demoSeats;
      adminSeatPricingStore[trip.id] = seats;
    }

    const totalSeatsCount = seats.length;
    const bookedSeatsCount = seats.filter((s: any) => s.status === 'BOOKED').length;

    // Calculate Dynamic Pricing Matrix for every seat
    const seatPriceMatrix = seats.map((seat: any) => {
      const priceCalc = calculateEffectiveSeatPrice(
        seat,
        {
          tripId: trip.id,
          basePrice: trip.basePrice,
          dynamicSurgeEnabled: trip.dynamicSurgeEnabled,
          surgeThresholdPct: trip.surgeThresholdPct,
          surgeIncreasePct: trip.surgeIncreasePct,
        },
        totalSeatsCount,
        bookedSeatsCount
      );

      // Apply segment pricing if boarding/dropping stops specified
      let segmentPrice = priceCalc.finalPrice;
      if (boardingStop && droppingStop) {
        segmentPrice = calculateSegmentFare(priceCalc.finalPrice, boardingStop, droppingStop, trip.intermediateStops);
      }

      return {
        ...seat,
        baseSeatPrice: priceCalc.baseSeatPrice,
        surgeApplied: priceCalc.surgeApplied,
        surgeAmount: priceCalc.surgeAmount,
        finalPrice: priceCalc.finalPrice,
        segmentPrice,
      };
    });

    return NextResponse.json({
      success: true,
      trip,
      occupancy: {
        totalSeats: totalSeatsCount,
        bookedSeats: bookedSeatsCount,
        availableSeats: totalSeatsCount - bookedSeatsCount,
        occupancyPct: Math.round((bookedSeatsCount / (totalSeatsCount || 1)) * 100),
      },
      segmentSelected: boardingStop && droppingStop ? { boardingStop, droppingStop } : null,
      seats: seatPriceMatrix,
    });
  } catch (err: any) {
    console.error('Error in GET /api/admin/trips/:tripId/layout:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

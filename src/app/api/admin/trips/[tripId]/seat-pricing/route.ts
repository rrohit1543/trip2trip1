import { NextResponse } from 'next/server';
import { adminSeatPricingStore, adminTripsStore } from '../../route';

/**
 * PUT /api/admin/trips/:tripId/seat-pricing
 * Bulk updates individual or grouped seat prices, seat types, and statuses.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const body = await request.json();
    const { seatNumbers, priceOverride, status, seatType, dynamicSurgeEnabled, surgeThresholdPct, surgeIncreasePct } = body;

    if (!tripId) {
      return NextResponse.json(
        { success: false, error: 'tripId parameter is required.' },
        { status: 400 }
      );
    }

    // Update Trip Dynamic Surge configuration if provided
    if (adminTripsStore[tripId]) {
      if (dynamicSurgeEnabled !== undefined) adminTripsStore[tripId].dynamicSurgeEnabled = Boolean(dynamicSurgeEnabled);
      if (surgeThresholdPct !== undefined) adminTripsStore[tripId].surgeThresholdPct = Number(surgeThresholdPct);
      if (surgeIncreasePct !== undefined) adminTripsStore[tripId].surgeIncreasePct = Number(surgeIncreasePct);
    }

    // Get current seat pricing array
    let currentSeats = adminSeatPricingStore[tripId];
    if (!currentSeats) {
      // Fallback initializer if store reset
      currentSeats = [];
    }

    // Perform bulk update on selected seatNumbers
    if (Array.isArray(seatNumbers) && seatNumbers.length > 0) {
      currentSeats = currentSeats.map((s) => {
        if (seatNumbers.includes(s.seatNumber)) {
          return {
            ...s,
            priceOverride: priceOverride !== undefined ? (priceOverride === null ? null : Number(priceOverride)) : s.priceOverride,
            status: status !== undefined ? status : s.status,
            seatType: seatType !== undefined ? seatType : s.type || s.seatType,
          };
        }
        return s;
      });

      adminSeatPricingStore[tripId] = currentSeats;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated pricing & status for ${seatNumbers?.length || 0} seats.`,
      updatedSeatCount: seatNumbers?.length || 0,
      tripConfig: adminTripsStore[tripId],
      seats: currentSeats,
    });
  } catch (err: any) {
    console.error('Error in PUT /api/admin/trips/:tripId/seat-pricing:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * TripMandi - Connected Trip & Multi-Leg Logistics Engine
 * Manages Master Parent Trips, Sub-Leg Transitions, Layover Transfers, and Unified Seat Sync.
 */

export interface SubLegRoute {
  legId: string;
  legSequence: number;
  sourceCity: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  layoverDurationMinutes: number;
  transferHubName: string;
  transferHubCoordinates: { lat: number; lng: number };
  contractorId: string;
  contractorName: string;
  vehicleId: string;
  vehicleNumber: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
}

export interface MasterConnectedTrip {
  masterTripId: string;
  slug: string;
  title: string;
  overallSourceCity: string;
  overallDestinationCity: string;
  totalDurationHours: number;
  totalDistanceKm: number;
  subLegs: SubLegRoute[];
  unifiedSeatMap: Record<number, { isBookedInAnyLeg: boolean; legStatuses: Record<string, string> }>;
}

// Memory Store for Connected Trips
export const masterConnectedTripsStore: Record<string, MasterConnectedTrip> = {};

/**
 * Creates a Connected Master Trip with multi-leg logistics configuration
 */
export function createConnectedMasterTrip(params: {
  slug: string;
  title: string;
  overallSourceCity: string;
  overallDestinationCity: string;
  subLegs: Omit<SubLegRoute, 'legId'>[];
}): MasterConnectedTrip {
  const masterTripId = `master_trip_${Date.now()}`;
  
  const subLegsWithIds: SubLegRoute[] = params.subLegs.map((leg, index) => ({
    ...leg,
    legId: `sub_leg_${masterTripId}_${index + 1}`,
    legSequence: index + 1,
  }));

  const totalDuration = subLegsWithIds.reduce((sum, leg) => {
    const dep = new Date(leg.departureTime).getTime();
    const arr = new Date(leg.arrivalTime).getTime();
    const legHours = (arr - dep) / (1000 * 60 * 60);
    return sum + legHours + leg.layoverDurationMinutes / 60;
  }, 0);

  const connectedTrip: MasterConnectedTrip = {
    masterTripId,
    slug: params.slug,
    title: params.title,
    overallSourceCity: params.overallSourceCity,
    overallDestinationCity: params.overallDestinationCity,
    totalDurationHours: Math.round(totalDuration * 10) / 10,
    totalDistanceKm: 650,
    subLegs: subLegsWithIds,
    unifiedSeatMap: {},
  };

  masterConnectedTripsStore[masterTripId] = connectedTrip;
  return connectedTrip;
}

/**
 * Syncs seat reservation across sub-legs when a passenger books a full master journey
 */
export function reserveUnifiedMasterSeat(
  masterTripId: string,
  seatNumber: number,
  passengerInfo: { name: string; phone: string }
): { success: boolean; message: string } {
  const master = masterConnectedTripsStore[masterTripId];
  if (!master) {
    return { success: false, message: 'Master Connected Trip not found.' };
  }

  if (!master.unifiedSeatMap[seatNumber]) {
    master.unifiedSeatMap[seatNumber] = { isBookedInAnyLeg: false, legStatuses: {} };
  }

  // Reserve seat across all sub-legs
  master.subLegs.forEach((leg) => {
    master.unifiedSeatMap[seatNumber].legStatuses[leg.legId] = 'BOOKED';
  });
  master.unifiedSeatMap[seatNumber].isBookedInAnyLeg = true;

  return {
    success: true,
    message: `Seat #${seatNumber} successfully locked across all ${master.subLegs.length} sub-legs of Connected Trip.`,
  };
}

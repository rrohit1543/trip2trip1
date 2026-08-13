/**
 * TripMandi - Dynamic Pricing & Segment Calculation Engine
 * Handles occupancy-based surge pricing and intermediate route segment pricing.
 */

export interface SeatItem {
  id: string;
  tripId: string;
  seatNumber: number;
  seatLabel: string;
  priceOverride?: number | null;
  seatType: 'SEATER' | 'SLEEPER_UPPER' | 'SLEEPER_LOWER';
  status: 'AVAILABLE' | 'FEMALE_ONLY' | 'BLOCKED' | 'BOOKED';
  deck: 'LOWER' | 'UPPER';
  row: number;
  col: number;
}

export interface RouteStop {
  name: string;
  distanceKm: number;
  pricePercentage: number; // e.g. 60% of total fare for partial segment
}

export interface TripPricingConfig {
  tripId: string;
  basePrice: number;
  dynamicSurgeEnabled: boolean;
  surgeThresholdPct: number; // e.g. 75%
  surgeIncreasePct: number;  // e.g. 15%
}

/**
 * Calculates effective seat price including seat override & dynamic surge multiplier
 */
export function calculateEffectiveSeatPrice(
  seat: SeatItem,
  config: TripPricingConfig,
  totalSeats: number,
  bookedSeatsCount: number
): {
  baseSeatPrice: number;
  surgeApplied: boolean;
  surgeAmount: number;
  finalPrice: number;
  occupancyPct: number;
} {
  const occupancyPct = totalSeats > 0 ? (bookedSeatsCount / totalSeats) * 100 : 0;
  const baseSeatPrice = seat.priceOverride != null ? seat.priceOverride : config.basePrice;

  let surgeApplied = false;
  let surgeAmount = 0;

  if (
    config.dynamicSurgeEnabled &&
    occupancyPct >= config.surgeThresholdPct &&
    seat.status === 'AVAILABLE'
  ) {
    surgeApplied = true;
    surgeAmount = Math.round((baseSeatPrice * config.surgeIncreasePct) / 100);
  }

  const finalPrice = baseSeatPrice + surgeAmount;

  return {
    baseSeatPrice,
    surgeApplied,
    surgeAmount,
    finalPrice,
    occupancyPct: Math.round(occupancyPct),
  };
}

/**
 * Calculates segment fare for intermediate boarding & dropping stops
 */
export function calculateSegmentFare(
  fullFare: number,
  boardingStop: string,
  droppingStop: string,
  routeStops: RouteStop[]
): number {
  if (!routeStops || routeStops.length === 0) return fullFare;

  const boarding = routeStops.find((s) => s.name.toLowerCase() === boardingStop.toLowerCase());
  const dropping = routeStops.find((s) => s.name.toLowerCase() === droppingStop.toLowerCase());

  if (!boarding || !dropping) return fullFare;

  const pctDiff = Math.abs(dropping.pricePercentage - boarding.pricePercentage);
  return Math.max(100, Math.round((fullFare * pctDiff) / 100));
}

export type UserRole = 'customer' | 'operator' | 'admin' | 'support_agent';

export type AuthMethod = 'mobile' | 'email';

export type ThemePreference = 'light' | 'dark' | 'system';

export type AccountStatus = 'active' | 'unverified' | 'disabled';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  authIdentifier: string;
  authMethod: AuthMethod;
  passwordHash?: string;
  role: UserRole;
  avatar?: string;
  operatorCompany?: string;
  isVerified?: boolean;
  mfaEnabled?: boolean;
  status: AccountStatus;
  registeredAt: string;
  googleOAuthSub?: string;
  themePreference?: ThemePreference;
}

export interface CommissionRule {
  id: string;
  level: 'global' | 'agency' | 'package';
  targetId?: string; // operatorId or tripId
  targetName?: string;
  commissionPercentage: number; // e.g., 10 for 10%
  updatedAt: string;
  updatedBy: string;
}

export interface PaymentSplitLedger {
  id: string;
  bookingId: string;
  tripId: string;
  tripName: string;
  operatorId: string;
  operatorName: string;
  customerId: string;
  customerName: string;
  grossAmount: number;
  platformCommissionPercentage: number;
  platformCommissionAmount: number;
  gstOnCommissionAmount: number; // 18% on commission
  tdsAmount: number; // 1% TDS on Gross/Net
  agencyNetSettlementAmount: number;
  settlementStatus: 'pending' | 'settled' | 'refunded' | 'partially_refunded';
  settlementSchedule: 'T+1' | 'Instant';
  nodalEscrowTransactionId: string;
  pennyDropVerified: boolean;
  createdAt: string;
  settledAt?: string;
}

export interface SupportTicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  bookingId?: string;
  tripName?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  category: 'booking_inquiry' | 'cancellation_refund' | 'live_trip_issue' | 'payment_dispute' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'escalated' | 'resolved';
  subject: string;
  messages: SupportTicketMessage[];
  refundRequested?: boolean;
  refundAmount?: number;
  refundStatus?: 'none' | 'requested' | 'approved' | 'processed' | 'rejected';
  assignedAgentName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperatorKYC {
  id: string;
  operatorId: string;
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  aadhaarNumber: string;
  panNumber: string;
  gstNumber?: string;
  travelAgencyReg?: string;
  bankAccount: string;
  ifscCode: string;
  upiId: string;
  pennyDropVerified?: boolean;
  pennyDropRecipientName?: string;
  address: string;
  emergencyContact: string;
  logoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

export interface DropPoint {
  name: string;
  lat: number;
  lng: number;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  activities: string[];
  meals: string;
  stayDetails: string;
}

export interface VehicleSpecs {
  type: string;
  regNumber: string;
  amenities: string[];
  driverName: string;
  driverPhone: string;
}

export interface HotelInfo {
  name: string;
  stars: number;
  location: string;
  images: string[];
}

export interface TourGuideInfo {
  name: string;
  phone: string;
  rating: number;
  languages: string[];
  photo: string;
}

export interface Trip {
  id: string;
  name: string;
  category: 'Trekking' | 'Heritage' | 'Beach Caravan' | 'Leisure & Luxury' | 'Spiritual' | 'Adventure';
  operatorId: string;
  operatorName: string;
  operatorLogo: string;
  operatorRating: number;
  operatorReviewsCount: number;
  departureCity: string;
  destinationCity: string;
  pickupLocation: DropPoint;
  dropPoints: DropPoint[];
  durationDays: number;
  durationNights: number;
  departureDateTime: string;
  returnDateTime: string;
  pricePerPerson: number;
  totalSeats: number;
  availableSeats: number;
  bookedSeatNumbers: number[];
  bookingDeadline: string;
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  cancellationPolicy: string;
  requiredDocuments: string[];
  images: string[];
  tourGuide: TourGuideInfo;
  vehicle: VehicleSpecs;
  hotel: HotelInfo;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  difficultyLevel: 'Easy' | 'Moderate' | 'Hard';
  tags: string[];
  blackoutDates?: string[];
  routePath: [number, number][];
  intermediateCities: string[];
}

export interface LiveTelemetry {
  tripId: string;
  currentLat: number;
  currentLng: number;
  speedKmH: number;
  currentSpeed?: number;
  headingDeg: number;
  nextCheckpointName: string;
  nextStopName?: string;
  currentStopName?: string;
  etaNextCheckpoint: string;
  etaDestination?: string;
  progressPercent?: number;
  lastUpdatedIso: string;
  emergencyAlertActive?: boolean;
}

export interface Booking {
  id: string;
  tripId: string;
  tripName: string;
  operatorName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  selectedSeats: number[];
  totalAmount: number;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'Wallet';
  paymentStatus: 'paid' | 'pending' | 'refunded' | 'partially_refunded';
  pickupPoint: string;
  dropPoint: string;
  promoCodeApplied?: string;
  discountAmount?: number;
  gstInvoiceNumber?: string;
  bookingDate: string;
  qrCodeData: string;
}

export interface Review {
  id: string;
  tripId: string;
  operatorId: string;
  customerId: string;
  customerName: string;
  operatorRating: number;
  driverRating: number;
  guideRating: number;
  comment: string;
  photos: string[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  tripId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
}

export interface RouteSearchResult {
  departureCity: string;
  destinationCity: string;
  matchingTrips: Trip[];
  liveCount: number;
  upcomingCount: number;
  nearIntermediateCount: number;
  nearDestinationCount: number;
}

export interface OtpSession {
  identifier: string;
  otpCode: string;
  expiresAt: number;
  attempts: number;
  isUsed: boolean;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType:
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'OTP_SENT'
    | 'OTP_VERIFIED'
    | 'PASSWORD_RESET_REQUEST'
    | 'PASSWORD_RESET_SUCCESS'
    | 'ADMIN_MFA_REQUEST'
    | 'ADMIN_MFA_SUCCESS'
    | 'ADMIN_GOOGLE_OAUTH_SUCCESS'
    | 'ADMIN_GOOGLE_OAUTH_REJECTED'
    | 'USER_STATUS_UPDATED'
    | 'UNAUTHORIZED_ADMIN_ATTEMPT'
    | 'SUPPORT_REFUND_PROCESSED'
    | 'COMMISSION_RULE_UPDATED'
    | 'TRIP_DELETED';
  identifier: string;
  details: string;
  ipAddress?: string;
}

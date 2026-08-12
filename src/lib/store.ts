import { useState, useEffect } from 'react';
import {
  User,
  UserRole,
  OperatorKYC,
  Trip,
  LiveTelemetry,
  Booking,
  Review,
  ChatMessage,
  RouteSearchResult,
  OtpSession,
  SecurityEvent,
  CommissionRule,
  PaymentSplitLedger,
  SupportTicket,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_OPERATOR_KYC,
  INITIAL_TRIPS,
  INITIAL_TELEMETRY,
  INITIAL_BOOKINGS,
  INITIAL_REVIEWS,
  INITIAL_CHAT,
  INITIAL_SECURITY_LOGS,
  INITIAL_COMMISSION_RULES,
  INITIAL_PAYMENT_SPLIT_LEDGER,
  INITIAL_SUPPORT_TICKETS,
} from './mockData';
import { hashPassword, generateOTP, checkRateLimit, createSecurityLog, isValidEmail, isValidMobile } from './security';

const STORAGE_KEYS = {
  CURRENT_USER: 'TripMandi_v6_whitered_current_user',
  USERS: 'TripMandi_v6_whitered_users',
  KYC: 'TripMandi_v6_whitered_kyc',
  TRIPS: 'TripMandi_v6_whitered_trips',
  TELEMETRY: 'TripMandi_v6_whitered_telemetry',
  BOOKINGS: 'TripMandi_v6_whitered_bookings',
  REVIEWS: 'TripMandi_v6_whitered_reviews',
  CHAT: 'TripMandi_v6_whitered_chat',
  SECURITY_LOGS: 'TripMandi_v6_whitered_security_logs',
  COMMISSION_RULES: 'TripMandi_v6_whitered_commission_rules',
  PAYMENT_SPLITS: 'TripMandi_v6_whitered_payment_splits',
  SUPPORT_TICKETS: 'TripMandi_v6_whitered_support_tickets',
};

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage set error:', e);
  }
}

export function useTripMandiStore() {
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    getStored<User | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0])
  );
  const [users, setUsers] = useState<User[]>(() =>
    getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS)
  );
  const [operatorKYC, setOperatorKYC] = useState<OperatorKYC[]>(() =>
    getStored<OperatorKYC[]>(STORAGE_KEYS.KYC, INITIAL_OPERATOR_KYC)
  );
  const [trips, setTrips] = useState<Trip[]>(() =>
    getStored<Trip[]>(STORAGE_KEYS.TRIPS, INITIAL_TRIPS)
  );
  const [telemetry, setTelemetry] = useState<Record<string, LiveTelemetry>>(() =>
    getStored<Record<string, LiveTelemetry>>(STORAGE_KEYS.TELEMETRY, INITIAL_TELEMETRY)
  );
  const [bookings, setBookings] = useState<Booking[]>(() =>
    getStored<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS)
  );
  const [reviews, setReviews] = useState<Review[]>(() =>
    getStored<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS)
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() =>
    getStored<ChatMessage[]>(STORAGE_KEYS.CHAT, INITIAL_CHAT)
  );
  const [securityLogs, setSecurityLogs] = useState<SecurityEvent[]>(() =>
    getStored<SecurityEvent[]>(STORAGE_KEYS.SECURITY_LOGS, INITIAL_SECURITY_LOGS)
  );

  // MARKETPLACE MODULES: Commission Engine, Payment Split Ledger & Support Desk
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>(() =>
    getStored<CommissionRule[]>(STORAGE_KEYS.COMMISSION_RULES, INITIAL_COMMISSION_RULES)
  );
  const [paymentSplits, setPaymentSplits] = useState<PaymentSplitLedger[]>(() =>
    getStored<PaymentSplitLedger[]>(STORAGE_KEYS.PAYMENT_SPLITS, INITIAL_PAYMENT_SPLIT_LEDGER)
  );
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() =>
    getStored<SupportTicket[]>(STORAGE_KEYS.SUPPORT_TICKETS, INITIAL_SUPPORT_TICKETS)
  );

  const [otpSessions, setOtpSessions] = useState<Record<string, OtpSession>>({});

  // Sync to localStorage
  useEffect(() => setStored(STORAGE_KEYS.CURRENT_USER, currentUser), [currentUser]);
  useEffect(() => setStored(STORAGE_KEYS.USERS, users), [users]);
  useEffect(() => setStored(STORAGE_KEYS.KYC, operatorKYC), [operatorKYC]);
  useEffect(() => setStored(STORAGE_KEYS.TRIPS, trips), [trips]);
  useEffect(() => setStored(STORAGE_KEYS.TELEMETRY, telemetry), [telemetry]);
  useEffect(() => setStored(STORAGE_KEYS.BOOKINGS, bookings), [bookings]);
  useEffect(() => setStored(STORAGE_KEYS.REVIEWS, reviews), [reviews]);
  useEffect(() => setStored(STORAGE_KEYS.CHAT, chatMessages), [chatMessages]);
  useEffect(() => setStored(STORAGE_KEYS.SECURITY_LOGS, securityLogs), [securityLogs]);
  useEffect(() => setStored(STORAGE_KEYS.COMMISSION_RULES, commissionRules), [commissionRules]);
  useEffect(() => setStored(STORAGE_KEYS.PAYMENT_SPLITS, paymentSplits), [paymentSplits]);
  useEffect(() => setStored(STORAGE_KEYS.SUPPORT_TICKETS, supportTickets), [supportTickets]);

  // Real-time GPS Simulation Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const nextState: Record<string, LiveTelemetry> = { ...prev };
        Object.keys(nextState).forEach((tripId) => {
          const trip = trips.find((t) => t.id === tripId);
          if (trip && trip.status === 'live') {
            const current = nextState[tripId];
            if (current) {
              const deltaLat = (Math.random() - 0.48) * 0.002;
              const deltaLng = (Math.random() - 0.48) * 0.002;
              nextState[tripId] = {
                ...current,
                currentLat: +(current.currentLat + deltaLat).toFixed(4),
                currentLng: +(current.currentLng + deltaLng).toFixed(4),
                speedKmH: Math.floor(45 + Math.random() * 20),
                lastUpdatedIso: new Date().toISOString(),
              };
            }
          }
        });
        return nextState;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [trips]);

  const addSecurityLog = (eventType: SecurityEvent['eventType'], identifier: string, details: string) => {
    const log = createSecurityLog(eventType, identifier, details);
    setSecurityLogs((prev) => [log, ...prev]);
  };

  // 1. COMMISSION ENGINE MATH
  const getApplicableCommissionRate = (operatorId: string, tripId?: string): number => {
    // Package specific override
    if (tripId) {
      const pkgRule = commissionRules.find((r) => r.level === 'package' && r.targetId === tripId);
      if (pkgRule) return pkgRule.commissionPercentage;
    }
    // Agency specific override
    const agencyRule = commissionRules.find((r) => r.level === 'agency' && r.targetId === operatorId);
    if (agencyRule) return agencyRule.commissionPercentage;

    // Global default
    const globalRule = commissionRules.find((r) => r.level === 'global');
    return globalRule ? globalRule.commissionPercentage : 10;
  };

  const updateCommissionRule = (rule: Omit<CommissionRule, 'id' | 'updatedAt' | 'updatedBy'>) => {
    const newRule: CommissionRule = {
      ...rule,
      id: `rule_${Date.now()}`,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser ? currentUser.name : 'Super Admin',
    };

    setCommissionRules((prev) => {
      const filtered = prev.filter((r) => !(r.level === rule.level && r.targetId === rule.targetId));
      return [newRule, ...filtered];
    });

    addSecurityLog(
      'COMMISSION_RULE_UPDATED',
      rule.targetId || 'GLOBAL',
      `Commission rate for ${rule.level} updated to ${rule.commissionPercentage}%`
    );
  };

  // 2. AUTOMATED PAYMENT SPLIT ENGINE
  const createBooking = (bookingData: Omit<Booking, 'id' | 'bookingDate' | 'qrCodeData'>) => {
    const bookingId = `bk_${Date.now().toString().slice(-6)}`;
    const newBooking: Booking = {
      ...bookingData,
      id: bookingId,
      bookingDate: new Date().toISOString(),
      qrCodeData: `T2T-${bookingId}-${bookingData.customerName.toUpperCase()}`,
    };

    const targetTrip = trips.find((t) => t.id === bookingData.tripId);
    const operatorId = targetTrip ? targetTrip.operatorId : 'usr_operator_1';

    // Calculate Split Settlement Math
    const commissionPct = getApplicableCommissionRate(operatorId, bookingData.tripId);
    const gross = bookingData.totalAmount;
    const commissionAmt = Math.round((gross * commissionPct) / 100);
    const gstOnCommission = Math.round(commissionAmt * 0.18);
    const tdsAmt = Math.round(gross * 0.01);
    const netSettlement = Math.max(0, gross - commissionAmt - gstOnCommission - tdsAmt);

    const newSplit: PaymentSplitLedger = {
      id: `split_${bookingId}`,
      bookingId,
      tripId: bookingData.tripId,
      tripName: bookingData.tripName,
      operatorId,
      operatorName: bookingData.operatorName,
      customerId: bookingData.customerId,
      customerName: bookingData.customerName,
      grossAmount: gross,
      platformCommissionPercentage: commissionPct,
      platformCommissionAmount: commissionAmt,
      gstOnCommissionAmount: gstOnCommission,
      tdsAmount: tdsAmt,
      agencyNetSettlementAmount: netSettlement,
      settlementStatus: 'settled',
      settlementSchedule: 'T+1',
      nodalEscrowTransactionId: `NODAL_TXN_${Date.now()}`,
      pennyDropVerified: true,
      createdAt: new Date().toISOString(),
      settledAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);
    setPaymentSplits((prev) => [newSplit, ...prev]);

    // Update Seat Inventory
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === bookingData.tripId) {
          const updatedBooked = Array.from(new Set([...t.bookedSeatNumbers, ...bookingData.selectedSeats]));
          return {
            ...t,
            bookedSeatNumbers: updatedBooked,
            availableSeats: Math.max(0, t.totalSeats - updatedBooked.length),
          };
        }
        return t;
      })
    );

    return newBooking;
  };

  // 3. CUSTOMER SUPPORT DESK & AUTOMATED REFUNDS
  const createSupportTicket = (ticketData: Omit<SupportTicket, 'id' | 'status' | 'messages' | 'createdAt' | 'updatedAt'>) => {
    const newTicket: SupportTicket = {
      ...ticketData,
      id: `tkt_${Date.now().toString().slice(-4)}`,
      status: 'open',
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderId: ticketData.customerId,
          senderName: ticketData.customerName,
          senderRole: 'customer',
          message: ticketData.subject,
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSupportTickets((prev) => [newTicket, ...prev]);
    return newTicket;
  };

  const addTicketMessage = (ticketId: string, messageText: string) => {
    if (!currentUser) return;
    setSupportTickets((prev) =>
      prev.map((tkt) => {
        if (tkt.id === ticketId) {
          const newMsg = {
            id: `msg_${Date.now()}`,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderRole: currentUser.role,
            message: messageText,
            timestamp: new Date().toISOString(),
          };
          return {
            ...tkt,
            messages: [...tkt.messages, newMsg],
            updatedAt: new Date().toISOString(),
          };
        }
        return tkt;
      })
    );
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicket['status']) => {
    setSupportTickets((prev) =>
      prev.map((tkt) => (tkt.id === ticketId ? { ...tkt, status, updatedAt: new Date().toISOString() } : tkt))
    );
  };

  const processTicketRefund = (ticketId: string, refundAmount: number) => {
    const targetTicket = supportTickets.find((t) => t.id === ticketId);
    if (!targetTicket || !targetTicket.bookingId) return;

    // Update Booking status
    setBookings((prev) =>
      prev.map((b) => (b.id === targetTicket.bookingId ? { ...b, paymentStatus: 'refunded' } : b))
    );

    // Reverse Payment Split Ledger
    setPaymentSplits((prev) =>
      prev.map((s) =>
        s.bookingId === targetTicket.bookingId ? { ...s, settlementStatus: 'refunded' } : s
      )
    );

    // Update Support Ticket status
    setSupportTickets((prev) =>
      prev.map((tkt) =>
        tkt.id === ticketId
          ? {
              ...tkt,
              status: 'resolved',
              refundStatus: 'processed',
              refundAmount,
              updatedAt: new Date().toISOString(),
            }
          : tkt
      )
    );

    addSecurityLog(
      'SUPPORT_REFUND_PROCESSED',
      targetTicket.customerEmail,
      `Support Refund of ₹${refundAmount} processed for Booking #${targetTicket.bookingId}`
    );
  };

  // 4. AUTHENTICATION HANDLERS
  const registerUser = (name: string, identifier: string, password: string, role: UserRole) => {
    if (!checkRateLimit(`reg_${identifier}`, 5).allowed) {
      return { success: false, message: 'Too many registration attempts. Please wait 15 minutes.' };
    }

    const existing = users.find((u) => u.email === identifier || u.phone === identifier);
    if (existing) {
      return { success: false, message: 'An account with this mobile number or email address already exists.' };
    }

    const isEmail = isValidEmail(identifier);
    const authMethod = isEmail ? 'email' : 'mobile';

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email: isEmail ? identifier : `${Date.now()}@user.TripMandi`,
      phone: !isEmail ? identifier : '+91 99000 00000',
      authIdentifier: identifier,
      authMethod,
      passwordHash: hashPassword(password),
      role,
      isVerified: false,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
    };

    setUsers((prev) => [...prev, newUser]);

    const code = generateOTP();
    setOtpSessions((prev) => ({
      ...prev,
      [identifier]: {
        identifier,
        otpCode: code,
        expiresAt: Date.now() + 300000,
        attempts: 0,
        isUsed: false,
      },
    }));

    addSecurityLog('OTP_SENT', identifier, `Registration 6-digit OTP code dispatched to ${identifier}`);
    return { success: true, message: `OTP code sent to ${identifier}.`, otpCode: code };
  };

  const verifyRegistrationOTP = (identifier: string, code: string) => {
    const session = otpSessions[identifier];
    if (!session || session.isUsed || Date.now() > session.expiresAt) {
      return { success: false, message: 'OTP is invalid or expired. Please request a new OTP.' };
    }

    if (session.attempts >= 3) {
      return { success: false, message: 'Maximum OTP verification attempts exceeded.' };
    }

    if (session.otpCode !== code) {
      setOtpSessions((prev) => ({
        ...prev,
        [identifier]: { ...session, attempts: session.attempts + 1 },
      }));
      return { success: false, message: `Invalid OTP. Attempts left: ${2 - session.attempts}` };
    }

    setOtpSessions((prev) => ({
      ...prev,
      [identifier]: { ...session, isUsed: true },
    }));

    setUsers((prev) =>
      prev.map((u) => (u.authIdentifier === identifier ? { ...u, isVerified: true } : u))
    );

    const verifiedUser = users.find((u) => u.authIdentifier === identifier);
    if (verifiedUser) {
      setCurrentUser({ ...verifiedUser, isVerified: true });
    }

    addSecurityLog('OTP_VERIFIED', identifier, 'User account verified via 6-digit OTP');
    return { success: true, message: 'Account verified successfully!' };
  };

  const requestPasswordReset = (identifier: string) => {
    const code = generateOTP();
    setOtpSessions((prev) => ({
      ...prev,
      [identifier]: {
        identifier,
        otpCode: code,
        expiresAt: Date.now() + 300000,
        attempts: 0,
        isUsed: false,
      },
    }));

    addSecurityLog('PASSWORD_RESET_REQUEST', identifier, `Generic OWASP Password Reset requested for ${identifier}`);
    return {
      success: true,
      message: 'If the provided contact exists, a single-use 5-minute reset OTP has been sent.',
      otpCode: code,
    };
  };

  const resetPasswordWithOTP = (identifier: string, code: string, newPassword: string) => {
    const session = otpSessions[identifier];
    if (!session || session.isUsed || Date.now() > session.expiresAt) {
      return { success: false, message: 'Reset OTP is invalid or expired.' };
    }

    if (session.otpCode !== code) {
      return { success: false, message: 'Invalid Reset OTP code.' };
    }

    setOtpSessions((prev) => ({
      ...prev,
      [identifier]: { ...session, isUsed: true },
    }));

    const newHash = hashPassword(newPassword);
    setUsers((prev) =>
      prev.map((u) => (u.authIdentifier === identifier ? { ...u, passwordHash: newHash } : u))
    );

    if (currentUser && currentUser.authIdentifier === identifier) {
      setCurrentUser(null);
    }

    addSecurityLog('PASSWORD_RESET_SUCCESS', identifier, 'Password reset succeeded. Sessions invalidated.');
    return { success: true, message: 'Password reset successfully! Active sessions invalidated. Please log in.' };
  };

  const loginUser = (identifier: string, password: string) => {
    if (!checkRateLimit(`login_${identifier}`, 5).allowed) {
      return { success: false, message: 'Too many failed attempts. Rate limit enforced.' };
    }

    const inputHash = hashPassword(password);
    const matched = users.find((u) => u.authIdentifier === identifier && u.passwordHash === inputHash);

    if (!matched) {
      addSecurityLog('LOGIN_FAILED', identifier, 'Invalid login credentials');
      return { success: false, message: 'Invalid contact identifier or password.' };
    }

    if (matched.role === 'admin') {
      addSecurityLog('UNAUTHORIZED_ADMIN_ATTEMPT', identifier, 'Admin attempt rejected on public login page');
      return { success: false, message: 'Administrator accounts must log in via the dedicated Admin Portal.' };
    }

    setCurrentUser(matched);
    addSecurityLog('LOGIN_SUCCESS', identifier, `User logged in as ${matched.role}`);
    return { success: true, message: 'Signed in successfully!', user: matched };
  };

  const requestAdminLoginMFA = (identifier: string, password: string) => {
    const inputHash = hashPassword(password);
    const matched = users.find(
      (u) => u.authIdentifier === identifier && u.passwordHash === inputHash && u.role === 'admin'
    );

    if (!matched) {
      addSecurityLog('UNAUTHORIZED_ADMIN_ATTEMPT', identifier, 'Failed Admin Portal credentials attempt');
      return { success: false, message: 'Invalid Administrator credentials or unauthorized account.' };
    }

    const code = generateOTP();
    setOtpSessions((prev) => ({
      ...prev,
      [identifier]: {
        identifier,
        otpCode: code,
        expiresAt: Date.now() + 300000,
        attempts: 0,
        isUsed: false,
      },
    }));

    addSecurityLog('ADMIN_MFA_REQUEST', identifier, 'Admin 2FA MFA code dispatched');
    return { success: true, message: 'MFA 2FA Code dispatched to admin.', mfaRequired: true, code };
  };

  const verifyAdminMFA = (identifier: string, code: string) => {
    const session = otpSessions[identifier];
    if (!session || session.isUsed || Date.now() > session.expiresAt) {
      return { success: false, message: 'MFA OTP is invalid or expired.' };
    }

    if (session.otpCode !== code) {
      return { success: false, message: 'Invalid MFA OTP code.' };
    }

    setOtpSessions((prev) => ({
      ...prev,
      [identifier]: { ...session, isUsed: true },
    }));

    const matched = users.find((u) => u.authIdentifier === identifier && u.role === 'admin');
    if (matched) {
      setCurrentUser(matched);
      addSecurityLog('ADMIN_MFA_SUCCESS', identifier, 'Super Admin authenticated with 2FA MFA');
      return { success: true, message: 'Admin authentication granted!', user: matched };
    }

    return { success: false, message: 'Admin user not found.' };
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const submitKYC = (data: Omit<OperatorKYC, 'id' | 'status' | 'createdAt'>) => {
    const newKYC: OperatorKYC = {
      ...data,
      id: `kyc_${Date.now()}`,
      pennyDropVerified: true,
      pennyDropRecipientName: data.ownerName.toUpperCase(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setOperatorKYC((prev) => [newKYC, ...prev]);

    if (currentUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === data.operatorId ? { ...u, operatorCompany: data.companyName } : u))
      );
      if (currentUser.id === data.operatorId) {
        setCurrentUser((prev) => (prev ? { ...prev, operatorCompany: data.companyName } : null));
      }
    }
  };

  const updateKYCStatus = (kycId: string, status: 'approved' | 'rejected', reason?: string) => {
    setOperatorKYC((prev) =>
      prev.map((k) => (k.id === kycId ? { ...k, status, rejectionReason: reason } : k))
    );

    const targetKyc = operatorKYC.find((k) => k.id === kycId);
    if (targetKyc && status === 'approved') {
      setUsers((prev) =>
        prev.map((u) => (u.id === targetKyc.operatorId ? { ...u, isVerified: true } : u))
      );
      if (currentUser && currentUser.id === targetKyc.operatorId) {
        setCurrentUser((prev) => (prev ? { ...prev, isVerified: true } : null));
      }
    }
  };

  const createTrip = (tripData: Omit<Trip, 'id' | 'operatorId' | 'operatorName' | 'operatorLogo' | 'operatorRating' | 'operatorReviewsCount' | 'status' | 'bookedSeatNumbers'>) => {
    const newTrip: Trip = {
      ...tripData,
      id: `trip_${Date.now()}`,
      operatorId: currentUser ? currentUser.id : 'usr_operator_1',
      operatorName: currentUser?.operatorCompany || 'Verified Tour Operator',
      operatorLogo: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=200&q=80',
      operatorRating: 5.0,
      operatorReviewsCount: 1,
      status: 'upcoming',
      bookedSeatNumbers: [],
    };

    setTrips((prev) => [newTrip, ...prev]);
    setTelemetry((prev) => ({
      ...prev,
      [newTrip.id]: {
        tripId: newTrip.id,
        currentLat: newTrip.pickupLocation.lat,
        currentLng: newTrip.pickupLocation.lng,
        speedKmH: 0,
        headingDeg: 0,
        nextCheckpointName: newTrip.pickupLocation.name,
        etaNextCheckpoint: 'Scheduled Departure',
        lastUpdatedIso: new Date().toISOString(),
      },
    }));
  };

  const toggleLiveTrip = (tripId: string) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          const nextStatus = t.status === 'live' ? 'upcoming' : 'live';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const addChatMessage = (tripId: string, text: string) => {
    if (!currentUser) return;
    const msg: ChatMessage = {
      id: `chat_${Date.now()}`,
      tripId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, msg]);
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const rev: Review = {
      ...reviewData,
      id: `rev_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [rev, ...prev]);
  };

  const searchRoute = (departure: string, destination: string, category: string = 'All'): RouteSearchResult => {
    const depLower = departure.toLowerCase().trim();
    const destLower = destination.toLowerCase().trim();

    const matchingTrips = trips.filter((t) => {
      const matchCategory = category === 'All' || t.category === category;
      const matchDep = depLower === '' || t.departureCity.toLowerCase().includes(depLower);
      const matchDest = destLower === '' || t.destinationCity.toLowerCase().includes(destLower);
      return matchCategory && matchDep && matchDest;
    });

    const liveCount = matchingTrips.filter((t) => t.status === 'live').length;
    const upcomingCount = matchingTrips.filter((t) => t.status === 'upcoming').length;

    return {
      departureCity: departure,
      destinationCity: destination,
      matchingTrips,
      liveCount,
      upcomingCount,
      nearIntermediateCount: Math.ceil(liveCount * 0.5),
      nearDestinationCount: Math.floor(liveCount * 0.5),
    };
  };

  return {
    currentUser,
    users,
    operatorKYC,
    trips,
    telemetry,
    bookings,
    reviews,
    chatMessages,
    securityLogs,
    commissionRules,
    paymentSplits,
    supportTickets,
    getApplicableCommissionRate,
    updateCommissionRule,
    registerUser,
    verifyRegistrationOTP,
    requestPasswordReset,
    resetPasswordWithOTP,
    loginUser,
    requestAdminLoginMFA,
    verifyAdminMFA,
    logoutUser,
    submitKYC,
    updateKYCStatus,
    createTrip,
    toggleLiveTrip,
    createBooking,
    createSupportTicket,
    addTicketMessage,
    updateTicketStatus,
    processTicketRefund,
    addChatMessage,
    addReview,
    searchRoute,
  };
}

'use client';

import { useState, useEffect } from 'react';
import {
  User,
  OperatorKYC,
  Trip,
  LiveTelemetry,
  Booking,
  Review,
  ChatMessage,
  SecurityEvent,
  CommissionRule,
  PaymentSplitLedger,
  SupportTicket,
  UserRole,
  AccountStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_OPERATOR_KYC,
  INITIAL_TRIPS,
  INITIAL_TELEMETRY,
  INITIAL_BOOKINGS,
  INITIAL_REVIEWS,
  INITIAL_CHAT,
  INITIAL_COMMISSION_RULES,
  INITIAL_PAYMENT_SPLIT_LEDGER,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_SECURITY_LOGS,
} from './mockData';
import { hashPassword, generateOTP, checkRateLimit, createSecurityLog, isValidEmail, isValidMobile } from './security';

const STORAGE_KEYS = {
  CURRENT_USER: 'tripmandi_v7_current_user',
  USERS: 'tripmandi_v7_users',
  KYC: 'tripmandi_v7_kyc',
  TRIPS: 'tripmandi_v7_trips',
  TELEMETRY: 'tripmandi_v7_telemetry',
  BOOKINGS: 'tripmandi_v7_bookings',
  REVIEWS: 'tripmandi_v7_reviews',
  CHAT: 'tripmandi_v7_chat',
  SECURITY_LOGS: 'tripmandi_v7_security_logs',
  COMMISSION_RULES: 'tripmandi_v7_commission_rules',
  PAYMENT_SPLITS: 'tripmandi_v7_payment_splits',
  SUPPORT_TICKETS: 'tripmandi_v7_support_tickets',
};

// Authorized Super Admin Gmail List / Domain Filter
const AUTHORIZED_ADMIN_GMAILS = [
  'rohit19249@gmail.com',
  'tripmandi.official@gmail.com',
  'rrohit1543@gmail.com',
  'admin@tripmandi.com',
  'superadmin@tripmandi.com',
  'admin@gmail.com',
];

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error setting ${key} in localStorage:`, err);
  }
}

export function useTripMandiStore() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStored(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]));
  const [users, setUsers] = useState<User[]>(() => getStored(STORAGE_KEYS.USERS, INITIAL_USERS));
  const [operatorKYC, setOperatorKYC] = useState<OperatorKYC[]>(() => getStored(STORAGE_KEYS.KYC, INITIAL_OPERATOR_KYC));
  const [trips, setTrips] = useState<Trip[]>(() => getStored(STORAGE_KEYS.TRIPS, INITIAL_TRIPS));
  const [telemetry, setTelemetry] = useState<Record<string, LiveTelemetry>>(() => getStored(STORAGE_KEYS.TELEMETRY, INITIAL_TELEMETRY));
  const [bookings, setBookings] = useState<Booking[]>(() => getStored(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS));
  const [reviews, setReviews] = useState<Review[]>(() => getStored(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => getStored(STORAGE_KEYS.CHAT, INITIAL_CHAT));
  const [securityLogs, setSecurityLogs] = useState<SecurityEvent[]>(() => getStored(STORAGE_KEYS.SECURITY_LOGS, INITIAL_SECURITY_LOGS));
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>(() => getStored(STORAGE_KEYS.COMMISSION_RULES, INITIAL_COMMISSION_RULES));
  const [paymentSplits, setPaymentSplits] = useState<PaymentSplitLedger[]>(() => getStored(STORAGE_KEYS.PAYMENT_SPLITS, INITIAL_PAYMENT_SPLIT_LEDGER));
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => getStored(STORAGE_KEYS.SUPPORT_TICKETS, INITIAL_SUPPORT_TICKETS));

  const [otpSessions, setOtpSessions] = useState<Record<string, { identifier: string; otpCode: string; expiresAt: number; attempts: number; isUsed: boolean }>>({});

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

  const addSecurityLog = (eventType: SecurityEvent['eventType'], identifier: string, details: string) => {
    const log = createSecurityLog(eventType, identifier, details);
    setSecurityLogs((prev) => [log, ...prev].slice(0, 100));
  };

  // Dynamic Commission Calculation
  const getApplicableCommissionRate = (operatorId: string, tripId?: string): number => {
    if (tripId) {
      const packageRule = commissionRules.find((r) => r.level === 'package' && r.targetId === tripId);
      if (packageRule) return packageRule.commissionPercentage;
    }
    const agencyRule = commissionRules.find((r) => r.level === 'agency' && r.targetId === operatorId);
    if (agencyRule) return agencyRule.commissionPercentage;

    const globalRule = commissionRules.find((r) => r.level === 'global');
    return globalRule ? globalRule.commissionPercentage : 10;
  };

  const updateCommissionRule = (ruleIdOrObj: any, newPercentage?: number, updatedBy = 'Super Admin') => {
    if (typeof ruleIdOrObj === 'object') {
      const ruleObj = ruleIdOrObj;
      setCommissionRules((prev) =>
        prev.map((r) =>
          r.level === ruleObj.level
            ? { ...r, commissionPercentage: ruleObj.commissionPercentage, updatedAt: new Date().toISOString(), updatedBy }
            : r
        )
      );
      addSecurityLog('COMMISSION_RULE_UPDATED', ruleObj.level, `Commission rate updated to ${ruleObj.commissionPercentage}%`);
    } else {
      setCommissionRules((prev) =>
        prev.map((r) => (r.id === ruleIdOrObj ? { ...r, commissionPercentage: newPercentage!, updatedAt: new Date().toISOString(), updatedBy } : r))
      );
      addSecurityLog('COMMISSION_RULE_UPDATED', ruleIdOrObj, `Commission rate updated to ${newPercentage}% by ${updatedBy}`);
    }
  };

  // User Management Handlers (Admin Control)
  const updateUserStatus = (userId: string, status: AccountStatus) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status } : u))
    );
    addSecurityLog('USER_STATUS_UPDATED', userId, `User status updated to ${status}`);
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u))
    );
    addSecurityLog('USER_STATUS_UPDATED', userId, `User role changed to ${role}`);
  };

  // Support Ticketing Actions
  const createSupportTicket = (
    customerIdOrData: any,
    customerName?: string,
    customerPhone?: string,
    customerEmail?: string,
    category?: SupportTicket['category'],
    priority?: SupportTicket['priority'],
    subject?: string,
    initialMessage?: string,
    bookingId?: string,
    tripName?: string
  ): SupportTicket => {
    let newTicket: SupportTicket;

    if (typeof customerIdOrData === 'object') {
      const data = customerIdOrData;
      newTicket = {
        id: `tkt_${Date.now()}`,
        bookingId: data.bookingId,
        tripName: data.tripName,
        customerId: data.customerId || 'usr_customer_1',
        customerName: data.customerName || 'Customer',
        customerPhone: data.customerPhone || '+91 9876543210',
        customerEmail: data.customerEmail || 'customer@example.com',
        category: data.category || 'general',
        priority: data.priority || 'medium',
        status: 'open',
        subject: data.subject || 'Support Ticket',
        messages: [
          {
            id: `msg_${Date.now()}`,
            senderId: data.customerId || 'usr_customer_1',
            senderName: data.customerName || 'Customer',
            senderRole: 'customer',
            message: data.initialMessage || data.subject || 'Support request',
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else {
      newTicket = {
        id: `tkt_${Date.now()}`,
        bookingId,
        tripName,
        customerId: customerIdOrData,
        customerName: customerName!,
        customerPhone: customerPhone!,
        customerEmail: customerEmail!,
        category: category!,
        priority: priority!,
        status: 'open',
        subject: subject!,
        messages: [
          {
            id: `msg_${Date.now()}`,
            senderId: customerIdOrData,
            senderName: customerName!,
            senderRole: 'customer',
            message: initialMessage!,
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    setSupportTickets((prev) => [newTicket, ...prev]);
    return newTicket;
  };

  const addTicketMessage = (ticketId: string, senderIdOrMsg: string, senderName?: string, senderRole?: UserRole, messageText?: string) => {
    const isSingleMessageObj = !senderName;
    const msgContent = isSingleMessageObj ? senderIdOrMsg : messageText!;
    const msgSenderId = isSingleMessageObj ? (currentUser ? currentUser.id : 'usr_customer_1') : senderIdOrMsg;
    const msgSenderName = isSingleMessageObj ? (currentUser ? currentUser.name : 'Rahul Sharma') : senderName!;
    const msgRole: UserRole = isSingleMessageObj ? (currentUser ? currentUser.role : 'customer') : senderRole!;

    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: msgSenderId,
      senderName: msgSenderName,
      senderRole: msgRole,
      message: msgContent,
      timestamp: new Date().toISOString(),
    };

    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              messages: [...t.messages, newMsg],
              updatedAt: new Date().toISOString(),
              assignedAgentName: msgRole === 'support_agent' ? msgSenderName : t.assignedAgentName,
            }
          : t
      )
    );
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicket['status']) => {
    setSupportTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t))
    );
  };

  const processTicketRefund = (ticketId: string, refundAmount: number, agentName = 'Customer Support') => {
    const targetTicket = supportTickets.find((t) => t.id === ticketId);
    if (!targetTicket || !targetTicket.bookingId) return;

    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              refundRequested: true,
              refundAmount,
              refundStatus: 'processed',
              status: 'resolved',
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );

    setPaymentSplits((prev) =>
      prev.map((s) => (s.bookingId === targetTicket.bookingId ? { ...s, settlementStatus: 'refunded' } : s))
    );

    setBookings((prev) =>
      prev.map((b) => (b.id === targetTicket.bookingId ? { ...b, paymentStatus: 'refunded' } : b))
    );

    addSecurityLog(
      'SUPPORT_REFUND_PROCESSED',
      targetTicket.customerEmail,
      `Support Refund of ₹${refundAmount} processed for Booking #${targetTicket.bookingId} by ${agentName}`
    );
  };

  // AUTHENTICATION HANDLERS
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
      email: isEmail ? identifier : `${Date.now()}@user.tripmandi`,
      phone: !isEmail ? identifier : '+91 99000 00000',
      authIdentifier: identifier,
      authMethod,
      passwordHash: hashPassword(password),
      role,
      isVerified: false,
      status: 'unverified',
      registeredAt: new Date().toISOString(),
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
      prev.map((u) => (u.authIdentifier === identifier ? { ...u, isVerified: true, status: 'active' } : u))
    );

    const verifiedUser = users.find((u) => u.authIdentifier === identifier);
    if (verifiedUser) {
      setCurrentUser({ ...verifiedUser, isVerified: true, status: 'active' });
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

  const resetPasswordWithOTP = (identifier: string, code: string, newPass: string) => {
    const session = otpSessions[identifier];
    if (!session || session.isUsed || Date.now() > session.expiresAt) {
      return { success: false, message: 'Password reset token expired or invalid.' };
    }

    if (session.otpCode !== code) {
      return { success: false, message: 'Invalid 6-digit OTP code.' };
    }

    const newHash = hashPassword(newPass);
    setUsers((prev) =>
      prev.map((u) => (u.authIdentifier === identifier ? { ...u, passwordHash: newHash, isVerified: true, status: 'active' } : u))
    );

    if (currentUser && currentUser.authIdentifier === identifier) {
      setCurrentUser(null);
    }

    addSecurityLog('PASSWORD_RESET_SUCCESS', identifier, 'Password reset succeeded. Sessions invalidated.');
    return { success: true, message: 'Password reset successfully! Active sessions invalidated. Please log in.' };
  };

  // Standard Email & Password User Login
  const loginUser = (identifier: string, password: string) => {
    if (!checkRateLimit(`login_${identifier}`, 5).allowed) {
      return { success: false, message: 'Too many failed attempts. Rate limit enforced.' };
    }

    const inputHash = hashPassword(password);
    const matched = users.find((u) => u.authIdentifier === identifier && u.passwordHash === inputHash);

    if (!matched) {
      addSecurityLog('LOGIN_FAILED', identifier, 'Invalid login credentials');
      return { success: false, message: 'Invalid email address or password.' };
    }

    if (matched.status === 'disabled') {
      addSecurityLog('LOGIN_FAILED', identifier, 'Disabled account login attempt rejected');
      return { success: false, message: 'Your account has been suspended or disabled by an Administrator.' };
    }

    if (matched.role === 'admin') {
      addSecurityLog('UNAUTHORIZED_ADMIN_ATTEMPT', identifier, 'Admin attempt rejected on public login page');
      return { success: false, message: 'Administrator accounts must log in via the Google OAuth Admin Portal.' };
    }

    setCurrentUser(matched);
    addSecurityLog('LOGIN_SUCCESS', identifier, `User logged in as ${matched.role}`);
    return { success: true, message: 'Signed in successfully!', user: matched };
  };

  // Dedicated Google OAuth Admin Authentication Flow
  const loginAdminWithGoogleOAuth = (googleEmail: string, googleName: string, googleSub: string) => {
    const normalizedEmail = googleEmail.toLowerCase().trim();
    const isAuthorized =
      AUTHORIZED_ADMIN_GMAILS.includes(normalizedEmail) ||
      normalizedEmail.endsWith('@tripmandi.com');

    if (!isAuthorized) {
      addSecurityLog('ADMIN_GOOGLE_OAUTH_REJECTED', normalizedEmail, `Access Denied for unauthorized Gmail: ${normalizedEmail}`);
      return {
        success: false,
        message: `Access Denied: The Gmail address (${normalizedEmail}) is not an authorized Super Admin account.`,
      };
    }

    // Check if existing admin user exists or create verified admin user
    let adminUser = users.find((u) => u.email.toLowerCase() === normalizedEmail && u.role === 'admin');
    if (!adminUser) {
      adminUser = {
        id: `usr_admin_${Date.now()}`,
        name: googleName || 'Authorized Super Admin',
        email: normalizedEmail,
        phone: '+91 99999 00000',
        authIdentifier: normalizedEmail,
        authMethod: 'email',
        role: 'admin',
        isVerified: true,
        status: 'active',
        googleOAuthSub: googleSub,
        registeredAt: new Date().toISOString(),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      };
      setUsers((prev) => [...prev, adminUser!]);
    } else {
      adminUser = { ...adminUser, isVerified: true, status: 'active', googleOAuthSub: googleSub };
      setUsers((prev) => prev.map((u) => (u.id === adminUser!.id ? adminUser! : u)));
    }

    setCurrentUser(adminUser);
    addSecurityLog('ADMIN_GOOGLE_OAUTH_SUCCESS', normalizedEmail, `Super Admin authenticated via Google OAuth (${normalizedEmail})`);
    return { success: true, message: 'Super Admin authenticated via Google OAuth!', user: adminUser };
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

    return { success: false, message: 'Admin user record not found.' };
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  // Vendor KYC Operations
  const submitKYC = (kycData: Omit<OperatorKYC, 'id' | 'status' | 'createdAt'>) => {
    const newKYC: OperatorKYC = {
      ...kycData,
      id: `kyc_${Date.now()}`,
      status: 'pending',
      pennyDropVerified: true,
      pennyDropRecipientName: kycData.ownerName,
      createdAt: new Date().toISOString(),
    };
    setOperatorKYC((prev) => [newKYC, ...prev]);
  };

  const updateKYCStatus = (kycId: string, status: 'approved' | 'rejected', reason?: string) => {
    setOperatorKYC((prev) =>
      prev.map((k) => (k.id === kycId ? { ...k, status, rejectionReason: reason } : k))
    );
  };

  // Trip Package Operations
  const createTrip = (tripData: Omit<Trip, 'id' | 'status' | 'bookedSeatNumbers'>) => {
    const newTrip: Trip = {
      ...tripData,
      id: `trip_${Date.now()}`,
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
        nextCheckpointName: newTrip.intermediateCities[0] || newTrip.destinationCity,
        etaNextCheckpoint: 'In 2 Hours',
        lastUpdatedIso: new Date().toISOString(),
      },
    }));
  };

  const toggleLiveTrip = (tripId: string) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId ? { ...t, status: t.status === 'live' ? 'upcoming' : 'live' } : t
      )
    );
  };

  const updateTripImages = (tripId: string, images: string[]) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, images } : t))
    );
  };

  const deleteTrip = (tripId: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
    addSecurityLog('TRIP_DELETED', currentUser?.email || 'admin', `Trip ${tripId} deleted by Admin`);
  };

  // Customer Booking Operations with Automated Nodal Payment Split
  const createBooking = (bookingData: Omit<Booking, 'id' | 'bookingDate' | 'qrCodeData'>): Booking => {
    const newBooking: Booking = {
      ...bookingData,
      id: `bk_${Date.now()}`,
      bookingDate: new Date().toISOString(),
      qrCodeData: `TICKET_${bookingData.tripId}_${Date.now()}`,
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Update Seat Inventory
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === bookingData.tripId) {
          return {
            ...t,
            availableSeats: Math.max(0, t.availableSeats - bookingData.selectedSeats.length),
            bookedSeatNumbers: [...t.bookedSeatNumbers, ...bookingData.selectedSeats],
          };
        }
        return t;
      })
    );

    // Calculate Automated Payment Split
    const targetTrip = trips.find((t) => t.id === bookingData.tripId);
    const operatorId = targetTrip ? targetTrip.operatorId : 'usr_operator_1';
    const operatorName = targetTrip ? targetTrip.operatorName : bookingData.operatorName;

    const commissionPct = getApplicableCommissionRate(operatorId, bookingData.tripId);
    const grossAmount = bookingData.totalAmount;
    const platformCommissionAmount = Math.round((grossAmount * commissionPct) / 100);
    const gstOnCommissionAmount = Math.round(platformCommissionAmount * 0.18);
    const tdsAmount = Math.round(grossAmount * 0.01);
    const agencyNetSettlementAmount = Math.max(0, grossAmount - platformCommissionAmount - gstOnCommissionAmount - tdsAmount);

    const newSplitLedger: PaymentSplitLedger = {
      id: `split_${Date.now()}`,
      bookingId: newBooking.id,
      tripId: bookingData.tripId,
      tripName: bookingData.tripName,
      operatorId,
      operatorName,
      customerId: bookingData.customerId,
      customerName: bookingData.customerName,
      grossAmount,
      platformCommissionPercentage: commissionPct,
      platformCommissionAmount,
      gstOnCommissionAmount,
      tdsAmount,
      agencyNetSettlementAmount,
      settlementStatus: 'pending',
      settlementSchedule: 'T+1',
      nodalEscrowTransactionId: `NODAL_ESCROW_${Math.floor(100000 + Math.random() * 900000)}`,
      pennyDropVerified: true,
      createdAt: new Date().toISOString(),
    };

    setPaymentSplits((prev) => [newSplitLedger, ...prev]);

    return newBooking;
  };

  // Communication & Reviews
  const addChatMessage = (tripId: string, senderIdOrText: string, senderName?: string, senderRole?: UserRole, text?: string) => {
    const isSingleMsg = !senderName;
    const msgText = isSingleMsg ? senderIdOrText : text!;
    const msgSenderId = isSingleMsg ? (currentUser ? currentUser.id : 'usr_customer_1') : senderIdOrText;
    const msgSenderName = isSingleMsg ? (currentUser ? currentUser.name : 'Rahul Sharma') : senderName!;
    const msgRole: UserRole = isSingleMsg ? (currentUser ? currentUser.role : 'customer') : senderRole!;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      tripId,
      senderId: msgSenderId,
      senderName: msgSenderName,
      senderRole: msgRole,
      text: msgText,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [newReview, ...prev]);
  };

  // Route Search & Matching Logic (Always displays newly created trips)
  const searchRoute = (dep: string, dest: string, category = 'All') => {
    let filtered = trips.filter((t) => {
      const depNorm = (dep || '').toLowerCase().trim();
      const destNorm = (dest || '').toLowerCase().trim();
      const matchDep = !depNorm || t.departureCity.toLowerCase().includes(depNorm) || t.intermediateCities.some(c => c.toLowerCase().includes(depNorm));
      const matchDest = !destNorm || t.destinationCity.toLowerCase().includes(destNorm) || t.intermediateCities.some((c) => c.toLowerCase().includes(destNorm));
      const matchCategory = category === 'All' || t.category === category;
      return matchDep && matchDest && matchCategory;
    });

    // Fallback: If 0 exact route matches found, show all available published trips
    if (filtered.length === 0) {
      filtered = category === 'All' ? trips : trips.filter((t) => t.category === category);
      if (filtered.length === 0) filtered = trips; // Show all trips as ultimate fallback
    }

    const liveCount = filtered.filter((t) => t.status === 'live').length;
    const upcomingCount = filtered.filter((t) => t.status === 'upcoming').length;

    return {
      departureCity: dep,
      destinationCity: dest,
      matchingTrips: filtered,
      liveCount,
      upcomingCount,
      nearIntermediateCount: Math.floor(filtered.length * 0.4),
      nearDestinationCount: Math.floor(filtered.length * 0.3),
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
    updateUserStatus,
    updateUserRole,
    createSupportTicket,
    addTicketMessage,
    updateTicketStatus,
    processTicketRefund,
    registerUser,
    verifyRegistrationOTP,
    requestPasswordReset,
    resetPasswordWithOTP,
    loginUser,
    loginAdminWithGoogleOAuth,
    requestAdminLoginMFA,
    verifyAdminMFA,
    logoutUser,
    submitKYC,
    updateKYCStatus,
    createTrip,
    toggleLiveTrip,
    updateTripImages,
    deleteTrip,
    createBooking,
    addChatMessage,
    addReview,
    searchRoute,
  };
}

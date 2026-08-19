'use client';

import React, { useState } from 'react';
import { useTripMandiStore } from '../lib/store';
import { Trip, Booking } from '../types';
import Navbar from '../components/common/Navbar';
import RouteSearch from '../components/customer/RouteSearch';
import OfferBanners from '../components/customer/OfferBanners';
import TripCard from '../components/customer/TripCard';
import TripDetailModal from '../components/customer/TripDetailModal';
import SeatPickerModal from '../components/customer/SeatPickerModal';
import CheckoutModal from '../components/customer/CheckoutModal';
import PassengerDashboard from '../components/customer/PassengerDashboard';
import OperatorDashboard from '../components/operator/OperatorDashboard';
import OperatorRegistration from '../components/operator/OperatorRegistration';
import TripCreationWizard from '../components/operator/TripCreationWizard';
import AdminDashboard from '../components/admin/AdminDashboard';
import GlobalFleetMap from '../components/map/GlobalFleetMap';
import AuthModal from '../components/auth/AuthModal';
import AdminLoginModal from '../components/auth/AdminLoginModal';
import ChatWidget from '../components/common/ChatWidget';
import ReviewModal from '../components/common/ReviewModal';
import PublicPostsFeed from '../components/customer/PublicPostsFeed';
import Footer from '../components/common/Footer';
import { useRouter } from 'next/navigation';
import { Radio, Star } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const {
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
    updateCommissionRule,
    registerUser,
    verifyRegistrationOTP,
    requestPasswordReset,
    resetPasswordWithOTP,
    loginUser,
    loginAdminWithGoogleOAuth,
    requestAdminLoginMFA,
    verifyAdminMFA,
    updateUserStatus,
    updateUserRole,
    logoutUser,
    submitKYC,
    updateKYCStatus,
    createTrip,
    toggleLiveTrip,
    createBooking,
    addChatMessage,
    addReview,
    searchRoute,
  } = useTripMandiStore();

  const [activeTab, setActiveTab] = useState<string>('explore');
  const [searchDep, setSearchDep] = useState('Delhi');
  const [searchDest, setSearchDest] = useState('Manali');
  const [searchCategory, setSearchCategory] = useState('All');
  const [displayedTripsFilter, setDisplayedTripsFilter] = useState<'ALL' | 'ROUTE'>('ALL');

  const searchResult = searchRoute(searchDep, searchDest, searchCategory);

  // Trips to display: ALL published trips (including Admin created trips) or route filtered
  const tripsToDisplay = displayedTripsFilter === 'ALL' ? trips : (searchResult.matchingTrips.length > 0 ? searchResult.matchingTrips : trips);

  // Auth Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);

  // Modals & Views
  const [detailTrip, setDetailTrip] = useState<Trip | null>(null);
  const [seatPickerTrip, setSeatPickerTrip] = useState<Trip | null>(null);
  const [checkoutTrip, setCheckoutTrip] = useState<Trip | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [pickupPoint, setPickupPoint] = useState('');
  const [dropPoint, setDropPoint] = useState('');

  const [isKYCOpen, setIsKYCOpen] = useState(false);
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);

  const [activeChatTripId, setActiveChatTripId] = useState<string | null>(null);
  const [reviewTrip, setReviewTrip] = useState<{ tripId: string; operatorId: string } | null>(null);

  const handleSearch = (dep: string, dest: string, category?: string) => {
    setSearchDep(dep);
    setSearchDest(dest);
    if (category) setSearchCategory(category);
    setDisplayedTripsFilter('ROUTE');
  };

  const handleProceedToCheckout = (trip: Trip, seats: number[], pickup: string, drop: string) => {
    setSeatPickerTrip(null);
    setCheckoutTrip(trip);
    setSelectedSeats(seats);
    setPickupPoint(pickup);
    setDropPoint(drop);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-red-600 selection:text-white flex flex-col justify-between">
      <div>
        {/* Navbar Header */}
        <Navbar
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenAdminAuthModal={() => setIsAdminAuthModalOpen(true)}
          onLogout={logoutUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Main Content Body */}
        <main className="pb-20 bg-white">
          {/* VIEW 1: ROUTE SEARCH & DISCOVER (Customer View) */}
          {activeTab === 'explore' && (
            <div className="space-y-12 bg-white">
              <RouteSearch onSearch={handleSearch} searchResult={searchResult} />

              {/* redBus Style Festival & Promo Banners */}
              <OfferBanners />

              <div className="max-w-7xl mx-auto px-4 space-y-6 pt-4 bg-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-slate-900">Available Group Trips</h2>
                      <span className="text-xs bg-red-600/10 text-red-600 border border-red-600/30 px-3 py-0.5 rounded-full font-mono font-bold">
                        {tripsToDisplay.length} Packages Found
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Showing verified group tour packages created by Admin & Partner Agencies across India
                    </p>
                  </div>

                  {/* Quick Filter Pill Buttons */}
                  <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs font-bold no-scrollbar">
                    <button
                      onClick={() => setDisplayedTripsFilter('ALL')}
                      className={`px-3.5 py-1.5 rounded-full transition cursor-pointer shrink-0 ${
                        displayedTripsFilter === 'ALL'
                          ? 'bg-red-600 text-white font-black shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      All Packages ({trips.length})
                    </button>
                    <button
                      onClick={() => handleSearch('Delhi', 'Manali')}
                      className={`px-3.5 py-1.5 rounded-full transition cursor-pointer shrink-0 ${
                        displayedTripsFilter === 'ROUTE' && searchDep === 'Delhi' && searchDest === 'Manali'
                          ? 'bg-red-600 text-white font-black shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Delhi &rarr; Manali
                    </button>
                    <button
                      onClick={() => handleSearch('Mumbai', 'Goa')}
                      className={`px-3.5 py-1.5 rounded-full transition cursor-pointer shrink-0 ${
                        displayedTripsFilter === 'ROUTE' && searchDep === 'Mumbai' && searchDest === 'Goa'
                          ? 'bg-red-600 text-white font-black shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Mumbai &rarr; Goa
                    </button>
                  </div>
                </div>

                {/* Trips Grid displaying rich TripCards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tripsToDisplay.map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      telemetry={telemetry[trip.id]}
                      onTrackLive={(t) => setActiveTab('passenger-dash')}
                      onViewDetails={(t) => setDetailTrip(t)}
                      onBookSeats={(t) => setSeatPickerTrip(t)}
                    />
                  ))}
                </div>

                {/* Customer Testimonials */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-xs text-red-600 font-bold uppercase tracking-wider mb-1">
                        <Star className="w-4 h-4 fill-red-600 text-red-600" /> Traveler Testimonials
                      </div>
                      <h3 className="text-xl font-black text-slate-900">Verified Customer Reviews</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">{rev.customerName}</span>
                          <div className="flex items-center gap-1 text-xs text-red-600">
                            {Array.from({ length: rev.operatorRating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">"{rev.comment}"</p>
                        <span className="text-[10px] text-slate-500 block font-mono">
                          Verified Booking • {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: PUBLIC POSTS & ANNOUNCEMENTS FEED */}
          {activeTab === 'posts' && <PublicPostsFeed />}

          {/* VIEW 3: NATIONAL FLEET RADAR */}
          {activeTab === 'live-radar' && (
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 bg-white">
              <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-red-600/10 text-red-600 border border-red-600/30 text-xs font-bold px-3 py-1 rounded-full uppercase mb-2">
                      <Radio className="w-3.5 h-3.5 animate-pulse" /> Live Telemetry
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">National Live Fleet Radar</h2>
                    <p className="text-xs text-slate-500">Real-time GPS coordinates of all group tour buses currently moving across India.</p>
                  </div>
                </div>

                <GlobalFleetMap
                  trips={trips}
                  telemetry={telemetry}
                  height="560px"
                  onSelectTrip={(t) => setDetailTrip(t)}
                />
              </div>
            </div>
          )}

          {/* VIEW 3: PASSENGER DASHBOARD */}
          {activeTab === 'passenger-dash' && (
            <PassengerDashboard
              bookings={bookings}
              trips={trips}
              telemetry={telemetry}
              onOpenChat={(tripId) => setActiveChatTripId(tripId)}
              onOpenReview={(tripId, operatorId) => setReviewTrip({ tripId, operatorId })}
            />
          )}

          {/* VIEW 4: OPERATOR DASHBOARD */}
          {activeTab === 'operator-dash' && (
            <OperatorDashboard
              currentUser={currentUser}
              trips={trips}
              telemetry={telemetry}
              bookings={bookings}
              operatorKYC={operatorKYC}
              paymentSplits={paymentSplits}
              onOpenCreateTrip={() => setIsCreateTripOpen(true)}
              onOpenKYC={() => setIsKYCOpen(true)}
              onToggleLiveTrip={toggleLiveTrip}
            />
          )}

          {/* VIEW 5: ADMIN DASHBOARD */}
          {activeTab === 'admin-dash' && (
            <AdminDashboard
              operatorKYC={operatorKYC}
              trips={trips}
              telemetry={telemetry}
              bookings={bookings}
              users={users}
              securityLogs={securityLogs}
              commissionRules={commissionRules}
              paymentSplits={paymentSplits}
              supportTickets={supportTickets}
              onUpdateCommissionRule={updateCommissionRule}
              onUpdateKYCStatus={updateKYCStatus}
              onUpdateUserStatus={updateUserStatus}
              onUpdateUserRole={updateUserRole}
              onSelectTripToTrack={(t) => setDetailTrip(t)}
            />
          )}
        </main>
      </div>

      {/* Footer & 24/7 Social Support Channels */}
      <Footer />

      {/* AUTHENTICATION MODALS */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={loginUser}
        onRegister={registerUser}
        onVerifyOTP={verifyRegistrationOTP}
        onRequestReset={requestPasswordReset}
        onResetPassword={resetPasswordWithOTP}
      />

      <AdminLoginModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onRequestMFA={requestAdminLoginMFA}
        onVerifyMFA={verifyAdminMFA}
        onGoogleAdminLogin={(gmail, name) => loginAdminWithGoogleOAuth(gmail, name, `sub_${Date.now()}`)}
      />

      {/* OPERATIONAL MODALS */}
      <TripDetailModal
        trip={detailTrip}
        onClose={() => setDetailTrip(null)}
        onBookSeats={(t) => setSeatPickerTrip(t)}
      />

      <SeatPickerModal
        trip={seatPickerTrip}
        onClose={() => setSeatPickerTrip(null)}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        trip={checkoutTrip}
        selectedSeats={selectedSeats}
        pickupPoint={pickupPoint}
        dropPoint={dropPoint}
        onClose={() => setCheckoutTrip(null)}
        onConfirmBooking={createBooking}
        onViewBookingInDashboard={() => setActiveTab('passenger-dash')}
      />

      {isKYCOpen && (
        <OperatorRegistration
          operatorId={currentUser ? currentUser.id : 'usr_operator_1'}
          onClose={() => setIsKYCOpen(false)}
          onSubmitKYC={submitKYC}
        />
      )}

      {isCreateTripOpen && (
        <TripCreationWizard
          onClose={() => setIsCreateTripOpen(false)}
          onCreateTrip={createTrip}
        />
      )}

      <ChatWidget
        tripId={activeChatTripId}
        currentUser={currentUser}
        messages={chatMessages}
        onClose={() => setActiveChatTripId(null)}
        onSendMessage={addChatMessage}
      />

      {reviewTrip && (
        <ReviewModal
          tripId={reviewTrip.tripId}
          operatorId={reviewTrip.operatorId}
          customerId={currentUser ? currentUser.id : 'usr_customer_1'}
          customerName={currentUser ? currentUser.name : 'Rahul Sharma'}
          onClose={() => setReviewTrip(null)}
          onSubmitReview={addReview}
        />
      )}
    </div>
  );
}

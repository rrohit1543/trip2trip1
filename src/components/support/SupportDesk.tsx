'use client';

import React, { useState } from 'react';
import { SupportTicket, User } from '../../types';
import { MessageSquare, LifeBuoy, AlertCircle, ShieldAlert, CheckCircle2, Clock, Send, ArrowRight, RefreshCw, DollarSign } from 'lucide-react';

interface SupportDeskProps {
  currentUser: User | null;
  tickets: SupportTicket[];
  onCreateTicket: (data: any) => SupportTicket;
  onAddTicketMessage: (ticketId: string, message: string) => void;
  onUpdateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;
  onProcessRefund: (ticketId: string, refundAmount: number) => void;
}

export default function SupportDesk({
  currentUser,
  tickets,
  onCreateTicket,
  onAddTicketMessage,
  onUpdateTicketStatus,
  onProcessRefund,
}: SupportDeskProps) {
  const [activeTab, setActiveTab] = useState<'view_tickets' | 'create_ticket'>('view_tickets');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(tickets[0]?.id || null);

  // New ticket form state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('booking_inquiry');
  const [priority, setPriority] = useState<SupportTicket['priority']>('medium');
  const [bookingId, setBookingId] = useState('bk_998101');
  const [customerName, setCustomerName] = useState(currentUser?.name || 'Rahul Sharma');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || 'rahul.sharma@example.com');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '+91 98765 43210');

  // Agent message state
  const [replyText, setReplyText] = useState('');
  const [refundInput, setRefundInput] = useState('16798');

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTkt = onCreateTicket({
      bookingId,
      tripName: 'Manali & Solang Valley Volvo Group Expedition',
      customerId: currentUser ? currentUser.id : 'usr_customer_1',
      customerName,
      customerPhone,
      customerEmail,
      category,
      priority,
      subject,
      assignedAgentName: 'Priya Mehta (Customer Support)',
    });
    setSelectedTicketId(newTkt.id);
    setActiveTab('view_tickets');
    setSubject('');
    alert(`Support Ticket #${newTkt.id} Created Successfully! Support agent assigned.`);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    onAddTicketMessage(selectedTicket.id, replyText);
    setReplyText('');
  };

  const handleProcessRefundClick = () => {
    if (!selectedTicket) return;
    const amount = Number(refundInput);
    if (!amount || amount <= 0) return;
    onProcessRefund(selectedTicket.id, amount);
    alert(`Automated Refund of ₹${amount} executed for Ticket #${selectedTicket.id}. Gateway reversal ledger updated.`);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-900 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 bg-red-600/20 text-red-600 dark:text-red-500 border border-red-600/40 text-xs font-bold px-3 py-1 rounded-full uppercase mb-2">
            <LifeBuoy className="w-3.5 h-3.5" /> Customer Support & Escalation Desk
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white">Multi-Channel Help & Refund Center</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Linked directly to Booking IDs for resolution, ticket messaging & automated cancellation refund processing.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-neutral-200 dark:bg-neutral-950 p-1.5 rounded-2xl border border-neutral-300 dark:border-neutral-900">
          <button
            onClick={() => setActiveTab('view_tickets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'view_tickets'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Support Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('create_ticket')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'create_ticket'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            + Create New Ticket
          </button>
        </div>
      </div>

      {activeTab === 'create_ticket' && (
        <div className="max-w-2xl mx-auto bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-900 p-6 rounded-3xl space-y-6 shadow-xl">
          <div className="border-b border-neutral-200 dark:border-neutral-900 pb-4">
            <h3 className="text-lg font-black text-neutral-900 dark:text-white">Raise a Support Ticket</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Specify issue category and booking ID for instant response</p>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-500 uppercase mb-1">Booking ID (Optional)</label>
                <input
                  type="text"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-500 uppercase mb-1">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none"
                >
                  <option value="booking_inquiry">Booking Inquiry</option>
                  <option value="cancellation_refund">Cancellation & Refund Request</option>
                  <option value="live_trip_issue">Live Trip GPS / Boarding Issue</option>
                  <option value="payment_dispute">Payment Dispute</option>
                  <option value="general">General Help</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-500 uppercase mb-1">Subject / Problem Description</label>
              <input
                type="text"
                required
                placeholder="e.g. Request for seat change / Volvo luggage query"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-neutral-500 uppercase mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-500 uppercase mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-500 uppercase mb-1">Phone</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 transition"
            >
              Submit Ticket to Support Desk &rarr;
            </button>
          </form>
        </div>
      )}

      {activeTab === 'view_tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left List */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-red-500" /> Active Support Tickets ({tickets.length})
            </h3>

            <div className="space-y-3">
              {tickets.map((tkt) => {
                const isSelected = tkt.id === selectedTicket?.id;
                return (
                  <div
                    key={tkt.id}
                    onClick={() => setSelectedTicketId(tkt.id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-neutral-200 dark:bg-neutral-950 border-red-600 shadow-xl ring-1 ring-red-600/30'
                        : 'bg-neutral-100 dark:bg-black border-neutral-200 dark:border-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-red-600 dark:text-red-500 font-mono font-bold uppercase bg-red-600/10 px-2 py-0.5 rounded border border-red-600/30">
                        #{tkt.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        tkt.status === 'resolved'
                          ? 'bg-red-600/20 text-red-600 dark:text-red-400 border border-red-600/40'
                          : 'bg-neutral-300 dark:bg-neutral-900 text-neutral-800 dark:text-white border border-neutral-400 dark:border-neutral-700'
                      }`}>
                        {tkt.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1">{tkt.subject}</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Customer: {tkt.customerName} ({tkt.customerPhone})</p>

                    <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-900 font-mono">
                      <span>Booking: <strong>{tkt.bookingId || 'N/A'}</strong></span>
                      <span>{new Date(tkt.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Ticket Thread & Action Desk */}
          {selectedTicket && (
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-900 p-6 rounded-3xl space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-900 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-red-500">Ticket #{selectedTicket.id}</span>
                      <span className="text-[10px] uppercase font-bold text-neutral-500 bg-neutral-200 dark:bg-neutral-900 px-2 py-0.5 rounded">
                        Category: {selectedTicket.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-neutral-900 dark:text-white">{selectedTicket.subject}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Assigned Agent: <strong className="text-neutral-900 dark:text-white">{selectedTicket.assignedAgentName || 'Priya Mehta'}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => onUpdateTicketStatus(selectedTicket.id, e.target.value as any)}
                      className="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-xs font-bold text-neutral-900 dark:text-white px-3 py-1.5 rounded-xl focus:outline-none"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="escalated">Escalated</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                {/* Messages Thread */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {selectedTicket.messages.map((msg) => {
                    const isStaff = msg.senderRole === 'support_agent' || msg.senderRole === 'admin';
                    return (
                      <div key={msg.id} className={`flex flex-col ${isStaff ? 'items-start' : 'items-end'}`}>
                        <div className="flex items-center gap-1.5 mb-1 text-[10px]">
                          <span className="font-bold text-neutral-900 dark:text-white">{msg.senderName}</span>
                          <span className="text-neutral-500">({msg.senderRole})</span>
                        </div>
                        <div
                          className={`max-w-[85%] p-3.5 rounded-2xl text-xs ${
                            isStaff
                              ? 'bg-red-600 text-white font-medium rounded-bl-none shadow-md shadow-red-600/20'
                              : 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 rounded-br-none'
                          }`}
                        >
                          {msg.message}
                        </div>
                        <span className="text-[9px] text-neutral-500 mt-1 font-mono">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="flex items-center gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-900">
                  <input
                    type="text"
                    placeholder="Type support response or update..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-red-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                </form>

                {/* Support Agent Refund Control Desk */}
                {(currentUser?.role === 'support_agent' || currentUser?.role === 'admin') && (
                  <div className="bg-neutral-200 dark:bg-neutral-950 border border-red-600/30 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-600 dark:text-red-500 uppercase flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" /> Agent Refund Authorization Console
                      </span>
                      {selectedTicket.refundStatus === 'processed' && (
                        <span className="bg-red-600/20 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          REFUND PROCESSED
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={refundInput}
                        onChange={(e) => setRefundInput(e.target.value)}
                        placeholder="Refund amount ₹"
                        className="w-1/2 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none"
                      />
                      <button
                        onClick={handleProcessRefundClick}
                        disabled={selectedTicket.refundStatus === 'processed'}
                        className={`w-1/2 py-2 rounded-xl text-xs font-black transition ${
                          selectedTicket.refundStatus === 'processed'
                            ? 'bg-neutral-300 dark:bg-neutral-900 text-neutral-500 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30'
                        }`}
                      >
                        {selectedTicket.refundStatus === 'processed' ? 'Refund Processed' : 'Execute Gateway Refund'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

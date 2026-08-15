'use client';

import React, { useState } from 'react';
import {
  Users,
  FileSpreadsheet,
  Printer,
  Edit3,
  CheckCircle2,
  Phone,
  Mail,
  Search,
  ShieldCheck,
} from 'lucide-react';

export interface ManifestPassenger {
  seatNumber: number;
  seatLabel: string;
  passengerName: string;
  gender: 'MALE' | 'FEMALE';
  age: number;
  phone: string;
  email: string;
  boardingPoint: string;
  dropPoint: string;
  ticketId: string;
  bookingStatus: 'CONFIRMED' | 'CHECKED_IN' | 'NO_SHOW';
}

const mockPassengers: ManifestPassenger[] = [
  { seatNumber: 1, seatLabel: 'L1', passengerName: 'Rahul Sharma', gender: 'MALE', age: 29, phone: '+91 9811223344', email: 'rahul@gmail.com', boardingPoint: 'Kashmere Gate ISBT', dropPoint: 'Manali Mall Road', ticketId: 'TM-2026-9901', bookingStatus: 'CHECKED_IN' },
  { seatNumber: 2, seatLabel: 'L2', passengerName: 'Priya Verma', gender: 'FEMALE', age: 26, phone: '+91 9822334455', email: 'priya@gmail.com', boardingPoint: 'Sector 62 Noida', dropPoint: 'Manali Mall Road', ticketId: 'TM-2026-9902', bookingStatus: 'CONFIRMED' },
  { seatNumber: 3, seatLabel: 'L3', passengerName: 'Amit Patel', gender: 'MALE', age: 34, phone: '+91 9833445566', email: 'amit@gmail.com', boardingPoint: 'Kashmere Gate ISBT', dropPoint: 'Chandigarh Hub', ticketId: 'TM-2026-9903', bookingStatus: 'CONFIRMED' },
  { seatNumber: 5, seatLabel: 'U1', passengerName: 'Neha Gupta', gender: 'FEMALE', age: 24, phone: '+91 9844556677', email: 'neha@gmail.com', boardingPoint: 'Sector 62 Noida', dropPoint: 'Manali Mall Road', ticketId: 'TM-2026-9904', bookingStatus: 'CONFIRMED' },
];

export default function PassengerManifestExport() {
  const [passengers, setPassengers] = useState<ManifestPassenger[]>(mockPassengers);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSeat, setEditingSeat] = useState<number | null>(null);
  const [newSeatInput, setNewSeatInput] = useState('');

  const filteredPassengers = passengers.filter(
    (p) =>
      p.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.ticketId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSeatReallocation = (oldSeat: number) => {
    const targetSeat = Number(newSeatInput);
    if (isNaN(targetSeat) || targetSeat <= 0) return;

    setPassengers((prev) =>
      prev.map((p) => (p.seatNumber === oldSeat ? { ...p, seatNumber: targetSeat, seatLabel: `Seat ${targetSeat}` } : p))
    );
    setEditingSeat(null);
    setNewSeatInput('');
  };

  const handlePrintManifest = () => {
    window.print();
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl text-slate-900 font-sans">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-red-600" /> Driver Passenger Manifest & Seat Override
          </h2>
          <p className="text-xs text-slate-500">View real-time manifests, reallocate seats, and export driver printable manifests.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintManifest}
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print PDF Manifest
          </button>

          <button
            onClick={() => alert('Manifest exported as CSV file!')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel CSV
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 max-w-md">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by passenger name, phone, or ticket ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
        />
      </div>

      {/* Manifest Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-2xl">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3">Seat</th>
              <th className="p-3">Ticket ID</th>
              <th className="p-3">Passenger Name</th>
              <th className="p-3">Gender / Age</th>
              <th className="p-3">Contact Phone</th>
              <th className="p-3">Boarding Point</th>
              <th className="p-3">Drop Point</th>
              <th className="p-3">Status</th>
              <th className="p-3">Seat Reallocate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {filteredPassengers.map((p) => (
              <tr key={p.ticketId} className="hover:bg-slate-50/80 transition">
                <td className="p-3 font-mono font-black text-red-600">
                  <span className="bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg">#{p.seatNumber} ({p.seatLabel})</span>
                </td>
                <td className="p-3 font-mono font-bold text-slate-900">{p.ticketId}</td>
                <td className="p-3 font-bold text-slate-900">{p.passengerName}</td>
                <td className="p-3 font-medium text-slate-600">{p.gender}, {p.age} yrs</td>
                <td className="p-3 font-mono text-slate-700">{p.phone}</td>
                <td className="p-3 text-slate-600">{p.boardingPoint}</td>
                <td className="p-3 text-slate-600">{p.dropPoint}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    p.bookingStatus === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {p.bookingStatus}
                  </span>
                </td>
                <td className="p-3">
                  {editingSeat === p.seatNumber ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="New #"
                        value={newSeatInput}
                        onChange={(e) => setNewSeatInput(e.target.value)}
                        className="w-14 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono font-bold"
                      />
                      <button
                        onClick={() => handleSeatReallocation(p.seatNumber)}
                        className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingSeat(p.seatNumber); setNewSeatInput(String(p.seatNumber)); }}
                      className="text-slate-600 hover:text-red-600 font-bold underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Reallocate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

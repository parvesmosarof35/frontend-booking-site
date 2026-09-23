'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  MessageSquare,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  RefreshCw,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';
import api from '@/lib/axios';
import { getSocket } from '@/lib/socket';
import toast from 'react-hot-toast';

export default function BookingsManagerPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let query = '';
      if (selectedDate) query += `date=${selectedDate}&`;
      if (statusFilter !== 'All') query += `status=${statusFilter}`;
      const { data } = await api.get(`/bookings?${query}`);
      setBookings(data || []);
    } catch {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    const socket = getSocket();
    socket.on('booking_created', (newBooking: any) => {
      setBookings((prev) => [newBooking, ...prev]);
      toast.success(`New reservation received from ${newBooking.customerName}!`);
    });

    socket.on('booking_status_changed', (updated: any) => {
      setBookings((prev) =>
        prev.map((b) => (b._id === updated._id ? updated : b)),
      );
    });

    return () => {
      socket.off('booking_created');
      socket.off('booking_status_changed');
    };
  }, [selectedDate, statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status: newStatus });
      toast.success(`Booking status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update booking status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-amber-600" />
            <span>Table Reservations Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500">
            Real-time live guest booking board with instant seating transitions and WhatsApp contact triggers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500 shadow-xs"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Clear Date
            </button>
          )}
          <button
            onClick={fetchBookings}
            className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 shadow-xs"
            title="Refresh Bookings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {['All', 'confirmed', 'held', 'seated', 'completed', 'cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition whitespace-nowrap ${
              statusFilter === st
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* MOBILE RESPONSIVE CARDS (Visible on mobile screens) */}
      <div className="block sm:hidden space-y-4">
        {bookings.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-3xl shadow-xs">
            No reservations found.
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <span className="font-mono font-bold text-amber-700 text-xs block">
                    {booking.bookingReference || 'HOLD-TEMP'}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {booking.date}
                  </span>
                </div>
                <span className="flex items-center gap-1 font-semibold text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  {booking.guestCount}p
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{booking.customerName}</p>
                  <p className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-amber-600" /> {booking.whatsapp}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-amber-800 text-xs block">
                    {booking.tableId?.tableNumber || 'Auto-Allocated'} ({booking.tableId?.zone || 'Indoor'})
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center justify-end gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" /> {booking.slotId?.startTime} - {booking.slotId?.endTime}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <select
                  value={booking.status}
                  onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none capitalize ${
                    booking.status === 'confirmed'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : booking.status === 'seated'
                      ? 'bg-blue-50 border-blue-300 text-blue-800'
                      : booking.status === 'completed'
                      ? 'bg-purple-50 border-purple-300 text-purple-800'
                      : booking.status === 'held'
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}
                >
                  <option value="held">Held (5min)</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="seated">Seated</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {booking.whatsapp && (
                  <a
                    href={`https://wa.me/${booking.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${booking.customerName},%20regarding%20your%20table%20reservation%20at%20The%20Royal%20Grand%20Bistro...`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-300 transition shrink-0"
                    title="WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP RESERVATIONS TABLE (Hidden on mobile) */}
      <div className="hidden sm:block bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider border-b border-slate-200 font-bold">
              <tr>
                <th className="py-4 px-6">Reference / Date</th>
                <th className="py-4 px-6">Guest Info</th>
                <th className="py-4 px-6">Table / Slot</th>
                <th className="py-4 px-6">Party Size</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No reservations found for the selected criteria.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 space-y-1">
                      <span className="font-mono font-bold text-slate-900 text-xs block">
                        {booking.bookingReference || 'HOLD-TEMP'}
                      </span>
                      <span className="text-[11px] text-slate-500">{booking.date}</span>
                    </td>
                    <td className="py-4 px-6 space-y-0.5">
                      <div className="font-bold text-slate-900 text-xs">{booking.customerName}</div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Phone className="w-3 h-3 text-amber-600" />
                        <span>{booking.whatsapp}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 space-y-0.5">
                      <div className="font-semibold text-amber-800">
                        {booking.tableId?.tableNumber || 'Auto-Allocated'} ({booking.tableId?.zone || 'Zone'})
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {booking.slotId?.startTime} - {booking.slotId?.endTime}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Users className="w-3.5 h-3.5 text-amber-600" />
                        {booking.guestCount} Guests
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none capitalize ${
                          booking.status === 'confirmed'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : booking.status === 'seated'
                            ? 'bg-blue-50 border-blue-300 text-blue-800'
                            : booking.status === 'completed'
                            ? 'bg-purple-50 border-purple-300 text-purple-800'
                            : booking.status === 'held'
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : 'bg-rose-50 border-rose-300 text-rose-800'
                        }`}
                      >
                        <option value="held">Held (5min)</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="seated">Seated</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {booking.whatsapp && (
                        <a
                          href={`https://wa.me/${booking.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${booking.customerName},%20regarding%20your%20table%20reservation%20at%20The%20Royal%20Grand%20Bistro...`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-300 transition text-xs font-semibold"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

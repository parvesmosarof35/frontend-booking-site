'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CalendarCheck,
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import api from '@/lib/axios';
import { trackEvent } from '@/lib/analytics';
import toast from 'react-hot-toast';

function BookingWizard() {
  const searchParams = useSearchParams();

  // Booking Flow Steps: 1 -> Date & Shift, 2 -> Slot & Party Size, 3 -> Review & Hold, 4 -> Confirmed
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Data states
  const [shifts, setShifts] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form parameters
  const [selectedDate, setSelectedDate] = useState<string>(
    searchParams.get('date') || new Date().toISOString().split('T')[0],
  );
  const [selectedShift, setSelectedShift] = useState<string>(
    searchParams.get('shiftId') || '',
  );
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [guestCount, setGuestCount] = useState<number>(
    parseInt(searchParams.get('guests') || '2', 10),
  );
  const [preferredZone, setPreferredZone] = useState<string>('Indoor');

  // Hold session state
  const [heldBooking, setHeldBooking] = useState<any>(null);
  const [holdTimeLeft, setHoldTimeLeft] = useState<number>(300); // 5 minutes in seconds
  const [holdingLoading, setHoldingLoading] = useState(false);

  // Final confirmation details
  const [customerName, setCustomerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [confirmingLoading, setConfirmingLoading] = useState(false);

  useEffect(() => {
    trackEvent('view', 'page', 'booking_page');

    api.get('/shifts').then((res) => {
      setShifts(res.data || []);
      if (!selectedShift && res.data?.length > 0) {
        setSelectedShift(res.data[0]._id);
      }
    }).catch(() => {});
  }, []);

  // Fetch available slots whenever date or guest count changes
  useEffect(() => {
    if (selectedDate && guestCount) {
      setLoadingSlots(true);
      api
        .get(`/bookings/available-slots?date=${selectedDate}&guestCount=${guestCount}&zone=${preferredZone}`)
        .then((res) => {
          setAvailableSlots(res.data || []);
          if (res.data?.length > 0 && !selectedSlot) {
            setSelectedSlot(res.data[0]);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedDate, guestCount, preferredZone]);

  // Hold Countdown Timer
  useEffect(() => {
    let timer: any = null;
    if (step === 3 && holdTimeLeft > 0) {
      timer = setInterval(() => {
        setHoldTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            toast.error('Hold session expired. Please choose a slot again.');
            setStep(2);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, holdTimeLeft]);

  // Handle Hold Table Action
  const handleHoldTable = async () => {
    if (!selectedSlot) {
      toast.error('Please choose an available dining slot');
      return;
    }

    setHoldingLoading(true);
    try {
      trackEvent('click', 'cta', 'hold_table_request', {
        date: selectedDate,
        slotId: selectedSlot.slotId,
        guestCount,
      });

      const { data } = await api.post('/bookings/hold', {
        date: selectedDate,
        slotId: selectedSlot.slotId,
        guestCount,
        preferredZone,
        customerName: customerName || 'Guest',
        whatsapp: whatsapp || '',
      });

      setHeldBooking(data);
      setHoldTimeLeft(300); // 5 minutes
      setStep(3);
      toast.success('Table temporarily held for 5 minutes!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Selected slot or table is unavailable');
    } finally {
      setHoldingLoading(false);
    }
  };

  // Handle Final Confirm Action
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !whatsapp) {
      toast.error('Please enter your Name and WhatsApp phone number');
      return;
    }

    setConfirmingLoading(true);
    try {
      const { data } = await api.post('/bookings/confirm', {
        bookingId: heldBooking.bookingId,
        customerName,
        whatsapp,
        email,
        specialRequests,
      });

      setConfirmedBooking(data.booking);
      setStep(4);
      trackEvent('click', 'cta', 'booking_confirmed_success', {
        bookingReference: data.booking.bookingReference,
      });
      toast.success('Table reservation confirmed successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to confirm reservation');
    } finally {
      setConfirmingLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-Time Seating Allocation</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Reserve Your Table
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Choose your dining schedule and let our smart layout engine allocate the ideal table configuration for your party size.
        </p>
      </div>

      {/* Wizard Progress Steps */}
      <div className="grid grid-cols-4 gap-2 border-b border-slate-800 pb-4 text-xs font-semibold">
        <div
          className={`flex items-center gap-2 ${
            step >= 1 ? 'text-amber-400' : 'text-slate-600'
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-slate-900 border border-current flex items-center justify-center text-xs">
            1
          </span>
          <span className="hidden sm:inline">Date & Shift</span>
        </div>
        <div
          className={`flex items-center gap-2 ${
            step >= 2 ? 'text-amber-400' : 'text-slate-600'
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-slate-900 border border-current flex items-center justify-center text-xs">
            2
          </span>
          <span className="hidden sm:inline">Slot & Party</span>
        </div>
        <div
          className={`flex items-center gap-2 ${
            step >= 3 ? 'text-amber-400' : 'text-slate-600'
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-slate-900 border border-current flex items-center justify-center text-xs">
            3
          </span>
          <span className="hidden sm:inline">Guest Details</span>
        </div>
        <div
          className={`flex items-center gap-2 ${
            step === 4 ? 'text-emerald-400' : 'text-slate-600'
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-slate-900 border border-current flex items-center justify-center text-xs">
            4
          </span>
          <span className="hidden sm:inline">Confirmed</span>
        </div>
      </div>

      {/* STEP 1: DATE & SHIFT SELECTION */}
      {step === 1 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 backdrop-blur-xl shadow-2xl">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>1. Choose Reservation Date</span>
            </h2>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-base text-white focus:outline-none focus:border-amber-400 font-medium"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>2. Select Dining Shift</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {shifts.map((shift) => (
                <button
                  key={shift._id}
                  type="button"
                  onClick={() => setSelectedShift(shift._id)}
                  className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                    selectedShift === shift._id
                      ? 'bg-amber-500/10 border-amber-400 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-base">{shift.name}</span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-amber-400 font-mono">
                      {shift.startTime} - {shift.endTime}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Max capacity: {shift.maxCapacity} guests
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg flex items-center gap-2"
            >
              <span>Next: Select Slot & Party Size</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SLOT, GUESTS & ZONE PREFERENCE */}
      {step === 2 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 backdrop-blur-xl shadow-2xl">
          {/* Guest Count */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>Party Size (Number of Guests)</span>
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setGuestCount(num)}
                  className={`py-3 rounded-xl font-bold text-sm border transition ${
                    guestCount === num
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {num} {num === 1 ? 'Solo' : 'P'}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Zone */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              <span>Preferred Dining Zone</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['Indoor', 'Outdoor', 'Rooftop', 'VIP'].map((zone) => (
                <button
                  key={zone}
                  type="button"
                  onClick={() => setPreferredZone(zone)}
                  className={`py-3 px-4 rounded-xl font-semibold text-xs border text-center transition ${
                    preferredZone === zone
                      ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Available Time Slots ({selectedDate})</span>
            </h2>

            {loadingSlots ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Checking live floor layout availability...
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="p-6 bg-rose-950/30 border border-rose-800/40 rounded-2xl text-rose-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>No available tables for {guestCount} guests on this date. Please try another date or party size.</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.slotId}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                      !slot.available
                        ? 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-40 cursor-not-allowed'
                        : selectedSlot?.slotId === slot.slotId
                        ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/20'
                        : 'bg-slate-950 text-slate-200 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-mono text-sm font-semibold">{slot.startTime} - {slot.endTime}</span>
                    <span className="text-[10px] opacity-80">
                      {slot.available ? `${slot.availableTablesCount} table(s) open` : 'Fully Booked'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              disabled={!selectedSlot?.available || holdingLoading}
              onClick={handleHoldTable}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              <span>{holdingLoading ? 'Allocating Table...' : 'Hold Table (5 Mins)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: 5-MIN HOLD & GUEST DETAILS */}
      {step === 3 && heldBooking && (
        <form onSubmit={handleConfirmBooking} className="bg-slate-900/80 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-8 backdrop-blur-xl shadow-2xl">
          {/* Temporary Hold Alert Banner */}
          <div className="p-4 bg-amber-950/50 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
              <div>
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Table Temporarily Locked for You
                </p>
                <p className="text-xs text-slate-300">
                  Assigned <strong className="text-amber-400">{heldBooking.table?.tableNumber}</strong> ({heldBooking.table?.capacity} Seats, {heldBooking.table?.zone})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-amber-500/30">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-base font-bold text-amber-400">
                {formatTimer(holdTimeLeft)}
              </span>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>Your Contact & Reservation Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parves Mosarof"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +8801712345678"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address (For Confirmation Copy)</label>
                <input
                  type="email"
                  placeholder="e.g. guest@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Special Occasion / Dietary Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Anniversary, high chair needed"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Change Slot
            </button>
            <button
              type="submit"
              disabled={confirmingLoading}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              <span>{confirmingLoading ? 'Confirming...' : 'Confirm Table Reservation'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: CONFIRMED TICKET */}
      {step === 4 && confirmedBooking && (
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="w-20 h-20 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Reservation Confirmed
            </span>
            <h2 className="font-serif text-3xl font-bold text-white">
              We look forward to welcoming you!
            </h2>
            <p className="text-xs text-slate-400">
              Booking Reference: <strong className="text-amber-400 font-mono text-base">{confirmedBooking.bookingReference}</strong>
            </p>
          </div>

          {/* Ticket Card */}
          <div className="max-w-md mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-6 text-left space-y-3 text-xs text-slate-300">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>Guest Name:</span>
              <strong className="text-white">{confirmedBooking.customerName}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>WhatsApp:</span>
              <strong className="text-white">{confirmedBooking.whatsapp}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>Date:</span>
              <strong className="text-white">{confirmedBooking.date}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>Time Slot:</span>
              <strong className="text-amber-400">
                {confirmedBooking.slotId?.startTime} - {confirmedBooking.slotId?.endTime}
              </strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>Table Assigned:</span>
              <strong className="text-amber-400">{confirmedBooking.tableId?.tableNumber} ({confirmedBooking.tableId?.zone})</strong>
            </div>
            <div className="flex justify-between">
              <span>Party Size:</span>
              <strong className="text-white">{confirmedBooking.guestCount} Guests</strong>
            </div>
          </div>

          {/* Quick WhatsApp Action */}
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 pt-4">
            <a
              href={`https://wa.me/8801712345678?text=Hello%20The%20Royal%20Grand%20Bistro,%20I%20have%20confirmed%20reservation%20${confirmedBooking.bookingReference}%20for%20${confirmedBooking.date}%20at%20${confirmedBooking.slotId?.startTime}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow"
            >
              <MessageSquare className="w-4 h-4" /> Message Restaurant on WhatsApp
            </a>
            <button
              onClick={() => {
                setStep(1);
                setConfirmedBooking(null);
              }}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition"
            >
              Book Another Table
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading reservation portal...</div>}>
      <BookingWizard />
    </Suspense>
  );
}

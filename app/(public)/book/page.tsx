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
  Layers,
  Sparkle,
  Compass,
} from 'lucide-react';
import api from '@/lib/axios';
import { trackEvent } from '@/lib/analytics';
import toast from 'react-hot-toast';
import VisualFloorPicker, { VisualTable } from '@/components/booking/VisualFloorPicker';
import ReservationPass from '@/components/booking/ReservationPass';

function BookingWizard() {
  const searchParams = useSearchParams();

  // Booking Flow Steps: 1 -> Date & Shift, 2 -> Slot & Table, 3 -> Review & Hold, 4 -> Confirmed
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
  const [selectionMode, setSelectionMode] = useState<'auto' | 'map'>('map');
  const [selectedTable, setSelectedTable] = useState<VisualTable | null>(null);

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

    api
      .get('/shifts')
      .then((res) => {
        setShifts(res.data || []);
        if (!selectedShift && res.data?.length > 0) {
          setSelectedShift(res.data[0]._id);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch available slots whenever date or guest count changes
  useEffect(() => {
    if (selectedDate && guestCount) {
      setLoadingSlots(true);
      api
        .get(
          `/bookings/available-slots?date=${selectedDate}&guestCount=${guestCount}&zone=${preferredZone}`,
        )
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
        tableId: selectedTable?._id,
      });

      const { data } = await api.post('/bookings/hold', {
        date: selectedDate,
        slotId: selectedSlot.slotId,
        guestCount,
        preferredZone: selectedTable?.zone || preferredZone,
        tableId: selectedTable?._id || undefined,
        customerName: customerName || 'Guest',
        whatsapp: whatsapp || '',
      });

      setHeldBooking(data);
      setHoldTimeLeft(300); // 5 minutes
      setStep(3);
      toast.success(
        selectedTable
          ? `Table ${selectedTable.tableNumber} held for you!`
          : 'Table temporarily held for 5 minutes!',
      );
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 print:py-0 print:px-0 print:max-w-none print:space-y-0">
      {/* Page Header */}
      <div className="text-center space-y-3 print:hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Interactive 2D Floor Seating</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Reserve Your Table
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Select your schedule and choose your favorite seating location in real-time.
        </p>
      </div>

      {/* Wizard Progress Steps (Light Mode) */}
      <div className="grid grid-cols-4 gap-2 border-b border-slate-200 pb-4 text-xs font-bold print:hidden">
        <div
          className={`flex items-center gap-2 ${
            step >= 1 ? 'text-amber-700' : 'text-slate-400'
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-white border-2 border-current flex items-center justify-center text-xs shadow-xs">
            1
          </span>
          <span className="hidden sm:inline">Date & Shift</span>
        </div>
        <div
          className={`flex items-center gap-2 ${
            step >= 2 ? 'text-amber-700' : 'text-slate-400'
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-white border-2 border-current flex items-center justify-center text-xs shadow-xs">
            2
          </span>
          <span className="hidden sm:inline">Slot & Table</span>
        </div>
        <div
          className={`flex items-center gap-2 ${
            step >= 3 ? 'text-amber-700' : 'text-slate-400'
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-white border-2 border-current flex items-center justify-center text-xs shadow-xs">
            3
          </span>
          <span className="hidden sm:inline">Guest Details</span>
        </div>
        <div
          className={`flex items-center gap-2 ${
            step === 4 ? 'text-emerald-700' : 'text-slate-400'
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-white border-2 border-current flex items-center justify-center text-xs shadow-xs">
            4
          </span>
          <span className="hidden sm:inline">VIP Pass</span>
        </div>
      </div>

      {/* STEP 1: DATE & SHIFT SELECTION */}
      {step === 1 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm">
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              <span>1. Choose Reservation Date</span>
            </h2>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 text-base text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
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
                      ? 'bg-amber-50/80 border-amber-500 shadow-sm ring-2 ring-amber-400/20'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-base">{shift.name}</span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-white text-amber-800 font-mono font-bold border border-slate-200">
                      {shift.startTime} - {shift.endTime}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
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
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm rounded-xl transition shadow-md flex items-center gap-2"
            >
              <span>Next: Select Slot & Floor Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SLOT, GUESTS & INTERACTIVE FLOOR SEAT PICKER */}
      {step === 2 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm">
          {/* Guest Count */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              <span>Party Size (Number of Guests)</span>
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setGuestCount(num);
                    setSelectedTable(null);
                  }}
                  className={`py-3 rounded-xl font-bold text-sm border transition ${
                    guestCount === num
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {num} {num === 1 ? 'Solo' : 'P'}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>Available Time Slots ({selectedDate})</span>
            </h2>

            {loadingSlots ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Checking live floor layout availability...
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                <span>
                  No available tables for {guestCount} guests on this date. Please try another date or party size.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.slotId}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => {
                      setSelectedSlot(slot);
                      setSelectedTable(null);
                    }}
                    className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                      !slot.available
                        ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                        : selectedSlot?.slotId === slot.slotId
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="font-mono text-sm font-bold">
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <span className="text-[10px] opacity-80">
                      {slot.available ? `${slot.availableTablesCount} open table(s)` : 'Fully Booked'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Table Selection Strategy Switcher */}
          {selectedSlot && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-amber-600" />
                    <span>Seating Preference</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Choose between interactive 2D floor seat selection or automated smart allocation.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSelectionMode('map')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      selectionMode === 'map'
                        ? 'bg-white text-slate-950 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-600" /> 2D Floor Map
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectionMode('auto');
                      setSelectedTable(null);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      selectionMode === 'auto'
                        ? 'bg-white text-slate-950 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    <Sparkle className="w-3.5 h-3.5 text-amber-600" /> Smart Auto-Assign
                  </button>
                </div>
              </div>

              {selectionMode === 'map' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-800 font-bold">
                      Click your favorite green table on the 2D layout below:
                    </span>
                    {selectedTable && (
                      <span className="text-xs px-3 py-1 bg-amber-500 text-slate-950 rounded-full font-bold shadow animate-bounce">
                        Selected: Table {selectedTable.tableNumber} ({selectedTable.capacity}p, {selectedTable.zone})
                      </span>
                    )}
                  </div>
                  <VisualFloorPicker
                    date={selectedDate}
                    slotId={selectedSlot.slotId}
                    guestCount={guestCount}
                    selectedTableId={selectedTable?._id || null}
                    onSelectTable={(tbl) => {
                      setSelectedTable(tbl);
                      toast.success(`Selected Table ${tbl.tableNumber} (${tbl.zone})`);
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <span className="text-xs font-semibold text-slate-700 block">
                    Select Preferred Dining Zone (Auto-assigned to optimal table):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Indoor', 'Outdoor', 'Rooftop', 'VIP'].map((zone) => (
                      <button
                        key={zone}
                        type="button"
                        onClick={() => setPreferredZone(zone)}
                        className={`py-3 px-4 rounded-xl font-bold text-xs border text-center transition ${
                          preferredZone === zone
                            ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-400/20'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {zone}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              disabled={!selectedSlot?.available || holdingLoading}
              onClick={handleHoldTable}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm rounded-xl transition shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              <span>{holdingLoading ? 'Holding Seating...' : 'Hold & Proceed (5 Mins)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: 5-MIN HOLD & GUEST DETAILS */}
      {step === 3 && heldBooking && (
        <form
          onSubmit={handleConfirmBooking}
          className="bg-white border border-amber-300 rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm"
        >
          {/* Temporary Hold Alert Banner */}
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
              <div>
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Table Temporarily Locked for You
                </p>
                <p className="text-xs text-slate-700">
                  Assigned <strong className="text-amber-800">{heldBooking.table?.tableNumber}</strong> (
                  {heldBooking.table?.capacity} Seats, {heldBooking.table?.zone})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-amber-300 shadow-xs">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="font-mono text-base font-bold text-amber-800">
                {formatTimer(holdTimeLeft)}
              </span>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              <span>Your Contact & Reservation Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parves Mosarof"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +8801712345678"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (For Instant Pass Copy)
                </label>
                <input
                  type="email"
                  placeholder="e.g. guest@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Special Occasion / Dietary Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Anniversary, high chair needed"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Change Slot / Table
            </button>
            <button
              type="submit"
              disabled={confirmingLoading}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm rounded-xl transition shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              <span>{confirmingLoading ? 'Confirming...' : 'Confirm Reservation Pass'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: CONFIRMED VIP RESERVATION PASS */}
      {step === 4 && confirmedBooking && (
        <div className="space-y-6">
          <ReservationPass booking={confirmedBooking} />

          {/* Quick WhatsApp Action & Rebook */}
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 pt-4 print:hidden">
            <a
              href={`https://wa.me/8801712345678?text=Hello%20The%20Royal%20Grand%20Bistro,%20I%20have%20confirmed%20reservation%20${confirmedBooking.bookingReference}%20for%20${confirmedBooking.date}%20at%20${confirmedBooking.slotId?.startTime}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow hover:scale-102"
            >
              <MessageSquare className="w-4 h-4" /> WhatsApp Hostess
            </a>
            <button
              onClick={() => {
                setStep(1);
                setConfirmedBooking(null);
                setSelectedTable(null);
              }}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
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
    <Suspense
      fallback={
        <div className="py-20 text-center text-slate-500">
          Loading reservation portal...
        </div>
      }
    >
      <BookingWizard />
    </Suspense>
  );
}

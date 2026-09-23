'use client';

import React, { useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  Utensils,
  CalendarCheck,
  MapPin,
  Clock,
  Users,
  Printer,
  CheckCircle2,
  Phone,
  Info,
} from 'lucide-react';
import { playSuccessChime } from '@/lib/sound';

interface ReservationPassProps {
  booking: any;
}

export default function ReservationPass({ booking }: ReservationPassProps) {
  const passRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Celebratory audio chime and confetti burst on screen
    playSuccessChime();

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#10b981', '#38bdf8'],
      });
    } catch {}
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const qrData = JSON.stringify({
    ref: booking?.bookingReference,
    name: booking?.customerName,
    date: booking?.date,
    slot: booking?.slotId ? `${booking.slotId.startTime}-${booking.slotId.endTime}` : undefined,
    table: booking?.tableId?.tableNumber,
    guests: booking?.guestCount,
  });

  return (
    <div className="space-y-6 print:space-y-0 print:m-0">
      {/* Printable VIP Dining Pass */}
      <div
        ref={passRef}
        id="dining-pass-card"
        className="print-single-page relative bg-gradient-to-br from-slate-900 via-[#0b1220] to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden print:bg-white print:text-slate-900 print:border print:border-slate-300 print:p-6 print:rounded-2xl print:shadow-none print:max-w-3xl print:mx-auto"
      >
        {/* Screen Decorative Glow Accents */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none print:hidden" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none print:hidden" />

        {/* Pass Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-5 print:border-slate-300 print:pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 shadow-lg print:w-10 print:h-10 print:bg-amber-600 print:text-white print:rounded-xl">
              <Utensils className="w-6 h-6 stroke-[2.5] print:w-5 print:h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight print:text-slate-950">
                The Royal Grand Bistro
              </h2>
              <p className="text-[11px] text-amber-400 font-bold tracking-widest uppercase print:text-amber-700">
                Dining Pass & Table Reservation
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right bg-slate-800/60 print:bg-slate-100 px-4 py-2 rounded-xl border border-slate-700/60 print:border-slate-300">
            <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block tracking-wider">
              Booking Reference
            </span>
            <span className="font-mono text-base sm:text-lg font-extrabold text-amber-400 print:text-slate-950 tracking-wider">
              {booking?.bookingReference || 'N/A'}
            </span>
          </div>
        </div>

        {/* Status Strip */}
        <div className="py-3 px-4 my-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs print:bg-emerald-50 print:border-emerald-300 print:my-3">
          <div className="flex items-center gap-2 text-emerald-400 print:text-emerald-800 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 print:text-emerald-700 shrink-0" />
            <span>Reservation Confirmed & Table Reserved</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400/90 print:text-emerald-800 font-medium">
            Status: Active
          </span>
        </div>

        {/* Pass Details Grid with QR Code */}
        <div className="py-2 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center print:grid-cols-3 print:gap-4">
          {/* Left Info Columns */}
          <div className="sm:col-span-2 grid grid-cols-2 gap-4 text-xs print:gap-3">
            <div className="space-y-1 bg-slate-850/50 print:bg-slate-50 p-3 rounded-xl border border-slate-800/60 print:border-slate-200">
              <span className="text-slate-400 print:text-slate-500 uppercase text-[10px] font-bold block">
                Guest Name
              </span>
              <p className="text-sm font-bold text-white print:text-slate-900 truncate">
                {booking?.customerName || 'Valued Guest'}
              </p>
            </div>

            <div className="space-y-1 bg-slate-850/50 print:bg-slate-50 p-3 rounded-xl border border-slate-800/60 print:border-slate-200">
              <span className="text-slate-400 print:text-slate-500 uppercase text-[10px] font-bold block">
                Contact Phone / WhatsApp
              </span>
              <p className="text-sm font-bold text-white print:text-slate-900 truncate flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-amber-400 print:text-amber-700 shrink-0" />
                {booking?.whatsapp || booking?.phone || 'N/A'}
              </p>
            </div>

            <div className="space-y-1 bg-slate-850/50 print:bg-slate-50 p-3 rounded-xl border border-slate-800/60 print:border-slate-200">
              <span className="text-slate-400 print:text-slate-500 uppercase text-[10px] font-bold block">
                Reservation Date
              </span>
              <p className="text-sm font-bold text-amber-400 print:text-amber-800 flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 shrink-0" />
                {booking?.date || 'N/A'}
              </p>
            </div>

            <div className="space-y-1 bg-slate-850/50 print:bg-slate-50 p-3 rounded-xl border border-slate-800/60 print:border-slate-200">
              <span className="text-slate-400 print:text-slate-500 uppercase text-[10px] font-bold block">
                Time Window
              </span>
              <p className="text-sm font-bold text-white print:text-slate-900 flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-400 print:text-amber-700 shrink-0" />
                {booking?.slotId?.startTime || 'TBD'} - {booking?.slotId?.endTime || 'TBD'}
              </p>
            </div>

            <div className="space-y-1 bg-slate-850/50 print:bg-slate-50 p-3 rounded-xl border border-slate-800/60 print:border-slate-200">
              <span className="text-slate-400 print:text-slate-500 uppercase text-[10px] font-bold block">
                Allocated Table & Zone
              </span>
              <p className="text-sm font-bold text-amber-400 print:text-amber-800">
                Table {booking?.tableId?.tableNumber || 'Assigned on Arrival'}
                <span className="text-xs font-normal text-slate-400 print:text-slate-600 block sm:inline sm:ml-1">
                  ({booking?.tableId?.zone || booking?.preferredZone || 'Indoor Dining'})
                </span>
              </p>
            </div>

            <div className="space-y-1 bg-slate-850/50 print:bg-slate-50 p-3 rounded-xl border border-slate-800/60 print:border-slate-200">
              <span className="text-slate-400 print:text-slate-500 uppercase text-[10px] font-bold block">
                Party Size
              </span>
              <p className="text-sm font-bold text-white print:text-slate-900 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400 print:text-amber-700 shrink-0" />
                {booking?.guestCount || 1} Persons
              </p>
            </div>

            {booking?.specialRequests && (
              <div className="col-span-2 space-y-1 bg-slate-850/50 print:bg-slate-50 p-2.5 rounded-xl border border-slate-800/60 print:border-slate-200">
                <span className="text-slate-400 print:text-slate-500 uppercase text-[10px] font-bold block">
                  Special Notes / Requests
                </span>
                <p className="text-xs text-slate-300 print:text-slate-800 italic">
                  "{booking.specialRequests}"
                </p>
              </div>
            )}
          </div>

          {/* QR Code Column */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-xl border border-slate-200 print:p-3 print:rounded-xl print:shadow-none">
            <QRCodeSVG
              value={qrData}
              size={110}
              level="M"
              includeMargin={false}
              fgColor="#0f172a"
            />
            <span className="text-[10px] font-bold text-slate-800 mt-2 uppercase tracking-wider text-center">
              Scan at Hostess Desk
            </span>
          </div>
        </div>

        {/* Concise Diner Guidelines */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 print:border-slate-200 text-[11px] text-slate-400 print:text-slate-600 space-y-1">
          <div className="flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400 print:text-amber-700 shrink-0 mt-0.5" />
            <p>
              Please arrive 5–10 minutes prior to your time window. Tables are held for a maximum of 15 minutes past reservation time.
            </p>
          </div>
        </div>

        {/* Pass Footer */}
        <div className="border-t border-slate-800/80 print:border-slate-300 mt-4 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 print:text-slate-600">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400 print:text-amber-700 shrink-0" />
            <span>Road 11, Banani, Dhaka 1213 • Desk: +880 1712-345678</span>
          </div>
          <span className="text-slate-500 print:text-slate-600 text-[10px]">
            Official Digital Reservation Receipt
          </span>
        </div>
      </div>

      {/* Print / Download Button Bar (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-center gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition hover:scale-105 active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save Dining Pass (PDF)</span>
        </button>
      </div>
    </div>
  );
}


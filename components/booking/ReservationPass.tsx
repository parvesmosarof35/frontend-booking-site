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
  Download,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { playSuccessChime } from '@/lib/sound';

interface ReservationPassProps {
  booking: any;
}

export default function ReservationPass({ booking }: ReservationPassProps) {
  const passRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Celebratory audio chime and confetti burst
    playSuccessChime();

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#10b981', '#38bdf8'],
      });
    } catch {}
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const qrData = JSON.stringify({
    ref: booking.bookingReference,
    name: booking.customerName,
    date: booking.date,
    slot: `${booking.slotId?.startTime}-${booking.slotId?.endTime}`,
    table: booking.tableId?.tableNumber,
    guests: booking.guestCount,
  });

  return (
    <div className="space-y-6">
      {/* Printable VIP Dining Pass */}
      <div
        ref={passRef}
        className="relative bg-gradient-to-br from-slate-900 via-[#0d1527] to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden print:bg-white print:text-black print:border-black"
      >
        {/* Decorative Watermark & Accents */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Pass Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 shadow-lg">
              <Utensils className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-white tracking-tight">
                The Royal Grand Bistro
              </h3>
              <p className="text-[11px] text-amber-400 font-semibold tracking-widest uppercase">
                VIP Digital Dining Pass
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Reservation Reference
            </span>
            <span className="font-mono text-lg font-extrabold text-amber-400 tracking-wider">
              {booking.bookingReference}
            </span>
          </div>
        </div>

        {/* Pass Details Grid with QR Code */}
        <div className="py-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* Left Info Columns */}
          <div className="sm:col-span-2 grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 uppercase text-[10px] font-bold">Guest Name</span>
              <p className="text-sm font-bold text-white">{booking.customerName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 uppercase text-[10px] font-bold">WhatsApp</span>
              <p className="text-sm font-bold text-white">{booking.whatsapp}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 uppercase text-[10px] font-bold">Reservation Date</span>
              <p className="text-sm font-bold text-amber-400 flex items-center gap-1">
                <CalendarCheck className="w-3.5 h-3.5" /> {booking.date}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 uppercase text-[10px] font-bold">Time Window</span>
              <p className="text-sm font-bold text-white flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {booking.slotId?.startTime} - {booking.slotId?.endTime}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 uppercase text-[10px] font-bold">Allocated Table</span>
              <p className="text-sm font-bold text-amber-400">
                {booking.tableId?.tableNumber} ({booking.tableId?.zone || 'Indoor'})
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 uppercase text-[10px] font-bold">Party Size</span>
              <p className="text-sm font-bold text-white flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-400" /> {booking.guestCount} Persons
              </p>
            </div>
          </div>

          {/* QR Code Column */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-xl">
            <QRCodeSVG
              value={qrData}
              size={120}
              level="M"
              includeMargin={false}
              fgColor="#0f172a"
            />
            <span className="text-[10px] font-bold text-slate-800 mt-2 uppercase tracking-wider">
              Scan for Hostess Entry
            </span>
          </div>
        </div>

        {/* Pass Footer */}
        <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Road 11, Banani, Dhaka 1213 • Hostess Desk: +880 1712-345678</span>
          </div>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Reservation
          </span>
        </div>
      </div>

      {/* Print / Download Button Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition hover:scale-105"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save Dining Pass (PDF)</span>
        </button>
      </div>
    </div>
  );
}

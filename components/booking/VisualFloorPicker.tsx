'use client';

import React, { useState, useEffect } from 'react';
import { Users, CheckCircle2, Ban, Clock, MapPin, Sparkles, MoveHorizontal } from 'lucide-react';
import api from '@/lib/axios';

export interface VisualTable {
  _id: string;
  tableNumber: string;
  capacity: number;
  type?: string;
  zone: string;
  positionX: number;
  positionY: number;
  shape: 'round' | 'square' | 'rect';
  status: string; // 'available' | 'held' | 'booked' | 'too_small' | 'maintenance'
  isSelectable: boolean;
}

interface VisualFloorPickerProps {
  date: string;
  slotId: string;
  guestCount: number;
  selectedTableId: string | null;
  onSelectTable: (table: VisualTable) => void;
}

export default function VisualFloorPicker({
  date,
  slotId,
  guestCount,
  selectedTableId,
  onSelectTable,
}: VisualFloorPickerProps) {
  const [tables, setTables] = useState<VisualTable[]>([]);
  const [currentZone, setCurrentZone] = useState<string>('Indoor');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (date && slotId) {
      setLoading(true);
      api
        .get(`/bookings/floor-plan-status?date=${date}&slotId=${slotId}&guestCount=${guestCount}`)
        .then((res) => {
          setTables(res.data || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [date, slotId, guestCount]);

  const zoneTables = tables.filter((t) => t.zone === currentZone);

  return (
    <div className="space-y-4">
      {/* Zone Switcher & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['Indoor', 'Outdoor', 'Rooftop', 'VIP'].map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => setCurrentZone(z)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
                currentZone === z
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {z} Area
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 overflow-x-auto pb-1 sm:pb-0">
          <span className="flex items-center gap-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Selected
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Booked / Held
          </span>
        </div>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="sm:hidden flex items-center justify-center gap-1.5 text-[11px] text-amber-400/90 bg-amber-500/10 py-1.5 px-3 rounded-xl border border-amber-500/20 font-medium">
        <MoveHorizontal className="w-3.5 h-3.5 animate-pulse" />
        <span>Swipe left/right to browse full floor plan</span>
      </div>

      {/* 2D Canvas with Touch Scroll Container */}
      <div className="overflow-x-auto rounded-3xl border-2 border-slate-800 shadow-2xl backdrop-blur-xl bg-[#0c1322]">
        <div className="relative min-w-[700px] w-full h-[480px]">
          {/* Blueprint Grid */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#f59e0b 1px, transparent 1px), radial-gradient(#38bdf8 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
              backgroundPosition: '0 0, 20px 20px',
            }}
          />

          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs">
              Loading {currentZone} live layout...
            </div>
          ) : zoneTables.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-xs">
              No tables mapped in {currentZone} zone.
            </div>
          ) : (
            zoneTables.map((table) => {
              const isSelected = selectedTableId === table._id;
              const isAvailable = table.isSelectable;

              let shapeClass = 'w-24 h-24 rounded-2xl';
              if (table.shape === 'round') shapeClass = 'w-24 h-24 rounded-full';
              if (table.shape === 'rect') shapeClass = 'w-32 h-20 rounded-2xl';

              let styleClass = 'bg-slate-950/80 border-slate-800 text-slate-500 opacity-40 cursor-not-allowed';
              if (table.status === 'booked' || table.status === 'held') {
                styleClass = 'bg-rose-950/40 border-rose-800/60 text-rose-400 opacity-50 cursor-not-allowed';
              } else if (table.status === 'too_small') {
                styleClass = 'bg-slate-900/60 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed';
              } else if (isAvailable) {
                if (isSelected) {
                  styleClass =
                    'bg-amber-400 text-slate-950 border-amber-300 font-bold scale-110 shadow-xl shadow-amber-400/30 cursor-pointer animate-pulse ring-4 ring-amber-400/30';
                } else {
                  styleClass =
                    'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 hover:scale-105 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer';
                }
              }

              return (
                <button
                  key={table._id}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => isAvailable && onSelectTable(table)}
                  style={{
                    position: 'absolute',
                    left: `${Math.min(table.positionX || 50, 680)}px`,
                    top: `${Math.min(table.positionY || 50, 360)}px`,
                  }}
                  className={`border-2 flex flex-col items-center justify-center p-2 transition-all duration-200 ${shapeClass} ${styleClass}`}
                >
                  <span className="font-bold text-xs">{table.tableNumber}</span>
                  <span className="text-[10px] opacity-90 flex items-center gap-0.5 mt-0.5">
                    <Users className="w-2.5 h-2.5" /> {table.capacity}p
                  </span>
                  <span className="text-[9px] opacity-75 truncate max-w-[90%]">
                    {table.type || 'Standard'}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

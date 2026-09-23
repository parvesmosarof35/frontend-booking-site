'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Clock, RefreshCw, Layers, CalendarCheck, X } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function ShiftsSlotsPage() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [slotGenModalOpen, setSlotGenModalOpen] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState<string>('');

  // Shift Form
  const [shiftName, setShiftName] = useState('');
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('16:00');
  const [maxCapacity, setMaxCapacity] = useState(60);

  // Slot Generator Form
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [slotCapacity, setSlotCapacity] = useState(30);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shiftRes, slotRes] = await Promise.all([
        api.get('/shifts'),
        api.get('/shifts/slots'),
      ]);
      setShifts(shiftRes.data || []);
      setSlots(slotRes.data || []);
    } catch {
      toast.error('Failed to load shifts and slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/shifts', {
        name: shiftName,
        startTime,
        endTime,
        maxCapacity,
      });
      toast.success('New dining shift created!');
      setShiftModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create shift');
    }
  };

  const handleGenerateSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/shifts/${selectedShiftId}/generate-slots`, {
        intervalMinutes,
        slotCapacity,
      });
      toast.success('Slots generated successfully!');
      setSlotGenModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate slots');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Shift & Slot Schedule Management
          </h1>
          <p className="text-xs text-slate-400">
            Define dining shift operating hours and auto-generate bookable time intervals with capacity safeguards.
          </p>
        </div>

        <button
          onClick={() => {
            setShiftName('');
            setStartTime('12:00');
            setEndTime('16:00');
            setMaxCapacity(60);
            setShiftModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Shift</span>
        </button>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shifts.map((shift) => {
          const shiftSlots = slots.filter((s) => (s.shiftId?._id || s.shiftId) === shift._id);

          return (
            <div
              key={shift._id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-white">{shift.name}</h3>
                  <p className="text-xs text-amber-400 font-mono font-semibold">
                    {shift.startTime} - {shift.endTime}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs px-3 py-1 bg-slate-800 rounded-full border border-slate-700 text-slate-300">
                    Max: {shift.maxCapacity} Guests
                  </span>
                </div>
              </div>

              {/* Slot Generator Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  {shiftSlots.length} Bookable Time Slots
                </span>
                <button
                  onClick={() => {
                    setSelectedShiftId(shift._id);
                    setIntervalMinutes(60);
                    setSlotCapacity(Math.floor(shift.maxCapacity / 2));
                    setSlotGenModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-lg transition border border-slate-700"
                >
                  Generate Slots
                </button>
              </div>

              {/* Slots List */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {shiftSlots.map((slot) => (
                  <div
                    key={slot._id}
                    className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl text-center space-y-1"
                  >
                    <div className="font-mono text-xs font-bold text-slate-200">
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Cap: {slot.maxCapacity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Shift */}
      {shiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Dining Shift</h3>
              <button onClick={() => setShiftModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateShift} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Shift Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dinner Shift"
                  value={shiftName}
                  onChange={(e) => setShiftName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Start Time (HH:MM)</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">End Time (HH:MM)</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Max Venue Capacity for Shift</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShiftModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
                >
                  Save Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Generate Slots */}
      {slotGenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Generate Bookable Slots</h3>
              <button onClick={() => setSlotGenModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGenerateSlots} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Slot Interval (Minutes)</label>
                <select
                  value={intervalMinutes}
                  onChange={(e) => setIntervalMinutes(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value={30}>Every 30 Minutes</option>
                  <option value={45}>Every 45 Minutes</option>
                  <option value={60}>Every 60 Minutes (1 Hour)</option>
                  <option value={90}>Every 90 Minutes (1.5 Hours)</option>
                  <option value={120}>Every 120 Minutes (2 Hours)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Max Seating Limit Per Slot</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={slotCapacity}
                  onChange={(e) => setSlotCapacity(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSlotGenModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
                >
                  Generate Slots
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

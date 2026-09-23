'use client';

import React, { useState, useEffect } from 'react';
import FloorPlanCanvas, { TableItem } from '@/components/admin/FloorPlanCanvas';
import { Plus, Layers, Sparkles, RefreshCw, X } from 'lucide-react';
import api from '@/lib/axios';
import { getSocket } from '@/lib/socket';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function FloorPlanPage() {
  const [tables, setTables] = useState<TableItem[]>([]);
  const [currentZone, setCurrentZone] = useState<string>('Indoor');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);

  // Form Fields
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState<number>(4);
  const [type, setType] = useState('Standard');
  const [zone, setZone] = useState('Indoor');
  const [shape, setShape] = useState<'round' | 'square' | 'rect'>('square');
  const [status, setStatus] = useState<'available' | 'reserved' | 'occupied' | 'maintenance'>('available');

  const fetchTables = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tables');
      setTables(data || []);
    } catch (err) {
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();

    // Listen to real-time socket events
    const socket = getSocket();
    socket.on('table_updated', (updated: any) => {
      setTables((prev) => {
        if (updated.deleted) {
          return prev.filter((t) => t._id !== updated._id);
        }
        const exists = prev.some((t) => t._id === updated._id);
        if (exists) {
          return prev.map((t) => (t._id === updated._id ? { ...t, ...updated } : t));
        }
        return [...prev, updated];
      });
    });

    return () => {
      socket.off('table_updated');
    };
  }, []);

  const handlePositionChange = async (tableId: string, x: number, y: number) => {
    // Optimistic UI update
    setTables((prev) =>
      prev.map((t) => (t._id === tableId ? { ...t, positionX: x, positionY: y } : t)),
    );

    try {
      await api.patch(`/tables/${tableId}/position`, {
        positionX: x,
        positionY: y,
        zone: currentZone,
      });
      toast.success('Table layout position saved', { duration: 1500 });
    } catch {
      toast.error('Failed to save table coordinates');
    }
  };

  const handleOpenAddModal = () => {
    setEditingTable(null);
    setTableNumber(`T-${String(tables.length + 1).padStart(2, '0')}`);
    setCapacity(4);
    setType('Standard');
    setZone(currentZone);
    setShape('square');
    setStatus('available');
    setModalOpen(true);
  };

  const handleOpenEditModal = (table: TableItem) => {
    setEditingTable(table);
    setTableNumber(table.tableNumber);
    setCapacity(table.capacity);
    setType(table.type || 'Standard');
    setZone(table.zone);
    setShape(table.shape || 'round');
    setStatus(table.status || 'available');
    setModalOpen(true);
  };

  const handleDeleteTable = async (id: string) => {
    const result = await Swal.fire({
      title: 'Delete this table?',
      text: 'This action removes the table token from the floor plan canvas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, delete table',
      background: '#0f172a',
      color: '#f8fafc',
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/tables/${id}`);
        setTables((prev) => prev.filter((t) => t._id !== id));
        toast.success('Table deleted successfully');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to delete table');
      }
    }
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTable) {
        const { data } = await api.patch(`/tables/${editingTable._id}`, {
          tableNumber,
          capacity,
          type,
          zone,
          shape,
          status,
        });
        setTables((prev) => prev.map((t) => (t._id === data._id ? data : t)));
        toast.success('Table updated successfully');
      } else {
        const { data } = await api.post('/tables', {
          tableNumber,
          capacity,
          type,
          zone,
          shape,
          status,
          positionX: 100,
          positionY: 100,
        });
        setTables((prev) => [...prev, data]);
        toast.success('New table placed on canvas');
      }
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save table');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-400" />
            <span>2D Restaurant Floor Plan Builder</span>
          </h1>
          <p className="text-xs text-slate-400">
            Drag tables freely onto the canvas. Coordinates and seating statuses auto-save in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTables}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition"
            title="Refresh Layout"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Table to Floor</span>
          </button>
        </div>
      </div>

      {/* Zone Switcher Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
        {['Indoor', 'Outdoor', 'Rooftop', 'VIP'].map((zoneName) => (
          <button
            key={zoneName}
            onClick={() => setCurrentZone(zoneName)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
              currentZone === zoneName
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {zoneName} Area
          </button>
        ))}
      </div>

      {/* Drag & Drop Canvas */}
      {loading ? (
        <div className="h-[600px] flex items-center justify-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-sm">
          Loading interactive floor layout...
        </div>
      ) : (
        <FloorPlanCanvas
          tables={tables}
          currentZone={currentZone}
          onPositionChange={handlePositionChange}
          onEditTable={handleOpenEditModal}
          onDeleteTable={handleDeleteTable}
        />
      )}

      {/* Add / Edit Table Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingTable ? `Edit Table ${editingTable.tableNumber}` : 'Add Table to Canvas'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTable} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Table Number *</label>
                  <input
                    type="text"
                    required
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="e.g. T-01"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Capacity (Seats) *</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Table Type / Note</label>
                  <input
                    type="text"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="e.g. Window Booth"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Floor Zone</label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Indoor">Indoor</option>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Rooftop">Rooftop</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Shape</label>
                  <select
                    value={shape}
                    onChange={(e) => setShape(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="round">Round (Circle)</option>
                    <option value="square">Square</option>
                    <option value="rect">Rectangle (Long)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="available">Available (Green)</option>
                    <option value="reserved">Reserved (Amber)</option>
                    <option value="occupied">Occupied (Rose)</option>
                    <option value="maintenance">Maintenance (Gray)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow"
                >
                  {editingTable ? 'Save Changes' : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

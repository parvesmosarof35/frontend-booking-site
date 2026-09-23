'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Users, RefreshCw } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function TablesManagerPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const url = zoneFilter === 'All' ? '/tables' : `/tables?zone=${zoneFilter}`;
      const { data } = await api.get(url);
      setTables(data || []);
    } catch {
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [zoneFilter]);

  const handleStatusChange = async (tableId: string, newStatus: string) => {
    try {
      await api.patch(`/tables/${tableId}`, { status: newStatus });
      setTables((prev) =>
        prev.map((t) => (t._id === tableId ? { ...t, status: newStatus } : t)),
      );
      toast.success('Table status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await Swal.fire({
      title: 'Delete table?',
      text: 'Are you sure you want to delete this table?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, delete',
      background: '#0f172a',
      color: '#f8fafc',
    });

    if (res.isConfirmed) {
      try {
        await api.delete(`/tables/${id}`);
        setTables((prev) => prev.filter((t) => t._id !== id));
        toast.success('Table deleted');
      } catch {
        toast.error('Failed to delete table');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Tables & Capacity Manager
          </h1>
          <p className="text-xs text-slate-400">
            View all tables across venue dining zones and toggle real-time availability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Indoor', 'Outdoor', 'Rooftop', 'VIP'].map((z) => (
            <button
              key={z}
              onClick={() => setZoneFilter(z)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                zoneFilter === z
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      {/* Table List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800 font-bold">
              <tr>
                <th className="py-4 px-6">Table Number</th>
                <th className="py-4 px-6">Zone</th>
                <th className="py-4 px-6">Capacity</th>
                <th className="py-4 px-6">Shape</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {tables.map((table) => (
                <tr key={table._id} className="hover:bg-slate-800/30 transition">
                  <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>{table.tableNumber}</span>
                    <span className="text-[10px] text-slate-500 font-normal">({table.type || 'Standard'})</span>
                  </td>
                  <td className="py-4 px-6 font-medium">{table.zone}</td>
                  <td className="py-4 px-6">
                    <span className="flex items-center gap-1 font-semibold text-slate-200">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      {table.capacity} Persons
                    </span>
                  </td>
                  <td className="py-4 px-6 capitalize">{table.shape}</td>
                  <td className="py-4 px-6">
                    <select
                      value={table.status}
                      onChange={(e) => handleStatusChange(table._id, e.target.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none ${
                        table.status === 'available'
                          ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                          : table.status === 'reserved'
                          ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                          : table.status === 'occupied'
                          ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      <option value="available">Available</option>
                      <option value="reserved">Reserved</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleDelete(table._id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete Table"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

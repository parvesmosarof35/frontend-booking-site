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
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-amber-600" />
            <span>Tables & Capacity Manager</span>
          </h1>
          <p className="text-xs text-slate-500">
            View all tables across venue dining zones and toggle real-time availability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Indoor', 'Outdoor', 'Rooftop', 'VIP'].map((z) => (
            <button
              key={z}
              onClick={() => setZoneFilter(z)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                zoneFilter === z
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      {/* Table List Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider border-b border-slate-200 font-bold">
              <tr>
                <th className="py-4 px-6">Table Number</th>
                <th className="py-4 px-6">Zone</th>
                <th className="py-4 px-6">Capacity</th>
                <th className="py-4 px-6">Shape</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tables.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No tables found for the selected zone.
                  </td>
                </tr>
              ) : (
                tables.map((table) => (
                  <tr key={table._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>{table.tableNumber}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({table.type || 'Standard'})</span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700">{table.zone}</td>
                    <td className="py-4 px-6">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <Users className="w-3.5 h-3.5 text-amber-600" />
                        {table.capacity} Persons
                      </span>
                    </td>
                    <td className="py-4 px-6 capitalize text-slate-600">{table.shape}</td>
                    <td className="py-4 px-6">
                      <select
                        value={table.status}
                        onChange={(e) => handleStatusChange(table._id, e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none capitalize ${
                          table.status === 'available'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : table.status === 'reserved'
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : table.status === 'occupied'
                            ? 'bg-rose-50 border-rose-300 text-rose-800'
                            : 'bg-slate-100 border-slate-300 text-slate-600'
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
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Table"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Sparkles, Clock, Upload, X } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [value, setValue] = useState<number>(20);
  const [promoCode, setPromoCode] = useState('PROMO20');
  const [validFrom, setValidFrom] = useState('2026-01-01');
  const [validTo, setValidTo] = useState('2026-12-31');
  const [appliesTo, setAppliesTo] = useState('all');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/offers');
      setOffers(data || []);
    } catch {
      toast.error('Failed to load promotional offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleOpenAdd = () => {
    setEditingOffer(null);
    setTitle('');
    setDescription('');
    setDiscountType('percentage');
    setValue(20);
    setPromoCode('');
    setValidFrom(new Date().toISOString().split('T')[0]);
    setValidTo('2026-12-31');
    setAppliesTo('all');
    setImageUrl('');
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (o: any) => {
    setEditingOffer(o);
    setTitle(o.title);
    setDescription(o.description || '');
    setDiscountType(o.discountType);
    setValue(o.value);
    setPromoCode(o.promoCode || '');
    setValidFrom(o.validFrom);
    setValidTo(o.validTo);
    setAppliesTo(o.appliesTo || 'all');
    setImageUrl(o.imageUrl || '');
    setIsActive(o.isActive);
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(data.url);
      toast.success('Offer banner uploaded to Cloudinary');
    } catch {
      toast.error('Failed to upload banner');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        description,
        discountType,
        value,
        promoCode,
        validFrom,
        validTo,
        appliesTo,
        imageUrl,
        isActive,
      };

      if (editingOffer) {
        await api.patch(`/offers/${editingOffer._id}`, payload);
        toast.success('Offer updated');
      } else {
        await api.post('/offers', payload);
        toast.success('New promotion launched');
      }

      setModalOpen(false);
      fetchOffers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save offer');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await Swal.fire({
      title: 'Delete this offer?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete',
      background: '#0f172a',
      color: '#f8fafc',
    });

    if (res.isConfirmed) {
      try {
        await api.delete(`/offers/${id}`);
        toast.success('Offer deleted');
        fetchOffers();
      } catch {
        toast.error('Failed to delete offer');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <span>Promotions & Vouchers Management</span>
          </h1>
          <p className="text-xs text-slate-400">
            Create discount campaigns, promo codes, and configure automated percentage or flat rate deductions.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Promotion</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div
            key={offer._id}
            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="relative h-40 bg-slate-950">
                <img
                  src={offer.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400'}
                  alt={offer.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-bold text-xs px-3 py-0.5 rounded-full shadow">
                  {offer.discountType === 'percentage' ? `${offer.value}% OFF` : `৳${offer.value} FLAT`}
                </div>
                <div
                  className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    offer.isActive
                      ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-900/90 text-slate-400 border border-slate-700'
                  }`}
                >
                  {offer.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-serif text-base font-bold text-white">{offer.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{offer.description}</p>
                {offer.promoCode && (
                  <div className="text-xs font-mono font-bold text-amber-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 w-fit">
                    Code: {offer.promoCode}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-800 mt-2">
              <span className="text-[11px] text-slate-500">
                {offer.validFrom} - {offer.validTo}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenEdit(offer)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(offer._id)}
                  className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingOffer ? 'Edit Promotion' : 'Create Promotion'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Grand Weekend 20% Off"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Terms, discount details, restrictions..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Value *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={value}
                    onChange={(e) => setValue(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Promo Code</label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="e.g. ROYAL20"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Valid From</label>
                  <input
                    type="date"
                    required
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Valid To</label>
                  <input
                    type="date"
                    required
                    value={validTo}
                    onChange={(e) => setValidTo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Banner Upload */}
              <div className="space-y-2">
                <label className="block font-semibold text-slate-300">Banner Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... or upload"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                  <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? '...' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded"
                  />
                  <span className="font-semibold text-slate-300">Campaign Active</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
                >
                  Save Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Save, Sparkles, Building, Phone, AlertCircle, ShieldCheck } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function AdminPaymentSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [codOnlyMode, setCodOnlyMode] = useState(false);
  const [bkashNumber, setBkashNumber] = useState('');
  const [nagadNumber, setNagadNumber] = useState('');
  const [rocketNumber, setRocketNumber] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState<number>(60);

  // Bank Details
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [branch, setBranch] = useState('');

  useEffect(() => {
    api
      .get('/payment-settings')
      .then((res) => {
        const d = res.data;
        if (d) {
          setCodOnlyMode(d.codOnlyMode ?? false);
          setBkashNumber(d.bkashNumber || '');
          setNagadNumber(d.nagadNumber || '');
          setRocketNumber(d.rocketNumber || '');
          setDeliveryCharge(d.deliveryCharge ?? 60);
          if (d.bankDetails) {
            setBankName(d.bankDetails.bankName || '');
            setAccountName(d.bankDetails.accountName || '');
            setAccountNumber(d.bankDetails.accountNumber || '');
            setBranch(d.bankDetails.branch || '');
          }
        }
      })
      .catch(() => {
        toast.error('Failed to load payment settings');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        codOnlyMode,
        bkashNumber,
        nagadNumber,
        rocketNumber,
        deliveryCharge,
        bankDetails: {
          bankName,
          accountName,
          accountNumber,
          branch,
        },
      };

      await api.put('/payment-settings', payload);
      toast.success('Payment settings updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-amber-600" />
          <span>Payment & Delivery Configuration</span>
        </h1>
        <p className="text-xs text-slate-500">
          Control the master Cash on Delivery toggle, manual mobile banking wallets, and bank transfer routing.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Master COD Switch Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-base text-slate-900 block">
                Cash on Delivery (COD) Only Master Mode
              </span>
              <p className="text-xs text-slate-500 max-w-xl">
                When enabled, checkout is reduced to Name, WhatsApp & Address. All mobile banking fields are hidden and delivery fee is forced to ৳0.
              </p>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={codOnlyMode}
                onChange={(e) => setCodOnlyMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              codOnlyMode
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>
              Current Active Mode:{' '}
              <strong className="text-slate-900">
                {codOnlyMode ? 'COD Only Mode (Free Delivery)' : 'Manual Multi-Payment Mode (bKash/Nagad/Rocket/Bank)'}
              </strong>
            </span>
          </div>
        </div>

        {/* Standard Delivery Charge */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="font-bold text-base text-slate-900">Default Delivery Charge</h2>
          <div className="max-w-xs">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Delivery Fee (BDT ৳)
            </label>
            <input
              type="number"
              min={0}
              required
              disabled={codOnlyMode}
              value={deliveryCharge}
              onChange={(e) => setDeliveryCharge(parseFloat(e.target.value))}
              className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white disabled:opacity-50 transition"
            />
            {codOnlyMode && (
              <span className="text-[11px] text-amber-700 block mt-1 font-medium">
                * Disabled while COD Only mode is active (forced to ৳0).
              </span>
            )}
          </div>
        </div>

        {/* Mobile Banking Numbers */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="space-y-1">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-600" />
              <span>Mobile Banking Numbers</span>
            </h2>
            <p className="text-xs text-slate-500">
              Displayed to customers during checkout when selecting bKash, Nagad, or Rocket.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">bKash Account Number</label>
              <input
                type="text"
                value={bkashNumber}
                onChange={(e) => setBkashNumber(e.target.value)}
                placeholder="+8801700000001 (Personal)"
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nagad Account Number</label>
              <input
                type="text"
                value={nagadNumber}
                onChange={(e) => setNagadNumber(e.target.value)}
                placeholder="+8801800000002 (Merchant)"
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rocket Account Number</label>
              <input
                type="text"
                value={rocketNumber}
                onChange={(e) => setRocketNumber(e.target.value)}
                placeholder="+8801900000003 (Personal)"
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Bank Transfer Details */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="space-y-1">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-600" />
              <span>Official Bank Account Details</span>
            </h2>
            <p className="text-xs text-slate-500">
              For corporate or direct bank settlements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="City Bank Ltd"
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Holder Name</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="The Royal Grand Bistro & Dine"
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="1234567890123"
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Branch Name</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="Banani Branch, Dhaka"
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Payment Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Sparkles,
  PackageCheck,
  CalendarCheck,
  Clock,
  MapPin,
  Utensils,
  Phone,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import api from '@/lib/axios';
import { getSocket } from '@/lib/socket';
import { playNotificationChime } from '@/lib/sound';
import LiveOrderStepper, { OrderStatus } from '@/components/order/LiveOrderStepper';
import ReservationPass from '@/components/booking/ReservationPass';
import toast from 'react-hot-toast';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('ref') || '';

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [resultType, setResultType] = useState<'order' | 'booking' | null>(null);
  const [data, setData] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (lookupRef?: string) => {
    const target = (lookupRef || query).trim().toUpperCase();
    if (!target) {
      toast.error('Please enter an Order ID or Booking Reference');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      if (target.startsWith('ORD-') || target.startsWith('ORDER')) {
        const res = await api.get(`/orders/${target}`);
        setData(res.data);
        setResultType('order');
      } else if (target.startsWith('RES-') || target.startsWith('BOOK')) {
        const res = await api.get(`/bookings/reference/${target}`);
        setData(res.data);
        setResultType('booking');
      } else {
        // Try order first, fallback to booking
        try {
          const res = await api.get(`/orders/${target}`);
          setData(res.data);
          setResultType('order');
        } catch {
          const res = await api.get(`/bookings/reference/${target}`);
          setData(res.data);
          setResultType('booking');
        }
      }
    } catch (err: any) {
      setData(null);
      setResultType(null);
      toast.error('Reference not found. Please check your reference code.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  // Real-time socket listener for live status updates
  useEffect(() => {
    const socket = getSocket();

    const handleOrderUpdate = (payload: any) => {
      if (data && resultType === 'order' && (payload.orderNumber === data.orderNumber || payload._id === data._id)) {
        setData((prev: any) => ({ ...prev, orderStatus: payload.orderStatus }));
        playNotificationChime();
        toast.success(`Order status updated to ${payload.orderStatus}!`);
      }
    };

    const handleBookingUpdate = (payload: any) => {
      if (data && resultType === 'booking' && (payload.bookingReference === data.bookingReference || payload._id === data._id)) {
        setData((prev: any) => ({ ...prev, status: payload.status }));
        playNotificationChime();
        toast.success(`Reservation status updated to ${payload.status}!`);
      }
    };

    socket.on('order_status_updated', handleOrderUpdate);
    socket.on('booking_status_updated', handleBookingUpdate);

    return () => {
      socket.off('order_status_updated', handleOrderUpdate);
      socket.off('booking_status_updated', handleBookingUpdate);
    };
  }, [data, resultType]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Real-Time Status & Live Stepper</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Track Order & Reservation
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Enter your reference number (e.g. <code>ORD-20260923-XXXX</code> or <code>RES-20260923-XXXX</code>) to see live kitchen preparation and seating status.
        </p>
      </div>

      {/* Lookup Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. ORD-20260923-8392 or RES-20260923-1029"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-900 font-mono placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm rounded-2xl transition shadow-md flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Locating...' : 'Track Live'}</span>
          </button>
        </form>
      </div>

      {/* Results Rendering */}
      {data && resultType === 'order' && (
        <div className="space-y-6">
          <LiveOrderStepper
            status={data.orderStatus as OrderStatus}
            orderType={data.type}
            createdAt={data.createdAt}
            updatedAt={data.updatedAt}
          />

          {/* Order Details Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm text-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">
                  Order Summary
                </span>
                <h3 className="font-mono text-xl font-bold text-slate-900">
                  {data.orderNumber}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Total Amount</span>
                <span className="font-serif text-xl font-bold text-amber-700">
                  ${Number(data.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Items Ordered ({data.items?.length || 0})
              </h4>
              <div className="divide-y divide-slate-100">
                {data.items?.map((item: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-100 text-amber-700 flex items-center justify-center font-bold font-mono">
                        {item.quantity}x
                      </span>
                      <span className="text-slate-900 font-medium">{item.name}</span>
                    </div>
                    <span className="text-slate-700 font-mono font-semibold">
                      ${(Number(item.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery address / contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 text-xs text-slate-700">
              <div>
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Customer</span>
                <p className="text-slate-900 font-semibold">{data.customerName}</p>
                <p className="text-slate-500">{data.phone}</p>
              </div>
              <div>
                <span className="text-slate-500 font-bold block text-[10px] uppercase">
                  {data.type === 'delivery' ? 'Delivery Address' : 'Fulfillment Type'}
                </span>
                <p className="text-slate-900">
                  {data.type === 'delivery' ? data.deliveryAddress : `Self-Pickup / ${data.type}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {data && resultType === 'booking' && (
        <div className="space-y-6">
          <ReservationPass booking={data} />
        </div>
      )}

      {searched && !data && !loading && (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-slate-900">No Record Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn't find an order or reservation matching "{query}". Please double-check your receipt or SMS confirmation code.
          </p>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading tracker...</div>}>
      <TrackContent />
    </Suspense>
  );
}

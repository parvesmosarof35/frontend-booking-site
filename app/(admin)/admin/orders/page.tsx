'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Phone,
  MessageSquare,
  RefreshCw,
  Clock,
  CheckCircle,
  Truck,
  Building,
  CreditCard,
} from 'lucide-react';
import api from '@/lib/axios';
import { getSocket } from '@/lib/socket';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'All' ? '/orders' : `/orders?status=${statusFilter}`;
      const { data } = await api.get(url);
      setOrders(data || []);
    } catch {
      toast.error('Failed to load online orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const socket = getSocket();
    socket.on('order_created', (newOrder: any) => {
      setOrders((prev) => [newOrder, ...prev]);
      toast.success(`New order ${newOrder.orderNumber} placed by ${newOrder.customerName}!`);
    });

    socket.on('order_status_changed', (updated: any) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? updated : o)),
      );
    });

    return () => {
      socket.off('order_created');
      socket.off('order_status_changed');
    };
  }, [statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      toast.success(`Order status set to ${newStatus}`);
    } catch {
      toast.error('Failed to update order status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-400" />
            <span>Online Orders & Kitchen Lifecycle</span>
          </h1>
          <p className="text-xs text-slate-400">
            Monitor real-time food orders, verify manual digital payments (bKash/Nagad/Bank), and update fulfillment stages.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800"
          title="Refresh Orders"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {['All', 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map(
          (st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ),
        )}
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {orders.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-3xl">
            No orders found for the selected status.
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="font-mono text-sm font-bold text-amber-400 block">
                      {order.orderNumber}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.orderType?.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-base text-white block">
                      {formatPrice(order.total)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      (Delivery: {order.deliveryCharge === 0 ? 'FREE' : formatPrice(order.deliveryCharge)})
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{order.customerName}</span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-amber-400" /> {order.whatsapp}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{order.address}</p>
                  {order.notes && (
                    <p className="text-amber-300 text-[11px] italic">Note: &quot;{order.notes}&quot;</p>
                  )}
                </div>

                {/* Payment Method Badge */}
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="font-bold text-white">{order.paymentMethod}</span>
                      {order.transactionId && (
                        <span className="block text-[11px] font-mono text-amber-400">
                          TxID: {order.transactionId}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Manual Verified'}
                  </span>
                </div>

                {/* Ordered Items List */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Ordered Items:</span>
                  {order.items.map((it: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-300">
                      <span>{it.qty}x {it.name}</span>
                      <span className="text-white font-semibold">{formatPrice(it.price * it.qty)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Selector & WhatsApp Contact */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none capitalize ${
                      order.status === 'delivered'
                        ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300'
                        : order.status === 'out_for_delivery'
                        ? 'bg-blue-950 border-blue-500/50 text-blue-300'
                        : order.status === 'preparing'
                        ? 'bg-amber-950 border-amber-500/50 text-amber-300'
                        : order.status === 'confirmed'
                        ? 'bg-purple-950 border-purple-500/50 text-purple-300'
                        : order.status === 'cancelled'
                        ? 'bg-rose-950 border-rose-500/50 text-rose-300'
                        : 'bg-slate-950 border-slate-700 text-slate-300'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing in Kitchen</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {order.whatsapp && (
                  <a
                    href={`https://wa.me/${order.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${order.customerName},%20regarding%20your%20food%20order%20${order.orderNumber}...`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-xl border border-emerald-500/40 transition shrink-0"
                    title="Message Customer on WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

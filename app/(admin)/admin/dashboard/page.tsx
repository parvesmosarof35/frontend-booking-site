'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  CalendarCheck,
  ShoppingBag,
  TrendingUp,
  Eye,
  MousePointerClick,
  Layers,
  Sparkles,
  ArrowUpRight,
  Utensils,
} from 'lucide-react';
import api from '@/lib/axios';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<any>({
    totalBookings: 0,
    confirmedBookingsToday: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalViews: 0,
    totalClicks: 0,
  });

  const [topStats, setTopStats] = useState<any>({
    topViewedMenu: [],
    topClickedMenu: [],
    topViewedOffers: [],
    topClickedOffers: [],
  });

  const [timeSeries, setTimeSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [sumRes, topRes, timeRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/analytics/top'),
          api.get('/analytics/timeseries?days=14'),
        ]);

        setSummary(sumRes.data || {});
        setTopStats(topRes.data || {});
        setTimeSeries(timeRes.data || []);
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Format Top 10 Menu for Bar Chart
  const menuChartData = (topStats.topViewedMenu || []).map((item: any) => ({
    name: item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name,
    views: item.viewCount || 0,
    clicks: item.clickCount || 0,
  }));

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Executive Analytics & Performance
          </h1>
          <p className="text-xs text-slate-400">
            Real-time reservation metrics, online orders, customer views, and conversion activity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/floor-plan"
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow"
          >
            <Layers className="w-4 h-4" />
            <span>Floor Plan Canvas</span>
          </Link>
          <Link
            href="/admin/bookings"
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition"
          >
            <CalendarCheck className="w-4 h-4 text-amber-400" />
            <span>Bookings</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Total Reservations</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{summary.totalBookings}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{summary.confirmedBookingsToday} Confirmed Today</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Online Food Orders</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{summary.totalOrders}</div>
          <div className="text-[11px] text-slate-400">Delivery & Pickup Orders</div>
        </div>

        {/* Total Revenue */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Gross Online Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {formatPrice(summary.totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-400">Excludes cancelled orders</div>
        </div>

        {/* Views & Clicks */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Views / Clicks Activity</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            {summary.totalViews}{' '}
            <span className="text-xs text-slate-400 font-normal">/ {summary.totalClicks} clicks</span>
          </div>
          <div className="text-[11px] text-purple-400">
            Conversion: {summary.totalViews > 0 ? ((summary.totalClicks / summary.totalViews) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Top Most Viewed vs Clicked Menu Items (Bar Chart) */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-400" />
              <span>Top 10 Menu Items (Views vs Clicks)</span>
            </h3>
            <span className="text-[10px] text-slate-500">Fast Count Metrics</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={menuChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="views" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Views" />
                <Bar dataKey="clicks" fill="#10b981" radius={[4, 4, 0, 0]} name="Clicks / Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Time Series Activity Trend (Line Chart) */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Engagement Timeline (Last 14 Days)</span>
            </h3>
            <span className="text-[10px] text-slate-500">Live Time-Series Log</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Page & Item Views"
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Action Clicks"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TOP ITEMS RANKING TABLE */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Top Performing Dishes & Offers</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Viewed */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Most Viewed Dishes
            </h4>
            <div className="space-y-2">
              {(topStats.topViewedMenu || []).slice(0, 5).map((dish: any, idx: number) => (
                <div
                  key={dish._id}
                  className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-white">{dish.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{dish.viewCount} views</span>
                    <span className="text-amber-400 font-bold">{formatPrice(dish.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Clicked */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Most Clicked / Ordered Dishes
            </h4>
            <div className="space-y-2">
              {(topStats.topClickedMenu || []).slice(0, 5).map((dish: any, idx: number) => (
                <div
                  key={dish._id}
                  className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-white">{dish.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-semibold">{dish.clickCount} clicks</span>
                    <span className="text-amber-400 font-bold">{formatPrice(dish.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

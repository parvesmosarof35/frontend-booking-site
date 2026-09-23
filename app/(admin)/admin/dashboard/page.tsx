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
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Executive Analytics & Performance
          </h1>
          <p className="text-xs text-slate-500">
            Real-time reservation metrics, online orders, customer views, and conversion activity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/floor-plan"
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-xs"
          >
            <Layers className="w-4 h-4" />
            <span>Floor Plan Canvas</span>
          </Link>
          <Link
            href="/admin/bookings"
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition border border-slate-200 shadow-xs"
          >
            <CalendarCheck className="w-4 h-4 text-amber-600" />
            <span>Bookings</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-3 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Reservations</span>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{summary.totalBookings}</div>
          <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{summary.confirmedBookingsToday} Confirmed Today</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-3 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Online Food Orders</span>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{summary.totalOrders}</div>
          <div className="text-[11px] text-slate-500">Delivery & Pickup Orders</div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-3 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Gross Online Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono">
            {formatPrice(summary.totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-500">Excludes cancelled orders</div>
        </div>

        {/* Views & Clicks */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-3 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Views / Clicks Activity</span>
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {summary.totalViews}{' '}
            <span className="text-xs text-slate-500 font-normal">/ {summary.totalClicks} clicks</span>
          </div>
          <div className="text-[11px] text-purple-700 font-medium">
            Conversion: {summary.totalViews > 0 ? ((summary.totalClicks / summary.totalViews) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Top Most Viewed vs Clicked Menu Items (Bar Chart) */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-600" />
              <span>Top 10 Menu Items (Views vs Clicks)</span>
            </h3>
            <span className="text-[10px] text-slate-400">Fast Count Metrics</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={menuChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
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
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Engagement Timeline (Last 14 Days)</span>
            </h3>
            <span className="text-[10px] text-slate-400">Live Time-Series Log</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
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
                  stroke="#0284c7"
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
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Top Performing Dishes & Offers</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Viewed */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Most Viewed Dishes
            </h4>
            <div className="space-y-2">
              {(topStats.topViewedMenu || []).slice(0, 5).map((dish: any, idx: number) => (
                <div
                  key={dish._id}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-900">{dish.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">{dish.viewCount} views</span>
                    <span className="text-amber-700 font-bold">{formatPrice(dish.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Clicked */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Most Clicked / Ordered Dishes
            </h4>
            <div className="space-y-2">
              {(topStats.topClickedMenu || []).slice(0, 5).map((dish: any, idx: number) => (
                <div
                  key={dish._id}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-900">{dish.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-700 font-semibold">{dish.clickCount} clicks</span>
                    <span className="text-amber-700 font-bold">{formatPrice(dish.price)}</span>
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

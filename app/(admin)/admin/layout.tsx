'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import {
  LayoutDashboard,
  MapPin,
  CalendarCheck,
  Utensils,
  Sparkles,
  ShoppingBag,
  CreditCard,
  FileText,
  HelpCircle,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Layers,
  Clock,
  Bell,
  Volume2,
} from 'lucide-react';
import { getSocket } from '@/lib/socket';
import { playNotificationChime } from '@/lib/sound';
import toast from 'react-hot-toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If on /admin/login, don't show admin shell
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token && !auth.isAuthenticated) {
        router.push('/admin/login');
      }
    }
  }, [auth.isAuthenticated, isLoginPage, router]);

  // Real-time notification chime listener for Admin & Kitchen
  useEffect(() => {
    if (isLoginPage) return;

    const socket = getSocket();

    const handleNewBooking = (booking: any) => {
      playNotificationChime();
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white border border-amber-300 shadow-xl rounded-2xl pointer-events-auto flex p-4 ring-2 ring-amber-400/20`}
        >
          <div className="flex-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                🔔 New Reservation Received!
              </p>
              <p className="text-xs font-bold text-slate-900">
                {booking.customerName} • {booking.guestCount} Guests
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                Ref: {booking.bookingReference} ({booking.date})
              </p>
            </div>
          </div>
        </div>
      ), { duration: 6000 });
    };

    const handleNewOrder = (order: any) => {
      playNotificationChime();
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white border border-emerald-300 shadow-xl rounded-2xl pointer-events-auto flex p-4 ring-2 ring-emerald-400/20`}
        >
          <div className="flex-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                🔔 New Food Order Received!
              </p>
              <p className="text-xs font-bold text-slate-900">
                Order #{order.orderNumber} • ${Number(order.totalAmount || 0).toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {order.customerName} ({order.type})
              </p>
            </div>
          </div>
        </div>
      ), { duration: 6000 });
    };

    socket.on('booking_created', handleNewBooking);
    socket.on('order_created', handleNewOrder);

    return () => {
      socket.off('booking_created', handleNewBooking);
      socket.off('order_created', handleNewOrder);
    };
  }, [isLoginPage]);

  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  const navItems = [
    { name: 'Analytics Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Floor Plan Builder', href: '/admin/floor-plan', icon: Layers, highlight: true },
    { name: 'Tables Manager', href: '/admin/tables', icon: MapPin },
    { name: 'Shifts & Slots', href: '/admin/shifts-slots', icon: Clock },
    { name: 'Reservations', href: '/admin/bookings', icon: CalendarCheck },
    { name: 'Menu Items', href: '/admin/menu', icon: Utensils },
    { name: 'Offers & Promos', href: '/admin/offers', icon: Sparkles },
    { name: 'Customer Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Payment Settings', href: '/admin/payment-settings', icon: CreditCard, highlight: true },
    { name: 'CMS Content Pages', href: '/admin/content', icon: FileText },
    { name: 'FAQs (Reorderable)', href: '/admin/faq', icon: HelpCircle },
    { name: 'Profile & Staff Users', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    dispatch(logout());
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 flex-col justify-between bg-white border-r border-slate-200/80 p-4 shrink-0 shadow-xs">
        <div className="space-y-6">
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-slate-900 block">Royal Bistro</span>
              <span className="text-[10px] uppercase tracking-wider text-amber-700 font-bold">Admin Portal</span>
            </div>
          </Link>

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-amber-50 text-amber-900 border border-amber-300/80 shadow-xs font-bold'
                      : item.highlight
                      ? 'text-amber-800 hover:bg-amber-50/50 hover:text-amber-900'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-600' : ''}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-bold text-xs">
              {auth.user?.name ? auth.user.name[0].toUpperCase() : 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">{auth.user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-amber-700 capitalize font-medium">{auth.user?.role || 'Superadmin'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="font-bold text-sm text-slate-900">Admin Control Panel</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {sidebarOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 p-4 space-y-1 z-30 shadow-md">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-amber-100 text-amber-900 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

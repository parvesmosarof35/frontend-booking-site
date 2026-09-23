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
} from 'lucide-react';

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

  if (isLoginPage) {
    return <div className="min-h-screen bg-[#070b14]">{children}</div>;
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
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 flex-col justify-between bg-slate-950 border-r border-slate-800 p-4 shrink-0">
        <div className="space-y-6">
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-white block">Royal Bistro</span>
              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold">Admin Panel</span>
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
                      ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                      : item.highlight
                      ? 'text-amber-300 hover:bg-slate-900 hover:text-white'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs">
              {auth.user?.name ? auth.user.name[0].toUpperCase() : 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{auth.user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-amber-400 capitalize">{auth.user?.role || 'Superadmin'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 hover:bg-rose-950/40 text-rose-400 font-bold text-xs rounded-xl border border-slate-800 hover:border-rose-800 transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="lg:hidden h-16 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-slate-900 text-slate-300"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="font-bold text-sm text-white">Admin Control Panel</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-slate-900 text-rose-400"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {sidebarOpen && (
          <div className="lg:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-1 z-30">
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
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
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

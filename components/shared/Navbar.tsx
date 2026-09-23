'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { toggleCartDrawer } from '@/store/slices/uiSlice';
import {
  Utensils,
  CalendarCheck,
  ShoppingBag,
  Sparkles,
  Info,
  HelpCircle,
  ShieldCheck,
  Menu as MenuIcon,
  X,
  PhoneCall,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Reserve Table', href: '/book', icon: CalendarCheck, highlight: true },
    { name: 'Order Food', href: '/order', icon: Utensils },
    { name: 'Offers', href: '/offers', icon: Sparkles },
    { name: 'About Us', href: '/about-us', icon: Info },
    { name: 'FAQs', href: '/faq', icon: HelpCircle },
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-xl'
          : 'bg-transparent border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
              <Utensils className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-amber-400 transition">
                The Royal Grand
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-amber-400 font-semibold">
                Bistro & Fine Dining
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive
                      ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20'
                      : link.highlight
                      ? 'text-amber-300 hover:text-amber-200 hover:bg-amber-400/5 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Cart, Call, Admin */}
          <div className="flex items-center gap-3">
            {/* Cart Trigger */}
            <button
              onClick={() => dispatch(toggleCartDrawer())}
              className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-800 transition text-slate-200 shadow-md group"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-amber-400 group-hover:scale-110 transition" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-slate-950 text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Quick Call */}
            <a
              href="tel:+8801712345678"
              className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-amber-400 bg-slate-900/80 border border-slate-800 transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>+880 1712-345678</span>
            </a>

            {/* Admin Portal Portal Button */}
            <Link
              href="/admin/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition shadow"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Staff Portal</span>
            </Link>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-3 pb-6 space-y-2 backdrop-blur-xl">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition ${
                  isActive
                    ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {Icon && <Icon className="w-5 h-5 text-amber-400" />}
                {link.name}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-amber-400 font-medium"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Admin Portal
            </Link>
            <a
              href="tel:+8801712345678"
              className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Call Restaurant
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

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
  Radar,
  Menu as MenuIcon,
  X,
  PhoneCall,
  ShieldCheck,
  ArrowRight,
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
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simplified, high-converting, crystal clear navigation links
  const navLinks = [
    { name: 'Reserve Table', href: '/book' },
    { name: 'Order Food', href: '/order' },
    { name: 'Offers & Promos', href: '/offers' },
    { name: 'Track Live', href: '/track' },
    { name: 'FAQs', href: '/faq' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm'
          : 'bg-white/80 backdrop-blur-sm border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition">
              <Utensils className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 group-hover:text-amber-600 transition block leading-tight">
                The Royal Grand
              </span>
              <span className="text-[10px] uppercase tracking-widest text-amber-700 font-bold block">
                Bistro & Fine Dining
              </span>
            </div>
          </Link>

          {/* Clean Desktop Navigation Bar */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'text-amber-700 bg-amber-50 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar (Cart + Book Button + Mobile Menu) */}
          <div className="flex items-center gap-3">
            {/* Cart Trigger Button */}
            <button
              onClick={() => dispatch(toggleCartDrawer())}
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 transition text-slate-700 shadow-xs"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-slate-800" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-slate-950 text-xs font-bold rounded-full flex items-center justify-center shadow">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Primary CTA Book Button (Desktop) */}
            <Link
              href="/book"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/15 transition hover:scale-102"
            >
              <CalendarCheck className="w-4 h-4 stroke-[2.5]" />
              <span>Book a Table</span>
            </Link>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-xl">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition ${
                  isActive
                    ? 'text-amber-700 bg-amber-50 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{link.name}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/book"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow"
            >
              <CalendarCheck className="w-4 h-4 stroke-[2.5]" />
              <span>Reserve a Table</span>
            </Link>

            <div className="flex items-center justify-between pt-2 px-1">
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Staff Login
              </Link>
              <a
                href="tel:+8801712345678"
                className="flex items-center gap-1 text-xs text-amber-700 font-bold"
              >
                <PhoneCall className="w-3.5 h-3.5" /> +880 1712-345678
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

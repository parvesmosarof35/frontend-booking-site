'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  CalendarCheck,
  UtensilsCrossed,
  Radar,
  Tag,
  ShoppingBag,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { setCartDrawerOpen } from '@/store/slices/uiSlice';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  // Hide on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Reserve', href: '/book', icon: CalendarCheck },
    { label: 'Menu', href: '/order', icon: UtensilsCrossed },
    { label: 'Offers', href: '/offers', icon: Tag },
    { label: 'Track', href: '/track', icon: Radar },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200 backdrop-blur-md px-2 py-1.5 shadow-lg flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              isActive
                ? 'text-amber-700 font-bold scale-105'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5 stroke-[2.2]" />
              {item.href === '/order' && totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center shadow">
                  {totalCartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })}

      {/* Floating quick cart button if items are in cart */}
      {totalCartCount > 0 && pathname !== '/order' && (
        <button
          onClick={() => dispatch(setCartDrawerOpen(true))}
          className="flex flex-col items-center justify-center py-1 px-3 text-amber-700 font-bold"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center shadow">
              {totalCartCount}
            </span>
          </div>
          <span className="text-[10px] mt-0.5">Cart</span>
        </button>
      )}
    </nav>
  );
}

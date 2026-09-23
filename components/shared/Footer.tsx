'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Utensils, MapPin, Phone, Clock, Mail, ShieldCheck, Heart } from 'lucide-react';
import api from '@/lib/axios';

export default function Footer() {
  const [restaurant, setRestaurant] = useState<any>({
    name: 'The Royal Grand Bistro & Dine',
    address: 'Road 11, Block D, Banani, Dhaka 1213, Bangladesh',
    phone: '+880 1712-345678',
    openingHours: 'Mon - Sun: 11:00 AM - 11:30 PM',
  });

  useEffect(() => {
    api.get('/restaurant').then((res) => {
      if (res.data) setRestaurant(res.data);
    }).catch(() => {});
  }, []);

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg">
                <Utensils className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <span className="font-serif text-xl font-bold text-white tracking-tight">
                {restaurant.name}
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Experience modern culinary excellence, serene ambiance, and unparalleled hospitality at our signature luxury dining venue.
            </p>
            <div className="pt-2">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition font-medium"
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Admin & Staff Portal</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-amber-400 transition">Home</Link>
              </li>
              <li>
                <Link href="/book" className="hover:text-amber-400 transition font-semibold text-amber-400/90">Reserve a Table</Link>
              </li>
              <li>
                <Link href="/order" className="hover:text-amber-400 transition">Order Online</Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-amber-400 transition">Promotions & Vouchers</Link>
              </li>
              <li>
                <Link href="/about-us" className="hover:text-amber-400 transition">About Our Heritage</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-amber-400 transition">Frequently Asked Questions</Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policy CMS Pages */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Legal & Information</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy-policy" className="hover:text-amber-400 transition">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-400 transition">Terms & Conditions</Link>
              </li>
              <li>
                <Link href="/about-us" className="hover:text-amber-400 transition">Master Chefs & Sourcing</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-amber-400 transition">Booking Cancellation Policy</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contact & Hours</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{restaurant.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <a href={`tel:${restaurant.phone}`} className="hover:text-amber-400">{restaurant.phone}</a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{restaurant.openingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} {restaurant.name}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> for exquisite dining experiences.
          </p>
        </div>
      </div>
    </footer>
  );
}

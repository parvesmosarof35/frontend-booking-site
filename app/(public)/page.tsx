'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import { setCartDrawerOpen } from '@/store/slices/uiSlice';
import {
  CalendarCheck,
  Utensils,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Star,
  Users,
  Award,
  ShieldCheck,
  ChevronRight,
  Plus,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import api from '@/lib/axios';
import { formatPrice } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import toast from 'react-hot-toast';

export default function HomePage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [featuredItems, setFeaturedItems] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);

  // Quick reservation search state (OpenTable style)
  const [bookDate, setBookDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookShift, setBookShift] = useState('');
  const [bookGuests, setBookGuests] = useState('2');

  useEffect(() => {
    trackEvent('view', 'page', 'homepage');

    // Fetch featured items
    api.get('/menu/featured').then((res) => {
      setFeaturedItems(res.data || []);
    }).catch(() => {});

    // Fetch shifts
    api.get('/shifts').then((res) => {
      setShifts(res.data || []);
      if (res.data?.length > 0) setBookShift(res.data[0]._id);
    }).catch(() => {});

    // Fetch offers
    api.get('/offers?activeOnly=true').then((res) => {
      setOffers(res.data || []);
    }).catch(() => {});

    // Fetch restaurant profile
    api.get('/restaurant').then((res) => {
      setRestaurant(res.data);
    }).catch(() => {});
  }, []);

  const handleQuickBook = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('click', 'cta', 'quick_book_widget', { bookDate, bookShift, bookGuests });
    router.push(`/book?date=${bookDate}&shiftId=${bookShift}&guests=${bookGuests}`);
  };

  const handleAddToCart = (item: any) => {
    trackEvent('click', 'menuItem', item._id, { action: 'add_to_cart_home' });
    dispatch(
      addToCart({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        category: item.category,
      }),
    );
    toast.success(`Added "${item.name}" to cart!`);
    dispatch(setCartDrawerOpen(true));
  };

  return (
    <div className="space-y-20 pb-20 overflow-hidden bg-[#fafaf9]">
      {/* 1. HERO SECTION (OpenTable / Resy Luxury Aesthetic) */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-8 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-amber-50/50 via-white to-[#fafaf9]">
        {/* Background Subtle Accent */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute -top-40 right-0 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl" />
          <div className="absolute top-60 -left-20 w-80 h-80 bg-orange-100/60 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Dhaka&apos;s Signature Fine Dining & Table Booking</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Reserve Your Table for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900">
              Unforgettable Dining
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Experience world-class artisan gastronomy. Select your preferred seating on our interactive 2D floor map or order gourmet delicacies straight to your home.
          </p>

          {/* OPENTABLE-STYLE FLOATING QUICK BOOKING BAR */}
          <div className="max-w-4xl mx-auto pt-4">
            <form
              onSubmit={handleQuickBook}
              className="bg-white p-4 sm:p-5 rounded-3xl shadow-xl border border-slate-200/90 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center text-left"
            >
              {/* Date Input */}
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookDate}
                  onChange={(e) => setBookDate(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 font-semibold focus:outline-none"
                />
              </div>

              {/* Time / Shift Select */}
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Dining Shift
                </label>
                <select
                  value={bookShift}
                  onChange={(e) => setBookShift(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 font-semibold focus:outline-none cursor-pointer"
                >
                  {shifts.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.startTime} - {s.endTime})
                    </option>
                  ))}
                </select>
              </div>

              {/* Guests Select */}
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Guests (Party Size)
                </label>
                <select
                  value={bookGuests}
                  onChange={(e) => setBookGuests(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 font-semibold focus:outline-none cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest (Solo)' : `${num} People`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-full min-h-[52px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm rounded-2xl shadow-md transition hover:scale-102 flex items-center justify-center gap-2"
              >
                <CalendarCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Find a Table</span>
              </button>
            </form>
          </div>

          {/* Social Proof Tags */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1 text-slate-700">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <strong>4.9 / 5.0</strong> (1,400+ Verified Diner Reviews)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Instant 5-Min Table Lock
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-700">
              <Compass className="w-4 h-4 text-amber-600" />
              Interactive 2D Seating
            </span>
          </div>
        </div>
      </section>

      {/* 2. SIGNATURE CHEF SPECIALS (White Card Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block">
              Curated by Executive Chef
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
              Featured Culinary Specialties
            </h2>
          </div>
          <Link
            href="/order"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 transition"
          >
            <span>View Full Gourmet Menu</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {(featuredItems.length > 0
            ? featuredItems
            : [
                {
                  _id: 'sample-1',
                  name: 'Signature Wagyu Ribeye Steak',
                  price: 48,
                  category: 'Mains',
                  description: 'A5 Prime Japanese Wagyu grilled over binchotan charcoal with truffle bone marrow butter.',
                  imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
                },
                {
                  _id: 'sample-2',
                  name: 'Pan-Seared Chilean Sea Bass',
                  price: 38,
                  category: 'Seafood',
                  description: 'Served over saffron risotto with confit heirloom tomatoes and citrus emulsion.',
                  imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800',
                },
                {
                  _id: 'sample-3',
                  name: 'Royal Valrhona Lava Soufflé',
                  price: 18,
                  category: 'Dessert',
                  description: 'Molten dark chocolate cake infused with Madagascar vanilla bean gelato and gold leaf.',
                  imageUrl: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=800',
                },
              ]
          ).map((dish: any) => (
            <div
              key={dish._id}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-56 overflow-hidden bg-slate-100">
                  <img
                    src={dish.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800'}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {dish.category || 'Specialty'}
                  </div>
                  <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 font-extrabold text-sm px-3 py-1 rounded-full shadow-md">
                    {formatPrice(dish.price)}
                  </div>
                </div>

                <div className="p-6 space-y-2">
                  <h3 className="font-serif text-xl font-bold text-slate-900 group-hover:text-amber-700 transition">
                    {dish.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {dish.description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>4.9 Chef Pick</span>
                </div>

                <button
                  onClick={() => handleAddToCart(dish)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Order</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. DINING ATMOSPHERES & AMBIENCE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
            Atmosphere & Zones
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Four Unique Dining Spaces
          </h2>
          <p className="text-xs text-slate-500">
            Pick your desired zone during table booking to customize your evening ambiance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Main Dining Hall',
              zone: 'Indoor',
              desc: 'High ceilings, velvet booths, and live acoustic violin.',
              img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
            },
            {
              title: 'Skyline Rooftop',
              zone: 'Rooftop',
              desc: 'Panoramic skyline vistas under the open Dhaka night sky.',
              img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600',
            },
            {
              title: 'Botanical Garden',
              zone: 'Outdoor',
              desc: 'Fountain side tables surrounded by exotic lush flora.',
              img: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=600',
            },
            {
              title: 'Imperial VIP Lounge',
              zone: 'VIP',
              desc: 'Private soundproof room with dedicated sommelier service.',
              img: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=600',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="h-44 overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-5 pt-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-base text-slate-900">{item.title}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                    {item.zone}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Personalized Hospitality
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight">
              Ready for an Extraordinary Evening?
            </h2>
            <p className="text-sm text-slate-300">
              Join thousands of diners who trust The Royal Grand Bistro for anniversaries, business dinners, and casual weekend feasts.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/book"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-2xl shadow-xl transition hover:scale-105 flex items-center justify-center gap-2"
              >
                <CalendarCheck className="w-5 h-5 stroke-[2.5]" />
                <span>Reserve Your Table Now</span>
              </Link>
              <Link
                href="/order"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-2xl border border-white/20 transition flex items-center justify-center gap-2"
              >
                <Utensils className="w-5 h-5 text-amber-400" />
                <span>Order Food Online</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

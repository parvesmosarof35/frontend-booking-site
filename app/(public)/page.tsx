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

  // Quick reservation form state
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
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Background Overlay & Visual Gradients */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&auto=format&fit=crop&q=80"
            alt="Luxury Dining Room"
            className="w-full h-full object-cover object-center opacity-25 filter brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/75 to-transparent" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#090d16]/50 to-[#090d16]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest backdrop-blur-md shadow-lg">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dhaka&apos;s Signature Fine Dining Experience</span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Artisan Cuisine &{' '}
            <span className="gold-gradient-text block sm:inline">Exquisite Ambience</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Immerse yourself in modern culinary mastery. Reserve your private table with our real-time smart seating system or order gourmet dishes straight to your doorstep.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/book"
              onClick={() => trackEvent('click', 'cta', 'hero_reserve_table')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-base rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 transition duration-200 flex items-center justify-center gap-2.5"
            >
              <CalendarCheck className="w-5 h-5 stroke-[2.5]" />
              <span>Reserve a Table</span>
            </Link>

            <Link
              href="/order"
              onClick={() => trackEvent('click', 'cta', 'hero_order_online')}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-base rounded-2xl border border-slate-700 hover:border-amber-400/50 backdrop-blur-md hover:scale-105 transition duration-200 flex items-center justify-center gap-2.5 shadow-lg"
            >
              <Utensils className="w-5 h-5 text-amber-400" />
              <span>Order Food Online</span>
            </Link>
          </div>

          {/* Quick Stats Bar */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-bold text-amber-400">4.9★</div>
              <div className="text-xs text-slate-400 mt-1">1,200+ Gourmet Reviews</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-bold text-amber-400">4 Zones</div>
              <div className="text-xs text-slate-400 mt-1">Indoor, Garden, Rooftop & VIP</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-bold text-amber-400">5 Mins</div>
              <div className="text-xs text-slate-400 mt-1">Instant Table Lock Hold</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-bold text-amber-400">100%</div>
              <div className="text-xs text-slate-400 mt-1">Organic Halal Certified</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK RESERVATION BAR */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <form
          onSubmit={handleQuickBook}
          className="p-6 sm:p-8 bg-slate-900/90 border border-amber-500/30 rounded-3xl shadow-2xl backdrop-blur-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
        >
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              Select Date
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={bookDate}
              onChange={(e) => setBookDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Shift Picker */}
          <div>
            <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              Dining Shift
            </label>
            <select
              value={bookShift}
              onChange={(e) => setBookShift(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
            >
              {shifts.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.startTime} - {s.endTime})
                </option>
              ))}
            </select>
          </div>

          {/* Guests Count */}
          <div>
            <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              Party Size (Guests)
            </label>
            <select
              value={bookGuests}
              onChange={(e) => setBookGuests(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Guest (Solo)' : `${num} Persons`}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2"
            >
              <span>Find Table</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </section>

      {/* 3. CHEF SPECIALTIES / FEATURED MENU */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-amber-400 font-semibold text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-4 h-4" /> Signature Creations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Chef&apos;s Featured Specialties
            </h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Hand-picked dishes embodying our culinary ethos, prepared with premium aged meats, line-caught seafood, and wild herbs.
            </p>
          </div>
          <Link
            href="/order"
            className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition"
          >
            Explore Full Menu ({featuredItems.length}+ items) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredItems.slice(0, 6).map((item) => (
            <div
              key={item._id}
              className="group bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col"
            >
              <div className="relative h-60 overflow-hidden bg-slate-950">
                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800'}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-amber-400 border border-amber-500/30">
                  {item.category}
                </div>
                <div className="absolute bottom-4 right-4 bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-xl text-sm font-bold text-white border border-slate-700">
                  {formatPrice(item.price)}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold text-white group-hover:text-amber-400 transition">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                    <span>4.9 Chef Special</span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-xs font-bold rounded-xl border border-amber-500/30 transition duration-200"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add to Order</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. DINING ZONES ATMOSPHERE */}
      <section className="bg-slate-950/80 border-y border-slate-800/80 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-amber-400 font-semibold text-xs uppercase tracking-widest">
              Unrivalled Spaces
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Choose Your Dining Ambience
            </h2>
            <p className="text-slate-400 text-sm">
              Our venue spans four curated environments tailored to every celebration, meeting, and quiet evening.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative rounded-3xl overflow-hidden h-96 border border-slate-800 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
                alt="Indoor Fine Dining"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Indoor Hall</span>
                <h3 className="text-lg font-bold text-white">Grand Dining Hall</h3>
                <p className="text-xs text-slate-300">Intimate candlelit booths, plush velvet seating, and live acoustic music.</p>
              </div>
            </div>

            <div className="group relative rounded-3xl overflow-hidden h-96 border border-slate-800 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800"
                alt="Garden Patio"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Outdoor Garden</span>
                <h3 className="text-lg font-bold text-white">Lush Botanical Patio</h3>
                <p className="text-xs text-slate-300">Open-air garden terrace beneath fairy lights and cascading greenery.</p>
              </div>
            </div>

            <div className="group relative rounded-3xl overflow-hidden h-96 border border-slate-800 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800"
                alt="Rooftop Vista"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Rooftop Lounge</span>
                <h3 className="text-lg font-bold text-white">Skyline Vista Bar</h3>
                <p className="text-xs text-slate-300">Panoramic Dhaka skyline views with specialty cocktails and sunset breeze.</p>
              </div>
            </div>

            <div className="group relative rounded-3xl overflow-hidden h-96 border border-slate-800 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1544025162-d76694265947?w=800"
                alt="VIP Suite"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Executive VIP</span>
                <h3 className="text-lg font-bold text-white">Royal Private Suite</h3>
                <p className="text-xs text-slate-300">Dedicated butler service, bespoke menus, and discrete private boardroom.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ACTIVE PROMOTIONS SECTION */}
      {offers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-extrabold uppercase">
                <Sparkles className="w-3.5 h-3.5 fill-current" /> Limited Time Promotion
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                {offers[0].title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {offers[0].description}
              </p>
              {offers[0].promoCode && (
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs text-slate-400">Use Promo Code:</span>
                  <span className="px-4 py-1.5 bg-slate-950 border border-amber-400/50 rounded-xl text-amber-400 font-mono font-bold text-base tracking-wider">
                    {offers[0].promoCode}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <Link
                href="/book"
                className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg text-center"
              >
                Book with Discount
              </Link>
              <Link
                href="/offers"
                className="w-full sm:w-auto px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition text-center"
              >
                View All Vouchers
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

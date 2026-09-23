'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Copy, Check, Clock, CalendarCheck, Utensils } from 'lucide-react';
import api from '@/lib/axios';
import { trackEvent } from '@/lib/analytics';
import toast from 'react-hot-toast';

export default function OffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    trackEvent('view', 'page', 'offers_page');
    api.get('/offers?activeOnly=true').then((res) => {
      setOffers(res.data || []);
    }).catch(() => {});
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied promo code "${code}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Exclusive Vouchers & Campaigns</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Current Promotions & Offers
        </h1>
        <p className="text-sm text-slate-600">
          Apply promotional codes during table checkout or food orders for complimentary dishes and instant bill discounts.
        </p>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(offers.length > 0
          ? offers
          : [
              {
                _id: 'off-1',
                title: 'Royal Welcome Feast',
                description: 'Enjoy 20% discount on your first table booking or food order with us.',
                discountType: 'percentage',
                value: 20,
                promoCode: 'ROYAL20',
                imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
              },
              {
                _id: 'off-2',
                title: 'Weekend Chef Tasting Menu',
                description: 'Flat ৳500 off on gourmet dinner sets for parties of 4 or more.',
                discountType: 'flat',
                value: 500,
                promoCode: 'WEEKEND500',
                imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
              },
            ]
        ).map((offer) => (
          <div
            key={offer._id}
            className="group bg-white border border-slate-200/80 hover:border-amber-400 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={offer.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800'}
                  alt={offer.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-4 left-4 bg-amber-500 text-slate-950 font-extrabold text-xs px-3 py-1 rounded-full shadow-xs">
                  {offer.discountType === 'percentage' ? `${offer.value}% OFF` : `৳${offer.value} OFF`}
                </div>
              </div>

              <div className="p-6 space-y-3">
                <h3 className="font-serif text-xl font-bold text-slate-900 group-hover:text-amber-700 transition">
                  {offer.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {offer.description}
                </p>

                {offer.promoCode && (
                  <div className="pt-2 flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-bold">
                        Promo Code
                      </span>
                      <span className="font-mono text-sm font-bold text-amber-700">
                        {offer.promoCode}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(offer.promoCode)}
                      className="p-2 hover:bg-slate-200 rounded-lg text-slate-700 transition flex items-center gap-1 text-xs font-bold"
                    >
                      {copiedCode === offer.promoCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 pt-0 space-y-3">
              <div className="flex gap-2 pt-2">
                <Link
                  href="/book"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs text-center flex items-center justify-center gap-1.5"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Use on Booking</span>
                </Link>
                <Link
                  href="/order"
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1.5"
                >
                  <Utensils className="w-3.5 h-3.5 text-amber-600" />
                  <span>Use on Order</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

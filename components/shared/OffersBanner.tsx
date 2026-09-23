'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import api from '@/lib/axios';

export default function OffersBanner() {
  const [activeOffer, setActiveOffer] = useState<any>(null);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const { data } = await api.get('/offers?activeOnly=true');
        if (data && data.length > 0) {
          setActiveOffer(data[0]);
        }
      } catch (e) {
        // quiet fallback
      }
    };
    fetchOffer();
  }, []);

  if (!activeOffer) {
    return (
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 font-medium py-1.5 px-4 text-xs text-center flex items-center justify-center gap-2 shadow-inner">
        <Sparkles className="w-3.5 h-3.5 fill-current" />
        <span>Grand Dine Experience: Use promo code <strong>ROYAL20</strong> for 20% off table bookings!</span>
        <Link href="/book" className="underline font-bold hover:text-white transition flex items-center gap-1">
          Reserve Now <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 font-medium py-1.5 px-4 text-xs text-center flex items-center justify-center gap-2 shadow-inner">
      <Sparkles className="w-3.5 h-3.5 fill-current" />
      <span>{activeOffer.title} {activeOffer.promoCode ? `— Use code ${activeOffer.promoCode}` : ''}</span>
      <Link href="/offers" className="underline font-bold hover:text-white transition flex items-center gap-1">
        View Offer <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

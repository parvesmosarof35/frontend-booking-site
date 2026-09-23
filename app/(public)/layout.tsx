import React from 'react';
import Navbar from '@/components/shared/Navbar';
import OffersBanner from '@/components/shared/OffersBanner';
import Footer from '@/components/shared/Footer';
import MobileBottomNav from '@/components/shared/MobileBottomNav';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] text-slate-900">
      <OffersBanner />
      <Navbar />
      <main className="flex-1 pb-16 sm:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

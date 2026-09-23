import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from '@/components/shared/Providers';
import CartDrawer from '@/components/shared/CartDrawer';

export const metadata: Metadata = {
  title: 'The Royal Grand Bistro & Fine Dining | Luxury Table Reservations & Online Ordering',
  description:
    'Reserve premium restaurant tables with interactive 2D floor plan allocation, browse our artisan chef menu, and order online in Dhaka.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Royal Bistro',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#090d16',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-amber-500 selection:text-black">
        <Providers>
          {children}
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}

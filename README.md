# Restaurant Table Reservation & Ordering Platform — Frontend

A production-ready Next.js 15 (App Router) web application featuring customer table reservations, online food ordering, interactive 2D floor plan drag-and-drop layout builder, WYSIWYG CMS, and admin dashboard.

## Tech Stack
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Floor Plan Canvas**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **CMS WYSIWYG**: `jodit-react`
- **State Management**: `@reduxjs/toolkit`, `react-redux`, `redux-persist`
- **API & Realtime**: `axios`, `socket.io-client`
- **Charts & Notifications**: `recharts`, `react-hot-toast`, `sweetalert2`
- **Icons**: `lucide-react`

## Features
- **Public Site**:
  - Luxury fine dining homepage with hero callout, chef specialties, atmosphere zones, and customer reviews.
  - Interactive Table Reservation Wizard (`/book`) with real-time smallest-fitting table auto-assignment, 5-minute temporary hold countdown timer, and WhatsApp confirmation.
  - Online Food Ordering (`/order`) with dynamic checkout governed by `PaymentSettings` (COD-only simplified checkout vs manual bKash/Nagad/Rocket/Bank transaction reference input).
  - Vouchers & Promotions (`/offers`) with copy-to-clipboard code integration.
  - Rich CMS pages for About Us, Privacy Policy, Terms & Conditions, and searchable FAQs.
- **Admin Control Panel (`/admin`)**:
  - Executive Analytics with Recharts (Top 10 Most Viewed/Clicked items, 30-day views/clicks trend, revenue KPIs).
  - 2D Canvas Drag-and-Drop Floor Plan Builder (`/admin/floor-plan`) with free positioning, round/square/rect shapes, zones (Indoor, Outdoor, Rooftop, VIP), and real-time coordinate persistence.
  - Shift & Slot Scheduler (`/admin/shifts-slots`) with custom interval generation (30/60 min).
  - Live Booking Board (`/admin/bookings`) with real-time Socket.io updates.
  - Menu Items Manager with Cloudinary image upload.
  - Offers & Promotions Manager.
  - Order Lifecycle Board with payment verification.
  - Payment Settings with master COD-only switch and mobile banking numbers.
  - Content Editor with Jodit WYSIWYG for CMS pages.
  - Reorderable FAQs with drag-and-drop sortable lists.
  - Restaurant Profile & Staff Accounts Manager.

## Setup & Running Locally
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

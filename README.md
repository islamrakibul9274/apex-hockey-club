# Apex Hockey Club 🏒 (Next.js 14 Full-Stack)

A modern full-stack Ice Hockey Club, Training Academy, and Sports Equipment platform built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **DaisyUI**, **MongoDB**, **Stripe Checkout**, and **Groq AI Assistant**.

## 🚀 Key Features

- **Full-Stack Next.js 14 App Router**: Server and Client Components with TypeScript
- **Clean White UI Design**: Tailwind CSS + DaisyUI with smooth animations and red `#FF4240` accents
- **MongoDB Database**: Models for Products, Programs, Bookings, Inquiries, Blog Posts, and Users with dynamic querying
- **Member Authentication & Portal**: User account registration, login, 1-Click Demo VIP Athlete access, and match ticket history
- **Interactive Ticket Booking (`/get-ticket`)**: Match fixture selection, tiered seating, seat counter, and instant barcode pass generation
- **Equipment Shop & Bag (`/products` & `/cart`)**: Live search, category filtering, product quick-view modal, coupon codes, and Stripe checkout
- **AI Hockey Coach (Coach Wayne)**: Groq AI SDK real-time tactical and gear coaching widget
- **Membership Pricing (`/pricing`)**: Monthly/Annual tiered subscriptions with direct Stripe checkout

## 🛠️ Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/islamrakibul9274/apex-hockey-club.git
cd apex-hockey-club
npm install
```

### 2. Environment Configuration
Create a `.env.local` file based on `.env.example`:
```bash
cp .env.example .env.local
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

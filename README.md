# Apex Hockey Club 🏒 (Next.js 14 Full-Stack)

[![Live Production](https://img.shields.io/badge/Live_Site-apex--hockey--club.netlify.app-FF4240?style=for-the-badge&logo=netlify&logoColor=white)](https://apex-hockey-club.netlify.app)
[![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![DaisyUI](https://img.shields.io/badge/DaisyUI_4-5AD8E6?style=for-the-badge&logo=daisyui&logoColor=black)](https://daisyui.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![Groq AI](https://img.shields.io/badge/Groq_AI-F55036?style=for-the-badge&logo=openai&logoColor=white)](https://groq.com/)

A full-stack Ice Hockey Club, Training Academy, and Sports Equipment platform built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **DaisyUI**, **MongoDB**, **Stripe Checkout**, and **Groq AI Assistant**.

---

## 🌐 Live Links

- **🚀 Live Production Website**: [https://apex-hockey-club.netlify.app](https://apex-hockey-club.netlify.app)
- **📦 GitHub Repository**: [https://github.com/islamrakibul9274/apex-hockey-club](https://github.com/islamrakibul9274/apex-hockey-club)
- **🛠️ Netlify Project Dashboard**: [https://app.netlify.com/projects/apex-hockey-club](https://app.netlify.com/projects/apex-hockey-club)

---

## 🌟 Key Features

- **⚡ Full-Stack Next.js 14 App Router**: Server & Client Components with TypeScript and SSR/SSG.
- **🎨 Modern White UI Design**: Clean white aesthetics (`#ffffff`), subtle borders, soft shadows, glassmorphism, and `#FF4240` red branding.
- **🏒 Dynamic Hero Carousel**: Auto-playing multi-slide banner with timer, pause on hover, interactive slide selectors, and dynamic CTAs.
- **🎟️ Match Ticket Reservation (`/get-ticket`)**: Fixture selector, tiered seating (General, Club, VIP Glass), seat counter, and mobile barcode passes.
- **🛒 Equipment Shop & Slide-Over Bag (`/products` & `/cart`)**: Keyword search, category filters, sorting, quick view modal, promo discount codes (`APEX2026`), and Stripe checkout.
- **💳 Membership Pricing (`/pricing`)**: Monthly/Annual billing toggle (20% savings) with direct Stripe Checkout integration.
- **👤 Member Portal & 1-Click Demo Login (`/account`)**: Profile management, active match passes with barcode scan simulator, and settings. Instant VIP testing with `demo@apex-hockey.com`.
- **🤖 Groq AI Hockey Coach (Coach Wayne)**: Real-time AI hockey coach widget in bottom-right powered by `qwen/qwen3.6-27b` answering tactical, drill, and gear questions.
- **📬 Contact & Resend Email (`/contact`)**: Inquiries saved directly to MongoDB and notifications dispatched via Resend.
- **📖 Training Blog (`/blog` & `/blog/[slug]`)**: In-depth training drills, skate sharpening science, and game-day nutrition articles.
- **🔗 100% Working Routing**: Every single navigation link, footer service, legal document, and app download page is fully operational.

---

## 📁 Directory Structure

```
apex-hockey-club/
├── public/
│   └── images/              # Static & dynamic image assets
├── src/
│   ├── app/
│   │   ├── about/           # About Us, Coaching Staff, Arena Specs
│   │   ├── account/         # User Portal, Tickets & Settings
│   │   ├── api/             # Full-Stack API Route Handlers
│   │   │   ├── ai-coach/    # Groq AI Assistant Chat API
│   │   │   ├── auth/        # Login, Register, Logout, Me, Profile
│   │   │   ├── bookings/    # Ticket & Camp Reservations
│   │   │   ├── carousel/    # Dynamic Hero Slides
│   │   │   ├── checkout/    # Stripe Checkout Session
│   │   │   ├── contact/     # Inquiries + Resend Email Dispatch
│   │   │   ├── products/    # Store Gear Query & Search
│   │   │   ├── programs/    # Camp Pathways
│   │   │   └── seed/        # Database Auto-Seeder
│   │   ├── auth/            # Sign In & Sign Up Pages
│   │   ├── blog/            # Training Guides & Articles
│   │   ├── cart/            # Equipment Bag & Order Summary
│   │   ├── contact/         # Concierge & Contact Form
│   │   ├── get-ticket/      # Arena Match Ticket Booking
│   │   ├── legal/           # Terms, Privacy, Cookies, Waiver
│   │   ├── pricing/         # Tiered Membership Plans
│   │   ├── products/        # Store Equipment Catalog
│   │   ├── programs/        # Youth & Pro Training Academy
│   │   ├── services/        # Club Services (Branding, Coaching, etc.)
│   │   ├── globals.css      # Global Styles & Typography
│   │   ├── layout.tsx       # Root Layout & Context Providers
│   │   └── page.tsx         # Modern Landing Page
│   ├── components/          # Reusable UI & Widget Components
│   ├── context/             # AuthContext & CartContext Providers
│   ├── lib/                 # Database, Auth & Mock Data Helpers
│   └── models/              # Mongoose Database Schemas
├── netlify.toml             # Netlify Next.js Runtime Configuration
├── tailwind.config.ts       # Tailwind CSS & DaisyUI Theme Config
├── tsconfig.json            # TypeScript Configuration
└── package.json             # Project Dependencies & Scripts
```

---

## 🛠️ Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/islamrakibul9274/apex-hockey-club.git
cd apex-hockey-club
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.obdwazm.mongodb.net/hockey_elite_db?appName=Cluster0"
AUTH_SECRET="your-secret-key"
AUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
GROQ_API_KEY="gsk_..."
RESEND_API_KEY="re_..."
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dqaurp8tl"
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
PUSHER_APP_ID="2149980"
NEXT_PUBLIC_PUSHER_KEY="3d2ada18a4e8a0ef2f4e"
PUSHER_SECRET=""
NEXT_PUBLIC_PUSHER_CLUSTER="mt1"
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).

# Hockey With DaisyUI (Next.js Edition)

A modernized version of the Hockey Club and Sports Equipment landing page, rebuilt with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **DaisyUI**.

## 🚀 Features

- **Next.js 14+ App Router** with React Server Components and TypeScript
- **Tailwind CSS & DaisyUI** for customizable UI components
- **Optimized Assets** using `next/image` and Google Fonts (`Manrope` and `Poppins`)
- **React Icons** for clean vector icons
- **Fully Responsive** for mobile, tablet, and desktop viewports

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 3. Build for Production
```bash
npm run build
npm run start
```

## 📁 Project Structure

```
├── public/
│   └── images/              # Static image assets
├── src/
│   ├── app/
│   │   ├── globals.css      # Tailwind & typography styles
│   │   ├── layout.tsx       # Root layout & font configuration
│   │   └── page.tsx         # Main landing page
│   └── components/
│       ├── Navbar.tsx
│       ├── HeroBanner.tsx
│       ├── ProgressStats.tsx
│       ├── ProgramSection.tsx
│       ├── ProductsSection.tsx
│       ├── FaqSection.tsx
│       ├── ContactSection.tsx
│       ├── SocialSection.tsx
│       └── Footer.tsx
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

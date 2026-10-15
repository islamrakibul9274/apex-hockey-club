import type { Config } from "tailwindcss";

/**
 * Palette values are read from CSS custom properties (defined in globals.css)
 * as space-separated RGB channels. Using the `rgb(var(--token) / <alpha-value>)`
 * form keeps a single source of truth while still letting Tailwind opacity
 * modifiers work — `bg-brand-500/20`, `shadow-brand-500/20`.
 */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand red. brand-300 is the legacy #FF4240: decorative only, because
        // it measures 3.44:1 on white and fails AA for text and for a button
        // fill carrying white text. Interactive use is brand-500 (4.98:1).
        brand: {
          50: token("brand-50"),
          100: token("brand-100"),
          200: token("brand-200"),
          300: token("brand-300"),
          400: token("brand-400"),
          500: token("brand-500"),
          600: token("brand-600"),
          700: token("brand-700"),
        },
        // Text and neutral surfaces.
        ink: {
          400: token("ink-400"),
          500: token("ink-500"),
          600: token("ink-600"),
          700: token("ink-700"),
          800: token("ink-800"),
          900: token("ink-900"),
        },
        line: {
          200: token("line-200"),
          300: token("line-300"),
        },
        surface: {
          0: token("surface-0"),
          50: token("surface-50"),
          100: token("surface-100"),
        },
        // Soft pastel accents used on contact cards.
        accent: {
          lime: token("accent-lime"),
          sand: token("accent-sand"),
          sky: token("accent-sky"),
        },
        // Status. Chosen so each is AA-legible on its own pale surface.
        success: { 50: token("success-50"), 700: token("success-700") },
        danger: { 50: token("danger-50"), 600: token("danger-600") },
        warning: { 50: token("warning-50"), 700: token("warning-700") },
        info: { 50: token("info-50"), 700: token("info-700") },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-md)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      spacing: {
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        8: "var(--space-8)",
        10: "var(--space-10)",
        12: "var(--space-12)",
        16: "var(--space-16)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "fade-in": "fade-in var(--duration-base) var(--ease-out)",
        "scale-in": "scale-in var(--duration-base) var(--ease-out)",
        "slide-in-right": "slide-in-right var(--duration-base) var(--ease-out)",
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  // daisyUI removed. It contributed ~90KB of CSS for a handful of styles and
  // its class names (btn, card, input, label, badge, menu, hero, modal)
  // collided with plain Tailwind utilities. The equivalent components now live
  // in src/app/globals.css under the `apex-` prefix.
  plugins: [],
};

export default config;